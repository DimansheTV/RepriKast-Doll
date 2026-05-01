import { access } from "node:fs/promises";
import { extname, join } from "node:path";
import * as cheerio from "cheerio";
import { absUrl, cleanText, loadJson, validateCatalog, WikiClient, writeJson } from "./common.mjs";

const ROOT_SECTION_URL = "https://r2online.ru/wiki/base/section/15/";
const OUT_JSON = "src/resources/data/equipment-items.json";
const IMG_DIR = "src/resources/images/equipment";

const LIST_TITLE_TO_SLOT_CODE = new Map([
  ["Доспехи", "armor"],
  ["Шлемы", "helmet"],
  ["Сапоги", "boots"],
  ["Перчатки", "gloves"],
  ["Плащи", "cloak"],
  ["Снаряжение", "shield"],
  ["Ремни", "belt"],
  ["Кольца", "ring"],
  ["Ожерелья", "necklace"],
  ["Серьги", "earring"],
  ["Ближний бой", "weapon"],
  ["Дальний бой", "weapon"],
]);

const TEMPORARY_MARKERS = [
  "врем.",
  "временное",
  "временный",
  "temporary",
];

function normalizeName(value) {
  return cleanText(value)
    .toLocaleLowerCase("ru")
    .replace(/ё/g, "е");
}

function itemKey(item) {
  return `${item.slot_code || ""}::${normalizeName(item.name || "")}`;
}

function isTemporaryItem(item) {
  const haystack = [
    item.name,
    item.description,
    ...(Array.isArray(item.description_lines) ? item.description_lines : []),
  ]
    .map((entry) => normalizeName(entry))
    .join(" | ");

  return TEMPORARY_MARKERS.some((marker) => haystack.includes(normalizeName(marker)));
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function parseClasses($, scope) {
  const $scope = scope;
  if ($scope.find(".icon-class.cl-all").length > 0) {
    return ["all"];
  }

  const classes = new Set();
  $scope.find(".icon-class").each((_, element) => {
    const className = ($(element).attr("class") || "").split(/\s+/).find((entry) => entry.startsWith("cl-"));
    if (className && className !== "cl-all") {
      classes.add(className.slice(3));
    }
  });

  return classes.size ? [...classes].sort() : ["all"];
}

function parseWeight(infoTable) {
  const match = infoTable.text().match(/Вес:\s*(\d+)/iu);
  return match ? Number(match[1]) : 0;
}

function extractLinesFromSelection(selection) {
  const html = selection.html() || selection.text() || "";
  const withBreaks = html
    .replace(/<br\s*\/?>/giu, "\n")
    .replace(/<\/p>/giu, "\n")
    .replace(/<\/div>/giu, "\n")
    .replace(/<\/li>/giu, "\n");

  return cheerio
    .load(`<div>${withBreaks}</div>`)("div")
    .text()
    .split(/\r?\n/)
    .map(cleanText)
    .filter(Boolean);
}

function parseDescriptionLines(infoTable) {
  const descriptionCell = infoTable.find("tr").last().find("td[colspan]").first();
  return extractLinesFromSelection(descriptionCell.length > 0 ? descriptionCell : infoTable);
}

function parseUpgradeTable($) {
  const levels = {};

  $("table.detail-item-properties tbody tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 2) {
      return;
    }

    const level = cleanText(cells.eq(0).text());
    const params = extractLinesFromSelection(cells.eq(1));
    if (/^\+\d+$/.test(level) && params.length) {
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
  const infoTable = $("table.info-description").first();
  const h1 = $("h1")
    .toArray()
    .map((node) => cleanText($(node).text()))
    .find((text) => text && text !== "База знаний");
  const icon = $('.layout-item-icon.main-icon-item img[src*="/upload/icons/"], img.base-item-icon').first().attr("src");
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
    upgrade_levels: Object.keys(upgradeLevels).length ? upgradeLevels : { "+0": fallbackBonuses },
  };
}

function extractCatalogEntries(html, baseUrl) {
  const $ = cheerio.load(html);
  const sectionEntries = [];
  const listEntries = [];
  const seen = new Set();

  $('a.catalog-item[href*="/wiki/base/section/"], a.catalog-item[href*="/wiki/base/list/"]').each((_, element) => {
    const link = $(element);
    const href = absUrl(link.attr("href") || "");
    const title = cleanText(link.find("img").attr("title") || link.text());

    if (!href || !title || seen.has(href)) {
      return;
    }
    seen.add(href);

    if (href.includes("/wiki/base/section/")) {
      sectionEntries.push({ title, url: href });
      return;
    }

    listEntries.push({ title, url: href, parentUrl: baseUrl });
  });

  return { sectionEntries, listEntries };
}

async function collectEquipmentLists(client) {
  const queue = [ROOT_SECTION_URL];
  const visitedSections = new Set();
  const collectedLists = new Map();

  while (queue.length) {
    const sectionUrl = queue.shift();
    if (!sectionUrl || visitedSections.has(sectionUrl)) {
      continue;
    }

    visitedSections.add(sectionUrl);
    const html = await client.getText(sectionUrl);
    const { sectionEntries, listEntries } = extractCatalogEntries(html, sectionUrl);

    sectionEntries.forEach((entry) => {
      if (!visitedSections.has(entry.url)) {
        queue.push(entry.url);
      }
    });

    listEntries.forEach((entry) => {
      const slotCode = LIST_TITLE_TO_SLOT_CODE.get(entry.title);
      if (!slotCode) {
        return;
      }
      collectedLists.set(entry.url, { ...entry, slotCode });
    });
  }

  return [...collectedLists.values()];
}

function extractItemRows(html) {
  const $ = cheerio.load(html);
  const seenUrls = new Set();
  const rows = [];

  $("tbody tr").each((_, element) => {
    const row = $(element);
    const link = row.find('a.catalog-item[href*="/wiki/base/view/"]').last();
    const url = absUrl(link.attr("href") || "");
    const name = cleanText(link.text() || row.find("img.base-item-icon").attr("title"));

    if (!url || !name || seenUrls.has(url)) {
      return;
    }

    seenUrls.add(url);
    rows.push({
      url,
      name,
      classes: parseClasses($, row),
    });
  });

  return rows;
}

function indexExistingEquipment(items) {
  const byId = new Map();
  const byKey = new Map();

  items.forEach((item, index) => {
    const legacyIds = new Set([`${item.slot_code}:${item.name}:${index}`, ...(Array.isArray(item.legacy_ids) ? item.legacy_ids : [])]);
    const existing = { ...item, legacy_ids: [...legacyIds] };

    if (item.id != null) {
      byId.set(String(item.id), existing);
    }
    byKey.set(itemKey(item), existing);
  });

  return { byId, byKey };
}

function mergeExistingData(item, existingIndex) {
  const existing = existingIndex.byId.get(String(item.id)) || existingIndex.byKey.get(itemKey(item)) || null;
  if (!existing) {
    return item;
  }

  return {
    ...item,
    legacy_ids: [...new Set(existing.legacy_ids || [])],
    locales: existing.locales || item.locales,
  };
}

export async function build() {
  const client = new WikiClient();
  const existingItems = await loadJson(OUT_JSON).catch(() => []);
  const existingIndex = indexExistingEquipment(existingItems);
  const lists = await collectEquipmentLists(client);
  const nextItems = [];

  for (const listEntry of lists) {
    const listHtml = await client.getText(listEntry.url);
    const itemRows = extractItemRows(listHtml);

    for (const itemRow of itemRows) {
      const itemHtml = await client.getText(itemRow.url);
      const parsed = parseItemPage(itemHtml, itemRow.name);
      const id = itemIdFromUrl(itemRow.url);
      const ext = extname(new URL(parsed.imageUrl).pathname) || ".jpg";
      const imageFile = `${String(id).padStart(3, "0")}-${listEntry.slotCode}${ext}`;
      const imagePath = join(IMG_DIR, imageFile);

      if (parsed.imageUrl && !(await exists(imagePath))) {
        await client.downloadFile(parsed.imageUrl, imagePath);
      }

      const candidate = mergeExistingData({
        id,
        name: parsed.name,
        category: listEntry.title,
        slot_code: listEntry.slotCode,
        wiki_url: itemRow.url,
        image: `img/equipment/${imageFile}`,
        source_image_url: parsed.imageUrl,
        weight: parsed.weight,
        classes: itemRow.classes?.length ? itemRow.classes : parsed.classes,
        description: parsed.description,
        description_lines: parsed.description_lines,
        upgrade_levels: parsed.upgrade_levels,
      }, existingIndex);

      if (!isTemporaryItem(candidate)) {
        nextItems.push(candidate);
      }
    }
  }

  nextItems.sort((left, right) => `${left.slot_code} ${left.name}`.localeCompare(`${right.slot_code} ${right.name}`, "ru"));
  const normalized = validateCatalog("equipment", nextItems);
  await writeJson(OUT_JSON, normalized);
  console.log(`Wrote ${normalized.length} equipment items to ${OUT_JSON}`);
}
