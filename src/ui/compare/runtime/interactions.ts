// @ts-nocheck
export function createCompareInteractionsModule(deps) {
  const {
    app,
    compareState,
    getEditorProfileId,
    saveSecondaryProfileId,
    getPrimaryProfile,
    getSecondaryProfile,
    ensureSecondaryProfileSelection,
    resetEditorState,
    queueLevelInputFocus,
    renderComparePage,
  } = deps;

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

  function handleCompareListAction(editorKey, button) {
    const action = button.dataset.compareListAction;
    const slotKey = button.dataset.slotKey;
    const itemId = button.dataset.itemId;
    const editor = compareState.editors[editorKey];

    mutateProfile(editorKey, (profile) => {
      if (action === "inventory-equip") {
        const slot = app.getSlotConfig(slotKey);
        const item = app.state.itemsById.get(String(itemId));
        if (!slot || !item || !app.matchesEquipmentSlot(slot, item)) {
          return;
        }
        profile.equipped[slot.key] = {
          itemId: String(item.uid),
          upgradeLevel: app.getDefaultUpgradeLevel(item),
        };
        editor.activeSlot = slot.key;
        return;
      }

      if (action === "inventory-remove") {
        delete profile.equipped[slotKey];
        editor.activeSlot = slotKey;
        return;
      }

      if (action === "sphere-equip") {
        const slot = app.getSphereSlotConfig(slotKey);
        const item = app.state.sphereItemsById.get(String(itemId));
        if (!slot || !item || !slot.matches(item)) {
          return;
        }
        profile.sphereEquipped[slot.key] = {
          itemId: String(item.uid),
          upgradeLevel: app.getDefaultUpgradeLevel(item),
        };
        editor.activeSphereSlot = slot.key;
        if (slot.categoryKey === "sphere_type_1") {
          editor.activeSphereTypeOneTab = app.getSphereTypeOneTabForSlot(slot.key);
        }
        return;
      }

      if (action === "sphere-remove") {
        delete profile.sphereEquipped[slotKey];
        editor.activeSphereSlot = slotKey;
        return;
      }

      if (action === "trophy-equip") {
        const slot = app.getTrophySlotConfig(slotKey);
        const item = app.state.trophyItemsById.get(String(itemId));
        if (!slot || !item || item.slot_code !== slot.key) {
          return;
        }
        profile.trophyEquipped[slot.key] = {
          itemId: String(item.uid),
          upgradeLevel: app.getDefaultUpgradeLevel(item),
        };
        editor.activeTrophySlot = slot.key;
        return;
      }

      if (action === "trophy-remove") {
        delete profile.trophyEquipped[slotKey];
        editor.activeTrophySlot = slotKey;
        return;
      }

      if (action === "pet-equip") {
        const item = app.state.petItemsById.get(String(itemId));
        if (!item) {
          return;
        }
        profile.petEquipped = { itemId: String(item.uid) };
        return;
      }

      if (action === "pet-remove") {
        profile.petEquipped = null;
      }
    });

    renderComparePage();
  }

  function stepUpgradeLevel(editorKey, upgradeType, slotKey, delta) {
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
  }

  function setUpgradeLevel(editorKey, upgradeType, slotKey, level) {
    mutateProfile(editorKey, (profile) => {
      if (upgradeType === "inventory") {
        const selected = profile.equipped[slotKey];
        const item = selected ? app.state.itemsById.get(selected.itemId) : null;
        if (selected && item) {
          selected.upgradeLevel = app.getValidUpgradeLevel(item, level);
        }
        return;
      }

      if (upgradeType === "sphere") {
        const selected = profile.sphereEquipped[slotKey];
        const item = selected ? app.state.sphereItemsById.get(selected.itemId) : null;
        if (selected && item) {
          selected.upgradeLevel = app.getValidUpgradeLevel(item, level);
        }
        return;
      }

      if (upgradeType === "trophy") {
        const selected = profile.trophyEquipped[slotKey];
        const item = selected ? app.state.trophyItemsById.get(selected.itemId) : null;
        if (selected && item) {
          selected.upgradeLevel = app.getValidUpgradeLevel(item, level);
        }
      }
    });

    renderComparePage();
  }

  function setClassKey(editorKey, classKey) {
    const nextClassKey = app.CLASS_CONFIGS[classKey] ? classKey : "knight";
    mutateProfile(editorKey, (profile) => {
      profile.classConfig.classKey = nextClassKey;
    });
    renderComparePage();
  }

  function stepClassLevel(editorKey, delta, input) {
    queueLevelInputFocus(editorKey, input);
    mutateProfile(editorKey, (profile) => {
      profile.classConfig.level = app.sanitizeClassLevel(profile.classConfig.level + delta);
    });
    renderComparePage();
  }

  function setClassLevel(editorKey, value, input) {
    queueLevelInputFocus(editorKey, input);
    mutateProfile(editorKey, (profile) => {
      profile.classConfig.level = app.sanitizeClassLevel(value);
    });
    renderComparePage();
  }

  function updatePetMergeCount(editorKey, mergeKey, delta) {
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
  }

  function activateSlotPin(editorKey, slotType, slotKey) {
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
  }

  function setWorkspaceTab(editorKey, workspaceTab) {
    compareState.editors[editorKey].activeWorkspaceTab = workspaceTab;
    renderComparePage();
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

  return {
    handleCompareListAction,
    stepUpgradeLevel,
    setUpgradeLevel,
    setClassKey,
    stepClassLevel,
    setClassLevel,
    updatePetMergeCount,
    activateSlotPin,
    setWorkspaceTab,
    setPrimaryProfile,
    setSecondaryProfile,
  };
}
