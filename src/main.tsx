import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

type InstallWindow = Window & {
  __deferredInstallPrompt?: Event;
  __installPromptInitialized?: boolean;
};

const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const hostname = window.location.hostname;
const isPreviewHost =
  hostname.includes("id-preview--") ||
  hostname.includes("lovableproject.com");

if ("serviceWorker" in navigator && (isInIframe || isPreviewHost)) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
} else {
  // Register SW but do NOT auto-reload the app while user is using it.
  // Updates will be applied on the next manual reload/app restart.
  registerSW({
    immediate: true,
    onNeedRefresh() {},
    onOfflineReady() {},
  });
}

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
