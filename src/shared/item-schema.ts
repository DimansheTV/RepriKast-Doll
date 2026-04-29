import { decodeMojibakeText } from "./i18n";

const REQUIRED_ITEM_FIELDS = [
  "kind",
  "id",
  "name",
  "slotCode",
  "image",
  "upgradeLevels",
  "descriptionLines",
  "sourceMeta",
];

function normalizeLines(value) {
  return Array.isArray(value)
    ? value.filter((entry) => typeof entry === "string").map((entry) => decodeMojibakeText(entry))
    : [];
}

function normalizeUpgradeLevels(rawLevels) {
  if (!rawLevels || typeof rawLevels !== "object" || Array.isArray(rawLevels)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(rawLevels)
      .filter(([level, params]) => typeof level === "string" && Array.isArray(params))
      .map(([level, params]) => [level, normalizeLines(params)]),
  );
}

function omitKnownFields(raw) {
  const attributes = { ...raw };
  [
    "kind",
    "id",
    "name",
    "slotCode",
    "slot_code",
    "image",
    "upgradeLevels",
    "upgrade_levels",
    "descriptionLines",
    "description_lines",
    "classes",
    "sourceMeta",
    "wiki_url",
    "source_image_url",
  ].forEach((key) => {
    delete attributes[key];
  });
  return attributes;
}

export function normalizeCatalogItem(kind, rawItem, index = 0, options: NormalizeOptions = {}) {
  const resolveImageAssetPath = options.resolveImageAssetPath || ((value) => String(value || ""));
  const slotCode = String(rawItem?.slotCode || rawItem?.slot_code || "");
  const descriptionLines = normalizeLines(rawItem?.descriptionLines || rawItem?.description_lines);
  const upgradeLevels = normalizeUpgradeLevels(rawItem?.upgradeLevels || rawItem?.upgrade_levels);
  const id = rawItem?.id ?? `${kind}-${index}`;

  return {
    ...rawItem,
    kind,
    id,
    name: decodeMojibakeText(rawItem?.name || ""),
    slotCode,
    slot_code: slotCode,
    image: resolveImageAssetPath(rawItem?.image || ""),
    upgradeLevels,
    upgrade_levels: upgradeLevels,
    descriptionLines,
    description_lines: descriptionLines,
    sourceMeta: {
      wikiUrl: String(rawItem?.wiki_url || rawItem?.sourceMeta?.wikiUrl || ""),
      sourceImageUrl: String(rawItem?.source_image_url || rawItem?.sourceMeta?.sourceImageUrl || ""),
      category: decodeMojibakeText(rawItem?.category ?? rawItem?.sourceMeta?.category ?? null),
      weight: rawItem?.weight ?? rawItem?.sourceMeta?.weight ?? null,
      classes: Array.isArray(rawItem?.classes) ? [...rawItem.classes] : Array.isArray(rawItem?.sourceMeta?.classes) ? [...rawItem.sourceMeta.classes] : [],
      variant: decodeMojibakeText(rawItem?.variant ?? rawItem?.sourceMeta?.variant ?? null),
      element: decodeMojibakeText(rawItem?.element ?? rawItem?.sourceMeta?.element ?? null),
      parameters: rawItem?.parameters ?? rawItem?.sourceMeta?.parameters ?? null,
    },
    attributes: omitKnownFields(rawItem || {}),
  };
}

export function validateCatalogItems(items, { kind, validSlotCodes = [] }: ValidateOptions = {}) {
  const seenIds = new Set();
  const validSlots = new Set(validSlotCodes);

  items.forEach((item, index) => {
    REQUIRED_ITEM_FIELDS.forEach((field) => {
      if (!(field in item)) {
        throw new Error(`${kind || "catalog"}[${index}] missing ${field}`);
      }
    });

    if (!item.name) {
      throw new Error(`${kind || "catalog"}[${index}] has empty name`);
    }
    if (seenIds.has(String(item.id))) {
      throw new Error(`${kind || "catalog"} duplicate id: ${item.id}`);
    }
    seenIds.add(String(item.id));

    if (validSlots.size && item.slotCode && !validSlots.has(item.slotCode)) {
      throw new Error(`${kind || "catalog"} item ${item.name} has invalid slotCode ${item.slotCode}`);
    }

    if (typeof item.upgradeLevels !== "object" || Array.isArray(item.upgradeLevels)) {
      throw new Error(`${kind || "catalog"} item ${item.name} has invalid upgradeLevels`);
    }

    Object.entries(item.upgradeLevels).forEach(([level, params]) => {
      if (!level) {
        throw new Error(`${kind || "catalog"} item ${item.name} has empty upgrade level`);
      }
      if (!Array.isArray(params)) {
        throw new Error(`${kind || "catalog"} item ${item.name} level ${level} is not a list`);
      }
    });
  });
}
type NormalizeOptions = {
  resolveImageAssetPath?: (value: unknown) => string;
};

type ValidateOptions = {
  kind?: string;
  validSlotCodes?: string[];
};
