// @ts-nocheck
import { CLASS_CONFIGS, CLASS_PRIMARY_ATTRIBUTES } from "../../../domain/stats/runtime-config";

export function createMainRenderModule(deps) {
  const {
    state,
    getActiveProfile,
    sanitizeProfileName,
    renameActiveProfile,
    setActiveProfile,
    saveActiveProfileExplicitly,
    copyActiveProfile,
    createNewProfile,
    deleteActiveProfile,
    saveProfilesState,
    saveWorkspaceTabState,
    saveSidebarTabState,
    saveClassState,
    renderAll,
    collectEquippedStats,
    getDisplayStatsFromMap,
    addStatCollection,
    formatBoardPrimaryValue,
    formatStatValue,
    getParamsForLevel,
    normalizeText,
    parseNumericStat,
    escapeHtml,
    formatUpgradeSuffix,
    shouldShowSphereUpgrade,
    getLevelKeys,
    CLASS_CONFIGS: runtimeClassConfigs = CLASS_CONFIGS,
    sanitizeClassLevel,
  } = deps;
  const CLASS_CONFIGS = runtimeClassConfigs;


function renderStatRows(stats) {
  return stats.map((stat) => {
    const rowClass = stat.value < 0 ? "is-negative" : "is-positive";
    return `
      <div class="stat-row ${rowClass}">
        <span class="stat-name">${escapeHtml(stat.label)}</span>
        <span class="stat-value">${escapeHtml(formatStatValue(stat.value, stat.unit))}</span>
      </div>
    `;
  }).join("");
}

function renderSetBonusRows(setBonuses) {
  if (!setBonuses.length) {
    return '<div class="empty-note">Сетовые бонусы не активны.</div>';
  }

  return setBonuses.map((bonus) => `
    <div class="set-bonus-card">
      <div class="set-bonus-title">${escapeHtml(bonus.name)}</div>
      <div class="set-bonus-meta">${bonus.itemCount} предметов · минимальная заточка +${bonus.setLevel}</div>
      <div class="stat-list stat-list-secondary">${renderStatRows(bonus.stats)}</div>
    </div>
  `).join("");
}

function renderEquipmentDescription(slot, item, level) {
  if (!item) {
    return "";
  }

  const params = getParamsForLevel(item, level);
  const descriptionLines = Array.isArray(item.description_lines)
    ? item.description_lines.filter((line) => normalizeText(line))
    : [];
  const currentParamLabels = new Set(
    params
      .map((line) => parseNumericStat(line))
      .filter(Boolean)
      .map((stat) => stat.label),
  );
  const mergedLines = [
    ...params,
    ...descriptionLines.filter((line) => {
      const parsed = parseNumericStat(line);
      if (!parsed) {
        return !params.includes(line);
      }
      return !currentParamLabels.has(parsed.label);
    }),
  ];
  const paramsHtml = mergedLines.length
    ? mergedLines.map((param) => `<li>${escapeHtml(param)}</li>`).join("")
    : "<li>Без параметров</li>";

  return `
    <div class="equipment-description-card">
      <div class="equipment-description-content">
        <div class="equipment-description-name">${escapeHtml(item.name)}${escapeHtml(formatUpgradeSuffix(level))}</div>
        <ul class="equipment-description-params">${paramsHtml}</ul>
      </div>
    </div>
  `;
}

function renderSphereDescription(slot, item, level) {
  if (!item) {
    return "";
  }

  const params = getParamsForLevel(item, level);
  const descriptionLines = Array.isArray(item.description_lines)
    ? item.description_lines.filter((line) => normalizeText(line))
    : [];
  const currentParamLabels = new Set(
    params
      .map((line) => parseNumericStat(line))
      .filter(Boolean)
      .map((stat) => stat.label),
  );
  const mergedLines = [
    ...params,
    ...descriptionLines.filter((line) => {
      const parsed = parseNumericStat(line);
      if (!parsed) {
        return !params.includes(line);
      }
      return !currentParamLabels.has(parsed.label);
    }),
  ];
  const paramsHtml = mergedLines.length
    ? mergedLines.map((param) => `<li>${escapeHtml(param)}</li>`).join("")
    : "<li>Без параметров</li>";
  const displayLevel = shouldShowSphereUpgrade(item, slot) && getLevelKeys(item).length > 1
    ? formatUpgradeSuffix(level)
    : "";

  return `
    <div class="equipment-description-card">
      <div class="equipment-description-content">
        <div class="equipment-description-name">${escapeHtml(item.name)}${escapeHtml(displayLevel)}</div>
        <ul class="equipment-description-params">${paramsHtml}</ul>
      </div>
    </div>
  `;
}

function renderTrophyDescription(slot, item, level) {
  if (!item) {
    return "";
  }

  const params = getParamsForLevel(item, level);
  const paramsHtml = params.length
    ? params.map((param) => `<li>${escapeHtml(param)}</li>`).join("")
    : "<li>Без параметров</li>";
  return `
    <div class="equipment-description-card">
      <div class="equipment-description-content">
        <div class="equipment-description-name">${escapeHtml(item.name)}${escapeHtml(formatUpgradeSuffix(level))}</div>
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
    : '<div class="empty-note">Инвентарь пока не даёт числовых параметров.</div>';
  petContainer.innerHTML = petStats.length
    ? renderStatRows(petStats)
    : '<div class="empty-note">Питомец пока не выбран.</div>';
  spheresContainer.innerHTML = sphereStats.length
    ? renderStatRows(sphereStats)
    : '<div class="empty-note">Сферы пока не дают числовых параметров.</div>';
  trophiesContainer.innerHTML = trophyStats.length
    ? renderStatRows(trophyStats)
    : '<div class="empty-note">Трофеи пока не дают числовых параметров.</div>';
  setContainer.innerHTML = renderSetBonusRows(setBonuses);
  effectsContainer.innerHTML = effects.length
    ? effects.map((effect) => `<div class="effect-pill">${escapeHtml(effect)}</div>`).join("")
    : '<div class="empty-note">Особые эффекты не найдены.</div>';
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
    mainContainer.innerHTML = '<div class="board-stats-empty">Надень предметы, чтобы увидеть итоговые параметры.</div>';
    extraContainer.innerHTML = "";
    return;
  }

  mainContainer.innerHTML = visibleMainStats.length
    ? visibleMainStats.map((stat) => `
    <div class="board-stat-row board-stat-row-main">
      <span class="board-stat-name">${escapeHtml(stat.label)}</span>
      <span class="board-stat-value">${escapeHtml(formatBoardPrimaryValue(stat))}</span>
    </div>
  `).join("")
    : "";

  extraContainer.innerHTML = visibleSecondaryStats.length
    ? visibleSecondaryStats.map((stat) => `
    <div class="board-stat-row board-stat-row-extra">
      <span class="board-stat-name">${escapeHtml(stat.label)}</span>
      <span class="board-stat-value">${escapeHtml(formatStatValue(stat.value, stat.unit))}</span>
    </div>
  `).join("")
    : '<div class="board-stats-empty">Дополнительных параметров нет.</div>';
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
    saveClassState();
    renderClassPanel();
    renderBoardTotalStats();
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
  const select = document.getElementById("profile-select");
  const nameInput = document.getElementById("profile-name-input");
  const saveButton = document.getElementById("profile-save-button");
  const copyButton = document.getElementById("profile-copy-button");
  const deleteButton = document.getElementById("profile-delete-button");
  if (!select || !nameInput || !deleteButton) {
    return;
  }

  const activeProfile = getActiveProfile();
  select.innerHTML = state.profiles.map((profile) => `
    <option value="${escapeHtml(profile.id)}" ${profile.id === state.activeProfileId ? "selected" : ""}>
      ${escapeHtml(profile.name)}
    </option>
  `).join("");

  nameInput.value = activeProfile?.name || "";
  if (saveButton) {
    saveButton.disabled = !activeProfile;
  }
  if (copyButton) {
    copyButton.disabled = !activeProfile;
  }
  deleteButton.disabled = state.profiles.length <= 1;
}

function bindProfileControls() {
  const select = document.getElementById("profile-select");
  const nameInput = document.getElementById("profile-name-input");
  const saveButton = document.getElementById("profile-save-button");
  const copyButton = document.getElementById("profile-copy-button");
  const newButton = document.getElementById("profile-new-button");
  const deleteButton = document.getElementById("profile-delete-button");

  if (!select || !nameInput || !saveButton || !copyButton || !newButton || !deleteButton) {
    return;
  }

  if (select.dataset.bound !== "1") {
    select.dataset.bound = "1";
    select.addEventListener("change", () => setActiveProfile(select.value));
  }

  if (nameInput.dataset.bound !== "1") {
    nameInput.dataset.bound = "1";
    nameInput.addEventListener("input", () => {
      const profile = getActiveProfile();
      if (!profile) {
        return;
      }

      profile.name = sanitizeProfileName(nameInput.value, profile.name);
      profile.updatedAt = Date.now();
      saveProfilesState();
      const option = select.selectedOptions[0];
      if (option) {
        option.textContent = profile.name;
      }
    });
    nameInput.addEventListener("change", () => renameActiveProfile(nameInput.value));
    nameInput.addEventListener("blur", () => renameActiveProfile(nameInput.value));
  }

  if (saveButton.dataset.bound !== "1") {
    saveButton.dataset.bound = "1";
    saveButton.addEventListener("click", saveActiveProfileExplicitly);
  }

  if (copyButton.dataset.bound !== "1") {
    copyButton.dataset.bound = "1";
    copyButton.addEventListener("click", copyActiveProfile);
  }

  if (newButton.dataset.bound !== "1") {
    newButton.dataset.bound = "1";
    newButton.addEventListener("click", createNewProfile);
  }

  if (deleteButton.dataset.bound !== "1") {
    deleteButton.dataset.bound = "1";
    deleteButton.addEventListener("click", deleteActiveProfile);
  }
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
