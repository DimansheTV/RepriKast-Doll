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

  function renderCompareInventoryStage(editorKey, profile, editor) {
    const visibleSlots = app.SLOT_CONFIG.filter((slot) => slot.renderOnDoll !== false);

    const slotsHtml = visibleSlots.map((slot) => {
      const items = app.getItemsForEquipmentSlot(slot);
      const selected = profile.equipped[slot.key];
      const item = selected ? app.state.itemsById.get(selected.itemId) : null;
      const level = item ? app.getValidUpgradeLevel(item, selected.upgradeLevel) : null;
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
            `РЈСЂРѕРІРµРЅСЊ Р·Р°С‚РѕС‡РєРё ${slot.label}`,
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
        <section class="equipment-stage compare-equipment-stage" aria-label="РЎР»РѕС‚С‹ СЌРєРёРїРёСЂРѕРІРєРё">
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
            `РЈСЂРѕРІРµРЅСЊ СЃС„РµСЂС‹ ${slot.label}`,
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
        <section class="sphere-stage compare-sphere-stage" aria-label="РЎР»РѕС‚С‹ СЃС„РµСЂ">
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
            `РЈСЃРёР»РµРЅРёРµ С‚СЂРѕС„РµСЏ ${slot.label}`,
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
        <section class="trophy-stage compare-trophy-stage" aria-label="РЎР»РѕС‚С‹ С‚СЂРѕС„РµРµРІ">
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
          <h3>РЎР»РёСЏРЅРёРµ РїРёС‚РѕРјС†Р°</h3>
          <span class="pet-merge-total-note">РСЃРїРѕР»СЊР·РѕРІР°РЅРѕ ${totalUsed}/${app.PET_MERGE_TOTAL_LIMIT}</span>
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
                        <button type="button" class="pet-merge-btn" data-compare-pet-merge-key="${app.escapeHtml(entry.key)}" data-compare-pet-merge-delta="-1" ${canDecrease ? "" : "disabled"} aria-label="РЈРјРµРЅСЊС€РёС‚СЊ ${app.escapeHtml(entry.label)}">-</button>
                        <span class="pet-merge-count">${count}</span>
                        <button type="button" class="pet-merge-btn" data-compare-pet-merge-key="${app.escapeHtml(entry.key)}" data-compare-pet-merge-delta="1" ${canIncrease ? "" : "disabled"} aria-label="РЈРІРµР»РёС‡РёС‚СЊ ${app.escapeHtml(entry.label)}">+</button>
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
          <section class="pet-stage compare-pet-stage" aria-label="РџРёС‚РѕРјРµС†">
            <div class="pet-stage-empty">
              <div class="empty-note">РЈ РїСЂРѕС„РёР»СЏ РЅРµ РІС‹Р±СЂР°РЅ РїРёС‚РѕРјРµС†.</div>
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
        <section class="pet-stage compare-pet-stage" aria-label="РџРёС‚РѕРјРµС†">
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
                <h3>РџР°СЂР°РјРµС‚СЂС‹ РїРёС‚РѕРјС†Р°</h3>
              </div>
              <div class="stat-list stat-list-secondary">
                ${stats.length ? renderCompareStatRows(stats) : '<div class="empty-note">РџРёС‚РѕРјРµС† РЅРµ РґР°С‘С‚ С‡РёСЃР»РѕРІС‹С… РїР°СЂР°РјРµС‚СЂРѕРІ.</div>'}
              </div>
            </section>

            ${renderComparePetMergeTable(profile)}

            ${effects.length ? `
              <section class="pet-card-section">
                <div class="stats-subtitle-row">
                  <h3>РћСЃРѕР±С‹Рµ СЌС„С„РµРєС‚С‹</h3>
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
        title: "РРЅРІРµРЅС‚Р°СЂСЊ",
        count: 0,
        body: '<div class="empty-note">Р’С‹Р±РµСЂРёС‚Рµ СЃР»РѕС‚ СЌРєРёРїРёСЂРѕРІРєРё.</div>',
      };
    }

    const items = app.getItemsForEquipmentSlot(slot);
    const selectedItemId = profile.equipped[slot.key]?.itemId;
    const body = items.length
      ? items.map((item) => {
        const previewLevel = app.getDefaultUpgradeLevel(item);
        const params = app.getParamsForLevel(item, previewLevel);
        const previewText = params[0] || "Р‘РµР· РїР°СЂР°РјРµС‚СЂРѕРІ";
        const isEquipped = String(item.uid) === String(selectedItemId || "");

        return `
          <div class="catalog-item ${isEquipped ? "is-selected" : ""}">
            <div class="item-row">
              ${app.renderItemIcon(item)}
              <div class="item-info">
                <div class="item-name">${app.escapeHtml(item.name)}</div>
                <div class="item-meta">${app.escapeHtml(app.shouldDisplayUpgradeLevel(previewLevel) ? `${previewLevel} В· ${previewText}` : previewText)}</div>
              </div>
              <button
                class="equip-btn ${isEquipped ? "is-selected" : ""}"
                type="button"
                data-compare-list-action="${isEquipped ? "inventory-remove" : "inventory-equip"}"
                data-slot-key="${slot.key}"
                data-item-id="${app.escapeHtml(item.uid)}"
              >
                ${isEquipped ? "РЎРЅСЏС‚СЊ" : "РќР°РґРµС‚СЊ"}
              </button>
            </div>
          </div>
        `;
      }).join("")
      : '<div class="empty-note">Р”Р»СЏ СЌС‚РѕРіРѕ СЃР»РѕС‚Р° РїРѕРєР° РЅРµС‚ РїСЂРµРґРјРµС‚РѕРІ.</div>';

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
        title: "РЎС„РµСЂС‹",
        count: 0,
        body: '<div class="empty-note">Р’С‹Р±РµСЂРёС‚Рµ СЃР»РѕС‚ СЃС„РµСЂС‹.</div>',
      };
    }

    const items = app.getSphereItemsForSlot(slot.key);
    const selectedItemId = profile.sphereEquipped[slot.key]?.itemId;
    const body = items.length
      ? items.map((item) => {
        const previewLevel = app.getDefaultUpgradeLevel(item);
        const params = app.getParamsForLevel(item, previewLevel);
        const previewText = params[0] || "Р‘РµР· РїР°СЂР°РјРµС‚СЂРѕРІ";
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
                <div class="item-meta">${app.escapeHtml(metaParts.join(" В· "))}</div>
              </div>
              <button
                class="equip-btn ${isEquipped ? "is-selected" : ""}"
                type="button"
                data-compare-list-action="${isEquipped ? "sphere-remove" : "sphere-equip"}"
                data-slot-key="${slot.key}"
                data-item-id="${app.escapeHtml(item.uid)}"
              >
                ${isEquipped ? "РЎРЅСЏС‚СЊ" : "РќР°РґРµС‚СЊ"}
              </button>
            </div>
          </div>
        `;
      }).join("")
      : '<div class="empty-note">Р”Р»СЏ СЌС‚РѕРіРѕ СЃР»РѕС‚Р° РїРѕРєР° РЅРµС‚ СЃС„РµСЂ.</div>';

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
        title: "РўСЂРѕС„РµРё",
        count: 0,
        body: '<div class="empty-note">Р’С‹Р±РµСЂРёС‚Рµ СЃР»РѕС‚ С‚СЂРѕС„РµСЏ.</div>',
      };
    }

    const items = app.getTrophyItemsForSlot(slot.key);
    const selectedItemId = profile.trophyEquipped[slot.key]?.itemId;
    const body = items.length
      ? items.map((item) => {
        const previewLevel = app.getDefaultUpgradeLevel(item);
        const params = app.getParamsForLevel(item, previewLevel);
        const previewText = params[0] || "Р‘РµР· РїР°СЂР°РјРµС‚СЂРѕРІ";
        const isEquipped = String(item.uid) === String(selectedItemId || "");

        return `
          <div class="catalog-item ${isEquipped ? "is-selected" : ""}">
            <div class="item-row">
              ${app.renderItemIcon(item)}
              <div class="item-info">
                <div class="item-name">${app.escapeHtml(item.name)}</div>
                <div class="item-meta">${app.escapeHtml(app.shouldDisplayUpgradeLevel(previewLevel) ? `${previewLevel} В· ${previewText}` : previewText)}</div>
              </div>
              <button
                class="equip-btn ${isEquipped ? "is-selected" : ""}"
                type="button"
                data-compare-list-action="${isEquipped ? "trophy-remove" : "trophy-equip"}"
                data-slot-key="${slot.key}"
                data-item-id="${app.escapeHtml(item.uid)}"
              >
                ${isEquipped ? "РЎРЅСЏС‚СЊ" : "РќР°РґРµС‚СЊ"}
              </button>
            </div>
          </div>
        `;
      }).join("")
      : '<div class="empty-note">Р”Р»СЏ СЌС‚РѕРіРѕ СЃР»РѕС‚Р° РїРѕРєР° РЅРµС‚ С‚СЂРѕС„РµРµРІ.</div>';

    return {
      title: `${slot.label} В· ${slot.statLabel}`,
      count: items.length,
      body,
    };
  }

  function renderCompareCatalogForPet(profile) {
    const selectedItemId = profile.petEquipped?.itemId || "";
    const groups = app.PET_CATEGORY_CONFIG.map((group) => ({
      ...group,
      items: app.getPetItemsForCategory(group.key),
    }));
    const count = groups.reduce((total, group) => total + group.items.length, 0);
    const body = count
      ? groups.map((group) => {
        const itemsHtml = group.items.length
          ? group.items.map((item) => {
            const previewLevel = app.getDefaultUpgradeLevel(item);
            const params = app.getParamsForLevel(item, previewLevel);
            const previewText = params[0] || app.normalizeText(item.description_lines?.[0]) || "Р‘РµР· РїР°СЂР°РјРµС‚СЂРѕРІ";
            const isEquipped = String(item.uid) === String(selectedItemId);
            const subtitle = app.normalizeText(item.description_lines?.[0]);
            const metaParts = [];

            if (subtitle) {
              metaParts.push(subtitle);
            }
            metaParts.push(previewText);

            return `
              <div class="catalog-item catalog-item-pet ${isEquipped ? "is-selected" : ""}">
                <div class="item-row">
                  ${app.renderItemIcon(item)}
                  <div class="item-info">
                    <div class="item-name">${app.escapeHtml(item.name)}</div>
                    <div class="item-meta">${app.escapeHtml(metaParts.join(" В· "))}</div>
                  </div>
                  <button
                    class="equip-btn ${isEquipped ? "is-selected" : ""}"
                    type="button"
                    data-compare-list-action="${isEquipped ? "pet-remove" : "pet-equip"}"
                    data-item-id="${app.escapeHtml(item.uid)}"
                  >
                    ${isEquipped ? "РЎРЅСЏС‚СЊ" : "РќР°РґРµС‚СЊ"}
                  </button>
                </div>
              </div>
            `;
          }).join("")
          : '<div class="empty-note">Р”Р»СЏ СЌС‚РѕР№ РіСЂСѓРїРїС‹ РїРёС‚РѕРјС†РµРІ РїРѕРєР° РЅРµС‚ РґР°РЅРЅС‹С….</div>';

        return `
          <section class="compare-pet-catalog-group">
            <div class="compare-editor-catalog-title">
              <span class="section-note">${app.escapeHtml(group.label)}</span>
            </div>
            <div class="category-list compare-category-list">
              ${itemsHtml}
            </div>
          </section>
        `;
      }).join("")
      : '<div class="empty-note">РџРёС‚РѕРјС†С‹ РїРѕРєР° РЅРµ Р·Р°РіСЂСѓР¶РµРЅС‹.</div>';

    return {
      title: "РџРёС‚РѕРјС†С‹",
      count,
      body,
    };
  }

  function renderCompareCatalog(profile, editor) {
    if (editor.activeWorkspaceTab === "pets") {
      return renderCompareCatalogForPet(profile);
    }

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
    const classLabel = app.CLASS_CONFIGS[profile.classConfig.classKey]?.label || "РљР»Р°СЃСЃ";
    let stageHtml = renderCompareInventoryStage(editorKey, profile, editor);

    if (editor.activeWorkspaceTab === "pets") {
      stageHtml = renderComparePetStage(profile);
    } else if (editor.activeWorkspaceTab === "spheres") {
      stageHtml = renderCompareSphereStage(profile, editor);
    } else if (editor.activeWorkspaceTab === "trophies") {
      stageHtml = renderCompareTrophyStage(profile, editor);
    }
    const catalog = renderCompareCatalog(profile, editor);

    container.innerHTML = `
      <section class="compare-editor-shell">
        <div class="section-title-row compare-editor-heading">
          <div class="compare-editor-headline">
            <span class="compare-editor-tag">${app.escapeHtml(title)}</span>
            <h2>${app.escapeHtml(profile.name)}</h2>
            <span class="section-note">${app.escapeHtml(classLabel)} В· РЈСЂ. ${app.escapeHtml(profile.classConfig.level)}</span>
          </div>
        </div>

        <section class="compare-editor-controls">
          <label class="class-field">
            <span class="summary-label">РљР»Р°СЃСЃ</span>
            <select class="class-control" data-compare-class-select="1">
              ${Object.entries(app.CLASS_CONFIGS).map(([key, config]) => `
                <option value="${app.escapeHtml(key)}" ${profile.classConfig.classKey === key ? "selected" : ""}>
                  ${app.escapeHtml(config.label)}
                </option>
              `).join("")}
            </select>
          </label>

          <label class="class-field">
            <span class="summary-label">РЈСЂРѕРІРµРЅСЊ</span>
            <div class="class-level-stepper class-control" role="group" aria-label="РЈСЂРѕРІРµРЅСЊ РїРµСЂСЃРѕРЅР°Р¶Р°">
              <button class="class-level-stepper-btn" type="button" data-compare-level-delta="-1" ${profile.classConfig.level <= 1 ? "disabled" : ""} aria-label="РЈРјРµРЅСЊС€РёС‚СЊ СѓСЂРѕРІРµРЅСЊ">-</button>
              <input class="class-level-stepper-input" type="number" min="1" max="200" step="1" value="${app.escapeHtml(profile.classConfig.level)}" inputmode="numeric" data-compare-level-input="1" aria-label="РЈСЂРѕРІРµРЅСЊ РїРµСЂСЃРѕРЅР°Р¶Р°">
              <button class="class-level-stepper-btn" type="button" data-compare-level-delta="1" ${profile.classConfig.level >= 200 ? "disabled" : ""} aria-label="РЈРІРµР»РёС‡РёС‚СЊ СѓСЂРѕРІРµРЅСЊ">+</button>
            </div>
          </label>
        </section>

        <nav class="workspace-tabs compare-workspace-tabs" aria-label="Р Р°Р±РѕС‡Р°СЏ РѕР±Р»Р°СЃС‚СЊ РїСЂРѕС„РёР»СЏ">
          <button class="workspace-tab ${editor.activeWorkspaceTab === "inventory" ? "is-active" : ""}" type="button" data-compare-workspace-tab="inventory">РРЅРІРµРЅС‚Р°СЂСЊ</button>
          <button class="workspace-tab ${editor.activeWorkspaceTab === "pets" ? "is-active" : ""}" type="button" data-compare-workspace-tab="pets">РџРёС‚РѕРјС†С‹</button>
          <button class="workspace-tab ${editor.activeWorkspaceTab === "spheres" ? "is-active" : ""}" type="button" data-compare-workspace-tab="spheres">РЎС„РµСЂС‹</button>
          <button class="workspace-tab ${editor.activeWorkspaceTab === "trophies" ? "is-active" : ""}" type="button" data-compare-workspace-tab="trophies">РўСЂРѕС„РµРё</button>
        </nav>

        <section class="compare-editor-stage">
          <div class="compare-editor-stage-view">
            ${stageHtml}
          </div>
          <aside class="compare-editor-catalog">
            <div class="compare-editor-catalog-title">
              <h3>${app.escapeHtml(catalog.title)}</h3>
              <span class="section-note">${app.escapeHtml(catalog.count)} С€С‚.</span>
            </div>
            <div class="category-list compare-category-list">
              ${catalog.body}
            </div>
          </aside>
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
      container.innerHTML = '<div class="empty-note">РЎРѕР·РґР°Р№С‚Рµ РёР»Рё РІС‹Р±РµСЂРёС‚Рµ РІС‚РѕСЂРѕР№ РїСЂРѕС„РёР»СЊ РґР»СЏ СЃСЂР°РІРЅРµРЅРёСЏ.</div>';
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
            <span class="compare-editor-tag compare-editor-tag-summary">РђРЅР°Р»РёС‚РёРєР°</span>
            <h2>РЎСЂР°РІРЅРµРЅРёРµ РїР°СЂР°РјРµС‚СЂРѕРІ</h2>
            <span class="section-note">${app.escapeHtml(primaryProfile.name)} vs ${app.escapeHtml(secondaryProfile.name)}</span>
          </div>
        </div>

        <div class="compare-summary-strip">
          <div class="compare-summary-chip is-better">Р›СѓС‡С€Рµ: ${app.escapeHtml(betterCount)}</div>
          <div class="compare-summary-chip is-worse">РҐСѓР¶Рµ: ${app.escapeHtml(worseCount)}</div>
          <div class="compare-summary-chip is-neutral">Р Р°РІРЅРѕ: ${app.escapeHtml(equalCount)}</div>
        </div>

        <div class="compare-table-wrap">
          <div class="compare-table">
            <div class="compare-table-header">РџР°СЂР°РјРµС‚СЂ</div>
            <div class="compare-table-header">${app.escapeHtml(primaryProfile.name)}</div>
            <div class="compare-table-header">${app.escapeHtml(secondaryProfile.name)}</div>
            <div class="compare-table-header">О”</div>

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
    renderProfileEditor("primary", primaryProfile, "compare-primary-editor", "РџСЂРѕС„РёР»СЊ 1");

    if (secondaryProfile) {
      renderProfileEditor("secondary", secondaryProfile, "compare-secondary-editor", "РџСЂРѕС„РёР»СЊ 2");
    } else {
      const secondaryContainer = document.getElementById("compare-secondary-editor");
      if (secondaryContainer) {
        secondaryContainer.innerHTML = '<div class="empty-note">РЎРѕР·РґР°Р№С‚Рµ РІС‚РѕСЂРѕР№ РїСЂРѕС„РёР»СЊ, С‡С‚РѕР±С‹ СѓРІРёРґРµС‚СЊ РІС‚РѕСЂСѓСЋ СЃР±РѕСЂРєСѓ.</div>';
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
