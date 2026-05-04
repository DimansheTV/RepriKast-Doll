import type { Language } from "./i18n";
import { decodeMojibakeText, localizeText } from "./i18n";

type CatalogLocaleBlock = {
  name?: string;
  description?: string;
  descriptionLines?: string[];
  category?: string | null;
  variant?: string | null;
  element?: string | null;
  upgradeLevels?: Record<string, string[]>;
};

type CatalogLocales = Partial<Record<Language, CatalogLocaleBlock>>;

export const CATALOG_LOCALE_LANGUAGES: Language[] = ["ru", "en"];

function normalizeString(value: unknown): string {
  return decodeMojibakeText(value).trim();
}

function normalizeNullableString(value: unknown): string | null {
  const normalized = normalizeString(value);
  return normalized || null;
}

function normalizeLines(value: unknown): string[] {
  return Array.isArray(value)
    ? value
      .filter((entry) => typeof entry === "string")
      .map((entry) => normalizeString(entry))
      .filter(Boolean)
    : [];
}

function normalizeUpgradeLevels(value: unknown): Record<string, string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([level]) => typeof level === "string")
      .map(([level, lines]) => [level, normalizeLines(lines)]),
  );
}

function maybeLocalizeValue(value: string, language: Language): string {
  if (!value || language === "ru") {
    return value;
  }

  return localizeText(value, language);
}

function maybeLocalizeLines(lines: string[], language: Language): string[] {
  if (language === "ru" || !lines.length) {
    return lines;
  }

  return lines.map((line) => maybeLocalizeValue(line, language));
}

function normalizeLocaleBlock(value: unknown): CatalogLocaleBlock {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return {
    name: normalizeString((value as CatalogLocaleBlock).name),
    description: normalizeString((value as CatalogLocaleBlock).description),
    descriptionLines: normalizeLines((value as CatalogLocaleBlock).descriptionLines),
    category: normalizeNullableString((value as CatalogLocaleBlock).category),
    variant: normalizeNullableString((value as CatalogLocaleBlock).variant),
    element: normalizeNullableString((value as CatalogLocaleBlock).element),
    upgradeLevels: normalizeUpgradeLevels((value as CatalogLocaleBlock).upgradeLevels),
  };
}

export function normalizeCatalogLocales(rawItem: Record<string, unknown>): CatalogLocales {
  const sourceMeta = rawItem?.sourceMeta && typeof rawItem.sourceMeta === "object" ? rawItem.sourceMeta as Record<string, unknown> : {};
  const rawLocales = rawItem?.locales && typeof rawItem.locales === "object" && !Array.isArray(rawItem.locales)
    ? rawItem.locales as CatalogLocales
    : {};

  const ruDescriptionLines = normalizeLines(rawItem?.descriptionLines || rawItem?.description_lines);
  const ruUpgradeLevels = normalizeUpgradeLevels(rawItem?.upgradeLevels || rawItem?.upgrade_levels);

  const normalizedLocales: CatalogLocales = {
    ru: {
      name: normalizeString(rawItem?.name || rawLocales?.ru?.name),
      description: normalizeString(rawItem?.description || rawLocales?.ru?.description || ruDescriptionLines[0] || ""),
      descriptionLines: ruDescriptionLines.length ? ruDescriptionLines : normalizeLines(rawLocales?.ru?.descriptionLines),
      category: normalizeNullableString(rawItem?.category ?? sourceMeta?.category ?? rawLocales?.ru?.category),
      variant: normalizeNullableString(rawItem?.variant ?? sourceMeta?.variant ?? rawLocales?.ru?.variant),
      element: normalizeNullableString(rawItem?.element ?? sourceMeta?.element ?? rawLocales?.ru?.element),
      upgradeLevels: Object.keys(ruUpgradeLevels).length ? ruUpgradeLevels : normalizeUpgradeLevels(rawLocales?.ru?.upgradeLevels),
    },
  };

  for (const language of CATALOG_LOCALE_LANGUAGES) {
    if (language === "ru") {
      continue;
    }
    normalizedLocales[language] = normalizeLocaleBlock(rawLocales?.[language]);
  }

  return normalizedLocales;
}

export function getCatalogLocaleBlock(item: Record<string, unknown> | null | undefined, language: Language): CatalogLocaleBlock {
  const locales = item?.locales && typeof item.locales === "object" ? item.locales as CatalogLocales : {};
  return normalizeLocaleBlock(locales?.[language]);
}

export function getLocalizedCatalogField(
  item: Record<string, unknown> | null | undefined,
  field: keyof CatalogLocaleBlock,
  language: Language,
  options: { fallbackToRu?: boolean } = {},
): string {
  const sourceMeta = item?.sourceMeta && typeof item.sourceMeta === "object" ? item.sourceMeta as Record<string, unknown> : {};
  const fallbackToRu = options.fallbackToRu !== false;
  const localized = getCatalogLocaleBlock(item, language)?.[field];
  if (typeof localized === "string" && localized) {
    return localized;
  }

  if (fallbackToRu && language !== "ru") {
    const fallback = getCatalogLocaleBlock(item, "ru")?.[field];
    if (typeof fallback === "string" && fallback) {
      return maybeLocalizeValue(fallback, language);
    }
  }

  if (field === "name") {
    return maybeLocalizeValue(normalizeString(item?.name || ""), language);
  }
  if (field === "description") {
    return maybeLocalizeValue(normalizeString(item?.description || ""), language);
  }
  if (field === "category") {
    return maybeLocalizeValue(normalizeString(item?.category ?? sourceMeta?.category ?? ""), language);
  }
  if (field === "variant") {
    return maybeLocalizeValue(normalizeString(item?.variant ?? sourceMeta?.variant ?? ""), language);
  }
  if (field === "element") {
    return maybeLocalizeValue(normalizeString(item?.element ?? sourceMeta?.element ?? ""), language);
  }

  return "";
}

export function getLocalizedCatalogLines(
  item: Record<string, unknown> | null | undefined,
  field: "descriptionLines",
  language: Language,
  options: { fallbackToRu?: boolean } = {},
): string[] {
  const fallbackToRu = options.fallbackToRu !== false;
  const localized = getCatalogLocaleBlock(item, language)?.[field];
  if (Array.isArray(localized) && localized.length) {
    return localized;
  }

  if (fallbackToRu && language !== "ru") {
    const fallback = getCatalogLocaleBlock(item, "ru")?.[field];
    if (Array.isArray(fallback) && fallback.length) {
      return maybeLocalizeLines(fallback, language);
    }
  }

  return maybeLocalizeLines(normalizeLines(item?.descriptionLines || item?.description_lines), language);
}

export function getLocalizedCatalogUpgradeLines(
  item: Record<string, unknown> | null | undefined,
  level: string,
  language: Language,
  options: { fallbackToRu?: boolean } = {},
): string[] {
  const fallbackToRu = options.fallbackToRu !== false;
  const localized = getCatalogLocaleBlock(item, language)?.upgradeLevels?.[level];
  if (Array.isArray(localized) && localized.length) {
    return localized;
  }

  if (fallbackToRu && language !== "ru") {
    const fallback = getCatalogLocaleBlock(item, "ru")?.upgradeLevels?.[level];
    if (Array.isArray(fallback) && fallback.length) {
      return maybeLocalizeLines(fallback, language);
    }
  }

  return maybeLocalizeLines(normalizeLines(item?.upgradeLevels?.[level] || item?.upgrade_levels?.[level]), language);
}
