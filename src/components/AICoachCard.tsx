import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, Heart, RefreshCw, Dumbbell, Wind, CloudOff, Moon, PartyPopper, Coffee } from "lucide-react";
import { WorkoutSuggestion, RecoveryAdvice, generateCompleteCoachData, AICoachContext } from "@/services/aiCoach";
import { StreakData, getStreakLevel } from "@/services/streakService";
import { ProgressData } from "@/services/progressEngine";
import { ATTREZZO_ICONS } from "@/data/exercise-types";

interface AICoachCardProps {
  context: AICoachContext;
  streak: StreakData;
  progress: ProgressData;
  onStartSuggested?: () => void;
}

export function AICoachCard({ context, streak, progress, onStartSuggested }: AICoachCardProps) {
  const [suggestion, setSuggestion] = useState<WorkoutSuggestion | null>(null);
  const [motivation, setMotivation] = useState<string>("");
  const [recovery, setRecovery] = useState<RecoveryAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<"coach" | "recovery">("coach");

  const streakLevel = getStreakLevel(streak.currentStreak);
  const isRestDay = context.isRestDay;
  const isCompleted = context.isAlreadyCompleted;
  const needsRecovery = isRestDay || isCompleted || streak.currentStreak >= 5 || progress.recentIntensity === "alta" || context.cyclePhase === "mestruale";

  const loadSuggestions = async (forceRefresh = false) => {
    setLoading(true);
    setError(false);
    try {
      const result = await generateCompleteCoachData({
        ...context,
        totalWorkouts: progress.totalWorkouts,
        recentIntensity: progress.recentIntensity,
      }, forceRefresh);
      setSuggestion(result.suggestion);
      setMotivation(result.motivation);
      if (result.recovery) setRecovery(result.recovery);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const recoveryIcon = recovery?.tipo === "stretch" ? "🧘" : recovery?.tipo === "riposo" ? "😴" : "🔄";
  const todayIcon = context.todayEquipment ? (ATTREZZO_ICONS[context.todayEquipment] || "🏋️") : "🧘";

  // Status badge
  const statusBadge = isCompleted
    ? { icon: <PartyPopper size={12} />, label: "Completato!", className: "bg-green-500/15 text-green-600 dark:text-green-400" }
    : isRestDay
    ? { icon: <Coffee size={12} />, label: "Giorno di riposo", className: "bg-blue-500/15 text-blue-600 dark:text-blue-400" }
    : { icon: <Dumbbell size={12} />, label: context.todayEquipment || "Allenamento", className: "bg-primary/15 text-primary" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="space-y-3"
    >
      {/* Streak Banner */}
      {streak.currentStreak > 0 && (
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{streakLevel.emoji}</span>
            <div>
              <p className="text-sm font-bold text-foreground">
                🔥 Streak: {streak.currentStreak} giorni
              </p>
              <p className="text-xs text-muted-foreground">
                {streakLevel.label} • Record: {streak.longestStreak}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Motivation */}
      {motivation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-4 border border-border"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="text-primary" />
            </div>
            <p className="text-sm text-foreground leading-relaxed">{motivation}</p>
          </div>
        </motion.div>
      )}

      {/* AI Coach Card */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("coach")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 transition ${
              activeTab === "coach" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            }`}
          >
            <Bot size={14} /> {isRestDay ? "Riposo" : "AI Coach"}
          </button>
          {needsRecovery && (
            <button
              onClick={() => setActiveTab("recovery")}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 transition ${
                activeTab === "recovery" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
              }`}
            >
              <Heart size={14} /> Recupero
            </button>
          )}
        </div>

        <div className="p-4">
          <AnimatePresence mode="wait">
            {activeTab === "coach" && (
              <motion.div
                key="coach"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-3"
              >
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-2">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                    <p className="text-xs text-muted-foreground">
                      {isRestDay ? "Preparo il tuo piano di riposo..." : "Il coach analizza il tuo piano..."}
                    </p>
                  </div>
                ) : error || !suggestion ? (
                  <div className="flex flex-col items-center text-center py-5 gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <CloudOff size={20} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Coach momentaneamente offline</p>
                      <p className="text-xs text-muted-foreground mt-1">Nessun problema! Puoi iniziare un allenamento libero oppure riprovare tra poco.</p>
                    </div>
                    <button
                      onClick={() => loadSuggestions(true)}
                      className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition flex items-center gap-1.5"
                    >
                      <RefreshCw size={14} /> Riprova
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Status badge */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${statusBadge.className}`}>
                      {statusBadge.icon}
                      {statusBadge.label}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{todayIcon}</span>
                        <p className="text-xs font-bold uppercase text-primary tracking-wide">
                          {isRestDay ? "Consiglio per oggi" : isCompleted ? "Ben fatto!" : "Piano di oggi"}
                        </p>
                      </div>
                      <p className="text-lg font-black text-foreground">{suggestion.titolo}</p>
                      <p className="text-sm text-muted-foreground mt-1">{suggestion.descrizione}</p>
                      <p className="text-xs text-primary font-semibold mt-2">
                        {isRestDay ? "🌿 " : "🎯 Focus: "}{suggestion.focus}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!isRestDay && !isCompleted && onStartSuggested && (
                        <button
                          onClick={onStartSuggested}
                          className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:opacity-90 transition flex items-center justify-center gap-2"
                        >
                          <Dumbbell size={16} /> Inizia {context.todayEquipment || "Allenamento"}
                        </button>
                      )}
                      {isRestDay && (
                        <div className="flex-1 py-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-sm text-center flex items-center justify-center gap-2">
                          <Moon size={16} /> Goditi il riposo 💆
                        </div>
                      )}
                      {isCompleted && (
                        <div className="flex-1 py-2.5 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-sm text-center flex items-center justify-center gap-2">
                          <PartyPopper size={16} /> Allenamento completato! 🎉
                        </div>
                      )}
                      <button
                        onClick={() => loadSuggestions(true)}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm hover:bg-muted transition"
                      >
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {activeTab === "recovery" && recovery && (
              <motion.div
                key="recovery"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{recoveryIcon}</span>
                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground tracking-wide mb-1">
                      <Wind size={12} className="inline mr-1" />
                      Consiglio Recupero
                    </p>
                    <p className="text-sm text-foreground">{recovery.consiglio}</p>
                    <span className="inline-block mt-2 text-[10px] font-bold uppercase bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                      {recovery.tipo}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
