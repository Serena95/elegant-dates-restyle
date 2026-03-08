import { useState } from "react";
import { Baby, Heart, AlertTriangle, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface PregnancyModeProps {
  isActive: boolean;
  settimanaGestazionale: number;
  onToggle: (active: boolean) => void;
  onUpdateWeek: (week: number) => void;
  onBack?: () => void;
}

const TRIMESTER_INFO = [
  {
    range: [1, 12],
    nome: "Primo Trimestre",
    icon: "🌱",
    consigli: [
      "Evita esercizi in posizione prona dopo le 8 settimane",
      "Mantieni l'intensità moderata",
      "Concentrati sulla respirazione diaframmatica",
      "Evita torsioni profonde del busto",
    ],
    esercizi_consigliati: ["Respirazione", "Kegel", "Mobilità bacino", "Cat-Cow leggero"],
    esercizi_evitare: ["Crunch classici", "Plank prolungati", "Esercizi ad alta intensità"],
  },
  {
    range: [13, 27],
    nome: "Secondo Trimestre",
    icon: "🌸",
    consigli: [
      "Non sdraiarti supina per periodi prolungati",
      "Usa supporti e cuscini per il comfort",
      "Lavora sulla stabilità del pavimento pelvico",
      "Mantieni una buona idratazione",
    ],
    esercizi_consigliati: ["Side-lying exercises", "Squat leggeri", "Stretching laterale", "Esercizi in quadrupedia"],
    esercizi_evitare: ["Esercizi supini prolungati", "Salti", "Addominali tradizionali"],
  },
  {
    range: [28, 40],
    nome: "Terzo Trimestre",
    icon: "🤱",
    consigli: [
      "Riduci l'intensità e ascolta il tuo corpo",
      "Concentrati su mobilità e respirazione",
      "Preparati al parto con esercizi del pavimento pelvico",
      "Evita movimenti bruschi e cambi di direzione rapidi",
    ],
    esercizi_consigliati: ["Respirazione per il parto", "Mobilità anche", "Stretching dolce", "Kegel avanzati"],
    esercizi_evitare: ["Esercizi ad impatto", "Posizioni instabili", "Sforzi intensi"],
  },
];

export function PregnancyMode({ isActive, settimanaGestazionale, onToggle, onUpdateWeek }: PregnancyModeProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const currentTrimester = TRIMESTER_INFO.find(
    t => settimanaGestazionale >= t.range[0] && settimanaGestazionale <= t.range[1]
  ) || TRIMESTER_INFO[0];

  const progressPct = Math.min(100, (settimanaGestazionale / 40) * 100);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Baby size={22} className="text-pink-400" /> Modalità Gravidanza
        </h2>
      </div>

      {/* Toggle */}
      <div className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-foreground">Modalità gravidanza</p>
          <p className="text-xs text-muted-foreground">Adatta gli allenamenti alla gestazione</p>
        </div>
        <button
          onClick={() => {
            if (isActive) { onToggle(false); }
            else { setShowConfirm(true); }
          }}
          className={`w-14 h-8 rounded-full transition-colors relative ${isActive ? "bg-pink-400" : "bg-muted"}`}
        >
          <span className={`block w-6 h-6 rounded-full bg-card shadow-sm absolute top-1 transition-transform ${isActive ? "translate-x-7" : "translate-x-1"}`} />
        </button>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
          <div className="bg-card rounded-2xl border border-border shadow-2xl p-6 max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-pilates-amber" />
              <h3 className="font-bold text-foreground">Attivare modalità gravidanza?</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Gli allenamenti verranno adattati per essere sicuri durante la gravidanza. Consulta sempre il tuo medico prima di allenarti.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 rounded-xl bg-muted text-foreground font-bold">Annulla</button>
              <button onClick={() => { onToggle(true); setShowConfirm(false); }} className="flex-1 py-3 rounded-xl bg-pink-400 text-white font-bold">Attiva</button>
            </div>
          </div>
        </div>
      )}

      {isActive && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Week selector */}
          <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
            <label className="text-sm font-bold text-foreground">Settimana di gestazione</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onUpdateWeek(Math.max(1, settimanaGestazionale - 1))}
                className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-bold text-lg"
              >-</button>
              <div className="flex-1 text-center">
                <span className="text-4xl font-black text-primary">{settimanaGestazionale}</span>
                <p className="text-xs text-muted-foreground font-bold">/ 40 settimane</p>
              </div>
              <button
                onClick={() => onUpdateWeek(Math.min(40, settimanaGestazionale + 1))}
                className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-bold text-lg"
              >+</button>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-pink-300 to-pink-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* Current trimester info */}
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-2xl border border-pink-200 dark:border-pink-800 p-5 space-y-4">
            <div className="text-center">
              <span className="text-4xl">{currentTrimester.icon}</span>
              <h3 className="text-lg font-black text-foreground mt-2">{currentTrimester.nome}</h3>
              <p className="text-xs text-muted-foreground">Settimane {currentTrimester.range[0]}-{currentTrimester.range[1]}</p>
            </div>

            {/* Safety tips */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                <Shield size={12} /> Consigli di sicurezza
              </h4>
              {currentTrimester.consigli.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="text-pink-400 mt-0.5">•</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>

            {/* Recommended exercises */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                <Heart size={12} className="text-pilates-green" /> Esercizi consigliati
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {currentTrimester.esercizi_consigliati.map(e => (
                  <span key={e} className="text-xs bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full font-bold">
                    ✅ {e}
                  </span>
                ))}
              </div>
            </div>

            {/* Exercises to avoid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                <AlertTriangle size={12} className="text-destructive" /> Esercizi da evitare
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {currentTrimester.esercizi_evitare.map(e => (
                  <span key={e} className="text-xs bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 px-2.5 py-1 rounded-full font-bold">
                    ❌ {e}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Medical disclaimer */}
          <div className="bg-pilates-amber/10 border border-pilates-amber/30 rounded-xl p-3 text-center">
            <p className="text-xs text-pilates-amber font-bold">
              ⚠️ Consulta sempre il tuo medico o ostetrica prima di iniziare qualsiasi programma di esercizi durante la gravidanza.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
