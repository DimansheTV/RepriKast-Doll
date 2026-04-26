export function createEditorState(app) {
  return {
    activeWorkspaceTab: "inventory",
    activeSlot: null,
    activeSphereSlot: app.SPHERE_SLOT_CONFIG[0]?.key || null,
    activeSphereTypeOneTab: app.SPHERE_TYPE_ONE_TABS[0]?.category || "Сферы разрушения",
    activeTrophySlot: app.TROPHY_SLOT_CONFIG[0]?.key || null,
  };
}

export function createCompareState(app, uiStateRepository) {
  return {
    secondaryProfileId: app.normalizeText(uiStateRepository.loadCompareSecondaryProfileId() || ""),
    pendingLevelFocus: null,
    editors: {
      primary: createEditorState(app),
      secondary: createEditorState(app),
    },
  };
}
