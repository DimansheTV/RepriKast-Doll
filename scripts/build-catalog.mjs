import { loadJson, validateCatalog } from "./data/common.mjs";
import { build as buildSphere } from "./data/sphere-builder.mjs";
import { build as buildTrophy } from "./data/trophy-builder.mjs";

const CATALOG_PATHS = {
  equipment: "src/resources/data/equipment-items.json",
  sphere: "src/resources/data/sphere-items.json",
  trophy: "src/resources/data/trophy-items.json",
  pet: "src/resources/data/pet-items.json",
};

function parseArgs(argv) {
  const result = { kind: "", validateOnly: false };

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
    if (arg === "--help" || arg === "-h") {
      result.help = true;
    }
  }

  return result;
}

function printHelp() {
  console.log(`Usage: node scripts/build-catalog.mjs --kind equipment|sphere|trophy|pet [--validate-only]

equipment and pet validate existing local JSON.
sphere and trophy rebuild from r2online.ru unless --validate-only is passed.`);
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

  if (args.validateOnly || kind === "equipment" || kind === "pet") {
    await validateExisting(kind);
    return;
  }

  if (kind === "sphere") {
    await buildSphere();
    return;
  }

  if (kind === "trophy") {
    await buildTrophy();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
