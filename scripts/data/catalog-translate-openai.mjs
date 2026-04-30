import { loadJson, writeJson } from "./common.mjs";

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = process.env.OPENAI_TRANSLATION_MODEL || "gpt-5-mini";
const REQUIRED_LOCALE_FIELDS = ["name", "description", "descriptionLines", "upgradeLevels"];

function normalizeLines(value) {
  return Array.isArray(value)
    ? value.filter((entry) => typeof entry === "string").map((entry) => entry.trim()).filter(Boolean)
    : [];
}

function normalizeUpgradeLevels(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([level]) => typeof level === "string")
      .map(([level, lines]) => [level, normalizeLines(lines)]),
  );
}

function buildRuLocale(item) {
  return {
    name: String(item.name || "").trim(),
    description: String(item.description || item.description_lines?.[0] || "").trim(),
    descriptionLines: normalizeLines(item.description_lines),
    category: item.category ? String(item.category).trim() : null,
    variant: item.variant ? String(item.variant).trim() : null,
    element: item.element ? String(item.element).trim() : null,
    upgradeLevels: normalizeUpgradeLevels(item.upgrade_levels),
  };
}

function buildSourcePayload(item) {
  return {
    id: String(item.id),
    name: item.locales?.ru?.name || item.name || "",
    description: item.locales?.ru?.description || item.description || "",
    descriptionLines: item.locales?.ru?.descriptionLines || item.description_lines || [],
    category: item.locales?.ru?.category ?? item.category ?? null,
    variant: item.locales?.ru?.variant ?? item.variant ?? null,
    element: item.locales?.ru?.element ?? item.element ?? null,
    upgradeLevels: item.locales?.ru?.upgradeLevels || item.upgrade_levels || {},
  };
}

function hasCompleteEnglishLocale(item) {
  const en = item.locales?.en;
  return Boolean(
    en &&
    REQUIRED_LOCALE_FIELDS.every((field) => {
      if (field === "descriptionLines") {
        return Array.isArray(en.descriptionLines);
      }
      if (field === "upgradeLevels") {
        return en.upgradeLevels && typeof en.upgradeLevels === "object" && !Array.isArray(en.upgradeLevels);
      }
      return typeof en[field] === "string";
    }),
  );
}

function needsTranslation(item) {
  const source = buildSourcePayload(item);
  const storedRu = item.locales?.ru || {};

  return !hasCompleteEnglishLocale(item) || JSON.stringify(source) !== JSON.stringify({
    id: String(item.id),
    name: storedRu.name || "",
    description: storedRu.description || "",
    descriptionLines: storedRu.descriptionLines || [],
    category: storedRu.category ?? null,
    variant: storedRu.variant ?? null,
    element: storedRu.element ?? null,
    upgradeLevels: storedRu.upgradeLevels || {},
  });
}

function chunk(items, size) {
  const result = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

function extractOutputText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  const outputItems = Array.isArray(payload?.output) ? payload.output : [];
  const fragments = [];
  outputItems.forEach((entry) => {
    const contents = Array.isArray(entry?.content) ? entry.content : [];
    contents.forEach((content) => {
      if (typeof content?.text === "string") {
        fragments.push(content.text);
      }
    });
  });

  return fragments.join("\n").trim();
}

async function translateBatch(kind, items) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required when --translate-en is used.");
  }

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            descriptionLines: { type: "array", items: { type: "string" } },
            category: { type: ["string", "null"] },
            variant: { type: ["string", "null"] },
            element: { type: ["string", "null"] },
            upgradeLevels: {
              type: "object",
              additionalProperties: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
          required: ["id", "name", "description", "descriptionLines", "category", "variant", "element", "upgradeLevels"],
        },
      },
    },
    required: ["items"],
  };

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: [
                "Translate R2 wiki catalog entries from Russian to idiomatic English.",
                "Return JSON only.",
                "Do not transliterate.",
                "Preserve numeric values, upgrade keys, game terminology consistency, and array lengths.",
                "Translate every user-visible string, including stat lines and descriptions.",
              ].join(" "),
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({ kind, items }),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "catalog_localization_batch",
          schema,
          strict: true,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI translation request failed: ${response.status} ${response.statusText}\n${errorText}`);
  }

  const payload = await response.json();
  const outputText = extractOutputText(payload);
  if (!outputText) {
    throw new Error("OpenAI translation request returned an empty response body.");
  }

  return JSON.parse(outputText).items || [];
}

function applyTranslations(items, translatedItems) {
  const translationsById = new Map(translatedItems.map((entry) => [String(entry.id), entry]));

  return items.map((item) => {
    const translated = translationsById.get(String(item.id));
    const ru = buildRuLocale(item);

    if (!translated) {
      return {
        ...item,
        locales: {
          ...(item.locales || {}),
          ru,
        },
      };
    }

    return {
      ...item,
      locales: {
        ...(item.locales || {}),
        ru,
        en: {
          name: String(translated.name || "").trim(),
          description: String(translated.description || "").trim(),
          descriptionLines: normalizeLines(translated.descriptionLines),
          category: translated.category == null ? null : String(translated.category).trim(),
          variant: translated.variant == null ? null : String(translated.variant).trim(),
          element: translated.element == null ? null : String(translated.element).trim(),
          upgradeLevels: normalizeUpgradeLevels(translated.upgradeLevels),
        },
      },
    };
  });
}

export async function translateCatalogFile(kind, path) {
  const items = await loadJson(path);
  let nextItems = items.map((item) => ({
    ...item,
    locales: {
      ...(item.locales || {}),
      ru: buildRuLocale(item),
    },
  }));

  const pending = nextItems.filter((item) => needsTranslation(item)).map((item) => buildSourcePayload(item));
  if (!pending.length) {
    await writeJson(path, nextItems);
    console.log(`No ${kind} entries required English translation in ${path}`);
    return;
  }

  for (const batch of chunk(pending, 20)) {
    const translatedBatch = await translateBatch(kind, batch);
    nextItems = applyTranslations(nextItems, translatedBatch);
  }

  await writeJson(path, nextItems);
  console.log(`Translated ${pending.length} ${kind} entries to English in ${path}`);
}
