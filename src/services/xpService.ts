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

export async function addWorkoutXP(_userId: string, streak: number): Promise<{ xpGained: number; newXp: number; newLevel: number; leveledUp: boolean }> {
  // XP is computed and persisted server-side via SECURITY DEFINER RPC.
  // The client cannot set arbitrary xp/level values anymore.
  const { data, error } = await supabase.rpc("add_workout_xp", { p_streak: streak });
  if (error || !data || (Array.isArray(data) && data.length === 0)) {
    return { xpGained: 0, newXp: 0, newLevel: 1, leveledUp: false };
  }
  const row: any = Array.isArray(data) ? data[0] : data;
  return {
    xpGained: row.xp_gained ?? 0,
    newXp: row.new_xp ?? 0,
    newLevel: row.new_level ?? 1,
    leveledUp: !!row.leveled_up,
  };
}
