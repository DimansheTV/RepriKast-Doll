import { execSync } from "node:child_process";
import { expect, test, type Page } from "@playwright/test";

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
};

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
  const button = page.locator(selector).first();
  await expect(button).toBeVisible();
  await button.click();
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

test("class controls recalculate baseline totals from the UI", async ({ page }) => {
  await page.goto("/index.html");

  await page.locator("#class-level-input").fill("10");
  await page.locator("#class-level-input").press("Enter");

  await expect(readBoardMainStats(page)).resolves.toEqual({
    HP: "758",
    MP: "44",
    "Сила": "9",
    "Ловкость": "4",
    "Интеллект": "2",
  });

  await page.locator("#class-select").selectOption("mage");
  await expect.poll(async () => (await readBoardMainStats(page)).HP).not.toBe("758");
});

test("main page keeps explicit build save flow and dirty-state controls", async ({ page }) => {
  await page.goto("/index.html");

  await expectSavedBuildCount(page, 1);

  await renameActiveBuild(page, "Main build");
  await clickFirstEquipButton(page, "#category-list .equip-btn[data-action='equip']");

  await expect(page.locator("[data-build-trigger]")).toBeDisabled();
  await expect(page.locator("#profile-new-button")).toBeDisabled();
  await expect(page.locator("[data-build-copy]")).toBeDisabled();
  await expect(page.locator("[data-build-delete]")).toBeDisabled();
  await expect(page.locator("#profile-compare-link")).toHaveAttribute("aria-disabled", "true");

  await page.locator("#profile-save-button").click();
  await expect(page.locator("[data-build-toast]")).toHaveText("Сборка успешно сохранена");
  await expect(page.locator("[data-build-trigger] .build-picker-trigger-label")).toHaveText("Main build");
  await expectSavedBuildCount(page, 1);

  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(1);
  await page.reload();

  await expect(page.locator("[data-build-trigger] .build-picker-trigger-label")).toHaveText("Main build");
  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(1);

  await page.locator("#profile-new-button").click();
  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(0);
  await expect(page.locator("[data-build-trigger]")).toBeDisabled();
  await page.locator("#profile-save-button").click();
  await expectSavedBuildCount(page, 2);

  await page.locator("[data-build-delete]").click();
  await expectSavedBuildCount(page, 1);
  await expect(page.locator("[data-build-trigger] .build-picker-trigger-label")).toHaveText("Main build");
  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(1);

  await page.locator("[data-build-copy]").click();
  await expect(page.locator("[data-build-trigger]")).toBeDisabled();
  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(1);
  await page.locator("#profile-save-button").click();
  await expectSavedBuildCount(page, 2);

  await page.locator("[data-build-delete]").click();
  await expectSavedBuildCount(page, 1);
  await expect(page.locator("[data-build-trigger] .build-picker-trigger-label")).toHaveText("Main build");
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
  await page.locator('.category-header[data-slot="weapon"]').click();

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

  await page.locator('.category-header[data-slot="ring_left"]').click();
  await expect(page.locator('.category-block[data-slot="ring_left"] .catalog-item', { hasText: "Блестящее кольцо ловкости" })).toBeVisible();
});

test("main page keeps knight halberds and shields mutually exclusive", async ({ page }) => {
  await page.goto("/index.html");

  await page.locator("#class-select").selectOption("knight");
  await page.locator('.category-header[data-slot="shield"]').click();

  const shieldCategory = page.locator('.category-block[data-slot="shield"]');
  const weaponCategory = page.locator('.category-block[data-slot="weapon"]');
  const bigShield = shieldCategory.locator(".catalog-item", { hasText: "Большой щит" });
  const knightSword = weaponCategory.locator(".catalog-item", { hasText: "Начальный меч рыцаря" });
  const halberd = weaponCategory.locator(".catalog-item", { hasText: "Дамасская алебарда" });

  await expect(bigShield).toBeVisible();
  await bigShield.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="shield"].is-filled')).toHaveCount(1);

  await page.locator('.category-header[data-slot="weapon"]').click();
  await expect(knightSword).toBeVisible();
  await expect(halberd).toHaveCount(0);

  await page.locator('.category-header[data-slot="shield"]').click();
  await bigShield.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="shield"].is-filled')).toHaveCount(0);

  await page.locator('.category-header[data-slot="weapon"]').click();
  await expect(halberd).toBeVisible();
  await halberd.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="weapon"].is-filled')).toHaveCount(1);

  await page.locator('.category-header[data-slot="shield"]').click();
  await expect(shieldCategory.locator(".catalog-item", { hasText: "Большой щит" })).toHaveCount(0);
  await expect(page.locator('#slot-grid .slot-cell[data-slot="shield"].is-unavailable')).toHaveCount(1);
});

test("main page limits summoner equipment slot to soul stones for restricted orbs", async ({ page }) => {
  await page.goto("/index.html");

  await page.locator("#class-select").selectOption("summoner");
  await page.locator('.category-header[data-slot="shield"]').click();

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

  await page.locator('.category-header[data-slot="weapon"]').click();
  await expect(summonerOrb).toHaveCount(0);

  await page.locator('.category-header[data-slot="shield"]').click();
  await bigShield.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="shield"].is-filled')).toHaveCount(0);

  await page.locator('.category-header[data-slot="weapon"]').click();
  await expect(summonerOrb).toBeVisible();
  await summonerOrb.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="weapon"].is-filled')).toHaveCount(1);

  await page.locator('.category-header[data-slot="shield"]').click();
  for (const soulStoneName of soulStoneItems) {
    await expect(shieldCategory.locator(".catalog-item", { hasText: soulStoneName })).toBeVisible();
  }
  await expect(shieldCategory.locator(".catalog-item")).toHaveCount(6);
  await expect(shieldCategory.locator(".catalog-item", { hasText: "Большой щит" })).toHaveCount(0);
  await soulStone.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="shield"].is-filled')).toHaveCount(1);

  await page.locator('.category-header[data-slot="weapon"]').click();
  await expect(nonOrbWeapon).toHaveCount(0);

  await page.locator('.category-header[data-slot="shield"]').click();
  await soulStone.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="shield"].is-filled')).toHaveCount(0);

  await page.locator('.category-header[data-slot="weapon"]').click();
  await expect(nonOrbWeapon).toBeVisible();
  await nonOrbWeapon.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="weapon"].is-filled')).toHaveCount(1);

  await page.locator('.category-header[data-slot="shield"]').click();
  await expect(shieldCategory.locator(".catalog-item", { hasText: "Магический камень души" })).toHaveCount(0);
  await expect(bigShield).toBeVisible();
});

test("main page limits mage equipment slot to foliants for ranged mage weapons", async ({ page }) => {
  await page.goto("/index.html");

  await page.locator("#class-select").selectOption("mage");
  await page.locator('.category-header[data-slot="shield"]').click();

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

  await page.locator('.category-header[data-slot="weapon"]').click();
  await expect(rangedMageWeapon).toHaveCount(0);

  await page.locator('.category-header[data-slot="shield"]').click();
  await bigShield.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="shield"].is-filled')).toHaveCount(0);

  await page.locator('.category-header[data-slot="weapon"]').click();
  await expect(rangedMageWeapon).toBeVisible();
  await rangedMageWeapon.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="weapon"].is-filled')).toHaveCount(1);

  await page.locator('.category-header[data-slot="shield"]').click();
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

  await page.locator('.category-header[data-slot="weapon"]').click();
  await expect(nonRangedMageWeapon).toHaveCount(0);

  await page.locator('.category-header[data-slot="shield"]').click();
  await page.locator(`.category-block[data-slot="shield"] .catalog-item[data-id="${foliantItemId}"] .equip-btn`).click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="shield"].is-filled')).toHaveCount(0);

  await page.locator('.category-header[data-slot="weapon"]').click();
  await expect(nonRangedMageWeapon).toBeVisible();
  await nonRangedMageWeapon.locator(".equip-btn").click();
  await expect(page.locator('#slot-grid .slot-cell[data-slot="weapon"].is-filled')).toHaveCount(1);

  await page.locator('.category-header[data-slot="shield"]').click();
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
