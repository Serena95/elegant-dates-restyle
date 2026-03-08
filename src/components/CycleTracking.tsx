import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, X, Droplets, TrendingUp } from "lucide-react";
import { toast } from "sonner";
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
  onBack?: () => void;
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
  { id: "mestruazione", label: "Mestruazione", color: "bg-rose-500", lightBg: "bg-rose-500/15", border: "border-rose-400/30", icon: "🔴", textColor: "text-rose-500" },
  { id: "spotting", label: "Spotting", color: "bg-orange-400", lightBg: "bg-orange-400/15", border: "border-orange-300/30", icon: "🟠", textColor: "text-orange-400" },
  { id: "fertile", label: "Fertile", color: "bg-emerald-500", lightBg: "bg-emerald-500/15", border: "border-emerald-400/30", icon: "🟢", textColor: "text-emerald-500" },
  { id: "ovulazione", label: "Ovulazione", color: "bg-violet-500", lightBg: "bg-violet-500/15", border: "border-violet-400/30", icon: "🟣", textColor: "text-violet-500" },
];

export function CycleTracking({ entries, onAddEntry, onDeleteEntry, durataCiclo, durataMestruazione, onUpdateSettings, onBack }: CycleTrackingProps) {
  const [meseCorrente, setMeseCorrente] = useState(new Date().getMonth());
  const [annoCorrente, setAnnoCorrente] = useState(new Date().getFullYear());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newTipo, setNewTipo] = useState("mestruazione");
  const [newSintomi, setNewSintomi] = useState<string[]>([]);
  const [newNote, setNewNote] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const mesi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
  const giorniLabel = ["L", "M", "M", "G", "V", "S", "D"];

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const { primoGiorno, giorniNelMese } = useMemo(() => {
    const primo = new Date(annoCorrente, meseCorrente, 1).getDay();
    return { primoGiorno: primo === 0 ? 6 : primo - 1, giorniNelMese: new Date(annoCorrente, meseCorrente + 1, 0).getDate() };
  }, [annoCorrente, meseCorrente]);

  const entryMap = useMemo(() => {
    const map: Record<string, CycleEntry> = {};
    entries.forEach(e => { map[e.data] = e; });
    return map;
  }, [entries]);

  // Predict next period + fertile window
  const { periodPredictions, fertilePredictions } = useMemo(() => {
    const periodDates = entries
      .filter(e => e.tipo === "mestruazione")
      .map(e => e.data)
      .sort()
      .reverse();

    const periodSet = new Set<string>();
    const fertileSet = new Set<string>();

    if (periodDates.length === 0) return { periodPredictions: periodSet, fertilePredictions: fertileSet };

    const lastPeriod = new Date(periodDates[0]);

    for (let cycle = 1; cycle <= 3; cycle++) {
      const nextStart = new Date(lastPeriod);
      nextStart.setDate(nextStart.getDate() + durataCiclo * cycle);
      for (let d = 0; d < durataMestruazione; d++) {
        const day = new Date(nextStart);
        day.setDate(day.getDate() + d);
        periodSet.add(day.toISOString().split("T")[0]);
      }
      // Fertile window: ~5 days before ovulation (day 14 of cycle)
      const ovulationDay = new Date(nextStart);
      ovulationDay.setDate(ovulationDay.getDate() + Math.round(durataCiclo / 2) - 1);
      for (let d = -4; d <= 1; d++) {
        const day = new Date(ovulationDay);
        day.setDate(day.getDate() + d);
        fertileSet.add(day.toISOString().split("T")[0]);
      }
    }
    return { periodPredictions: periodSet, fertilePredictions: fertileSet };
  }, [entries, durataCiclo, durataMestruazione]);

  // Current phase
  const currentPhase = useMemo(() => {
    const entry = entryMap[todayKey];
    if (entry) {
      const tipo = TIPO_OPTIONS.find(t => t.id === entry.tipo);
      return { label: tipo?.label || "—", color: tipo?.textColor || "text-foreground", icon: tipo?.icon || "📅" };
    }
    if (periodPredictions.has(todayKey)) return { label: "Mestruazione (prev.)", color: "text-rose-400", icon: "🔮" };
    if (fertilePredictions.has(todayKey)) return { label: "Finestra fertile (prev.)", color: "text-emerald-400", icon: "🌿" };
    return { label: "Nessuna fase", color: "text-muted-foreground", icon: "✨" };
  }, [todayKey, entryMap, periodPredictions, fertilePredictions]);

  // Days until next period
  const daysUntilNext = useMemo(() => {
    const sorted = [...periodPredictions].sort();
    const future = sorted.find(d => d > todayKey);
    if (!future) return null;
    const diff = Math.round((new Date(future).getTime() - new Date(todayKey).getTime()) / 86400000);
    return diff;
  }, [periodPredictions, todayKey]);

  // Google Calendar sync
  const handleSyncGoogleCalendar = useCallback(() => {
    const allPeriods = [...periodPredictions].sort();
    const allFertile = [...fertilePredictions].sort();
    
    if (allPeriods.length === 0 && allFertile.length === 0) {
      toast.error("Nessuna previsione disponibile. Registra almeno una mestruazione.");
      return;
    }

    // Group consecutive dates into events
    const groupDates = (dates: string[]) => {
      const groups: { start: string; end: string }[] = [];
      let i = 0;
      while (i < dates.length) {
        const start = dates[i];
        let end = dates[i];
        while (i + 1 < dates.length) {
          const curr = new Date(dates[i]);
          const next = new Date(dates[i + 1]);
          if ((next.getTime() - curr.getTime()) <= 86400000) {
            end = dates[i + 1];
            i++;
          } else break;
        }
        groups.push({ start, end });
        i++;
      }
      return groups;
    };

    const periodGroups = groupDates(allPeriods);
    const fertileGroups = groupDates(allFertile);

    // Open first period prediction in Google Calendar
    const firstEvent = periodGroups[0] || fertileGroups[0];
    if (!firstEvent) return;

    const formatDate = (d: string) => d.replace(/-/g, "");
    const endPlusOne = (d: string) => {
      const date = new Date(d);
      date.setDate(date.getDate() + 1);
      return date.toISOString().split("T")[0].replace(/-/g, "");
    };

    // Build all events info for user
    let eventCount = 0;
    
    // Open Google Calendar for each predicted period
    periodGroups.forEach((group, idx) => {
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("🔴 Ciclo mestruale (previsione)")}&dates=${formatDate(group.start)}/${endPlusOne(group.end)}&details=${encodeURIComponent("Previsione generata da MyPilatesPlan")}&sf=true`;
      setTimeout(() => window.open(url, "_blank"), idx * 500);
      eventCount++;
    });

    // Open Google Calendar for each fertile window
    fertileGroups.forEach((group, idx) => {
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("🟢 Finestra fertile (previsione)")}&dates=${formatDate(group.start)}/${endPlusOne(group.end)}&details=${encodeURIComponent("Previsione generata da MyPilatesPlan")}&sf=true`;
      setTimeout(() => window.open(url, "_blank"), (periodGroups.length + idx) * 500);
      eventCount++;
    });

    toast.success(`${eventCount} eventi aperti in Google Calendar! Conferma ogni evento.`);
  }, [periodPredictions, fertilePredictions]);

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
      {/* Header */}
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} className="text-primary">
            <ChevronLeft size={24} />
          </button>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Droplets size={22} className="text-pink-500" /> Ciclo Mestruale
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Monitora il tuo ciclo e i sintomi</p>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="text-xs text-primary font-bold px-3 py-1.5 rounded-full bg-primary/10 transition hover:bg-primary/20">
          ⚙️ Config
        </button>
      </div>

      {/* Phase + Countdown Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-pink-500/10 via-rose-500/5 to-violet-500/10 rounded-2xl border border-pink-500/15 p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentPhase.icon}</span>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Oggi</p>
              <p className={`text-sm font-bold ${currentPhase.color}`}>{currentPhase.label}</p>
            </div>
          </div>
          {daysUntilNext !== null && (
            <div className="text-right">
              <p className="text-2xl font-black text-rose-500">{daysUntilNext}</p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">giorni al ciclo</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Google Calendar Sync */}
      <motion.button
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onClick={handleSyncGoogleCalendar}
        className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-sky-500/5 border border-blue-500/15 text-left transition-all active:scale-[0.98] hover:from-blue-500/15"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
          <Calendar size={20} className="text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">Sincronizza con Google Calendar</p>
          <p className="text-[10px] text-muted-foreground">Aggiungi previsioni ciclo e finestra fertile</p>
        </div>
        <ExternalLink size={16} className="text-blue-500 flex-shrink-0" />
      </motion.button>

      {/* Settings */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">Durata ciclo</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => onUpdateSettings({ durata_ciclo: Math.max(21, durataCiclo - 1) })} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-foreground">−</button>
                  <span className="text-lg font-black text-primary w-8 text-center">{durataCiclo}</span>
                  <button onClick={() => onUpdateSettings({ durata_ciclo: Math.min(40, durataCiclo + 1) })} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-foreground">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">Durata mestruazione</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => onUpdateSettings({ durata_mestruazione: Math.max(2, durataMestruazione - 1) })} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-foreground">−</button>
                  <span className="text-lg font-black text-primary w-8 text-center">{durataMestruazione}</span>
                  <button onClick={() => onUpdateSettings({ durata_mestruazione: Math.min(10, durataMestruazione + 1) })} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-foreground">+</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-border">
          <button onClick={() => cambiaMese(-1)} className="p-1.5 rounded-full hover:bg-muted transition"><ChevronLeft size={18} className="text-foreground" /></button>
          <h3 className="text-sm font-bold text-foreground">{mesi[meseCorrente]} {annoCorrente}</h3>
          <button onClick={() => cambiaMese(1)} className="p-1.5 rounded-full hover:bg-muted transition"><ChevronRight size={18} className="text-foreground" /></button>
        </div>

        <div className="p-3">
          <div className="grid grid-cols-7 text-center mb-2">
            {giorniLabel.map((g, i) => (
              <div key={i} className="text-[10px] font-bold text-muted-foreground uppercase py-1">{g}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-[3px]">
            {Array.from({ length: primoGiorno }, (_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: giorniNelMese }, (_, i) => {
              const g = i + 1;
              const key = `${annoCorrente}-${String(meseCorrente + 1).padStart(2, "0")}-${String(g).padStart(2, "0")}`;
              const isToday = key === todayKey;
              const entry = entryMap[key];
              const isPeriodPred = periodPredictions.has(key);
              const isFertilePred = fertilePredictions.has(key);
              const tipo = entry?.tipo;

              let dotColor = "";
              let cellBg = "";
              if (tipo === "mestruazione") { dotColor = "bg-rose-500"; cellBg = "bg-rose-500/10"; }
              else if (tipo === "spotting") { dotColor = "bg-orange-400"; cellBg = "bg-orange-400/10"; }
              else if (tipo === "fertile") { dotColor = "bg-emerald-500"; cellBg = "bg-emerald-500/10"; }
              else if (tipo === "ovulazione") { dotColor = "bg-violet-500"; cellBg = "bg-violet-500/10"; }
              else if (isPeriodPred) { cellBg = "bg-rose-500/5"; }
              else if (isFertilePred) { cellBg = "bg-emerald-500/5"; }

              return (
                <button
                  key={g}
                  onClick={() => { setSelectedDate(key); setShowAddModal(true); }}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs transition-all relative ${cellBg} ${
                    isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-card font-black" : "font-medium"
                  }`}
                >
                  <span className={isToday ? "text-primary" : "text-foreground"}>{g}</span>
                  {dotColor && <span className={`w-1.5 h-1.5 rounded-full ${dotColor} absolute bottom-1`} />}
                  {!entry && isPeriodPred && <span className={`w-1.5 h-1.5 rounded-full bg-rose-400/50 absolute bottom-1 border border-dashed border-rose-400`} />}
                  {!entry && isFertilePred && !isPeriodPred && <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400/50 absolute bottom-1`} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="px-4 py-3 border-t border-border flex flex-wrap gap-x-4 gap-y-1">
          {TIPO_OPTIONS.map(t => (
            <div key={t.id} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className={`w-2 h-2 rounded-full ${t.color}`} />
              <span>{t.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-rose-400/50 border border-dashed border-rose-400" />
            <span>Previsione</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-400/50" />
            <span>Fertile (prev.)</span>
          </div>
        </div>
      </div>

      {/* Recent entries */}
      {entries.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider px-1">Registri recenti</h3>
          {entries
            .sort((a, b) => b.data.localeCompare(a.data))
            .slice(0, 5)
            .map(entry => {
              const tipo = TIPO_OPTIONS.find(t => t.id === entry.tipo);
              return (
                <motion.div
                  key={entry.id || entry.data}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`rounded-2xl border ${tipo?.border || "border-border"} ${tipo?.lightBg || "bg-card"} p-3 flex items-center gap-3`}
                >
                  <div className={`w-10 h-10 rounded-xl ${tipo?.lightBg || "bg-muted"} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-lg">{tipo?.icon || "📅"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold ${tipo?.textColor || "text-foreground"}`}>{tipo?.label}</p>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <p className="text-[11px] text-muted-foreground font-medium">{formatDateNice(entry.data)}</p>
                    </div>
                    {entry.sintomi.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {entry.sintomi.map(s => {
                          const sint = SINTOMI_OPTIONS.find(so => so.id === s);
                          return <span key={s} className="text-[10px] bg-card px-1.5 py-0.5 rounded-full border border-border">{sint?.icon} {sint?.label}</span>;
                        })}
                      </div>
                    )}
                  </div>
                  {entry.id && (
                    <button onClick={() => onDeleteEntry(entry.id!)} className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition">
                      <X size={14} />
                    </button>
                  )}
                </motion.div>
              );
            })}
        </div>
      )}

      {/* Add entry modal */}
      <AnimatePresence>
        {showAddModal && selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-card rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl p-6 max-w-sm w-full space-y-5 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{formatDateNice(selectedDate)}</h3>
                  <p className="text-xs text-muted-foreground">Registra il tuo giorno</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-muted-foreground p-2 rounded-full hover:bg-muted transition"><X size={20} /></button>
              </div>

              {/* Existing entry warning */}
              {entryMap[selectedDate] && (
                <div className={`${TIPO_OPTIONS.find(t => t.id === entryMap[selectedDate].tipo)?.lightBg || "bg-muted"} rounded-xl p-3`}>
                  <p className="text-sm font-bold text-foreground">{TIPO_OPTIONS.find(t => t.id === entryMap[selectedDate].tipo)?.icon} {TIPO_OPTIONS.find(t => t.id === entryMap[selectedDate].tipo)?.label} — già registrato</p>
                  {entryMap[selectedDate].id && (
                    <button onClick={async () => { await onDeleteEntry(entryMap[selectedDate].id!); setShowAddModal(false); }} className="text-xs text-destructive font-bold mt-2 hover:underline">
                      Rimuovi registro
                    </button>
                  )}
                </div>
              )}

              {/* Type selection */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block tracking-wider">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  {TIPO_OPTIONS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setNewTipo(t.id)}
                      className={`p-3 rounded-xl border-2 text-sm font-bold text-center transition-all ${
                        newTipo === t.id
                          ? `${t.border} ${t.lightBg} ${t.textColor}`
                          : "border-border text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block tracking-wider">Come ti senti?</label>
                <div className="flex flex-wrap gap-2">
                  {SINTOMI_OPTIONS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => toggleSintomo(s.id)}
                      className={`px-3 py-2 rounded-full text-xs font-bold transition-all ${
                        newSintomi.includes(s.id)
                          ? "bg-primary text-primary-foreground shadow-md scale-105"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {s.icon} {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block tracking-wider">Note</label>
                <textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-sm resize-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  rows={2}
                  placeholder="Note aggiuntive..."
                />
              </div>

              <button
                onClick={handleAddEntry}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 active:scale-[0.98] transition"
              >
                Salva Registro
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatDateNice(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const giorni = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  const mesi = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
  return `${giorni[d.getDay()]} ${d.getDate()} ${mesi[d.getMonth()]}`;
}
