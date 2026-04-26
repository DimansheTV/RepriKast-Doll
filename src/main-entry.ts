import { createAppContext } from "./application/app-context";
import { createMainPageApp } from "./ui/main-page-app";

const context = createAppContext();
const app = createMainPageApp(context);

app.mount();
