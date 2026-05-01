// @ts-nocheck
export function createCompareRenderModule(deps) {
  const {
    app,
    compareState,
    ensureEditorState,
    ensureSecondaryProfileSelection,
    getPrimaryProfile,
    getSecondaryProfile,
    buildComparisonRows,
    formatAbsoluteStat,
  } = deps;

  function localize(value) {
    return app.localizeText(value);
  }

  function catalogName(item) {
    return app.getLocalizedCatalogField(item, "name", { fallbackToRu: true });
  }

  function catalogLines(item) {
    return app.getLocalizedCatalogLines(item, "descriptionLines", { fallbackToRu: true });
  }

  function catalogCategory(item) {
    return app.getLocalizedCatalogField(item, "category", { fallbackToRu: true });
  }

  function catalogVariant(item) {
    return app.getLocalizedCatalogField(item, "variant", { fallbackToRu: true });
  }

  function catalogElement(item) {
    return app.getLocalizedCatalogField(item, "element", { fallbackToRu: true });
  }

  function isBaseDefenseLevelLine(line) {
    return /^(?:Базовый уровень защиты|Base defense level)\s*:?\s*[+-]?\d+(?:[.,]\d+)?$/iu.test(app.normalizeText(line));
  }

  function renderCompareItemDescription(item, level, options = {}) {
    if (!item) {
      return "";
    }

    const {
      className = "",
      displayLevel = true,
      prefixLines = [],
    } = options;
    const params = app.getLocalizedParamsForLevel(item, level);
    const normalizedPrefixLines = prefixLines.map((line) => app.normalizeText(line)).filter(Boolean);
    const currentParamLabels = new Set(
      params
        .map((line) => app.parseNumericStat(line))
        .filter(Boolean)
        .map((stat) => stat.label),
    );
    const descriptionLines = catalogLines(item)
      .filter((line) => app.normalizeText(line))
      .filter((line) => !params.includes(line))
      .filter((line) => !(currentParamLabels.has("Защита") && isBaseDefenseLevelLine(line)));
    const mergedLines = [
      ...normalizedPrefixLines,
      ...params,
      ...descriptionLines.filter((line) => {
        const parsed = app.parseNumericStat(line);
        if (!parsed) {
          return !normalizedPrefixLines.includes(line);
        }
        return !currentParamLabels.has(parsed.label);
      }),
    ];
    const paramsHtml = mergedLines.length
      ? mergedLines.map((param) => `<li>${app.escapeHtml(localize(param))}</li>`).join("")
      : `<li>${app.escapeHtml(app.t("empty.noParams"))}</li>`;
    const suffix = displayLevel ? app.formatUpgradeSuffix(level) : "";

    return `
      <div class="equipment-description ${className}">
        <div class="equipment-description-card">
          <div class="equipment-description-content">
            <div class="equipment-description-name">${app.escapeHtml(catalogName(item))}${app.escapeHtml(suffix)}</div>
            <ul class="equipment-description-params">${paramsHtml}</ul>
          </div>
        </div>
      </div>
    `;
  }

  function applyStaticLocalization() {
    document.documentElement.lang = app.getCurrentLanguage();

    const topbar = document.querySelector("body[data-page='compare'] .panel-topbar");
    topbar?.setAttribute("aria-label", app.t("compare.toolbar"));

    document.getElementById("mobile-nav-toggle")?.setAttribute("aria-label", app.t("toolbar.mobileNav"));
    document.getElementById("mobile-nav-toggle")?.setAttribute("title", app.t("button.mainMenu"));
    const mobileToggleText = document.querySelector(".mobile-nav-toggle-text");
    if (mobileToggleText) {
      mobileToggleText.textContent = app.t("button.menu");
    }

    const backLink = document.querySelector(".compare-topbar-actions .profile-link-button");
    if (backLink) {
      backLink.textContent = app.t("button.mainMenu");
    }

    const primaryField = document.querySelector(".compare-topbar-field:nth-of-type(1) .summary-label");
    if (primaryField) {
      primaryField.textContent = app.t("compare.primaryBuild");
    }

    const secondaryField = document.querySelector(".compare-topbar-field:nth-of-type(2) .summary-label");
    if (secondaryField) {
      secondaryField.textContent = app.t("compare.secondaryBuild");
    }

    document.getElementById("compare-primary-select")?.setAttribute("aria-label", app.t("compare.primarySelect"));
    document.getElementById("compare-secondary-select")?.setAttribute("aria-label", app.t("compare.secondarySelect"));
    document.querySelector(".compare-profile-panel:first-of-type")?.setAttribute("aria-label", app.t("compare.primaryBuild"));
    document.querySelector(".compare-profile-panel:nth-of-type(2)")?.setAttribute("aria-label", app.t("compare.secondaryBuild"));
    document.querySelector(".compare-summary-panel")?.setAttribute("aria-label", app.t("compare.summaryPanel"));
  }

  function renderStaticUpgradeBadge(controlClass, level) {
    return app.shouldDisplayUpgradeLevel(level)
      ? `
        <span class="${controlClass} upgrade-stepper upgrade-stepper-static compare-readonly-upgrade-badge">
          <span class="upgrade-stepper-value compare-readonly-upgrade-badge-value">${app.escapeHtml(level)}</span>
        </span>
      `
      : "";
  }

  function renderCompareInventoryStage(profile) {
    const visibleSlots = app.SLOT_CONFIG.filter((slot) => slot.renderOnDoll !== false);

    const slotsHtml = visibleSlots.map((slot) => {
      const items = app.getItemsForEquipmentSlot(slot, profile.classConfig.classKey, profile.equipped);
      const selected = profile.equipped[slot.key];
      const item = selected ? app.state.itemsById.get(selected.itemId) : null;
      const level = item ? app.getValidUpgradeLevel(item, selected.upgradeLevel) : null;
      const classes = ["slot-cell"];

      if (item) {
        classes.push("is-filled");
      }
      if (!items.length) {
        classes.push("is-unavailable");
      }

      const imageHtml = item?.image
        ? `<img class="slot-item-image" src="${app.escapeHtml(item.image)}" alt="${app.escapeHtml(catalogName(item))}" loading="lazy">`
        : "";
      const upgradeControl = item ? renderStaticUpgradeBadge("slot-upgrade-select", level) : "";
      const descriptionHtml = item
        ? renderCompareItemDescription(item, level)
        : "";
      const slotTitle = item
        ? `${localize(slot.label)}: ${catalogName(item)}${app.formatUpgradeTitleSuffix(level)}`
        : localize(slot.label);

      return `
        <div class="${classes.join(" ")}" data-slot="${slot.key}" style="grid-column: ${slot.col}; grid-row: ${slot.row};">
          <div
            class="slot-pin compare-static-slot-pin"
            role="img"
            tabindex="0"
            aria-label="${app.escapeHtml(slotTitle)}"
            title="${app.escapeHtml(slotTitle)}"
          >
            <span class="slot-item-visual" aria-hidden="true">${imageHtml}</span>
          </div>
          ${upgradeControl}
          ${descriptionHtml}
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

    const passiveImageHtml = passiveItem?.image
      ? `<img class="slot-item-image" src="${app.escapeHtml(passiveItem.image)}" alt="${app.escapeHtml(catalogName(passiveItem))}" loading="lazy">`
      : "";
    const passiveUpgradeControl = passiveItem ? renderStaticUpgradeBadge("slot-upgrade-select", passiveLevel) : "";
    const passiveDescriptionHtml = passiveItem
      ? renderCompareItemDescription(passiveItem, passiveLevel)
      : "";
    const passiveSlotHtml = passiveItem && passiveSlot
      ? `
        <section class="compare-passive-slot-panel">
          <div class="${passiveClasses.join(" ")}" data-slot="${passiveSlot.key}">
            <div
              class="slot-pin compare-static-slot-pin"
              role="img"
              tabindex="0"
              aria-label="${app.escapeHtml(`${localize(passiveSlot.label)}: ${catalogName(passiveItem)}${app.formatUpgradeTitleSuffix(passiveLevel)}`)}"
              title="${app.escapeHtml(`${localize(passiveSlot.label)}: ${catalogName(passiveItem)}${app.formatUpgradeTitleSuffix(passiveLevel)}`)}"
            >
              <span class="slot-item-visual" aria-hidden="true">${passiveImageHtml}</span>
            </div>
            ${passiveUpgradeControl}
            ${passiveDescriptionHtml}
          </div>
        </section>
      `
      : "";

    return `
      <section class="equipment-column compare-stage-column">
        <section class="equipment-stage compare-equipment-stage" aria-label="${app.escapeHtml(app.t("workspace.equipmentSlots"))}">
          <div class="slot-grid">${slotsHtml}</div>
        </section>
        ${passiveSlotHtml}
      </section>
    `;
  }

  function renderCompareSphereStage(profile) {
    const slotsHtml = app.SPHERE_SLOT_CONFIG.map((slot) => {
      const items = app.getSphereItemsForSlot(slot.key);
      const selected = profile.sphereEquipped[slot.key];
      const item = selected ? app.state.sphereItemsById.get(selected.itemId) : null;
      const level = item ? app.getValidUpgradeLevel(item, selected.upgradeLevel) : null;
      const showUpgrade = item ? slot.categoryKey === "sphere_type_1" : false;
      const classes = ["sphere-slot-cell", slot.positionClass];

      if (item) {
        classes.push("is-filled");
      }
      if (!items.length) {
        classes.push("is-unavailable");
      }

      const imageHtml = item?.image
        ? `<img class="sphere-slot-item-image" src="${app.escapeHtml(item.image)}" alt="${app.escapeHtml(catalogName(item))}" loading="lazy">`
        : "";
      const upgradeControl = item && showUpgrade ? renderStaticUpgradeBadge("sphere-upgrade-select", level) : "";
      const requiredLevel = item ? app.getMorphSphereRequiredLevel(item) : 0;
      const requirementLine = requiredLevel > 0
        ? [app.getCurrentLanguage() === "en" ? `Required level ${requiredLevel}` : `Уровень экипировки ${requiredLevel}`]
        : [];
      const descriptionHtml = item
        ? renderCompareItemDescription(item, level, {
            className: "sphere-description",
            displayLevel: showUpgrade && app.getLevelKeys(item).length > 1,
            prefixLines: requirementLine,
          })
        : "";
      const slotTitle = item
        ? `${localize(slot.label)}: ${catalogName(item)}${showUpgrade ? app.formatUpgradeTitleSuffix(level) : ""}`
        : localize(slot.label);

      return `
        <div class="${classes.join(" ")}">
          <div
            class="sphere-slot-button compare-static-sphere-slot"
            role="img"
            tabindex="0"
            aria-label="${app.escapeHtml(slotTitle)}"
            title="${app.escapeHtml(slotTitle)}"
          >
            <span class="sphere-slot-item-visual" aria-hidden="true">${imageHtml}</span>
          </div>
          ${upgradeControl}
          ${descriptionHtml}
        </div>
      `;
    }).join("");

    return `
      <section class="sphere-column compare-stage-column">
        <section class="sphere-stage compare-sphere-stage" aria-label="${app.escapeHtml(app.t("workspace.sphereSlots"))}">
          <div class="sphere-slot-grid">${slotsHtml}</div>
        </section>
      </section>
    `;
  }

  function renderCompareTrophyStage(profile) {
    const slotsHtml = app.TROPHY_SLOT_CONFIG.map((slot) => {
      const items = app.getTrophyItemsForSlot(slot.key);
      const selected = profile.trophyEquipped[slot.key];
      const item = selected ? app.state.trophyItemsById.get(selected.itemId) : null;
      const level = item ? app.getValidUpgradeLevel(item, selected.upgradeLevel) : null;
      const classes = ["trophy-slot-cell", slot.positionClass];

      if (item) {
        classes.push("is-filled");
      }

      const imageHtml = item?.image
        ? `<img class="trophy-slot-item-image" src="${app.escapeHtml(item.image)}" alt="${app.escapeHtml(catalogName(item))}" loading="lazy">`
        : "";
      const upgradeControl = item ? renderStaticUpgradeBadge("trophy-upgrade-select", level) : "";
      const descriptionHtml = item
        ? renderCompareItemDescription(item, level, { className: "trophy-description" })
        : "";
      const slotTitle = item
        ? `${localize(slot.label)}: ${catalogName(item)}${app.formatUpgradeTitleSuffix(level)}`
        : localize(slot.label);

      return `
        <div class="${classes.join(" ")}">
          <div
            class="trophy-slot-button compare-static-trophy-slot"
            role="img"
            tabindex="0"
            aria-label="${app.escapeHtml(slotTitle)}"
            title="${app.escapeHtml(slotTitle)}"
          >
            <span class="trophy-slot-item-visual" aria-hidden="true">${imageHtml}</span>
          </div>
          ${upgradeControl}
          ${descriptionHtml}
        </div>
      `;
    }).join("");

    return `
      <section class="trophy-column compare-stage-column">
        <section class="trophy-stage compare-trophy-stage" aria-label="${app.escapeHtml(app.t("workspace.trophySlots"))}">
          <div class="trophy-slot-grid">${slotsHtml}</div>
        </section>
      </section>
    `;
  }

  function renderCompareStatRows(stats) {
    return stats.map((stat) => `
      <div class="stat-row ${stat.value > 0 ? "is-positive" : stat.value < 0 ? "is-negative" : ""}">
        <span class="stat-name">${app.escapeHtml(localize(stat.label))}</span>
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
      effects: [...bucket.effects.values()].sort((a, b) => localize(a).localeCompare(localize(b), app.getCurrentLanguage())),
      mergeCounts: app.getPetMergeCounts(profile.petEquipped),
      mergeTotal: app.getPetMergeTotal(profile.petEquipped?.mergeCounts),
    };
  }

  function renderComparePetStage(profile) {
    const petData = getComparePetWorkspaceData(profile);
    if (!petData) {
      return `
        <section class="pet-column compare-stage-column">
          <section class="pet-stage compare-pet-stage" aria-label="${app.escapeHtml(app.t("workspace.petStage"))}">
            <div class="pet-stage-empty">
              <div class="empty-note">${app.escapeHtml(app.t("empty.noPetInBuild"))}</div>
            </div>
          </section>
        </section>
      `;
    }

    const { pet, stats, effects } = petData;
    const subtitle = app.normalizeText(catalogLines(pet)[0] || `${catalogElement(pet)} (${catalogVariant(pet)})`);
    const categoryConfigLabel = app.PET_CATEGORY_CONFIG.find((entry) => entry.key === pet.variant)?.label;
    const categoryLabel = categoryConfigLabel ? localize(categoryConfigLabel) : catalogCategory(pet);

    return `
      <section class="pet-column compare-stage-column">
        <section class="pet-stage compare-pet-stage" aria-label="${app.escapeHtml(app.t("workspace.petStage"))}">
          <article class="pet-card">
            <div class="pet-card-head">
              <div class="pet-card-portrait">
                <img src="${app.escapeHtml(pet.image)}" alt="${app.escapeHtml(catalogName(pet))}" loading="lazy">
              </div>
              <div class="pet-card-copy">
                <div class="pet-card-kicker">${app.escapeHtml(categoryLabel)}</div>
                <div class="pet-card-title-row">
                  <h3>${app.escapeHtml(catalogName(pet))}</h3>
                </div>
                <div class="pet-card-meta">${app.escapeHtml(subtitle)}</div>
              </div>
            </div>

            <section class="pet-card-section">
              <div class="stats-subtitle-row">
                <h3>${app.escapeHtml(app.t("stats.petValues"))}</h3>
              </div>
              <div class="stat-list stat-list-secondary">
                ${stats.length ? renderCompareStatRows(stats) : `<div class="empty-note">${app.escapeHtml(app.t("empty.petNoNumericStats"))}</div>`}
              </div>
            </section>
            ${effects.length ? `
              <section class="pet-card-section">
                <div class="stats-subtitle-row">
                  <h3>${app.escapeHtml(app.t("stats.specialEffects"))}</h3>
                </div>
                <div class="effects-list">
                  ${effects.map((effect) => `<div class="effect-pill">${app.escapeHtml(localize(effect))}</div>`).join("")}
                </div>
              </section>
            ` : ""}
          </article>
        </section>
      </section>
    `;
  }

  function renderProfileEditor(editorKey, profile, containerId, title) {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }

    ensureEditorState(editorKey, profile);
    const editor = compareState.editors[editorKey];
    const classLabel = localize(app.CLASS_CONFIGS[profile.classConfig.classKey]?.label || app.t("class.class"));
    let stageHtml = renderCompareInventoryStage(profile);

    if (editor.activeWorkspaceTab === "pets") {
      stageHtml = renderComparePetStage(profile);
    } else if (editor.activeWorkspaceTab === "spheres") {
      stageHtml = renderCompareSphereStage(profile);
    } else if (editor.activeWorkspaceTab === "trophies") {
      stageHtml = renderCompareTrophyStage(profile);
    }
    container.innerHTML = `
      <section class="compare-editor-shell">
        <div class="section-title-row compare-editor-heading">
          <div class="compare-editor-headline">
            <span class="compare-editor-tag">${app.escapeHtml(title)}</span>
            <h2>${app.escapeHtml(profile.name)}</h2>
            <span class="section-note">${app.escapeHtml(app.t("compare.classLevel", { className: classLabel, level: profile.classConfig.level }))}</span>
          </div>
        </div>

        <nav class="workspace-tabs compare-workspace-tabs" aria-label="${app.escapeHtml(app.t("workspace.doll"))}">
          <button class="workspace-tab ${editor.activeWorkspaceTab === "inventory" ? "is-active" : ""}" type="button" data-compare-workspace-tab="inventory">${app.escapeHtml(app.t("workspace.inventory"))}</button>
          <button class="workspace-tab ${editor.activeWorkspaceTab === "pets" ? "is-active" : ""}" type="button" data-compare-workspace-tab="pets">${app.escapeHtml(app.t("workspace.pet"))}</button>
          <button class="workspace-tab ${editor.activeWorkspaceTab === "spheres" ? "is-active" : ""}" type="button" data-compare-workspace-tab="spheres">${app.escapeHtml(app.t("workspace.spheres"))}</button>
          <button class="workspace-tab ${editor.activeWorkspaceTab === "trophies" ? "is-active" : ""}" type="button" data-compare-workspace-tab="trophies">${app.escapeHtml(app.t("workspace.trophies"))}</button>
        </nav>

        <section class="compare-editor-stage compare-editor-stage-readonly">
          <div class="compare-editor-stage-view">
            ${stageHtml}
          </div>
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
      container.innerHTML = `<div class="empty-note">${app.escapeHtml(app.t("compare.chooseSecondBuild"))}</div>`;
      return;
    }

    const rows = buildComparisonRows(primaryProfile, secondaryProfile);
    const betterCount = rows.filter((row) => row.classes.delta === "is-better").length;
    const worseCount = rows.filter((row) => row.classes.delta === "is-worse").length;
    const equalCount = rows.length - betterCount - worseCount;

    container.innerHTML = `
      <section class="compare-summary-shell">
        <div class="compare-summary-strip">
          <div class="compare-summary-chip is-better">${app.escapeHtml(app.t("compare.better"))}: ${app.escapeHtml(betterCount)}</div>
          <div class="compare-summary-chip is-worse">${app.escapeHtml(app.t("compare.worse"))}: ${app.escapeHtml(worseCount)}</div>
          <div class="compare-summary-chip is-neutral">${app.escapeHtml(app.t("compare.equal"))}: ${app.escapeHtml(equalCount)}</div>
        </div>

        <div class="compare-table-wrap">
          <div class="compare-table">
            <div class="compare-table-header">${app.escapeHtml(app.t("compare.parameter"))}</div>
            <div class="compare-table-header">${app.escapeHtml(primaryProfile.name)}</div>
            <div class="compare-table-header">${app.escapeHtml(secondaryProfile.name)}</div>
            <div class="compare-table-header">${app.escapeHtml(app.t("compare.delta"))}</div>

            ${rows.map((row) => `
              <div class="compare-table-cell compare-table-label">${app.escapeHtml(localize(row.label))}</div>
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

    applyStaticLocalization();

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
    applyStaticLocalization();
    ensureSecondaryProfileSelection();
    const primaryProfile = getPrimaryProfile();
    const secondaryProfile = getSecondaryProfile();

    renderTopbar(primaryProfile, secondaryProfile);
    renderProfileEditor("primary", primaryProfile, "compare-primary-editor", app.t("compare.primaryBuild"));

    if (secondaryProfile) {
      renderProfileEditor("secondary", secondaryProfile, "compare-secondary-editor", app.t("compare.secondaryBuild"));
    } else {
      const secondaryContainer = document.getElementById("compare-secondary-editor");
      if (secondaryContainer) {
        secondaryContainer.innerHTML = `<div class="empty-note">${app.escapeHtml(app.t("compare.createSecondBuild"))}</div>`;
      }
    }

    renderSummary(primaryProfile, secondaryProfile);
  }

  return {
    renderComparePage,
    renderProfileEditor,
    renderSummary,
    renderTopbar,
  };
}
