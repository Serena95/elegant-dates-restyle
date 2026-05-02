import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Server-side badge eligibility validation.
// The client sends its computed stats; the server re-evaluates the rules
// before granting. This prevents users from inserting arbitrary badges.
function evaluateEligibleBadges(stats: {
  totalWorkouts?: number;
  currentStreak?: number;
  totalXP?: number;
  level?: number;
  challengesCompleted?: number;
}): string[] {
  const eligible: string[] = [];
  const w = stats.totalWorkouts ?? 0;
  const s = stats.currentStreak ?? 0;
  const xp = stats.totalXP ?? 0;
  const lvl = stats.level ?? 1;
  const ch = stats.challengesCompleted ?? 0;

  if (w >= 1) eligible.push("first_workout");
  if (w >= 10) eligible.push("workouts_10");
  if (w >= 50) eligible.push("workouts_50");
  if (w >= 100) eligible.push("workouts_100");
  if (s >= 3) eligible.push("streak_3");
  if (s >= 7) eligible.push("streak_7");
  if (s >= 30) eligible.push("streak_30");
  if (xp >= 500) eligible.push("xp_500");
  if (xp >= 2000) eligible.push("xp_2000");
  if (lvl >= 5) eligible.push("level_5");
  if (lvl >= 10) eligible.push("level_10");
  if (ch >= 1) eligible.push("first_challenge");
  if (ch >= 5) eligible.push("challenges_5");

  return eligible;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const sbAuth = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: claims, error: authErr } = await sbAuth.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (authErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claims.claims.sub as string;

    const { stats, requestedBadgeIds } = await req.json();
    if (!stats || typeof stats !== "object") {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Server-side eligibility - never trust client's requested list alone
    const eligible = new Set(evaluateEligibleBadges(stats));
    const candidates: string[] = Array.isArray(requestedBadgeIds)
      ? requestedBadgeIds.filter((id: unknown) => typeof id === "string" && eligible.has(id))
      : Array.from(eligible);

    if (candidates.length === 0) {
      return new Response(JSON.stringify({ granted: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Filter out already-owned badges
    const { data: existing } = await admin
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", userId);
    const existingIds = new Set((existing ?? []).map((r) => r.badge_id));
    const toGrant = candidates.filter((id) => !existingIds.has(id));

    if (toGrant.length > 0) {
      const { error: insErr } = await admin
        .from("user_badges")
        .insert(toGrant.map((badge_id) => ({ user_id: userId, badge_id })));
      if (insErr) {
        console.error("grant-badges insert error:", insErr);
        return new Response(JSON.stringify({ error: "insert_failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ granted: toGrant }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("grant-badges error:", e);
    return new Response(JSON.stringify({ error: "server_error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
