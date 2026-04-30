// @ts-nocheck
import { bindPageTransitions as bindPageTransitionsImpl } from "./page-transitions";
import { createCatalogModule } from "./runtime/catalog";
import { createProfilesModule } from "./runtime/profiles";
import { createStatsModule, CLASS_CONFIGS } from "./runtime/stats";
import { createMainRenderModule } from "./runtime/render-main";
import { createRuntimeState } from "./runtime/state";
import { createMainWorkspaceModule } from "./runtime/workspace-main";
import { createSharedRuntimeApi } from "./runtime/shared-api";
import { normalizeText, sanitizeClassLevel, escapeHtml } from "./runtime/utils";
import { DEFAULT_LANGUAGE, normalizeLanguage, localizeText, t } from "../../shared/i18n";

export function createAppRuntime(context) {
  const { catalogRepository, profileRepository, uiStateRepository } = context;

  let catalogModule;
  let getCurrentLanguage = () => DEFAULT_LANGUAGE;
  const refs = {
    renderAll: () => {},
    createProfileSnapshot: () => { throw new Error("Profile runtime not initialized"); },
    markBuildDirty: () => {},
    renderProfileBar: () => {},
    setLastAction: () => {},
    showBuildToast: () => {},
  };

  const stateModule = createRuntimeState({
    profileRepository,
    uiStateRepository,
    sanitizeClassLevel,
    setLastAction: (message) => refs.setLastAction(localizeText(message, getCurrentLanguage?.() || DEFAULT_LANGUAGE)),
    markBuildDirty: (...args) => refs.markBuildDirty(...args),
    getSlotConfig: (...args) => catalogModule.getSlotConfig(...args),
    getSphereSlotConfig: (...args) => catalogModule.getSphereSlotConfig(...args),
    isSphereAllowedForLevel: (...args) => catalogModule.isSphereAllowedForLevel(...args),
    getTrophySlotConfig: (...args) => catalogModule.getTrophySlotConfig(...args),
    getValidUpgradeLevel: (...args) => catalogModule.getValidUpgradeLevel(...args),
    matchesEquipmentSlot: (...args) => catalogModule.matchesEquipmentSlot(...args),
    normalizeEquipmentSelections: (...args) => catalogModule.normalizeEquipmentSelections(...args),
    createPetSelection: (...args) => catalogModule.createPetSelection(...args),
    getEquippedSlots: (...args) => catalogModule.getEquippedSlots(...args),
    getFirstAvailableSlotKey: (...args) => catalogModule.getFirstAvailableSlotKey(...args),
    getEquippedSphereSlots: (...args) => catalogModule.getEquippedSphereSlots(...args),
    getFirstAvailableSphereSlotKey: (...args) => catalogModule.getFirstAvailableSphereSlotKey(...args),
    getEquippedTrophySlots: (...args) => catalogModule.getEquippedTrophySlots(...args),
    getEquippedPet: (...args) => catalogModule.getEquippedPet(...args),
    getFirstAvailablePetCategoryKey: (...args) => catalogModule.getFirstAvailablePetCategoryKey(...args),
    getSphereTypeOneTabForSlot: (...args) => catalogModule.getSphereTypeOneTabForSlot(...args),
  });

  getCurrentLanguage = () => normalizeLanguage(stateModule.state.language || DEFAULT_LANGUAGE);
  const localize = (value) => localizeText(value, getCurrentLanguage());
  const translate = (key, params = {}) => t(key, getCurrentLanguage(), params);
  const setLanguage = (language) => {
    const nextLanguage = normalizeLanguage(language);
    if (stateModule.state.language === nextLanguage) {
      return;
    }

    stateModule.state.language = nextLanguage;
    stateModule.saveLanguageState();
    refs.renderAll();
  };

  catalogModule = createCatalogModule({
    state: stateModule.state,
    localizeText: (value) => localize(value),
    getCurrentLanguage,
  });

  const profilesModule = createProfilesModule({
    state: stateModule.state,
    loadProfilesState: stateModule.loadProfilesState,
    loadActiveProfileIdState: stateModule.loadActiveProfileIdState,
    saveProfilesState: stateModule.saveProfilesState,
    saveActiveProfileIdState: stateModule.saveActiveProfileIdState,
    persistLegacyStateSnapshot: stateModule.persistLegacyStateSnapshot,
    getSlotConfig: catalogModule.getSlotConfig,
    getSphereSlotConfig: catalogModule.getSphereSlotConfig,
    getValidUpgradeLevel: catalogModule.getValidUpgradeLevel,
    matchesEquipmentSlot: catalogModule.matchesEquipmentSlot,
    isSphereAllowedForLevel: catalogModule.isSphereAllowedForLevel,
    normalizeEquipmentSelections: catalogModule.normalizeEquipmentSelections,
    sanitizeEquippedState: stateModule.sanitizeEquippedState,
    sanitizeSphereEquippedState: stateModule.sanitizeSphereEquippedState,
    sanitizeTrophyEquippedState: stateModule.sanitizeTrophyEquippedState,
    sanitizePetEquippedState: stateModule.sanitizePetEquippedState,
    initializeUiState: stateModule.initializeUiState,
    renderAll: (...args) => refs.renderAll(...args),
    renderProfileBar: (...args) => refs.renderProfileBar(...args),
    showBuildToast: (...args) => refs.showBuildToast(...args),
    setLastAction: (...args) => refs.setLastAction(...args),
    t: (...args) => translate(...args),
  });
  refs.createProfileSnapshot = profilesModule.createProfileSnapshot;
  refs.markBuildDirty = profilesModule.markBuildDirty;

  const statsModule = createStatsModule({
    state: stateModule.state,
    getParamsForLevel: catalogModule.getParamsForLevel,
    getDefaultUpgradeLevel: catalogModule.getDefaultUpgradeLevel,
    getValidUpgradeLevel: catalogModule.getValidUpgradeLevel,
    getPetMergeStats: catalogModule.getPetMergeStats,
    getEquippedSlots: catalogModule.getEquippedSlots,
    getEquippedSphereSlots: catalogModule.getEquippedSphereSlots,
    getEquippedTrophySlots: catalogModule.getEquippedTrophySlots,
    localizeText: (value) => localize(value),
    getCurrentLanguage,
  });

  const renderModule = createMainRenderModule({
    state: stateModule.state,
    getActiveProfile: profilesModule.getActiveProfile,
    getActiveDraftDisplayName: profilesModule.getActiveDraftDisplayName,
    setActiveProfile: profilesModule.setActiveProfile,
    setActiveDraftName: profilesModule.setActiveDraftName,
    startBuildNameEditing: profilesModule.startBuildNameEditing,
    finishBuildNameEditing: profilesModule.finishBuildNameEditing,
    cancelBuildNameEditing: profilesModule.cancelBuildNameEditing,
    cancelActiveBuildEdits: profilesModule.cancelActiveBuildEdits,
    toggleBuildMenu: profilesModule.toggleBuildMenu,
    closeBuildMenu: profilesModule.closeBuildMenu,
    saveActiveProfileExplicitly: profilesModule.saveActiveProfileExplicitly,
    copyActiveProfile: profilesModule.copyActiveProfile,
    createNewProfile: profilesModule.createNewProfile,
    deleteActiveProfile: profilesModule.deleteActiveProfile,
    saveWorkspaceTabState: stateModule.saveWorkspaceTabState,
    saveSidebarTabState: stateModule.saveSidebarTabState,
    saveClassState: stateModule.saveClassState,
    sanitizeEquippedState: stateModule.sanitizeEquippedState,
    sanitizeSphereEquippedState: stateModule.sanitizeSphereEquippedState,
    renderAll: (...args) => refs.renderAll(...args),
    collectEquippedStats: statsModule.collectEquippedStats,
    getDisplayStatsFromMap: statsModule.getDisplayStatsFromMap,
    addStatCollection: statsModule.addStatCollection,
    formatBoardPrimaryValue: statsModule.formatBoardPrimaryValue,
    formatStatValue: statsModule.formatStatValue,
    getParamsForLevel: catalogModule.getParamsForLevel,
    normalizeText,
    parseNumericStat: statsModule.parseNumericStat,
    escapeHtml,
    formatUpgradeSuffix: catalogModule.formatUpgradeSuffix,
    getMorphSphereRequiredLevel: catalogModule.getMorphSphereRequiredLevel,
    shouldShowSphereUpgrade: catalogModule.shouldShowSphereUpgrade,
    getLevelKeys: catalogModule.getLevelKeys,
    CLASS_CONFIGS,
    sanitizeClassLevel,
    t: (...args) => translate(...args),
    localizeText: (value) => localize(value),
    setLanguage,
  });
  refs.setLastAction = renderModule.setLastAction;
  refs.renderProfileBar = renderModule.renderProfileBar;
  refs.showBuildToast = renderModule.showBuildToast;

  const workspaceModule = createMainWorkspaceModule({
    state: stateModule.state,
    renderAll: (...args) => refs.renderAll(...args),
    setLastAction: (message) => refs.setLastAction(localize(message)),
    getSlotConfig: catalogModule.getSlotConfig,
    matchesEquipmentSlot: catalogModule.matchesEquipmentSlot,
    getDefaultUpgradeLevel: catalogModule.getDefaultUpgradeLevel,
    saveEquippedState: stateModule.saveEquippedState,
    getValidUpgradeLevel: catalogModule.getValidUpgradeLevel,
    getAdjacentUpgradeLevel: catalogModule.getAdjacentUpgradeLevel,
    getItemsForEquipmentSlot: catalogModule.getItemsForEquipmentSlot,
    getLevelKeys: catalogModule.getLevelKeys,
    formatUpgradeTitleSuffix: catalogModule.formatUpgradeTitleSuffix,
    renderUpgradeStepperControl: catalogModule.renderUpgradeStepperControl,
    escapeHtml,
    renderEquipmentDescription: renderModule.renderEquipmentDescription,
    getSphereSlotConfig: catalogModule.getSphereSlotConfig,
    getSphereItemsForSlot: catalogModule.getSphereItemsForSlot,
    getSphereCategoryGroups: catalogModule.getSphereCategoryGroups,
    getPrimarySphereSlot: catalogModule.getPrimarySphereSlot,
    getMorphSphereRequiredLevel: catalogModule.getMorphSphereRequiredLevel,
    isSphereAllowedForLevel: catalogModule.isSphereAllowedForLevel,
    shouldShowSphereUpgrade: catalogModule.shouldShowSphereUpgrade,
    shouldDisplayUpgradeLevel: catalogModule.shouldDisplayUpgradeLevel,
    renderSphereDescription: renderModule.renderSphereDescription,
    getSphereTypeOneTabForSlot: catalogModule.getSphereTypeOneTabForSlot,
    saveSphereEquippedState: stateModule.saveSphereEquippedState,
    getTrophySlotConfig: catalogModule.getTrophySlotConfig,
    getTrophyItemsForSlot: catalogModule.getTrophyItemsForSlot,
    renderTrophyDescription: renderModule.renderTrophyDescription,
    saveTrophyEquippedState: stateModule.saveTrophyEquippedState,
    getPetCategoryGroups: catalogModule.getPetCategoryGroups,
    getParamsForLevel: catalogModule.getParamsForLevel,
    normalizeText,
    renderItemIcon: statsModule.renderItemIcon,
    renderStatRows: renderModule.renderStatRows,
    getEquippedPet: catalogModule.getEquippedPet,
    getPetMergeCounts: catalogModule.getPetMergeCounts,
    getPetMergeTotal: catalogModule.getPetMergeTotal,
    getPetMergeBonusValue: catalogModule.getPetMergeBonusValue,
    formatStatValue: statsModule.formatStatValue,
    createCollectedStatsBucket: statsModule.createCollectedStatsBucket,
    collectItemParamsIntoBucket: statsModule.collectItemParamsIntoBucket,
    addStatWithRules: statsModule.addStatWithRules,
    getDisplayStatsFromMap: statsModule.getDisplayStatsFromMap,
    getPetMergeStats: catalogModule.getPetMergeStats,
    savePetEquippedState: stateModule.savePetEquippedState,
    createPetSelection: catalogModule.createPetSelection,
    localizeText: (value) => localize(value),
    t: (...args) => translate(...args),
  });

  refs.renderAll = () => {
    renderModule.renderProfileBar();
    renderModule.renderSidebarTabs();
    renderModule.renderStatsSourceTabs();
    renderModule.renderWorkspaceTabs();
    workspaceModule.renderDollSlots();
    workspaceModule.renderPassiveMorphRingSlot();
    workspaceModule.renderPetWorkspace();
    workspaceModule.renderSphereSlots();
    workspaceModule.renderTrophySlots();
    renderModule.renderBoardTotalStats();
    renderModule.renderStatsPanel();
    renderModule.renderClassPanel();
    workspaceModule.renderCategoryList();
  };

  const shared = createSharedRuntimeApi({
    stateModule,
    catalogModule,
    profilesModule,
    statsModule,
    normalizeText,
    sanitizeClassLevel,
    escapeHtml,
    localizeText: (value) => localize(value),
    t: (...args) => translate(...args),
    setLanguage,
    getCurrentLanguage,
  });

  async function init() {
    try {
      const catalogs = await catalogRepository.loadAll();
      catalogModule.hydrateCatalogs(catalogs);
      profilesModule.initializeProfilesState();
      stateModule.sanitizeEquippedState();
      stateModule.sanitizeSphereEquippedState();
      stateModule.sanitizeTrophyEquippedState();
      stateModule.sanitizePetEquippedState();
      stateModule.initializeUiState();
      refs.renderAll();
      renderModule.bindProfileControls();
      renderModule.bindSidebarTabs();
      renderModule.bindStatsSourceTabs();
      renderModule.bindWorkspaceTabs();
      renderModule.bindMobileNav();
      renderModule.bindClassControls();
    } catch (err) {
      const categoryList = document.getElementById("category-list");
      if (categoryList) {
        categoryList.innerHTML = '<div class="error-note">\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0434\u0430\u043d\u043d\u044b\u0435: ' + escapeHtml(err.message) + '</div>';
      }
      const slotGrid = document.getElementById("slot-grid");
      if (slotGrid) {
        slotGrid.innerHTML = "";
      }
      const sphereGrid = document.getElementById("sphere-slot-grid");
      if (sphereGrid) {
        sphereGrid.innerHTML = "";
      }
      const trophyGrid = document.getElementById("trophy-slot-grid");
      if (trophyGrid) {
        trophyGrid.innerHTML = "";
      }
      const petStage = document.getElementById("pet-stage");
      if (petStage) {
        petStage.innerHTML = "";
      }
      refs.setLastAction("\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u043d\u0435 \u0443\u0434\u0430\u043b\u0430\u0441\u044c.");
    }
  }

  return {
    shared,
    bindPageTransitions() {
      return bindPageTransitionsImpl(uiStateRepository);
    },
    init,
  };
}
