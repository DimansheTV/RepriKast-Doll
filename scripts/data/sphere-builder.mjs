import { access } from "node:fs/promises";
import { extname, join } from "node:path";
import * as cheerio from "cheerio";
import { absUrl, cleanText, validateCatalog, WikiClient, writeJson } from "./common.mjs";

const SECTION_URL = "https://r2online.ru/wiki/base/section/14/";
const OUT_JSON = "src/resources/data/sphere-items.json";
const IMG_DIR = "src/resources/images/sphere";

const CATEGORY_SLOT_MAP = new Map([
  ["Сферы души", "soul"],
  ["Сферы жизни", "life"],
  ["Сферы разрушения", "destruction"],
  ["Сферы защиты", "protection"],
  ["Сферы мастерства", "mastery"],
  ["Особые сферы", "special"],
  ["Сферы перевоплощения", "morph"],
]);

const MORPH_LEVELS = [
  [1, 400, 200, 34, 1000],
  [50, 500, 250, 36, 1500],
  [60, 600, 300, 38, 2000],
  [65, 700, 350, 40, 2500],
  [70, 800, 400, 42, 3000],
  [75, 900, 450, 44, 3500],
  [80, 1000, 500, 46, 4000],
  [85, 1100, 550, 48, 4500],
  [90, 1200, 600, 50, 5000],
  [95, 1300, 650, 52, 5500],
  [100, 1400, 700, 54, 6000],
  [105, 1500, 750, 56, 6500],
  [110, 1600, 800, 58, 7000],
];

const MANUAL_SPHERES = MORPH_LEVELS.map(([level, hp, mp, attackSpeed, weight]) => ({
  id: `morph_${level}`,
  name: `Сфера перевоплощения ${level}+ уровня`,
  category: "Сферы перевоплощения",
  slot_code: "morph",
  wiki_url: "",
  image: "img/sphere/sphere_morph_1.png",
  source_image_url: "",
  weight: 0,
  classes: ["all"],
  description: "Сфера перевоплощения с фиксированными параметрами.",
  description_lines: [
    `HP +${hp}`,
    `MP +${mp}`,
    `Скорость атаки +${attackSpeed}%`,
    "Скорость бега +50",
    `Вес +${weight}`,
  ],
  upgrade_levels: {
    "+0": [
      `HP +${hp}`,
      `MP +${mp}`,
      `Скорость атаки +${attackSpeed}%`,
      "Скорость бега +50",
      `Вес +${weight}`,
    ],
  },
}));

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function extractCategories(html) {
  const $ = cheerio.load(html);
  const categories = [];

  $('a.catalog-item[href*="/wiki/base/list/"]').each((_, element) => {
    const link = $(element);
    const title = cleanText(link.find("img").attr("title") || link.text());
    const slotCode = CATEGORY_SLOT_MAP.get(title);
    if (!slotCode || slotCode === "morph" || title.toLowerCase().includes("перевоплощ")) {
      return;
    }

    categories.push({
      title,
      slotCode,
      url: absUrl(link.attr("href")),
      imageUrl: absUrl(link.find("img").attr("src") || ""),
    });
  });

  return categories;
}

function extractItemLinks(html) {
  const $ = cheerio.load(html);
  const links = [];

  $('a.catalog-item[href*="/wiki/base/view/"]').each((_, element) => {
    const link = $(element);
    const href = absUrl(link.attr("href"));
    if (!href) {
      return;
    }

    links.push({
      url: href,
      name: cleanText(link.find("img").attr("title") || link.text()),
    });
  });

  return links;
}

function parseClasses($, infoTable) {
  if (infoTable.find(".icon-class.cl-all").length > 0) {
    return ["all"];
  }

  const classes = new Set();
  infoTable.find(".icon-class").each((_, element) => {
    const className = ($(element).attr("class") || "").split(/\s+/).find((entry) => entry.startsWith("cl-"));
    if (className && className !== "cl-all") {
      classes.add(className.slice(3));
    }
  });

  return classes.size > 0 ? [...classes].sort() : ["all"];
}

function parseWeight(infoTable) {
  const match = infoTable.text().match(/Вес:\s*(\d+)/i);
  return match ? Number(match[1]) : 0;
}

function parseDescriptionLines(infoTable) {
  const descriptionCell = infoTable.find("tr").last().find("td[colspan]").first();
  const text = descriptionCell.length > 0 ? descriptionCell.text() : infoTable.text();
  return text.split(/\r?\n/).map(cleanText).filter(Boolean);
}

function parseUpgradeTable($) {
  const levels = {};

  $("table.detail-item-properties tbody tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 2) {
      return;
    }

    const level = cleanText(cells.eq(0).text());
    const params = cells.eq(1).text().split(/\r?\n/).map(cleanText).filter(Boolean);
    if (/^\+\d+$/.test(level) && params.length > 0) {
      levels[level] = params;
    }
  });

  return levels;
}

function itemIdFromUrl(url) {
  const match = url.match(/\/view\/(\d+)\/?$/);
  if (!match) {
    throw new Error(`Cannot extract item id from ${url}`);
  }
  return Number(match[1]);
}

function parseItemPage(html, fallbackName) {
  const $ = cheerio.load(html);
  const h1 = $("h1")
    .toArray()
    .map((node) => cleanText($(node).text()))
    .find((text) => text && text !== "База знаний");

  const icon = $('.layout-item-icon.main-icon-item img[src*="/upload/icons/"], img.base-item-icon').first().attr("src");
  const infoTable = $("table.info-description").first();
  const descriptionLines = parseDescriptionLines(infoTable);
  const upgradeLevels = parseUpgradeTable($);
  const fallbackBonuses = descriptionLines.length > 1 ? descriptionLines.slice(1) : descriptionLines;

  return {
    name: h1 || fallbackName,
    imageUrl: absUrl(icon || ""),
    weight: parseWeight(infoTable),
    classes: parseClasses($, infoTable),
    description: descriptionLines[0] || "",
    description_lines: descriptionLines,
    upgrade_levels: Object.keys(upgradeLevels).length > 0 ? upgradeLevels : { "+0": fallbackBonuses },
  };
}

export async function build() {
  const client = new WikiClient();
  const sectionHtml = await client.getText(SECTION_URL);
  const categories = extractCategories(sectionHtml);
  const items = [];

  for (const category of categories) {
    const listHtml = await client.getText(category.url);
    const itemLinks = extractItemLinks(listHtml);

    for (const itemLink of itemLinks) {
      const itemHtml = await client.getText(itemLink.url);
      const parsed = parseItemPage(itemHtml, itemLink.name);
      const id = itemIdFromUrl(itemLink.url);
      const ext = extname(new URL(parsed.imageUrl).pathname) || ".jpg";
      const imageFile = `sphere_${id}${ext}`;
      const imagePath = join(IMG_DIR, imageFile);

      if (parsed.imageUrl && !(await exists(imagePath))) {
        await client.downloadFile(parsed.imageUrl, imagePath);
      }

      items.push({
        id,
        name: parsed.name,
        category: category.title,
        slot_code: category.slotCode,
        wiki_url: itemLink.url,
        image: `img/sphere/${imageFile}`,
        source_image_url: parsed.imageUrl,
        weight: parsed.weight,
        classes: parsed.classes,
        description: parsed.description,
        description_lines: parsed.description_lines,
        upgrade_levels: parsed.upgrade_levels,
      });
    }
  }

  const seen = new Set(items.map((item) => String(item.id)));
  for (const manual of MANUAL_SPHERES) {
    if (!seen.has(String(manual.id))) {
      items.push(manual);
    }
  }

  items.sort((left, right) => `${left.category} ${left.name}`.localeCompare(`${right.category} ${right.name}`, "ru"));
  const normalized = validateCatalog("sphere", items);
  await writeJson(OUT_JSON, normalized);
  console.log(`Wrote ${normalized.length} spheres to ${OUT_JSON}`);
}
