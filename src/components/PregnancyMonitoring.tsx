import { useState, useMemo } from "react";
import { ChevronLeft, Baby, Heart, AlertTriangle, Shield, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface PregnancySymptom {
  id: string;
  date: string;
  symptoms: string[];
  weight?: string;
  mood: string;
  notes: string;
}

interface PregnancyMonitoringProps {
  isActive: boolean;
  settimanaGestazionale: number;
  onToggle: (active: boolean) => void;
  onUpdateWeek: (week: number) => void;
  onBack?: () => void;
}

const PREGNANCY_SYMPTOMS = [
  { id: "nausea", label: "Nausea", icon: "🤢" },
  { id: "stanchezza", label: "Stanchezza", icon: "😴" },
  { id: "gonfiore", label: "Gonfiore", icon: "🫧" },
  { id: "mal_schiena", label: "Mal di schiena", icon: "🔙" },
  { id: "mal_testa", label: "Mal di testa", icon: "🤕" },
  { id: "crampi", label: "Crampi", icon: "😣" },
  { id: "insonnia", label: "Insonnia", icon: "🌙" },
  { id: "appetito", label: "Appetito aumentato", icon: "🍽️" },
  { id: "bruciore", label: "Bruciore di stomaco", icon: "🔥" },
  { id: "energia", label: "Piena di energia", icon: "⚡" },
];

const MOOD_OPTIONS = [
  { value: "ottimo", icon: "😊", label: "Ottimo" },
  { value: "bene", icon: "🙂", label: "Bene" },
  { value: "neutro", icon: "😐", label: "Neutro" },
  { value: "stanca", icon: "😔", label: "Stanca" },
  { value: "male", icon: "😩", label: "Male" },
];

const FETAL_DEVELOPMENT: Record<number, { size: string; fruit: string; developments: string[] }> = {
  4: { size: "Semi di papavero", fruit: "🌱", developments: ["Il cuore inizia a formarsi", "Si formano le prime cellule cerebrali"] },
  8: { size: "Lampone", fruit: "🫐", developments: ["Si formano le dita", "Il cuore batte regolarmente", "Lunghezza: ~1.6cm"] },
  12: { size: "Lime", fruit: "🍋", developments: ["Tutti gli organi principali si sono formati", "Si muove attivamente", "Lunghezza: ~5.4cm"] },
  16: { size: "Avocado", fruit: "🥑", developments: ["Può fare espressioni facciali", "Le ossa si induriscono", "Lunghezza: ~11.6cm"] },
  20: { size: "Banana", fruit: "🍌", developments: ["Senti i primi movimenti!", "Si sviluppa il gusto", "Lunghezza: ~16.5cm"] },
  24: { size: "Pannocchia", fruit: "🌽", developments: ["Risponde ai suoni", "I polmoni si sviluppano", "Lunghezza: ~21cm"] },
  28: { size: "Melanzana", fruit: "🍆", developments: ["Apre e chiude gli occhi", "Può sognare!", "Peso: ~1kg"] },
  32: { size: "Ananas", fruit: "🍍", developments: ["Le ossa sono quasi complete", "Si gira in posizione cefalica", "Peso: ~1.7kg"] },
  36: { size: "Melone", fruit: "🍈", developments: ["I polmoni sono quasi maturi", "Ingrassamento rapido", "Peso: ~2.6kg"] },
  40: { size: "Anguria", fruit: "🍉", developments: ["Pronto a nascere!", "Peso: ~3.4kg", "Lunghezza: ~51cm"] },
};

function getFetalInfo(week: number) {
  const milestones = Object.keys(FETAL_DEVELOPMENT).map(Number).sort((a, b) => a - b);
  let closest = milestones[0];
  for (const m of milestones) {
    if (m <= week) closest = m;
  }
  return FETAL_DEVELOPMENT[closest] || FETAL_DEVELOPMENT[4];
}

const TRIMESTER_INFO = [
  {
    range: [1, 12], nome: "Primo Trimestre", icon: "🌱",
    consigli: ["Evita esercizi in posizione prona dopo le 8 settimane", "Mantieni l'intensità moderata", "Concentrati sulla respirazione diaframmatica", "Evita torsioni profonde del busto"],
    esercizi_consigliati: ["Respirazione", "Kegel", "Mobilità bacino", "Cat-Cow leggero"],
    esercizi_evitare: ["Crunch classici", "Plank prolungati", "Esercizi ad alta intensità"],
  },
  {
    range: [13, 27], nome: "Secondo Trimestre", icon: "🌸",
    consigli: ["Non sdraiarti supina per periodi prolungati", "Usa supporti e cuscini per il comfort", "Lavora sulla stabilità del pavimento pelvico", "Mantieni una buona idratazione"],
    esercizi_consigliati: ["Side-lying exercises", "Squat leggeri", "Stretching laterale", "Esercizi in quadrupedia"],
    esercizi_evitare: ["Esercizi supini prolungati", "Salti", "Addominali tradizionali"],
  },
  {
    range: [28, 40], nome: "Terzo Trimestre", icon: "🤱",
    consigli: ["Riduci l'intensità e ascolta il tuo corpo", "Concentrati su mobilità e respirazione", "Preparati al parto con esercizi del pavimento pelvico", "Evita movimenti bruschi e cambi di direzione rapidi"],
    esercizi_consigliati: ["Respirazione per il parto", "Mobilità anche", "Stretching dolce", "Kegel avanzati"],
    esercizi_evitare: ["Esercizi ad impatto", "Posizioni instabili", "Sforzi intensi"],
  },
];

export function PregnancyMonitoring({ isActive, settimanaGestazionale, onToggle, onUpdateWeek, onBack }: PregnancyMonitoringProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [tab, setTab] = useState<"timeline" | "tracker" | "esercizi">("timeline");
  const [symptoms, setSymptoms] = useState<PregnancySymptom[]>([]);
  const [showAddSymptom, setShowAddSymptom] = useState(false);
  const [newSymptoms, setNewSymptoms] = useState<string[]>([]);
  const [newMood, setNewMood] = useState("bene");
  const [newWeight, setNewWeight] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const currentTrimester = TRIMESTER_INFO.find(t => settimanaGestazionale >= t.range[0] && settimanaGestazionale <= t.range[1]) || TRIMESTER_INFO[0];
  const fetalInfo = getFetalInfo(settimanaGestazionale);
  const progressPct = Math.min(100, (settimanaGestazionale / 40) * 100);
  const dueDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + (40 - settimanaGestazionale) * 7);
    return d.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  }, [settimanaGestazionale]);

  const addSymptom = () => {
    const today = new Date().toISOString().split("T")[0];
    const entry: PregnancySymptom = {
      id: Date.now().toString(),
      date: today,
      symptoms: newSymptoms,
      weight: newWeight || undefined,
      mood: newMood,
      notes: newNotes,
    };
    setSymptoms(prev => [entry, ...prev]);
    setShowAddSymptom(false);
    setNewSymptoms([]);
    setNewMood("bene");
    setNewWeight("");
    setNewNotes("");
    toast.success("Sintomi registrati!");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        {onBack && <button onClick={onBack} className="text-primary"><ChevronLeft size={24} /></button>}
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2 flex-1">
          <Baby size={22} className="text-pink-400" /> Gravidanza
        </h2>
      </div>

      {/* Toggle */}
      <div className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-foreground">Modalità gravidanza</p>
          <p className="text-xs text-muted-foreground">Adatta allenamenti e monitoraggio</p>
        </div>
        <button
          onClick={() => { if (isActive) onToggle(false); else setShowConfirm(true); }}
          className={`w-14 h-8 rounded-full transition-colors relative ${isActive ? "bg-pink-400" : "bg-muted"}`}
        >
          <span className={`block w-6 h-6 rounded-full bg-card shadow-sm absolute top-1 transition-transform ${isActive ? "translate-x-7" : "translate-x-1"}`} />
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
          <div className="bg-card rounded-2xl border border-border shadow-2xl p-6 max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2"><AlertTriangle size={20} className="text-pilates-amber" /><h3 className="font-bold text-foreground">Attivare modalità gravidanza?</h3></div>
            <p className="text-sm text-muted-foreground">Gli allenamenti verranno adattati per la gravidanza. Consulta il medico.</p>
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
            <div className="flex items-center gap-4">
              <button onClick={() => onUpdateWeek(Math.max(1, settimanaGestazionale - 1))} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-bold text-lg">-</button>
              <div className="flex-1 text-center">
                <span className="text-4xl font-black text-primary">{settimanaGestazionale}</span>
                <p className="text-xs text-muted-foreground font-bold">/ 40 settimane</p>
              </div>
              <button onClick={() => onUpdateWeek(Math.min(40, settimanaGestazionale + 1))} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-bold text-lg">+</button>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-pink-300 to-pink-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="text-xs text-center text-muted-foreground">Data presunta parto: <span className="font-bold text-foreground">{dueDate}</span></p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
            {[
              { id: "timeline" as const, label: "Timeline", icon: "📅" },
              { id: "tracker" as const, label: "Sintomi", icon: "📝" },
              { id: "esercizi" as const, label: "Esercizi", icon: "🧘" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${tab === t.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {tab === "timeline" && (
            <div className="space-y-4">
              {/* Fetal development */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-2xl border border-pink-200 dark:border-pink-800 p-5 text-center space-y-3">
                <span className="text-6xl">{fetalInfo.fruit}</span>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase">Il tuo bambino è grande come</p>
                  <p className="text-lg font-black text-foreground">{fetalInfo.size}</p>
                </div>
                <div className="space-y-1.5 text-left">
                  {fetalInfo.developments.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-pink-400 mt-0.5">•</span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trimester timeline */}
              <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="text-lg">{currentTrimester.icon}</span> {currentTrimester.nome}
                  <span className="text-[10px] text-muted-foreground">(sett. {currentTrimester.range[0]}-{currentTrimester.range[1]})</span>
                </h3>
                <div className="flex gap-1">
                  {TRIMESTER_INFO.map((t, i) => {
                    const isActive = t === currentTrimester;
                    return (
                      <div key={i} className={`flex-1 h-2 rounded-full transition ${isActive ? "bg-pink-400" : "bg-muted"}`} />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === "tracker" && (
            <div className="space-y-4">
              <button onClick={() => setShowAddSymptom(true)} className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2">
                <Plus size={18} /> Registra Sintomi Oggi
              </button>

              {symptoms.length > 0 ? (
                symptoms.map(s => (
                  <div key={s.id} className="bg-card rounded-2xl border border-border p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground">{new Date(s.date).toLocaleDateString("it-IT")}</span>
                      <span className="text-lg">{MOOD_OPTIONS.find(m => m.value === s.mood)?.icon}</span>
                    </div>
                    {s.weight && <p className="text-xs text-foreground">Peso: <span className="font-bold">{s.weight} kg</span></p>}
                    <div className="flex flex-wrap gap-1">
                      {s.symptoms.map(sym => {
                        const info = PREGNANCY_SYMPTOMS.find(ps => ps.id === sym);
                        return <span key={sym} className="text-[10px] bg-pink-500/10 text-pink-600 dark:text-pink-400 px-2 py-0.5 rounded-full">{info?.icon} {info?.label}</span>;
                      })}
                    </div>
                    {s.notes && <p className="text-xs text-muted-foreground">{s.notes}</p>}
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground text-sm py-8">Nessun sintomo registrato. Inizia oggi!</p>
              )}

              {/* Add symptom modal */}
              <AnimatePresence>
                {showAddSymptom && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowAddSymptom(false)}>
                    <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="bg-card rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl p-6 max-w-sm w-full space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                      <h3 className="font-bold text-lg text-foreground">Come ti senti oggi?</h3>

                      <div>
                        <p className="text-xs font-bold text-muted-foreground mb-2">Umore</p>
                        <div className="flex gap-2">
                          {MOOD_OPTIONS.map(m => (
                            <button key={m.value} onClick={() => setNewMood(m.value)} className={`flex-1 py-2 rounded-xl text-center transition ${newMood === m.value ? "bg-primary/10 border-2 border-primary" : "bg-muted border-2 border-transparent"}`}>
                              <span className="text-xl">{m.icon}</span>
                              <p className="text-[9px] text-muted-foreground mt-0.5">{m.label}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-muted-foreground mb-2">Sintomi</p>
                        <div className="flex flex-wrap gap-1.5">
                          {PREGNANCY_SYMPTOMS.map(s => (
                            <button key={s.id} onClick={() => setNewSymptoms(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])} className={`text-xs px-3 py-1.5 rounded-full transition ${newSymptoms.includes(s.id) ? "bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-400/30" : "bg-muted text-muted-foreground"}`}>
                              {s.icon} {s.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-muted-foreground mb-2">Peso (opzionale)</p>
                        <input value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="es. 65.5" className="w-full p-3 rounded-xl border border-border bg-background text-foreground" type="number" step="0.1" />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-muted-foreground mb-2">Note</p>
                        <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Come ti senti oggi?" className="w-full p-3 rounded-xl border border-border bg-background text-foreground h-16 resize-none" />
                      </div>

                      <button onClick={addSymptom} className="w-full py-3 rounded-2xl bg-pink-400 text-white font-bold">Salva</button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {tab === "esercizi" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-2xl border border-pink-200 dark:border-pink-800 p-5 space-y-4">
                <div className="text-center">
                  <span className="text-4xl">{currentTrimester.icon}</span>
                  <h3 className="text-lg font-black text-foreground mt-2">{currentTrimester.nome}</h3>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1"><Shield size={12} /> Consigli</h4>
                  {currentTrimester.consigli.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-foreground"><span className="text-pink-400 mt-0.5">•</span><span>{c}</span></div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1"><Heart size={12} className="text-pilates-green" /> Consigliati</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentTrimester.esercizi_consigliati.map(e => (
                      <span key={e} className="text-xs bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full font-bold">✅ {e}</span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1"><AlertTriangle size={12} className="text-destructive" /> Da evitare</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentTrimester.esercizi_evitare.map(e => (
                      <span key={e} className="text-xs bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 px-2.5 py-1 rounded-full font-bold">❌ {e}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-pilates-amber/10 border border-pilates-amber/30 rounded-xl p-3 text-center">
                <p className="text-xs text-pilates-amber font-bold">⚠️ Consulta sempre il tuo medico prima di allenarti in gravidanza.</p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
