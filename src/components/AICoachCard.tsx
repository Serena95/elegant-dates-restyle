import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, Heart, RefreshCw, Dumbbell, Wind } from "lucide-react";
import { WorkoutSuggestion, RecoveryAdvice, generateWorkoutSuggestion, generateMotivationMessage, generateRecoveryAdvice, AICoachContext } from "@/services/aiCoach";
import { StreakData, getStreakLevel } from "@/services/streakService";
import { ProgressData } from "@/services/progressEngine";

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
  const [activeTab, setActiveTab] = useState<"coach" | "recovery">("coach");

  const streakLevel = getStreakLevel(streak.currentStreak);
  const needsRecovery = streak.currentStreak >= 5 || progress.recentIntensity === "alta" || context.cyclePhase === "mestruale";

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const sug = await generateWorkoutSuggestion(context);
      setSuggestion(sug);
      
      await delay(2000); // Wait 2s between calls to avoid rate limit
      
      const mot = await generateMotivationMessage({ streak: context.streak, totalWorkouts: progress.totalWorkouts });
      setMotivation(mot);

      if (needsRecovery) {
        await delay(2000);
        const rec = await generateRecoveryAdvice(context);
        setRecovery(rec);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const recoveryIcon = recovery?.tipo === "stretch" ? "🧘" : recovery?.tipo === "riposo" ? "😴" : "🔄";

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
            <Bot size={14} /> AI Coach
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
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : suggestion ? (
                  <>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Dumbbell size={14} className="text-primary" />
                        <p className="text-xs font-bold uppercase text-primary tracking-wide">Suggerimento AI</p>
                      </div>
                      <p className="text-lg font-black text-foreground">{suggestion.titolo}</p>
                      <p className="text-sm text-muted-foreground mt-1">{suggestion.descrizione}</p>
                      <p className="text-xs text-primary font-semibold mt-2">Focus: {suggestion.focus}</p>
                    </div>
                    <div className="flex gap-2">
                      {onStartSuggested && (
                        <button
                          onClick={onStartSuggested}
                          className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:opacity-90 transition flex items-center justify-center gap-2"
                        >
                          <Dumbbell size={16} /> Inizia
                        </button>
                      )}
                      <button
                        onClick={loadSuggestions}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-sm hover:bg-muted transition"
                      >
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  </>
                ) : null}
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
