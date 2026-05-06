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
    setLanguage,
    getCurrentLanguage,
    renderComparePage,
  } = deps;
  const LANGUAGE_SEQUENCE = ["ru", "en"];

  function getNextLanguage(language) {
    const index = LANGUAGE_SEQUENCE.indexOf(language);
    if (index === -1) {
      return LANGUAGE_SEQUENCE[0];
    }

    return LANGUAGE_SEQUENCE[(index + 1) % LANGUAGE_SEQUENCE.length];
  }

  const COMPARE_TOOLTIP_HOST_ID = "compare-floating-tooltip";
  let activeTooltipAnchor = null;
  let activeTooltipSource = null;

  function ensureCompareTooltipHost() {
    let host = document.getElementById(COMPARE_TOOLTIP_HOST_ID);
    if (host) {
      return host;
    }

    host = document.createElement("div");
    host.id = COMPARE_TOOLTIP_HOST_ID;
    host.className = "equipment-description compare-floating-tooltip";
    host.hidden = true;
    host.setAttribute("aria-hidden", "true");
    document.body.appendChild(host);
    return host;
  }

  function getTooltipData(target, container) {
    if (!(target instanceof Element)) {
      return null;
    }

    const anchor = target.closest(".slot-cell, .sphere-slot-cell, .trophy-slot-cell, .compare-passive-slot-cell");
    if (!(anchor instanceof HTMLElement) || !container.contains(anchor)) {
      return null;
    }

    const source = anchor.querySelector(".equipment-description");
    if (!(source instanceof HTMLElement)) {
      return null;
    }

    return { anchor, source };
  }

  function positionCompareTooltip(host, anchor) {
    const gap = 14;
    const viewportPadding = 12;
    const anchorRect = anchor.getBoundingClientRect();

    host.style.left = "0px";
    host.style.top = "0px";

    const hostRect = host.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = anchorRect.right + gap;
    if (left + hostRect.width > viewportWidth - viewportPadding) {
      left = anchorRect.left - gap - hostRect.width;
    }
    if (left < viewportPadding) {
      left = Math.min(
        Math.max(viewportPadding, anchorRect.left),
        viewportWidth - hostRect.width - viewportPadding,
      );
    }

    let top = anchorRect.top + ((anchorRect.height - hostRect.height) / 2);
    if (top + hostRect.height > viewportHeight - viewportPadding) {
      top = viewportHeight - hostRect.height - viewportPadding;
    }
    if (top < viewportPadding) {
      top = viewportPadding;
    }

    host.style.left = `${Math.round(left)}px`;
    host.style.top = `${Math.round(top)}px`;
  }

  function showCompareTooltip(anchor, source) {
    const host = ensureCompareTooltipHost();
    host.innerHTML = source.innerHTML;
    host.hidden = false;
    activeTooltipAnchor = anchor;
    activeTooltipSource = source;
    positionCompareTooltip(host, anchor);
  }

  function hideCompareTooltip() {
    const host = document.getElementById(COMPARE_TOOLTIP_HOST_ID);
    if (host) {
      host.hidden = true;
      host.innerHTML = "";
    }
    activeTooltipAnchor = null;
    activeTooltipSource = null;
  }

  function syncCompareTooltip(container, target) {
    const tooltipData = getTooltipData(target, container);
    if (!tooltipData) {
      hideCompareTooltip();
      return;
    }

    if (activeTooltipSource === tooltipData.source) {
      positionCompareTooltip(ensureCompareTooltipHost(), tooltipData.anchor);
      return;
    }

    showCompareTooltip(tooltipData.anchor, tooltipData.source);
  }

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
    container.addEventListener("mouseover", (event) => syncCompareTooltip(container, event.target));
    container.addEventListener("focusin", (event) => syncCompareTooltip(container, event.target));
    container.addEventListener("mouseout", (event) => {
      const tooltipData = getTooltipData(event.target, container);
      if (!tooltipData) {
        return;
      }

      const relatedTarget = event.relatedTarget;
      if (relatedTarget instanceof Element && tooltipData.anchor.contains(relatedTarget)) {
        return;
      }

      hideCompareTooltip();
    });
    container.addEventListener("focusout", (event) => {
      const tooltipData = getTooltipData(event.target, container);
      if (!tooltipData) {
        return;
      }

      const relatedTarget = event.relatedTarget;
      if (relatedTarget instanceof Element && tooltipData.anchor.contains(relatedTarget)) {
        return;
      }

      hideCompareTooltip();
    });
    container.addEventListener("scroll", hideCompareTooltip, true);
  }

  function bindTopbar() {
    const primarySelect = document.getElementById("compare-primary-select");
    const secondarySelect = document.getElementById("compare-secondary-select");
    const languageSwitch = document.getElementById("compare-language-switch");

    if (primarySelect && primarySelect.dataset.bound !== "1") {
      primarySelect.dataset.bound = "1";
      primarySelect.addEventListener("change", () => setPrimaryProfile(primarySelect.value));
    }

    if (secondarySelect && secondarySelect.dataset.bound !== "1") {
      secondarySelect.dataset.bound = "1";
      secondarySelect.addEventListener("change", () => setSecondaryProfile(secondarySelect.value));
    }

    if (languageSwitch && languageSwitch.dataset.bound !== "1") {
      languageSwitch.dataset.bound = "1";
      languageSwitch.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
          return;
        }

        const button = target.closest("#compare-language-cycle-button");
        if (!button) {
          return;
        }

        setLanguage(button.getAttribute("data-language") || getNextLanguage(getCurrentLanguage() || "ru"));
        renderComparePage();
      });
    }
  }

  function bindMobileNav() {
    const body = document.body;
    const toggle = document.getElementById("mobile-nav-toggle");
    const drawer = document.getElementById("mobile-nav-drawer");
    const backdrop = document.getElementById("mobile-nav-backdrop");

    if (!body || !toggle || !backdrop || toggle.dataset.bound === "1") {
      return;
    }

    toggle.dataset.bound = "1";

    const syncMobileNavState = (isOpen) => {
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      drawer?.setAttribute("aria-hidden", isOpen ? "false" : "true");
      backdrop.hidden = !isOpen;
      body.classList.toggle("mobile-nav-open", isOpen);
    };

    const closeMobileNav = () => syncMobileNavState(false);

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      syncMobileNavState(!isOpen);
    });

    backdrop.addEventListener("click", closeMobileNav);

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        closeMobileNav();
      }
    });

    window.addEventListener("resize", () => {
      hideCompareTooltip();
      if (window.innerWidth > 899) {
        closeMobileNav();
      }
    });

    syncMobileNavState(false);
  }

  return {
    bindEditor,
    bindMobileNav,
    bindTopbar,
  };
}
