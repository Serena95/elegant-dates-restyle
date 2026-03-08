import { useEffect, useState } from "react";
import { Trophy, Clock, Dumbbell, Flame, Star, Share2, Zap, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, BADGE_DEFINITIONS } from "@/hooks/useBadges";
import { Button } from "@/components/ui/button";
import { getLevelInfo, LEVELS } from "@/services/xpService";
import { toast } from "sonner";
import { healthService } from "@/services/healthService";

interface WorkoutCompleteProps {
  esercizi: number;
  tempoTotale: number;
  attrezzo: string;
  newBadges: Badge[];
  onClose: () => void;
  xpGained?: number;
  newXp?: number;
  leveledUp?: boolean;
  onShare?: () => void;
}

export function WorkoutComplete({ esercizi, tempoTotale, attrezzo, newBadges, onClose, xpGained, newXp, leveledUp, onShare }: WorkoutCompleteProps) {
  const [showBadges, setShowBadges] = useState(false);
  const [showXp, setShowXp] = useState(false);
  const [healthSynced, setHealthSynced] = useState<boolean | null>(null);
  const calorie = Math.round(esercizi * 12 + tempoTotale * 0.08);
  const minuti = Math.floor(tempoTotale / 60);
  const levelInfo = newXp ? getLevelInfo(newXp) : null;

  useEffect(() => {
    if (newBadges.length > 0) {
      const t = setTimeout(() => setShowBadges(true), 1500);
      return () => clearTimeout(t);
    }
  }, [newBadges]);

  useEffect(() => {
    if (xpGained) {
      const t = setTimeout(() => setShowXp(true), 800);
      return () => clearTimeout(t);
    }
  }, [xpGained]);

  // Auto-sync workout to Google Fit / Apple Health
  useEffect(() => {
    if (healthService.isAvailable() && healthService.isConnected() && minuti > 0) {
      healthService.writeWorkout(minuti, calorie).then((success) => {
        setHealthSynced(success);
        if (success) {
          toast.success(
            healthService.getPlatform() === "ios"
              ? "Allenamento salvato su Apple Health! 🍎"
              : "Allenamento salvato su Google Fit! 💚"
          );
        }
      });
    }
  }, []);

  const handleShare = () => {
    const text = `Ho completato il mio allenamento ${attrezzo} oggi! 💪 ${minuti} minuti, ${esercizi} esercizi, ~${calorie} kcal bruciati!`;
    if (navigator.share) {
      navigator.share({ title: "Allenamento Completato!", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Testo copiato! Condividilo dove vuoi 📋");
    }
    onShare?.();
  };

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

        {/* Health Sync indicator */}
        {healthSynced && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <Activity size={14} className="text-emerald-500" />
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {healthService.getPlatform() === "ios" ? "Salvato su Apple Health" : "Salvato su Google Fit"}
            </p>
          </motion.div>
        )}

        {/* XP Gained */}
        <AnimatePresence>
          {showXp && xpGained && levelInfo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="space-y-2 overflow-hidden"
            >
              <div className="flex items-center justify-center gap-2">
                <Zap size={16} className="text-amber-500" />
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400">+{xpGained} XP</p>
              </div>
              <div className="bg-muted/50 rounded-xl px-4 py-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>{levelInfo.current.icon} Lv.{levelInfo.current.level} {levelInfo.current.name}</span>
                  {levelInfo.next && <span className="text-muted-foreground">{levelInfo.next.icon} Lv.{levelInfo.next.level}</span>}
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${levelInfo.progressToNext * 100}%` }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {newXp} / {levelInfo.next?.minXp || "MAX"} XP
                </p>
              </div>
              {leveledUp && (
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-sm font-bold text-primary"
                >
                  🎉 Level Up! Sei ora {levelInfo.current.icon} {levelInfo.current.name}!
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1" /> Condividi
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Dashboard
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
