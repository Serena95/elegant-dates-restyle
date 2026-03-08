import { supabase } from "@/integrations/supabase/client";

export const XP_PER_WORKOUT = 50;
export const XP_STREAK_BONUS = 10; // per day of streak

export const LEVELS = [
  { level: 1, name: "Beginner", minXp: 0, icon: "🌱" },
  { level: 2, name: "Active", minXp: 200, icon: "💪" },
  { level: 3, name: "Strong", minXp: 600, icon: "🔥" },
  { level: 4, name: "Athlete", minXp: 1500, icon: "⚡" },
  { level: 5, name: "Elite", minXp: 3000, icon: "👑" },
];

export function getLevelInfo(xp: number) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
      break;
    }
  }
  const progressToNext = next
    ? (xp - current.minXp) / (next.minXp - current.minXp)
    : 1;
  return { current, next, progressToNext, xp };
}

export async function addWorkoutXP(userId: string, streak: number): Promise<{ xpGained: number; newXp: number; newLevel: number; leveledUp: boolean }> {
  const xpGained = XP_PER_WORKOUT + (streak * XP_STREAK_BONUS);

  const { data: profile } = await supabase
    .from("profiles")
    .select("xp, level")
    .eq("user_id", userId)
    .single();

  const oldXp = profile?.xp || 0;
  const oldLevel = profile?.level || 1;
  const newXp = oldXp + xpGained;
  const levelInfo = getLevelInfo(newXp);
  const newLevel = levelInfo.current.level;

  await supabase
    .from("profiles")
    .update({ xp: newXp, level: newLevel })
    .eq("user_id", userId);

  return {
    xpGained,
    newXp,
    newLevel,
    leveledUp: newLevel > oldLevel,
  };
}
