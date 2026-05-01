import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export const BASE_URL = "https://r2online.ru";

export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36";

const VALID_SLOT_CODES = {
  equipment: new Set([
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
  ]),
  sphere: new Set(["life", "mastery", "soul", "destruction", "protection", "special", "morph"]),
  trophy: new Set([
    "trophy_top_left",
    "trophy_top_right",
    "trophy_middle_left",
    "trophy_middle_right",
    "trophy_bottom_left",
    "trophy_bottom_right",
  ]),
  pet: new Set(),
};

export function absUrl(url) {
  if (!url) {
    return "";
  }

  return new URL(url, BASE_URL).toString();
}

export function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export async function loadJson(path) {
  const payload = JSON.parse(await readFile(path, "utf8"));
  if (!Array.isArray(payload)) {
    throw new Error(`${path} must contain a JSON array`);
  }
  return payload;
}

export async function writeJson(path, payload) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export function validateCatalog(kind, items) {
  const validSlots = VALID_SLOT_CODES[kind];
  if (!validSlots) {
    throw new Error(`Unknown catalog kind: ${kind}`);
  }

  const seenIds = new Set();
  const normalized = items.map((source, index) => {
    const item = { ...source };
    item.id ??= index + 1;

    const idKey = String(item.id);
    if (seenIds.has(idKey)) {
      throw new Error(`${kind}: duplicate id ${idKey}`);
    }
    seenIds.add(idKey);

    if (!item.name || typeof item.name !== "string") {
      throw new Error(`${kind}: item ${idKey} has no name`);
    }

    if (!item.image || typeof item.image !== "string") {
      throw new Error(`${kind}: item ${idKey} has no image`);
    }

    if (!item.upgrade_levels || typeof item.upgrade_levels !== "object" || Array.isArray(item.upgrade_levels)) {
      throw new Error(`${kind}: item ${idKey} has no upgrade_levels object`);
    }

    for (const [level, bonuses] of Object.entries(item.upgrade_levels)) {
      if (!/^\+\d+$/.test(level)) {
        throw new Error(`${kind}: item ${idKey} has invalid upgrade level ${level}`);
      }
      if (!Array.isArray(bonuses) || bonuses.some((bonus) => typeof bonus !== "string" || !bonus.trim())) {
        throw new Error(`${kind}: item ${idKey} has invalid bonuses at ${level}`);
      }
    }

    if (validSlots.size > 0 && !validSlots.has(item.slot_code)) {
      throw new Error(`${kind}: item ${idKey} has invalid slot_code ${item.slot_code}`);
    }

    return item;
  });

  return normalized;
}

function readSetCookieHeaders(headers) {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }

  const header = headers.get("set-cookie");
  return header ? [header] : [];
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getJhash(code) {
  let x = 123456789;
  let k = 0;

  for (let i = 0; i < 1677696; i += 1) {
    x = ((x + code) ^ (x + (x % 3) + (x % 17) + code) ^ i) % 16776960;
    if (x % 117 === 0) {
      k = (k + 1) % 1111;
    }
  }

  return k;
}

export class WikiClient {
  constructor() {
    this.cookies = new Map();
    this.challengePassed = false;
  }

  cookieHeader() {
    return [...this.cookies.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
  }

  storeCookies(headers) {
    for (const entry of readSetCookieHeaders(headers)) {
      const [pair] = entry.split(";");
      const separator = pair.indexOf("=");
      if (separator > 0) {
        this.cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
      }
    }
  }

  async request(url) {
    const headers = { "User-Agent": USER_AGENT };
    const cookie = this.cookieHeader();
    if (cookie) {
      headers.Cookie = cookie;
    }

    const response = await fetch(url, { headers, redirect: "manual" });
    this.storeCookies(response.headers);
    return response;
  }

  async passChallengeIfNeeded() {
    if (this.challengePassed || !this.cookies.has("__js_p_")) {
      return;
    }

    const [code] = this.cookies.get("__js_p_").split(",");
    const jhash = getJhash(Number(code));
    this.cookies.set("__jhash_", String(jhash));
    this.cookies.set("__jua_", "Mozilla/5.0");
    this.challengePassed = true;
    await delay(1100);
  }

  async getText(url) {
    let currentUrl = url;

    for (let attempt = 0; attempt < 10; attempt += 1) {
      let response = await this.request(currentUrl);
      let text = await response.text();

      if ((text.includes("get_jhash") || text.includes("__js_p_")) && this.cookies.has("__js_p_")) {
        await this.passChallengeIfNeeded();
        response = await this.request(currentUrl);
        text = await response.text();
      }

      if (response.status >= 300 && response.status < 400 && response.headers.get("location")) {
        currentUrl = new URL(response.headers.get("location"), currentUrl).toString();
        continue;
      }

      if (!response.ok) {
        throw new Error(`GET ${currentUrl} failed: ${response.status} ${response.statusText}`);
      }

      return text;
    }

    throw new Error(`GET ${url} failed: too many challenge or redirect attempts`);
  }

  async downloadFile(url, destination) {
    const response = await this.request(url);
    if (!response.ok) {
      throw new Error(`Download ${url} failed: ${response.status} ${response.statusText}`);
    }

    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, Buffer.from(await response.arrayBuffer()));
  }
}
