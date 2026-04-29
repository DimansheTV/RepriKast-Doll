// @ts-nocheck
export function createCompareRenderModule(deps) {
  const {
    app,
    compareState,
    ensureEditorState,
    ensureSecondaryProfileSelection,
    getPrimaryProfile,
    getSecondaryProfile,
    restorePendingLevelInputFocus,
    buildComparisonRows,
    formatAbsoluteStat,
  } = deps;

  function renderReadOnlyUpgradeBadge(level, ariaLabel) {
    if (!app.shouldDisplayUpgradeLevel(level)) {
      return "";
    }

    const displayValue = String(level);
    return `
      <span
        class="compare-readonly-upgrade-badge"
        aria-label="${app.escapeHtml(`${ariaLabel}: ${level}`)}"
        title="${app.escapeHtml(String(level))}"
      >
        <span class="compare-readonly-upgrade-badge-value">${app.escapeHtml(displayValue)}</span>
      </span>
    `;
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
        ? `<img class="slot-item-image" src="${app.escapeHtml(item.image)}" alt="${app.escapeHtml(item.name)}" loading="lazy">`
        : "";
      const titleText = item
        ? `${slot.label}: ${item.name}${app.formatUpgradeTitleSuffix(level)}`
        : slot.label;
      const upgradeControl = item
        ? renderReadOnlyUpgradeBadge(level, `Уровень заточки ${slot.label}`)
        : "";

      return `
        <div class="${classes.join(" ")}" style="grid-column: ${slot.col}; grid-row: ${slot.row};">
          <button
            type="button"
            class="slot-pin"
            disabled
            aria-label="${app.escapeHtml(titleText)}"
            title="${app.escapeHtml(titleText)}"
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

    const passiveImageHtml = passiveItem?.image
      ? `<img class="slot-item-image" src="${app.escapeHtml(passiveItem.image)}" alt="${app.escapeHtml(passiveItem.name)}" loading="lazy">`
      : "";
    const passiveUpgradeControl = passiveItem && passiveSlot
      ? renderReadOnlyUpgradeBadge(passiveLevel, `Уровень заточки ${passiveSlot.label}`)
      : "";
    const passiveSlotHtml = passiveItem && passiveSlot
      ? `
        <section class="compare-passive-slot-panel">
          <div class="${passiveClasses.join(" ")}" data-slot="${passiveSlot.key}">
            <button
              type="button"
              class="slot-pin"
              disabled
              aria-label="${app.escapeHtml(`${passiveSlot.label}: ${passiveItem.name}${app.formatUpgradeTitleSuffix(passiveLevel)}`)}"
              title="${app.escapeHtml(`${passiveSlot.label}: ${passiveItem.name}${app.formatUpgradeTitleSuffix(passiveLevel)}`)}"
            >
              <span class="slot-item-visual" aria-hidden="true">${passiveImageHtml}</span>
            </button>
            ${passiveUpgradeControl}
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

  function getPetMergeBonusValue(mergeConfig, count) {
    const safeCount = Math.min(app.PET_MERGE_TOTAL_LIMIT, Math.max(0, Math.floor(Number(count) || 0)));
    return mergeConfig.bonusSteps.slice(0, safeCount).reduce((sum, value) => sum + value, 0);
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
                const bonus = getPetMergeBonusValue(entry, count);

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

  function renderProfileEditor(editorKey, profile, containerId, title) {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }

    ensureEditorState(editorKey, profile);
    const editor = compareState.editors[editorKey];
    const classLabel = app.CLASS_CONFIGS[profile.classConfig.classKey]?.label || "Класс";
    let stageHtml = renderCompareInventoryStage(profile);

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

  return {
    renderComparePage,
    renderProfileEditor,
    renderSummary,
    renderTopbar,
  };
}
