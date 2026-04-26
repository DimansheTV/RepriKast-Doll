import { createAppContext } from "./application/app-context";
import { createAppRuntime } from "./ui/main/runtime-core";
import { createComparePageApp } from "./ui/compare/page-app";

const context = createAppContext();
const runtime = createAppRuntime(context);
const app = createComparePageApp({
  app: runtime.shared,
  ready: runtime.init(),
  uiStateRepository: context.uiStateRepository,
});

runtime.bindPageTransitions();
app.mount();
