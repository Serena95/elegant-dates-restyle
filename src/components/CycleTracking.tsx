import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Droplets, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CycleEntry {
  id?: string;
  data: string;
  tipo: string;
  sintomi: string[];
  note: string;
}

interface CycleTrackingProps {
  entries: CycleEntry[];
  onAddEntry: (entry: Omit<CycleEntry, "id">) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
  durataCiclo: number;
  durataMestruazione: number;
  onUpdateSettings: (settings: { durata_ciclo?: number; durata_mestruazione?: number }) => void;
}

const SINTOMI_OPTIONS = [
  { id: "crampi", label: "Crampi", icon: "😣" },
  { id: "mal_di_testa", label: "Mal di testa", icon: "🤕" },
  { id: "stanchezza", label: "Stanchezza", icon: "😴" },
  { id: "gonfiore", label: "Gonfiore", icon: "🫧" },
  { id: "umore_basso", label: "Umore basso", icon: "😔" },
  { id: "energia", label: "Piena di energia", icon: "⚡" },
  { id: "dolore_schiena", label: "Mal di schiena", icon: "🔙" },
  { id: "nausea", label: "Nausea", icon: "🤢" },
];

const TIPO_OPTIONS = [
  { id: "mestruazione", label: "Mestruazione", color: "bg-red-400", icon: "🔴" },
  { id: "spotting", label: "Spotting", color: "bg-red-300", icon: "🟠" },
  { id: "fertile", label: "Giorno fertile", color: "bg-pilates-green", icon: "🟢" },
  { id: "ovulazione", label: "Ovulazione", color: "bg-purple-400", icon: "🟣" },
];

export function CycleTracking({ entries, onAddEntry, onDeleteEntry, durataCiclo, durataMestruazione, onUpdateSettings }: CycleTrackingProps) {
  const [meseCorrente, setMeseCorrente] = useState(new Date().getMonth());
  const [annoCorrente, setAnnoCorrente] = useState(new Date().getFullYear());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newTipo, setNewTipo] = useState("mestruazione");
  const [newSintomi, setNewSintomi] = useState<string[]>([]);
  const [newNote, setNewNote] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const mesi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
  const giorni = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
  const oggiStr = new Date().toISOString().split("T")[0];

  const { primoGiorno, giorniNelMese } = useMemo(() => {
    const primo = new Date(annoCorrente, meseCorrente, 1).getDay();
    return { primoGiorno: primo === 0 ? 6 : primo - 1, giorniNelMese: new Date(annoCorrente, meseCorrente + 1, 0).getDate() };
  }, [annoCorrente, meseCorrente]);

  const entryMap = useMemo(() => {
    const map: Record<string, CycleEntry> = {};
    entries.forEach(e => { map[e.data] = e; });
    return map;
  }, [entries]);

  // Predict next period based on last period dates
  const predictions = useMemo(() => {
    const periodDates = entries
      .filter(e => e.tipo === "mestruazione")
      .map(e => e.data)
      .sort()
      .reverse();

    if (periodDates.length === 0) return new Set<string>();

    const lastPeriod = new Date(periodDates[0]);
    const predicted = new Set<string>();

    // Predict next 3 cycles
    for (let cycle = 1; cycle <= 3; cycle++) {
      const nextStart = new Date(lastPeriod);
      nextStart.setDate(nextStart.getDate() + durataCiclo * cycle);
      for (let d = 0; d < durataMestruazione; d++) {
        const day = new Date(nextStart);
        day.setDate(day.getDate() + d);
        predicted.add(day.toISOString().split("T")[0]);
      }
    }
    return predicted;
  }, [entries, durataCiclo, durataMestruazione]);

  const cambiaMese = (d: number) => {
    let m = meseCorrente + d;
    let a = annoCorrente;
    if (m < 0) { m = 11; a--; }
    if (m > 11) { m = 0; a++; }
    setMeseCorrente(m);
    setAnnoCorrente(a);
  };

  const handleAddEntry = async () => {
    if (!selectedDate) return;
    await onAddEntry({ data: selectedDate, tipo: newTipo, sintomi: newSintomi, note: newNote });
    setShowAddModal(false);
    setNewTipo("mestruazione");
    setNewSintomi([]);
    setNewNote("");
  };

  const toggleSintomo = (id: string) => {
    setNewSintomi(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Droplets size={22} className="text-pink-400" /> Ciclo Mestruale
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Monitora il tuo ciclo e i sintomi</p>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="text-xs text-primary font-bold px-3 py-1.5 rounded-lg bg-primary/10">
          ⚙️ Impostazioni
        </button>
      </div>

      {/* Settings */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-foreground">Durata ciclo (giorni)</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => onUpdateSettings({ durata_ciclo: Math.max(21, durataCiclo - 1) })} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold">-</button>
                  <span className="text-lg font-black text-primary w-8 text-center">{durataCiclo}</span>
                  <button onClick={() => onUpdateSettings({ durata_ciclo: Math.min(40, durataCiclo + 1) })} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-foreground">Durata mestruazione (giorni)</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => onUpdateSettings({ durata_mestruazione: Math.max(2, durataMestruazione - 1) })} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold">-</button>
                  <span className="text-lg font-black text-primary w-8 text-center">{durataMestruazione}</span>
                  <button onClick={() => onUpdateSettings({ durata_mestruazione: Math.min(10, durataMestruazione + 1) })} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold">+</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex justify-between items-center mb-3">
          <button onClick={() => cambiaMese(-1)} className="p-2"><ChevronLeft size={20} className="text-foreground" /></button>
          <h3 className="text-lg font-bold text-foreground">{mesi[meseCorrente]} {annoCorrente}</h3>
          <button onClick={() => cambiaMese(1)} className="p-2"><ChevronRight size={20} className="text-foreground" /></button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-bold text-muted-foreground uppercase mb-2">
          {giorni.map(g => <div key={g}>{g}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: primoGiorno }, (_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: giorniNelMese }, (_, i) => {
            const g = i + 1;
            const key = `${annoCorrente}-${String(meseCorrente + 1).padStart(2, "0")}-${String(g).padStart(2, "0")}`;
            const isOggi = key === oggiStr;
            const entry = entryMap[key];
            const isPredicted = predictions.has(key);
            const tipo = entry?.tipo;

            let bgClass = "bg-muted/30";
            if (tipo === "mestruazione") bgClass = "bg-red-400/20 border-red-400";
            else if (tipo === "spotting") bgClass = "bg-orange-300/20 border-orange-300";
            else if (tipo === "fertile") bgClass = "bg-green-400/20 border-green-400";
            else if (tipo === "ovulazione") bgClass = "bg-purple-400/20 border-purple-400";
            else if (isPredicted) bgClass = "bg-red-200/20 border-dashed border-red-300";

            return (
              <button
                key={g}
                onClick={() => { setSelectedDate(key); setShowAddModal(true); }}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition-all border ${bgClass} ${isOggi ? "ring-2 ring-primary" : ""}`}
              >
                <span>{g}</span>
                {entry && <span className="text-[8px] mt-0.5">{TIPO_OPTIONS.find(t => t.id === tipo)?.icon}</span>}
                {!entry && isPredicted && <span className="text-[8px] mt-0.5">🔮</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {TIPO_OPTIONS.map(t => (
          <div key={t.id} className="flex items-center gap-2 text-muted-foreground">
            <span>{t.icon}</span> <span>{t.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>🔮</span> <span>Previsione</span>
        </div>
      </div>

      {/* Recent entries */}
      {entries.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase text-muted-foreground">Ultimi registri</h3>
          {entries.slice(0, 5).map(entry => (
            <div key={entry.id || entry.data} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
              <span className="text-xl">{TIPO_OPTIONS.find(t => t.id === entry.tipo)?.icon || "📅"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{entry.data}</p>
                <p className="text-xs text-muted-foreground">{TIPO_OPTIONS.find(t => t.id === entry.tipo)?.label}</p>
                {entry.sintomi.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {entry.sintomi.map(s => {
                      const sint = SINTOMI_OPTIONS.find(so => so.id === s);
                      return <span key={s} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{sint?.icon} {sint?.label}</span>;
                    })}
                  </div>
                )}
              </div>
              {entry.id && (
                <button onClick={() => onDeleteEntry(entry.id!)} className="text-muted-foreground hover:text-destructive p-1">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add entry modal */}
      {showAddModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-card rounded-2xl border border-border shadow-2xl p-6 max-w-sm w-full space-y-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-foreground">📅 {selectedDate}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground p-1"><X size={20} /></button>
            </div>

            {/* Existing entry */}
            {entryMap[selectedDate] && (
              <div className="bg-pink-50 dark:bg-pink-950/20 rounded-xl p-3 text-sm">
                <p className="font-bold text-foreground">{TIPO_OPTIONS.find(t => t.id === entryMap[selectedDate].tipo)?.label}</p>
                {entryMap[selectedDate].id && (
                  <button onClick={async () => { await onDeleteEntry(entryMap[selectedDate].id!); setShowAddModal(false); }} className="text-xs text-destructive font-bold mt-2">
                    Elimina registro
                  </button>
                )}
              </div>
            )}

            {/* Type selection */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Tipo</label>
              <div className="grid grid-cols-2 gap-2">
                {TIPO_OPTIONS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setNewTipo(t.id)}
                    className={`p-3 rounded-xl border text-sm font-bold text-center transition ${
                      newTipo === t.id ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground"
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Sintomi</label>
              <div className="flex flex-wrap gap-2">
                {SINTOMI_OPTIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => toggleSintomo(s.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                      newSintomi.includes(s.id) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Note</label>
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-sm"
                rows={2}
                placeholder="Note aggiuntive..."
              />
            </div>

            <button onClick={handleAddEntry} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">
              Salva
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
