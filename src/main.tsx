import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

type InstallWindow = Window & {
  __deferredInstallPrompt?: Event;
  __installPromptInitialized?: boolean;
};

// Register SW WITHOUT auto-reloading the page when a new version is found.
// The new SW will activate next time the user opens the app, avoiding
// disruptive automatic refreshes during use.
registerSW({ immediate: true, onNeedRefresh() {}, onOfflineReady() {} });

const installWindow = window as InstallWindow;
if (!installWindow.__installPromptInitialized) {
  installWindow.__installPromptInitialized = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installWindow.__deferredInstallPrompt = event;
    window.dispatchEvent(new CustomEvent("lovable-install-prompt-ready"));
  });

  window.addEventListener("appinstalled", () => {
    delete installWindow.__deferredInstallPrompt;
    window.dispatchEvent(new CustomEvent("lovable-app-installed"));
  });
}

try {
  const savedDarkMode = window.localStorage.getItem("pilates_darkmode");
  const isDark = savedDarkMode ? JSON.parse(savedDarkMode) : false;
  document.documentElement.classList.toggle("dark", Boolean(isDark));
} catch {
  document.documentElement.classList.remove("dark");
}

createRoot(document.getElementById("root")!).render(<App />);
