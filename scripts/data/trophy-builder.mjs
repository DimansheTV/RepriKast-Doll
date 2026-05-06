import { access } from "node:fs/promises";
import { extname, join } from "node:path";
import * as cheerio from "cheerio";
import { absUrl, cleanText, validateCatalog, WikiClient, writeJson } from "./common.mjs";

const OUT_JSON = "src/resources/data/trophy-items.json";
const IMG_DIR = "src/resources/images/trophies";

const TROPHIES = [
  { id: "trophy_crown", pageId: "47511410014", name: "Корона", slotCode: "trophy_top_left", stat: "HP", base: 40, step: 40, max: 840 },
  { id: "trophy_mask", pageId: "47511410015", name: "Маска", slotCode: "trophy_top_right", stat: "Защита", base: 1, step: 1, max: 21 },
  { id: "trophy_bracelet", pageId: "47511410016", name: "Браслет", slotCode: "trophy_middle_left", stat: "Сила", base: 1, step: 1, max: 21 },
  { id: "trophy_amulet", pageId: "47511410017", name: "Амулет", slotCode: "trophy_middle_right", stat: "Ловкость", base: 1, step: 1, max: 21 },
  { id: "trophy_cup", pageId: "47511410018", name: "Чаша", slotCode: "trophy_bottom_left", stat: "Скорость бега", base: 1, step: 1, max: 21 },
  { id: "trophy_horn", pageId: "47511410019", name: "Горн", slotCode: "trophy_bottom_right", stat: "Скорость атаки", base: 1, step: 1, max: 21 },
];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function buildUpgradeLevels(stat, base, step) {
  const suffix = stat === "Скорость атаки" ? "%" : "";
  return Object.fromEntries(
    Array.from({ length: 21 }, (_, level) => [`+${level}`, [`${stat} +${base + step * level}${suffix}`]]),
  );
}

async function getIconUrl(client, pageId) {
  const html = await client.getText(`https://r2online.ru/wiki/base/view/${pageId}/`);
  const $ = cheerio.load(html);
  const icon = $("img.base-item-icon").first().attr("src");
  if (!icon) {
    throw new Error(`Cannot find trophy icon for page ${pageId}`);
  }
  return absUrl(icon);
}

export async function build() {
  const client = new WikiClient();
  const items = [];

  for (const trophy of TROPHIES) {
    const imageUrl = await getIconUrl(client, trophy.pageId);
    const ext = extname(new URL(imageUrl).pathname) || ".webp";
    const imagePath = join(IMG_DIR, `${trophy.id}${ext}`);

    if (!(await exists(imagePath))) {
      await client.downloadFile(imageUrl, imagePath);
    }

    items.push({
      id: trophy.id,
      name: trophy.name,
      slot_code: trophy.slotCode,
      image: `img/trophies/${trophy.id}${ext}`,
      parameters: {
        stat: trophy.stat,
        base: trophy.base,
        per_enhancement: trophy.step,
        max: trophy.max,
      },
      upgrade_levels: buildUpgradeLevels(trophy.stat, trophy.base, trophy.step),
    });
  }

  const normalized = validateCatalog("trophy", items);
  await writeJson(OUT_JSON, normalized);
  console.log(`Wrote ${normalized.length} trophies to ${OUT_JSON}`);
}
