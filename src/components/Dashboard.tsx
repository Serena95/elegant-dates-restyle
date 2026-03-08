import { DayCard } from "./DayCard";
import { WeekPlan, CONFIG_LIVELLI, ATTREZZO_ICONS, FocusInfo, formatDateLabel } from "@/data/exercises";
import { CalendarDays, BarChart3, Flame, Dumbbell, Target } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardProps {
  piano: WeekPlan;
  livello: string;
  onAvviaAllenamento: (giorno: string) => void;
  onChangeLivello: (l: string) => void;
  userName?: string;
  weeklyStats?: { completed: number; total: number; streak: number };
  onNavigate?: (view: string) => void;
  focusMap?: Record<string, FocusInfo>;
}

export function Dashboard({
  piano, livello, onAvviaAllenamento, onChangeLivello,
  userName, weeklyStats, onNavigate, focusMap,
}: DashboardProps) {
  const badgeColor = livello === "BASSO" ? "bg-pilates-green" : livello === "MEDIO" ? "bg-primary" : "bg-pilates-red";
  
  // Sort piano keys by date
  const sortedDays = Object.keys(piano).sort();
  
  // Find today's workout
  const oggi = new Date().toISOString().split("T")[0];
  const todayKey = sortedDays.find(k => k === oggi);
  const todayWorkout = todayKey && piano[todayKey] ? { key: todayKey, ...piano[todayKey] } : null;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buongiorno";
    if (h < 18) return "Buon pomeriggio";
    return "Buonasera";
  };

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-black text-foreground">
          {greeting()}{userName ? `, ${userName}` : ""} 👋
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">Pronta per allenarti oggi?</p>
      </motion.div>

      {/* Today's workout card */}
      {todayWorkout && todayWorkout.round < (CONFIG_LIVELLI[livello]?.round || 3) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-5 border border-primary/20 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-primary tracking-wide">Allenamento di Oggi</p>
              <p className="text-lg font-black text-foreground mt-1">
                {ATTREZZO_ICONS[todayWorkout.attrezzo] || "🏋️"} {todayWorkout.attrezzo}
              </p>
              {focusMap?.[todayWorkout.key] && (
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Target size={12} className="text-primary" />
                  Focus: <span className="font-semibold text-foreground">{focusMap[todayWorkout.key].icon} {focusMap[todayWorkout.key].label}</span>
                </p>
              )}
            </div>
            <div className="text-right">
              <span className={`${badgeColor} text-primary-foreground px-3 py-1 rounded-full text-xs font-bold`}>
                {livello}
              </span>
            </div>
          </div>
          <button
            onClick={() => onAvviaAllenamento(todayWorkout.key)}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-md hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <Dumbbell size={18} /> Inizia Allenamento
          </button>
        </motion.div>
      )}

      {/* Weekly stats cards */}
      {weeklyStats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3"
        >
          <button
            onClick={() => onNavigate?.("calendar")}
            className="bg-card rounded-2xl border border-border p-4 text-center hover:shadow-md transition"
          >
            <CalendarDays size={20} className="text-primary mx-auto mb-1" />
            <p className="text-xl font-black text-foreground">{weeklyStats.completed}/{weeklyStats.total}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase">Questa sett.</p>
          </button>
          <button
            onClick={() => onNavigate?.("progress")}
            className="bg-card rounded-2xl border border-border p-4 text-center hover:shadow-md transition"
          >
            <BarChart3 size={20} className="text-primary mx-auto mb-1" />
            <p className="text-xl font-black text-foreground">{weeklyStats.streak}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase">🔥 Serie</p>
          </button>
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <Flame size={20} className="text-pilates-amber mx-auto mb-1" />
            <p className="text-xl font-black text-foreground">{weeklyStats.completed * 150}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase">Kcal sett.</p>
          </div>
        </motion.div>
      )}

      {/* Level selector */}
      <div className="bg-card rounded-2xl p-4 border border-border">
        <label className="font-bold text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2 mb-2">
          Livello:
          <span className={`${badgeColor} text-primary-foreground px-3 py-0.5 rounded-full text-[10px]`}>{livello}</span>
        </label>
        <select
          value={livello}
          onChange={e => onChangeLivello(e.target.value)}
          className="w-full p-3 rounded-xl border border-border bg-background text-foreground font-bold text-sm"
        >
          <option value="BASSO">BASSO (2 Round - Leggero)</option>
          <option value="MEDIO">MEDIO (3 Round - Standard)</option>
          <option value="AVANZATO">AVANZATO (4 Round - Intenso)</option>
        </select>
      </div>

      {/* Day Cards */}
      <div className="space-y-3">
        {sortedDays.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Il piano della settimana verrà generato automaticamente...</p>
        ) : (
          sortedDays.map((dateKey, i) => (
            <DayCard
              key={dateKey}
              giorno={dateKey}
              label={formatDateLabel(dateKey)}
              dati={piano[dateKey]}
              livello={livello}
              index={i}
              focus={focusMap?.[dateKey]}
              isToday={dateKey === oggi}
              onClick={() => onAvviaAllenamento(dateKey)}
            />
          ))
        )}
      </div>
    </div>
  );
}
