import { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Droplets, Settings, Heart, Smile, Frown, Meh, Zap, Moon, Sun, Flower2, Baby, Dumbbell, Utensils } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { getLunarPhase, getCombinedAdaptationMessage, type LunarPhaseInfo } from "@/utils/lunarPhase";

// ============================================================
// TYPES
// ============================================================

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

// ============================================================
// CYCLE PHASE LOGIC (exported for reuse)
// ============================================================

export type CyclePhaseId = "mestruale" | "follicolare" | "ovulazione" | "luteale";

export interface CyclePhaseInfo {
  id: CyclePhaseId;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  emoji: string;
  workoutTip: string;
  nutritionTip: string;
  description: string;
}

export const CYCLE_PHASES: Record<CyclePhaseId, CyclePhaseInfo> = {
  mestruale: {
    id: "mestruale",
    label: "Mestruale",
    icon: "🩸",
    color: "bg-rose-500",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/20",
    textColor: "text-rose-500",
    emoji: "🌙",
    workoutTip: "Allenamenti leggeri: stretching, yoga, camminate dolci",
    nutritionTip: "Aumenta ferro e vitamina C. Cibi caldi e nutrienti.",
    description: "Periodo di riposo e rigenerazione. Ascolta il tuo corpo.",
  },
  follicolare: {
    id: "follicolare",
    label: "Follicolare",
    icon: "🌱",
    color: "bg-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    textColor: "text-emerald-500",
    emoji: "🌿",
    workoutTip: "Aumenta gradualmente l'intensità. Ottimo per nuovi esercizi.",
    nutritionTip: "Proteine magre e verdure fresche. Energia in crescita!",
    description: "Energia in aumento. Fase ideale per spingerti un po' oltre.",
  },
  ovulazione: {
    id: "ovulazione",
    label: "Ovulazione",
    icon: "✨",
    color: "bg-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    textColor: "text-amber-500",
    emoji: "☀️",
    workoutTip: "Massima intensità! HIIT, forza, finisher impegnativi.",
    nutritionTip: "Antiossidanti, omega-3 e cibi anti-infiammatori.",
    description: "Picco di energia e forza. Sfrutta al massimo!",
  },
  luteale: {
    id: "luteale",
    label: "Luteale",
    icon: "🍂",
    color: "bg-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
    textColor: "text-violet-500",
    emoji: "🌸",
    workoutTip: "Intensità moderata. Focus su controllo e stabilità.",
    nutritionTip: "Magnesio, carboidrati complessi. Evita eccesso di sale.",
    description: "Fase di transizione. Mantieni costanza con moderazione.",
  },
};

export function getCyclePhaseForDate(
  dateStr: string,
  entries: CycleEntry[],
  durataCiclo: number,
  durataMestruazione: number
): CyclePhaseId | null {
  const lastPeriod = entries
    .filter(e => e.tipo === "mestruazione")
    .sort((a, b) => b.data.localeCompare(a.data))[0];

  if (!lastPeriod) return null;

  const lastDate = new Date(lastPeriod.data + "T00:00:00");
  const target = new Date(dateStr + "T00:00:00");
  const daysSince = Math.floor((target.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSince < 0) return null;

  // Normalize to current cycle position
  const dayInCycle = daysSince % durataCiclo;

  if (dayInCycle < durataMestruazione) return "mestruale";
  if (dayInCycle < Math.floor(durataCiclo / 2) - 1) return "follicolare";
  if (dayInCycle < Math.floor(durataCiclo / 2) + 2) return "ovulazione";
  return "luteale";
}

// ============================================================
// SYMPTOM & MOOD DATA
// ============================================================

const SINTOMI_OPTIONS = [
  { id: "crampi", label: "Crampi", icon: "😣" },
  { id: "mal_di_testa", label: "Mal di testa", icon: "🤕" },
  { id: "stanchezza", label: "Stanchezza", icon: "😴" },
  { id: "gonfiore", label: "Gonfiore", icon: "🫧" },
  { id: "dolore_schiena", label: "Mal di schiena", icon: "🔙" },
  { id: "nausea", label: "Nausea", icon: "🤢" },
  { id: "acne", label: "Acne", icon: "😖" },
  { id: "tensione_seno", label: "Tensione seno", icon: "💢" },
  { id: "insonnia", label: "Insonnia", icon: "🌙" },
  { id: "appetito", label: "Appetito alto", icon: "🍽️" },
];

const MOOD_OPTIONS = [
  { id: "felice", label: "Felice", icon: "😊", color: "text-amber-500" },
  { id: "energica", label: "Energica", icon: "⚡", color: "text-emerald-500" },
  { id: "tranquilla", label: "Tranquilla", icon: "😌", color: "text-sky-500" },
  { id: "stressata", label: "Stressata", icon: "😰", color: "text-orange-500" },
  { id: "triste", label: "Triste", icon: "😢", color: "text-blue-500" },
  { id: "irritabile", label: "Irritabile", icon: "😤", color: "text-rose-500" },
  { id: "ansiosa", label: "Ansiosa", icon: "😟", color: "text-violet-500" },
  { id: "sensibile", label: "Sensibile", icon: "🥺", color: "text-pink-500" },
];

const TIPO_OPTIONS = [
  { id: "mestruazione", label: "Ciclo", color: "bg-rose-500", lightBg: "bg-rose-500/15", border: "border-rose-400/30", icon: "🩸", textColor: "text-rose-500" },
  { id: "spotting", label: "Spotting", color: "bg-orange-400", lightBg: "bg-orange-400/15", border: "border-orange-300/30", icon: "🟠", textColor: "text-orange-400" },
];

// ============================================================
// COMPONENT
// ============================================================

export function CycleTracking({ entries, onAddEntry, onDeleteEntry, durataCiclo, durataMestruazione, onUpdateSettings, onBack }: CycleTrackingProps) {
  const [meseCorrente, setMeseCorrente] = useState(new Date().getMonth());
  const [annoCorrente, setAnnoCorrente] = useState(new Date().getFullYear());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newTipo, setNewTipo] = useState("mestruazione");
  const [newSintomi, setNewSintomi] = useState<string[]>([]);
  const [newMood, setNewMood] = useState<string>("");
  const [newNote, setNewNote] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<"calendario" | "diario">("calendario");

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // ============================================================
  // CYCLE START/END LOGIC
  // ============================================================
  
  // Determine if a cycle is currently active (started but not ended)
  const cycleStatus = useMemo(() => {
    const startEntries = entries
      .filter(e => e.tipo === "mestruazione" || e.tipo === "inizio_ciclo")
      .sort((a, b) => b.data.localeCompare(a.data));
    const endEntries = entries
      .filter(e => e.tipo === "fine_ciclo")
      .sort((a, b) => b.data.localeCompare(a.data));

    const lastStart = startEntries[0];
    const lastEnd = endEntries[0];

    if (!lastStart) return { active: false, startDate: null, endDate: null, duration: null };

    // Cycle is active if there's a start with no end after it
    const isActive = !lastEnd || lastStart.data > lastEnd.data;
    
    // Calculate last completed cycle duration
    let duration: number | null = null;
    if (lastEnd && lastStart) {
      // Find the start that corresponds to this end
      const correspondingStart = startEntries.find(s => s.data <= lastEnd.data);
      if (correspondingStart) {
        const startD = new Date(correspondingStart.data + "T00:00:00");
        const endD = new Date(lastEnd.data + "T00:00:00");
        duration = Math.round((endD.getTime() - startD.getTime()) / 86400000) + 1;
      }
    }

    return {
      active: isActive,
      startDate: isActive ? lastStart.data : null,
      endDate: lastEnd?.data || null,
      duration,
      lastStartDate: lastStart.data,
    };
  }, [entries]);

  // Days the cycle has been active
  const activeCycleDays = useMemo(() => {
    if (!cycleStatus.active || !cycleStatus.startDate) return 0;
    const start = new Date(cycleStatus.startDate + "T00:00:00");
    const now = new Date(todayKey + "T00:00:00");
    return Math.round((now.getTime() - start.getTime()) / 86400000) + 1;
  }, [cycleStatus]);

  // Dates covered by active cycle (for calendar highlighting)
  const activeCycleDates = useMemo(() => {
    const dates = new Set<string>();
    if (!cycleStatus.active || !cycleStatus.startDate) return dates;
    const start = new Date(cycleStatus.startDate + "T00:00:00");
    const now = new Date(todayKey + "T00:00:00");
    const d = new Date(start);
    while (d <= now) {
      dates.add(d.toISOString().split("T")[0]);
      d.setDate(d.getDate() + 1);
    }
    return dates;
  }, [cycleStatus, todayKey]);

  // Past completed cycles date ranges for calendar
  const completedCycleDates = useMemo(() => {
    const dates = new Set<string>();
    const starts = entries.filter(e => e.tipo === "mestruazione" || e.tipo === "inizio_ciclo").sort((a, b) => a.data.localeCompare(b.data));
    const ends = entries.filter(e => e.tipo === "fine_ciclo").sort((a, b) => a.data.localeCompare(b.data));
    
    for (const end of ends) {
      const correspondingStart = [...starts].reverse().find(s => s.data <= end.data);
      if (correspondingStart) {
        const startD = new Date(correspondingStart.data + "T00:00:00");
        const endD = new Date(end.data + "T00:00:00");
        const d = new Date(startD);
        while (d <= endD) {
          dates.add(d.toISOString().split("T")[0]);
          d.setDate(d.getDate() + 1);
        }
      }
    }
    return dates;
  }, [entries]);

  const handleStartCycle = async () => {
    await onAddEntry({ data: todayKey, tipo: "inizio_ciclo", sintomi: [], note: "" });
    // Also add a mestruazione entry so phase calculation works
    await onAddEntry({ data: todayKey, tipo: "mestruazione", sintomi: [], note: "Inizio ciclo" });
    toast.success("Ciclo iniziato! 🩸");
  };

  const handleEndCycle = async () => {
    await onAddEntry({ data: todayKey, tipo: "fine_ciclo", sintomi: [], note: "" });
    toast.success("Ciclo terminato! ✨");
  };

  const mesi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
  const giorniLabel = ["L", "M", "M", "G", "V", "S", "D"];


  const { primoGiorno, giorniNelMese } = useMemo(() => {
    const primo = new Date(annoCorrente, meseCorrente, 1).getDay();
    return { primoGiorno: primo === 0 ? 6 : primo - 1, giorniNelMese: new Date(annoCorrente, meseCorrente + 1, 0).getDate() };
  }, [annoCorrente, meseCorrente]);

  const entryMap = useMemo(() => {
    const map: Record<string, CycleEntry> = {};
    entries.forEach(e => { map[e.data] = e; });
    return map;
  }, [entries]);

  // Current phase
  const currentPhase = useMemo(() => {
    return getCyclePhaseForDate(todayKey, entries, durataCiclo, durataMestruazione);
  }, [todayKey, entries, durataCiclo, durataMestruazione]);

  const currentPhaseInfo = currentPhase ? CYCLE_PHASES[currentPhase] : null;

  // Smart predictions based on real cycle data (start/end entries)
  const smartCycleLength = useMemo(() => {
    const starts = entries
      .filter(e => e.tipo === "mestruazione" || e.tipo === "inizio_ciclo")
      .map(e => e.data)
      .sort();
    const ends = entries
      .filter(e => e.tipo === "fine_ciclo")
      .map(e => e.data)
      .sort();

    // Calculate average cycle length from consecutive starts
    if (starts.length >= 2) {
      const gaps: number[] = [];
      const uniqueStarts = [...new Set(starts)].sort();
      for (let i = 1; i < uniqueStarts.length; i++) {
        const diff = Math.round((new Date(uniqueStarts[i] + "T00:00:00").getTime() - new Date(uniqueStarts[i - 1] + "T00:00:00").getTime()) / 86400000);
        if (diff >= 15 && diff <= 50) gaps.push(diff); // filter outliers
      }
      if (gaps.length > 0) return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    }
    return durataCiclo;
  }, [entries, durataCiclo]);

  // Calculate average period duration from start/end pairs
  const smartPeriodLength = useMemo(() => {
    const starts = entries
      .filter(e => e.tipo === "mestruazione" || e.tipo === "inizio_ciclo")
      .sort((a, b) => a.data.localeCompare(b.data));
    const ends = entries
      .filter(e => e.tipo === "fine_ciclo")
      .sort((a, b) => a.data.localeCompare(b.data));

    const durations: number[] = [];
    for (const end of ends) {
      const correspondingStart = [...starts].reverse().find(s => s.data <= end.data);
      if (correspondingStart) {
        const d = Math.round((new Date(end.data + "T00:00:00").getTime() - new Date(correspondingStart.data + "T00:00:00").getTime()) / 86400000) + 1;
        if (d >= 2 && d <= 10) durations.push(d);
      }
    }
    if (durations.length > 0) return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    return durataMestruazione;
  }, [entries, durataMestruazione]);

  // Predictions using smart values
  const predictions = useMemo(() => {
    const periodDates = entries
      .filter(e => e.tipo === "mestruazione" || e.tipo === "inizio_ciclo")
      .map(e => e.data)
      .sort()
      .reverse();

    const periodSet = new Set<string>();
    const fertileSet = new Set<string>();
    const ovulationSet = new Set<string>();
    const highPregnancySet = new Set<string>();

    if (periodDates.length === 0) return { periodSet, fertileSet, ovulationSet, highPregnancySet };

    const lastPeriod = new Date(periodDates[0] + "T00:00:00");
    const cycleLen = smartCycleLength;
    const periodLen = smartPeriodLength;

    for (let cycle = 0; cycle <= 6; cycle++) {
      const cycleStart = new Date(lastPeriod);
      cycleStart.setDate(cycleStart.getDate() + cycleLen * cycle);
      
      // Period days (skip cycle 0 = current/past, only predict future)
      if (cycle > 0) {
        for (let d = 0; d < periodLen; d++) {
          const day = new Date(cycleStart);
          day.setDate(day.getDate() + d);
          periodSet.add(day.toISOString().split("T")[0]);
        }
      }
      
      // Ovulation day (~14 days before end of cycle)
      const ovDay = new Date(cycleStart);
      ovDay.setDate(ovDay.getDate() + cycleLen - 14);
      ovulationSet.add(ovDay.toISOString().split("T")[0]);
      
      // Fertile window: 5 days before ovulation + ovulation day + 1 day after
      for (let d = -5; d <= 1; d++) {
        const day = new Date(ovDay);
        day.setDate(day.getDate() + d);
        fertileSet.add(day.toISOString().split("T")[0]);
      }

      // High pregnancy probability: 2 days before ovulation + ovulation day
      for (let d = -2; d <= 0; d++) {
        const day = new Date(ovDay);
        day.setDate(day.getDate() + d);
        highPregnancySet.add(day.toISOString().split("T")[0]);
      }
    }
    return { periodSet, fertileSet, ovulationSet, highPregnancySet };
  }, [entries, smartCycleLength, smartPeriodLength]);

  // Days until next events
  const daysUntilNext = useMemo(() => {
    const sorted = [...predictions.periodSet].sort();
    const future = sorted.find(d => d > todayKey);
    if (!future) return null;
    return Math.round((new Date(future + "T00:00:00").getTime() - new Date(todayKey + "T00:00:00").getTime()) / 86400000);
  }, [predictions.periodSet, todayKey]);

  const daysUntilOvulation = useMemo(() => {
    const sorted = [...predictions.ovulationSet].sort();
    const future = sorted.find(d => d > todayKey);
    if (!future) return null;
    return Math.round((new Date(future + "T00:00:00").getTime() - new Date(todayKey + "T00:00:00").getTime()) / 86400000);
  }, [predictions.ovulationSet, todayKey]);

  const isFertileToday = predictions.fertileSet.has(todayKey);
  const isHighPregnancyToday = predictions.highPregnancySet.has(todayKey);

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
    // Encode mood in sintomi array for persistence (prefix with "mood:")
    const allSintomi = [...newSintomi];
    if (newMood) allSintomi.push(`mood:${newMood}`);
    await onAddEntry({ data: selectedDate, tipo: newTipo, sintomi: allSintomi, note: newNote });
    toast.success("Registrato! 📝");
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNewTipo("mestruazione");
    setNewSintomi([]);
    setNewMood("");
    setNewNote("");
  };

  const toggleSintomo = (id: string) => {
    setNewSintomi(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  // Extract mood from entry's sintomi
  const getMood = (entry: CycleEntry) => {
    const moodEntry = entry.sintomi.find(s => s.startsWith("mood:"));
    return moodEntry ? moodEntry.replace("mood:", "") : null;
  };

  const getSymptoms = (entry: CycleEntry) => {
    return entry.sintomi.filter(s => !s.startsWith("mood:"));
  };

  // Get phase info for a given date key
  const getPhaseForDate = useCallback((dateKey: string) => {
    return getCyclePhaseForDate(dateKey, entries, durataCiclo, durataMestruazione);
  }, [entries, durataCiclo, durataMestruazione]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} className="text-primary p-1">
            <ChevronLeft size={24} />
          </button>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Droplets size={22} className="text-pink-500" /> Il Mio Ciclo
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Il tuo diario personale</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full bg-muted/50 hover:bg-muted transition"
        >
          <Settings size={16} className="text-muted-foreground" />
        </button>
      </div>

      {/* Quick Action Buttons: Start/End Cycle */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3"
      >
        {!cycleStatus.active ? (
          <button
            onClick={handleStartCycle}
            className="flex-1 py-4 rounded-2xl bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-500/25 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
          >
            <Droplets size={18} />
            Inizia Ciclo
          </button>
        ) : (
          <button
            onClick={handleEndCycle}
            className="flex-1 py-4 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
          >
            <Heart size={18} />
            Fine Ciclo
          </button>
        )}
      </motion.div>

      {/* Active cycle status */}
      {cycleStatus.active && cycleStatus.startDate && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🩸</span>
            <div>
              <p className="text-sm font-bold text-foreground">Ciclo in corso</p>
              <p className="text-xs text-muted-foreground">
                Iniziato il {formatDateNice(cycleStatus.startDate)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-rose-500">{activeCycleDays}</p>
            <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">
              {activeCycleDays === 1 ? "giorno" : "giorni"}
            </p>
          </div>
        </motion.div>
      )}

      {/* Last cycle info */}
      {!cycleStatus.active && cycleStatus.duration && (
        <div className="rounded-2xl border border-border bg-card p-3 flex items-center gap-3">
          <span className="text-lg">📊</span>
          <div className="flex-1">
            <p className="text-xs font-bold text-foreground">Ultimo ciclo</p>
            <p className="text-[11px] text-muted-foreground">
              Durata: <span className="font-bold text-foreground">{cycleStatus.duration} giorni</span>
            </p>
          </div>
        </div>
      )}

      {/* Current Phase Banner + Lunar */}
      {currentPhaseInfo && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border ${currentPhaseInfo.borderColor} ${currentPhaseInfo.bgColor} p-4 space-y-3`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentPhaseInfo.emoji}</span>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Fase attuale</p>
                <p className={`text-base font-black ${currentPhaseInfo.textColor}`}>{currentPhaseInfo.label}</p>
              </div>
            </div>
            {daysUntilNext !== null && (
              <div className="text-right">
                <p className="text-2xl font-black text-rose-500">{daysUntilNext}</p>
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">giorni al ciclo</p>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{currentPhaseInfo.description}</p>

          {/* Lunar Phase Row */}
          {(() => {
            const lunar = getLunarPhase(new Date());
            const combined = getCombinedAdaptationMessage(currentPhase, lunar);
            return (
              <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-blue-500/10 rounded-xl p-3 border border-indigo-500/10">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{lunar.icon}</span>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1"><Moon size={9} /> Fase Lunare</p>
                      <p className="text-xs font-bold text-foreground">{lunar.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-indigo-500">{lunar.illumination}%</p>
                    <p className="text-[8px] uppercase font-bold text-muted-foreground">Illuminazione</p>
                  </div>
                </div>
                {combined && (
                  <p className="text-[11px] text-foreground/80 leading-snug mt-1 italic">{combined}</p>
                )}
              </div>
            );
          })()}
          
          {/* Workout & Nutrition tips */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-card/60 rounded-xl p-2.5 border border-border/50">
              <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1 mb-1">
                <Dumbbell size={10} /> Allenamento
              </p>
              <p className="text-[11px] text-foreground leading-snug">{currentPhaseInfo.workoutTip}</p>
            </div>
            <div className="bg-card/60 rounded-xl p-2.5 border border-border/50">
              <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1 mb-1">
                <Utensils size={10} /> Nutrizione
              </p>
              <p className="text-[11px] text-foreground leading-snug">{currentPhaseInfo.nutritionTip}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* No data prompt */}
      {!currentPhaseInfo && entries.filter(e => e.tipo === "mestruazione").length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-dashed border-pink-300/30 bg-pink-500/5 p-5 text-center space-y-2"
        >
          <span className="text-3xl">📅</span>
          <p className="text-sm font-bold text-foreground">Inizia a tracciare il tuo ciclo</p>
          <p className="text-xs text-muted-foreground">Tocca un giorno nel calendario per registrare l'inizio del ciclo. Le previsioni saranno calcolate automaticamente!</p>
        </motion.div>
      )}

      {/* Phase Progress Bar */}
      {currentPhase && (
        <div className="flex gap-1">
          {(["mestruale", "follicolare", "ovulazione", "luteale"] as CyclePhaseId[]).map(phase => (
            <div key={phase} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1.5 w-full rounded-full transition-all ${currentPhase === phase ? CYCLE_PHASES[phase].color : "bg-muted"}`} />
              <span className={`text-[9px] font-bold ${currentPhase === phase ? CYCLE_PHASES[phase].textColor : "text-muted-foreground/50"}`}>
                {CYCLE_PHASES[phase].icon}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Predictions Summary */}
      {entries.filter(e => e.tipo === "mestruazione" || e.tipo === "inizio_ciclo").length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <p className="text-lg font-black text-rose-500">{daysUntilNext ?? "—"}</p>
            <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Prossimo ciclo</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <p className="text-lg font-black text-amber-500">{daysUntilOvulation ?? "—"}</p>
            <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Ovulazione</p>
          </div>
          <div className={`rounded-xl border p-3 text-center ${isHighPregnancyToday ? "bg-pink-500/10 border-pink-400/30" : isFertileToday ? "bg-emerald-500/10 border-emerald-400/30" : "bg-card border-border"}`}>
            <p className="text-lg font-black">{isHighPregnancyToday ? "🤰" : isFertileToday ? "💚" : "—"}</p>
            <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">
              {isHighPregnancyToday ? "Alta prob." : isFertileToday ? "Fertile" : "Fertilità"}
            </p>
          </div>
        </div>
      )}

      {/* Smart cycle info */}
      {entries.filter(e => e.tipo === "mestruazione" || e.tipo === "inizio_ciclo").length >= 2 && (
        <div className="rounded-xl border border-border bg-card/50 p-3 flex items-center gap-2">
          <span className="text-sm">🧠</span>
          <p className="text-[11px] text-muted-foreground">
            Ciclo medio: <span className="font-bold text-foreground">{smartCycleLength} giorni</span> · 
            Mestruazione: <span className="font-bold text-foreground">{smartPeriodLength} giorni</span>
            <span className="text-[9px] ml-1 opacity-60">(calcolato dai tuoi dati)</span>
          </p>
        </div>
      )}

      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
              <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Impostazioni Ciclo</p>
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

      {/* Tab selector */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
        <button
          onClick={() => setActiveTab("calendario")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "calendario" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
        >
          📅 Calendario
        </button>
        <button
          onClick={() => setActiveTab("diario")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "diario" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
        >
          📖 Diario
        </button>
      </div>

      {/* Calendar Tab */}
      {activeTab === "calendario" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
                  const isPeriodPred = predictions.periodSet.has(key);
                  const isFertilePred = predictions.fertileSet.has(key);
                  const isOvulationPred = predictions.ovulationSet.has(key);
                  const isHighPregnancy = predictions.highPregnancySet.has(key);
                  const tipo = entry?.tipo;
                  const phase = getPhaseForDate(key);
                  const isActiveCycleDay = activeCycleDates.has(key);
                  const isCompletedCycleDay = completedCycleDates.has(key);

                  // Lunar phase for this date
                  const cellDate = new Date(annoCorrente, meseCorrente, g);
                  const lunar = getLunarPhase(cellDate);
                  // Show lunar icon only on key phases (new, first quarter, full, last quarter)
                  const showLunar = ["Luna Nuova", "Primo Quarto", "Luna Piena", "Ultimo Quarto"].includes(lunar.name);

                  let cellBg = "";
                  let dotColor = "";
                  let dotStyle = "";

                  if (isActiveCycleDay) { dotColor = "bg-rose-500"; cellBg = "bg-rose-500/20"; }
                  else if (isCompletedCycleDay) { dotColor = "bg-rose-400"; cellBg = "bg-rose-500/10"; }
                  else if (tipo === "mestruazione" || tipo === "inizio_ciclo") { dotColor = "bg-rose-500"; cellBg = "bg-rose-500/15"; }
                  else if (tipo === "fine_ciclo") { dotColor = "bg-emerald-500"; cellBg = "bg-emerald-500/10"; }
                  else if (tipo === "spotting") { dotColor = "bg-orange-400"; cellBg = "bg-orange-400/10"; }
                  else if (isOvulationPred) { cellBg = "bg-amber-500/15"; dotColor = "bg-amber-500"; dotStyle = "ring-1 ring-amber-400"; }
                  else if (isHighPregnancy) { cellBg = "bg-pink-500/10"; dotColor = "bg-pink-500/70"; }
                  else if (isPeriodPred) { cellBg = "bg-rose-500/5"; dotColor = "bg-rose-400/40"; dotStyle = "border border-dashed border-rose-400"; }
                  else if (isFertilePred) { cellBg = "bg-emerald-500/8"; dotColor = "bg-emerald-400/50"; }

                  const phaseStripe = !entry && !isPeriodPred && !isFertilePred && !isOvulationPred && !isHighPregnancy && phase
                    ? `border-b-2 ${CYCLE_PHASES[phase].borderColor.replace("border-", "border-b-")}`
                    : "";

                  return (
                    <button
                      key={g}
                      onClick={() => { setSelectedDate(key); setShowAddModal(true); }}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs transition-all relative ${cellBg} ${phaseStripe} ${
                        isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-card font-black" : "font-medium"
                      }`}
                    >
                      <span className={isToday ? "text-primary" : "text-foreground"}>{g}</span>
                      {dotColor && (
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${dotStyle} absolute bottom-1`} />
                      )}
                      {/* Lunar phase icon */}
                      {showLunar && (
                        <span className="absolute top-0 left-0.5 text-[7px] opacity-60">{lunar.icon}</span>
                      )}
                      {/* High pregnancy indicator */}
                      {isHighPregnancy && !isActiveCycleDay && !isCompletedCycleDay && (
                        <span className="absolute top-0 right-0.5 text-[7px]">🤰</span>
                      )}
                      {/* Mood emoji */}
                      {entry && getMood(entry) && !isHighPregnancy && (
                        <span className="absolute top-0 right-0.5 text-[8px]">
                          {MOOD_OPTIONS.find(m => m.id === getMood(entry))?.icon}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="px-4 py-3 border-t border-border">
              <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Ciclo
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-amber-500 ring-1 ring-amber-400" /> Ovulazione
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-pink-500/70" /> 🤰 Alta probabilità
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-emerald-400/50" /> Fertile
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-rose-400/40 border border-dashed border-rose-400" /> Previsione
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="text-[8px]">🌕</span> Fase lunare
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Diary Tab */}
      {activeTab === "diario" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {entries.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <span className="text-4xl block mb-3">📖</span>
              <p className="text-sm font-bold">Il tuo diario è vuoto</p>
              <p className="text-xs mt-1">Tocca un giorno nel calendario per iniziare</p>
            </div>
          ) : (
            entries
              .sort((a, b) => b.data.localeCompare(a.data))
              .slice(0, 15)
              .map(entry => {
                const tipo = TIPO_OPTIONS.find(t => t.id === entry.tipo);
                const mood = getMood(entry);
                const moodInfo = MOOD_OPTIONS.find(m => m.id === mood);
                const symptoms = getSymptoms(entry);
                const phase = getPhaseForDate(entry.data);
                const phaseInfo = phase ? CYCLE_PHASES[phase] : null;

                return (
                  <motion.div
                    key={entry.id || entry.data}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl border border-border p-4 space-y-2.5"
                  >
                    {/* Date & Type row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{tipo?.icon || "📅"}</span>
                        <div>
                          <p className="text-sm font-bold text-foreground">{formatDateNice(entry.data)}</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold ${tipo?.textColor || "text-foreground"}`}>{tipo?.label || entry.tipo}</span>
                            {phaseInfo && (
                              <span className={`text-[9px] font-bold ${phaseInfo.textColor} bg-muted/50 px-1.5 py-0.5 rounded-full`}>
                                {phaseInfo.icon} {phaseInfo.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {moodInfo && (
                          <span className="text-xl" title={moodInfo.label}>{moodInfo.icon}</span>
                        )}
                        {entry.id && (
                          <button onClick={() => onDeleteEntry(entry.id!)} className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Symptoms */}
                    {symptoms.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {symptoms.map(s => {
                          const sint = SINTOMI_OPTIONS.find(so => so.id === s);
                          return sint ? (
                            <span key={s} className="text-[10px] bg-muted px-2 py-1 rounded-full border border-border">
                              {sint.icon} {sint.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}

                    {/* Note */}
                    {entry.note && (
                      <p className="text-xs text-muted-foreground italic pl-1">"{entry.note}"</p>
                    )}
                  </motion.div>
                );
              })
          )}
        </motion.div>
      )}

      {/* Quick add button (FAB) */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => { setSelectedDate(todayKey); setShowAddModal(true); }}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-pink-500 text-white shadow-lg shadow-pink-500/30 flex items-center justify-center z-40"
      >
        <span className="text-2xl">+</span>
      </motion.button>

      {/* Add Entry Modal */}
      <AnimatePresence>
        {showAddModal && selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => { setShowAddModal(false); resetForm(); }}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-card rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl p-5 max-w-sm w-full space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{formatDateNice(selectedDate)}</h3>
                  <p className="text-xs text-muted-foreground">Come stai oggi?</p>
                </div>
                <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-muted-foreground p-2 rounded-full hover:bg-muted transition"><X size={20} /></button>
              </div>

              {/* Existing entry */}
              {entryMap[selectedDate] && (
                <div className={`${TIPO_OPTIONS.find(t => t.id === entryMap[selectedDate].tipo)?.lightBg || "bg-muted"} rounded-xl p-3`}>
                  <p className="text-sm font-bold text-foreground">
                    {TIPO_OPTIONS.find(t => t.id === entryMap[selectedDate].tipo)?.icon} Già registrato
                  </p>
                  {entryMap[selectedDate].id && (
                    <button onClick={async () => { await onDeleteEntry(entryMap[selectedDate].id!); setShowAddModal(false); resetForm(); }} className="text-xs text-destructive font-bold mt-2 hover:underline">
                      Rimuovi registro
                    </button>
                  )}
                </div>
              )}

              {/* Type */}
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block tracking-wider">Tipo</label>
                <div className="flex gap-2">
                  {TIPO_OPTIONS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setNewTipo(t.id)}
                      className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold text-center transition-all ${
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

              {/* Mood */}
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block tracking-wider">Umore</label>
                <div className="grid grid-cols-4 gap-2">
                  {MOOD_OPTIONS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setNewMood(prev => prev === m.id ? "" : m.id)}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-center transition-all ${
                        newMood === m.id
                          ? "bg-primary/10 border-2 border-primary/30 scale-105"
                          : "bg-muted/30 border-2 border-transparent hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-xl">{m.icon}</span>
                      <span className="text-[9px] font-bold text-muted-foreground">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block tracking-wider">Sintomi</label>
                <div className="flex flex-wrap gap-1.5">
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

              {/* Note */}
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block tracking-wider">Note personali</label>
                <textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-sm resize-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  rows={2}
                  placeholder="Come ti senti oggi..."
                />
              </div>

              <button
                onClick={handleAddEntry}
                className="w-full py-3.5 rounded-xl bg-pink-500 text-white font-bold text-sm shadow-lg shadow-pink-500/20 active:scale-[0.98] transition"
              >
                📝 Salva nel Diario
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
  const giorni = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
  const mesi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
  return `${giorni[d.getDay()]} ${d.getDate()} ${mesi[d.getMonth()]}`;
}
