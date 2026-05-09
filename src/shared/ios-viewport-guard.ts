function isIosBrowser() {
  const platform = navigator.platform || "";
  return /iPad|iPhone|iPod/.test(platform) || (platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function installIosViewportGuard() {
  if (!isIosBrowser()) {
    return;
  }

  const preventPageGesture = (event: Event) => {
    event.preventDefault();
  };

  document.addEventListener("gesturestart", preventPageGesture, { passive: false });
  document.addEventListener("gesturechange", preventPageGesture, { passive: false });
  document.addEventListener("gestureend", preventPageGesture, { passive: false });
}
