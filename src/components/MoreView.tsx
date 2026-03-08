import { useState, useEffect } from "react";
import { BookOpen, UserCircle, Settings, Download, ChevronRight } from "lucide-react";

interface MoreViewProps {
  onNavigate: (view: string) => void;
}

export function MoreView({ onNavigate }: MoreViewProps) {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const isStandalone = typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone);

  useEffect(() => {
    const iosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iosDevice && !isStandalone);
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallApp = async () => {
    if (isIOS) { setShowIOSGuide(true); return; }
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  };

  const items = [
    { icon: BookOpen, label: "Libreria Esercizi", desc: "Scopri tutti gli esercizi disponibili", view: "library" },
    { icon: Settings, label: "Impostazioni", desc: "Preferenze, account e supporto", view: "settings" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Altro</h2>

      <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className="w-full flex items-center gap-4 p-4 text-left transition hover:bg-muted/50"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          );
        })}
      </div>

      {!isStandalone && (installPrompt || isIOS) && (
        <button
          onClick={handleInstallApp}
          className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border transition hover:bg-muted/50"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Download size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-foreground">Installa App</p>
            <p className="text-xs text-muted-foreground">Aggiungi alla schermata Home</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 bg-foreground/40 flex items-end justify-center z-50 p-4" onClick={() => setShowIOSGuide(false)}>
          <div className="bg-card rounded-3xl border border-border shadow-2xl p-6 max-w-sm w-full space-y-3 mb-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-foreground text-center">📱 Installa su iPhone/iPad</h3>
            <ol className="text-sm text-muted-foreground space-y-2">
              <li>1. Tocca il pulsante <strong>Condividi</strong> ⬆️ in basso</li>
              <li>2. Scorri e seleziona <strong>"Aggiungi a Home"</strong></li>
              <li>3. Tocca <strong>"Aggiungi"</strong> in alto a destra</li>
            </ol>
            <button onClick={() => setShowIOSGuide(false)} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">
              Ho capito!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
