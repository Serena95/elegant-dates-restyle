import { forwardRef } from "react";
import { BADGE_DEFINITIONS, Badge } from "@/hooks/useBadges";
import { motion } from "framer-motion";

interface BadgeDisplayProps {
  unlockedBadges: Badge[];
}

export const BadgeDisplay = forwardRef<HTMLDivElement, BadgeDisplayProps>(function BadgeDisplay({ unlockedBadges }, ref) {
  const unlockedIds = new Set(unlockedBadges.map(b => b.id));

  return (
    <div ref={ref} className="space-y-3">
      <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wide">🏅 I tuoi Badge</h3>
      <div className="grid grid-cols-3 gap-3">
        {BADGE_DEFINITIONS.map((def, i) => {
          const unlocked = unlockedIds.has(def.id);
          return (
            <motion.div
              key={def.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl border p-3 text-center transition-all ${
                unlocked
                  ? "bg-pilates-amber/10 border-pilates-amber/30 shadow-sm"
                  : "bg-muted/30 border-border opacity-40 grayscale"
              }`}
            >
              <span className="text-3xl block">{def.icon}</span>
              <p className="text-[11px] font-bold text-foreground mt-1.5">{def.nome}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{def.descrizione}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});
