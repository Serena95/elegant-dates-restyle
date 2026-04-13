import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Check, Lock, Crown, Dumbbell, Play } from "lucide-react";
import { DayPlan, CONFIG_LIVELLI, ATTREZZO_ICONS, FocusInfo, Exercise } from "@/data/exercises";

interface DayCardProps {
  giorno: string;
  label: string;
  dati: DayPlan;
  livello: string;
  index: number;
  focus?: FocusInfo;
  isToday?: boolean;
  onClick: () => void;
  locked?: boolean;
  exercises?: Exercise[];
}

const DEFAULT_GRADIENT = { from: "from-blue-500/10", to: "to-indigo-500/10", border: "border-blue-200 dark:border-blue-800", accent: "bg-blue-500" };
const TODAY_GRADIENT = { from: "from-primary/15", to: "to-secondary/15", border: "border-primary/30", accent: "bg-primary" };

export const DayCard = React.forwardRef<HTMLDivElement, DayCardProps>(function DayCard({ giorno, label, dati, livello, index, focus, isToday, onClick, locked, exercises }, ref) {
  const [expanded, setExpanded] = useState(false);
  const maxRound = CONFIG_LIVELLI[livello].round;
  const roundFatti = dati.round || 0;
  const isCompleted = roundFatti >= maxRound;
  const progress = maxRound > 0 ? (roundFatti / maxRound) * 100 : 0;

  const attrezzo = dati.attrezzo || "Corpo Libero";
  const temaIcon = ATTREZZO_ICONS[attrezzo] || "🏋️";
  const gradient = isToday ? TODAY_GRADIENT : DEFAULT_GRADIENT;

  const dayNum = new Date(giorno + "T00:00:00").getDate();

  const handleCardClick = () => {
    if (locked) return;
    setExpanded(prev => !prev);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`relative ${locked ? "opacity-60" : ""} rounded-2xl border-2 ${gradient.border} bg-gradient-to-br ${gradient.from} ${gradient.to} transition-shadow ${locked ? "" : "hover:shadow-xl hover:shadow-primary/10"} overflow-hidden group`}
    >
      {/* Progress bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted/50 overflow-hidden rounded-t-2xl">
        <motion.div
          className={`h-full ${isCompleted ? "bg-pilates-green" : "bg-primary"}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
        />
      </div>

      {/* Header - clickable to expand */}
      <div
        className={`p-5 ${locked ? "" : "cursor-pointer"}`}
        onClick={handleCardClick}
      >
        <div className="flex items-center gap-4">
          {/* Day Number Circle */}
          <div className="relative flex-shrink-0">
            <div className={`w-16 h-16 rounded-2xl ${gradient.accent} flex items-center justify-center shadow-lg`}>
              <span className="text-2xl font-black text-white">{dayNum}</span>
            </div>
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-pilates-green flex items-center justify-center shadow-md"
              >
                <Check size={14} className="text-white" strokeWidth={3} />
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-foreground">{label}</h3>
              {isToday && (
                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase">
                  Oggi
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">{temaIcon}</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold uppercase tracking-wide">
                {attrezzo}
              </span>
              {locked && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                  <Crown size={10} /> PLUS
                </span>
              )}
            </div>

            {focus && (
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">{focus.icon}</span>
                <span className="text-xs font-semibold text-muted-foreground">Focus: <span className="text-foreground">{focus.label}</span></span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold ${isCompleted ? "text-pilates-green" : "text-muted-foreground"}`}>
                {roundFatti}/{maxRound} Round
              </span>
            </div>
          </div>

          {/* Chevron or Lock */}
          {locked ? (
            <Lock size={20} className="text-amber-500 flex-shrink-0" />
          ) : (
            <motion.div
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              <ChevronRight size={24} className="text-primary" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Expanded exercises preview */}
      <AnimatePresence>
        {expanded && !locked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-3">
              <div className="h-px bg-border" />

              {exercises && exercises.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <Dumbbell size={10} />
                    {exercises.length} Esercizi previsti
                  </p>
                  <div className="grid gap-1.5">
                    {exercises.map((ex, idx) => (
                      <div
                        key={ex.id || idx}
                        className="flex items-center gap-3 rounded-xl bg-background/60 px-3 py-2"
                      >
                        <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{ex.nome}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{ex.categoria} • {ex.muscoli?.slice(0, 2).join(", ")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Gli esercizi verranno generati all'avvio
                </p>
              )}

              {/* Start button */}
              <button
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <Play size={16} />
                {isCompleted ? "Ripeti Allenamento" : "Inizia Allenamento"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative corner */}
      <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
    </motion.div>
  );
});
