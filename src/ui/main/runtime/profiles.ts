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
    renderAll,
    renderProfileBar,
    showBuildToast,
    setLastAction,
  } = deps;

  function createProfileId() {
    return `profile-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  }

  function getProfileFallbackName(index = state.profiles.length) {
    return `Сборка ${index + 1}`;
  }

  function sanitizeProfileName(name, fallbackName = getProfileFallbackName()) {
    const normalized = normalizeText(name).slice(0, 40);
    return normalized || fallbackName;
  }

  function normalizeDraftName(name) {
    return normalizeText(name).slice(0, 40);
  }

  function getActiveDraftDisplayName() {
    return sanitizeProfileName(state.activeDraftName, getProfileFallbackName());
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
    const sourceProfile = getSavedProfileById(overrides.sourceProfileId || state.activeDraftSourceProfileId || state.activeProfileId);

    return normalizeProfileRecord({
      id: overrides.id || state.activeProfileId || createProfileId(),
      name: overrides.name ?? getActiveDraftDisplayName() ?? fallbackName,
      classConfig: overrides.classConfig ?? state.classConfig,
      equipped: overrides.equipped ?? state.equipped,
      sphereEquipped: overrides.sphereEquipped ?? state.sphereEquipped,
      trophyEquipped: overrides.trophyEquipped ?? state.trophyEquipped,
      petEquipped: overrides.petEquipped ?? state.petEquipped,
      activeWorkspaceTab: overrides.activeWorkspaceTab ?? state.activeWorkspaceTab,
      createdAt: overrides.createdAt ?? sourceProfile?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    }, state.profiles.length);
  }

  function setCleanBuildSnapshot(profile) {
    if (!profile) {
      state.cleanBuildSnapshot = null;
      return null;
    }

    const snapshot = normalizeProfileRecord(profile);
    state.cleanBuildSnapshot = deepClone(snapshot);
    return snapshot;
  }

  function getCleanBuildSnapshot() {
    if (!state.cleanBuildSnapshot) {
      return null;
    }

    return normalizeProfileRecord(deepClone(state.cleanBuildSnapshot));
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
    while (names.has(`Сборка ${index}`)) {
      index += 1;
    }
    return `Сборка ${index}`;
  }

  function getUniqueProfileCopyName(sourceName) {
    const names = new Set(state.profiles.map((profile) => profile.name));
    const source = normalizeText(sourceName) || "Сборка";
    const baseName = sanitizeProfileName(`${source} копия`, "Сборка копия");

    if (!names.has(baseName)) {
      return baseName;
    }

    let index = 2;
    while (index < 1000) {
      const suffix = ` копия ${index}`;
      const trimmedSource = source.slice(0, Math.max(1, 40 - suffix.length));
      const candidate = sanitizeProfileName(`${trimmedSource}${suffix}`, `Сборка копия ${index}`);
      if (!names.has(candidate)) {
        return candidate;
      }
      index += 1;
    }

    return sanitizeProfileName(`Сборка копия ${Date.now()}`, "Сборка копия");
  }

  function getSavedProfileById(profileId) {
    return state.profiles.find((profile) => profile.id === profileId) || null;
  }

  function getActiveSavedProfile() {
    return getSavedProfileById(state.activeDraftSourceProfileId || state.activeProfileId);
  }

  function getActiveProfile() {
    if (!state.activeProfileId) {
      return null;
    }

    return createProfileSnapshot({
      id: state.activeProfileId,
      name: getActiveDraftDisplayName(),
    });
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

  function syncDraftMeta(profile, {
    mode = "existing",
    sourceProfileId = profile?.id || "",
    isDirty = false,
    keepMenuState = false,
  } = {}) {
    const normalized = normalizeProfileRecord(profile);
    state.activeProfileId = normalized.id;
    state.activeDraftName = normalized.name;
    state.activeDraftSourceProfileId = sourceProfileId || "";
    state.activeDraftMode = mode;
    state.isBuildDirty = Boolean(isDirty);
    state.isBuildNameEditing = false;
    state.isBuildMenuOpen = keepMenuState ? state.isBuildMenuOpen : false;
  }

  function activateSavedProfile(profile, { announce = true } = {}) {
    applyProfileToState(profile);
    sanitizeEquippedState();
    sanitizeSphereEquippedState();
    sanitizeTrophyEquippedState();
    sanitizePetEquippedState();
    initializeUiState();
    const cleanProfile = createProfileSnapshot({
      id: profile.id,
      name: profile.name,
      createdAt: profile.createdAt,
      sourceProfileId: profile.id,
    });
    setCleanBuildSnapshot(cleanProfile);
    syncDraftMeta(cleanProfile, { mode: "existing", sourceProfileId: profile.id, isDirty: false });
    saveActiveProfileIdState();
    renderAll();
    if (announce) {
      setLastAction(`Активирована сборка "${profile.name}".`);
    }
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
      setCleanBuildSnapshot(migratedProfile);
      syncDraftMeta(migratedProfile, { mode: "existing", sourceProfileId: migratedProfile.id, isDirty: false });
      saveProfilesState();
      applyProfileToState(migratedProfile);
      saveActiveProfileIdState();
      return;
    }

    state.profiles = loadedProfiles;
    const selectedProfile = loadedProfiles.find((profile) => profile.id === activeProfileId) || loadedProfiles[0];
    activateSavedProfile(selectedProfile, { announce: false });
  }

  function markBuildDirty(options = {}) {
    const shouldRender = typeof options === "object" ? options.render !== false : true;
    const wasDirty = state.isBuildDirty;
    const wasMenuOpen = state.isBuildMenuOpen;

    state.isBuildDirty = true;
    state.isBuildMenuOpen = false;

    if (shouldRender && (!wasDirty || wasMenuOpen)) {
      renderProfileBar();
    }
  }

  function setActiveProfile(profileId) {
    if (state.isBuildDirty || !profileId) {
      return;
    }

    const nextProfile = getSavedProfileById(profileId);
    if (!nextProfile) {
      return;
    }

    activateSavedProfile(nextProfile);
  }

  function setActiveDraftName(name, { render = true } = {}) {
    state.activeDraftName = normalizeDraftName(name);
    markBuildDirty({ render: false });
    if (render) {
      renderProfileBar();
    }
    return getActiveDraftDisplayName();
  }

  function startBuildNameEditing() {
    state.isBuildMenuOpen = false;
    state.isBuildNameEditing = true;
    renderProfileBar();
  }

  function finishBuildNameEditing(name) {
    state.activeDraftName = sanitizeProfileName(name, getProfileFallbackName());
    state.isBuildNameEditing = false;
    markBuildDirty({ render: false });
    renderProfileBar();
    setLastAction(`Название сборки изменено на "${state.activeDraftName}".`);
  }

  function cancelBuildNameEditing() {
    state.activeDraftName = getActiveDraftDisplayName();
    state.isBuildNameEditing = false;
    renderProfileBar();
  }

  function toggleBuildMenu() {
    if (state.isBuildDirty || state.isBuildNameEditing) {
      return;
    }

    state.isBuildMenuOpen = !state.isBuildMenuOpen;
    renderProfileBar();
  }

  function closeBuildMenu() {
    if (!state.isBuildMenuOpen) {
      return;
    }

    state.isBuildMenuOpen = false;
    renderProfileBar();
  }

  function createNewProfile() {
    if (state.isBuildDirty) {
      return;
    }

    const cleanSnapshot = getCleanBuildSnapshot();
    const profile = createEmptyProfile(getNextProfileName());
    applyProfileToState(profile);
    initializeUiState();
    if (cleanSnapshot) {
      state.cleanBuildSnapshot = deepClone(cleanSnapshot);
    }
    syncDraftMeta(profile, { mode: "new", sourceProfileId: "", isDirty: true });
    renderAll();
    setLastAction(`Создана новая сборка "${profile.name}".`);
  }

  function saveActiveProfileExplicitly() {
    const sourceProfile = getActiveSavedProfile();
    let savedProfile;

    if (state.activeDraftMode === "existing" && sourceProfile) {
      savedProfile = createProfileSnapshot({
        id: sourceProfile.id,
        name: getActiveDraftDisplayName(),
        createdAt: sourceProfile.createdAt,
        sourceProfileId: sourceProfile.id,
      });
      state.profiles = state.profiles.map((profile) => profile.id === sourceProfile.id ? savedProfile : profile);
    } else {
      savedProfile = createProfileSnapshot({
        id: state.activeProfileId || createProfileId(),
        name: getActiveDraftDisplayName(),
        createdAt: Date.now(),
      });
      state.profiles.push(savedProfile);
    }

    state.profiles = state.profiles.map((profile, index) => normalizeProfileRecord(profile, index));
    const persistedProfile = state.profiles.find((profile) => profile.id === savedProfile.id) || savedProfile;

    setCleanBuildSnapshot(persistedProfile);
    syncDraftMeta(persistedProfile, {
      mode: "existing",
      sourceProfileId: persistedProfile.id,
      isDirty: false,
    });
    saveProfilesState();
    applyProfileToState(persistedProfile);
    saveActiveProfileIdState();
    renderAll();
    showBuildToast("Сборка успешно сохранена");
    setLastAction(`Сборка "${persistedProfile.name}" сохранена.`);
  }

  function copyActiveProfile() {
    if (state.isBuildDirty) {
      return;
    }

    const cleanSnapshot = getCleanBuildSnapshot();
    const sourceProfile = getActiveProfile();
    if (!sourceProfile) {
      return;
    }

    const profile = createProfileSnapshot({
      id: createProfileId(),
      name: getUniqueProfileCopyName(getActiveDraftDisplayName()),
      createdAt: Date.now(),
    });

    applyProfileToState(profile);
    initializeUiState();
    if (cleanSnapshot) {
      state.cleanBuildSnapshot = deepClone(cleanSnapshot);
    }
    syncDraftMeta(profile, {
      mode: "copy",
      sourceProfileId: sourceProfile.id,
      isDirty: true,
    });
    renderAll();
    setLastAction(`Создана копия сборки "${profile.name}".`);
  }

  function cancelActiveBuildEdits() {
    if (!state.isBuildDirty) {
      cancelBuildNameEditing();
      return;
    }

    const cleanSnapshot = getCleanBuildSnapshot() || getSavedProfileById(state.activeDraftSourceProfileId) || state.profiles[0] || null;
    if (!cleanSnapshot) {
      return;
    }

    applyProfileToState(cleanSnapshot);
    sanitizeEquippedState();
    sanitizeSphereEquippedState();
    sanitizeTrophyEquippedState();
    sanitizePetEquippedState();
    initializeUiState();
    setCleanBuildSnapshot(cleanSnapshot);
    syncDraftMeta(cleanSnapshot, {
      mode: "existing",
      sourceProfileId: cleanSnapshot.id,
      isDirty: false,
    });
    renderAll();
    setLastAction(`Изменения сборки "${cleanSnapshot.name}" отменены.`);
  }

  function deleteActiveProfile() {
    if (state.isBuildDirty || state.profiles.length <= 1) {
      return;
    }

    const profile = getActiveSavedProfile();
    if (!profile) {
      return;
    }

    state.profiles = state.profiles.filter((entry) => entry.id !== profile.id);
    saveProfilesState();
    activateSavedProfile(state.profiles[0]);
    setLastAction(`Сборка "${profile.name}" удалена.`);
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
    getSavedProfileById,
    getActiveSavedProfile,
    getActiveDraftDisplayName,
    applyProfileToState,
    initializeProfilesState,
    markBuildDirty,
    setActiveProfile,
    setActiveDraftName,
    startBuildNameEditing,
    finishBuildNameEditing,
    cancelBuildNameEditing,
    cancelActiveBuildEdits,
    toggleBuildMenu,
    closeBuildMenu,
    createNewProfile,
    saveActiveProfileExplicitly,
    copyActiveProfile,
    deleteActiveProfile,
  };
}
