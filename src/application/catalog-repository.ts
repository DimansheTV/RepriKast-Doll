import { normalizeCatalogItem, validateCatalogItems } from "../shared/item-schema";
import { getCatalogPayloads, resolveImageAssetPath } from "../resources/catalogs";

const VALID_SLOT_CODES = {
  equipment: ["earring", "helmet", "cloak", "necklace", "armor", "shield", "weapon", "belt", "gloves", "ring", "boots"],
  sphere: ["life", "mastery", "soul", "destruction", "protection", "special", "morph"],
  trophy: [
    "trophy_top_left",
    "trophy_top_right",
    "trophy_middle_left",
    "trophy_middle_right",
    "trophy_bottom_left",
    "trophy_bottom_right",
  ],
  pet: [],
};

function loadCatalog(kind, rawItems) {
  const items = Array.isArray(rawItems)
    ? rawItems.map((item, index) => normalizeCatalogItem(kind, item, index, { resolveImageAssetPath }))
    : [];

  validateCatalogItems(items, {
    kind,
    validSlotCodes: VALID_SLOT_CODES[kind] || [],
  });

  return items;
}

export function createCatalogRepository(fetchImpl) {
  return {
    async loadAll() {
      const payloads = getCatalogPayloads();
      const [equipment, sphere, trophy, pet] = await Promise.all([
        Promise.resolve(loadCatalog("equipment", payloads.equipment)),
        Promise.resolve(loadCatalog("sphere", payloads.sphere)),
        Promise.resolve(loadCatalog("trophy", payloads.trophy)),
        Promise.resolve(loadCatalog("pet", payloads.pet)),
      ]);

      return { equipment, sphere, trophy, pet };
    },
  };
}
