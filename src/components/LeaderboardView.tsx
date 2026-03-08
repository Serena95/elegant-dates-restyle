import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Flame, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { fetchWeeklyLeaderboard, LeaderboardEntry } from "@/services/supabase/leaderboardService";
import { getLevelInfo } from "@/services/xpService";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardViewProps {
  onBack?: () => void;
  onViewProfile?: (userId: string) => void;
}

const RANK_STYLES: Record<number, { bg: string; icon: string }> = {
  1: { bg: "bg-amber-500/10 border-amber-500/30", icon: "🥇" },
  2: { bg: "bg-slate-400/10 border-slate-400/30", icon: "🥈" },
  3: { bg: "bg-orange-600/10 border-orange-600/30", icon: "🥉" },
};

export function LeaderboardView({ onBack, onViewProfile }: LeaderboardViewProps) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyLeaderboard().then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Trophy className="text-amber-500 flex-shrink-0" size={24} />
          <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">Classifica Settimanale</h2>
        </div>
        {onBack && <Button variant="ghost" size="sm" onClick={onBack} className="flex-shrink-0">Indietro</Button>}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-10">
          Nessun dato questa settimana. Allenati per entrare in classifica! 🏆
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => {
            const style = RANK_STYLES[entry.rank] || { bg: "bg-card border-border", icon: `${entry.rank}` };
            const levelInfo = getLevelInfo(0); // We use the stored level
            const isMe = entry.user_id === user?.id;

            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card
                  className={`${style.bg} ${isMe ? "ring-2 ring-primary" : ""} cursor-pointer hover:shadow-md transition`}
                  onClick={() => onViewProfile?.(entry.user_id)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="text-2xl font-black w-10 text-center">
                      {typeof style.icon === "string" && style.icon.length <= 2 ? (
                        <span className="text-muted-foreground">{style.icon}</span>
                      ) : (
                        style.icon
                      )}
                    </div>

                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary overflow-hidden flex-shrink-0">
                      {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        entry.display_name?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {entry.display_name} {isMe && <span className="text-primary text-xs">(Tu)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Lv.{entry.level} • {entry.workouts_week} allenamenti
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-black text-foreground flex items-center gap-1">
                        <Flame size={14} className="text-amber-500" />
                        {entry.xp_week}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">XP</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
