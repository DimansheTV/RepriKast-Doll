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
      window.localStorage.clear();
      window.sessionStorage.clear();
      window.localStorage.setItem(keys.profiles, JSON.stringify(seededProfiles));
      window.localStorage.setItem(keys.activeProfileId, activeId);
      if (compareId) {
        window.localStorage.setItem(keys.compareSecondaryProfileId, compareId);
      }
    },
    {
      keys: STORAGE_KEYS,
      seededProfiles: profiles,
      activeId: activeProfileId,
      compareId: compareSecondaryProfileId,
    },
  );
}

async function readBoardMainStats(page: Page) {
  return page.locator("#board-main-stats .board-stat-row").evaluateAll((rows) => {
    return Object.fromEntries(
      rows.map((row) => {
        const name = row.querySelector(".board-stat-name")?.textContent?.trim() || "";
        const value = row.querySelector(".board-stat-value")?.textContent?.trim() || "";
        return [name, value];
      }),
    );
  });
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

test("seeded knight level 10 profile keeps baseline totals", async ({ page }) => {
  await seedProfiles(
    page,
    [
      {
        id: "profile-knight-10",
        name: "Knight 10",
        classConfig: { classKey: "knight", level: 10 },
        equipped: {},
        sphereEquipped: {},
        trophyEquipped: {},
        petEquipped: null,
        activeWorkspaceTab: "inventory",
      },
    ],
    "profile-knight-10",
  );

  await page.goto("/index.html");

  await expect(page.locator("#profile-name-input")).toHaveValue("Knight 10");
  await expect(readBoardMainStats(page)).resolves.toEqual({
    HP: "758",
    MP: "44",
    "Сила": "9",
    "Ловкость": "4",
    "Интеллект": "2",
  });
});

test("main page keeps equipment after reload and supports profile create/copy/delete", async ({ page }) => {
  await page.goto("/index.html");

  const profileOptions = page.locator("#profile-select option");
  await expect(profileOptions).toHaveCount(1);

  await page.locator("#profile-name-input").fill("Main build");
  await expect(page.locator("#category-list .equip-btn[data-action='equip']").first()).toBeVisible();
  await page.locator("#category-list .equip-btn[data-action='equip']").first().click();
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

test("pet, sphere and trophy workflows fill their slots", async ({ page }) => {
  await page.goto("/index.html");

  await page.locator('[data-workspace-tab="pet"]').click();
  const petEquipButton = page.locator("#category-list [data-pet-id][data-action='equip']").first();
  if (await petEquipButton.count() === 0) {
    await page.locator(".category-header[data-pet-category]").first().click();
  }
  await expect(petEquipButton).toBeVisible();
  await petEquipButton.click();
  await expect(page.locator("#pet-stage .pet-card")).toBeVisible();

  await page.locator('[data-workspace-tab="spheres"]').click();
  const sphereEquipButton = page.locator("#category-list [data-sphere-id][data-action='equip']").first();
  if (await sphereEquipButton.count() === 0) {
    await page.locator(".category-header[data-sphere-category]").first().click();
  }
  await expect(sphereEquipButton).toBeVisible();
  await sphereEquipButton.click();
  await expect(page.locator("#sphere-slot-grid .sphere-slot-cell.is-filled")).toHaveCount(1);

  await page.locator('[data-workspace-tab="trophies"]').click();
  const trophyEquipButton = page.locator("#category-list [data-trophy-id][data-action='equip']").first();
  if (await trophyEquipButton.count() === 0) {
    await page.locator(".category-header[data-trophy-category]").first().click();
  }
  await expect(trophyEquipButton).toBeVisible();
  await trophyEquipButton.click();
  await expect(page.locator("#trophy-slot-grid .trophy-slot-cell.is-filled")).toHaveCount(1);
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
