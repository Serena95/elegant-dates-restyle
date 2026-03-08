import { motion } from "framer-motion";
import { ChevronRight, Check } from "lucide-react";
import { DayPlan, CONFIG_LIVELLI, TEMA_CONFIG } from "@/data/exercises";

interface DayCardProps {
  giorno: string;
  dati: DayPlan;
  livello: string;
  index: number;
  onClick: () => void;
}

const TEMA_GRADIENTS: Record<string, { from: string; to: string; border: string; accent: string }> = {
  "core_mobilita": { from: "from-sky-500/10", to: "to-cyan-500/10", border: "border-sky-200 dark:border-sky-800", accent: "bg-sky-500" },
  "gambe_glutei": { from: "from-teal-500/10", to: "to-emerald-500/10", border: "border-teal-200 dark:border-teal-800", accent: "bg-teal-500" },
  "full_body_cardio": { from: "from-orange-500/10", to: "to-red-500/10", border: "border-orange-200 dark:border-orange-800", accent: "bg-orange-500" },
};

const DEFAULT_GRADIENT = { from: "from-blue-500/10", to: "to-indigo-500/10", border: "border-blue-200 dark:border-blue-800", accent: "bg-blue-500" };

export function DayCard({ giorno, dati, livello, index, onClick }: DayCardProps) {
  const maxRound = CONFIG_LIVELLI[livello].round;
  const roundFatti = dati.round || 0;
  const isCompleted = roundFatti >= maxRound;
  const progress = maxRound > 0 ? (roundFatti / maxRound) * 100 : 0;

  const tema = dati.tema || "core_mobilita";
  const temaConfig = TEMA_CONFIG[tema];
  const temaLabel = temaConfig?.label || dati.attrezzo || "Allenamento";
  const temaIcon = temaConfig?.icon || "🏋️";
  const gradient = TEMA_GRADIENTS[tema] || DEFAULT_GRADIENT;

  const dayNumbers: Record<string, string> = {
    "Lunedì": "01",
    "Mercoledì": "02",
    "Venerdì": "03",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative cursor-pointer rounded-2xl border-2 ${gradient.border} bg-gradient-to-br ${gradient.from} ${gradient.to} p-5 transition-shadow hover:shadow-xl hover:shadow-primary/10 overflow-hidden group`}
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

      <div className="flex items-center gap-4">
        {/* Day Number Circle */}
        <div className="relative flex-shrink-0">
          <div className={`w-16 h-16 rounded-2xl ${gradient.accent} flex items-center justify-center shadow-lg`}>
            <span className="text-2xl font-black text-white">{dayNumbers[giorno] || "0" + (index + 1)}</span>
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
            <h3 className="text-lg font-bold text-foreground">{giorno}</h3>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{temaIcon}</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold uppercase tracking-wide">
              {temaLabel}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold ${isCompleted ? "text-pilates-green" : "text-muted-foreground"}`}>
              {roundFatti}/{maxRound} Round
            </span>
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight
          size={24}
          className="text-primary flex-shrink-0 group-hover:translate-x-1 transition-transform"
        />
      </div>

      {/* Decorative corner */}
      <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
    </motion.div>
  );
}
