import { useState, useEffect } from "react";
import { BookOpen, Settings, Download, Droplets, Baby, ChevronRight, Sparkles, Crown, Trophy, Users } from "lucide-react";
import { motion } from "framer-motion";

interface MoreViewProps {
  onNavigate: (view: string) => void;
}

const FEATURES = [
  {
    icon: Crown,
    label: "Premium",
    desc: "Sblocca AI Coach avanzato e funzionalità premium",
    view: "premium",
    gradient: "from-amber-500/20 to-yellow-400/10",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-500",
    borderColor: "border-amber-500/20",
  },
  {
    icon: Droplets,
    label: "Monitoraggio Ciclo",
    desc: "Tieni traccia del ciclo, sintomi e previsioni",
    view: "cycle",
    gradient: "from-pink-500/20 to-rose-400/10",
    iconBg: "bg-pink-500/15",
    iconColor: "text-pink-500",
    borderColor: "border-pink-500/20",
  },
  {
    icon: Baby,
    label: "Modalità Gravidanza",
    desc: "Allenamenti sicuri settimana per settimana",
    view: "pregnancy",
    gradient: "from-violet-500/20 to-purple-400/10",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-500",
    borderColor: "border-violet-500/20",
  },
  {
    icon: BookOpen,
    label: "Libreria Esercizi",
    desc: "Esplora tutti gli esercizi per attrezzo",
    view: "library",
    gradient: "from-sky-500/20 to-blue-400/10",
    iconBg: "bg-sky-500/15",
    iconColor: "text-sky-500",
    borderColor: "border-sky-500/20",
  },
  {
    icon: Trophy,
    label: "Challenge Fitness",
    desc: "Sfide da 7, 14 e 30 giorni per metterti alla prova",
    view: "challenges",
    gradient: "from-orange-500/20 to-red-400/10",
    iconBg: "bg-orange-500/15",
    iconColor: "text-orange-500",
    borderColor: "border-orange-500/20",
  },
];

export function MoreView({ onNavigate }: MoreViewProps) {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const isStandalone = typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone);

  useEffect(() => {
    type InstallWindow = Window & { __deferredInstallPrompt?: Event };
    const installWindow = window as InstallWindow;
    const iosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iosDevice && !isStandalone);

    if (installWindow.__deferredInstallPrompt) {
      setInstallPrompt(installWindow.__deferredInstallPrompt);
    }

    const onPromptReady = () => {
      if (installWindow.__deferredInstallPrompt) {
        setInstallPrompt(installWindow.__deferredInstallPrompt);
      }
    };

    window.addEventListener("lovable-install-prompt-ready", onPromptReady);
    return () => window.removeEventListener("lovable-install-prompt-ready", onPromptReady);
  }, []);

  const handleInstallApp = async () => {
    if (isIOS) { setShowIOSGuide(true); return; }
    if (!installPrompt) { setShowIOSGuide(true); return; }
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Sparkles size={20} className="text-primary" /> Altro
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">Funzionalità e strumenti extra</p>
      </div>

      {/* Feature cards */}
      <div className="space-y-3">
        {FEATURES.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.view}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => onNavigate(item.view)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border ${item.borderColor} bg-gradient-to-r ${item.gradient} text-left transition-all active:scale-[0.98]`}
            >
              <div className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={24} className={item.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
            </motion.button>
          );
        })}
      </div>

      {/* Settings - more subtle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={() => onNavigate("settings")}
        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border text-left transition-all hover:bg-muted/50 active:scale-[0.98]"
      >
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0">
          <Settings size={22} className="text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">Impostazioni</p>
          <p className="text-xs text-muted-foreground mt-0.5">Account, preferenze e supporto</p>
        </div>
        <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
      </motion.button>

      {/* Install App */}
      {!isStandalone && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => onNavigate("install-app")}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20 text-left transition-all active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Download size={22} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">Installa App</p>
            <p className="text-xs text-muted-foreground mt-0.5">Aggiungi alla schermata Home</p>
          </div>
          <ChevronRight size={18} className="text-primary flex-shrink-0" />
        </motion.button>
      )}

      {/* iOS Install Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 bg-foreground/40 flex items-end justify-center z-50 p-4" onClick={() => setShowIOSGuide(false)}>
          <div className="bg-card rounded-3xl border border-border shadow-2xl p-6 max-w-sm w-full space-y-3 mb-4" onClick={e => e.stopPropagation()}>
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
      )}
    </div>
  );
}
