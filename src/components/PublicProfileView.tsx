import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Zap, BarChart3, Award, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { getLevelInfo, LEVELS } from "@/services/xpService";
import { Progress } from "@/components/ui/progress";
import { fetchUserBadges, fetchAllBadges } from "@/services/supabase/badgeService";

interface PublicProfileViewProps {
  userId: string;
  onBack: () => void;
}

export function PublicProfileView({ userId, onBack }: PublicProfileViewProps) {
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("public_profiles" as any).select("user_id, display_name, avatar_url, xp, level").eq("user_id", userId).single(),
      fetchUserBadges(userId),
      fetchAllBadges(),
      supabase.from("workout_history").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("completato", true),
    ]).then(([profileRes, userBadges, allBadgesData, workoutRes]) => {
      setProfile(profileRes.data);
      setBadges(userBadges);
      setAllBadges(allBadgesData);
      setWorkoutCount(workoutRes.count || 0);
      setLoading(false);
    });
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Profilo non trovato</p>
        <Button variant="ghost" onClick={onBack} className="mt-4">Indietro</Button>
      </div>
    );
  }

  const levelInfo = getLevelInfo(profile.xp || 0);
  const badgeIds = new Set(badges.map(b => b.badge_id));

  return (
    <div className="space-y-6 pb-8">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
        <ArrowLeft size={16} /> Indietro
      </Button>

      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center border-4 border-primary/20">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User size={36} className="text-muted-foreground" />
          )}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">{profile.display_name || "Utente"}</h2>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <span className="text-lg">{levelInfo.current.icon}</span>
            Lv.{levelInfo.current.level} {levelInfo.current.name}
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Zap size={18} className="text-amber-500 mx-auto mb-1" />
            <p className="text-lg font-black text-foreground">{profile.xp || 0}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase">XP</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <BarChart3 size={18} className="text-primary mx-auto mb-1" />
            <p className="text-lg font-black text-foreground">{workoutCount}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase">Allenamenti</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Award size={18} className="text-emerald-500 mx-auto mb-1" />
            <p className="text-lg font-black text-foreground">{badges.length}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase">Badge</p>
          </CardContent>
        </Card>
      </div>

      {/* XP Progress */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-foreground">Progresso XP</span>
            <span className="text-muted-foreground text-xs">
              {profile.xp || 0} / {levelInfo.next?.minXp || "MAX"} XP
            </span>
          </div>
          <Progress value={levelInfo.progressToNext * 100} className="h-2" />
          <div className="flex gap-1.5 justify-center">
            {LEVELS.map(l => (
              <div
                key={l.level}
                className={`text-center px-2 py-1 rounded-lg text-[10px] ${l.level <= levelInfo.current.level ? "bg-primary/10 font-bold" : "bg-muted/50 text-muted-foreground"}`}
              >
                <span className="text-sm">{l.icon}</span>
                <p>{l.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      {allBadges.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wide">🏅 Badge</h3>
          <div className="grid grid-cols-3 gap-3">
            {allBadges.map((def, i) => {
              const unlocked = badgeIds.has(def.id);
              return (
                <motion.div
                  key={def.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl border p-3 text-center transition-all ${
                    unlocked
                      ? "bg-amber-500/10 border-amber-500/30 shadow-sm"
                      : "bg-muted/30 border-border opacity-40 grayscale"
                  }`}
                >
                  <span className="text-3xl block">{def.icon}</span>
                  <p className="text-[11px] font-bold text-foreground mt-1.5">{def.name}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{def.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
