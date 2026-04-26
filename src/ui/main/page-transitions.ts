// @ts-nocheck

export const NAV_TRANSITION_DURATION_MS = 420;

export function finalizeEntryTransition(uiStateRepository) {
  const transition = document.documentElement.dataset.navTransition || "";
  if (!transition.startsWith("enter-")) {
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      delete document.documentElement.dataset.navTransition;
      uiStateRepository.clearNavTransition();
    });
  });
}

export function bindPageTransitions(uiStateRepository) {
  finalizeEntryTransition(uiStateRepository);

  if (document.body?.dataset?.navBound === "1") {
    return;
  }

  document.body.dataset.navBound = "1";
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-nav-direction]");
    if (!link) {
      return;
    }

    const href = link.getAttribute("href");
    const direction = link.dataset.navDirection;
    if (!href || !direction || !["forward", "back"].includes(direction)) {
      return;
    }

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target === "_blank"
    ) {
      return;
    }

    event.preventDefault();

    uiStateRepository.saveNavTransition(JSON.stringify({
      phase: "enter",
      direction,
    }));

    document.body.classList.remove("page-transition-exit-forward", "page-transition-exit-back");
    document.body.classList.add(`page-transition-exit-${direction}`);

    window.setTimeout(() => {
      window.location.href = href;
    }, NAV_TRANSITION_DURATION_MS);
  });
}
