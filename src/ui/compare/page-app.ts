// @ts-nocheck
import { createCompareBindingsModule } from "./runtime/bindings";
import { createCompareInteractionsModule } from "./runtime/interactions";
import { createCompareRenderModule } from "./runtime/render";
import { createCompareStateModule } from "./runtime/state";
import { createCompareStatsModule } from "./runtime/stats";

export function createComparePageApp({ app, ready, uiStateRepository }) {
  const stateModule = createCompareStateModule({ app, uiStateRepository });

  const statsModule = createCompareStatsModule({
    app,
    getEquippedSlotsForProfile: stateModule.getEquippedSlotsForProfile,
    getEquippedSphereSlotsForProfile: stateModule.getEquippedSphereSlotsForProfile,
    getEquippedTrophySlotsForProfile: stateModule.getEquippedTrophySlotsForProfile,
  });

  const renderModule = createCompareRenderModule({
    app,
    compareState: stateModule.compareState,
    ensureEditorState: stateModule.ensureEditorState,
    ensureSecondaryProfileSelection: stateModule.ensureSecondaryProfileSelection,
    getPrimaryProfile: stateModule.getPrimaryProfile,
    getSecondaryProfile: stateModule.getSecondaryProfile,
    restorePendingLevelInputFocus: stateModule.restorePendingLevelInputFocus,
    buildComparisonRows: statsModule.buildComparisonRows,
    formatAbsoluteStat: statsModule.formatAbsoluteStat,
  });

  const interactionsModule = createCompareInteractionsModule({
    app,
    compareState: stateModule.compareState,
    getEditorProfileId: stateModule.getEditorProfileId,
    saveSecondaryProfileId: stateModule.saveSecondaryProfileId,
    getPrimaryProfile: stateModule.getPrimaryProfile,
    getSecondaryProfile: stateModule.getSecondaryProfile,
    ensureSecondaryProfileSelection: stateModule.ensureSecondaryProfileSelection,
    resetEditorState: stateModule.resetEditorState,
    queueLevelInputFocus: stateModule.queueLevelInputFocus,
    renderComparePage: renderModule.renderComparePage,
  });

  const bindingsModule = createCompareBindingsModule({
    setWorkspaceTab: interactionsModule.setWorkspaceTab,
    handleCompareListAction: interactionsModule.handleCompareListAction,
    stepUpgradeLevel: interactionsModule.stepUpgradeLevel,
    setUpgradeLevel: interactionsModule.setUpgradeLevel,
    setClassKey: interactionsModule.setClassKey,
    stepClassLevel: interactionsModule.stepClassLevel,
    setClassLevel: interactionsModule.setClassLevel,
    updatePetMergeCount: interactionsModule.updatePetMergeCount,
    activateSlotPin: interactionsModule.activateSlotPin,
    setPrimaryProfile: interactionsModule.setPrimaryProfile,
    setSecondaryProfile: interactionsModule.setSecondaryProfile,
  });

  return {
    mount() {
      return ready.then(() => {
        stateModule.ensureSecondaryProfileSelection();
        stateModule.resetEditorState("primary", stateModule.getPrimaryProfile(), true);
        stateModule.resetEditorState("secondary", stateModule.getSecondaryProfile(), true);
        bindingsModule.bindTopbar();
        bindingsModule.bindEditor("primary", "compare-primary-editor");
        bindingsModule.bindEditor("secondary", "compare-secondary-editor");
        renderModule.renderComparePage();
      });
    },
  };
}
