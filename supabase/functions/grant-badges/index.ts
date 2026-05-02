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
  longestStreak?: number;
}): string[] {
  const eligible: string[] = [];
  const w = stats.totalWorkouts ?? 0;
  const cs = stats.currentStreak ?? 0;
  const ls = stats.longestStreak ?? 0;

  if (w >= 1) eligible.push("first_workout");
  if (w >= 5) eligible.push("five_workouts");
  if (w >= 10) eligible.push("ten_workouts");
  if (w >= 30) eligible.push("thirty_workouts");
  if (cs >= 7 || ls >= 7) eligible.push("seven_streak");
  if (cs >= 30 || ls >= 30) eligible.push("thirty_streak");

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
