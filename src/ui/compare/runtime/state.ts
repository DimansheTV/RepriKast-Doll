// @ts-nocheck
import { createCompareState } from "../editor-state";

export function createCompareStateModule({ app, uiStateRepository }) {
  const compareState = createCompareState(app, uiStateRepository);

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
      name: "Сборка 1",
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

  function ensureSecondaryProfileSelection() {
    const nextSecondaryId = getFirstOtherProfileId(app.state.activeProfileId, compareState.secondaryProfileId);
    if (compareState.secondaryProfileId !== nextSecondaryId) {
      compareState.secondaryProfileId = nextSecondaryId;
      saveSecondaryProfileId();
      resetEditorState("secondary", getSecondaryProfile(), true);
    }
  }

  return {
    compareState,
    saveSecondaryProfileId,
    getProfileById,
    getPrimaryProfile,
    getSecondaryProfile,
    getEditorProfileId,
    getVisibleCompareEquipmentSlots,
    queueLevelInputFocus,
    restorePendingLevelInputFocus,
    getEquippedSlotsForProfile,
    getVisibleEquippedSlotsForProfile,
    getEquippedSphereSlotsForProfile,
    getEquippedTrophySlotsForProfile,
    resetEditorState,
    ensureEditorState,
    ensureSecondaryProfileSelection,
  };
}
