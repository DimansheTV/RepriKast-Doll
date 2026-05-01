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

const DEFENSE_EQUIPMENT_SLOT_CODES = new Set([
  "earring",
  "helmet",
  "cloak",
  "necklace",
  "armor",
  "shield",
  "weapon",
  "belt",
  "gloves",
  "ring",
  "boots",
]);

const NON_MERGEABLE_DESCRIPTION_STAT_MARKERS = [
  ":",
];

const SCALING_ALL_STATS_EARRING_NAMES = new Set([
  "серьги авантюриста",
  "серьги атланта",
  "серьги шпиона",
]);

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

function parseUpgradeNumber(level) {
  const match = String(level || "").match(/^\+(\d+)$/);
  return match ? Number(match[1]) : null;
}

function sortUpgradeLevels(levels) {
  return Object.fromEntries(
    Object.entries(levels || {})
      .sort(([left], [right]) => (parseUpgradeNumber(left) ?? 0) - (parseUpgradeNumber(right) ?? 0)),
  );
}

function parseNumericStatLine(line) {
  const normalized = cleanText(line);
  const match = normalized.match(/^(.*?)\s*([+-])\s*(\d+(?:[.,]\d+)?)\s*(%)?$/u);
  if (!match) {
    return null;
  }

  const label = cleanText(match[1]);
  if (!label) {
    return null;
  }

  return {
    label,
    unit: match[4] || "",
    line: normalized,
  };
}

function getStatIdentity(stat) {
  return stat ? `${stat.label.toLocaleLowerCase("ru")}::${stat.unit || ""}` : "";
}

function isMergeableDescriptionStatLine(line) {
  const normalized = cleanText(line);
  if (!normalized) {
    return false;
  }

  if (NON_MERGEABLE_DESCRIPTION_STAT_MARKERS.some((marker) => normalized.includes(marker))) {
    return false;
  }

  return Boolean(parseNumericStatLine(normalized));
}

function mergeDescriptionStatsIntoLines(lines, descriptionLines) {
  const sourceLines = Array.isArray(lines) ? lines.map(cleanText).filter(Boolean) : [];
  const currentStats = new Set(
    sourceLines
      .map((line) => parseNumericStatLine(line))
      .filter(Boolean)
      .map((stat) => getStatIdentity(stat)),
  );
  const mergedLines = [...sourceLines];

  (Array.isArray(descriptionLines) ? descriptionLines : []).forEach((line) => {
    const normalized = cleanText(line);
    if (!isMergeableDescriptionStatLine(normalized) || mergedLines.includes(normalized)) {
      return;
    }

    const stat = parseNumericStatLine(normalized);
    const identity = getStatIdentity(stat);
    if (currentStats.has(identity)) {
      return;
    }

    currentStats.add(identity);
    mergedLines.push(normalized);
  });

  return mergedLines;
}

function mergeDescriptionStatsIntoUpgradeLevels(upgradeLevels, descriptionLines) {
  if (!upgradeLevels || typeof upgradeLevels !== "object" || Array.isArray(upgradeLevels)) {
    return upgradeLevels;
  }

  return sortUpgradeLevels(
    Object.fromEntries(
      Object.entries(upgradeLevels).map(([level, lines]) => [
        level,
        mergeDescriptionStatsIntoLines(lines, descriptionLines),
      ]),
    ),
  );
}

function parseBaseDefenseValue(line) {
  const normalized = cleanText(line);
  const baseDefenseMatch = normalized.match(/^(?:Базовый уровень защиты|Base defense level)\s*:?\s*([+-]?\d+(?:[.,]\d+)?)$/iu);
  if (baseDefenseMatch) {
    const value = Number(baseDefenseMatch[1].replace(",", "."));
    return Number.isFinite(value) ? value : null;
  }

  const defenseStatMatch = normalized.match(/^(?:Защита|Defense)\s*\+\s*(\d+(?:[.,]\d+)?)$/iu);
  if (defenseStatMatch) {
    const value = Number(defenseStatMatch[1].replace(",", "."));
    return Number.isFinite(value) ? value : null;
  }

  return null;
}

function getBaseDefenseForItem(item) {
  const lines = [
    item.description,
    ...(Array.isArray(item.description_lines) ? item.description_lines : []),
    ...(Array.isArray(item.descriptionLines) ? item.descriptionLines : []),
    ...(Array.isArray(item.upgrade_levels?.["+0"]) ? item.upgrade_levels["+0"] : []),
    ...(Array.isArray(item.upgradeLevels?.["+0"]) ? item.upgradeLevels["+0"] : []),
    item.locales?.ru?.description,
    ...(Array.isArray(item.locales?.ru?.descriptionLines) ? item.locales.ru.descriptionLines : []),
    ...(Array.isArray(item.locales?.ru?.upgradeLevels?.["+0"]) ? item.locales.ru.upgradeLevels["+0"] : []),
    item.locales?.en?.description,
    ...(Array.isArray(item.locales?.en?.descriptionLines) ? item.locales.en.descriptionLines : []),
    ...(Array.isArray(item.locales?.en?.upgradeLevels?.["+0"]) ? item.locales.en.upgradeLevels["+0"] : []),
  ];

  for (const line of lines) {
    const value = parseBaseDefenseValue(line);
    if (Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function getDefenseSingleStepCap(item) {
  const name = item?.name || "";
  const normalized = normalizeName(name);
  const slot = item?.slot_code || "";

  if (!normalized.includes("магическ") && /(большой щит|мифриловый браслет хранителя)/iu.test(name)) {
    return 7;
  }

  if (!normalized.includes("магическ") && /(велкен|мифрил)/iu.test(name) && ["helmet", "cloak", "armor", "gloves", "boots"].includes(slot)) {
    return 7;
  }

  if (/(щит стража|костяной щит|магический браслет хранителя)/iu.test(name)) {
    return 6;
  }

  if (normalized.includes("магическ") && /(велкен|мифрил)/iu.test(name)) {
    return 6;
  }

  if (/Ифрит[а]?/u.test(name)) {
    return 5;
  }

  if (/Бафомет[а]?/u.test(name)) {
    return 6;
  }

  return DEFENSE_EQUIPMENT_SLOT_CODES.has(slot) ? 8 : null;
}

function formatStatNumber(value) {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100).replace(".", ",");
}

function formatDefenseLine(baseDefense, upgradeNumber, singleStepCap, language = "ru") {
  const bonus = upgradeNumber <= singleStepCap
    ? upgradeNumber
    : singleStepCap + (upgradeNumber - singleStepCap) * 2;
  const label = language === "en" ? "Defense" : "Защита";
  return `${label} +${formatStatNumber(baseDefense + bonus)}`;
}

function isDefenseLine(line) {
  return /^(?:Защита|Defense)\s*\+\s*\d+(?:[.,]\d+)?$/iu.test(cleanText(line));
}

function isAllStatsLine(line) {
  return /^(?:Все параметры|All stats)\s*[+-]\s*\d+(?:[.,]\d+)?$/iu.test(cleanText(line));
}

function formatAllStatsLine(value, language = "ru") {
  const label = language === "en" ? "All stats" : "Все параметры";
  return `${label} +${formatStatNumber(value)}`;
}

function isScalingAllStatsEarring(item) {
  return item?.slot_code === "earring" && SCALING_ALL_STATS_EARRING_NAMES.has(normalizeName(item?.name || ""));
}

function getScalingAllStatsValue(level) {
  return 7 + Math.max(0, parseUpgradeNumber(level) ?? 0) * 2;
}

function upsertLeadingAllStatsLine(lines, level, language) {
  const allStatsLine = formatAllStatsLine(getScalingAllStatsValue(level), language);
  const sourceLines = Array.isArray(lines) ? lines.map(cleanText).filter(Boolean) : [];
  return [
    allStatsLine,
    ...sourceLines.filter((line) => !isAllStatsLine(line)),
  ];
}

function syncScalingAllStatsEarringLevels(item) {
  if (!isScalingAllStatsEarring(item)) {
    return item;
  }

  item.description = formatAllStatsLine(7, "ru");
  item.description_lines = upsertLeadingAllStatsLine(item.description_lines, "+0", "ru");
  item.upgrade_levels = sortUpgradeLevels(
    Object.fromEntries(
      Object.entries(item.upgrade_levels || {}).map(([level, lines]) => [
        level,
        upsertLeadingAllStatsLine(lines, level, "ru"),
      ]),
    ),
  );

  if (item.locales?.ru) {
    item.locales.ru.description = formatAllStatsLine(7, "ru");
    item.locales.ru.descriptionLines = upsertLeadingAllStatsLine(item.locales.ru.descriptionLines, "+0", "ru");
    item.locales.ru.upgradeLevels = sortUpgradeLevels(
      Object.fromEntries(
        Object.entries(item.locales.ru.upgradeLevels || {}).map(([level, lines]) => [
          level,
          upsertLeadingAllStatsLine(lines, level, "ru"),
        ]),
      ),
    );
  }

  if (item.locales?.en) {
    item.locales.en.description = formatAllStatsLine(7, "en");
    item.locales.en.descriptionLines = upsertLeadingAllStatsLine(item.locales.en.descriptionLines, "+0", "en");
    item.locales.en.upgradeLevels = sortUpgradeLevels(
      Object.fromEntries(
        Object.entries(item.locales.en.upgradeLevels || {}).map(([level, lines]) => [
          level,
          upsertLeadingAllStatsLine(lines, level, "en"),
        ]),
      ),
    );
  }

  return item;
}

function upsertDefenseLine(lines, baseDefense, upgradeNumber, singleStepCap, language) {
  const defenseLine = formatDefenseLine(baseDefense, upgradeNumber, singleStepCap, language);
  const sourceLines = Array.isArray(lines) ? lines.map(cleanText).filter(Boolean) : [];
  const withoutDefense = sourceLines.filter((line) => !isDefenseLine(line));
  return [defenseLine, ...withoutDefense];
}

function upsertDefenseLinesIntoUpgradeLevels(upgradeLevels, baseDefense, singleStepCap, language) {
  if (!upgradeLevels || typeof upgradeLevels !== "object" || Array.isArray(upgradeLevels)) {
    return upgradeLevels;
  }

  return sortUpgradeLevels(
    Object.fromEntries(
      Object.entries(upgradeLevels).map(([level, lines]) => {
        const upgradeNumber = parseUpgradeNumber(level) ?? 0;
        return [level, upsertDefenseLine(lines, baseDefense, upgradeNumber, singleStepCap, language)];
      }),
    ),
  );
}

function addMissingDefenseLevelsToLocale(locale, baseDefense, firstUpgradeNumber, singleStepCap, language) {
  if (!locale || typeof locale !== "object" || Array.isArray(locale)) {
    return;
  }

  const upgradeLevels = locale.upgradeLevels && typeof locale.upgradeLevels === "object" && !Array.isArray(locale.upgradeLevels)
    ? locale.upgradeLevels
    : {};

  for (let upgradeNumber = 0; upgradeNumber < firstUpgradeNumber; upgradeNumber += 1) {
    const level = `+${upgradeNumber}`;
    upgradeLevels[level] ??= [formatDefenseLine(baseDefense, upgradeNumber, singleStepCap, language)];
  }

  locale.upgradeLevels = sortUpgradeLevels(upgradeLevels);
}

function addDescriptionStatsToLocale(locale) {
  if (!locale || typeof locale !== "object" || Array.isArray(locale)) {
    return;
  }

  locale.upgradeLevels = mergeDescriptionStatsIntoUpgradeLevels(locale.upgradeLevels, locale.descriptionLines);
}

function syncDefenseUpgradeLines(item) {
  const baseDefense = getBaseDefenseForItem(item);
  const singleStepCap = getDefenseSingleStepCap(item);
  if (!Number.isFinite(baseDefense) || !Number.isFinite(singleStepCap)) {
    return item;
  }

  item.upgrade_levels = upsertDefenseLinesIntoUpgradeLevels(item.upgrade_levels, baseDefense, singleStepCap, "ru");
  if (item.locales?.ru) {
    item.locales.ru.upgradeLevels = upsertDefenseLinesIntoUpgradeLevels(item.locales.ru.upgradeLevels, baseDefense, singleStepCap, "ru");
  }
  if (item.locales?.en) {
    item.locales.en.upgradeLevels = upsertDefenseLinesIntoUpgradeLevels(item.locales.en.upgradeLevels, baseDefense, singleStepCap, "en");
  }

  return item;
}

export function addMissingDefenseUpgradeLevels(item) {
  const upgradeLevels = item?.upgrade_levels;
  if (!upgradeLevels || typeof upgradeLevels !== "object" || Array.isArray(upgradeLevels)) {
    return item;
  }

  const upgradeNumbers = Object.keys(upgradeLevels)
    .map((level) => parseUpgradeNumber(level))
    .filter((level) => Number.isInteger(level))
    .sort((left, right) => left - right);
  const firstUpgradeNumber = upgradeNumbers[0] ?? 0;
  if (firstUpgradeNumber <= 0) {
    return item;
  }

  const baseDefense = getBaseDefenseForItem(item);
  const singleStepCap = getDefenseSingleStepCap(item);
  if (!Number.isFinite(baseDefense) || !Number.isFinite(singleStepCap)) {
    return item;
  }

  const nextUpgradeLevels = { ...upgradeLevels };
  for (let upgradeNumber = 0; upgradeNumber < firstUpgradeNumber; upgradeNumber += 1) {
    const level = `+${upgradeNumber}`;
    nextUpgradeLevels[level] ??= [formatDefenseLine(baseDefense, upgradeNumber, singleStepCap, "ru")];
  }

  item.upgrade_levels = sortUpgradeLevels(nextUpgradeLevels);
  addMissingDefenseLevelsToLocale(item.locales?.ru, baseDefense, firstUpgradeNumber, singleStepCap, "ru");
  addMissingDefenseLevelsToLocale(item.locales?.en, baseDefense, firstUpgradeNumber, singleStepCap, "en");

  return item;
}

export function normalizeEquipmentUpgradeLevels(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return item;
  }

  addMissingDefenseUpgradeLevels(item);
  item.upgrade_levels = mergeDescriptionStatsIntoUpgradeLevels(item.upgrade_levels, item.description_lines);
  addDescriptionStatsToLocale(item.locales?.ru);
  addDescriptionStatsToLocale(item.locales?.en);
  syncScalingAllStatsEarringLevels(item);
  syncDefenseUpgradeLines(item);

  return item;
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

      const candidate = normalizeEquipmentUpgradeLevels(mergeExistingData({
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
      }, existingIndex));

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
