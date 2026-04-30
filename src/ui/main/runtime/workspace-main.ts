// @ts-nocheck
import { SLOT_CONFIG, PASSIVE_MORPH_RING_SLOT_KEY } from "../../../domain/equipment/config";
import { SPHERE_SLOT_CONFIG, SPHERE_CATEGORY_CONFIG, SPHERE_TYPE_ONE_TABS } from "../../../domain/spheres/config";
import { TROPHY_SLOT_CONFIG } from "../../../domain/trophies/config";
import { PET_CATEGORY_CONFIG, PET_MERGE_CONFIG, PET_MERGE_TOTAL_LIMIT } from "../../../domain/pets/config";

export function createMainWorkspaceModule(deps) {
  const {
    state,
    renderAll,
    setLastAction,
    getSlotConfig,
    matchesEquipmentSlot,
    getDefaultUpgradeLevel,
    saveEquippedState,
    getValidUpgradeLevel,
    getAdjacentUpgradeLevel,
    getItemsForEquipmentSlot,
    getLevelKeys,
    formatUpgradeTitleSuffix,
    renderUpgradeStepperControl,
    escapeHtml,
    renderEquipmentDescription,
    getSphereSlotConfig,
    getSphereItemsForSlot,
    getSphereCategoryGroups,
    getPrimarySphereSlot,
    getMorphSphereRequiredLevel,
    isSphereAllowedForLevel,
    shouldShowSphereUpgrade,
    shouldDisplayUpgradeLevel,
    renderSphereDescription,
    getSphereTypeOneTabForSlot,
    saveSphereEquippedState,
    getTrophySlotConfig,
    getTrophyItemsForSlot,
    renderTrophyDescription,
    saveTrophyEquippedState,
    getPetCategoryGroups,
    getParamsForLevel,
    normalizeText,
    renderItemIcon,
    renderStatRows,
    getEquippedPet,
    getPetMergeCounts,
    getPetMergeTotal,
    getPetMergeBonusValue,
    formatStatValue,
    createCollectedStatsBucket,
    collectItemParamsIntoBucket,
    addStatWithRules,
    getDisplayStatsFromMap,
    getPetMergeStats,
    savePetEquippedState,
    createPetSelection,
    localizeText,
    t,
  } = deps;

function localize(value) {
  return localizeText(value);
}

function scrollCategoryIntoView(slotKey) {
  const block = document.querySelector(`.category-block[data-slot="${slotKey}"]`);
  block?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}


function equipItem(slotKey, itemId) {
  const slot = getSlotConfig(slotKey);
  const item = state.itemsById.get(String(itemId));
  if (!slot || !item) return;
  if (!matchesEquipmentSlot(slot, item, state.classConfig.classKey, state.equipped)) {
    setLastAction(`${slot.label}: этот предмет сейчас нельзя надеть.`);
    return;
  }

  state.equipped[slotKey] = {
    itemId: String(item.uid),
    upgradeLevel: getDefaultUpgradeLevel(item),
  };
  state.activeSlot = slotKey;
  state.expandedCategories = new Set([slotKey]);
  saveEquippedState();
  renderAll();
  setLastAction(`${slot.label}: надет предмет "${item.name}".`);
}

function clearSlot(slotKey) {
  const slot = getSlotConfig(slotKey);
  delete state.equipped[slotKey];
  saveEquippedState();
  renderAll();
  if (slot) {
    setLastAction(`${slot.label}: предмет снят.`);
  }
}

function setUpgradeLevel(slotKey, level) {
  const slot = getSlotConfig(slotKey);
  const selected = state.equipped[slotKey];
  if (!selected) return;

  const item = state.itemsById.get(selected.itemId);
  if (!item) return;

  selected.upgradeLevel = getValidUpgradeLevel(item, level);
  saveEquippedState();
  renderAll();
  if (slot) {
    setLastAction(`${slot.label}: уровень заточки переключён на ${selected.upgradeLevel}.`);
  }
}

function stepUpgradeLevel(slotKey, delta) {
  const selected = state.equipped[slotKey];
  if (!selected) {
    return;
  }

  const item = state.itemsById.get(selected.itemId);
  if (!item) {
    return;
  }

  const nextLevel = getAdjacentUpgradeLevel(item, selected.upgradeLevel, delta);
  if (nextLevel !== selected.upgradeLevel) {
    setUpgradeLevel(slotKey, nextLevel);
  }
}

function handleSlotPress(event, slotKey) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  handleDollSlotClick(slotKey);
}

function handleSlotRemove(event, slotKey) {
  if (event.key !== "Delete" && event.key !== "Backspace") {
    return;
  }

  if (!state.equipped[slotKey]) {
    return;
  }

  event.preventDefault();
  clearSlot(slotKey);
}

function handleDollSlotClick(slotKey) {
  const slot = getSlotConfig(slotKey);
  const isEquipped = Boolean(state.equipped[slotKey]);

  if (isEquipped) {
    selectSlot(slotKey, { scroll: false });
    if (slot) {
      setLastAction(`${slot.label}: выберите проточку справа сверху или снимите предмет правой кнопкой.`);
    }
    return;
  }

  selectSlot(slotKey, { scroll: true });
}

function selectSlot(slotKey, { scroll = false } = {}) {
  const slot = getSlotConfig(slotKey);
  if (!slot) return;

  state.activeSlot = slotKey;
  state.expandedCategories = new Set([slotKey]);
  renderAll();

  if (scroll) {
    scrollCategoryIntoView(slotKey);
  }

  const count = getItemsForEquipmentSlot(slot).length;
  if (count) {
    setLastAction(`${slot.label}: доступно ${count} предметов.`);
  } else {
    setLastAction(`${slot.label}: для этого слота пока нет предметов.`);
  }
}

function renderDollSlots() {
  const container = document.getElementById("slot-grid");
  if (!container) return;

  const visibleSlots = SLOT_CONFIG.filter((slot) => slot.renderOnDoll !== false);

  container.innerHTML = visibleSlots.map((slot) => {
    const items = getItemsForEquipmentSlot(slot);
    const selected = state.equipped[slot.key];
    const item = selected ? state.itemsById.get(selected.itemId) : null;
    const level = item ? getValidUpgradeLevel(item, selected.upgradeLevel) : null;
    const levels = item ? getLevelKeys(item) : [];

    const classes = ["slot-cell"];
    if (state.activeSlot === slot.key) classes.push("is-active");
    if (item) classes.push("is-filled");
    if (!items.length) classes.push("is-unavailable");

    const ariaText = item
      ? `${localize(slot.label)}: ${localize(item.name)}${formatUpgradeTitleSuffix(level)}`
      : items.length
        ? `${localize(slot.label)}: ${localize(`${items.length} предметов`)}`
        : `${localize(slot.label)}: ${localize("данных нет")}`;
    const imageHtml = item?.image
      ? `<img class="slot-item-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(localize(item.name))}" loading="lazy">`
      : "";
    const upgradeControl = item
      ? renderUpgradeStepperControl(
          "slot-upgrade-select",
          item,
          level,
          { "upgrade-type": "inventory", slot: slot.key },
          localize(`Уровень заточки ${slot.label}`),
        )
      : "";
    const descriptionHtml = item
      ? `<div class="equipment-description">${renderEquipmentDescription(slot, item, level)}</div>`
      : "";

    return `
      <div
        class="${classes.join(" ")}"
        data-slot="${slot.key}"
        style="grid-column: ${slot.col}; grid-row: ${slot.row};"
      >
        <button
          type="button"
          class="slot-pin"
          data-slot="${slot.key}"
          aria-label="${escapeHtml(ariaText)}"
        >
          <span class="slot-item-visual" aria-hidden="true">${imageHtml}</span>
        </button>
        ${upgradeControl}
        ${descriptionHtml}
      </div>
    `;
  }).join("");

  container.querySelectorAll(".slot-pin").forEach((button) => {
    button.addEventListener("click", () => handleDollSlotClick(button.dataset.slot));
    button.addEventListener("keydown", (event) => {
      handleSlotPress(event, button.dataset.slot);
      handleSlotRemove(event, button.dataset.slot);
    });
    button.addEventListener("contextmenu", (event) => {
      const slotKey = button.dataset.slot;
      if (!state.equipped[slotKey]) {
        return;
      }

      event.preventDefault();
      clearSlot(slotKey);
    });
  });

  container.querySelectorAll('[data-upgrade-type="inventory"][data-upgrade-delta]').forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      stepUpgradeLevel(button.dataset.slot, Number(button.dataset.upgradeDelta || 0));
    });
  });
  container.querySelectorAll(".slot-upgrade-select").forEach((control) => {
    control.addEventListener("click", (event) => event.stopPropagation());
    control.addEventListener("keydown", (event) => event.stopPropagation());
  });
}

function renderPassiveMorphRingSlot() {
  const container = document.getElementById("passive-ring-slot");
  if (!container) {
    return;
  }

  const slot = getSlotConfig(PASSIVE_MORPH_RING_SLOT_KEY);
  if (!slot) {
    container.innerHTML = "";
    return;
  }

  const items = getItemsForEquipmentSlot(slot);
  const selected = state.equipped[slot.key];
  const item = selected ? state.itemsById.get(selected.itemId) : null;
  const level = item ? getValidUpgradeLevel(item, selected.upgradeLevel) : null;
  const levels = item ? getLevelKeys(item) : [];
  const classes = ["slot-cell", "passive-slot-cell"];

  if (state.activeSlot === slot.key) {
    classes.push("is-active");
  }
  if (item) {
    classes.push("is-filled");
  }
  if (!items.length) {
    classes.push("is-unavailable");
  }

  const titleText = item
      ? `${localize(slot.label)}: ${localize(item.name)}${formatUpgradeTitleSuffix(level)}`
    : items.length
      ? `${localize(slot.label)}: ${localize(`${items.length} колец`)}`
      : `${localize(slot.label)}: ${localize("данных нет")}`;
  const imageHtml = item?.image
    ? `<img class="slot-item-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(localize(item.name))}" loading="lazy">`
    : "";
  const upgradeControl = item
    ? renderUpgradeStepperControl(
        "slot-upgrade-select",
        item,
        level,
        { "upgrade-type": "inventory", slot: slot.key },
        localize(`Уровень заточки ${slot.label}`),
      )
    : "";
  const descriptionHtml = item
    ? `<div class="equipment-description">${renderEquipmentDescription(slot, item, level)}</div>`
    : "";

  container.innerHTML = `
    <div class="passive-slot-card ${state.activeSlot === slot.key ? "is-active" : ""}">
      <div class="passive-slot-copy">
        <div class="passive-slot-title">${escapeHtml(localize(slot.label))}</div>
        <div class="passive-slot-note">${escapeHtml(localize("Наденьте кольцо для пассивного эффекта."))}</div>
      </div>
      <div class="${classes.join(" ")}" data-slot="${slot.key}">
        <button
          type="button"
          class="slot-pin"
          data-slot="${slot.key}"
          aria-label="${escapeHtml(titleText)}"
          title="${escapeHtml(titleText)}"
        >
          <span class="slot-item-visual" aria-hidden="true">${imageHtml}</span>
        </button>
        ${upgradeControl}
        ${descriptionHtml}
      </div>
    </div>
  `;

  container.querySelectorAll(".slot-pin").forEach((button) => {
    button.addEventListener("click", () => handleDollSlotClick(button.dataset.slot));
    button.addEventListener("keydown", (event) => {
      handleSlotPress(event, button.dataset.slot);
      handleSlotRemove(event, button.dataset.slot);
    });
    button.addEventListener("contextmenu", (event) => {
      const slotKey = button.dataset.slot;
      if (!state.equipped[slotKey]) {
        return;
      }

      event.preventDefault();
      clearSlot(slotKey);
    });
  });

  container.querySelectorAll(".slot-upgrade-select").forEach((control) => {
    control.addEventListener("click", (event) => event.stopPropagation());
    control.addEventListener("keydown", (event) => event.stopPropagation());
  });
  container.querySelectorAll('[data-upgrade-type="inventory"][data-upgrade-delta]').forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      stepUpgradeLevel(button.dataset.slot, Number(button.dataset.upgradeDelta || 0));
    });
  });
}

function togglePetCategory(categoryKey) {
  const category = PET_CATEGORY_CONFIG.find((entry) => entry.key === categoryKey);
  if (!category) {
    return;
  }

  state.activePetCategory = category.key;
  state.expandedPetCategories = state.expandedPetCategories.has(category.key)
    ? new Set()
    : new Set([category.key]);
  renderAll();
  setLastAction(`${category.label}: список ${state.expandedPetCategories.has(category.key) ? "открыт" : "свёрнут"}.`);
}

function equipPet(itemId) {
  const item = state.petItemsById.get(String(itemId));
  if (!item) {
    return;
  }

  state.petEquipped = createPetSelection(item.uid, state.petEquipped?.mergeCounts);
  state.activePetCategory = item.variant || getFirstAvailablePetCategoryKey();
  state.expandedPetCategories = new Set(state.activePetCategory ? [state.activePetCategory] : []);
  savePetEquippedState();
  renderAll();
  setLastAction(`Питомец "${item.name}" выбран.`);
}

function clearPet() {
  const current = getEquippedPet();
  state.petEquipped = null;
  savePetEquippedState();
  renderAll();
  setLastAction(current ? `Питомец "${current.name}" снят.` : "Питомец снят.");
}

function changePetMergeCount(mergeKey, delta) {
  const pet = getEquippedPet();
  const mergeConfig = PET_MERGE_CONFIG.find((entry) => entry.key === mergeKey);
  if (!pet || !mergeConfig) {
    return;
  }

  const currentCounts = getPetMergeCounts();
  const currentValue = currentCounts[mergeKey] || 0;
  const totalWithoutCurrent = getPetMergeTotal(currentCounts) - currentValue;
  const nextValue = Math.min(
    PET_MERGE_TOTAL_LIMIT,
    Math.max(0, currentValue + Number(delta || 0)),
  );
  const cappedValue = Math.min(nextValue, PET_MERGE_TOTAL_LIMIT - totalWithoutCurrent);

  if (cappedValue === currentValue) {
    return;
  }

  if (cappedValue > 0) {
    currentCounts[mergeKey] = cappedValue;
  } else {
    delete currentCounts[mergeKey];
  }

  state.petEquipped = createPetSelection(pet.uid, currentCounts);
  savePetEquippedState();
  renderAll();

  const totalBonus = getPetMergeBonusValue(mergeConfig, cappedValue);
  setLastAction(`Слияние "${mergeConfig.label}": ${cappedValue}. Бонус ${mergeConfig.statLabel} ${formatStatValue(totalBonus, mergeConfig.unit)}.`);
}

function getPetWorkspaceData(item, selection = state.petEquipped) {
  const bucket = createCollectedStatsBucket();
  collectItemParamsIntoBucket(item, { upgradeLevel: getDefaultUpgradeLevel(item) }, bucket);
  getPetMergeStats(selection?.mergeCounts).forEach((stat) => addStatWithRules(bucket.numericStats, stat));

  return {
    stats: getDisplayStatsFromMap(bucket.numericStats).allStats,
    mergeStats: getPetMergeStats(selection?.mergeCounts),
    mergeTotal: getPetMergeTotal(selection?.mergeCounts),
    effects: [...bucket.effects.values()].sort((a, b) => localize(a).localeCompare(localize(b), state.language || "ru")),
  };
}

function renderPetMergeTable(selection = state.petEquipped) {
  const mergeCounts = getPetMergeCounts(selection);
  const totalUsed = getPetMergeTotal(mergeCounts);

  return `
    <section class="pet-card-section">
      <div class="stats-subtitle-row stats-subtitle-row-split">
        <h3>${escapeHtml(localize("Слияние питомца"))}</h3>
        <span class="pet-merge-total-note">${escapeHtml(localize("Использовано"))} ${totalUsed}/${PET_MERGE_TOTAL_LIMIT}</span>
      </div>
      <div class="pet-merge-table-wrap">
        <table class="pet-merge-table">
          <tbody>
            ${PET_MERGE_CONFIG.map((entry) => {
              const count = mergeCounts[entry.key] || 0;
              const totalWithoutCurrent = totalUsed - count;
              const canDecrease = count > 0;
              const canIncrease = count < PET_MERGE_TOTAL_LIMIT && totalWithoutCurrent + count < PET_MERGE_TOTAL_LIMIT;
              const bonus = getPetMergeBonusValue(entry, count);

              return `
                <tr>
                  <td>
                    <div class="pet-merge-element">${escapeHtml(entry.label)}</div>
                  </td>
                  <td>
                    <div class="pet-merge-stat">${escapeHtml(entry.statLabel)}</div>
                  </td>
                  <td>
                    <div class="pet-merge-controls">
                      <button type="button" class="pet-merge-btn" data-pet-merge-key="${escapeHtml(entry.key)}" data-pet-merge-delta="-1" ${canDecrease ? "" : "disabled"} aria-label="${escapeHtml(localize(`Уменьшить ${entry.label}`))}">-</button>
                      <span class="pet-merge-count">${count}</span>
                      <button type="button" class="pet-merge-btn" data-pet-merge-key="${escapeHtml(entry.key)}" data-pet-merge-delta="1" ${canIncrease ? "" : "disabled"} aria-label="${escapeHtml(localize(`Увеличить ${entry.label}`))}">+</button>
                    </div>
                  </td>
                  <td>
                    <div class="pet-merge-bonus">${escapeHtml(formatStatValue(bonus, entry.unit))}</div>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderPetWorkspace() {
  const container = document.getElementById("pet-stage");
  if (!container) {
    return;
  }

  const pet = getEquippedPet();
  if (!pet) {
    container.innerHTML = `
      <div class="pet-stage-empty">
        <div class="empty-note">${escapeHtml(localize("Выберите питомца в каталоге справа."))}</div>
      </div>
    `;
    return;
  }

  const { stats, effects } = getPetWorkspaceData(pet, state.petEquipped);
  const subtitle = localize(normalizeText(pet.description_lines?.[0]) || `${pet.element} (${pet.variant})`);
  const categoryLabel = localize(PET_CATEGORY_CONFIG.find((entry) => entry.key === pet.variant)?.label || pet.category);

  container.innerHTML = `
    <article class="pet-card">
      <div class="pet-card-head">
        <div class="pet-card-portrait">
          <img src="${escapeHtml(pet.image)}" alt="${escapeHtml(localize(pet.name))}" loading="lazy">
        </div>
        <div class="pet-card-copy">
          <div class="pet-card-kicker">${escapeHtml(categoryLabel)}</div>
          <div class="pet-card-title-row">
            <h3>${escapeHtml(localize(pet.name))}</h3>
            <button type="button" class="pet-remove-btn" data-pet-clear="1">${escapeHtml(localize("Снять"))}</button>
          </div>
          <div class="pet-card-meta">${escapeHtml(subtitle)}</div>
        </div>
      </div>

      <section class="pet-card-section">
        <div class="stats-subtitle-row">
          <h3>${escapeHtml(t("stats.petValues"))}</h3>
        </div>
        <div class="stat-list stat-list-secondary">
          ${stats.length ? renderStatRows(stats) : `<div class="empty-note">${escapeHtml(localize("Питомец не даёт числовых параметров."))}</div>`}
        </div>
      </section>

      ${renderPetMergeTable(state.petEquipped)}

      ${effects.length ? `
        <section class="pet-card-section">
          <div class="stats-subtitle-row">
            <h3>Особые эффекты</h3>
          </div>
          <div class="effects-list">
            ${effects.map((effect) => `<div class="effect-pill">${escapeHtml(effect)}</div>`).join("")}
          </div>
        </section>
      ` : ""}
    </article>
  `;

  container.querySelectorAll("[data-pet-clear]").forEach((button) => {
    button.addEventListener("click", () => clearPet());
  });
  container.querySelectorAll("[data-pet-merge-key]").forEach((button) => {
    button.addEventListener("click", () => changePetMergeCount(button.dataset.petMergeKey, Number(button.dataset.petMergeDelta || 0)));
  });
}

function selectSphereSlot(slotKey) {
  const slot = getSphereSlotConfig(slotKey);
  if (!slot) {
    return;
  }

  state.activeSphereSlot = slotKey;
  state.expandedSphereCategories = new Set([slot.categoryKey]);
  if (slot.categoryKey === "sphere_type_1") {
    state.activeSphereTypeOneTab = getSphereTypeOneTabForSlot(slotKey);
  }
  renderAll();

  const count = getSphereItemsForSlot(slotKey).length;
  if (count) {
    setLastAction(`${slot.label}: доступно ${count} сфер.`);
  } else {
    setLastAction(`${slot.label}: для этого слота пока нет сфер.`);
  }
}

function equipSphere(slotKey, itemId) {
  const slot = getSphereSlotConfig(slotKey);
  const item = state.sphereItemsById.get(String(itemId));
  if (!slot || !item || !slot.matches(item)) {
    return;
  }
  if (!isSphereAllowedForLevel(item, state.classConfig.level)) {
    setLastAction(`${slot.label}: этот предмет сейчас нельзя надеть.`);
    return;
  }

  state.sphereEquipped[slotKey] = {
    itemId: String(item.uid),
    upgradeLevel: getDefaultUpgradeLevel(item),
  };
  state.activeSphereSlot = slotKey;
  state.expandedSphereCategories = new Set([slot.categoryKey]);
  if (slot.categoryKey === "sphere_type_1") {
    state.activeSphereTypeOneTab = getSphereTypeOneTabForSlot(slotKey);
  }
  saveSphereEquippedState();
  renderAll();
  setLastAction(`${slot.label}: вставлена "${item.name}".`);
}

function clearSphereSlot(slotKey) {
  const slot = getSphereSlotConfig(slotKey);
  delete state.sphereEquipped[slotKey];
  saveSphereEquippedState();
  renderAll();
  if (slot) {
    setLastAction(`${slot.label}: сфера снята.`);
  }
}

function setSphereUpgradeLevel(slotKey, level) {
  const slot = getSphereSlotConfig(slotKey);
  const selected = state.sphereEquipped[slotKey];
  if (!selected) {
    return;
  }

  const item = state.sphereItemsById.get(selected.itemId);
  if (!item) {
    return;
  }

  selected.upgradeLevel = getValidUpgradeLevel(item, level);
  saveSphereEquippedState();
  renderAll();
  if (slot) {
    setLastAction(`${slot.label}: уровень сферы переключён на ${selected.upgradeLevel}.`);
  }
}

function stepSphereUpgradeLevel(slotKey, delta) {
  const selected = state.sphereEquipped[slotKey];
  if (!selected) {
    return;
  }

  const item = state.sphereItemsById.get(selected.itemId);
  if (!item) {
    return;
  }

  const nextLevel = getAdjacentUpgradeLevel(item, selected.upgradeLevel, delta);
  if (nextLevel !== selected.upgradeLevel) {
    setSphereUpgradeLevel(slotKey, nextLevel);
  }
}

function renderSphereSlots() {
  const container = document.getElementById("sphere-slot-grid");
  if (!container) {
    return;
  }

  container.innerHTML = SPHERE_SLOT_CONFIG.map((slot) => {
    const items = getSphereItemsForSlot(slot.key);
    const selected = state.sphereEquipped[slot.key];
    const item = selected ? state.sphereItemsById.get(selected.itemId) : null;
    const level = item ? getValidUpgradeLevel(item, selected.upgradeLevel) : null;
    const levels = item ? getLevelKeys(item) : [];
    const showUpgrade = item ? shouldShowSphereUpgrade(item, slot) : false;

    const classes = ["sphere-slot-cell", slot.positionClass];
    if (state.activeSphereSlot === slot.key) {
      classes.push("is-active");
    }
    if (item) {
      classes.push("is-filled");
    }
    if (!items.length) {
      classes.push("is-unavailable");
    }

    const imageHtml = item?.image
      ? `<img class="sphere-slot-item-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(localize(item.name))}" loading="lazy">`
      : "";
    const titleText = item
      ? `${localize(slot.label)}: ${localize(item.name)}${showUpgrade ? formatUpgradeTitleSuffix(level) : ""}`
      : items.length
        ? `${localize(slot.label)}: ${localize(`${items.length} сфер`)}`
        : `${localize(slot.label)}: ${localize("данных нет")}`;
    const descriptionHtml = item
      ? `<div class="equipment-description sphere-description">${renderSphereDescription(slot, item, level)}</div>`
      : "";
    const upgradeControl = item && showUpgrade
      ? renderUpgradeStepperControl(
          "sphere-upgrade-select",
          item,
          level,
          { "upgrade-type": "sphere", "sphere-slot": slot.key },
          localize(`Уровень сферы ${slot.label}`),
        )
      : "";

    return `
      <div class="${classes.join(" ")}" data-sphere-slot="${slot.key}">
        <button
          type="button"
          class="sphere-slot-button"
          data-sphere-slot="${slot.key}"
          aria-label="${escapeHtml(titleText)}"
          title="${escapeHtml(titleText)}"
        >
          <span class="sphere-slot-item-visual" aria-hidden="true">${imageHtml}</span>
        </button>
        ${upgradeControl}
        ${descriptionHtml}
      </div>
    `;
  }).join("");

  container.querySelectorAll(".sphere-slot-button").forEach((button) => {
    button.addEventListener("click", () => selectSphereSlot(button.dataset.sphereSlot));
    button.addEventListener("contextmenu", (event) => {
      const slotKey = button.dataset.sphereSlot;
      if (!state.sphereEquipped[slotKey]) {
        return;
      }

      event.preventDefault();
      clearSphereSlot(slotKey);
    });
  });

  container.querySelectorAll(".sphere-upgrade-select").forEach((control) => {
    control.addEventListener("click", (event) => event.stopPropagation());
    control.addEventListener("keydown", (event) => event.stopPropagation());
  });
  container.querySelectorAll('[data-upgrade-type="sphere"][data-upgrade-delta]').forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      stepSphereUpgradeLevel(button.dataset.sphereSlot, Number(button.dataset.upgradeDelta || 0));
    });
  });
}

function selectTrophySlot(slotKey) {
  const slot = getTrophySlotConfig(slotKey);
  if (!slot) {
    return;
  }

  state.activeTrophySlot = slotKey;
  renderAll();
  setLastAction(`${slot.label}: слот выбран.`);
}

function equipTrophy(slotKey, itemId) {
  const slot = getTrophySlotConfig(slotKey);
  const item = state.trophyItemsById.get(String(itemId));
  if (!slot || !item || item.slot_code !== slot.key) {
    return;
  }

  state.trophyEquipped[slotKey] = {
    itemId: String(item.uid),
    upgradeLevel: getDefaultUpgradeLevel(item),
  };
  state.activeTrophySlot = slotKey;
  saveTrophyEquippedState();
  renderAll();
  setLastAction(`${slot.label}: установлен "${item.name}".`);
}

function clearTrophySlot(slotKey) {
  const slot = getTrophySlotConfig(slotKey);
  delete state.trophyEquipped[slotKey];
  saveTrophyEquippedState();
  renderAll();
  if (slot) {
    setLastAction(`${slot.label}: трофей снят.`);
  }
}

function setTrophyUpgradeLevel(slotKey, level) {
  const slot = getTrophySlotConfig(slotKey);
  const selected = state.trophyEquipped[slotKey];
  if (!selected) {
    return;
  }

  const item = state.trophyItemsById.get(selected.itemId);
  if (!item) {
    return;
  }

  selected.upgradeLevel = getValidUpgradeLevel(item, level);
  saveTrophyEquippedState();
  renderAll();
  if (slot) {
    setLastAction(`${slot.label}: усиление трофея переключено на ${selected.upgradeLevel}.`);
  }
}

function stepTrophyUpgradeLevel(slotKey, delta) {
  const selected = state.trophyEquipped[slotKey];
  if (!selected) {
    return;
  }

  const item = state.trophyItemsById.get(selected.itemId);
  if (!item) {
    return;
  }

  const nextLevel = getAdjacentUpgradeLevel(item, selected.upgradeLevel, delta);
  if (nextLevel !== selected.upgradeLevel) {
    setTrophyUpgradeLevel(slotKey, nextLevel);
  }
}

function renderTrophySlots() {
  const container = document.getElementById("trophy-slot-grid");
  if (!container) {
    return;
  }

  container.innerHTML = TROPHY_SLOT_CONFIG.map((slot) => {
    const items = getTrophyItemsForSlot(slot.key);
    const selected = state.trophyEquipped[slot.key];
    const item = selected ? state.trophyItemsById.get(selected.itemId) : null;
    const level = item ? getValidUpgradeLevel(item, selected.upgradeLevel) : null;
    const levels = item ? getLevelKeys(item) : [];
    const classes = ["trophy-slot-cell", slot.positionClass];
    if (state.activeTrophySlot === slot.key) {
      classes.push("is-active");
    }
    if (item) {
      classes.push("is-filled");
    }

    const imageHtml = item?.image
      ? `<img class="trophy-slot-item-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(localize(item.name))}" loading="lazy">`
      : "";
    const titleText = item
      ? `${localize(slot.label)}: ${localize(item.name)}${formatUpgradeTitleSuffix(level)}`
      : items.length
        ? `${localize(slot.label)}: ${localize(`${items.length} трофей`)}`
        : `${localize(slot.label)}: ${localize("данных нет")}`;
    const descriptionHtml = item
      ? `<div class="equipment-description trophy-description">${renderTrophyDescription(slot, item, level)}</div>`
      : "";
    const upgradeControl = item
      ? renderUpgradeStepperControl(
          "trophy-upgrade-select",
          item,
          level,
          { "upgrade-type": "trophy", "trophy-slot": slot.key },
          localize(`Усиление трофея ${slot.label}`),
        )
      : "";

    return `
      <div class="${classes.join(" ")}" data-trophy-slot="${slot.key}">
        <button
          type="button"
          class="trophy-slot-button"
          data-trophy-slot="${slot.key}"
          aria-label="${escapeHtml(titleText)}"
          title="${escapeHtml(titleText)}"
        >
          <span class="trophy-slot-item-visual" aria-hidden="true">${imageHtml}</span>
        </button>
        ${upgradeControl}
        ${descriptionHtml}
      </div>
    `;
  }).join("");

  container.querySelectorAll(".trophy-slot-button").forEach((button) => {
    button.addEventListener("click", () => selectTrophySlot(button.dataset.trophySlot));
    button.addEventListener("contextmenu", (event) => {
      const slotKey = button.dataset.trophySlot;
      if (!state.trophyEquipped[slotKey]) {
        return;
      }

      event.preventDefault();
      clearTrophySlot(slotKey);
    });
  });

  container.querySelectorAll(".trophy-upgrade-select").forEach((control) => {
    control.addEventListener("click", (event) => event.stopPropagation());
    control.addEventListener("keydown", (event) => event.stopPropagation());
  });
  container.querySelectorAll('[data-upgrade-type="trophy"][data-upgrade-delta]').forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      stepTrophyUpgradeLevel(button.dataset.trophySlot, Number(button.dataset.upgradeDelta || 0));
    });
  });
}

function toggleCategory(slotKey) {
  const slot = getSlotConfig(slotKey);
  if (state.expandedCategories.has(slotKey)) {
    state.expandedCategories = new Set();
  } else {
    state.expandedCategories = new Set([slotKey]);
  }

  state.activeSlot = slotKey;
  renderAll();

  if (slot) {
    const isExpanded = state.expandedCategories.has(slotKey);
    setLastAction(`${slot.label}: список ${isExpanded ? "открыт" : "свёрнут"}.`);
  }
}

function toggleSphereCategory(categoryKey) {
  if (state.expandedSphereCategories.has(categoryKey)) {
    state.expandedSphereCategories = new Set();
  } else {
    state.expandedSphereCategories = new Set([categoryKey]);
  }

  const firstSlot = SPHERE_SLOT_CONFIG.find((slot) => slot.categoryKey === categoryKey)?.key || null;
  if (firstSlot) {
    state.activeSphereSlot = firstSlot;
  }
  renderAll();
  const categoryLabel = SPHERE_CATEGORY_CONFIG.find((entry) => entry.key === categoryKey)?.label || categoryKey;
  setLastAction(`${categoryLabel}: список ${state.expandedSphereCategories.has(categoryKey) ? "открыт" : "свёрнут"}.`);
}

function toggleTrophyCategory(slotKey) {
  const slot = getTrophySlotConfig(slotKey);
  if (state.expandedTrophySlots.has(slotKey)) {
    state.expandedTrophySlots = new Set();
  } else {
    state.expandedTrophySlots = new Set([slotKey]);
  }

  state.activeTrophySlot = slotKey;
  renderAll();
  if (slot) {
    setLastAction(`${slot.label}: список ${state.expandedTrophySlots.has(slotKey) ? "открыт" : "свёрнут"}.`);
  }
}

function setSphereTypeOneTab(categoryName) {
  const tab = SPHERE_TYPE_ONE_TABS.find((entry) => entry.category === categoryName);
  if (!tab) {
    return;
  }

  state.activeSphereTypeOneTab = tab.category;
  state.activeSphereSlot = tab.slotKey;
  state.expandedSphereCategories = new Set(["sphere_type_1"]);
  renderAll();
  setLastAction(`Основные сферы: выбрана вкладка "${tab.label}".`);
}

function renderCategoryList() {
  const container = document.getElementById("category-list");
  if (!container) {
    return;
  }

  if (state.activeWorkspaceTab === "pet") {
    const groups = getPetCategoryGroups();

    container.innerHTML = groups.map((group) => {
      const isExpanded = state.expandedPetCategories.has(group.key);
      const selectedItemId = state.petEquipped?.itemId || "";
      let itemsHtml = "";

      if (isExpanded && group.items.length) {
        itemsHtml = group.items.map((item) => {
          const previewLevel = getDefaultUpgradeLevel(item);
          const params = getParamsForLevel(item, previewLevel);
          const previewText = localize(params[0] || normalizeText(item.description_lines?.[0]) || "Без параметров");
          const isEquipped = String(item.uid) === String(selectedItemId);
          const metaParts = [];
          const subtitle = localize(normalizeText(item.description_lines?.[0]));

          if (subtitle) {
            metaParts.push(subtitle);
          }
          metaParts.push(previewText);

          return `
            <div class="catalog-item catalog-item-pet ${isEquipped ? "is-selected" : ""}">
              <div class="item-row">
                ${renderItemIcon(item)}
                <div class="item-info">
                  <div class="item-name">${escapeHtml(localize(item.name))}</div>
                  <div class="item-meta">${escapeHtml(metaParts.join(" · "))}</div>
                </div>
                <button
                  class="equip-btn ${isEquipped ? "is-selected" : ""}"
                  type="button"
                  data-pet-id="${escapeHtml(item.uid)}"
                  data-action="${isEquipped ? "remove" : "equip"}"
                >
                  ${escapeHtml(localize(isEquipped ? "Снять" : "Надеть"))}
                </button>
              </div>
            </div>
          `;
        }).join("");
      } else if (isExpanded) {
        itemsHtml = `<div class="category-empty">${escapeHtml(localize("Для этой группы питомцев пока нет данных."))}</div>`;
      }

      return `
        <div class="category-block ${state.activePetCategory === group.key ? "active" : ""}" data-pet-category="${escapeHtml(group.key)}">
          <button class="category-header" type="button" data-pet-category="${escapeHtml(group.key)}">
            <span class="cat-name">${escapeHtml(localize(group.label))}</span>
            <span class="cat-count">${group.items.length}</span>
            <span class="cat-arrow" aria-hidden="true">›</span>
          </button>
          <div class="category-items ${isExpanded ? "expanded" : "collapsed"}">
            ${itemsHtml}
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll("[data-pet-category]").forEach((button) => {
      if (button.classList.contains("category-header")) {
        button.addEventListener("click", () => togglePetCategory(button.dataset.petCategory));
      }
    });
    container.querySelectorAll("[data-pet-id]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.action === "remove") {
          clearPet();
          return;
        }
        equipPet(button.dataset.petId);
      });
    });
    return;
  }

  if (state.activeWorkspaceTab === "spheres") {
    const groups = getSphereCategoryGroups();

    container.innerHTML = groups.map((group) => {
      const isExpanded = state.expandedSphereCategories.has(group.key);

      let itemsHtml = "";
      if (isExpanded && group.items.length) {
        const renderSphereCatalogItem = (item, showCategory = true) => {
          const previewLevel = getDefaultUpgradeLevel(item);
          const params = getParamsForLevel(item, previewLevel);
          const previewText = localize(params[0] || item.description || "Без параметров");
          const targetSlot = getPrimarySphereSlot(item);
          const requiredLevel = getMorphSphereRequiredLevel(item);
          const canEquip = Boolean(targetSlot) && isSphereAllowedForLevel(item, state.classConfig.level);
          const selectedItemId = targetSlot ? state.sphereEquipped[targetSlot.key]?.itemId : null;
          const isEquipped = String(item.uid) === String(selectedItemId || "");
          const metaParts = [];
          if (showCategory) {
            metaParts.push(localize(item.category));
          }
          if (requiredLevel > 0) {
            metaParts.push(localize(`Уровень экипировки ${requiredLevel}`));
          }
          if (shouldShowSphereUpgrade(item, targetSlot) && shouldDisplayUpgradeLevel(previewLevel)) {
            metaParts.push(previewLevel);
          }
          metaParts.push(previewText);

          return `
            <div class="catalog-item catalog-item-sphere ${isEquipped ? "is-selected" : ""}">
              <div class="item-row">
                ${renderItemIcon(item)}
                <div class="item-info">
                  <div class="item-name">${escapeHtml(localize(item.name))}</div>
                  <div class="item-meta">${escapeHtml(metaParts.join(" · "))}</div>
                </div>
                <button
                  class="equip-btn ${isEquipped ? "is-selected" : ""}"
                  type="button"
                  data-sphere-slot="${escapeHtml(targetSlot?.key || "")}"
                  data-sphere-id="${escapeHtml(item.uid)}"
                  data-action="${isEquipped ? "remove" : "equip"}"
                  ${targetSlot && (isEquipped || canEquip) ? "" : "disabled"}
                >
                  ${escapeHtml(localize(isEquipped ? "Снять" : "Надеть"))}
                </button>
              </div>
            </div>
          `;
        };

        if (group.key === "sphere_type_1") {
          const activeTab = SPHERE_TYPE_ONE_TABS.find((tab) => tab.category === state.activeSphereTypeOneTab) || SPHERE_TYPE_ONE_TABS[0];
          const categoryItems = group.items.filter((item) => item.category === activeTab.category);
          const tabsHtml = `
            <div class="sphere-type-tabs" role="tablist" aria-label="${escapeHtml(localize("Подтипы сфер 1-го типа"))}">
              ${SPHERE_TYPE_ONE_TABS.map((tab) => `
                <button
                  class="sphere-type-tab ${tab.category === activeTab.category ? "is-active" : ""}"
                  type="button"
                  role="tab"
                  aria-selected="${tab.category === activeTab.category ? "true" : "false"}"
                  data-sphere-type-one-tab="${escapeHtml(tab.category)}"
                >
                  ${escapeHtml(localize(tab.label))}
                </button>
              `).join("")}
            </div>
          `;
          const bodyHtml = categoryItems.length
            ? categoryItems.map((item) => renderSphereCatalogItem(item, false)).join("")
            : `<div class="category-empty">${escapeHtml(localize("Для этой подкатегории сфер пока нет данных."))}</div>`;
          itemsHtml = `
            ${tabsHtml}
            <div class="sphere-tab-panel">
              ${bodyHtml}
            </div>
          `;
        } else {
          itemsHtml = group.items.map((item) => renderSphereCatalogItem(item)).join("");
        }
      } else if (isExpanded) {
        itemsHtml = `<div class="category-empty">${escapeHtml(localize("Для этой категории сфер пока нет данных."))}</div>`;
      }

      return `
        <div class="category-block ${state.activeSphereSlot && getSphereSlotConfig(state.activeSphereSlot)?.categoryKey === group.key ? "active" : ""}" data-sphere-category="${escapeHtml(group.key)}">
          <button class="category-header" type="button" data-sphere-category="${escapeHtml(group.key)}">
            <span class="cat-name">${escapeHtml(localize(group.label))}</span>
            <span class="cat-count">${group.items.length}</span>
            <span class="cat-arrow" aria-hidden="true">›</span>
          </button>
          <div class="category-items ${isExpanded ? "expanded" : "collapsed"}">
            ${itemsHtml}
          </div>
        </div>
      `;
    }).join("");

      container.querySelectorAll("[data-sphere-category]").forEach((button) => {
        if (button.classList.contains("category-header")) {
          button.addEventListener("click", () => toggleSphereCategory(button.dataset.sphereCategory));
        }
      });
      container.querySelectorAll("[data-sphere-id]").forEach((button) => {
        button.addEventListener("click", () => {
          if (button.dataset.action === "remove") {
            clearSphereSlot(button.dataset.sphereSlot);
            return;
          }
          equipSphere(button.dataset.sphereSlot, button.dataset.sphereId);
        });
      });
      container.querySelectorAll("[data-sphere-type-one-tab]").forEach((button) => {
        button.addEventListener("click", () => setSphereTypeOneTab(button.dataset.sphereTypeOneTab));
      });
      return;
    }

  if (state.activeWorkspaceTab === "trophies") {
    container.innerHTML = TROPHY_SLOT_CONFIG.map((slot) => {
      const items = getTrophyItemsForSlot(slot.key);
      const isExpanded = state.expandedTrophySlots.has(slot.key);
      const selectedItemId = state.trophyEquipped[slot.key]?.itemId;
      let itemsHtml = "";

      if (isExpanded && items.length) {
        itemsHtml = items.map((item) => {
          const previewLevel = getDefaultUpgradeLevel(item);
          const params = getParamsForLevel(item, previewLevel);
          const previewText = localize(params[0] || "Без параметров");
          const isEquipped = String(item.uid) === String(selectedItemId || "");

          return `
            <div class="catalog-item catalog-item-trophy ${isEquipped ? "is-selected" : ""}">
              <div class="item-row">
                ${renderItemIcon(item)}
                <div class="item-info">
                  <div class="item-name">${escapeHtml(localize(item.name))}</div>
                  <div class="item-meta">${escapeHtml(shouldDisplayUpgradeLevel(previewLevel) ? `${previewLevel} · ${previewText}` : previewText)}</div>
                </div>
                <button
                  class="equip-btn ${isEquipped ? "is-selected" : ""}"
                  type="button"
                  data-trophy-slot="${escapeHtml(slot.key)}"
                  data-trophy-id="${escapeHtml(item.uid)}"
                  data-action="${isEquipped ? "remove" : "equip"}"
                >
                  ${escapeHtml(localize(isEquipped ? "Снять" : "Надеть"))}
                </button>
              </div>
            </div>
          `;
        }).join("");
      } else if (isExpanded) {
        itemsHtml = `<div class="category-empty">${escapeHtml(localize("Для этого слота пока нет трофеев."))}</div>`;
      }

      return `
        <div class="category-block ${state.activeTrophySlot === slot.key ? "active" : ""}" data-trophy-category="${escapeHtml(slot.key)}">
          <button class="category-header" type="button" data-trophy-category="${escapeHtml(slot.key)}">
            <span class="cat-name">${escapeHtml(localize(slot.label))} — ${escapeHtml(localize(slot.statLabel))}</span>
            <span class="cat-count">${items.length}</span>
            <span class="cat-arrow" aria-hidden="true">›</span>
          </button>
          <div class="category-items ${isExpanded ? "expanded" : "collapsed"}">
            ${itemsHtml}
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll("[data-trophy-category]").forEach((button) => {
      if (button.classList.contains("category-header")) {
        button.addEventListener("click", () => toggleTrophyCategory(button.dataset.trophyCategory));
      }
    });
    container.querySelectorAll("[data-trophy-id]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.action === "remove") {
          clearTrophySlot(button.dataset.trophySlot);
          return;
        }
        equipTrophy(button.dataset.trophySlot, button.dataset.trophyId);
      });
    });
    return;
  }

  container.innerHTML = SLOT_CONFIG.map((slot) => {
    const items = getItemsForEquipmentSlot(slot);
    const isExpanded = state.expandedCategories.has(slot.key);
    const selectedItemId = state.equipped[slot.key]?.itemId;

    let itemsHtml = "";
    if (isExpanded && items.length) {
      itemsHtml = items.map((item) => {
        const previewLevel = getDefaultUpgradeLevel(item);
        const params = getParamsForLevel(item, previewLevel);
        const isEquipped = String(item.uid) === String(selectedItemId || "");
        const previewText = localize(params[0] || "Без параметров");

        return `
          <div class="catalog-item ${isEquipped ? "is-selected" : ""}" data-id="${escapeHtml(item.uid)}">
            <div class="item-row">
              ${renderItemIcon(item)}
              <div class="item-info">
                <div class="item-name">${escapeHtml(localize(item.name))}</div>
                <div class="item-meta">${escapeHtml(shouldDisplayUpgradeLevel(previewLevel) ? `${previewLevel} · ${previewText}` : previewText)}</div>
              </div>
              <button class="equip-btn ${isEquipped ? "is-selected" : ""}" type="button" data-slot="${slot.key}" data-id="${escapeHtml(item.uid)}" data-action="${isEquipped ? "remove" : "equip"}">
                ${escapeHtml(localize(isEquipped ? "Снять" : "Надеть"))}
              </button>
            </div>
          </div>
        `;
      }).join("");
    } else if (isExpanded) {
      itemsHtml = `<div class="category-empty">${escapeHtml(localize("Для этого слота пока нет предметов."))}</div>`;
    }

    return `
      <div class="category-block ${state.activeSlot === slot.key ? "active" : ""}" data-slot="${slot.key}">
        <button class="category-header" type="button" data-slot="${slot.key}">
          <span class="cat-name">${escapeHtml(localize(slot.catalogLabel || slot.label))}</span>
          <span class="cat-count">${items.length}</span>
          <span class="cat-arrow" aria-hidden="true">›</span>
        </button>
        <div class="category-items ${isExpanded ? "expanded" : "collapsed"}">
          ${itemsHtml}
        </div>
      </div>
    `;
  }).join("");

  container.querySelectorAll(".category-header").forEach((button) => {
    button.addEventListener("click", () => toggleCategory(button.dataset.slot));
  });

  container.querySelectorAll(".equip-btn").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.action === "remove") {
        clearSlot(button.dataset.slot);
        return;
      }
      equipItem(button.dataset.slot, button.dataset.id);
    });
  });
}

  return {
    scrollCategoryIntoView,
    equipItem,
    clearSlot,
    setUpgradeLevel,
    stepUpgradeLevel,
    handleSlotPress,
    handleSlotRemove,
    handleDollSlotClick,
    selectSlot,
    renderDollSlots,
    renderPassiveMorphRingSlot,
    togglePetCategory,
    equipPet,
    clearPet,
    changePetMergeCount,
    getPetWorkspaceData,
    renderPetMergeTable,
    renderPetWorkspace,
    selectSphereSlot,
    equipSphere,
    clearSphereSlot,
    setSphereUpgradeLevel,
    stepSphereUpgradeLevel,
    renderSphereSlots,
    selectTrophySlot,
    equipTrophy,
    clearTrophySlot,
    setTrophyUpgradeLevel,
    stepTrophyUpgradeLevel,
    renderTrophySlots,
    toggleCategory,
    toggleSphereCategory,
    toggleTrophyCategory,
    setSphereTypeOneTab,
    renderCategoryList,
  };
}
