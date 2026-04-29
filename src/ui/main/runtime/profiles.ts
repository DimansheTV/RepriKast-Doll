// @ts-nocheck
import { CLASS_CONFIGS } from "../../../domain/stats/runtime-config";
import { normalizeText, deepClone, sanitizeClassLevel } from "./utils";

export function createProfilesModule(deps) {
  const {
    state,
    loadProfilesState,
    loadActiveProfileIdState,
    saveProfilesState,
    saveActiveProfileIdState,
    persistLegacyStateSnapshot,
    getSlotConfig,
    getValidUpgradeLevel,
    matchesEquipmentSlot,
    normalizeEquipmentSelections,
    sanitizeEquippedState,
    sanitizeSphereEquippedState,
    sanitizeTrophyEquippedState,
    sanitizePetEquippedState,
    initializeUiState,
    syncActiveProfileFromState,
    renderAll,
    renderProfileBar,
    setLastAction,
  } = deps;

function createProfileId() {
  return `profile-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function getProfileFallbackName(index = state.profiles.length) {
  return `Профиль ${index + 1}`;
}

function sanitizeProfileName(name, fallbackName = getProfileFallbackName()) {
  const normalized = normalizeText(name).slice(0, 40);
  return normalized || fallbackName;
}

function sanitizeWorkspaceTab(tabKey) {
  return ["inventory", "pet", "spheres", "trophies"].includes(tabKey) ? tabKey : "inventory";
}

function normalizeProfileEquipped(equipped, classKey) {
  const source = normalizeEquipmentSelections(equipped, classKey);
  const next = {};

  Object.entries(source).forEach(([slotKey, selection]) => {
    const slot = getSlotConfig(slotKey);
    const item = state.itemsById.get(String(selection?.itemId));

    if (!slot || !item || !matchesEquipmentSlot(slot, item, classKey, source)) {
      return;
    }

    next[slotKey] = {
      itemId: String(item.uid),
      upgradeLevel: getValidUpgradeLevel(item, selection?.upgradeLevel),
    };
  });

  return next;
}

function normalizeProfileRecord(profile, index = 0) {
  const fallbackName = getProfileFallbackName(index);
  const classConfig = profile?.classConfig && typeof profile.classConfig === "object"
    ? profile.classConfig
    : {};
  const normalizedClassConfig = {
    classKey: CLASS_CONFIGS[classConfig.classKey] ? classConfig.classKey : "knight",
    level: sanitizeClassLevel(classConfig.level ?? 1),
  };

  return {
    id: String(profile?.id || createProfileId()),
    name: sanitizeProfileName(profile?.name, fallbackName),
    classConfig: normalizedClassConfig,
    equipped: normalizeProfileEquipped(profile?.equipped, normalizedClassConfig.classKey),
    sphereEquipped: profile?.sphereEquipped && typeof profile.sphereEquipped === "object" ? deepClone(profile.sphereEquipped) : {},
    trophyEquipped: profile?.trophyEquipped && typeof profile.trophyEquipped === "object" ? deepClone(profile.trophyEquipped) : {},
    petEquipped: profile?.petEquipped && typeof profile.petEquipped === "object" ? deepClone(profile.petEquipped) : null,
    activeWorkspaceTab: sanitizeWorkspaceTab(profile?.activeWorkspaceTab),
    createdAt: Number(profile?.createdAt) || Date.now(),
    updatedAt: Number(profile?.updatedAt) || Date.now(),
  };
}

function createProfileSnapshot(overrides = {}) {
  const fallbackName = getProfileFallbackName();

  return normalizeProfileRecord({
    id: overrides.id || createProfileId(),
    name: overrides.name || fallbackName,
    classConfig: overrides.classConfig ?? state.classConfig,
    equipped: overrides.equipped ?? state.equipped,
    sphereEquipped: overrides.sphereEquipped ?? state.sphereEquipped,
    trophyEquipped: overrides.trophyEquipped ?? state.trophyEquipped,
    petEquipped: overrides.petEquipped ?? state.petEquipped,
    activeWorkspaceTab: overrides.activeWorkspaceTab ?? state.activeWorkspaceTab,
    createdAt: overrides.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  }, state.profiles.length);
}

function createEmptyProfile(name = getProfileFallbackName()) {
  return normalizeProfileRecord({
    id: createProfileId(),
    name,
    classConfig: { classKey: "knight", level: 1 },
    equipped: {},
    sphereEquipped: {},
    trophyEquipped: {},
    petEquipped: null,
    activeWorkspaceTab: "inventory",
  }, state.profiles.length);
}

function getNextProfileName() {
  const names = new Set(state.profiles.map((profile) => profile.name));
  let index = 1;
  while (names.has(`Профиль ${index}`)) {
    index += 1;
  }
  return `Профиль ${index}`;
}

function getUniqueProfileCopyName(sourceName) {
  const names = new Set(state.profiles.map((profile) => profile.name));
  const source = normalizeText(sourceName) || "Профиль";
  const baseName = sanitizeProfileName(`${source} копия`, "Профиль копия");

  if (!names.has(baseName)) {
    return baseName;
  }

  let index = 2;
  while (index < 1000) {
    const suffix = ` копия ${index}`;
    const trimmedSource = source.slice(0, Math.max(1, 40 - suffix.length));
    const candidate = sanitizeProfileName(`${trimmedSource}${suffix}`, `Профиль копия ${index}`);
    if (!names.has(candidate)) {
      return candidate;
    }
    index += 1;
  }

  return sanitizeProfileName(`Профиль копия ${Date.now()}`, "Профиль копия");
}

function getActiveProfile() {
  return state.profiles.find((profile) => profile.id === state.activeProfileId) || null;
}

function createItemUid(item, index) {
  return `${item.slot_code}:${item.name}:${index}`;
}

function createSphereUid(item, index) {
  return `sphere:${item.category || "unknown"}:${item.id ?? index}`;
}

function createTrophyUid(item, index) {
  return `trophy:${item.slot_code || "unknown"}:${item.id ?? index}`;
}

function createPetUid(item, index) {
  return `pet:${item.id ?? index}`;
}

function applyProfileToState(profile) {
  const normalized = normalizeProfileRecord(profile);
  state.activeProfileId = normalized.id;
  state.classConfig = deepClone(normalized.classConfig);
  state.equipped = deepClone(normalized.equipped);
  state.sphereEquipped = deepClone(normalized.sphereEquipped);
  state.trophyEquipped = deepClone(normalized.trophyEquipped);
  state.petEquipped = deepClone(normalized.petEquipped);
  state.activeWorkspaceTab = sanitizeWorkspaceTab(normalized.activeWorkspaceTab);
  persistLegacyStateSnapshot();
}

function initializeProfilesState() {
  const loadedProfiles = loadProfilesState().map((profile, index) => normalizeProfileRecord(profile, index));
  const activeProfileId = loadActiveProfileIdState();

  if (!loadedProfiles.length) {
    const migratedProfile = createProfileSnapshot({
      id: createProfileId(),
      name: getNextProfileName(),
      classConfig: state.classConfig,
      equipped: state.equipped,
      sphereEquipped: state.sphereEquipped,
      trophyEquipped: state.trophyEquipped,
      petEquipped: state.petEquipped,
      activeWorkspaceTab: state.activeWorkspaceTab,
    });
    state.profiles = [migratedProfile];
    state.activeProfileId = migratedProfile.id;
    saveProfilesState();
    saveActiveProfileIdState();
    return;
  }

  state.profiles = loadedProfiles;
  state.activeProfileId = loadedProfiles.some((profile) => profile.id === activeProfileId)
    ? activeProfileId
    : loadedProfiles[0].id;

  const activeProfile = getActiveProfile() || loadedProfiles[0];
  if (activeProfile) {
    applyProfileToState(activeProfile);
  }
}

function setActiveProfile(profileId, { persistCurrent = true } = {}) {
  const nextProfile = state.profiles.find((profile) => profile.id === profileId);
  if (!nextProfile) {
    return;
  }

  if (persistCurrent) {
    syncActiveProfileFromState();
  }

  applyProfileToState(nextProfile);
  sanitizeEquippedState();
  sanitizeSphereEquippedState();
  sanitizeTrophyEquippedState();
  sanitizePetEquippedState();
  initializeUiState();
  syncActiveProfileFromState();
  renderAll();
  setLastAction(`Активирован профиль "${nextProfile.name}".`);
}

function renameActiveProfile(name) {
  const profile = getActiveProfile();
  if (!profile) {
    return;
  }

  profile.name = sanitizeProfileName(name, profile.name);
  profile.updatedAt = Date.now();
  saveProfilesState();
  renderProfileBar();
  setLastAction(`Профиль переименован в "${profile.name}".`);
}

function createNewProfile() {
  syncActiveProfileFromState();
  const profile = createEmptyProfile(getNextProfileName());
  state.profiles.push(profile);
  saveProfilesState();
  setActiveProfile(profile.id, { persistCurrent: false });
  setLastAction(`Создан профиль "${profile.name}".`);
}

function saveActiveProfileExplicitly() {
  syncActiveProfileFromState();
  const profile = getActiveProfile();
  if (!profile) {
    return;
  }

  saveProfilesState();
  saveActiveProfileIdState();
  renderProfileBar();
  setLastAction(`Профиль "${profile.name}" сохранён.`);
}

function copyActiveProfile() {
  syncActiveProfileFromState();
  const sourceProfile = getActiveProfile();
  if (!sourceProfile) {
    return;
  }

  const profile = createProfileSnapshot({
    id: createProfileId(),
    name: getUniqueProfileCopyName(sourceProfile.name),
    createdAt: Date.now(),
  });

  state.profiles.push(profile);
  saveProfilesState();
  setActiveProfile(profile.id, { persistCurrent: false });
  setLastAction(`Создана копия профиля "${profile.name}".`);
}

function deleteActiveProfile() {
  if (state.profiles.length <= 1) {
    return;
  }

  const profile = getActiveProfile();
  if (!profile) {
    return;
  }

  state.profiles = state.profiles.filter((entry) => entry.id !== profile.id);
  saveProfilesState();
  setActiveProfile(state.profiles[0].id, { persistCurrent: false });
  setLastAction(`Профиль "${profile.name}" удалён.`);
}


  return {
    createProfileId,
    getProfileFallbackName,
    sanitizeProfileName,
    sanitizeWorkspaceTab,
    normalizeProfileRecord,
    createProfileSnapshot,
    createEmptyProfile,
    getNextProfileName,
    getUniqueProfileCopyName,
    getActiveProfile,
    applyProfileToState,
    initializeProfilesState,
    setActiveProfile,
    renameActiveProfile,
    createNewProfile,
    saveActiveProfileExplicitly,
    copyActiveProfile,
    deleteActiveProfile,
  };
}
