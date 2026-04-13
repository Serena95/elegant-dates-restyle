import React, { useMemo, useState, useEffect } from "react";
import { DayCard } from "./DayCard";
import { ActiveProgramState } from "@/hooks/useActiveProgram";
import { AICoachCard } from "./AICoachCard";
import { WeekPlan, CONFIG_LIVELLI, ATTREZZO_ICONS, FocusInfo, formatDateLabel, getLocalDateKey } from "@/data/exercises";
import { CalendarDays, BarChart3, Flame, Dumbbell, Target, Zap, Utensils, X } from "lucide-react";
import { motion } from "framer-motion";
import { calculateStreak } from "@/services/streakService";
import { computeProgress } from "@/services/progressEngine";
import { AICoachContext } from "@/services/aiCoach";
import { getLevelInfo } from "@/services/xpService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface DashboardProps {
  piano: WeekPlan;
  livello: string;
  onAvviaAllenamento: (giorno: string) => void;
  onChangeLivello: (l: string) => void;
  userName?: string;
  weeklyStats?: { completed: number; total: number; streak: number };
  onNavigate?: (view: string) => void;
  focusMap?: Record<string, FocusInfo>;
  storicoCal?: Record<string, any>;
  giorniAllenamento?: number[];
  attrezzi?: string[];
  cyclePhase?: string;
  pregnancyMode?: boolean;
  pregnancyWeek?: number;
  activeProgram?: ActiveProgramState | null;
  onCancelProgram?: () => void;
  onActivateInDashboard?: () => void;
}

export const Dashboard = React.forwardRef<HTMLDivElement, DashboardProps>(function Dashboard({
  piano, livello, onAvviaAllenamento, onChangeLivello,
  userName, weeklyStats, onNavigate, focusMap,
  storicoCal = {}, giorniAllenamento = [1, 3, 5], attrezzi = [],
  cyclePhase, pregnancyMode, pregnancyWeek,
  activeProgram, onCancelProgram, onActivateInDashboard,
}, ref) {
  const badgeColor = livello === "BASSO" ? "bg-pilates-green" : livello === "MEDIO" ? "bg-primary" : "bg-pilates-red";
  
  // Sort piano keys by date
  const sortedDays = Object.keys(piano).sort();

  // Compute streak & progress for AI Coach
  const streakData = useMemo(() => calculateStreak(storicoCal, giorniAllenamento), [storicoCal, giorniAllenamento]);
  const progressData = useMemo(() => computeProgress(storicoCal, livello), [storicoCal, livello]);

  // Determine today's plan context
  const oggi = getLocalDateKey(new Date());
  const todayKey = sortedDays.find(k => k === oggi);
  const todayWorkout = todayKey && piano[todayKey] ? { key: todayKey, ...piano[todayKey] } : null;
  const isRestDay = !todayWorkout;
  const isAlreadyCompleted = todayWorkout ? (todayWorkout.round >= (CONFIG_LIVELLI[livello]?.round || 3)) : false;
  const todayFocusInfo = todayKey ? focusMap?.[todayKey] : undefined;

  // Saved nutrition plan
  const [savedPlan, setSavedPlan] = useState<{ nome: string; icon: string; id: string; descrizione: string } | null>(() => {
    try { return JSON.parse(localStorage.getItem("activeNutritionPlan") || "null"); } catch { return null; }
  });

  const aiContext = useMemo<AICoachContext>(() => ({
    level: livello,
    equipment: attrezzi,
    streak: streakData.currentStreak,
    lastFocus: progressData.lastFocus,
    mostTrainedThisWeek: progressData.mostTrainedThisWeek,
    totalWorkouts: progressData.totalWorkouts,
    lastWorkoutType: Object.values(storicoCal).filter((v: any) => v?.completato).slice(-1)[0]?.attrezzo,
    recentIntensity: progressData.recentIntensity,
    cyclePhase,
    pregnancyMode,
    pregnancyWeek,
    todayEquipment: todayWorkout?.attrezzo,
    todayFocus: todayFocusInfo?.label,
    todayFocusIcon: todayFocusInfo?.icon,
    isRestDay,
    isAlreadyCompleted,
    nutritionPlan: savedPlan?.nome,
  }), [livello, attrezzi, streakData, progressData, storicoCal, cyclePhase, pregnancyMode, pregnancyWeek, todayWorkout, todayFocusInfo, isRestDay, isAlreadyCompleted, savedPlan]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buongiorno";
    if (h < 18) return "Buon pomeriggio";
    return "Buonasera";
  };

  // Load XP data
  const { user } = useAuth();
  const [xpData, setXpData] = useState<{ xp: number; level: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("xp, level").eq("user_id", user.id).single().then(({ data }) => {
      if (data) setXpData({ xp: data.xp ?? 0, level: data.level ?? 1 });
    });
  }, [user, storicoCal]);

  const levelInfo = xpData ? getLevelInfo(xpData.xp) : null;


  return (
    <div className="space-y-5">
      {/* Greeting + Level */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-foreground">
              {greeting()}{userName ? `, ${userName}` : ""} 👋
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">Pronta per allenarti oggi?</p>
          </div>
          {levelInfo && (
            <div className="text-center">
              <span className="text-2xl">{levelInfo.current.icon}</span>
              <p className="text-[10px] font-bold text-muted-foreground">Lv.{levelInfo.current.level}</p>
            </div>
          )}
        </div>
        {/* XP Bar */}
        {levelInfo && (
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold flex items-center gap-1 text-foreground">
                <Zap size={10} className="text-amber-500" />
                {levelInfo.current.name}
              </span>
              <span className="text-muted-foreground">
                {xpData!.xp} / {levelInfo.next?.minXp || "MAX"} XP
              </span>
            </div>
            <Progress value={levelInfo.progressToNext * 100} className="h-1.5" />
          </div>
        )}
      </motion.div>

      {/* AI Coach Card */}
      <AICoachCard
        context={aiContext}
        streak={streakData}
        progress={progressData}
        onStartSuggested={todayWorkout ? () => onAvviaAllenamento(todayWorkout.key) : undefined}
      />

      {/* Active Program/Challenge Banner */}
      {activeProgram && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-accent/20 to-primary/10 rounded-2xl p-4 border border-primary/20 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-primary tracking-wide">
                {activeProgram.type === "program" ? "📋 Programma Attivo" : "🏆 Challenge Attiva"}
              </p>
              <p className="text-sm font-black text-foreground mt-1">
                {activeProgram.name}
                {activeProgram.type === "program" && activeProgram.week && ` — Sett. ${activeProgram.week}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onActivateInDashboard}
              className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition"
            >
              Vai al {activeProgram.type === "program" ? "Programma" : "Challenge"}
            </button>
            <button
              onClick={onCancelProgram}
              className="py-2 px-3 rounded-xl bg-destructive/10 text-destructive font-bold text-xs hover:bg-destructive/20 transition"
            >
              Annulla
            </button>
          </div>
        </motion.div>
      )}

      {/* Saved Nutrition Plan Banner */}
      {savedPlan && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-4 border border-green-500/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl">{savedPlan.icon}</span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase text-green-600 dark:text-green-400 tracking-wide">Piano Alimentare Attivo</p>
                <p className="text-sm font-black text-foreground truncate">{savedPlan.nome}</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); localStorage.removeItem("activeNutritionPlan"); localStorage.removeItem("activeNutritionPlanFull"); setSavedPlan(null); }}
              className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground"
            >
              <X size={14} />
            </button>
          </div>
          <button
            onClick={() => onNavigate?.("nutrition")}
            className="w-full mt-3 py-2 rounded-xl bg-green-600 dark:bg-green-500 text-primary-foreground font-bold text-xs hover:opacity-90 transition"
          >
            Apri Piano Alimentare
          </button>
        </motion.div>
      )}

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
});
