import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import { cleanText, getJhash, USER_AGENT, validateCatalog, writeJson } from "./common.mjs";

const EQUIPMENT_JSON = "src/resources/data/equipment-items.json";

const CLASS_BY_WIKI_ICON = new Map([
  ["cl-1", "knight"],
  ["cl-2", "mage"],
  ["cl-3", "assassin"],
  ["cl-4", "summoner"],
  ["cl-5", "ranger"],
  ["cl-all", "all"],
]);

const CLASS_ORDER = ["all", "knight", "mage", "assassin", "summoner", "ranger"];

const CLASS_RESTRICTED_SLOTS = new Set([
  "weapon",
  "helmet",
  "armor",
  "boots",
  "gloves",
  "shield",
]);

class ChallengeAwareClient {
  constructor() {
    this.cookies = new Map();
  }

  cookieHeader() {
    return [...this.cookies.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
  }

  storeCookies(headers) {
    const header = headers.get("set-cookie");
    if (!header) {
      return;
    }

    for (const entry of header.split(/,(?=\s*[^;,]+=)/)) {
      const [pair] = entry.trim().split(";");
      const separator = pair.indexOf("=");
      if (separator > 0) {
        this.cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
      }
    }
  }

  async request(url) {
    const response = await fetch(url, {
      redirect: "manual",
      headers: {
        "User-Agent": USER_AGENT,
        Cookie: this.cookieHeader(),
      },
    });
    this.storeCookies(response.headers);
    return response;
  }

  async passChallengeIfNeeded() {
    if (!this.cookies.has("__js_p_")) {
      return;
    }

    const [code] = this.cookies.get("__js_p_").split(",");
    this.cookies.set("__jhash_", String(getJhash(Number(code))));
    this.cookies.set(
      "__jua_",
      encodeURIComponent(USER_AGENT).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16)}`),
    );
    await new Promise((resolve) => setTimeout(resolve, 1100));
  }

  async getText(url) {
    let currentUrl = url;

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await this.request(currentUrl);
      const text = await response.text();

      if ((text.includes("get_jhash") || text.includes("__js_p_")) && this.cookies.has("__js_p_")) {
        await this.passChallengeIfNeeded();
        continue;
      }

      if (response.status >= 300 && response.status < 400 && response.headers.get("location")) {
        currentUrl = response.headers.get("location");
        continue;
      }

      if (!response.ok) {
        throw new Error(`GET ${currentUrl} failed: ${response.status} ${response.statusText}`);
      }

      return text;
    }

    throw new Error(`GET ${url} failed: too many challenge/redirect attempts`);
  }
}

function normalizeName(value) {
  return cleanText(value)
    .toLocaleLowerCase("ru")
    .replace(/\s*\((?:прок\.?|проч\.?)\)\s*$/i, "")
    .replace(/ё/g, "е");
}

function normalizeClasses(classes) {
  const unique = [...new Set(classes.filter(Boolean))];
  if (!unique.length || unique.includes("all")) {
    return ["all"];
  }
  return unique.sort((left, right) => CLASS_ORDER.indexOf(left) - CLASS_ORDER.indexOf(right));
}

function parseClasses(row) {
  const classes = [];

  row.find(".icon-class").each((_, element) => {
    const iconClass = (element.attribs?.class || "").split(/\s+/).find((entry) => entry.startsWith("cl-"));
    const classKey = CLASS_BY_WIKI_ICON.get(iconClass);
    if (classKey) {
      classes.push(classKey);
    }
  });

  return normalizeClasses(classes);
}

function extractRows(html) {
  const $ = cheerio.load(html);
  const rows = [];
  const seenUrls = new Set();

  $("tbody tr").each((_, element) => {
    const row = $(element);
    const link = row.find('a.catalog-item[href*="/wiki/base/view/"]').last();
    const url = link.attr("href") || "";
    const name = cleanText(link.text() || row.find("img.base-item-icon").attr("title"));

    if (!url || !name || seenUrls.has(url)) {
      return;
    }

    seenUrls.add(url);
    rows.push({
      name,
      normalizedName: normalizeName(name),
      classes: parseClasses(row),
    });
  });

  return rows;
}

function indexEquipment(items) {
  const index = new Map();

  items.forEach((item, itemIndex) => {
    if (!CLASS_RESTRICTED_SLOTS.has(item.slot_code)) {
      return;
    }

    const keys = new Set([normalizeName(item.name)]);
    const baseKey = normalizeName(String(item.name || "").replace(/\s*\([^)]*\)\s*$/u, ""));
    if (baseKey) {
      keys.add(baseKey);
    }

    for (const key of keys) {
      const bucket = index.get(key) || [];
      bucket.push({ item, itemIndex });
      index.set(key, bucket);
    }
  });

  return index;
}

function sameClasses(left, right) {
  return JSON.stringify(normalizeClasses(left || [])) === JSON.stringify(normalizeClasses(right || []));
}

export async function syncEquipmentClasses(urls) {
  if (!urls.length) {
    throw new Error("Pass one or more r2online wiki list URLs.");
  }

  const client = new ChallengeAwareClient();
  const items = JSON.parse(await readFile(EQUIPMENT_JSON, "utf8"));
  const equipmentIndex = indexEquipment(items);
  const report = {
    rows: 0,
    updated: [],
    unchanged: [],
    missing: [],
  };

  for (const url of urls) {
    const rows = extractRows(await client.getText(url));
    report.rows += rows.length;

    for (const row of rows) {
      const matches = equipmentIndex.get(row.normalizedName) || [];
      if (!matches.length) {
        report.missing.push(row.name);
        continue;
      }

      for (const match of matches) {
        if (sameClasses(match.item.classes, row.classes)) {
          report.unchanged.push(match.item.name);
          continue;
        }

        match.item.classes = row.classes;
        report.updated.push(match.item.name);
      }
    }
  }

  validateCatalog("equipment", items);
  await writeJson(EQUIPMENT_JSON, items);
  return report;
}

if (fileURLToPath(import.meta.url) === resolve(process.argv[1] || "")) {
  syncEquipmentClasses(process.argv.slice(2))
    .then((report) => {
      console.log(`Parsed rows: ${report.rows}`);
      console.log(`Updated items: ${report.updated.length}`);
      console.log(`Unchanged items: ${report.unchanged.length}`);
      if (report.updated.length) {
        console.log(report.updated.map((name) => `  + ${name}`).join("\n"));
      }
      if (report.missing.length) {
        console.log(`Missing local items: ${report.missing.length}`);
        console.log(report.missing.map((name) => `  - ${name}`).join("\n"));
      }
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
