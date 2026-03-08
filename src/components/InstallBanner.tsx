import React, { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const InstallBanner = React.forwardRef<HTMLDivElement, {}>(function InstallBanner(_props, ref) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
    setIsIOS(isIOSDevice && !isStandalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const isStandalone = typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone);

  if (dismissed || isStandalone) return null;

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) {
      setShowIOSGuide(true);
      return;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
    setDismissed(true);
  };

  if (showIOSGuide) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4" onClick={() => setShowIOSGuide(false)}>
        <div className="bg-card rounded-2xl border border-border shadow-2xl p-6 max-w-sm w-full space-y-3 mb-4" onClick={e => e.stopPropagation()}>
          <h3 className="font-bold text-foreground text-center">
            {isIOS ? "📱 Installa su iPhone/iPad" : "📱 Installa l'app dal browser"}
          </h3>
          <ol className="text-sm text-muted-foreground space-y-2">
            {isIOS ? (
              <>
                <li>1. Tocca il pulsante <strong>Condividi</strong> ⬆️ in basso</li>
                <li>2. Scorri e seleziona <strong>"Aggiungi a Home"</strong></li>
                <li>3. Tocca <strong>"Aggiungi"</strong> in alto a destra</li>
              </>
            ) : (
              <>
                <li>1. Apri il menu del browser (⋮ o ⋯)</li>
                <li>2. Tocca <strong>"Installa app"</strong> o <strong>"Aggiungi a schermata Home"</strong></li>
                <li>3. Conferma l'installazione</li>
              </>
            )}
          </ol>
          <button onClick={() => setShowIOSGuide(false)} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">
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
}
