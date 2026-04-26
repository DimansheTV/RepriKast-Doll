import { createAppRuntime } from "./app-runtime";

export function createMainPageApp(context) {
  const runtime = createAppRuntime(context);

  return {
    runtime,
    mount() {
      runtime.bindPageTransitions();
      return runtime.init();
    },
  };
}
