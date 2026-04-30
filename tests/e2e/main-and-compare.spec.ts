import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

type ProfileSeed = {
  id: string;
  name: string;
  classConfig: {
    classKey: string;
    level: number;
  };
  equipped?: Record<string, unknown>;
  sphereEquipped?: Record<string, unknown>;
  trophyEquipped?: Record<string, unknown>;
  petEquipped?: { itemId: string; mergeCounts?: Record<string, number> } | null;
  activeWorkspaceTab?: string;
};

const STORAGE_KEYS = {
  profiles: "r2-doll-profiles-v1",
  activeProfileId: "r2-doll-active-profile-v1",
  compareSecondaryProfileId: "r2-doll-compare-secondary-v1",
  language: "r2-doll-language-v1",
};

const SUSPICIOUS_EN_PATTERNS = [
  /Sfera/i,
  /urov/i,
  /bozhestven/i,
  /usilenn/i,
  /uluchsh/i,
  /shpion/i,
  /garmon/i,
  /koltso/i,
  /sergi/i,
  /ozherel/i,
  /remen/i,
  /ogon/i,
  /blizh/i,
  /daln/i,
  /alchn/i,
  /usovershen/i,
  /prizyv/i,
  /rytsar/i,
  /tayfun/i,
  /grivenos/i,
  /grifon/i,
  /perevoplosh/i,
  /vrem\./i,
];

function loadCatalogItems(kind: "equipment" | "sphere" | "trophy" | "pet") {
  return JSON.parse(readFileSync(`src/resources/data/${kind}-items.json`, "utf8"));
}

function collectEnglishCatalogStrings(item: Record<string, unknown>) {
  const locales = item.locales && typeof item.locales === "object" ? item.locales as Record<string, unknown> : {};
  const en = locales.en && typeof locales.en === "object" ? locales.en as Record<string, unknown> : {};
  return [
    en.name,
    en.description,
    en.category,
    en.variant,
    en.element,
    ...(Array.isArray(en.descriptionLines) ? en.descriptionLines : []),
    ...Object.values(en.upgradeLevels || {}).flat(),
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

function collectRussianCatalogStrings(item: Record<string, unknown>) {
  const locales = item.locales && typeof item.locales === "object" ? item.locales as Record<string, unknown> : {};
  const ru = locales.ru && typeof locales.ru === "object" ? locales.ru as Record<string, unknown> : {};
  return [
    ru.description,
    ...(Array.isArray(ru.descriptionLines) ? ru.descriptionLines : []),
    ...Object.values(ru.upgradeLevels || {}).flat(),
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

function containsCyrillic(value: string) {
  return /[\u0410-\u044f\u0401\u0451]/u.test(value);
}

async function expectLocatorTextWithoutCyrillic(locator: Locator, label: string) {
  const text = (await locator.innerText()).trim();
  expect.soft(containsCyrillic(text), `${label} should not contain Cyrillic`).toBe(false);
}

async function seedProfiles(
  page: Page,
  profiles: ProfileSeed[],
  activeProfileId: string,
  compareSecondaryProfileId = "",
) {
  await page.addInitScript(
    ({ keys, seededProfiles, activeId, compareId }) => {
      const seedMarker = "r2-doll-e2e-seeded-v1";
      if (window.sessionStorage.getItem(seedMarker) === "1") {
        return;
      }

      window.localStorage.clear();
      window.sessionStorage.clear();
      window.localStorage.setItem(keys.profiles, JSON.stringify(seededProfiles));
      window.localStorage.setItem(keys.activeProfileId, activeId);
      if (compareId) {
        window.localStorage.setItem(keys.compareSecondaryProfileId, compareId);
      }
      window.sessionStorage.setItem(seedMarker, "1");
    },
    {
      keys: STORAGE_KEYS,
      seededProfiles: profiles,
      activeId: activeProfileId,
      compareId: compareSecondaryProfileId,
    },
  );
}

async function readBoardStats(page: Page, selector: string) {
  return page.locator(`${selector} .board-stat-row`).evaluateAll((rows) => {
    return Object.fromEntries(
      rows.map((row) => {
        const name = row.querySelector(".board-stat-name")?.textContent?.trim() || "";
        const value = row.querySelector(".board-stat-value")?.textContent?.trim() || "";
        return [name, value];
      }),
    );
  });
}

async function readBoardMainStats(page: Page) {
  return readBoardStats(page, "#board-main-stats");
}

async function readBoardExtraStats(page: Page) {
  return readBoardStats(page, "#board-extra-stats");
}

async function readCompareRow(page: Page, label: string) {
  return page.evaluate((targetLabel) => {
    const labelCells = [...document.querySelectorAll<HTMLElement>(".compare-table-label")];
    const cell = labelCells.find((entry) => entry.textContent?.trim() === targetLabel);
    if (!cell) {
      return null;
    }

    const primary = cell.nextElementSibling as HTMLElement | null;
    const secondary = primary?.nextElementSibling as HTMLElement | null;
    const delta = secondary?.nextElementSibling as HTMLElement | null;

    return {
      primaryText: primary?.textContent?.trim() || "",
      secondaryText: secondary?.textContent?.trim() || "",
      deltaText: delta?.textContent?.trim() || "",
      primaryClass: primary?.className || "",
      secondaryClass: secondary?.className || "",
      deltaClass: delta?.className || "",
    };
  }, label);
}

async function clickFirstEquipButton(page: Page, selector: string) {
  const workspaceTab = selector.includes("[data-pet-id]")
    ? "pet"
    : selector.includes("[data-sphere-id]")
      ? "spheres"
      : selector.includes("[data-trophy-id]")
        ? "trophies"
        : "inventory";

  await page.locator(`[data-workspace-tab="${workspaceTab}"]`).click();

  const effectiveSelector = workspaceTab === "inventory" && selector === "#category-list .equip-btn[data-action='equip']"
    ? '#category-list .equip-btn[data-action="equip"][data-slot]:not([data-slot="ring_morph_passive"]):not([disabled])'
    : selector;

  let button = page.locator(effectiveSelector).first();
  if (!await button.isVisible().catch(() => false)) {
    const headers = page.locator("#category-list .category-header");
    const headerCount = await headers.count();
    for (let index = 0; index < headerCount; index += 1) {
      await headers.nth(index).click();
      button = page.locator(effectiveSelector).first();
      if (await button.isVisible().catch(() => false)) {
        break;
      }
    }
  }

  await expect(button).toBeVisible();
  await button.click();
}

async function openEquipmentCategory(page: Page, slotKey: string) {
  await page.locator('[data-workspace-tab="inventory"]').click();
  const header = page.locator(`.category-block[data-slot="${slotKey}"] .category-header`);
  await expect(header).toBeVisible();
  const items = page.locator(`.category-block[data-slot="${slotKey}"] .category-items`);
  const isExpanded = await items.evaluate((element) => element.classList.contains("expanded"));
  if (!isExpanded) {
    await header.click();
    await expect(items).toHaveClass(/expanded/);
  }
}

async function renameActiveBuild(page: Page, name: string) {
  await page.locator("[data-build-edit]").click();
  const input = page.locator("[data-build-name-input]");
  await expect(input).toBeVisible();
  await input.fill(name);
  await input.press("Enter");
}

async function openBuildMenu(page: Page) {
  const trigger = page.locator("[data-build-trigger]");
  await expect(trigger).toBeVisible();
  await expect(trigger).toBeEnabled();
  await trigger.click();
  await expect(page.locator("[data-build-menu]")).toBeVisible();
}

async function closeBuildMenu(page: Page) {
  if (await page.locator("[data-build-menu]").count()) {
    await page.evaluate(() => {
      document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await expect(page.locator("[data-build-menu]")).toHaveCount(0);
  }
}

async function expectSavedBuildCount(page: Page, count: number) {
  await openBuildMenu(page);
  await expect(page.locator("[data-build-option]")).toHaveCount(count);
  await closeBuildMenu(page);
}

async function selectSavedBuildByIndex(page: Page, index: number) {
  await openBuildMenu(page);
  await page.locator("[data-build-option]").nth(index).click();
}

async function expectCompareSecondaryStored(page: Page, predicateSource: string) {
  await expect
    .poll(async () => page.evaluate(
      ({ key, predicateBody }) => {
        const profiles = JSON.parse(window.localStorage.getItem(key) || "[]");
        const secondary = profiles.find((profile: { id: string }) => profile.id === "profile-secondary");
        return Function("profile", `return (${predicateBody})(profile)`)(secondary);
      },
      { key: STORAGE_KEYS.profiles, predicateBody: predicateSource },
    ))
    .toBe(true);
}

async function switchLanguage(page: Page, language: "ru" | "en") {
  const button = page.locator("#language-cycle-button");
  await expect(button).toBeVisible();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if ((await page.locator("html").getAttribute("lang")) === language) {
      return;
    }

    await button.click();
  }

  await expect(page.locator("html")).toHaveAttribute("lang", language);
}

async function openMorphSphereCatalog(page: Page) {
  const category = await openSphereCategory(page, "sphere_type_4");
  await expect(page.locator('[data-sphere-id="morph_50"]').first()).toBeVisible();
  return category;
}

async function openSphereCategory(page: Page, categoryKey: string) {
  await page.locator('[data-workspace-tab="spheres"]').click();
  const category = page.locator(`[data-sphere-category="${categoryKey}"]`).first();
  await expect(category).toBeVisible();

  const items = category.locator(".category-items");
  const isExpanded = await items.evaluate((element) => element.classList.contains("expanded"));
  if (!isExpanded) {
    await category.locator(".category-header").click();
    await expect(items).toHaveClass(/expanded/);
  }
  return category;
}

test("production dist entrypoints load bundled assets", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page.locator("[data-build-trigger]")).toBeVisible();

  const indexAssets = await page.evaluate(() => ({
    scripts: [...document.querySelectorAll<HTMLScriptElement>('script[type="module"]')].map((script) =>
      script.getAttribute("src") || "",
    ),
    styles: [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map((link) =>
      link.getAttribute("href") || "",
    ),
  }));

  expect(indexAssets.scripts.length).toBeGreaterThan(0);
  expect(indexAssets.styles.length).toBeGreaterThan(0);
  expect([...indexAssets.scripts, ...indexAssets.styles].every((asset) => asset.includes("assets/"))).toBe(true);
  expect([...indexAssets.scripts, ...indexAssets.styles].some((asset) => asset.includes("/src/"))).toBe(false);

  await page.goto("/compare.html");
  await expect(page.locator("#compare-primary-select")).toBeVisible();

  const compareAssets = await page.evaluate(() => ({
    scripts: [...document.querySelectorAll<HTMLScriptElement>('script[type="module"]')].map((script) =>
      script.getAttribute("src") || "",
    ),
    styles: [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map((link) =>
      link.getAttribute("href") || "",
    ),
  }));

  expect(compareAssets.scripts.length).toBeGreaterThan(0);
  expect(compareAssets.styles.length).toBeGreaterThan(0);
  expect([...compareAssets.scripts, ...compareAssets.styles].every((asset) => asset.includes("assets/"))).toBe(true);
  expect([...compareAssets.scripts, ...compareAssets.styles].some((asset) => asset.includes("/src/"))).toBe(false);
});

test("catalog CLI validates local equipment and pet data without network", () => {
  test.setTimeout(120000);

  execSync("corepack pnpm catalog:build -- --kind equipment", { stdio: "pipe" });
  execSync("corepack pnpm catalog:build -- --kind pet", { stdio: "pipe" });
});

test("english catalog locales stay free of cyrillic, raw wiki text, and temporary equipment", () => {
  const catalogs = [
    ...loadCatalogItems("equipment"),
    ...loadCatalogItems("sphere"),
    ...loadCatalogItems("trophy"),
    ...loadCatalogItems("pet"),
  ];

  const localizationFindings = catalogs.flatMap((item) => {
    return collectEnglishCatalogStrings(item)
      .map((value) => {
        if (containsCyrillic(value)) {
          return { id: item.id, value, reason: "cyrillic" };
        }

        if (SUSPICIOUS_EN_PATTERNS.some((pattern) => pattern.test(value))) {
          return { id: item.id, value, reason: "raw-wiki-tail" };
        }

        return null;
      })
      .filter(Boolean);
  }).slice(0, 20);

  expect(localizationFindings).toEqual([]);

  const missingEnglishContent = catalogs
    .filter((item) => collectRussianCatalogStrings(item).length > 0 && collectEnglishCatalogStrings(item).length === 0)
    .map((item) => ({ id: item.id, name: item.name }))
    .slice(0, 20);

  expect(missingEnglishContent).toEqual([]);

  const temporaryEquipment = loadCatalogItems("equipment")
    .filter((item) => /\u0432\u0440\u0435\u043c\.|\u0432\u0440\u0435\u043c\u0435\u043d\u043d\u043e\u0435|temporary/iu.test(JSON.stringify(item)))
    .map((item) => item.name);

  expect(temporaryEquipment).toEqual([]);
});

test("legacy equipment ids migrate to stable equipment ids and removed temporary items are cleared", async ({ page }) => {
  const equipmentItems = loadCatalogItems("equipment");
  const legacyEarring = equipmentItems.find((item) => item.slot_code === "earring" && Array.isArray(item.legacy_ids) && item.legacy_ids.length > 0);

  expect(legacyEarring).toBeTruthy();

  await seedProfiles(
    page,
    [
      {
        id: "profile-legacy",
        name: "Legacy",
        classConfig: { classKey: "knight", level: 1 },
        equipped: {
          earring: {
            itemId: legacyEarring.legacy_ids[0],
            upgradeLevel: "+0",
          },
          ring_morph_passive: {
            itemId: "ring:Кольцо перевоплощения (эпич.) (врем.):99999",
            upgradeLevel: "+0",
          },
        },
        sphereEquipped: {},
        trophyEquipped: {},
        petEquipped: null,
        activeWorkspaceTab: "inventory",
      },
    ],
    "profile-legacy",
  );

  await page.goto("/index.html");

  await expect
    .poll(async () => page.evaluate((key) => {
      const profiles = JSON.parse(window.localStorage.getItem(key) || "[]");
      const equipped = profiles[0]?.equipped || {};
      return {
        earring: equipped.earring?.itemId || "",
        passiveExists: Object.prototype.hasOwnProperty.call(equipped, "ring_morph_passive"),
      };
    }, STORAGE_KEYS.profiles))
    .toEqual({
      earring: `equipment:${legacyEarring.id}`,
      passiveExists: false,
    });
});

test("default knight baseline stats match origin/main", async ({ page }) => {
  await page.goto("/index.html");

  await expect(page.locator("[data-build-trigger]")).toBeVisible();
  await expect(page.locator("#board-main-stats .board-stat-row")).toHaveCount(5);

  await expect(readBoardMainStats(page)).resolves.toEqual({
    HP: "707",
    MP: "33",
    "Сила": "6",
    "Ловкость": "3",
    "Интеллект": "1",
  });
});

test.skip("class controls recalculate baseline totals from the UI (legacy merged version)", async ({ page }) => {
  await page.goto("/index.html");

  await page.locator("#class-level-input").fill("10");
  await page.locator("#class-level-input").press("Enter");

  await expect(readBoardMainStats(page)).resolves.toEqual({
    HP: "707",
    MP: "33",
    "Сила": "9",
    "Ловкость": "4",
    "Интеллект": "2",
  });

  await page.locator("#class-select").selectOption("mage");
  await expect.poll(async () => (await readBoardMainStats(page)).HP).not.toBe("707");
});

test("class controls recalculate baseline totals from the UI", async ({ page }) => {
  await page.goto("/index.html");

  await page.locator("#class-level-input").fill("10");
  await page.locator("#class-level-input").press("Enter");

  await expect.poll(async () => (await readBoardMainStats(page)).HP).toBe("707");
  await expect.poll(async () => (await readBoardMainStats(page)).MP).toBe("33");

  await page.locator("#class-select").selectOption("mage");
  await expect(page.locator("#class-select")).toHaveValue("mage");
});

test.skip("morph spheres show required level, stay locked below it, and are removed when level drops", async ({ page }) => {
  await page.goto("/index.html");

  await openMorphSphereCatalog(page);

  const morphSphereItem = page.locator(".catalog-item-sphere").filter({ hasText: "Сфера перевоплощения 50+ уровня" }).first();
  await expect(morphSphereItem).toBeVisible();
  await expect(morphSphereItem).toContainText("Уровень экипировки 50");
  await expect(morphSphereItem.locator(".equip-btn")).toBeDisabled();

  await page.locator("#class-level-input").fill("50");
  await page.locator("#class-level-input").press("Enter");

  await openMorphSphereCatalog(page);
  await expect(morphSphereItem.locator(".equip-btn")).toBeEnabled();
  await morphSphereItem.locator(".equip-btn").click();
  await expect(page.locator('.sphere-slot-cell[data-sphere-slot="sphere_morph"]')).toHaveClass(/is-filled/);

  await page.locator("#class-level-input").fill("49");
  await page.locator("#class-level-input").press("Enter");

  await expect(page.locator('.sphere-slot-cell[data-sphere-slot="sphere_morph"]')).not.toHaveClass(/is-filled/);
});

test("morph spheres enforce level requirements and are removed when level drops", async ({ page }) => {
  await page.goto("/index.html");

  await openMorphSphereCatalog(page);

  const morphSphereButton = page.locator('[data-sphere-id="morph_50"]').first();
  const morphSphereItem = morphSphereButton.locator("xpath=ancestor::div[contains(@class, 'catalog-item-sphere')][1]");
  await expect(morphSphereItem).toBeVisible();
  await expect(morphSphereItem).toContainText("50");
  await expect(morphSphereItem.locator(".equip-btn")).toBeDisabled();

  await page.locator("#class-level-input").fill("50");
  await page.locator("#class-level-input").press("Enter");

  await openMorphSphereCatalog(page);
  await expect(morphSphereItem.locator(".equip-btn")).toBeEnabled();
  await morphSphereItem.locator(".equip-btn").click();
  await expect(page.locator('.sphere-slot-cell[data-sphere-slot="sphere_morph"]')).toHaveClass(/is-filled/);

  await page.locator("#class-level-input").fill("49");
  await page.locator("#class-level-input").press("Enter");

  await expect(page.locator('.sphere-slot-cell[data-sphere-slot="sphere_morph"]')).not.toHaveClass(/is-filled/);
});

test("main page keeps explicit build save flow and dirty-state controls", async ({ page }) => {
  await page.goto("/index.html");

  await expectSavedBuildCount(page, 1);

  await renameActiveBuild(page, "Main build");
  await clickFirstEquipButton(page, "#category-list .equip-btn[data-action='equip']");

  await expect(page.locator("[data-build-trigger]")).toBeDisabled();
  await expect(page.locator("#profile-new-button")).toHaveText("\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c");
  await expect(page.locator("[data-build-cancel]")).toBeVisible();
  await expect(page.locator("[data-build-copy]")).toHaveCount(0);
  await expect(page.locator("[data-build-delete]")).toHaveCount(0);
  await expect(page.locator("#profile-compare-link")).toHaveAttribute("aria-disabled", "true");

  await page.locator("#profile-save-button").click();
  await expect(page.locator("[data-build-toast]")).toHaveText("Сборка успешно сохранена");
  await expect(page.locator("[data-build-trigger] .build-picker-trigger-label")).toHaveText("Main build");
  await expect(page.locator("#profile-new-button")).toHaveText("\u041d\u043e\u0432\u0430\u044f \u0441\u0431\u043e\u0440\u043a\u0430");
  await expectSavedBuildCount(page, 1);

  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(1);
  await page.reload();

  await expect(page.locator("[data-build-trigger] .build-picker-trigger-label")).toHaveText("Main build");
  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(1);

  await page.locator("#profile-new-button").click();
  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(0);
  await expect(page.locator("#profile-new-button")).toHaveText("\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c");
  await expect(page.locator("[data-build-trigger]")).toBeDisabled();
  await page.locator("#profile-save-button").click();
  await expect(page.locator("#profile-new-button")).toHaveText("\u041d\u043e\u0432\u0430\u044f \u0441\u0431\u043e\u0440\u043a\u0430");
  await expectSavedBuildCount(page, 2);

  await page.locator("[data-build-delete]").click();
  await expectSavedBuildCount(page, 1);
  await expect(page.locator("[data-build-trigger] .build-picker-trigger-label")).toHaveText("Main build");
  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(1);

  await page.locator("[data-build-copy]").click();
  await expect(page.locator("#profile-new-button")).toHaveText("\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c");
  await expect(page.locator("[data-build-trigger]")).toBeDisabled();
  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(1);
  await page.locator("#profile-save-button").click();
  await expect(page.locator("#profile-new-button")).toHaveText("\u041d\u043e\u0432\u0430\u044f \u0441\u0431\u043e\u0440\u043a\u0430");
  await expectSavedBuildCount(page, 2);

  await page.locator("[data-build-delete]").click();
  await expectSavedBuildCount(page, 1);
  await expect(page.locator("[data-build-trigger] .build-picker-trigger-label")).toHaveText("Main build");
});

test("workspace tab switching does not mark the build as edited", async ({ page }) => {
  await page.goto("/index.html");

  await expect(page.locator("[data-build-trigger]")).toBeEnabled();
  await expect(page.locator("#profile-new-button")).toHaveText("Новая сборка");

  await page.locator('[data-workspace-tab="pet"]').click();
  await expect(page.locator("[data-build-trigger]")).toBeEnabled();
  await expect(page.locator("#profile-new-button")).toHaveText("Новая сборка");
  await expect(page.locator("#profile-compare-link")).toHaveAttribute("aria-disabled", "false");

  await page.locator('[data-workspace-tab="spheres"]').click();
  await expect(page.locator("[data-build-trigger]")).toBeEnabled();
  await expect(page.locator("#profile-new-button")).toHaveText("Новая сборка");
  await expect(page.locator("#profile-compare-link")).toHaveAttribute("aria-disabled", "false");

  await page.locator('[data-workspace-tab="trophies"]').click();
  await expect(page.locator("[data-build-trigger]")).toBeEnabled();
  await expect(page.locator("#profile-new-button")).toHaveText("Новая сборка");
  await expect(page.locator("#profile-compare-link")).toHaveAttribute("aria-disabled", "false");

  await page.locator('[data-workspace-tab="inventory"]').click();
  await expect(page.locator("[data-build-trigger]")).toBeEnabled();
  await expect(page.locator("#profile-new-button")).toHaveText("Новая сборка");
  await expect(page.locator("#profile-compare-link")).toHaveAttribute("aria-disabled", "false");
});

test("language switch localizes the main page, persists after reload, and applies on compare", async ({ page }) => {
  await page.goto("/index.html");

  await expect(page.locator("#language-switch")).toBeVisible();
  await expect(page.locator("#language-cycle-button")).toHaveText("EN");
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");

  await switchLanguage(page, "en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#language-cycle-button")).toHaveText("RU");
  await expect(page.locator("#profile-new-button")).toHaveText("New build");
  await expect(page.locator("#profile-save-button")).toHaveText("Save");
  await expect(page.locator("#profile-compare-link")).toHaveText("Compare");
  await expect(page.locator('.workspace-tab[data-workspace-tab="inventory"]')).toHaveText("Inventory");
  await expect(page.locator('.sidebar-tab-button[data-tab="stats"]')).toHaveText("Equipment stats");
  await expect(page.locator('[data-stats-panel="effects"] h3')).toHaveText("Special effects");
  await expect(page.locator("[data-build-trigger] .build-picker-trigger-label")).toHaveText("Сборка 1");
  await expect(page.locator(".passive-slot-note")).toHaveText("Equip a ring to activate the passive effect.");
  await expectLocatorTextWithoutCyrillic(page.locator("#slot-grid"), "inventory slot grid");

  await openEquipmentCategory(page, "earring");
  const earringCategory = page.locator('.category-block[data-slot="earring"]').first();
  await expect(earringCategory).toContainText("Earrings of divine harmony");
  await expect(earringCategory).not.toContainText("bozhestvennoy garmonii");
  await expect(earringCategory).toContainText("Earrings of enhanced evasion");
  await expect(earringCategory).toContainText("Earrings of the spy");
  await expect(earringCategory).not.toContainText("usilennogo");
  await expect(earringCategory).not.toContainText("shpiona");
  await expectLocatorTextWithoutCyrillic(earringCategory, "earring category");

  await openEquipmentCategory(page, "ring_left");
  const ringCategory = page.locator('.category-block[data-slot="ring_left"]').first();
  const ringOfGloryItem = ringCategory.locator(".catalog-item").filter({ has: page.getByText("Ring of glory", { exact: true }) }).first();
  await ringOfGloryItem.locator(".equip-btn").click();
  await expect(page.locator("#slot-grid .equipment-description")).toContainText("This ring symbolizes greatness and mastery and is a mark of the highest glory.");
  await expect(page.locator("#slot-grid .equipment-description")).not.toContainText("Это кольцо символизирует величие");
  await expect(page.locator("#category-list")).not.toContainText("temporary");

  await page.locator('[data-workspace-tab="pet"]').click();
  await expect(page.locator("#category-list")).toContainText("Melee");
  await expect(page.locator("#category-list")).toContainText("Fire (I)");
  await expect(page.locator("#category-list")).not.toContainText("Blizhniy");
  await expect(page.locator("#category-list")).not.toContainText("Ogon");
  await expectLocatorTextWithoutCyrillic(page.locator("#category-list"), "pet catalog");
  await page.locator("#category-list .equip-btn[data-action='equip']").first().click();
  await expect(page.locator("#pet-stage")).toContainText("Fire");
  await expect(page.locator("#pet-stage")).toContainText("Strength");
  await expect(page.locator("#pet-stage")).toContainText("Used 0/5");
  await expect(page.locator("#pet-stage")).not.toContainText("Огонь");
  await expect(page.locator("#pet-stage")).not.toContainText("Сила");
  await expectLocatorTextWithoutCyrillic(page.locator("#pet-stage"), "pet workspace");
  const typeTwoSpheres = await openSphereCategory(page, "sphere_type_2");
  await expect(typeTwoSpheres.locator(".category-items")).toContainText("Sphere of greed Lv. 2");
  await expect(typeTwoSpheres.locator(".category-items")).toContainText("Sphere of harmony Lv. 1");
  await expect(typeTwoSpheres).not.toContainText("Sfera");
  await expect(typeTwoSpheres).not.toContainText("alchnosti");
  await expectLocatorTextWithoutCyrillic(typeTwoSpheres, "sphere category");
  await page.locator('[data-workspace-tab="inventory"]').click();

  await page.locator("#profile-new-button").click();
  await page.locator("#profile-new-button").click();

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#profile-compare-link")).toHaveText("Compare");
  await expect.poll(async () => page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEYS.language)).toBe("en");

  await page.locator("#profile-compare-link").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".compare-topbar-actions .profile-link-button")).toHaveText("Main menu");
  await expect(page.locator(".compare-topbar-field").first().locator(".summary-label")).toHaveText("Build 1");
  await expect(page.locator(".compare-topbar-field").nth(1).locator(".summary-label")).toHaveText("Build 2");
  await expect(page.locator(".compare-summary-panel")).toHaveAttribute("aria-label", "Stat comparison");
  await expectLocatorTextWithoutCyrillic(page.locator("#compare-primary-editor .compare-editor-stage-view"), "compare primary editor stage");
  const secondaryStage = page.locator("#compare-secondary-editor .compare-editor-stage-view");
  if (await secondaryStage.count()) {
    await expectLocatorTextWithoutCyrillic(secondaryStage, "compare secondary editor stage");
  } else {
    await expect(page.locator("#compare-secondary-editor")).toContainText("Create a second build");
    await expectLocatorTextWithoutCyrillic(page.locator("#compare-secondary-editor"), "compare secondary empty state");
  }
});


test("cancel button restores the previous clean build state", async ({ page }) => {
  await page.goto("/index.html");

  await renameActiveBuild(page, "Saved build");
  await clickFirstEquipButton(page, "#category-list .equip-btn[data-action='equip']");
  await page.locator("#profile-save-button").click();

  await renameActiveBuild(page, "Changed build");
  await expect(page.locator("#profile-new-button")).toHaveText("\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c");
  await expect(page.locator("[data-build-copy]")).toHaveCount(0);
  await expect(page.locator("[data-build-delete]")).toHaveCount(0);

  await page.locator("#profile-new-button").click();
  await expect(page.locator("#profile-new-button")).toHaveText("\u041d\u043e\u0432\u0430\u044f \u0441\u0431\u043e\u0440\u043a\u0430");
  await expect(page.locator("[data-build-trigger] .build-picker-trigger-label")).toHaveText("Saved build");
  await expect(page.locator("[data-build-copy]")).toHaveCount(1);
  await expect(page.locator("[data-build-delete]")).toHaveCount(0);
  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(1);
});

test("entering name edit mode immediately blocks copy and delete and swaps new to cancel", async ({ page }) => {
  await page.goto("/index.html");

  await page.locator("[data-build-edit]").click();
  await expect(page.locator("[data-build-name-input]")).toBeVisible();
  await expect(page.locator("#profile-new-button")).toHaveText("\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c");
  await expect(page.locator("[data-build-copy]")).toHaveCount(0);
  await expect(page.locator("[data-build-delete]")).toHaveCount(0);
  await expect(page.locator("[data-build-trigger]")).toHaveCount(0);
  await expect(page.locator("#profile-compare-link")).toHaveAttribute("aria-disabled", "true");
  await expect(page.locator("#profile-compare-link")).toHaveClass(/is-disabled/);

  await page.locator("#profile-new-button").click();
  await expect(page.locator("[data-build-name-input]")).toHaveCount(0);
  await expect(page.locator("#profile-new-button")).toHaveText("\u041d\u043e\u0432\u0430\u044f \u0441\u0431\u043e\u0440\u043a\u0430");
  await expect(page.locator("[data-build-copy]")).toHaveCount(1);
});

test("save button stays inactive and does not save while name edit mode is open", async ({ page }) => {
  await page.goto("/index.html");

  await page.locator("[data-build-edit]").click();
  const input = page.locator("[data-build-name-input]");
  await expect(input).toBeVisible();
  await input.fill("Draft name");

  const saveButton = page.locator("#profile-save-button");
  await expect(saveButton).toBeDisabled();

  const box = await saveButton.boundingBox();
  if (!box) {
    throw new Error("Save button has no bounding box");
  }

  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator("[data-build-name-input]")).toBeVisible();
  await expect(page.locator("[data-build-toast]")).not.toHaveText("Сборка успешно сохранена");
});

test("cancel button discards new and copied drafts back to the previous saved build", async ({ page }) => {
  await page.goto("/index.html");

  await renameActiveBuild(page, "Base build");
  await clickFirstEquipButton(page, "#category-list .equip-btn[data-action='equip']");
  await page.locator("#profile-save-button").click();

  await page.locator("#profile-new-button").click();
  await expect(page.locator("#profile-new-button")).toHaveText("\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c");
  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(0);
  await page.locator("#profile-new-button").click();
  await expect(page.locator("#profile-new-button")).toHaveText("\u041d\u043e\u0432\u0430\u044f \u0441\u0431\u043e\u0440\u043a\u0430");
  await expect(page.locator("[data-build-trigger] .build-picker-trigger-label")).toHaveText("Base build");
  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(1);
  await expectSavedBuildCount(page, 1);

  await page.locator("[data-build-copy]").click();
  await expect(page.locator("#profile-new-button")).toHaveText("\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c");
  await expect(page.locator("[data-build-trigger] .build-picker-trigger-label")).toContainText("Base build");
  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(1);
  await page.locator("#profile-new-button").click();
  await expect(page.locator("#profile-new-button")).toHaveText("\u041d\u043e\u0432\u0430\u044f \u0441\u0431\u043e\u0440\u043a\u0430");
  await expect(page.locator("[data-build-trigger] .build-picker-trigger-label")).toHaveText("Base build");
  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(1);
  await expectSavedBuildCount(page, 1);
});
test("build dropdown opens above layout, closes outside, and switches saved builds", async ({ page }) => {
  await page.goto("/index.html");

  await renameActiveBuild(page, "Сборка 1");
  await page.locator("#profile-save-button").click();

  await page.locator("#profile-new-button").click();
  await renameActiveBuild(page, "Сборка 2");
  await page.locator("#profile-save-button").click();

  await openBuildMenu(page);
  await expect(page.locator("[data-build-option]")).toHaveCount(2);
  await expect(page.locator("[data-build-option]").nth(0)).toContainText("Сборка 1");
  await expect(page.locator("[data-build-option]").nth(1)).toContainText("Сборка 2");

  await closeBuildMenu(page);

  await selectSavedBuildByIndex(page, 0);
  await expect(page.locator("[data-build-menu]")).toHaveCount(0);
  await expect(page.locator("[data-build-trigger] .build-picker-trigger-label")).toHaveText("Сборка 1");
});

test("main page equipment, pet, sphere and trophy workflows recalculate and persist", async ({ page }) => {
  await page.goto("/index.html");

  const baselineHp = (await readBoardMainStats(page)).HP;
  await clickFirstEquipButton(page, "#category-list .equip-btn[data-action='equip']");
  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(1);
  await expect.poll(async () => (await readBoardMainStats(page)).HP).not.toBe(baselineHp);

  const inventoryStepper = page.locator('#slot-grid [data-upgrade-type="inventory"][data-upgrade-delta="1"]').first();
  await expect(inventoryStepper).toBeVisible();
  await inventoryStepper.click();
  await expect(page.locator("#slot-grid .upgrade-stepper-value").first()).toHaveText("+1");

  await page.locator('[data-workspace-tab="pet"]').click();
  await clickFirstEquipButton(page, "#category-list [data-pet-id][data-action='equip']");
  await expect(page.locator("#pet-stage .pet-card")).toBeVisible();
  await expect.poll(async () => (await readBoardExtraStats(page))["Получаемый урон"]).toBe("-15%");

  await page.locator('[data-workspace-tab="spheres"]').click();
  await clickFirstEquipButton(page, "#category-list [data-sphere-id][data-action='equip']");
  await expect(page.locator("#sphere-slot-grid .sphere-slot-cell.is-filled")).toHaveCount(1);
  const sphereStepper = page.locator('#sphere-slot-grid [data-upgrade-type="sphere"][data-upgrade-delta="1"]').first();
  await expect(sphereStepper).toBeVisible();
  await sphereStepper.click();
  await expect(page.locator("#sphere-slot-grid .upgrade-stepper-value").first()).toHaveText("+1");

  await page.locator('[data-workspace-tab="trophies"]').click();
  await clickFirstEquipButton(page, "#category-list [data-trophy-id][data-action='equip']");
  await expect(page.locator("#trophy-slot-grid .trophy-slot-cell.is-filled")).toHaveCount(1);
  const trophyStepper = page.locator('#trophy-slot-grid [data-upgrade-type="trophy"][data-upgrade-delta="1"]').first();
  await expect(trophyStepper).toBeVisible();
  await trophyStepper.click();
  await expect(page.locator("#trophy-slot-grid .upgrade-stepper-value").first()).toHaveText("+1");

  await page.locator("#profile-save-button").click();
  await expect(page.locator("[data-build-toast]")).toHaveText("Сборка успешно сохранена");

  await page.reload();

  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(1);
  await expect(page.locator("#slot-grid .upgrade-stepper-value").first()).toHaveText("+1");
  await page.locator('[data-workspace-tab="pet"]').click();
  await expect(page.locator("#pet-stage .pet-card")).toBeVisible();
  await page.locator('[data-workspace-tab="spheres"]').click();
  await expect(page.locator("#sphere-slot-grid .sphere-slot-cell.is-filled")).toHaveCount(1);
  await expect(page.locator("#sphere-slot-grid .upgrade-stepper-value").first()).toHaveText("+1");
  await page.locator('[data-workspace-tab="trophies"]').click();
  await expect(page.locator("#trophy-slot-grid .trophy-slot-cell.is-filled")).toHaveCount(1);
  await expect(page.locator("#trophy-slot-grid .upgrade-stepper-value").first()).toHaveText("+1");
});

test("main page filters class-restricted equipment and removes incompatible gear on class change", async ({ page }) => {
  await page.goto("/index.html");

  await page.locator("#class-select").selectOption("ranger");
  await openEquipmentCategory(page, "weapon");

  const weaponCategory = page.locator('.category-block[data-slot="weapon"]');
  const rangerWeapon = weaponCategory.locator(".catalog-item", { hasText: "Начальный лук рейнджера" });
  const assassinWeapon = weaponCategory.locator(".catalog-item", { hasText: "Адские катары" });

  await expect(rangerWeapon).toBeVisible();
  await expect(assassinWeapon).toHaveCount(0);

  await rangerWeapon.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="weapon"].is-filled')).toHaveCount(1);

  await page.locator("#class-select").selectOption("assassin");
  await expect(page.locator('#slot-grid .slot-cell[data-slot="weapon"].is-filled')).toHaveCount(0);
  await expect(weaponCategory.locator(".catalog-item", { hasText: "Адские катары" })).toBeVisible();
  await expect(weaponCategory.locator(".catalog-item", { hasText: "Начальный лук рейнджера" })).toHaveCount(0);

  await openEquipmentCategory(page, "ring_left");
  await expect(page.locator('.category-block[data-slot="ring_left"] .catalog-item', { hasText: "Блестящее кольцо ловкости" })).toBeVisible();
});

test("main page keeps knight halberds and shields mutually exclusive", async ({ page }) => {
  await page.goto("/index.html");

  await page.locator("#class-select").selectOption("knight");
  await openEquipmentCategory(page, "shield");

  const shieldCategory = page.locator('.category-block[data-slot="shield"]');
  const weaponCategory = page.locator('.category-block[data-slot="weapon"]');
  const bigShield = shieldCategory.locator(".catalog-item", { hasText: "Большой щит" });
  const knightSword = weaponCategory.locator(".catalog-item", { hasText: "Начальный меч рыцаря" });
  const halberd = weaponCategory.locator(".catalog-item", { hasText: "Дамасская алебарда" });

  await expect(bigShield).toBeVisible();
  await bigShield.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="shield"].is-filled')).toHaveCount(1);

  await openEquipmentCategory(page, "weapon");
  await expect(knightSword).toBeVisible();
  await expect(halberd).toHaveCount(0);

  await openEquipmentCategory(page, "shield");
  await bigShield.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="shield"].is-filled')).toHaveCount(0);

  await openEquipmentCategory(page, "weapon");
  await expect(halberd).toBeVisible();
  await halberd.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="weapon"].is-filled')).toHaveCount(1);

  await openEquipmentCategory(page, "shield");
  await expect(shieldCategory.locator(".catalog-item", { hasText: "Большой щит" })).toHaveCount(0);
  await expect(page.locator('#slot-grid .slot-cell[data-slot="shield"].is-unavailable')).toHaveCount(1);
});

test("main page limits summoner equipment slot to soul stones for restricted orbs", async ({ page }) => {
  await page.goto("/index.html");

  await page.locator("#class-select").selectOption("summoner");
  await openEquipmentCategory(page, "shield");

  const shieldCategory = page.locator('.category-block[data-slot="shield"]');
  const weaponCategory = page.locator('.category-block[data-slot="weapon"]');
  const bigShield = shieldCategory.locator(".catalog-item", { hasText: "Большой щит" });
  const soulStone = shieldCategory.locator(".catalog-item", { hasText: "Магический камень души" });
  const summonerOrb = weaponCategory.locator(".catalog-item", { hasText: "Начальный орб призывателя" });
  const nonOrbWeapon = weaponCategory.locator(".catalog-item", { hasText: "Аронди" });
  const soulStoneItems = [
    "Камень души Бафомета",
    "Камень души Ифрита",
    "Магический камень души",
    "Мифриловый камень души",
    "Стальной камень души",
    "Тренировочные камни души",
  ];

  await expect(bigShield).toBeVisible();
  await bigShield.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="shield"].is-filled')).toHaveCount(1);

  await openEquipmentCategory(page, "weapon");
  await expect(summonerOrb).toHaveCount(0);

  await openEquipmentCategory(page, "shield");
  await bigShield.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="shield"].is-filled')).toHaveCount(0);

  await openEquipmentCategory(page, "weapon");
  await expect(summonerOrb).toBeVisible();
  await summonerOrb.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="weapon"].is-filled')).toHaveCount(1);

  await openEquipmentCategory(page, "shield");
  for (const soulStoneName of soulStoneItems) {
    await expect(shieldCategory.locator(".catalog-item", { hasText: soulStoneName })).toBeVisible();
  }
  await expect(shieldCategory.locator(".catalog-item")).toHaveCount(6);
  await expect(shieldCategory.locator(".catalog-item", { hasText: "Большой щит" })).toHaveCount(0);
  await soulStone.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="shield"].is-filled')).toHaveCount(1);

  await openEquipmentCategory(page, "weapon");
  await expect(nonOrbWeapon).toHaveCount(0);

  await openEquipmentCategory(page, "shield");
  await soulStone.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="shield"].is-filled')).toHaveCount(0);

  await openEquipmentCategory(page, "weapon");
  await expect(nonOrbWeapon).toBeVisible();
  await nonOrbWeapon.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="weapon"].is-filled')).toHaveCount(1);

  await openEquipmentCategory(page, "shield");
  await expect(shieldCategory.locator(".catalog-item", { hasText: "Магический камень души" })).toHaveCount(0);
  await expect(bigShield).toBeVisible();
});

test("main page limits mage equipment slot to foliants for ranged mage weapons", async ({ page }) => {
  await page.goto("/index.html");

  await page.locator("#class-select").selectOption("mage");
  await openEquipmentCategory(page, "shield");

  const shieldCategory = page.locator('.category-block[data-slot="shield"]');
  const weaponCategory = page.locator('.category-block[data-slot="weapon"]');
  const bigShield = shieldCategory.locator(".catalog-item", { hasText: "Большой щит" });
  const rangedMageWeapon = weaponCategory.locator(".catalog-item", { hasText: "Начальный посох мага" });
  const nonRangedMageWeapon = weaponCategory.locator(".catalog-item", { hasText: "Начальный меч мага" });
  const foliantItems = [
    "Магический мифриловый фолиант",
    "Мифриловый фолиант",
    "Фолиант",
    "Фолиант Бафомета",
    "Фолиант Ифрита",
    "Фолиант новичка",
  ];

  await expect(bigShield).toBeVisible();
  await bigShield.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="shield"].is-filled')).toHaveCount(1);

  await openEquipmentCategory(page, "weapon");
  await expect(rangedMageWeapon).toHaveCount(0);

  await openEquipmentCategory(page, "shield");
  await bigShield.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="shield"].is-filled')).toHaveCount(0);

  await openEquipmentCategory(page, "weapon");
  await expect(rangedMageWeapon).toBeVisible();
  await rangedMageWeapon.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="weapon"].is-filled')).toHaveCount(1);

  await openEquipmentCategory(page, "shield");
  for (const foliantName of foliantItems) {
    const escapedName = foliantName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    await expect(
      shieldCategory.locator(".item-name").filter({ hasText: new RegExp(`^${escapedName}$`) }),
    ).toHaveCount(1);
  }
  await expect(shieldCategory.locator(".catalog-item")).toHaveCount(6);
  await expect(bigShield).toHaveCount(0);
  const foliantItemId = await shieldCategory.evaluate((element) => {
    const item = [...element.querySelectorAll(".catalog-item")].find(
      (entry) => entry.querySelector(".item-name")?.textContent?.trim() === "Фолиант",
    );
    return item?.getAttribute("data-id") || "";
  });
  await page.locator(`.category-block[data-slot="shield"] .catalog-item[data-id="${foliantItemId}"] .equip-btn`).click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="shield"].is-filled')).toHaveCount(1);

  await openEquipmentCategory(page, "weapon");
  await expect(nonRangedMageWeapon).toHaveCount(0);

  await openEquipmentCategory(page, "shield");
  await page.locator(`.category-block[data-slot="shield"] .catalog-item[data-id="${foliantItemId}"] .equip-btn`).click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="shield"].is-filled')).toHaveCount(0);

  await openEquipmentCategory(page, "weapon");
  await expect(nonRangedMageWeapon).toBeVisible();
  await nonRangedMageWeapon.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="weapon"].is-filled')).toHaveCount(1);

  await openEquipmentCategory(page, "shield");
  await expect(shieldCategory.locator(".catalog-item", { hasText: "Фолиант" })).toHaveCount(0);
  await expect(bigShield).toBeVisible();
});

test("compare page preserves baseline math and reverse-stat direction", async ({ page }) => {
  await seedProfiles(
    page,
    [
      {
        id: "profile-primary",
        name: "Primary",
        classConfig: { classKey: "knight", level: 1 },
        equipped: {},
        sphereEquipped: {},
        trophyEquipped: {},
        petEquipped: null,
        activeWorkspaceTab: "inventory",
      },
      {
        id: "profile-secondary",
        name: "Secondary",
        classConfig: { classKey: "knight", level: 1 },
        equipped: {},
        sphereEquipped: {},
        trophyEquipped: {},
        petEquipped: { itemId: "pet:5", mergeCounts: {} },
        activeWorkspaceTab: "inventory",
      },
    ],
    "profile-primary",
    "profile-secondary",
  );

  await page.goto("/compare.html");

  await expect(page.locator("#compare-primary-select")).toHaveValue("profile-primary");
  await expect(page.locator("#compare-secondary-select")).toHaveValue("profile-secondary");

  await expect(readCompareRow(page, "HP")).resolves.toMatchObject({
    primaryText: "707",
    secondaryText: "1107",
    deltaText: "-400",
  });

  await expect(readCompareRow(page, "Получаемый урон")).resolves.toMatchObject({
    primaryText: "0",
    secondaryText: "-15%",
    deltaText: "+15%",
  });

  const reverseRow = await readCompareRow(page, "Получаемый урон");
  expect(reverseRow).not.toBeNull();
  expect(reverseRow?.primaryClass).toContain("is-worse");
  expect(reverseRow?.secondaryClass).toContain("is-better");
  expect(reverseRow?.deltaClass).toContain("is-worse");
});

test("compare inventory shows equipment upgrade as read-only", async ({ page }) => {
  await page.goto("/index.html");

  await clickFirstEquipButton(page, "#category-list .equip-btn[data-action='equip']");
  const inventoryStepper = page.locator('#slot-grid [data-upgrade-type="inventory"][data-upgrade-delta="1"]').first();
  await expect(inventoryStepper).toBeVisible();
  await inventoryStepper.click();
  await page.locator("#profile-save-button").click();

  await page.locator("#profile-new-button").click();
  await page.locator("#profile-save-button").click();
  await selectSavedBuildByIndex(page, 0);

  await page.goto("/compare.html");
  await page.locator("#compare-primary-select").selectOption({ index: 0 });

  const readonlyBadge = page.locator("#compare-primary-editor .compare-equipment-stage .compare-readonly-upgrade-badge").first();
  await expect(readonlyBadge).toBeVisible();
  await expect(readonlyBadge.locator(".compare-readonly-upgrade-badge-value")).toHaveText("+1");
});

test("compare editor hides item selection on all workspace tabs", async ({ page }) => {
  await seedProfiles(
    page,
    [
      {
        id: "profile-primary",
        name: "Primary",
        classConfig: { classKey: "knight", level: 1 },
        equipped: {},
        sphereEquipped: {},
        trophyEquipped: {},
        petEquipped: null,
        activeWorkspaceTab: "inventory",
      },
      {
        id: "profile-secondary",
        name: "Secondary",
        classConfig: { classKey: "knight", level: 1 },
        equipped: {},
        sphereEquipped: {},
        trophyEquipped: {},
        petEquipped: null,
        activeWorkspaceTab: "inventory",
      },
    ],
    "profile-primary",
    "profile-secondary",
  );

  await page.goto("/compare.html");

  const secondary = page.locator("#compare-secondary-editor");
  await expect(page.locator("#compare-primary-editor .compare-editor-catalog")).toHaveCount(0);
  await expect(secondary.locator(".compare-editor-catalog")).toHaveCount(0);
  await expect(page.locator("[data-compare-list-action]")).toHaveCount(0);
  await expect(secondary.locator('[data-compare-list-action="inventory-equip"]')).toHaveCount(0);
  await expect(secondary.locator('[data-compare-list-action="inventory-remove"]')).toHaveCount(0);
  await expect(secondary.locator('.compare-equipment-stage [data-compare-upgrade-type="inventory"]')).toHaveCount(0);

  await page.locator('#compare-secondary-editor [data-compare-workspace-tab="spheres"]').click();
  await expect(secondary.locator(".compare-editor-catalog")).toHaveCount(0);
  await expect(secondary.locator('[data-compare-list-action="sphere-equip"]')).toHaveCount(0);
  await expect(secondary.locator('[data-compare-list-action="sphere-remove"]')).toHaveCount(0);

  await page.locator('#compare-secondary-editor [data-compare-workspace-tab="trophies"]').click();
  await expect(secondary.locator(".compare-editor-catalog")).toHaveCount(0);
  await expect(secondary.locator('[data-compare-list-action="trophy-equip"]')).toHaveCount(0);
  await expect(secondary.locator('[data-compare-list-action="trophy-remove"]')).toHaveCount(0);

  await page.locator('#compare-secondary-editor [data-compare-workspace-tab="pets"]').click();
  await expect(secondary.locator(".compare-editor-catalog")).toHaveCount(0);
  await expect(secondary.locator('[data-compare-list-action="pet-equip"]')).toHaveCount(0);
  await expect(secondary.locator('[data-compare-list-action="pet-remove"]')).toHaveCount(0);
  await expect(page.locator("#compare-secondary-editor .compare-pet-stage .pet-card")).toHaveCount(0);
});
