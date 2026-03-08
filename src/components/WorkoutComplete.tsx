import { useEffect, useState } from "react";
import { Trophy, Clock, Dumbbell, Flame, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, BADGE_DEFINITIONS } from "@/hooks/useBadges";

interface WorkoutCompleteProps {
  esercizi: number;
  tempoTotale: number; // seconds
  attrezzo: string;
  newBadges: Badge[];
  onClose: () => void;
}

export function WorkoutComplete({ esercizi, tempoTotale, attrezzo, newBadges, onClose }: WorkoutCompleteProps) {
  const [showBadges, setShowBadges] = useState(false);
  const calorie = Math.round(esercizi * 12 + tempoTotale * 0.08);
  const minuti = Math.floor(tempoTotale / 60);

  useEffect(() => {
    if (newBadges.length > 0) {
      const t = setTimeout(() => setShowBadges(true), 1500);
      return () => clearTimeout(t);
    }
  }, [newBadges]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="bg-card rounded-3xl border border-border shadow-2xl p-8 max-w-sm w-full space-y-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className="w-20 h-20 mx-auto rounded-full bg-pilates-green/20 flex items-center justify-center"
        >
          <Trophy size={40} className="text-pilates-green" />
        </motion.div>

        <div>
          <h2 className="text-2xl font-black text-foreground">Allenamento Completato!</h2>
          <p className="text-sm text-muted-foreground mt-1">Ottimo lavoro con {attrezzo} 💪</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/50 rounded-xl p-3 space-y-1">
            <Clock size={18} className="text-primary mx-auto" />
            <p className="text-lg font-black text-foreground">{minuti}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Minuti</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-3 space-y-1">
            <Dumbbell size={18} className="text-primary mx-auto" />
            <p className="text-lg font-black text-foreground">{esercizi}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Esercizi</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-3 space-y-1">
            <Flame size={18} className="text-primary mx-auto" />
            <p className="text-lg font-black text-foreground">{calorie}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Kcal</p>
          </div>
        </div>

        {/* New Badges */}
        <AnimatePresence>
          {showBadges && newBadges.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="space-y-3 overflow-hidden"
            >
              <div className="flex items-center justify-center gap-2">
                <Star size={16} className="text-pilates-amber" />
                <p className="text-sm font-bold text-pilates-amber">Nuovi Badge Sbloccati!</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {newBadges.map(badge => {
                  const def = BADGE_DEFINITIONS.find(b => b.id === badge.id);
                  if (!def) return null;
                  return (
                    <motion.div
                      key={badge.id}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="bg-pilates-amber/10 border border-pilates-amber/30 rounded-xl px-3 py-2 text-center"
                    >
                      <span className="text-2xl">{def.icon}</span>
                      <p className="text-[10px] font-bold text-foreground mt-1">{def.nome}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg hover:opacity-90 transition"
        >
          Torna alla Dashboard
        </button>
      </motion.div>
    </motion.div>
  );
}
