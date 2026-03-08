import { ChevronLeft, Smartphone, Terminal, Download, Rocket, Apple, MonitorSmartphone, RefreshCw, Globe } from "lucide-react";
import { motion } from "framer-motion";

interface NativeBuildGuideProps {
  onBack: () => void;
}

const STEPS = [
  {
    num: 1,
    icon: Download,
    title: "Esporta su GitHub",
    desc: "Da Lovable, vai su Settings → GitHub e collega il tuo repository. Clicca 'Export to GitHub'.",
    code: null,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    num: 2,
    icon: Terminal,
    title: "Clona e installa dipendenze",
    desc: "Apri il terminale sul tuo PC e lancia questi comandi:",
    code: `git clone https://github.com/TUO-USER/TUO-REPO.git
cd TUO-REPO
npm install`,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    num: 3,
    icon: Smartphone,
    title: "Aggiungi piattaforme native",
    desc: "Scegli iOS, Android o entrambi:",
    code: `npx cap add ios        # Solo su Mac con Xcode
npx cap add android    # Richiede Android Studio`,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    num: 4,
    icon: Rocket,
    title: "Build e sincronizza",
    desc: "Compila il progetto e sincronizza con le piattaforme native:",
    code: `npm run build
npx cap sync`,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    num: 5,
    icon: MonitorSmartphone,
    title: "Lancia l'app",
    desc: "Avvia l'app su emulatore o dispositivo fisico:",
    code: `npx cap run ios        # iPhone / Simulatore
npx cap run android    # Android / Emulatore`,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
];

const REQUISITI = [
  { platform: "iOS", icon: "🍎", items: ["Mac con macOS", "Xcode (gratuito da App Store)", "Account Apple Developer ($99/anno per pubblicare)"] },
  { platform: "Android", icon: "🤖", items: ["Windows, Mac o Linux", "Android Studio (gratuito)", "Account Google Play ($25 una tantum)"] },
];

const TIPS = [
  {
    icon: RefreshCw,
    title: "Aggiornare dopo modifiche su Lovable",
    desc: "Ogni volta che modifichi l'app su Lovable:",
    code: `git pull
npm install
npx cap sync`,
  },
  {
    icon: Globe,
    title: "Hot Reload (sviluppo)",
    desc: "Durante lo sviluppo, l'app carica direttamente la preview di Lovable. Vedi i cambiamenti in tempo reale senza rebuild!",
    code: null,
  },
  {
    icon: Apple,
    title: "Pubblicare sugli store",
    desc: "Quando sei pronto per pubblicare, rimuovi server.url da capacitor.config.ts per usare il build locale, poi segui le guide di Apple/Google per la submission.",
    code: null,
  },
  {
    icon: Smartphone,
    title: "Plugin Health (Google Fit / Apple Health)",
    desc: "Dopo aver aggiunto le piattaforme, installa i plugin nativi nel progetto:",
    code: `# Android: assicurati che Health Connect sia installato sul device
# iOS: aggiungi nel Info.plist:
# NSHealthShareUsageDescription
# NSHealthUpdateUsageDescription`,
  },
];

export function NativeBuildGuide({ onBack }: NativeBuildGuideProps) {
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-primary">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Smartphone size={22} className="text-primary" /> App Nativa
          </h2>
          <p className="text-xs text-muted-foreground">Guida passo-passo per iOS & Android</p>
        </div>
      </div>

      {/* Intro */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 via-primary/5 to-violet-500/10 rounded-2xl border border-primary/15 p-4"
      >
        <p className="text-sm text-foreground leading-relaxed">
          La tua app è già pronta per diventare nativa! Con <strong>Capacitor</strong>, 
          il codice è lo stesso — basta compilarlo per iOS e Android. Segui questi 5 passaggi.
        </p>
      </motion.div>

      {/* Steps */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">📋 Passaggi</h3>
        {STEPS.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-2xl border border-border p-4 space-y-2"
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${step.bg} flex items-center justify-center flex-shrink-0`}>
                <step.icon size={18} className={step.color} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">Passo {step.num}</p>
                <p className="text-sm font-bold text-foreground">{step.title}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            {step.code && (
              <pre className="bg-muted/70 rounded-xl p-3 text-[11px] font-mono text-foreground overflow-x-auto whitespace-pre-wrap">
                {step.code}
              </pre>
            )}
          </motion.div>
        ))}
      </div>

      {/* Requisiti */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">🛠️ Requisiti</h3>
        <div className="grid grid-cols-1 gap-3">
          {REQUISITI.map((req) => (
            <div key={req.platform} className="bg-card rounded-2xl border border-border p-4">
              <p className="text-sm font-bold text-foreground mb-2">{req.icon} {req.platform}</p>
              <ul className="space-y-1">
                {req.items.map((item, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">💡 Consigli utili</h3>
        {TIPS.map((tip, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.06 }}
            className="bg-card rounded-2xl border border-border p-4 space-y-2"
          >
            <div className="flex items-center gap-2">
              <tip.icon size={16} className="text-primary" />
              <p className="text-sm font-bold text-foreground">{tip.title}</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
            {tip.code && (
              <pre className="bg-muted/70 rounded-xl p-3 text-[11px] font-mono text-foreground overflow-x-auto whitespace-pre-wrap">
                {tip.code}
              </pre>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
