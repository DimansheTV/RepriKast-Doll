import { loadJson, validateCatalog } from "./data/common.mjs";
import { translateCatalogFile } from "./data/catalog-translate-openai.mjs";
import { build as buildEquipment } from "./data/equipment-builder.mjs";
import { build as buildSphere } from "./data/sphere-builder.mjs";
import { build as buildTrophy } from "./data/trophy-builder.mjs";

const CATALOG_PATHS = {
  equipment: "src/resources/data/equipment-items.json",
  sphere: "src/resources/data/sphere-items.json",
  trophy: "src/resources/data/trophy-items.json",
  pet: "src/resources/data/pet-items.json",
};

function parseArgs(argv) {
  const result = { kind: "", validateOnly: false, rebuildFromWiki: false, translateEn: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--kind") {
      result.kind = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (arg === "--validate-only" || arg === "--dry-run" || arg === "--dry") {
      result.validateOnly = true;
      continue;
    }
    if (arg === "--rebuild-from-wiki") {
      result.rebuildFromWiki = true;
      continue;
    }
    if (arg === "--translate-en") {
      result.translateEn = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      result.help = true;
    }
  }

  return result;
}

function printHelp() {
  console.log(`Usage: node scripts/build-catalog.mjs --kind equipment|sphere|trophy|pet [--validate-only] [--rebuild-from-wiki] [--translate-en]

Default behavior:
- equipment and pet validate existing local JSON.
- sphere and trophy rebuild from r2online.ru unless --validate-only is passed.

Optional maintenance flags:
- --rebuild-from-wiki: rebuild equipment from r2online.ru (default off)
- --translate-en: update locales.en via OpenAI API using OPENAI_API_KEY`);
}

async function validateExisting(kind) {
  const path = CATALOG_PATHS[kind];
  const items = await loadJson(path);
  const normalized = validateCatalog(kind, items);
  console.log(`Validated ${normalized.length} ${kind} items in ${path}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const kind = args.kind;
  if (!Object.hasOwn(CATALOG_PATHS, kind)) {
    printHelp();
    throw new Error(`Missing or invalid --kind: ${kind || "(empty)"}`);
  }

  if (args.validateOnly || (kind === "equipment" && !args.rebuildFromWiki && !args.translateEn) || (kind === "pet" && !args.translateEn)) {
    await validateExisting(kind);
    return;
  }

  if (kind === "equipment" && args.rebuildFromWiki) {
    await buildEquipment();
  }

  if (kind === "sphere") {
    await buildSphere();
  }

  if (kind === "trophy") {
    await buildTrophy();
  }

  if (args.translateEn) {
    await translateCatalogFile(kind, CATALOG_PATHS[kind]);
    return;
  }

  await validateExisting(kind);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
