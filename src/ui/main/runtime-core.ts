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

export function createAppRuntime(context) {
  const { catalogRepository, profileRepository, uiStateRepository } = context;

  let catalogModule;
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
    setLastAction: (...args) => refs.setLastAction(...args),
    markBuildDirty: (...args) => refs.markBuildDirty(...args),
    getSlotConfig: (...args) => catalogModule.getSlotConfig(...args),
    getSphereSlotConfig: (...args) => catalogModule.getSphereSlotConfig(...args),
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

  catalogModule = createCatalogModule({ state: stateModule.state });

  const profilesModule = createProfilesModule({
    state: stateModule.state,
    loadProfilesState: stateModule.loadProfilesState,
    loadActiveProfileIdState: stateModule.loadActiveProfileIdState,
    saveProfilesState: stateModule.saveProfilesState,
    saveActiveProfileIdState: stateModule.saveActiveProfileIdState,
    persistLegacyStateSnapshot: stateModule.persistLegacyStateSnapshot,
    getSlotConfig: catalogModule.getSlotConfig,
    getValidUpgradeLevel: catalogModule.getValidUpgradeLevel,
    matchesEquipmentSlot: catalogModule.matchesEquipmentSlot,
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
    shouldShowSphereUpgrade: catalogModule.shouldShowSphereUpgrade,
    getLevelKeys: catalogModule.getLevelKeys,
    CLASS_CONFIGS,
    sanitizeClassLevel,
  });
  refs.setLastAction = renderModule.setLastAction;
  refs.renderProfileBar = renderModule.renderProfileBar;
  refs.showBuildToast = renderModule.showBuildToast;

  const workspaceModule = createMainWorkspaceModule({
    state: stateModule.state,
    renderAll: (...args) => refs.renderAll(...args),
    setLastAction: (...args) => refs.setLastAction(...args),
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
      renderModule.bindClassControls();
    } catch (err) {
      const categoryList = document.getElementById("category-list");
      if (categoryList) {
        categoryList.innerHTML = '<div class="error-note">?????? ???????? ??????: ' + escapeHtml(err.message) + '</div>';
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
      refs.setLastAction("??????? ?? ??????????.");
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
