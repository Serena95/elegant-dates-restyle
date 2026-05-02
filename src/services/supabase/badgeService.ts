import { supabase } from "@/integrations/supabase/client";

export async function syncBadges(
  userId: string,
  unlockedBadgeIds: string[],
  stats?: { totalWorkouts: number; currentStreak: number; longestStreak: number }
) {
  // Badges are now granted server-side via edge function which validates eligibility.
  // Direct INSERT from clients is blocked by RLS.
  try {
    const { data, error } = await supabase.functions.invoke("grant-badges", {
      body: {
        stats: stats ?? {},
        requestedBadgeIds: unlockedBadgeIds,
      },
    });
    if (error) throw error;
    return (data?.granted as string[]) ?? [];
  } catch (e) {
    console.error("syncBadges error:", e);
    return [];
  }
}

export async function fetchUserBadges(userId: string) {
  const { data } = await supabase
    .from("user_badges")
    .select("badge_id, created_at")
    .eq("user_id", userId);
  return data || [];
}

export async function fetchAllBadges() {
  const { data } = await supabase.from("badges").select("*");
  return data || [];
}
