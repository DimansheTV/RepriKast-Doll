const STORAGE_KEYS = {
  equipment: "r2-doll-equip-v3",
  sphere: "r2-doll-sphere-v1",
  trophy: "r2-doll-trophy-v1",
  pet: "r2-doll-pet-v1",
  classConfig: "r2-doll-class-v1",
  profiles: "r2-doll-profiles-v1",
  activeProfileId: "r2-doll-active-profile-v1",
};

function loadJson(storage, key, fallback) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures to preserve file:// compatibility.
  }
}

export function createProfileRepository(storage) {
  return {
    keys: STORAGE_KEYS,
    loadLegacyEquipment() {
      const value = loadJson(storage, STORAGE_KEYS.equipment, {});
      return value && typeof value === "object" ? value : {};
    },
    saveLegacyEquipment(value) {
      saveJson(storage, STORAGE_KEYS.equipment, value);
    },
    loadLegacySphereEquipment() {
      const value = loadJson(storage, STORAGE_KEYS.sphere, {});
      return value && typeof value === "object" ? value : {};
    },
    saveLegacySphereEquipment(value) {
      saveJson(storage, STORAGE_KEYS.sphere, value);
    },
    loadLegacyTrophyEquipment() {
      const value = loadJson(storage, STORAGE_KEYS.trophy, {});
      return value && typeof value === "object" ? value : {};
    },
    saveLegacyTrophyEquipment(value) {
      saveJson(storage, STORAGE_KEYS.trophy, value);
    },
    loadLegacyPetSelection() {
      const value = loadJson(storage, STORAGE_KEYS.pet, null);
      return value && typeof value === "object" ? value : null;
    },
    saveLegacyPetSelection(value) {
      saveJson(storage, STORAGE_KEYS.pet, value);
    },
    loadLegacyClassConfig() {
      const value = loadJson(storage, STORAGE_KEYS.classConfig, { classKey: "knight", level: 1 });
      return value && typeof value === "object" ? value : { classKey: "knight", level: 1 };
    },
    saveLegacyClassConfig(value) {
      saveJson(storage, STORAGE_KEYS.classConfig, value);
    },
    loadProfiles() {
      const value = loadJson(storage, STORAGE_KEYS.profiles, []);
      return Array.isArray(value) ? value : [];
    },
    saveProfiles(value) {
      saveJson(storage, STORAGE_KEYS.profiles, value);
    },
    loadActiveProfileId() {
      try {
        return String(storage.getItem(STORAGE_KEYS.activeProfileId) || "");
      } catch {
        return "";
      }
    },
    saveActiveProfileId(value) {
      try {
        storage.setItem(STORAGE_KEYS.activeProfileId, value || "");
      } catch {
        // Ignore storage failures to preserve file:// compatibility.
      }
    },
  };
}
