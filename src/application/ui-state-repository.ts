const STORAGE_KEYS = {
  sidebarTab: "r2-doll-sidebar-tab-v2",
  workspaceTab: "r2-doll-workspace-tab-v1",
  compareSecondaryProfileId: "r2-doll-compare-secondary-v1",
  navTransition: "r2-nav-transition-v1",
};

export function createUiStateRepository(storage, sessionStorageImpl = storage) {
  return {
    keys: STORAGE_KEYS,
    loadSidebarTab() {
      try {
        const value = storage.getItem(STORAGE_KEYS.sidebarTab);
        return ["class", "stats"].includes(value) ? value : "class";
      } catch {
        return "class";
      }
    },
    saveSidebarTab(value) {
      try {
        storage.setItem(STORAGE_KEYS.sidebarTab, value);
      } catch {
        // Ignore storage failures to preserve file:// compatibility.
      }
    },
    loadWorkspaceTab() {
      try {
        const value = storage.getItem(STORAGE_KEYS.workspaceTab);
        return ["inventory", "pet", "spheres", "trophies"].includes(value) ? value : "inventory";
      } catch {
        return "inventory";
      }
    },
    saveWorkspaceTab(value) {
      try {
        storage.setItem(STORAGE_KEYS.workspaceTab, value);
      } catch {
        // Ignore storage failures to preserve file:// compatibility.
      }
    },
    loadCompareSecondaryProfileId() {
      try {
        return String(storage.getItem(STORAGE_KEYS.compareSecondaryProfileId) || "");
      } catch {
        return "";
      }
    },
    saveCompareSecondaryProfileId(value) {
      try {
        storage.setItem(STORAGE_KEYS.compareSecondaryProfileId, value || "");
      } catch {
        // Ignore storage failures to preserve file:// compatibility.
      }
    },
    loadNavTransition() {
      try {
        return sessionStorageImpl.getItem(STORAGE_KEYS.navTransition) || "";
      } catch {
        return "";
      }
    },
    saveNavTransition(value) {
      try {
        sessionStorageImpl.setItem(STORAGE_KEYS.navTransition, value);
      } catch {
        // Ignore storage failures to preserve file:// compatibility.
      }
    },
    clearNavTransition() {
      try {
        sessionStorageImpl.removeItem(STORAGE_KEYS.navTransition);
      } catch {
        // Ignore storage failures to preserve file:// compatibility.
      }
    },
  };
}
