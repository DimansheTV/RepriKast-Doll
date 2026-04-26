import equipmentCatalog from "./data/equipment-items.json";
import sphereCatalog from "./data/sphere-items.json";
import trophyCatalog from "./data/trophy-items.json";
import petCatalog from "./data/pet-items.json";
import matchOverrides from "./data/match-overrides.json";

const imageModules = import.meta.glob("./images/**/*.{png,jpg,jpeg,webp,gif}", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

const imageUrlMap = Object.fromEntries(
  Object.entries(imageModules).map(([modulePath, url]) => {
    const relativePath = modulePath.replace("./images/", "");
    return [`img/${relativePath}`, url];
  }),
);

export function resolveImageAssetPath(rawPath: unknown): string {
  const normalized = String(rawPath || "").replace(/\\/g, "/");
  if (!normalized || /^https?:\/\//i.test(normalized) || normalized.startsWith("data:")) {
    return normalized;
  }

  return imageUrlMap[normalized] || normalized;
}

export function getCatalogPayloads() {
  return {
    equipment: equipmentCatalog,
    sphere: sphereCatalog,
    trophy: trophyCatalog,
    pet: petCatalog,
    matchOverrides,
  };
}
