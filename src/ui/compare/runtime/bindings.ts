// @ts-nocheck
export function createCompareBindingsModule(deps) {
  const {
    setWorkspaceTab,
    handleCompareListAction,
    stepUpgradeLevel,
    setUpgradeLevel,
    setClassKey,
    stepClassLevel,
    setClassLevel,
    updatePetMergeCount,
    activateSlotPin,
    setPrimaryProfile,
    setSecondaryProfile,
  } = deps;

  function handleEditorClick(editorKey, event) {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const workspaceTabButton = target.closest("[data-compare-workspace-tab]");
    if (workspaceTabButton) {
      setWorkspaceTab(editorKey, workspaceTabButton.dataset.compareWorkspaceTab);
      return;
    }

    const listActionButton = target.closest("[data-compare-list-action]");
    if (listActionButton) {
      handleCompareListAction(editorKey, listActionButton);
      return;
    }

    const upgradeButton = target.closest("[data-compare-upgrade-type][data-upgrade-delta]");
    if (upgradeButton) {
      stepUpgradeLevel(
        editorKey,
        upgradeButton.dataset.compareUpgradeType,
        upgradeButton.dataset.slotKey,
        Number(upgradeButton.dataset.upgradeDelta || 0),
      );
      return;
    }

    const levelButton = target.closest("[data-compare-level-delta]");
    if (levelButton) {
      stepClassLevel(
        editorKey,
        Number(levelButton.dataset.compareLevelDelta || 0),
        target.closest(".class-level-stepper")?.querySelector("[data-compare-level-input]"),
      );
      return;
    }

    const petMergeButton = target.closest("[data-compare-pet-merge-key]");
    if (petMergeButton) {
      updatePetMergeCount(
        editorKey,
        petMergeButton.dataset.comparePetMergeKey,
        Number(petMergeButton.dataset.comparePetMergeDelta || 0),
      );
      return;
    }

    const slotButton = target.closest("[data-compare-slot-pin]");
    if (slotButton) {
      activateSlotPin(editorKey, slotButton.dataset.compareSlotType, slotButton.dataset.slotKey);
    }
  }

  function handleEditorChange(editorKey, event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.matches("[data-compare-class-select]")) {
      setClassKey(editorKey, target.value);
      return;
    }

    if (target.matches("select[data-compare-upgrade-type]")) {
      setUpgradeLevel(editorKey, target.dataset.compareUpgradeType, target.dataset.slotKey, target.value);
      return;
    }

    if (target.matches("[data-compare-level-input]")) {
      setClassLevel(editorKey, target.value, target);
    }
  }

  function handleEditorKeydown(editorKey, event) {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches("[data-compare-level-input]")) {
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      stepClassLevel(editorKey, event.key === "ArrowUp" ? 1 : -1, target);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      setClassLevel(editorKey, target.value, target);
    }
  }

  function bindEditor(editorKey, containerId) {
    const container = document.getElementById(containerId);
    if (!container || container.dataset.bound === "1") {
      return;
    }

    container.dataset.bound = "1";
    container.addEventListener("click", (event) => handleEditorClick(editorKey, event));
    container.addEventListener("change", (event) => handleEditorChange(editorKey, event));
    container.addEventListener("keydown", (event) => handleEditorKeydown(editorKey, event));
  }

  function bindTopbar() {
    const primarySelect = document.getElementById("compare-primary-select");
    const secondarySelect = document.getElementById("compare-secondary-select");

    if (primarySelect && primarySelect.dataset.bound !== "1") {
      primarySelect.dataset.bound = "1";
      primarySelect.addEventListener("change", () => setPrimaryProfile(primarySelect.value));
    }

    if (secondarySelect && secondarySelect.dataset.bound !== "1") {
      secondarySelect.dataset.bound = "1";
      secondarySelect.addEventListener("change", () => setSecondaryProfile(secondarySelect.value));
    }
  }

  return {
    bindEditor,
    bindTopbar,
  };
}
