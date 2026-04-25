(() => {
  if (document.body?.dataset?.page !== "compare") {
    return;
  }

  const app = window.r2App;
  const appReady = window.__R2_APP_READY__;

  if (!app || !appReady) {
    return;
  }

  const COMPARE_SECONDARY_PROFILE_STORAGE_KEY = "r2-doll-compare-secondary-v1";
  const REVERSE_COMPARE_STATS = new Set([
    "Получаемый урон",
    "Получаемый крит. урон",
    "Расход MP",
    "Шанс получить крит. удар",
  ]);

  const compareState = {
    secondaryProfileId: loadSecondaryProfileId(),
    editors: {
      primary: createEditorState(),
      secondary: createEditorState(),
    },
  };

  function createEditorState() {
    return {
      activeWorkspaceTab: "inventory",
      activeSlot: null,
      activeSphereSlot: app.SPHERE_SLOT_CONFIG[0]?.key || null,
      activeSphereTypeOneTab: app.SPHERE_TYPE_ONE_TABS[0]?.category || "Сферы разрушения",
      activeTrophySlot: app.TROPHY_SLOT_CONFIG[0]?.key || null,
    };
  }

  function loadSecondaryProfileId() {
    try {
      return app.normalizeText(localStorage.getItem(COMPARE_SECONDARY_PROFILE_STORAGE_KEY) || "");
    } catch {
      return "";
    }
  }

  function saveSecondaryProfileId() {
    try {
      localStorage.setItem(COMPARE_SECONDARY_PROFILE_STORAGE_KEY, compareState.secondaryProfileId || "");
    } catch {
      // Ignore storage errors.
    }
  }

  function getProfileById(profileId) {
    return app.state.profiles.find((profile) => profile.id === profileId) || null;
  }

  function getPrimaryProfile() {
    const active = app.getActiveProfile();
    if (active) {
      return app.normalizeProfileRecord(active);
    }

    return app.normalizeProfileRecord({
      id: "compare-primary",
      name: "Профиль 1",
      classConfig: app.state.classConfig,
      equipped: app.state.equipped,
      sphereEquipped: app.state.sphereEquipped,
      trophyEquipped: app.state.trophyEquipped,
      activeWorkspaceTab: app.state.activeWorkspaceTab,
    });
  }

  function getSecondaryProfile() {
    const profile = getProfileById(compareState.secondaryProfileId);
    return profile ? app.normalizeProfileRecord(profile) : null;
  }

  function getEditorProfileId(editorKey) {
    return editorKey === "primary" ? app.state.activeProfileId : compareState.secondaryProfileId;
  }

  function getFirstOtherProfileId(primaryId, preferredId = "") {
    const candidates = app.state.profiles.filter((profile) => profile.id !== primaryId);
    if (!candidates.length) {
      return "";
    }

    if (preferredId && preferredId !== primaryId && candidates.some((profile) => profile.id === preferredId)) {
      return preferredId;
    }

    return candidates[0].id;
  }

  function ensureSecondaryProfileSelection() {
    const nextSecondaryId = getFirstOtherProfileId(app.state.activeProfileId, compareState.secondaryProfileId);
    if (compareState.secondaryProfileId !== nextSecondaryId) {
      compareState.secondaryProfileId = nextSecondaryId;
      saveSecondaryProfileId();
      resetEditorState("secondary", getSecondaryProfile(), true);
    }
  }

  function getFirstAvailableEquipmentSlotKey() {
    const slot = app.SLOT_CONFIG.find((entry) => app.getItemsForEquipmentSlot(entry).length);
    return slot?.key || app.SLOT_CONFIG[0]?.key || null;
  }

  function getFirstAvailableSphereSlotKey() {
    const slot = app.SPHERE_SLOT_CONFIG.find((entry) => app.getSphereItemsForSlot(entry.key).length);
    return slot?.key || app.SPHERE_SLOT_CONFIG[0]?.key || null;
  }

  function getFirstAvailableTrophySlotKey() {
    const slot = app.TROPHY_SLOT_CONFIG.find((entry) => app.getTrophyItemsForSlot(entry.key).length);
    return slot?.key || app.TROPHY_SLOT_CONFIG[0]?.key || null;
  }

  function getEquippedSlotsForProfile(profile) {
    return app.SLOT_CONFIG.filter((slot) => profile?.equipped?.[slot.key]);
  }

  function getEquippedSphereSlotsForProfile(profile) {
    return app.SPHERE_SLOT_CONFIG.filter((slot) => profile?.sphereEquipped?.[slot.key]);
  }

  function getEquippedTrophySlotsForProfile(profile) {
    return app.TROPHY_SLOT_CONFIG.filter((slot) => profile?.trophyEquipped?.[slot.key]);
  }

  function resetEditorState(editorKey, profile, forceWorkspaceReset = false) {
    const editor = compareState.editors[editorKey];
    if (forceWorkspaceReset) {
      editor.activeWorkspaceTab = "inventory";
    }

    const equippedSlots = getEquippedSlotsForProfile(profile);
    const equippedSphereSlots = getEquippedSphereSlotsForProfile(profile);
    const equippedTrophySlots = getEquippedTrophySlotsForProfile(profile);

    editor.activeSlot = equippedSlots[0]?.key || getFirstAvailableEquipmentSlotKey();
    editor.activeSphereSlot = equippedSphereSlots[0]?.key || getFirstAvailableSphereSlotKey();
    editor.activeSphereTypeOneTab = app.getSphereTypeOneTabForSlot(editor.activeSphereSlot);
    editor.activeTrophySlot = equippedTrophySlots[0]?.key || getFirstAvailableTrophySlotKey();
  }

  function ensureEditorState(editorKey, profile) {
    const editor = compareState.editors[editorKey];
    if (!["inventory", "spheres", "trophies"].includes(editor.activeWorkspaceTab)) {
      editor.activeWorkspaceTab = "inventory";
    }

    if (!app.getSlotConfig(editor.activeSlot)) {
      editor.activeSlot = getEquippedSlotsForProfile(profile)[0]?.key || getFirstAvailableEquipmentSlotKey();
    }

    if (!app.getSphereSlotConfig(editor.activeSphereSlot)) {
      editor.activeSphereSlot = getEquippedSphereSlotsForProfile(profile)[0]?.key || getFirstAvailableSphereSlotKey();
    }

    if (!app.getTrophySlotConfig(editor.activeTrophySlot)) {
      editor.activeTrophySlot = getEquippedTrophySlotsForProfile(profile)[0]?.key || getFirstAvailableTrophySlotKey();
    }

    if (app.getSphereSlotConfig(editor.activeSphereSlot)?.categoryKey === "sphere_type_1") {
      editor.activeSphereTypeOneTab = app.getSphereTypeOneTabForSlot(editor.activeSphereSlot);
    } else if (!app.SPHERE_TYPE_ONE_TABS.some((tab) => tab.category === editor.activeSphereTypeOneTab)) {
      editor.activeSphereTypeOneTab = app.SPHERE_TYPE_ONE_TABS[0]?.category || "Сферы разрушения";
    }
  }

  function getUpgradeNumber(level) {
    const match = String(level || "").match(/\+(\d+)/);
    return match ? Number(match[1]) : 0;
  }

  function isBaphometSetItem(item) {
    return /Бафомет[а]?/u.test(item?.name || "");
  }

  function isIfritSetItem(item) {
    return /Ифрит[а]?/u.test(item?.name || "");
  }

  function collectEquipmentSetBonusForProfile(profile, { name, bonuses, isSetItem }) {
    const setItems = getEquippedSlotsForProfile(profile)
      .map((slot) => {
        const selected = profile.equipped[slot.key];
        const item = selected ? app.state.itemsById.get(selected.itemId) : null;
        if (!isSetItem(item)) {
          return null;
        }

        return {
          item,
          level: getUpgradeNumber(app.getValidUpgradeLevel(item, selected.upgradeLevel)),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.level - a.level);

    if (setItems.length < 3) {
      return null;
    }

    const setSize = Math.min(5, setItems.length);
    const activeItems = setItems.slice(0, setSize);
    const setLevel = Math.min(...activeItems.map((entry) => entry.level));
    const sourceStats = bonuses[setLevel]?.[setSize] || [];
    if (!sourceStats.length) {
      return null;
    }

    const displayStats = new Map();
    sourceStats.forEach((stat) => app.addStatWithRules(displayStats, stat));

    return {
      name,
      itemCount: setSize,
      setLevel,
      stats: [...displayStats.values()],
    };
  }

  function collectEquippedStatsForProfile(profile) {
    const inventoryBucket = app.createCollectedStatsBucket();
    const sphereBucket = app.createCollectedStatsBucket();
    const trophyBucket = app.createCollectedStatsBucket();
    const numericStats = new Map();
    const effects = new Map();
    const setBonuses = [];

    getEquippedSlotsForProfile(profile).forEach((slot) => {
      const selected = profile.equipped[slot.key];
      const item = app.state.itemsById.get(selected.itemId);
      if (!item) {
        return;
      }

      app.collectItemParamsIntoBucket(item, selected, inventoryBucket);
    });

    getEquippedSphereSlotsForProfile(profile).forEach((slot) => {
      const selected = profile.sphereEquipped[slot.key];
      const item = app.state.sphereItemsById.get(selected.itemId);
      if (!item) {
        return;
      }

      app.collectItemParamsIntoBucket(item, selected, sphereBucket);
    });

    getEquippedTrophySlotsForProfile(profile).forEach((slot) => {
      const selected = profile.trophyEquipped[slot.key];
      const item = app.state.trophyItemsById.get(selected.itemId);
      if (!item) {
        return;
      }

      app.collectItemParamsIntoBucket(item, selected, trophyBucket);
    });

    [inventoryBucket, sphereBucket, trophyBucket].forEach((bucket) => {
      app.addStatCollection(numericStats, [...bucket.numericStats.values()]);
      bucket.effects.forEach((effect, key) => effects.set(key, effect));
    });

    [
      collectEquipmentSetBonusForProfile(profile, {
        name: "Бафомета",
        bonuses: app.BAPHOMET_SET_BONUSES,
        isSetItem: isBaphometSetItem,
      }),
      collectEquipmentSetBonusForProfile(profile, {
        name: "Ифрита",
        bonuses: app.IFRIT_SET_BONUSES,
        isSetItem: isIfritSetItem,
      }),
    ].forEach((setBonus) => {
      if (!setBonus) {
        return;
      }

      setBonus.stats.forEach((stat) => app.addNumericStat(numericStats, stat));
      setBonuses.push(setBonus);
    });

    return {
      numericStats,
      setBonuses,
      sourceBreakdown: {
        inventory: inventoryBucket,
        spheres: sphereBucket,
        trophies: trophyBucket,
      },
      effects: [...effects.values()].sort((a, b) => a.localeCompare(b, "ru")),
    };
  }

  function getClassPanelDataForProfile(profile) {
    const config = app.CLASS_CONFIGS[profile.classConfig.classKey] || app.CLASS_CONFIGS.knight;
    const baseStatMap = {};
    const baseStats = config.baseStats.map((statConfig) => {
      const value = app.computeBaseClassStat(statConfig, profile.classConfig.level);
      baseStatMap[statConfig.label] = value;
      return {
        label: statConfig.label,
        value,
        unit: "",
      };
    });

    return {
      config,
      baseStatMap,
      baseStats,
      derivedStats: config.derivedStats(baseStatMap),
    };
  }

  function getTotalStatsDataForProfile(profile) {
    const totalStats = new Map();
    const { numericStats, effects } = collectEquippedStatsForProfile(profile);
    const { config, baseStats, baseStatMap } = getClassPanelDataForProfile(profile);
    const effectiveAttributeMap = {
      ...baseStatMap,
    };

    ["Сила", "Ловкость", "Интеллект"].forEach((label) => {
      const bonus = numericStats.get(`${label}::`);
      if (bonus) {
        effectiveAttributeMap[label] = (effectiveAttributeMap[label] || 0) + bonus.value;
      }
    });

    const derivedStats = config.derivedStats(effectiveAttributeMap);

    app.addStatCollection(totalStats, baseStats);
    app.addStatCollection(totalStats, derivedStats);
    app.addStatCollection(totalStats, [...numericStats.values()]);

    const { mainStats, secondaryStats } = app.getDisplayStatsFromMap(totalStats, { includeMainZeros: true });

    return {
      mainStats,
      secondaryStats,
      effects,
    };
  }

  function getStatKey(stat) {
    return `${stat.label}::${stat.unit || ""}`;
  }

  function parseStatKey(key) {
    const [label, unit = ""] = key.split("::");
    return { label, unit };
  }

  function formatAbsoluteStat(stat) {
    return app.MAIN_STATS.includes(stat.label)
      ? app.formatBoardPrimaryValue(stat)
      : app.formatStatValue(stat.value, stat.unit);
  }

  function getComparisonClasses(label, primaryValue, secondaryValue) {
    if (primaryValue === secondaryValue) {
      return {
        primary: "",
        secondary: "",
        delta: "",
      };
    }

    const primaryBetter = REVERSE_COMPARE_STATS.has(label)
      ? primaryValue < secondaryValue
      : primaryValue > secondaryValue;

    return {
      primary: primaryBetter ? "is-better" : "is-worse",
      secondary: primaryBetter ? "is-worse" : "is-better",
      delta: primaryBetter ? "is-better" : "is-worse",
    };
  }

  function buildComparisonRows(primaryProfile, secondaryProfile) {
    const primaryStats = getTotalStatsDataForProfile(primaryProfile);
    const secondaryStats = getTotalStatsDataForProfile(secondaryProfile);
    const primaryAllStats = [...primaryStats.mainStats, ...primaryStats.secondaryStats];
    const secondaryAllStats = [...secondaryStats.mainStats, ...secondaryStats.secondaryStats];
    const primaryMap = new Map(primaryAllStats.map((stat) => [getStatKey(stat), stat]));
    const secondaryMap = new Map(secondaryAllStats.map((stat) => [getStatKey(stat), stat]));

    const primaryMainMap = new Map(primaryStats.mainStats.map((stat) => [stat.label, stat]));
    const secondaryMainMap = new Map(secondaryStats.mainStats.map((stat) => [stat.label, stat]));

    const keys = app.MAIN_STATS.map((label) => {
      const stat = primaryMainMap.get(label) || secondaryMainMap.get(label) || { label, unit: "" };
      return getStatKey(stat);
    });

    const secondaryKeyMap = new Map();
    [...primaryStats.secondaryStats, ...secondaryStats.secondaryStats].forEach((stat) => {
      secondaryKeyMap.set(getStatKey(stat), stat);
    });

    const orderedSecondaryKeys = [...secondaryKeyMap.keys()].sort((a, b) => {
      const statA = secondaryKeyMap.get(a);
      const statB = secondaryKeyMap.get(b);
      const priorityA = app.SECONDARY_STAT_PRIORITY.includes(statA.label)
        ? app.SECONDARY_STAT_PRIORITY.indexOf(statA.label)
        : Number.MAX_SAFE_INTEGER;
      const priorityB = app.SECONDARY_STAT_PRIORITY.includes(statB.label)
        ? app.SECONDARY_STAT_PRIORITY.indexOf(statB.label)
        : Number.MAX_SAFE_INTEGER;
      const priorityDiff = priorityA - priorityB;
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return statA.label.localeCompare(statB.label, "ru");
    });

    orderedSecondaryKeys.forEach((key) => {
      if (!keys.includes(key)) {
        keys.push(key);
      }
    });

    return keys.map((key) => {
      const baseStat = primaryMap.get(key) || secondaryMap.get(key) || parseStatKey(key);
      const primaryStat = primaryMap.get(key) || { label: baseStat.label, unit: baseStat.unit, value: 0 };
      const secondaryStat = secondaryMap.get(key) || { label: baseStat.label, unit: baseStat.unit, value: 0 };
      const delta = primaryStat.value - secondaryStat.value;
      const classes = getComparisonClasses(baseStat.label, primaryStat.value, secondaryStat.value);

      return {
        label: baseStat.label,
        unit: baseStat.unit || "",
        primary: primaryStat,
        secondary: secondaryStat,
        delta,
        classes,
      };
    });
  }

  function mutateProfile(editorKey, updater) {
    const profileId = getEditorProfileId(editorKey);
    const profileIndex = app.state.profiles.findIndex((profile) => profile.id === profileId);
    if (profileIndex === -1) {
      return;
    }

    const draft = app.normalizeProfileRecord(app.state.profiles[profileIndex], profileIndex);
    updater(draft);
    draft.updatedAt = Date.now();

    app.state.profiles[profileIndex] = app.normalizeProfileRecord(draft, profileIndex);
    app.saveProfilesState();

    if (editorKey === "primary") {
      app.applyProfileToState(app.state.profiles[profileIndex]);
    }
  }

  function renderCompareInventoryStage(editorKey, profile, editor) {
    const visibleSlots = app.SLOT_CONFIG.filter((slot) => slot.renderOnDoll !== false);

    const slotsHtml = visibleSlots.map((slot) => {
      const items = app.getItemsForEquipmentSlot(slot);
      const selected = profile.equipped[slot.key];
      const item = selected ? app.state.itemsById.get(selected.itemId) : null;
      const level = item ? app.getValidUpgradeLevel(item, selected.upgradeLevel) : null;
      const levels = item ? app.getLevelKeys(item) : [];
      const classes = ["slot-cell"];

      if (editor.activeSlot === slot.key) {
        classes.push("is-active");
      }
      if (item) {
        classes.push("is-filled");
      }
      if (!items.length) {
        classes.push("is-unavailable");
      }

      const imageHtml = item?.image
        ? `<img class="slot-item-image" src="${app.escapeHtml(item.image)}" alt="${app.escapeHtml(item.name)}" loading="lazy">`
        : "";
      const upgradeControl = item && levels.length > 1
        ? `
          <select class="slot-upgrade-select" data-compare-upgrade-type="inventory" data-slot-key="${slot.key}">
            ${levels.map((entry) => `<option value="${app.escapeHtml(entry)}" ${entry === level ? "selected" : ""}>${app.escapeHtml(entry)}</option>`).join("")}
          </select>
        `
        : item
          ? `<span class="slot-upgrade-select is-static">${app.escapeHtml(level)}</span>`
          : "";

      return `
        <div class="${classes.join(" ")}" style="grid-column: ${slot.col}; grid-row: ${slot.row};">
          <button
            type="button"
            class="slot-pin"
            data-compare-slot-pin="1"
            data-compare-slot-type="inventory"
            data-slot-key="${slot.key}"
            aria-label="${app.escapeHtml(slot.label)}"
          >
            <span class="slot-item-visual" aria-hidden="true">${imageHtml}</span>
          </button>
          ${upgradeControl}
        </div>
      `;
    }).join("");

    const passiveSlot = app.getSlotConfig(app.PASSIVE_MORPH_RING_SLOT_KEY);
    const passiveSelected = profile.equipped[passiveSlot.key];
    const passiveItem = passiveSelected ? app.state.itemsById.get(passiveSelected.itemId) : null;
    const passiveLevel = passiveItem ? app.getValidUpgradeLevel(passiveItem, passiveSelected.upgradeLevel) : null;
    const passiveLevels = passiveItem ? app.getLevelKeys(passiveItem) : [];
    const passiveItems = app.getItemsForEquipmentSlot(passiveSlot);
    const passiveClasses = ["slot-cell", "passive-slot-cell"];

    if (editor.activeSlot === passiveSlot.key) {
      passiveClasses.push("is-active");
    }
    if (passiveItem) {
      passiveClasses.push("is-filled");
    }
    if (!passiveItems.length) {
      passiveClasses.push("is-unavailable");
    }

    const passiveImageHtml = passiveItem?.image
      ? `<img class="slot-item-image" src="${app.escapeHtml(passiveItem.image)}" alt="${app.escapeHtml(passiveItem.name)}" loading="lazy">`
      : "";
    const passiveUpgradeControl = passiveItem && passiveLevels.length > 1
      ? `
        <select class="slot-upgrade-select" data-compare-upgrade-type="inventory" data-slot-key="${passiveSlot.key}">
          ${passiveLevels.map((entry) => `<option value="${app.escapeHtml(entry)}" ${entry === passiveLevel ? "selected" : ""}>${app.escapeHtml(entry)}</option>`).join("")}
        </select>
      `
      : passiveItem
        ? `<span class="slot-upgrade-select is-static">${app.escapeHtml(passiveLevel)}</span>`
        : "";

    return `
      <section class="equipment-column compare-stage-column">
        <section class="equipment-stage compare-equipment-stage" aria-label="Слоты экипировки">
          <div class="slot-grid">${slotsHtml}</div>
        </section>

        <section class="passive-slot-panel compare-passive-slot-panel" aria-label="Пассивное кольцо перевоплощения">
          <div class="passive-slot-grid">
            <div class="passive-slot-card ${editor.activeSlot === passiveSlot.key ? "is-active" : ""}">
              <div class="passive-slot-copy">
                <div class="passive-slot-title">${app.escapeHtml(passiveSlot.label)}</div>
                <div class="passive-slot-note">Наденьте кольцо для пасивного эфекта.</div>
              </div>
              <div class="${passiveClasses.join(" ")}">
                <button
                  type="button"
                  class="slot-pin"
                  data-compare-slot-pin="1"
                  data-compare-slot-type="inventory"
                  data-slot-key="${passiveSlot.key}"
                  aria-label="${app.escapeHtml(passiveSlot.label)}"
                >
                  <span class="slot-item-visual" aria-hidden="true">${passiveImageHtml}</span>
                </button>
                ${passiveUpgradeControl}
              </div>
            </div>
          </div>
        </section>
      </section>
    `;
  }

  function renderCompareSphereStage(profile, editor) {
    const slotsHtml = app.SPHERE_SLOT_CONFIG.map((slot) => {
      const items = app.getSphereItemsForSlot(slot.key);
      const selected = profile.sphereEquipped[slot.key];
      const item = selected ? app.state.sphereItemsById.get(selected.itemId) : null;
      const level = item ? app.getValidUpgradeLevel(item, selected.upgradeLevel) : null;
      const levels = item ? app.getLevelKeys(item) : [];
      const showUpgrade = item ? slot.categoryKey === "sphere_type_1" : false;
      const classes = ["sphere-slot-cell", slot.positionClass];

      if (editor.activeSphereSlot === slot.key) {
        classes.push("is-active");
      }
      if (item) {
        classes.push("is-filled");
      }
      if (!items.length) {
        classes.push("is-unavailable");
      }

      const imageHtml = item?.image
        ? `<img class="sphere-slot-item-image" src="${app.escapeHtml(item.image)}" alt="${app.escapeHtml(item.name)}" loading="lazy">`
        : "";
      const upgradeControl = item && showUpgrade && levels.length > 1
        ? `
          <select class="sphere-upgrade-select" data-compare-upgrade-type="sphere" data-slot-key="${slot.key}">
            ${levels.map((entry) => `<option value="${app.escapeHtml(entry)}" ${entry === level ? "selected" : ""}>${app.escapeHtml(entry)}</option>`).join("")}
          </select>
        `
        : item && showUpgrade
          ? `<span class="sphere-upgrade-select is-static">${app.escapeHtml(level)}</span>`
          : "";

      return `
        <div class="${classes.join(" ")}">
          <button
            type="button"
            class="sphere-slot-button"
            data-compare-slot-pin="1"
            data-compare-slot-type="sphere"
            data-slot-key="${slot.key}"
            aria-label="${app.escapeHtml(slot.label)}"
          >
            <span class="sphere-slot-item-visual" aria-hidden="true">${imageHtml}</span>
          </button>
          ${upgradeControl}
        </div>
      `;
    }).join("");

    return `
      <section class="sphere-column compare-stage-column">
        <section class="sphere-stage compare-sphere-stage" aria-label="Слоты сфер">
          <div class="sphere-slot-grid">${slotsHtml}</div>
        </section>
      </section>
    `;
  }

  function renderCompareTrophyStage(profile, editor) {
    const slotsHtml = app.TROPHY_SLOT_CONFIG.map((slot) => {
      const items = app.getTrophyItemsForSlot(slot.key);
      const selected = profile.trophyEquipped[slot.key];
      const item = selected ? app.state.trophyItemsById.get(selected.itemId) : null;
      const level = item ? app.getValidUpgradeLevel(item, selected.upgradeLevel) : null;
      const levels = item ? app.getLevelKeys(item) : [];
      const classes = ["trophy-slot-cell", slot.positionClass];

      if (editor.activeTrophySlot === slot.key) {
        classes.push("is-active");
      }
      if (item) {
        classes.push("is-filled");
      }

      const imageHtml = item?.image
        ? `<img class="trophy-slot-item-image" src="${app.escapeHtml(item.image)}" alt="${app.escapeHtml(item.name)}" loading="lazy">`
        : "";
      const upgradeControl = item && levels.length > 1
        ? `
          <select class="trophy-upgrade-select" data-compare-upgrade-type="trophy" data-slot-key="${slot.key}">
            ${levels.map((entry) => `<option value="${app.escapeHtml(entry)}" ${entry === level ? "selected" : ""}>${app.escapeHtml(entry)}</option>`).join("")}
          </select>
        `
        : item
          ? `<span class="trophy-upgrade-select is-static">${app.escapeHtml(level)}</span>`
          : "";

      return `
        <div class="${classes.join(" ")}">
          <button
            type="button"
            class="trophy-slot-button"
            data-compare-slot-pin="1"
            data-compare-slot-type="trophy"
            data-slot-key="${slot.key}"
            aria-label="${app.escapeHtml(slot.label)}"
          >
            <span class="trophy-slot-item-visual" aria-hidden="true">${imageHtml}</span>
          </button>
          ${upgradeControl}
        </div>
      `;
    }).join("");

    return `
      <section class="trophy-column compare-stage-column">
        <section class="trophy-stage compare-trophy-stage" aria-label="Слоты трофеев">
          <div class="trophy-slot-grid">${slotsHtml}</div>
        </section>
      </section>
    `;
  }

  function renderCompareCatalogForInventory(profile, editor) {
    const slot = app.getSlotConfig(editor.activeSlot);
    if (!slot) {
      return {
        title: "Инвентарь",
        count: 0,
        body: '<div class="empty-note">Выберите слот экипировки.</div>',
      };
    }

    const items = app.getItemsForEquipmentSlot(slot);
    const selectedItemId = profile.equipped[slot.key]?.itemId;
    const body = items.length
      ? items.map((item) => {
        const previewLevel = app.getDefaultUpgradeLevel(item);
        const params = app.getParamsForLevel(item, previewLevel);
        const previewText = params[0] || "Без параметров";
        const isEquipped = String(item.uid) === String(selectedItemId || "");

        return `
          <div class="catalog-item ${isEquipped ? "is-selected" : ""}">
            <div class="item-row">
              ${app.renderItemIcon(item)}
              <div class="item-info">
                <div class="item-name">${app.escapeHtml(item.name)}</div>
                <div class="item-meta">${app.escapeHtml(previewLevel)} · ${app.escapeHtml(previewText)}</div>
              </div>
              <button
                class="equip-btn ${isEquipped ? "is-selected" : ""}"
                type="button"
                data-compare-list-action="${isEquipped ? "inventory-remove" : "inventory-equip"}"
                data-slot-key="${slot.key}"
                data-item-id="${app.escapeHtml(item.uid)}"
              >
                ${isEquipped ? "Снять" : "Надеть"}
              </button>
            </div>
          </div>
        `;
      }).join("")
      : '<div class="empty-note">Для этого слота пока нет предметов.</div>';

    return {
      title: slot.catalogLabel || slot.label,
      count: items.length,
      body,
    };
  }

  function renderCompareCatalogForSphere(profile, editor) {
    const slot = app.getSphereSlotConfig(editor.activeSphereSlot);
    if (!slot) {
      return {
        title: "Сферы",
        count: 0,
        body: '<div class="empty-note">Выберите слот сферы.</div>',
      };
    }

    const items = app.getSphereItemsForSlot(slot.key);
    const selectedItemId = profile.sphereEquipped[slot.key]?.itemId;
    const body = items.length
      ? items.map((item) => {
        const previewLevel = app.getDefaultUpgradeLevel(item);
        const params = app.getParamsForLevel(item, previewLevel);
        const previewText = params[0] || "Без параметров";
        const showUpgrade = slot.categoryKey === "sphere_type_1";
        const isEquipped = String(item.uid) === String(selectedItemId || "");
        const metaParts = [previewText];

        if (showUpgrade) {
          metaParts.unshift(previewLevel);
        }

        return `
          <div class="catalog-item ${isEquipped ? "is-selected" : ""}">
            <div class="item-row">
              ${app.renderItemIcon(item)}
              <div class="item-info">
                <div class="item-name">${app.escapeHtml(item.name)}</div>
                <div class="item-meta">${app.escapeHtml(metaParts.join(" · "))}</div>
              </div>
              <button
                class="equip-btn ${isEquipped ? "is-selected" : ""}"
                type="button"
                data-compare-list-action="${isEquipped ? "sphere-remove" : "sphere-equip"}"
                data-slot-key="${slot.key}"
                data-item-id="${app.escapeHtml(item.uid)}"
              >
                ${isEquipped ? "Снять" : "Надеть"}
              </button>
            </div>
          </div>
        `;
      }).join("")
      : '<div class="empty-note">Для этого слота пока нет сфер.</div>';

    return {
      title: slot.label,
      count: items.length,
      body,
    };
  }

  function renderCompareCatalogForTrophy(profile, editor) {
    const slot = app.getTrophySlotConfig(editor.activeTrophySlot);
    if (!slot) {
      return {
        title: "Трофеи",
        count: 0,
        body: '<div class="empty-note">Выберите слот трофея.</div>',
      };
    }

    const items = app.getTrophyItemsForSlot(slot.key);
    const selectedItemId = profile.trophyEquipped[slot.key]?.itemId;
    const body = items.length
      ? items.map((item) => {
        const previewLevel = app.getDefaultUpgradeLevel(item);
        const params = app.getParamsForLevel(item, previewLevel);
        const previewText = params[0] || "Без параметров";
        const isEquipped = String(item.uid) === String(selectedItemId || "");

        return `
          <div class="catalog-item ${isEquipped ? "is-selected" : ""}">
            <div class="item-row">
              ${app.renderItemIcon(item)}
              <div class="item-info">
                <div class="item-name">${app.escapeHtml(item.name)}</div>
                <div class="item-meta">${app.escapeHtml(previewLevel)} · ${app.escapeHtml(previewText)}</div>
              </div>
              <button
                class="equip-btn ${isEquipped ? "is-selected" : ""}"
                type="button"
                data-compare-list-action="${isEquipped ? "trophy-remove" : "trophy-equip"}"
                data-slot-key="${slot.key}"
                data-item-id="${app.escapeHtml(item.uid)}"
              >
                ${isEquipped ? "Снять" : "Надеть"}
              </button>
            </div>
          </div>
        `;
      }).join("")
      : '<div class="empty-note">Для этого слота пока нет трофеев.</div>';

    return {
      title: `${slot.label} · ${slot.statLabel}`,
      count: items.length,
      body,
    };
  }

  function renderCompareCatalog(profile, editor) {
    if (editor.activeWorkspaceTab === "spheres") {
      return renderCompareCatalogForSphere(profile, editor);
    }

    if (editor.activeWorkspaceTab === "trophies") {
      return renderCompareCatalogForTrophy(profile, editor);
    }

    return renderCompareCatalogForInventory(profile, editor);
  }

  function renderProfileEditor(editorKey, profile, containerId, title) {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }

    ensureEditorState(editorKey, profile);
    const editor = compareState.editors[editorKey];
    const catalog = renderCompareCatalog(profile, editor);
    let stageHtml = renderCompareInventoryStage(editorKey, profile, editor);

    if (editor.activeWorkspaceTab === "spheres") {
      stageHtml = renderCompareSphereStage(profile, editor);
    } else if (editor.activeWorkspaceTab === "trophies") {
      stageHtml = renderCompareTrophyStage(profile, editor);
    }

    container.innerHTML = `
      <section class="compare-editor-shell">
        <div class="section-title-row compare-editor-heading">
          <div>
            <h2>${app.escapeHtml(title)}</h2>
            <span class="section-note">${app.escapeHtml(profile.name)}</span>
          </div>
        </div>

        <section class="compare-editor-controls">
          <label class="class-field">
            <span class="summary-label">Класс</span>
            <select class="class-control" data-compare-class-select="1">
              ${Object.entries(app.CLASS_CONFIGS).map(([key, config]) => `
                <option value="${app.escapeHtml(key)}" ${profile.classConfig.classKey === key ? "selected" : ""}>
                  ${app.escapeHtml(config.label)}
                </option>
              `).join("")}
            </select>
          </label>

          <label class="class-field">
            <span class="summary-label">Уровень</span>
            <input
              class="class-control"
              type="number"
              min="1"
              max="200"
              step="1"
              value="${app.escapeHtml(profile.classConfig.level)}"
              data-compare-level-input="1"
            >
          </label>
        </section>

        <nav class="workspace-tabs compare-workspace-tabs" aria-label="Рабочая область профиля">
          <button class="workspace-tab ${editor.activeWorkspaceTab === "inventory" ? "is-active" : ""}" type="button" data-compare-workspace-tab="inventory">Инвентарь</button>
          <button class="workspace-tab ${editor.activeWorkspaceTab === "spheres" ? "is-active" : ""}" type="button" data-compare-workspace-tab="spheres">Сферы</button>
          <button class="workspace-tab ${editor.activeWorkspaceTab === "trophies" ? "is-active" : ""}" type="button" data-compare-workspace-tab="trophies">Трофеи</button>
        </nav>

        <section class="compare-editor-stage">
          ${stageHtml}
        </section>

        <section class="compare-editor-catalog">
          <div class="section-title-row compare-editor-catalog-title">
            <h3>${app.escapeHtml(catalog.title)}</h3>
            <span class="section-note">${catalog.count}</span>
          </div>
          <div class="category-list compare-category-list">${catalog.body}</div>
        </section>
      </section>
    `;
  }

  function renderSummary(primaryProfile, secondaryProfile) {
    const container = document.getElementById("compare-summary");
    if (!container) {
      return;
    }

    if (!secondaryProfile) {
      container.innerHTML = '<div class="empty-note">Создайте или выберите второй профиль для сравнения.</div>';
      return;
    }

    const rows = buildComparisonRows(primaryProfile, secondaryProfile);

    container.innerHTML = `
      <section class="compare-summary-shell">
        <div class="section-title-row compare-summary-heading">
          <div>
            <h2>Сравнение параметров</h2>
            <span class="section-note">${app.escapeHtml(primaryProfile.name)} vs ${app.escapeHtml(secondaryProfile.name)}</span>
          </div>
        </div>

        <div class="compare-table">
          <div class="compare-table-header">Параметр</div>
          <div class="compare-table-header">${app.escapeHtml(primaryProfile.name)}</div>
          <div class="compare-table-header">${app.escapeHtml(secondaryProfile.name)}</div>
          <div class="compare-table-header">Δ</div>

          ${rows.map((row) => `
            <div class="compare-table-cell compare-table-label">${app.escapeHtml(row.label)}</div>
            <div class="compare-table-cell compare-table-value ${row.classes.primary}">${app.escapeHtml(formatAbsoluteStat(row.primary))}</div>
            <div class="compare-table-cell compare-table-value ${row.classes.secondary}">${app.escapeHtml(formatAbsoluteStat(row.secondary))}</div>
            <div class="compare-table-cell compare-table-delta ${row.classes.delta}">${app.escapeHtml(app.formatStatValue(row.delta, row.unit))}</div>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderTopbar(primaryProfile, secondaryProfile) {
    const primarySelect = document.getElementById("compare-primary-select");
    const secondarySelect = document.getElementById("compare-secondary-select");
    const hasSecondary = Boolean(secondaryProfile);

    if (primarySelect) {
      primarySelect.innerHTML = app.state.profiles.map((profile) => `
        <option value="${app.escapeHtml(profile.id)}" ${profile.id === primaryProfile.id ? "selected" : ""}>
          ${app.escapeHtml(profile.name)}
        </option>
      `).join("");
    }

    if (secondarySelect) {
      secondarySelect.innerHTML = app.state.profiles
        .filter((profile) => profile.id !== primaryProfile.id)
        .map((profile) => `
          <option value="${app.escapeHtml(profile.id)}" ${profile.id === secondaryProfile?.id ? "selected" : ""}>
            ${app.escapeHtml(profile.name)}
          </option>
        `).join("");
      secondarySelect.disabled = !hasSecondary;
    }
  }

  function renderComparePage() {
    ensureSecondaryProfileSelection();
    const primaryProfile = getPrimaryProfile();
    const secondaryProfile = getSecondaryProfile();

    renderTopbar(primaryProfile, secondaryProfile);
    renderProfileEditor("primary", primaryProfile, "compare-primary-editor", "Профиль 1");

    if (secondaryProfile) {
      renderProfileEditor("secondary", secondaryProfile, "compare-secondary-editor", "Профиль 2");
    } else {
      const secondaryContainer = document.getElementById("compare-secondary-editor");
      if (secondaryContainer) {
        secondaryContainer.innerHTML = '<div class="empty-note">Создайте второй профиль, чтобы увидеть вторую сборку.</div>';
      }
    }

    renderSummary(primaryProfile, secondaryProfile);
  }

  function setPrimaryProfile(profileId) {
    if (!profileId || profileId === app.state.activeProfileId) {
      return;
    }

    app.setActiveProfile(profileId);
    ensureSecondaryProfileSelection();
    resetEditorState("primary", getPrimaryProfile(), true);
    renderComparePage();
  }

  function setSecondaryProfile(profileId) {
    if (!profileId || profileId === app.state.activeProfileId) {
      return;
    }

    compareState.secondaryProfileId = profileId;
    saveSecondaryProfileId();
    resetEditorState("secondary", getSecondaryProfile(), true);
    renderComparePage();
  }

  function handleEditorClick(editorKey, event) {
    const workspaceTabButton = event.target.closest("[data-compare-workspace-tab]");
    if (workspaceTabButton) {
      compareState.editors[editorKey].activeWorkspaceTab = workspaceTabButton.dataset.compareWorkspaceTab;
      renderComparePage();
      return;
    }

    const slotButton = event.target.closest("[data-compare-slot-pin]");
    if (slotButton) {
      const slotType = slotButton.dataset.compareSlotType;
      const slotKey = slotButton.dataset.slotKey;
      const editor = compareState.editors[editorKey];

      if (slotType === "sphere") {
        editor.activeWorkspaceTab = "spheres";
        editor.activeSphereSlot = slotKey;
        if (app.getSphereSlotConfig(slotKey)?.categoryKey === "sphere_type_1") {
          editor.activeSphereTypeOneTab = app.getSphereTypeOneTabForSlot(slotKey);
        }
      } else if (slotType === "trophy") {
        editor.activeWorkspaceTab = "trophies";
        editor.activeTrophySlot = slotKey;
      } else {
        editor.activeWorkspaceTab = "inventory";
        editor.activeSlot = slotKey;
      }

      renderComparePage();
      return;
    }

    const actionButton = event.target.closest("[data-compare-list-action]");
    if (!actionButton) {
      return;
    }

    const action = actionButton.dataset.compareListAction;
    const slotKey = actionButton.dataset.slotKey;
    const itemId = actionButton.dataset.itemId;

    mutateProfile(editorKey, (profile) => {
      if (action === "inventory-remove") {
        delete profile.equipped[slotKey];
        return;
      }
      if (action === "inventory-equip") {
        const item = app.state.itemsById.get(itemId);
        if (item) {
          profile.equipped[slotKey] = {
            itemId: String(item.uid),
            upgradeLevel: app.getDefaultUpgradeLevel(item),
          };
        }
        return;
      }
      if (action === "sphere-remove") {
        delete profile.sphereEquipped[slotKey];
        return;
      }
      if (action === "sphere-equip") {
        const item = app.state.sphereItemsById.get(itemId);
        if (item) {
          profile.sphereEquipped[slotKey] = {
            itemId: String(item.uid),
            upgradeLevel: app.getDefaultUpgradeLevel(item),
          };
        }
        return;
      }
      if (action === "trophy-remove") {
        delete profile.trophyEquipped[slotKey];
        return;
      }
      if (action === "trophy-equip") {
        const item = app.state.trophyItemsById.get(itemId);
        if (item) {
          profile.trophyEquipped[slotKey] = {
            itemId: String(item.uid),
            upgradeLevel: app.getDefaultUpgradeLevel(item),
          };
        }
      }
    });

    renderComparePage();
  }

  function handleEditorChange(editorKey, event) {
    if (event.target.matches("[data-compare-class-select]")) {
      const nextClassKey = app.CLASS_CONFIGS[event.target.value] ? event.target.value : "knight";
      mutateProfile(editorKey, (profile) => {
        profile.classConfig.classKey = nextClassKey;
      });
      renderComparePage();
      return;
    }

    if (event.target.matches("[data-compare-level-input]")) {
      mutateProfile(editorKey, (profile) => {
        profile.classConfig.level = app.sanitizeClassLevel(event.target.value);
      });
      renderComparePage();
      return;
    }

    if (event.target.matches("[data-compare-upgrade-type]")) {
      const slotKey = event.target.dataset.slotKey;
      const upgradeType = event.target.dataset.compareUpgradeType;

      mutateProfile(editorKey, (profile) => {
        if (upgradeType === "inventory") {
          const selected = profile.equipped[slotKey];
          const item = selected ? app.state.itemsById.get(selected.itemId) : null;
          if (selected && item) {
            selected.upgradeLevel = app.getValidUpgradeLevel(item, event.target.value);
          }
          return;
        }
        if (upgradeType === "sphere") {
          const selected = profile.sphereEquipped[slotKey];
          const item = selected ? app.state.sphereItemsById.get(selected.itemId) : null;
          if (selected && item) {
            selected.upgradeLevel = app.getValidUpgradeLevel(item, event.target.value);
          }
          return;
        }
        if (upgradeType === "trophy") {
          const selected = profile.trophyEquipped[slotKey];
          const item = selected ? app.state.trophyItemsById.get(selected.itemId) : null;
          if (selected && item) {
            selected.upgradeLevel = app.getValidUpgradeLevel(item, event.target.value);
          }
        }
      });

      renderComparePage();
    }
  }

  function handleEditorContextMenu(editorKey, event) {
    const slotButton = event.target.closest("[data-compare-slot-pin]");
    if (!slotButton) {
      return;
    }

    const slotType = slotButton.dataset.compareSlotType;
    const slotKey = slotButton.dataset.slotKey;
    const profile = editorKey === "primary" ? getPrimaryProfile() : getSecondaryProfile();
    const isFilled = slotType === "sphere"
      ? Boolean(profile?.sphereEquipped?.[slotKey])
      : slotType === "trophy"
        ? Boolean(profile?.trophyEquipped?.[slotKey])
        : Boolean(profile?.equipped?.[slotKey]);

    if (!isFilled) {
      return;
    }

    event.preventDefault();
    mutateProfile(editorKey, (draft) => {
      if (slotType === "sphere") {
        delete draft.sphereEquipped[slotKey];
      } else if (slotType === "trophy") {
        delete draft.trophyEquipped[slotKey];
      } else {
        delete draft.equipped[slotKey];
      }
    });
    renderComparePage();
  }

  function bindEditor(editorKey, containerId) {
    const container = document.getElementById(containerId);
    if (!container || container.dataset.bound === "1") {
      return;
    }

    container.dataset.bound = "1";
    container.addEventListener("click", (event) => handleEditorClick(editorKey, event));
    container.addEventListener("change", (event) => handleEditorChange(editorKey, event));
    container.addEventListener("contextmenu", (event) => handleEditorContextMenu(editorKey, event));
  }

  function bindTopbar() {
    const primarySelect = document.getElementById("compare-primary-select");
    const secondarySelect = document.getElementById("compare-secondary-select");
    const newButton = document.getElementById("compare-new-profile-button");

    if (primarySelect && primarySelect.dataset.bound !== "1") {
      primarySelect.dataset.bound = "1";
      primarySelect.addEventListener("change", () => setPrimaryProfile(primarySelect.value));
    }

    if (secondarySelect && secondarySelect.dataset.bound !== "1") {
      secondarySelect.dataset.bound = "1";
      secondarySelect.addEventListener("change", () => setSecondaryProfile(secondarySelect.value));
    }

    if (newButton && newButton.dataset.bound !== "1") {
      newButton.dataset.bound = "1";
      newButton.addEventListener("click", () => {
        app.createNewProfile();
        ensureSecondaryProfileSelection();
        resetEditorState("primary", getPrimaryProfile(), true);
        renderComparePage();
      });
    }
  }

  appReady.then(() => {
    ensureSecondaryProfileSelection();
    resetEditorState("primary", getPrimaryProfile(), true);
    resetEditorState("secondary", getSecondaryProfile(), true);
    bindTopbar();
    bindEditor("primary", "compare-primary-editor");
    bindEditor("secondary", "compare-secondary-editor");
    renderComparePage();
  });
})();
