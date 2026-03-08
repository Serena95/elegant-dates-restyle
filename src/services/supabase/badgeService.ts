import { supabase } from "@/integrations/supabase/client";

export async function syncBadges(userId: string, unlockedBadgeIds: string[]) {
  // Get already stored badges
  const { data: existing } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId);

  const existingIds = new Set(existing?.map(b => b.badge_id) || []);
  const newBadges = unlockedBadgeIds.filter(id => !existingIds.has(id));

  if (newBadges.length > 0) {
    await supabase.from("user_badges").insert(
      newBadges.map(badge_id => ({ user_id: userId, badge_id }))
    );
  }

  return newBadges;
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
