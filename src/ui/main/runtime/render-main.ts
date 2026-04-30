// @ts-nocheck
import { CLASS_CONFIGS, CLASS_PRIMARY_ATTRIBUTES } from "../../../domain/stats/runtime-config";

export function createMainRenderModule(deps) {
  const {
    state,
    getActiveProfile,
    getActiveDraftDisplayName,
    setActiveProfile,
    setActiveDraftName,
    startBuildNameEditing,
    finishBuildNameEditing,
    cancelBuildNameEditing,
    cancelActiveBuildEdits,
    toggleBuildMenu,
    closeBuildMenu,
    saveActiveProfileExplicitly,
    copyActiveProfile,
    createNewProfile,
    deleteActiveProfile,
    saveWorkspaceTabState,
    saveSidebarTabState,
    saveClassState,
    sanitizeEquippedState,
    renderAll,
    collectEquippedStats,
    getDisplayStatsFromMap,
    addStatCollection,
    formatBoardPrimaryValue,
    formatStatValue,
    getParamsForLevel,
    getLocalizedParamsForLevel,
    normalizeText,
    parseNumericStat,
    escapeHtml,
    formatUpgradeSuffix,
    shouldShowSphereUpgrade,
    getLevelKeys,
    getLocalizedCatalogField,
    getLocalizedCatalogLines,
    CLASS_CONFIGS: runtimeClassConfigs = CLASS_CONFIGS,
    sanitizeClassLevel,
    t,
    localizeText,
    setLanguage,
  } = deps;
  const CLASS_CONFIGS = runtimeClassConfigs;
  let toastTimer = 0;
  let suppressBuildNameBlur = false;

function localize(value) {
  return localizeText(value);
}

function setTextContent(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}

function setAttributeValue(selector, attribute, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute(attribute, value);
  }
}

function getNextLanguage() {
  return state.language === "ru" ? "en" : "ru";
}

function applyStaticLocalization() {
  document.documentElement.lang = state.language || "ru";

  setAttributeValue("body[data-page='main'] .panel-topbar", "aria-label", t("toolbar.buildPanel"));
  setAttributeValue("#build-picker", "aria-label", t("toolbar.buildPicker"));
  setAttributeValue("#language-switch", "aria-label", t("toolbar.languageSwitcher"));
  const languageCycleButton = document.getElementById("language-cycle-button");
  if (languageCycleButton) {
    const nextLanguage = getNextLanguage();
    languageCycleButton.textContent = nextLanguage === "ru" ? t("button.languageRu") : t("button.languageEn");
    languageCycleButton.setAttribute("data-language", nextLanguage);
  }

  setTextContent("#profile-save-button", t("button.save"));
  setTextContent("#profile-compare-link", t("button.compare"));

  setTextContent('.sidebar-tab-button[data-tab="class"]', t("class.class"));
  setTextContent('.sidebar-tab-button[data-tab="stats"]', t("stats.equipmentStats"));

  setTextContent('#class-select option[value="knight"]', localize("Рыцарь"));
  setTextContent('#class-select option[value="ranger"]', localize("Рейнджер"));
  setTextContent('#class-select option[value="mage"]', localize("Маг"));
  setTextContent('#class-select option[value="summoner"]', localize("Призыватель"));
  setTextContent('#class-select option[value="assassin"]', localize("Ассасин"));

  setTextContent(".class-controls .class-field:nth-of-type(1) .summary-label", t("class.class"));
  setTextContent(".class-controls .class-field:nth-of-type(2) .summary-label", t("class.level"));
  setAttributeValue("#class-level-stepper", "aria-label", t("class.characterLevel"));
  setAttributeValue("#class-level-decrease", "aria-label", t("class.decreaseLevel"));
  setAttributeValue("#class-level-input", "aria-label", t("class.characterLevel"));
  setAttributeValue("#class-level-increase", "aria-label", t("class.increaseLevel"));

  setTextContent('[data-tab-panel="class"] .stats-section:nth-of-type(1) h3', t("stats.fromLevel"));
  setTextContent('[data-tab-panel="class"] .stats-section:nth-of-type(2) h3', t("stats.derivedFromLevel"));

  setAttributeValue(".stats-source-tabs", "aria-label", t("stats.sources"));
  setTextContent('.stats-source-tab[data-stats-tab="inventory"]', t("stats.inventory"));
  setTextContent('.stats-source-tab[data-stats-tab="pets"]', t("stats.pets"));
  setTextContent('.stats-source-tab[data-stats-tab="spheres"]', t("stats.spheres"));
  setTextContent('.stats-source-tab[data-stats-tab="trophies"]', t("stats.trophies"));
  setTextContent('.stats-source-tab[data-stats-tab="sets"]', t("stats.sets"));
  setTextContent('.stats-source-tab[data-stats-tab="effects"]', t("stats.effects"));

  setTextContent('[data-stats-panel="inventory"] h3', t("stats.inventoryValues"));
  setTextContent('[data-stats-panel="pets"] h3', t("stats.petValues"));
  setTextContent('[data-stats-panel="spheres"] h3', t("stats.sphereValues"));
  setTextContent('[data-stats-panel="trophies"] h3', t("stats.trophyValues"));
  setTextContent('[data-stats-panel="sets"] h3', t("stats.setValues"));
  setTextContent('[data-stats-panel="effects"] h3', t("stats.specialEffects"));

  setAttributeValue(".panel-board", "aria-label", t("board.totalStats"));
  setAttributeValue(".workspace-column", "aria-label", t("workspace.doll"));
  setAttributeValue(".workspace-tabs", "aria-label", t("workspace.areas"));
  setTextContent('.workspace-tab[data-workspace-tab="inventory"]', t("workspace.inventory"));
  setTextContent('.workspace-tab[data-workspace-tab="pet"]', t("workspace.pet"));
  setTextContent('.workspace-tab[data-workspace-tab="spheres"]', t("workspace.spheres"));
  setTextContent('.workspace-tab[data-workspace-tab="trophies"]', t("workspace.trophies"));
  setAttributeValue('.equipment-stage', "aria-label", t("workspace.equipmentSlots"));
  setAttributeValue('.passive-slot-panel', "aria-label", t("workspace.passiveRing"));
  setAttributeValue('.sphere-stage', "aria-label", t("workspace.sphereSlots"));
  setAttributeValue('.pet-stage', "aria-label", t("workspace.petStage"));
  setAttributeValue('.trophy-stage', "aria-label", t("workspace.trophySlots"));
}


function renderStatRows(stats) {
  return stats.map((stat) => {
    const rowClass = stat.value < 0 ? "is-negative" : "is-positive";
    return `
      <div class="stat-row ${rowClass}">
        <span class="stat-name">${escapeHtml(localize(stat.label))}</span>
        <span class="stat-value">${escapeHtml(formatStatValue(stat.value, stat.unit))}</span>
      </div>
    `;
  }).join("");
}

function renderSetBonusRows(setBonuses) {
  if (!setBonuses.length) {
    return `<div class="empty-note">${escapeHtml(t("empty.setBonuses"))}</div>`;
  }

  return setBonuses.map((bonus) => `
    <div class="set-bonus-card">
      <div class="set-bonus-title">${escapeHtml(localize(bonus.name))}</div>
      <div class="set-bonus-meta">${escapeHtml(t("stats.setBonusMeta", { itemCount: bonus.itemCount, setLevel: bonus.setLevel }))}</div>
      <div class="stat-list stat-list-secondary">${renderStatRows(bonus.stats)}</div>
    </div>
  `).join("");
}

function renderEquipmentDescription(slot, item, level) {
  if (!item) {
    return "";
  }

  const params = getLocalizedParamsForLevel(item, level);
  const descriptionLines = getLocalizedCatalogLines(item, "descriptionLines", { fallbackToRu: true })
    .filter((line) => normalizeText(line));
  const mergedLines = [...new Set([...params, ...descriptionLines])];
  const paramsHtml = mergedLines.length
    ? mergedLines.map((param) => `<li>${escapeHtml(localize(param))}</li>`).join("")
    : `<li>${escapeHtml(t("empty.noParams"))}</li>`;

  return `
    <div class="equipment-description-card">
      <div class="equipment-description-content">
        <div class="equipment-description-name">${escapeHtml(getLocalizedCatalogField(item, "name", { fallbackToRu: true }))}${escapeHtml(formatUpgradeSuffix(level))}</div>
        <ul class="equipment-description-params">${paramsHtml}</ul>
      </div>
    </div>
  `;
}

function renderSphereDescription(slot, item, level) {
  if (!item) {
    return "";
  }

  const params = getLocalizedParamsForLevel(item, level);
  const requiredLevel = getMorphSphereRequiredLevel(item);
  const requirementLine = requiredLevel > 0
    ? [state.language === "en" ? `Required level ${requiredLevel}` : `Уровень экипировки ${requiredLevel}`]
    : [];
  const descriptionLines = getLocalizedCatalogLines(item, "descriptionLines", { fallbackToRu: true })
    .filter((line) => normalizeText(line));
  const mergedLines = [...new Set([...requirementLine, ...params, ...descriptionLines])];
  const paramsHtml = mergedLines.length
    ? mergedLines.map((param) => `<li>${escapeHtml(localize(param))}</li>`).join("")
    : `<li>${escapeHtml(t("empty.noParams"))}</li>`;
  const displayLevel = shouldShowSphereUpgrade(item, slot) && getLevelKeys(item).length > 1
    ? formatUpgradeSuffix(level)
    : "";

  return `
    <div class="equipment-description-card">
      <div class="equipment-description-content">
        <div class="equipment-description-name">${escapeHtml(getLocalizedCatalogField(item, "name", { fallbackToRu: true }))}${escapeHtml(displayLevel)}</div>
        <ul class="equipment-description-params">${paramsHtml}</ul>
      </div>
    </div>
  `;
}

function renderTrophyDescription(slot, item, level) {
  if (!item) {
    return "";
  }

  const params = getLocalizedParamsForLevel(item, level);
  const paramsHtml = params.length
    ? params.map((param) => `<li>${escapeHtml(localize(param))}</li>`).join("")
    : `<li>${escapeHtml(t("empty.noParams"))}</li>`;
  return `
    <div class="equipment-description-card">
      <div class="equipment-description-content">
        <div class="equipment-description-name">${escapeHtml(getLocalizedCatalogField(item, "name", { fallbackToRu: true }))}${escapeHtml(formatUpgradeSuffix(level))}</div>
        <ul class="equipment-description-params">${paramsHtml}</ul>
      </div>
    </div>
  `;
}

function computeBaseClassStat(statConfig, level) {
  if (statConfig.growthType === "per_level") {
    return statConfig.base + Math.max(0, level - 1) * statConfig.amount;
  }

  if (statConfig.growthType === "interval") {
    const normalizedLevel = CLASS_PRIMARY_ATTRIBUTES.has(statConfig.label)
      ? Math.max(0, level)
      : Math.max(0, level - 1);
    return statConfig.base + Math.floor(normalizedLevel / statConfig.interval) * statConfig.amount;
  }

  return statConfig.base;
}

function renderStatsPanel() {
  const inventoryContainer = document.getElementById("stats-inventory-list");
  const petContainer = document.getElementById("stats-pets-list");
  const spheresContainer = document.getElementById("stats-spheres-list");
  const trophiesContainer = document.getElementById("stats-trophies-list");
  const setContainer = document.getElementById("stats-set-list");
  const effectsContainer = document.getElementById("stats-effects-list");
  if (!inventoryContainer || !petContainer || !spheresContainer || !trophiesContainer || !setContainer || !effectsContainer) {
    return;
  }

  const { sourceBreakdown, setBonuses, effects } = collectEquippedStats();
  const inventoryStats = getDisplayStatsFromMap(sourceBreakdown.inventory.numericStats).allStats;
  const petStats = getDisplayStatsFromMap(sourceBreakdown.pet.numericStats).allStats;
  const sphereStats = getDisplayStatsFromMap(sourceBreakdown.spheres.numericStats).allStats;
  const trophyStats = getDisplayStatsFromMap(sourceBreakdown.trophies.numericStats).allStats;

  inventoryContainer.innerHTML = inventoryStats.length
    ? renderStatRows(inventoryStats)
    : `<div class="empty-note">${escapeHtml(t("empty.inventoryStats"))}</div>`;
  petContainer.innerHTML = petStats.length
    ? renderStatRows(petStats)
    : `<div class="empty-note">${escapeHtml(t("empty.petStats"))}</div>`;
  spheresContainer.innerHTML = sphereStats.length
    ? renderStatRows(sphereStats)
    : `<div class="empty-note">${escapeHtml(t("empty.sphereStats"))}</div>`;
  trophiesContainer.innerHTML = trophyStats.length
    ? renderStatRows(trophyStats)
    : `<div class="empty-note">${escapeHtml(t("empty.trophyStats"))}</div>`;
  setContainer.innerHTML = renderSetBonusRows(setBonuses);
  effectsContainer.innerHTML = effects.length
    ? effects.map((effect) => `<div class="effect-pill">${escapeHtml(localize(effect))}</div>`).join("")
    : `<div class="empty-note">${escapeHtml(t("empty.effects"))}</div>`;
}

function getClassPanelData() {
  const config = CLASS_CONFIGS[state.classConfig.classKey] || CLASS_CONFIGS.knight;
  const baseStatMap = {};
  const baseStats = config.baseStats.map((statConfig) => {
    const value = computeBaseClassStat(statConfig, state.classConfig.level);
    baseStatMap[statConfig.label] = value;
    return {
      label: statConfig.label,
      value,
      unit: "",
    };
  });

  const derivedStats = config.derivedStats(baseStatMap);

  return {
    config,
    baseStatMap,
    baseStats,
    derivedStats,
  };
}

function renderClassPanel() {
  const select = document.getElementById("class-select");
  const levelStepper = document.getElementById("class-level-stepper");
  const levelInput = document.getElementById("class-level-input");
  const decreaseButton = document.getElementById("class-level-decrease");
  const increaseButton = document.getElementById("class-level-increase");
  const baseStatsContainer = document.getElementById("class-base-stats");
  const derivedStatsContainer = document.getElementById("class-derived-stats");
  if (!select || !levelStepper || !levelInput || !decreaseButton || !increaseButton || !baseStatsContainer || !derivedStatsContainer) {
    return;
  }

  const { config, baseStats, derivedStats } = getClassPanelData();
  select.value = state.classConfig.classKey;
  levelInput.value = String(state.classConfig.level);
  decreaseButton.disabled = state.classConfig.level <= 1;
  increaseButton.disabled = state.classConfig.level >= 200;

  baseStatsContainer.innerHTML = renderStatRows(baseStats);
  derivedStatsContainer.innerHTML = renderStatRows(derivedStats);
}

function getTotalStatsData() {
  const totalStats = new Map();
  const { numericStats, effects } = collectEquippedStats();
  const { config, baseStats, baseStatMap } = getClassPanelData();
  const effectiveAttributeMap = {
    ...baseStatMap,
  };

  ["Сила", "Ловкость", "Интеллект"].forEach((label) => {
    const bonus = numericStats.get(`${label}::`);
    if (!bonus) {
      return;
    }

    effectiveAttributeMap[label] = (effectiveAttributeMap[label] || 0) + bonus.value;
  });

  const derivedStats = config.derivedStats(effectiveAttributeMap);

  addStatCollection(totalStats, baseStats);
  addStatCollection(totalStats, derivedStats);
  addStatCollection(totalStats, [...numericStats.values()]);
  const { mainStats, secondaryStats } = getDisplayStatsFromMap(totalStats, { includeMainZeros: true });

  return {
    mainStats,
    secondaryStats,
    effects,
  };
}

function renderBoardTotalStats() {
  const mainContainer = document.getElementById("board-main-stats");
  const extraContainer = document.getElementById("board-extra-stats");
  if (!mainContainer || !extraContainer) {
    return;
  }

  const { mainStats, secondaryStats } = getTotalStatsData();
  const visibleMainStats = mainStats.filter((stat) => stat.value !== 0);
  const visibleSecondaryStats = secondaryStats.filter((stat) => stat.value !== 0);

  if (!visibleMainStats.length && !visibleSecondaryStats.length) {
    mainContainer.innerHTML = `<div class="board-stats-empty">${escapeHtml(t("empty.boardStats"))}</div>`;
    extraContainer.innerHTML = "";
    return;
  }

  mainContainer.innerHTML = visibleMainStats.length
    ? visibleMainStats.map((stat) => `
    <div class="board-stat-row board-stat-row-main">
      <span class="board-stat-name">${escapeHtml(localize(stat.label))}</span>
      <span class="board-stat-value">${escapeHtml(formatBoardPrimaryValue(stat))}</span>
    </div>
  `).join("")
    : "";

  extraContainer.innerHTML = visibleSecondaryStats.length
    ? visibleSecondaryStats.map((stat) => `
    <div class="board-stat-row board-stat-row-extra">
      <span class="board-stat-name">${escapeHtml(localize(stat.label))}</span>
      <span class="board-stat-value">${escapeHtml(formatStatValue(stat.value, stat.unit))}</span>
    </div>
  `).join("")
    : `<div class="board-stats-empty">${escapeHtml(t("empty.extraStats"))}</div>`;
}

function bindClassControls() {
  const select = document.getElementById("class-select");
  const levelInput = document.getElementById("class-level-input");
  const decreaseButton = document.getElementById("class-level-decrease");
  const increaseButton = document.getElementById("class-level-increase");
  if (!select || !levelInput || !decreaseButton || !increaseButton) {
    return;
  }

  const applyClassLevel = (nextLevel) => {
    state.classConfig.level = sanitizeClassLevel(nextLevel);
    saveClassState();
    renderClassPanel();
    renderBoardTotalStats();
  };

  select.addEventListener("change", () => {
    state.classConfig.classKey = CLASS_CONFIGS[select.value] ? select.value : "knight";
    sanitizeEquippedState();
    saveClassState();
    renderAll();
  });

  decreaseButton.addEventListener("click", () => applyClassLevel(state.classConfig.level - 1));
  increaseButton.addEventListener("click", () => applyClassLevel(state.classConfig.level + 1));

  levelInput.addEventListener("change", () => applyClassLevel(levelInput.value));
  levelInput.addEventListener("blur", () => applyClassLevel(levelInput.value));
  levelInput.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      applyClassLevel(state.classConfig.level + 1);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      applyClassLevel(state.classConfig.level - 1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      applyClassLevel(levelInput.value);
    }
  });
}

function renderProfileBar() {
  const buildPicker = document.getElementById("build-picker");
  const saveButton = document.getElementById("profile-save-button");
  const newButton = document.getElementById("profile-new-button");
  const compareLink = document.getElementById("profile-compare-link");
  if (!buildPicker || !saveButton || !newButton || !compareLink) {
    return;
  }

  const selectedSavedId = state.activeDraftSourceProfileId || state.activeProfileId;
  const canOpenMenu = !state.isBuildDirty && !state.isBuildNameEditing;
  const canCopy = !state.isBuildDirty && !state.isBuildNameEditing && state.activeDraftMode === "existing";
  const canDelete = canCopy && state.profiles.length > 1;
  const title = escapeHtml(getActiveDraftDisplayName());
  const saveStateLabel = state.isBuildDirty ? t("toolbar.unsaved") : t("toolbar.saved");
  const menuHtml = state.isBuildMenuOpen && canOpenMenu
    ? `
      <div class="build-picker-menu" data-build-menu>
        ${state.profiles.map((profile) => `
          <button
            type="button"
            class="build-picker-option ${profile.id === selectedSavedId ? "is-active" : ""}"
            data-build-option="${escapeHtml(profile.id)}"
          >
            <span class="build-picker-option-name">${escapeHtml(profile.name)}</span>
          </button>
        `).join("")}
      </div>
    `
    : "";

  const copyButtonHtml = canCopy
    ? `
      <button type="button" class="build-picker-icon-button" aria-label="${escapeHtml(t("toolbar.copyBuild"))}" title="${escapeHtml(t("toolbar.copyBuild"))}" data-build-copy>
        <svg viewBox="0 0 16 16" focusable="false"><rect x="5.5" y="3.5" width="7" height="9" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M3.5 11.5h-.8A1.2 1.2 0 0 1 1.5 10.3V3.7A1.2 1.2 0 0 1 2.7 2.5h5.6A1.2 1.2 0 0 1 9.5 3.7v.8" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>
      </button>
    `
    : "";
  const deleteButtonHtml = canDelete
    ? `
      <button type="button" class="build-picker-icon-button build-picker-icon-button-danger" aria-label="${escapeHtml(t("toolbar.deleteBuild"))}" title="${escapeHtml(t("toolbar.deleteBuild"))}" data-build-delete>
        <svg viewBox="0 0 16 16" focusable="false"><path d="M3 4.5h10m-8.2 0V3.3c0-.7.6-1.3 1.3-1.3h3.8c.7 0 1.3.6 1.3 1.3v1.2m-6 0v7.2c0 .8.6 1.3 1.3 1.3h3.4c.8 0 1.3-.5 1.3-1.3V4.5M6.6 6.8v3.8m2.8-3.8v3.8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.2"/></svg>
      </button>
    `
    : "";

  buildPicker.innerHTML = `
    <div class="build-picker-shell ${state.isBuildDirty ? "is-dirty" : ""} ${state.isBuildMenuOpen ? "is-open" : ""}">
      <div class="build-picker-main">
        <div class="build-picker-name-slot">
          ${state.isBuildNameEditing
            ? `
              <input
                id="build-name-input"
                class="build-picker-input"
                type="text"
                maxlength="40"
                value="${title}"
                aria-label="${escapeHtml(t("toolbar.buildName"))}"
                data-build-name-input
              >
            `
            : `
              <button
                type="button"
                class="build-picker-trigger"
                aria-expanded="${state.isBuildMenuOpen ? "true" : "false"}"
                ${canOpenMenu ? "" : "disabled"}
                data-build-trigger
              >
                <span class="build-picker-trigger-copy">
                  <span class="build-picker-trigger-label">${title}</span>
                  <span class="build-picker-trigger-state">${escapeHtml(saveStateLabel)}</span>
                </span>
                <span class="build-picker-chevron" aria-hidden="true">
                  <svg viewBox="0 0 16 16" focusable="false"><path d="M4 6.25 8 10.25 12 6.25" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"/></svg>
                </span>
              </button>
            `}
        </div>
        <div class="build-picker-tools">
          <button type="button" class="build-picker-icon-button" aria-label="${escapeHtml(t("toolbar.renameBuild"))}" title="${escapeHtml(t("toolbar.renameBuild"))}" data-build-edit>
            <svg viewBox="0 0 16 16" focusable="false"><path d="m10.9 2.2 2.9 2.9-7.6 7.6-3.6.7.7-3.6 7.6-7.6Zm0 0 1.2-1.2a1.4 1.4 0 0 1 2 0l.9.9a1.4 1.4 0 0 1 0 2l-1.2 1.2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"/></svg>
          </button>
          ${copyButtonHtml}
          ${deleteButtonHtml}
        </div>
      </div>
      ${menuHtml}
    </div>
  `;

  syncBuildToolbarState();

  if (state.isBuildNameEditing) {
    const input = buildPicker.querySelector("[data-build-name-input]");
    input?.focus();
    input?.setSelectionRange?.(input.value.length, input.value.length);
  }
}

function syncBuildToolbarState() {
  const buildPicker = document.getElementById("build-picker");
  const saveButton = document.getElementById("profile-save-button");
  const newButton = document.getElementById("profile-new-button");
  const compareLink = document.getElementById("profile-compare-link");
  if (!buildPicker || !saveButton || !newButton || !compareLink) {
    return;
  }

  const canOpenMenu = !state.isBuildDirty && !state.isBuildNameEditing;
  const activeProfile = getActiveProfile();

  buildPicker.querySelector(".build-picker-shell")?.classList.toggle("is-dirty", state.isBuildDirty);

  const trigger = buildPicker.querySelector("[data-build-trigger]");
  if (trigger) {
    trigger.disabled = !canOpenMenu;
  }

  saveButton.disabled = state.isBuildNameEditing || !state.isBuildDirty || !activeProfile;
  const shouldShowCancel = state.isBuildDirty || state.isBuildNameEditing;
  newButton.textContent = shouldShowCancel ? t("button.cancel") : t("button.newBuild");
  if (shouldShowCancel) {
    newButton.setAttribute("data-build-cancel", "");
    newButton.removeAttribute("data-build-new");
  } else {
    newButton.setAttribute("data-build-new", "");
    newButton.removeAttribute("data-build-cancel");
  }
  const isCompareDisabled = state.isBuildDirty || state.isBuildNameEditing;
  compareLink.classList.toggle("is-disabled", isCompareDisabled);
  compareLink.setAttribute("aria-disabled", isCompareDisabled ? "true" : "false");
  compareLink.tabIndex = isCompareDisabled ? -1 : 0;
  applyStaticLocalization();
}

function bindProfileControls() {
  const buildPicker = document.getElementById("build-picker");
  const saveButton = document.getElementById("profile-save-button");
  const newButton = document.getElementById("profile-new-button");
  const compareLink = document.getElementById("profile-compare-link");
  const languageSwitch = document.getElementById("language-switch");

  if (!buildPicker || !saveButton || !newButton || !compareLink) {
    return;
  }

  if (languageSwitch && languageSwitch.dataset.bound !== "1") {
    languageSwitch.dataset.bound = "1";
    languageSwitch.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const button = target.closest("[data-language]");
      if (!button) {
        return;
      }

      setLanguage(button.getAttribute("data-language") || "ru");
    });
  }

  if (buildPicker.dataset.bound !== "1") {
    buildPicker.dataset.bound = "1";

    buildPicker.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const optionButton = target.closest("[data-build-option]");
      if (optionButton) {
        setActiveProfile(optionButton.dataset.buildOption);
        return;
      }

      if (target.closest("[data-build-trigger]")) {
        toggleBuildMenu();
        return;
      }

      if (target.closest("[data-build-edit]")) {
        startBuildNameEditing();
        return;
      }

      if (target.closest("[data-build-copy]")) {
        copyActiveProfile();
        return;
      }

      if (target.closest("[data-build-delete]")) {
        deleteActiveProfile();
      }
    });

    buildPicker.addEventListener("input", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || !target.matches("[data-build-name-input]")) {
        return;
      }

      setActiveDraftName(target.value, { render: false });
      syncBuildToolbarState();
    });

    buildPicker.addEventListener("keydown", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || !target.matches("[data-build-name-input]")) {
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        finishBuildNameEditing(target.value);
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        cancelBuildNameEditing();
      }
    });

    buildPicker.addEventListener("focusout", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || !target.matches("[data-build-name-input]")) {
        return;
      }

      if (suppressBuildNameBlur) {
        suppressBuildNameBlur = false;
        target.focus();
        return;
      }

      const nextTarget = event.relatedTarget;
      if (nextTarget instanceof Element && buildPicker.contains(nextTarget)) {
        return;
      }

      finishBuildNameEditing(target.value);
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      const path = typeof event.composedPath === "function" ? event.composedPath() : [];
      if (path.includes(buildPicker) || (target instanceof Element && buildPicker.contains(target))) {
        return;
      }

      closeBuildMenu();
    });

    const preventBlockedBuildActionBlur = (event) => {
        const rawTarget = event.target;
        const target = rawTarget instanceof Element
          ? rawTarget
          : rawTarget instanceof Node
            ? rawTarget.parentElement
            : null;
        if (!target || !state.isBuildNameEditing) {
          suppressBuildNameBlur = false;
          return;
        }

        if (!saveButton.contains(target) && !compareLink.contains(target)) {
          suppressBuildNameBlur = false;
          return;
        }

        suppressBuildNameBlur = true;
        event.preventDefault();
      };
    document.addEventListener("pointerdown", preventBlockedBuildActionBlur, true);
    document.addEventListener("mousedown", preventBlockedBuildActionBlur, true);
  }

  if (saveButton.dataset.bound !== "1") {
    saveButton.dataset.bound = "1";
    saveButton.addEventListener("mousedown", (event) => {
      if (state.isBuildNameEditing) {
        event.preventDefault();
      }
    });
    saveButton.addEventListener("click", (event) => {
      if (state.isBuildNameEditing) {
        event.preventDefault();
        return;
      }

      saveActiveProfileExplicitly();
    });
  }

  if (newButton.dataset.bound !== "1") {
    newButton.dataset.bound = "1";
    newButton.addEventListener("click", () => {
      if (state.isBuildDirty) {
        cancelActiveBuildEdits();
        return;
      }

      createNewProfile();
    });
  }

  if (compareLink.dataset.bound !== "1") {
    compareLink.dataset.bound = "1";
    compareLink.addEventListener("mousedown", (event) => {
      if (state.isBuildDirty || state.isBuildNameEditing) {
        event.preventDefault();
      }
    });
    compareLink.addEventListener("click", (event) => {
      if (state.isBuildDirty || state.isBuildNameEditing) {
        event.preventDefault();
      }
    });
  }
}

function showBuildToast(message) {
  const toast = document.getElementById("build-save-toast");
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("is-visible");

  if (toastTimer) {
    window.clearTimeout(toastTimer);
  }

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2400);
}

function setLastAction(message) {
  state.lastAction = message;
  const actionEl = document.getElementById("last-action");
  if (actionEl) {
    actionEl.textContent = message;
  }
}

function renderSidebarTabs() {
  document.querySelectorAll(".sidebar-tab-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === state.activeSidebarTab);
  });

  document.querySelectorAll(".sidebar-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.tabPanel === state.activeSidebarTab);
  });
}

function renderWorkspaceTabs() {
  document.querySelectorAll(".workspace-tab").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.workspaceTab === state.activeWorkspaceTab);
  });

  document.querySelectorAll(".workspace-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.workspacePanel === state.activeWorkspaceTab);
  });

  document.querySelectorAll(".catalog-context-item").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.catalogContext === state.activeWorkspaceTab);
  });
}

function renderStatsSourceTabs() {
  document.querySelectorAll(".stats-source-tab").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.statsTab === state.activeStatsTab);
  });

  document.querySelectorAll(".stats-source-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.statsPanel === state.activeStatsTab);
  });
}

function setWorkspaceTab(tabKey) {
  if (!["inventory", "pet", "spheres", "trophies"].includes(tabKey)) {
    return;
  }

  state.activeWorkspaceTab = tabKey;
  saveWorkspaceTabState();
  renderAll();
}

function setSidebarTab(tabKey) {
  if (!["class", "stats"].includes(tabKey)) {
    return;
  }

  state.activeSidebarTab = tabKey;
  saveSidebarTabState();
  renderSidebarTabs();
}

function setStatsSourceTab(tabKey) {
  if (!["inventory", "pets", "spheres", "trophies", "sets", "effects"].includes(tabKey)) {
    return;
  }

  state.activeStatsTab = tabKey;
  renderStatsSourceTabs();
}

function bindSidebarTabs() {
  document.querySelectorAll(".sidebar-tab-button").forEach((button) => {
    button.addEventListener("click", () => setSidebarTab(button.dataset.tab));
  });
}

function bindStatsSourceTabs() {
  document.querySelectorAll(".stats-source-tab").forEach((button) => {
    if (button.dataset.bound === "1") {
      return;
    }

    button.dataset.bound = "1";
    button.addEventListener("click", () => setStatsSourceTab(button.dataset.statsTab));
  });
}

function bindWorkspaceTabs() {
  document.querySelectorAll(".workspace-tab:not(:disabled)").forEach((button) => {
    button.addEventListener("click", () => setWorkspaceTab(button.dataset.workspaceTab));
  });
}


  return {
    renderStatRows,
    renderSetBonusRows,
    renderEquipmentDescription,
    renderSphereDescription,
    renderTrophyDescription,
    getClassPanelData,
    renderStatsPanel,
    renderClassPanel,
    getTotalStatsData,
    renderBoardTotalStats,
    bindClassControls,
    renderProfileBar,
    bindProfileControls,
    showBuildToast,
    setLastAction,
    renderSidebarTabs,
    renderWorkspaceTabs,
    renderStatsSourceTabs,
    setWorkspaceTab,
    setSidebarTab,
    setStatsSourceTab,
    bindSidebarTabs,
    bindStatsSourceTabs,
    bindWorkspaceTabs,
  };
}
