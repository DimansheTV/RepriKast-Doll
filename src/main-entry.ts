import { createAppContext } from "./application/app-context";
import { installIosViewportGuard } from "./shared/ios-viewport-guard";
import { createMainPageApp } from "./ui/main/page-app";

installIosViewportGuard();

const context = createAppContext();
const app = createMainPageApp(context);

app.mount();
