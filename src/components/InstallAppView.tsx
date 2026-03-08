import { useState, useEffect } from "react";
import { Download, Share, MoreVertical, Plus, Smartphone, Monitor, CheckCircle2, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAppView() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");

  const isStandalone = typeof window !== "undefined" && 
    (window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone);

  useEffect(() => {
    type InstallWindow = Window & { __deferredInstallPrompt?: Event };
    const installWindow = window as InstallWindow;

    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
      setPlatform("ios");
    } else if (/Android/.test(ua)) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }

    if (installWindow.__deferredInstallPrompt) {
      setDeferredPrompt(installWindow.__deferredInstallPrompt as BeforeInstallPromptEvent);
    }

    const onPromptReady = () => {
      if (installWindow.__deferredInstallPrompt) {
        setDeferredPrompt(installWindow.__deferredInstallPrompt as BeforeInstallPromptEvent);
      }
    };

    const onInstalled = () => setInstalled(true);

    window.addEventListener("lovable-install-prompt-ready", onPromptReady);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("lovable-app-installed", onInstalled);

    return () => {
      window.removeEventListener("lovable-install-prompt-ready", onPromptReady);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("lovable-app-installed", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (isStandalone || installed) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle2 size={40} className="text-emerald-500" />
          </motion.div>
          <h2 className="text-xl font-bold text-foreground">App Installata! 🎉</h2>
          <p className="text-muted-foreground mt-2">
            My Pilates Plan è già installata sul tuo dispositivo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
          <Download size={36} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Installa My Pilates Plan</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Accedi rapidamente dalla home del tuo dispositivo
        </p>
      </div>

      {/* Native install button (Chrome/Edge/Samsung) */}
      {deferredPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            onClick={handleInstall}
            className="w-full h-14 text-base font-bold rounded-2xl gap-3"
            size="lg"
          >
            <Download size={22} />
            Installa Ora
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Tocca il pulsante per aggiungere l'app alla schermata Home
          </p>
        </motion.div>
      )}

      {/* Benefits */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Smartphone, label: "Come un'app nativa", desc: "Dalla home screen" },
          { icon: "⚡", label: "Caricamento rapido", desc: "Funziona anche offline" },
          { icon: "🔔", label: "Notifiche push", desc: "Promemoria allenamenti" },
          { icon: "💾", label: "Zero spazio", desc: "Non occupa memoria" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-3 rounded-2xl bg-card border border-border text-center"
          >
            <div className="text-2xl mb-1">
              {typeof item.icon === "string" ? item.icon : <item.icon size={24} className="text-primary mx-auto" />}
            </div>
            <p className="text-xs font-bold text-foreground">{item.label}</p>
            <p className="text-[10px] text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Manual instructions based on platform */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-foreground text-center">
          {deferredPrompt ? "Oppure installa manualmente:" : "📱 Come installare:"}
        </h3>

        {/* Platform tabs */}
        <div className="flex gap-2">
          {(["ios", "android", "desktop"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                platform === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {p === "ios" ? "iPhone/iPad" : p === "android" ? "Android" : "Desktop"}
            </button>
          ))}
        </div>

        {/* iOS instructions */}
        {platform === "ios" && (
          <motion.ol
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Tocca il pulsante <strong>Condividi</strong>
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  L'icona <Share size={14} className="inline" /> nella barra in basso di Safari
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Seleziona <strong>"Aggiungi alla schermata Home"</strong>
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  Scorri il menu e cerca l'icona <Plus size={14} className="inline" />
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Tocca <strong>"Aggiungi"</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  In alto a destra per confermare
                </p>
              </div>
            </li>
          </motion.ol>
        )}

        {/* Android instructions */}
        {platform === "android" && (
          <motion.ol
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Tocca il menu del browser
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  L'icona <MoreVertical size={14} className="inline" /> in alto a destra
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Tocca <strong>"Installa app"</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Oppure "Aggiungi a schermata Home"
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Conferma l'installazione
                </p>
                <p className="text-xs text-muted-foreground">
                  Tocca "Installa" nel popup che compare
                </p>
              </div>
            </li>
          </motion.ol>
        )}

        {/* Desktop instructions */}
        {platform === "desktop" && (
          <motion.ol
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Apri in Chrome o Edge
                </p>
                <p className="text-xs text-muted-foreground">
                  Visita l'app dal browser desktop
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Clicca l'icona <strong>Installa</strong> nella barra URL
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  Oppure Menu → "Installa My Pilates Plan"
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Conferma cliccando <strong>"Installa"</strong>
                </p>
              </div>
            </li>
          </motion.ol>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground text-center">
        ⚠️ Se sei in un'anteprima o iframe, apri prima l'app nel browser completo.
      </p>
    </div>
  );
}
