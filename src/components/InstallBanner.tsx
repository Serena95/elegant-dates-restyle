import React, { useState, useEffect } from "react";
import { Download, X, Share, MoreVertical, Plus } from "lucide-react";

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
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
      setPlatform("ios");
    } else if (/Android/.test(ua)) {
      setPlatform("android");
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setDismissed(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
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

  if (showGuide) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4" onClick={() => setShowGuide(false)}>
        <div className="bg-card rounded-2xl border border-border shadow-2xl p-5 max-w-sm w-full space-y-4 mb-4" onClick={e => e.stopPropagation()}>
          <h3 className="font-bold text-foreground text-center text-base">
            📱 Installa My Pilates Plan
          </h3>
          
          <p className="text-xs text-muted-foreground text-center">
            L'installazione diretta non è disponibile qui. Segui questi passaggi:
          </p>

          {platform === "ios" ? (
            <ol className="text-sm text-foreground space-y-3">
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">1</span>
                <span>Tocca <strong>Condividi</strong> <Share size={14} className="inline text-primary" /> in basso su Safari</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">2</span>
                <span>Seleziona <strong>"Aggiungi alla schermata Home"</strong> <Plus size={14} className="inline text-primary" /></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">3</span>
                <span>Tocca <strong>"Aggiungi"</strong> in alto a destra</span>
              </li>
            </ol>
          ) : platform === "android" ? (
            <ol className="text-sm text-foreground space-y-3">
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">1</span>
                <span>Tocca il menu <MoreVertical size={14} className="inline text-primary" /> in alto a destra</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">2</span>
                <span>Seleziona <strong>"Installa app"</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">3</span>
                <span>Conferma toccando <strong>"Installa"</strong></span>
              </li>
            </ol>
          ) : (
            <ol className="text-sm text-foreground space-y-3">
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">1</span>
                <span>Apri l'app in <strong>Chrome</strong> o <strong>Edge</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">2</span>
                <span>Clicca l'icona <strong>installa</strong> nella barra URL</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">3</span>
                <span>Conferma cliccando <strong>"Installa"</strong></span>
              </li>
            </ol>
          )}

          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-[11px] text-muted-foreground text-center">
              ⚠️ Se stai usando l'anteprima, apri prima l'app pubblicata nel browser:
            </p>
            <p className="text-[11px] text-primary font-mono text-center mt-1 break-all select-all">
              elegant-dates-restyle.lovable.app
            </p>
          </div>

          <button onClick={() => setShowGuide(false)} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm">
            Ho capito!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-card border border-primary/20 rounded-2xl shadow-xl p-4 flex items-center gap-3 animate-in slide-in-from-bottom-4">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Download size={20} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground">Installa My Pilates Plan</p>
        <p className="text-xs text-muted-foreground">Accesso rapido dalla home</p>
      </div>
      <button onClick={handleInstall} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold flex-shrink-0">
        Installa
      </button>
      <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground p-1 flex-shrink-0">
        <X size={16} />
      </button>
    </div>
  );
});
