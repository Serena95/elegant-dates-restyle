import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Compute real stats from workout_history (server-side, trusted source).
function computeStats(rows: { data_key: string }[]): {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
} {
  const uniqueDays = Array.from(new Set(rows.map((r) => r.data_key))).sort();
  const totalWorkouts = uniqueDays.length;

  if (totalWorkouts === 0) return { totalWorkouts: 0, currentStreak: 0, longestStreak: 0 };

  // Compute longest streak over consecutive calendar days (data_key = YYYY-MM-DD).
  let longest = 1;
  let run = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1] + "T00:00:00Z").getTime();
    const cur = new Date(uniqueDays[i] + "T00:00:00Z").getTime();
    const diffDays = Math.round((cur - prev) / 86400000);
    if (diffDays === 1) {
      run++;
      if (run > longest) longest = run;
    } else if (diffDays > 1) {
      run = 1;
    }
  }

  // Current streak: consecutive days ending today or yesterday.
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  let current = 0;
  const set = new Set(uniqueDays);
  // Start from today; if no workout today, allow yesterday so streak survives a same-day check.
  let cursor = todayMs;
  if (!set.has(toKey(cursor))) cursor -= 86400000;
  while (set.has(toKey(cursor))) {
    current++;
    cursor -= 86400000;
  }

  return { totalWorkouts, currentStreak: current, longestStreak: longest };
}

function toKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function evaluateEligibleBadges(stats: {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
}): string[] {
  const eligible: string[] = [];
  const { totalWorkouts: w, currentStreak: cs, longestStreak: ls } = stats;
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

    // Optional payload: client may suggest a subset of badge ids to evaluate;
    // we IGNORE any client-supplied stats and recompute them server-side.
    let requestedBadgeIds: string[] | undefined;
    try {
      const body = await req.json();
      if (Array.isArray(body?.requestedBadgeIds)) {
        requestedBadgeIds = body.requestedBadgeIds.filter((id: unknown) => typeof id === "string");
      }
    } catch {
      // empty body is fine
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Trusted stats from the database.
    const { data: history, error: histErr } = await admin
      .from("workout_history")
      .select("data_key")
      .eq("user_id", userId)
      .eq("completato", true);
    if (histErr) {
      console.error("grant-badges history error:", histErr);
      return new Response(JSON.stringify({ error: "history_failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const stats = computeStats((history ?? []) as { data_key: string }[]);

    const eligible = new Set(evaluateEligibleBadges(stats));
    const candidates: string[] = requestedBadgeIds && requestedBadgeIds.length > 0
      ? requestedBadgeIds.filter((id) => eligible.has(id))
      : Array.from(eligible);

    if (candidates.length === 0) {
      return new Response(JSON.stringify({ granted: [], stats }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

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

    return new Response(JSON.stringify({ granted: toGrant, stats }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("grant-badges error:", e);
    return new Response(JSON.stringify({ error: "server_error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
