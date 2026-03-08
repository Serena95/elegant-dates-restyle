import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

registerSW({ immediate: true });

try {
  const savedDarkMode = window.localStorage.getItem("pilates_darkmode");
  const isDark = savedDarkMode ? JSON.parse(savedDarkMode) : false;
  document.documentElement.classList.toggle("dark", Boolean(isDark));
} catch {
  document.documentElement.classList.remove("dark");
}

createRoot(document.getElementById("root")!).render(<App />);
