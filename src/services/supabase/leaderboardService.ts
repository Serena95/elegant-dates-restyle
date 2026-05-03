import { supabase } from "@/integrations/supabase/client";

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}

export async function updateLeaderboard(_userId: string, xpGained: number) {
  // Server-side increment via SECURITY DEFINER RPC. The client cannot set
  // arbitrary XP/rank values anymore (validated server-side, capped at 1000).
  await supabase.rpc("increment_leaderboard", { p_xp_gained: xpGained });
}

export interface LeaderboardEntry {
  user_id: string;
  xp_week: number;
  workouts_week: number;
  rank: number;
  display_name: string;
  avatar_url: string | null;
  level: number;
}

export async function fetchWeeklyLeaderboard(): Promise<LeaderboardEntry[]> {
  const weekStart = getWeekStart();

  const { data } = await supabase
    .from("leaderboard")
    .select("*")
    .eq("week_start", weekStart)
    .order("xp_week", { ascending: false })
    .limit(10);

  if (!data || data.length === 0) return [];

  const userIds = data.map(e => e.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, display_name, avatar_url, level")
    .in("user_id", userIds);

  const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

  return data.map((e, i) => ({
    user_id: e.user_id,
    xp_week: e.xp_week,
    workouts_week: e.workouts_week,
    rank: i + 1,
    display_name: profileMap.get(e.user_id)?.display_name || "Utente",
    avatar_url: profileMap.get(e.user_id)?.avatar_url || null,
    level: profileMap.get(e.user_id)?.level || 1,
  }));
}
