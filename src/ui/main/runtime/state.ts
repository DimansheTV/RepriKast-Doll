// @ts-nocheck
import { TROPHY_SLOT_CONFIG } from "../../../domain/trophies/config";
import { SPHERE_SLOT_CONFIG } from "../../../domain/spheres/config";
import { PET_CATEGORY_CONFIG } from "../../../domain/pets/config";
import { PASSIVE_MORPH_RING_SLOT_KEY } from "../../../domain/equipment/config";
import { CLASS_CONFIGS } from "../../../domain/stats/runtime-config";
import { normalizeLanguage } from "../../../shared/i18n";
import { normalizeText } from "./utils";

export function createRuntimeState(deps) {
  const {
    profileRepository,
    uiStateRepository,
    sanitizeClassLevel,
    setLastAction,
    markBuildDirty,
    getSlotConfig,
    getSphereSlotConfig,
    isSphereAllowedForLevel,
    getTrophySlotConfig,
    getValidUpgradeLevel,
    matchesEquipmentSlot,
    normalizeEquipmentSelections,
    createPetSelection,
    getEquippedSlots,
    getFirstAvailableSlotKey,
    getEquippedSphereSlots,
    getFirstAvailableSphereSlotKey,
    getEquippedTrophySlots,
    getEquippedPet,
    getFirstAvailablePetCategoryKey,
    getSphereTypeOneTabForSlot,
  } = deps;

  let persistenceLocked = false;

  const state = {
    items: [],
    sphereItems: [],
    trophyItems: [],
    petItems: [],
    itemsById: new Map(),
    sphereItemsById: new Map(),
    trophyItemsById: new Map(),
    petItemsById: new Map(),
    equipped: loadEquippedState(),
    sphereEquipped: loadSphereEquippedState(),
    trophyEquipped: loadTrophyEquippedState(),
    petEquipped: loadPetEquippedState(),
    expandedCategories: new Set(),
    expandedSphereCategories: new Set(),
    expandedTrophySlots: new Set(),
    expandedPetCategories: new Set(),
    activeSlot: null,
    activeSphereSlot: SPHERE_SLOT_CONFIG[0]?.key || null,
    activeTrophySlot: TROPHY_SLOT_CONFIG[0]?.key || null,
    activePetCategory: PET_CATEGORY_CONFIG[0]?.key || "I",
    activeSphereTypeOneTab: "Сфера персонажа",
    lastAction: "Выберите слот на кукле или откройте категорию справа.",
    classConfig: loadClassState(),
    activeSidebarTab: loadSidebarTabState(),
    activeStatsTab: "inventory",
    activeWorkspaceTab: loadWorkspaceTabState(),
    language: loadLanguageState(),
    profiles: [],
    activeProfileId: null,
    activeDraftName: "",
    activeDraftSourceProfileId: "",
    activeDraftMode: "existing",
    cleanBuildSnapshot: null,
    isBuildDirty: false,
    isBuildNameEditing: false,
    isBuildMenuOpen: false,
  };

  function loadEquippedState() {
    return profileRepository.loadLegacyEquipment();
  }

  function loadClassState() {
    const parsed = profileRepository.loadLegacyClassConfig();
    const classKey = CLASS_CONFIGS[parsed?.classKey] ? parsed.classKey : "knight";
    const level = sanitizeClassLevel(parsed?.level ?? 1);
    return { classKey, level };
  }

  function loadPetEquippedState() {
    return profileRepository.loadLegacyPetSelection();
  }

  function loadSidebarTabState() {
    return uiStateRepository.loadSidebarTab();
  }

  function loadSphereEquippedState() {
    return profileRepository.loadLegacySphereEquipment();
  }

  function loadTrophyEquippedState() {
    return profileRepository.loadLegacyTrophyEquipment();
  }

  function loadWorkspaceTabState() {
    return uiStateRepository.loadWorkspaceTab();
  }

  function loadLanguageState() {
    return normalizeLanguage(uiStateRepository.loadLanguage?.() || "ru");
  }

  function loadProfilesState() {
    return profileRepository.loadProfiles();
  }

  function loadActiveProfileIdState() {
    return normalizeText(profileRepository.loadActiveProfileId() || "");
  }

  function markBuildAsDirty(reason = "") {
    if (persistenceLocked) {
      return;
    }

    markBuildDirty(reason);
  }

  function saveEquippedState() {
    profileRepository.saveLegacyEquipment(state.equipped);
    markBuildAsDirty("equipped");
  }

  function saveClassState() {
    profileRepository.saveLegacyClassConfig(state.classConfig);
    markBuildAsDirty("class");
  }

  function saveSidebarTabState() {
    uiStateRepository.saveSidebarTab(state.activeSidebarTab);
  }

  function saveSphereEquippedState() {
    profileRepository.saveLegacySphereEquipment(state.sphereEquipped);
    markBuildAsDirty("sphere");
  }

  function saveTrophyEquippedState() {
    profileRepository.saveLegacyTrophyEquipment(state.trophyEquipped);
    markBuildAsDirty("trophy");
  }

  function savePetEquippedState() {
    profileRepository.saveLegacyPetSelection(state.petEquipped);
    markBuildAsDirty("pet");
  }

  function saveWorkspaceTabState() {
    uiStateRepository.saveWorkspaceTab(state.activeWorkspaceTab);
    markBuildAsDirty("workspace");
  }

  function saveProfilesState() {
    profileRepository.saveProfiles(state.profiles);
  }

  function saveActiveProfileIdState() {
    profileRepository.saveActiveProfileId(state.activeProfileId || "");
  }

  function saveLanguageState() {
    uiStateRepository.saveLanguage?.(state.language || "ru");
  }

  function persistLegacyStateSnapshot() {
    persistenceLocked = true;
    saveActiveProfileIdState();
    saveClassState();
    saveEquippedState();
    saveSphereEquippedState();
    saveTrophyEquippedState();
    savePetEquippedState();
    saveWorkspaceTabState();
    persistenceLocked = false;
  }

  function sanitizeEquippedState() {
    const rawPrevious = state.equipped && typeof state.equipped === "object" ? state.equipped : {};
    const previous = normalizeEquipmentSelections(rawPrevious, state.classConfig.classKey);
    const next = {};
    let changed = previous !== rawPrevious;
    const passiveSlot = getSlotConfig(PASSIVE_MORPH_RING_SLOT_KEY);

    Object.entries(previous).forEach(([slotKey, selection]) => {
      const slot = getSlotConfig(slotKey);
      const item = state.itemsById.get(String(selection?.itemId));
      const normalized = item
        ? {
            itemId: String(item.uid),
            upgradeLevel: getValidUpgradeLevel(item, selection?.upgradeLevel),
          }
        : null;

      if (
        normalized &&
        passiveSlot &&
        slotKey !== PASSIVE_MORPH_RING_SLOT_KEY &&
        matchesEquipmentSlot(passiveSlot, item, state.classConfig.classKey, previous) &&
        !next[PASSIVE_MORPH_RING_SLOT_KEY]
      ) {
        next[PASSIVE_MORPH_RING_SLOT_KEY] = normalized;
        changed = true;
      }

      if (!slot || !item || !matchesEquipmentSlot(slot, item, state.classConfig.classKey, previous)) {
        changed = true;
        return;
      }

      if (
        String(selection?.itemId) !== normalized.itemId ||
        selection?.upgradeLevel !== normalized.upgradeLevel
      ) {
        changed = true;
      }

      next[slotKey] = normalized;
    });

    if (Object.keys(next).length !== Object.keys(previous).length) {
      changed = true;
    }

    state.equipped = next;

    if (changed) {
      saveEquippedState();
    }
  }

  function sanitizeSphereEquippedState() {
    const previous = state.sphereEquipped && typeof state.sphereEquipped === "object" ? state.sphereEquipped : {};
    const next = {};
    let changed = false;

    Object.entries(previous).forEach(([slotKey, selection]) => {
      const slot = getSphereSlotConfig(slotKey);
      const item = state.sphereItemsById.get(String(selection?.itemId));
      if (!slot || !item || !slot.matches(item) || !isSphereAllowedForLevel(item, state.classConfig.level)) {
        changed = true;
        return;
      }

      const normalized = {
        itemId: String(item.uid),
        upgradeLevel: getValidUpgradeLevel(item, selection?.upgradeLevel),
      };

      if (
        String(selection?.itemId) !== normalized.itemId ||
        selection?.upgradeLevel !== normalized.upgradeLevel
      ) {
        changed = true;
      }

      next[slotKey] = normalized;
    });

    if (Object.keys(next).length !== Object.keys(previous).length) {
      changed = true;
    }

    state.sphereEquipped = next;

    if (changed) {
      saveSphereEquippedState();
    }
  }

  function sanitizeTrophyEquippedState() {
    const previous = state.trophyEquipped && typeof state.trophyEquipped === "object" ? state.trophyEquipped : {};
    const next = {};
    let changed = false;

    Object.entries(previous).forEach(([slotKey, selection]) => {
      const slot = getTrophySlotConfig(slotKey);
      const item = state.trophyItemsById.get(String(selection?.itemId));
      if (!slot || !item || item.slot_code !== slot.key) {
        changed = true;
        return;
      }

      const normalized = {
        itemId: String(item.uid),
        upgradeLevel: getValidUpgradeLevel(item, selection?.upgradeLevel),
      };

      if (
        String(selection?.itemId) !== normalized.itemId ||
        selection?.upgradeLevel !== normalized.upgradeLevel
      ) {
        changed = true;
      }

      next[slotKey] = normalized;
    });

    if (Object.keys(next).length !== Object.keys(previous).length) {
      changed = true;
    }

    state.trophyEquipped = next;

    if (changed) {
      saveTrophyEquippedState();
    }
  }

  function sanitizePetEquippedState() {
    const previous = state.petEquipped && typeof state.petEquipped === "object" ? state.petEquipped : null;
    const item = previous ? state.petItemsById.get(String(previous.itemId)) : null;
    const normalized = item ? createPetSelection(item.uid, previous?.mergeCounts) : null;
    const changed = JSON.stringify(previous || null) !== JSON.stringify(normalized || null);

    state.petEquipped = normalized;

    if (changed) {
      savePetEquippedState();
    }
  }

  function initializeUiState() {
    const equippedSlotKeys = getEquippedSlots().map((slot) => slot.key);
    const initialSlot = equippedSlotKeys[0] || getFirstAvailableSlotKey();
    const equippedSphereSlotKeys = getEquippedSphereSlots().map((slot) => slot.key);
    const initialSphereSlot = equippedSphereSlotKeys[0] || getFirstAvailableSphereSlotKey();
    const initialSphereCategory = getSphereSlotConfig(initialSphereSlot)?.categoryKey || null;
    const equippedTrophySlotKeys = getEquippedTrophySlots().map((slot) => slot.key);
    const equippedPet = getEquippedPet();
    const initialPetCategory = equippedPet?.variant || getFirstAvailablePetCategoryKey();

    state.activeSlot = initialSlot;
    state.expandedCategories = new Set(initialSlot ? [initialSlot] : []);
    state.activeSphereSlot = initialSphereSlot;
    state.expandedSphereCategories = new Set(initialSphereCategory ? [initialSphereCategory] : []);
    state.activeSphereTypeOneTab = getSphereTypeOneTabForSlot(initialSphereSlot);
    state.activeTrophySlot = equippedTrophySlotKeys[0] || TROPHY_SLOT_CONFIG[0]?.key || null;
    state.expandedTrophySlots = new Set(state.activeTrophySlot ? [state.activeTrophySlot] : []);
    state.activePetCategory = initialPetCategory;
    state.expandedPetCategories = new Set(initialPetCategory ? [initialPetCategory] : []);

    if (equippedSlotKeys.length) {
      setLastAction("Сборка загружена. Выберите слот, чтобы сменить предмет или уровень заточки.");
    } else {
      setLastAction("Выберите слот на кукле или откройте категорию справа.");
    }
  }

  return {
    state,
    loadProfilesState,
    loadActiveProfileIdState,
    saveEquippedState,
    saveClassState,
    saveSidebarTabState,
    saveSphereEquippedState,
    saveTrophyEquippedState,
    savePetEquippedState,
    saveWorkspaceTabState,
    saveProfilesState,
    saveActiveProfileIdState,
    saveLanguageState,
    persistLegacyStateSnapshot,
    sanitizeEquippedState,
    sanitizeSphereEquippedState,
    sanitizeTrophyEquippedState,
    sanitizePetEquippedState,
    initializeUiState,
  };
}
