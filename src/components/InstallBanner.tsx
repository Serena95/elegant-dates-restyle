import React, { useState, useEffect } from "react";
import { Download, X, Share, MoreVertical, Plus, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const InstallBanner = React.forwardRef<HTMLDivElement, {}>(function InstallBanner(_props, ref) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");

  const isStandalone = typeof window !== "undefined" && 
    (window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone);

  useEffect(() => {
    type InstallWindow = Window & { __deferredInstallPrompt?: Event };
    const installWindow = window as InstallWindow;

    // Check if already dismissed this session
    try {
      if (sessionStorage.getItem("install_banner_dismissed")) {
        setDismissed(true);
      }
    } catch {}

    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
      setPlatform("ios");
    } else if (/Android/.test(ua)) {
      setPlatform("android");
    }

    if (installWindow.__deferredInstallPrompt) {
      setDeferredPrompt(installWindow.__deferredInstallPrompt as BeforeInstallPromptEvent);
    }

    const onPromptReady = () => {
      if (installWindow.__deferredInstallPrompt) {
        setDeferredPrompt(installWindow.__deferredInstallPrompt as BeforeInstallPromptEvent);
      }
    };

    const onInstalled = () => setDismissed(true);

    window.addEventListener("lovable-install-prompt-ready", onPromptReady);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("lovable-app-installed", onInstalled);

    return () => {
      window.removeEventListener("lovable-install-prompt-ready", onPromptReady);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("lovable-app-installed", onInstalled);
    };
  }, []);

  if (dismissed || isStandalone) return null;

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setDeferredPrompt(null);
      setDismissed(true);
    } else {
      setShowGuide(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem("install_banner_dismissed", "1"); } catch {}
  };

  return (
    <>
      {/* Sliding banner */}
      <AnimatePresence>
        {!showGuide && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300, delay: 1.5 }}
            className="fixed bottom-20 left-3 right-3 z-50"
          >
            <div className="bg-card border border-primary/20 rounded-2xl shadow-lg p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Download size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight">Installa l'app</p>
                <p className="text-[11px] text-muted-foreground">Accesso rapido dalla home</p>
              </div>
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold flex-shrink-0 active:scale-95 transition-transform"
              >
                Installa
              </button>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground p-1 flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guide modal */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4"
            onClick={() => setShowGuide(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-card rounded-2xl border border-border shadow-2xl p-5 max-w-sm w-full space-y-4 mb-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-muted rounded-full mx-auto" />
              
              <h3 className="font-bold text-foreground text-center text-base">
                📱 Installa My Pilates Plan
              </h3>

              {platform === "ios" ? (
                <ol className="text-sm text-foreground space-y-3">
                  <li className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">1</span>
                    <span>Tocca <strong>Condividi</strong> <Share size={14} className="inline text-primary" /> in basso</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">2</span>
                    <span>Seleziona <strong>"Aggiungi alla schermata Home"</strong> <Plus size={14} className="inline text-primary" /></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">3</span>
                    <span>Tocca <strong>"Aggiungi"</strong></span>
                  </li>
                </ol>
              ) : platform === "android" ? (
                <ol className="text-sm text-foreground space-y-3">
                  <li className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">1</span>
                    <span>Tocca il menu <MoreVertical size={14} className="inline text-primary" /> in alto a destra</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">2</span>
                    <span>Seleziona <strong>"Installa app"</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">3</span>
                    <span>Conferma toccando <strong>"Installa"</strong></span>
                  </li>
                </ol>
              ) : (
                <ol className="text-sm text-foreground space-y-3">
                  <li className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">1</span>
                    <span>Apri in <strong>Chrome</strong> o <strong>Edge</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">2</span>
                    <span>Clicca l'icona <strong>Installa</strong> nella barra URL</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">3</span>
                    <span>Conferma <strong>"Installa"</strong></span>
                  </li>
                </ol>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setShowGuide(false)}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm active:scale-95 transition-transform"
                >
                  Ho capito!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
