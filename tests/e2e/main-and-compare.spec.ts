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

test("default knight baseline stats match origin/main", async ({ page }) => {
  await page.goto("/index.html");

  await expect(page.locator("#profile-select")).toBeVisible();
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

test("main page keeps equipment after reload and supports profile create/copy/delete", async ({ page }) => {
  await page.goto("/index.html");

  const profileOptions = page.locator("#profile-select option");
  await expect(profileOptions).toHaveCount(1);

  await page.locator("#profile-name-input").fill("Main build");
  await clickFirstEquipButton(page, "#category-list .equip-btn[data-action='equip']");
  await page.locator("#profile-save-button").click();

  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(1);
  await page.reload();

  await expect(page.locator("#profile-name-input")).toHaveValue("Main build");
  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(1);

  await page.locator("#profile-new-button").click();
  await expect(profileOptions).toHaveCount(2);
  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(0);

  await page.locator("#profile-delete-button").click();
  await expect(profileOptions).toHaveCount(1);
  await expect(page.locator("#profile-name-input")).toHaveValue("Main build");
  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(1);

  await page.locator("#profile-copy-button").click();
  await expect(profileOptions).toHaveCount(2);
  await expect(page.locator("#slot-grid .slot-cell.is-filled")).toHaveCount(1);

  await page.locator("#profile-delete-button").click();
  await expect(profileOptions).toHaveCount(1);
  await expect(page.locator("#profile-name-input")).toHaveValue("Main build");
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

test("compare editor catalog equips, removes, merges and persists secondary profile", async ({ page }) => {
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
  await expect(page.locator("#compare-primary-editor .compare-editor-catalog")).toBeVisible();
  await expect(secondary.locator(".compare-editor-catalog")).toBeVisible();

  await secondary.locator('[data-compare-list-action="inventory-equip"]').first().click();
  await expect(secondary.locator(".compare-equipment-stage .slot-cell.is-filled")).toHaveCount(1);
  await expect.poll(async () => (await readCompareRow(page, "HP"))?.secondaryText).not.toBe("707");
  await expectCompareSecondaryStored(page, "(profile) => Boolean(profile?.equipped?.earring)");

  await page.reload();
  await expect(page.locator("#compare-secondary-editor .compare-equipment-stage .slot-cell.is-filled")).toHaveCount(1);
  await page.locator('#compare-secondary-editor [data-compare-list-action="inventory-remove"]').first().click();
  await expect(page.locator("#compare-secondary-editor .compare-equipment-stage .slot-cell.is-filled")).toHaveCount(0);
  await expectCompareSecondaryStored(page, "(profile) => !profile?.equipped?.earring");

  await page.locator('#compare-secondary-editor [data-compare-workspace-tab="spheres"]').click();
  await page.locator('#compare-secondary-editor [data-compare-list-action="sphere-equip"]').first().click();
  await expect(page.locator("#compare-secondary-editor .compare-sphere-stage .sphere-slot-cell.is-filled")).toHaveCount(1);
  await expectCompareSecondaryStored(page, "(profile) => Object.keys(profile?.sphereEquipped || {}).length === 1");

  await page.locator('#compare-secondary-editor [data-compare-workspace-tab="trophies"]').click();
  await page.locator('#compare-secondary-editor [data-compare-list-action="trophy-equip"]').first().click();
  await expect(page.locator("#compare-secondary-editor .compare-trophy-stage .trophy-slot-cell.is-filled")).toHaveCount(1);
  await expectCompareSecondaryStored(page, "(profile) => Object.keys(profile?.trophyEquipped || {}).length === 1");

  await page.locator('#compare-secondary-editor [data-compare-workspace-tab="pets"]').click();
  await page.locator('#compare-secondary-editor [data-compare-list-action="pet-equip"]').first().click();
  await expect(page.locator("#compare-secondary-editor .compare-pet-stage .pet-card")).toBeVisible();
  await expect.poll(async () => (await readCompareRow(page, "HP"))?.secondaryText).not.toBe("707");

  const mergeIncrease = page.locator('#compare-secondary-editor [data-compare-pet-merge-key="fire"][data-compare-pet-merge-delta="1"]');
  await mergeIncrease.click();
  await expect(page.locator("#compare-secondary-editor .pet-merge-count").first()).toHaveText("1");
  await expect(page.locator("#compare-secondary-editor .pet-merge-bonus").first()).toHaveText("+4");
  await mergeIncrease.click();
  await mergeIncrease.click();
  await mergeIncrease.click();
  await mergeIncrease.click();
  await expect(page.locator("#compare-secondary-editor .pet-merge-count").first()).toHaveText("5");
  await expect(mergeIncrease).toBeDisabled();
  await expectCompareSecondaryStored(page, "(profile) => profile?.petEquipped?.mergeCounts?.fire === 5");

  await page.reload();
  await page.locator('#compare-secondary-editor [data-compare-workspace-tab="pets"]').click();
  await expect(page.locator("#compare-secondary-editor .compare-pet-stage .pet-card")).toBeVisible();
  await expect(page.locator("#compare-secondary-editor .pet-merge-count").first()).toHaveText("5");

  await page.locator('#compare-secondary-editor [data-compare-list-action="pet-remove"]').first().click();
  await expect(page.locator("#compare-secondary-editor .compare-pet-stage .pet-card")).toHaveCount(0);
  await expectCompareSecondaryStored(page, "(profile) => profile?.petEquipped === null");
});
