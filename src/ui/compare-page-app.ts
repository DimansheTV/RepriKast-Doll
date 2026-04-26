// @ts-nocheck
export function createComparePageApp({ app, ready, uiStateRepository }) {
  const REVERSE_COMPARE_STATS = new Set([
    "Получаемый урон",
    "Получаемый крит. урон",
    "Периодический урон",
    "Расход MP",
    "Шанс получить крит. удар",
  ]);

  const compareState = {
    secondaryProfileId: loadSecondaryProfileId(),
    pendingLevelFocus: null,
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
    return app.normalizeText(uiStateRepository.loadCompareSecondaryProfileId() || "");
  }

  function saveSecondaryProfileId() {
    uiStateRepository.saveCompareSecondaryProfileId(compareState.secondaryProfileId || "");
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
      petEquipped: app.state.petEquipped,
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

  function getVisibleCompareEquipmentSlots() {
    return app.SLOT_CONFIG.filter((slot) => slot.renderOnDoll !== false);
  }

  function queueLevelInputFocus(editorKey, input = null) {
    compareState.pendingLevelFocus = {
      editorKey,
      selectionStart: typeof input?.selectionStart === "number" ? input.selectionStart : null,
      selectionEnd: typeof input?.selectionEnd === "number" ? input.selectionEnd : null,
    };
  }

  function restorePendingLevelInputFocus() {
    const pending = compareState.pendingLevelFocus;
    if (!pending) {
      return;
    }

    compareState.pendingLevelFocus = null;
    const containerId = pending.editorKey === "primary" ? "compare-primary-editor" : "compare-secondary-editor";
    const container = document.getElementById(containerId);
    const input = container?.querySelector("[data-compare-level-input]");
    if (!input) {
      return;
    }

    input.focus({ preventScroll: true });
    if (typeof pending.selectionStart === "number" && typeof pending.selectionEnd === "number") {
      const nextLength = String(input.value || "").length;
      const start = Math.max(0, Math.min(nextLength, pending.selectionStart));
      const end = Math.max(0, Math.min(nextLength, pending.selectionEnd));
      input.setSelectionRange(start, end);
    }
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
    const visibleSlots = getVisibleCompareEquipmentSlots();
    const slot = visibleSlots.find((entry) => app.getItemsForEquipmentSlot(entry).length);
    return slot?.key || visibleSlots[0]?.key || null;
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

  function getVisibleEquippedSlotsForProfile(profile) {
    const visibleKeys = new Set(getVisibleCompareEquipmentSlots().map((slot) => slot.key));
    return getEquippedSlotsForProfile(profile).filter((slot) => visibleKeys.has(slot.key));
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

    const equippedSlots = getVisibleEquippedSlotsForProfile(profile);
    const equippedSphereSlots = getEquippedSphereSlotsForProfile(profile);
    const equippedTrophySlots = getEquippedTrophySlotsForProfile(profile);

    editor.activeSlot = equippedSlots[0]?.key || getFirstAvailableEquipmentSlotKey();
    editor.activeSphereSlot = equippedSphereSlots[0]?.key || getFirstAvailableSphereSlotKey();
    editor.activeSphereTypeOneTab = app.getSphereTypeOneTabForSlot(editor.activeSphereSlot);
    editor.activeTrophySlot = equippedTrophySlots[0]?.key || getFirstAvailableTrophySlotKey();
  }

  function ensureEditorState(editorKey, profile) {
    const editor = compareState.editors[editorKey];
    if (!["inventory", "pets", "spheres", "trophies"].includes(editor.activeWorkspaceTab)) {
      editor.activeWorkspaceTab = "inventory";
    }

    if (!app.getSlotConfig(editor.activeSlot)) {
      editor.activeSlot = getVisibleEquippedSlotsForProfile(profile)[0]?.key || getFirstAvailableEquipmentSlotKey();
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
    const petBucket = app.createCollectedStatsBucket();
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

    app.collectPetSelectionIntoBucket(profile.petEquipped, petBucket);

    [inventoryBucket, sphereBucket, trophyBucket, petBucket].forEach((bucket) => {
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
        pet: petBucket,
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
      const upgradeControl = item
        ? app.renderUpgradeStepperControl(
            "slot-upgrade-select",
            item,
            level,
            { "compare-upgrade-type": "inventory", "slot-key": slot.key },
            `Уровень заточки ${slot.label}`,
          )
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
    const passiveSelected = passiveSlot ? profile.equipped[passiveSlot.key] : null;
    const passiveItem = passiveSelected ? app.state.itemsById.get(passiveSelected.itemId) : null;
    const passiveLevel = passiveItem ? app.getValidUpgradeLevel(passiveItem, passiveSelected.upgradeLevel) : null;
    const passiveClasses = ["slot-cell", "passive-slot-cell", "compare-passive-slot-cell"];

    if (passiveItem) {
      passiveClasses.push("is-filled");
    }
    if (editor.activeSlot === passiveSlot?.key) {
      passiveClasses.push("is-active");
    }

    const passiveImageHtml = passiveItem?.image
      ? `<img class="slot-item-image" src="${app.escapeHtml(passiveItem.image)}" alt="${app.escapeHtml(passiveItem.name)}" loading="lazy">`
      : "";
    const passiveSlotHtml = passiveItem && passiveSlot
      ? `
        <section class="compare-passive-slot-panel">
          <div class="${passiveClasses.join(" ")}" data-slot="${passiveSlot.key}">
            <button
              type="button"
              class="slot-pin"
              data-compare-slot-pin="1"
              data-compare-slot-type="inventory"
              data-slot-key="${passiveSlot.key}"
              aria-label="${app.escapeHtml(`${passiveSlot.label}: ${passiveItem.name}${app.formatUpgradeTitleSuffix(passiveLevel)}`)}"
              title="${app.escapeHtml(`${passiveSlot.label}: ${passiveItem.name}${app.formatUpgradeTitleSuffix(passiveLevel)}`)}"
            >
              <span class="slot-item-visual" aria-hidden="true">${passiveImageHtml}</span>
            </button>
          </div>
        </section>
      `
      : "";

    return `
      <section class="equipment-column compare-stage-column">
        <section class="equipment-stage compare-equipment-stage" aria-label="Слоты экипировки">
          <div class="slot-grid">${slotsHtml}</div>
        </section>
        ${passiveSlotHtml}
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
      const upgradeControl = item && showUpgrade
        ? app.renderUpgradeStepperControl(
            "sphere-upgrade-select",
            item,
            level,
            { "compare-upgrade-type": "sphere", "slot-key": slot.key },
            `Уровень сферы ${slot.label}`,
          )
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
      const upgradeControl = item
        ? app.renderUpgradeStepperControl(
            "trophy-upgrade-select",
            item,
            level,
            { "compare-upgrade-type": "trophy", "slot-key": slot.key },
            `Усиление трофея ${slot.label}`,
          )
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

  function renderCompareStatRows(stats) {
    return stats.map((stat) => `
      <div class="stat-row ${stat.value > 0 ? "is-positive" : stat.value < 0 ? "is-negative" : ""}">
        <span class="stat-name">${app.escapeHtml(stat.label)}</span>
        <span class="stat-value">${app.escapeHtml(app.formatStatValue(stat.value, stat.unit))}</span>
      </div>
    `).join("");
  }

  function getComparePetWorkspaceData(profile) {
    const pet = profile?.petEquipped ? app.state.petItemsById.get(String(profile.petEquipped.itemId)) || null : null;
    if (!pet) {
      return null;
    }

    const bucket = app.createCollectedStatsBucket();
    app.collectItemParamsIntoBucket(pet, { upgradeLevel: app.getDefaultUpgradeLevel(pet) }, bucket);
    app.getPetMergeStats(profile.petEquipped?.mergeCounts).forEach((stat) => app.addStatWithRules(bucket.numericStats, stat));

    return {
      pet,
      stats: app.getDisplayStatsFromMap(bucket.numericStats).allStats,
      effects: [...bucket.effects.values()].sort((a, b) => a.localeCompare(b, "ru")),
      mergeCounts: app.getPetMergeCounts(profile.petEquipped),
      mergeTotal: app.getPetMergeTotal(profile.petEquipped?.mergeCounts),
    };
  }

  function renderComparePetMergeTable(profile) {
    const mergeCounts = app.getPetMergeCounts(profile.petEquipped);
    const totalUsed = app.getPetMergeTotal(mergeCounts);

    return `
      <section class="pet-card-section">
        <div class="stats-subtitle-row stats-subtitle-row-split">
          <h3>Слияние питомца</h3>
          <span class="pet-merge-total-note">Использовано ${totalUsed}/${app.PET_MERGE_TOTAL_LIMIT}</span>
        </div>
        <div class="pet-merge-table-wrap">
          <table class="pet-merge-table">
            <tbody>
              ${app.PET_MERGE_CONFIG.map((entry) => {
                const count = mergeCounts[entry.key] || 0;
                const totalWithoutCurrent = totalUsed - count;
                const canDecrease = count > 0;
                const canIncrease = count < app.PET_MERGE_TOTAL_LIMIT && totalWithoutCurrent + count < app.PET_MERGE_TOTAL_LIMIT;
                const bonus = (entry.bonusPerStep || 0) * count;

                return `
                  <tr>
                    <td><div class="pet-merge-element">${app.escapeHtml(entry.label)}</div></td>
                    <td><div class="pet-merge-stat">${app.escapeHtml(entry.statLabel)}</div></td>
                    <td>
                      <div class="pet-merge-controls">
                        <button type="button" class="pet-merge-btn" data-compare-pet-merge-key="${app.escapeHtml(entry.key)}" data-compare-pet-merge-delta="-1" ${canDecrease ? "" : "disabled"} aria-label="Уменьшить ${app.escapeHtml(entry.label)}">-</button>
                        <span class="pet-merge-count">${count}</span>
                        <button type="button" class="pet-merge-btn" data-compare-pet-merge-key="${app.escapeHtml(entry.key)}" data-compare-pet-merge-delta="1" ${canIncrease ? "" : "disabled"} aria-label="Увеличить ${app.escapeHtml(entry.label)}">+</button>
                      </div>
                    </td>
                    <td><div class="pet-merge-bonus">${app.escapeHtml(app.formatStatValue(bonus, entry.unit))}</div></td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderComparePetStage(profile) {
    const petData = getComparePetWorkspaceData(profile);
    if (!petData) {
      return `
        <section class="pet-column compare-stage-column">
          <section class="pet-stage compare-pet-stage" aria-label="Питомец">
            <div class="pet-stage-empty">
              <div class="empty-note">У профиля не выбран питомец.</div>
            </div>
          </section>
        </section>
      `;
    }

    const { pet, stats, effects } = petData;
    const subtitle = app.normalizeText(pet.description_lines?.[0]) || `${pet.element} (${pet.variant})`;
    const categoryLabel = app.PET_CATEGORY_CONFIG.find((entry) => entry.key === pet.variant)?.label || pet.category;

    return `
      <section class="pet-column compare-stage-column">
        <section class="pet-stage compare-pet-stage" aria-label="Питомец">
          <article class="pet-card">
            <div class="pet-card-head">
              <div class="pet-card-portrait">
                <img src="${app.escapeHtml(pet.image)}" alt="${app.escapeHtml(pet.name)}" loading="lazy">
              </div>
              <div class="pet-card-copy">
                <div class="pet-card-kicker">${app.escapeHtml(categoryLabel)}</div>
                <div class="pet-card-title-row">
                  <h3>${app.escapeHtml(pet.name)}</h3>
                </div>
                <div class="pet-card-meta">${app.escapeHtml(subtitle)}</div>
              </div>
            </div>

            <section class="pet-card-section">
              <div class="stats-subtitle-row">
                <h3>Параметры питомца</h3>
              </div>
              <div class="stat-list stat-list-secondary">
                ${stats.length ? renderCompareStatRows(stats) : '<div class="empty-note">Питомец не даёт числовых параметров.</div>'}
              </div>
            </section>

            ${renderComparePetMergeTable(profile)}

            ${effects.length ? `
              <section class="pet-card-section">
                <div class="stats-subtitle-row">
                  <h3>Особые эффекты</h3>
                </div>
                <div class="effects-list">
                  ${effects.map((effect) => `<div class="effect-pill">${app.escapeHtml(effect)}</div>`).join("")}
                </div>
              </section>
            ` : ""}
          </article>
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
                <div class="item-meta">${app.escapeHtml(app.shouldDisplayUpgradeLevel(previewLevel) ? `${previewLevel} · ${previewText}` : previewText)}</div>
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

        if (showUpgrade && app.shouldDisplayUpgradeLevel(previewLevel)) {
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
                <div class="item-meta">${app.escapeHtml(app.shouldDisplayUpgradeLevel(previewLevel) ? `${previewLevel} · ${previewText}` : previewText)}</div>
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
    const classLabel = app.CLASS_CONFIGS[profile.classConfig.classKey]?.label || "Класс";
    let stageHtml = renderCompareInventoryStage(editorKey, profile, editor);

    if (editor.activeWorkspaceTab === "pets") {
      stageHtml = renderComparePetStage(profile);
    } else if (editor.activeWorkspaceTab === "spheres") {
      stageHtml = renderCompareSphereStage(profile, editor);
    } else if (editor.activeWorkspaceTab === "trophies") {
      stageHtml = renderCompareTrophyStage(profile, editor);
    }

    container.innerHTML = `
      <section class="compare-editor-shell">
        <div class="section-title-row compare-editor-heading">
          <div class="compare-editor-headline">
            <span class="compare-editor-tag">${app.escapeHtml(title)}</span>
            <h2>${app.escapeHtml(profile.name)}</h2>
            <span class="section-note">${app.escapeHtml(classLabel)} · Ур. ${app.escapeHtml(profile.classConfig.level)}</span>
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
            <div class="class-level-stepper class-control" role="group" aria-label="Уровень персонажа">
              <button class="class-level-stepper-btn" type="button" data-compare-level-delta="-1" ${profile.classConfig.level <= 1 ? "disabled" : ""} aria-label="Уменьшить уровень">-</button>
              <input class="class-level-stepper-input" type="number" min="1" max="200" step="1" value="${app.escapeHtml(profile.classConfig.level)}" inputmode="numeric" data-compare-level-input="1" aria-label="Уровень персонажа">
              <button class="class-level-stepper-btn" type="button" data-compare-level-delta="1" ${profile.classConfig.level >= 200 ? "disabled" : ""} aria-label="Увеличить уровень">+</button>
            </div>
          </label>
        </section>

        <nav class="workspace-tabs compare-workspace-tabs" aria-label="Рабочая область профиля">
          <button class="workspace-tab ${editor.activeWorkspaceTab === "inventory" ? "is-active" : ""}" type="button" data-compare-workspace-tab="inventory">Инвентарь</button>
          <button class="workspace-tab ${editor.activeWorkspaceTab === "pets" ? "is-active" : ""}" type="button" data-compare-workspace-tab="pets">Питомцы</button>
          <button class="workspace-tab ${editor.activeWorkspaceTab === "spheres" ? "is-active" : ""}" type="button" data-compare-workspace-tab="spheres">Сферы</button>
          <button class="workspace-tab ${editor.activeWorkspaceTab === "trophies" ? "is-active" : ""}" type="button" data-compare-workspace-tab="trophies">Трофеи</button>
        </nav>

        <section class="compare-editor-stage">
          ${stageHtml}
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
    const betterCount = rows.filter((row) => row.classes.delta === "is-better").length;
    const worseCount = rows.filter((row) => row.classes.delta === "is-worse").length;
    const equalCount = rows.length - betterCount - worseCount;

    container.innerHTML = `
      <section class="compare-summary-shell">
        <div class="section-title-row compare-summary-heading">
          <div class="compare-summary-headline">
            <span class="compare-editor-tag compare-editor-tag-summary">Аналитика</span>
            <h2>Сравнение параметров</h2>
            <span class="section-note">${app.escapeHtml(primaryProfile.name)} vs ${app.escapeHtml(secondaryProfile.name)}</span>
          </div>
        </div>

        <div class="compare-summary-strip">
          <div class="compare-summary-chip is-better">Лучше: ${app.escapeHtml(betterCount)}</div>
          <div class="compare-summary-chip is-worse">Хуже: ${app.escapeHtml(worseCount)}</div>
          <div class="compare-summary-chip is-neutral">Равно: ${app.escapeHtml(equalCount)}</div>
        </div>

        <div class="compare-table-wrap">
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
    restorePendingLevelInputFocus();
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

    const upgradeButton = event.target.closest("[data-compare-upgrade-type][data-upgrade-delta]");
    if (upgradeButton) {
      const slotKey = upgradeButton.dataset.slotKey;
      const upgradeType = upgradeButton.dataset.compareUpgradeType;
      const delta = Number(upgradeButton.dataset.upgradeDelta || 0);

      mutateProfile(editorKey, (profile) => {
        if (upgradeType === "inventory") {
          const selected = profile.equipped[slotKey];
          const item = selected ? app.state.itemsById.get(selected.itemId) : null;
          if (selected && item) {
            selected.upgradeLevel = app.getAdjacentUpgradeLevel(item, selected.upgradeLevel, delta);
          }
          return;
        }
        if (upgradeType === "sphere") {
          const selected = profile.sphereEquipped[slotKey];
          const item = selected ? app.state.sphereItemsById.get(selected.itemId) : null;
          if (selected && item) {
            selected.upgradeLevel = app.getAdjacentUpgradeLevel(item, selected.upgradeLevel, delta);
          }
          return;
        }
        if (upgradeType === "trophy") {
          const selected = profile.trophyEquipped[slotKey];
          const item = selected ? app.state.trophyItemsById.get(selected.itemId) : null;
          if (selected && item) {
            selected.upgradeLevel = app.getAdjacentUpgradeLevel(item, selected.upgradeLevel, delta);
          }
        }
      });

      renderComparePage();
      return;
    }

    const levelButton = event.target.closest("[data-compare-level-delta]");
    if (levelButton) {
      queueLevelInputFocus(editorKey, event.target.closest(".class-level-stepper")?.querySelector("[data-compare-level-input]"));
      mutateProfile(editorKey, (profile) => {
        profile.classConfig.level = app.sanitizeClassLevel(profile.classConfig.level + Number(levelButton.dataset.compareLevelDelta || 0));
      });
      renderComparePage();
      return;
    }

    const petMergeButton = event.target.closest("[data-compare-pet-merge-key]");
    if (petMergeButton) {
      const mergeKey = petMergeButton.dataset.comparePetMergeKey;
      const delta = Number(petMergeButton.dataset.comparePetMergeDelta || 0);

      mutateProfile(editorKey, (profile) => {
        const pet = profile.petEquipped ? app.state.petItemsById.get(String(profile.petEquipped.itemId)) : null;
        const mergeConfig = app.PET_MERGE_CONFIG.find((entry) => entry.key === mergeKey);
        if (!pet || !mergeConfig) {
          return;
        }

        const currentCounts = app.getPetMergeCounts(profile.petEquipped);
        const currentValue = currentCounts[mergeKey] || 0;
        const totalWithoutCurrent = app.getPetMergeTotal(currentCounts) - currentValue;
        const nextValue = Math.min(
          app.PET_MERGE_TOTAL_LIMIT,
          Math.max(0, currentValue + delta),
        );
        const cappedValue = Math.min(nextValue, app.PET_MERGE_TOTAL_LIMIT - totalWithoutCurrent);

        if (cappedValue > 0) {
          currentCounts[mergeKey] = cappedValue;
        } else {
          delete currentCounts[mergeKey];
        }

        profile.petEquipped = {
          itemId: String(pet.uid),
          mergeCounts: currentCounts,
        };
      });

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

    if (event.target.matches("select[data-compare-upgrade-type]")) {
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

    if (event.target.matches("[data-compare-level-input]")) {
      queueLevelInputFocus(editorKey, event.target);
      mutateProfile(editorKey, (profile) => {
        profile.classConfig.level = app.sanitizeClassLevel(event.target.value);
      });
      renderComparePage();
    }
  }

  function handleEditorKeydown(editorKey, event) {
    if (!event.target.matches("[data-compare-level-input]")) {
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const delta = event.key === "ArrowUp" ? 1 : -1;
      queueLevelInputFocus(editorKey, event.target);
      mutateProfile(editorKey, (profile) => {
        profile.classConfig.level = app.sanitizeClassLevel(profile.classConfig.level + delta);
      });
      renderComparePage();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      queueLevelInputFocus(editorKey, event.target);
      mutateProfile(editorKey, (profile) => {
        profile.classConfig.level = app.sanitizeClassLevel(event.target.value);
      });
      renderComparePage();
    }
  }

  function bindEditor(editorKey, containerId) {
    const container = document.getElementById(containerId);
    if (!container || container.dataset.bound === "1") {
      return;
    }

    container.dataset.bound = "1";
    container.addEventListener("click", (event) => handleEditorClick(editorKey, event));
    container.addEventListener("change", (event) => handleEditorChange(editorKey, event));
    container.addEventListener("keydown", (event) => handleEditorKeydown(editorKey, event));
  }

  function bindTopbar() {
    const primarySelect = document.getElementById("compare-primary-select");
    const secondarySelect = document.getElementById("compare-secondary-select");

    if (primarySelect && primarySelect.dataset.bound !== "1") {
      primarySelect.dataset.bound = "1";
      primarySelect.addEventListener("change", () => setPrimaryProfile(primarySelect.value));
    }

    if (secondarySelect && secondarySelect.dataset.bound !== "1") {
      secondarySelect.dataset.bound = "1";
      secondarySelect.addEventListener("change", () => setSecondaryProfile(secondarySelect.value));
    }
  }

  return {
    mount() {
      return ready.then(() => {
        ensureSecondaryProfileSelection();
        resetEditorState("primary", getPrimaryProfile(), true);
        resetEditorState("secondary", getSecondaryProfile(), true);
        bindTopbar();
        bindEditor("primary", "compare-primary-editor");
        bindEditor("secondary", "compare-secondary-editor");
        renderComparePage();
      });
    },
  };
}
