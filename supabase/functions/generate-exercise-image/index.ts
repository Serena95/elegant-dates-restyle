import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const adminAuth = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const { data: isPremium } = await adminAuth.rpc("is_premium_or_admin", { _user_id: claims.claims.sub });
    if (!isPremium) {
      return new Response(JSON.stringify({ error: "premium_required", message: "Funzionalità riservata agli utenti Premium." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { exerciseId, exerciseName, category, muscles, equipment } = await req.json();

    // Strict validation to prevent path traversal and prompt injection
    const ID_RE = /^[a-zA-Z0-9_-]{1,64}$/;
    const clean = (s: unknown, max = 200) =>
      typeof s === "string" ? s.replace(/[\r\n]+/g, " ").slice(0, max) : "";

    if (!exerciseId || typeof exerciseId !== "string" || !ID_RE.test(exerciseId)) {
      return new Response(JSON.stringify({ error: "Invalid exerciseId" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const safeName = clean(exerciseName, 120);
    const safeCategory = clean(category, 40);
    const safeEquipment = clean(equipment, 60);
    const safeMuscles = Array.isArray(muscles)
      ? muscles.slice(0, 10).map((m) => clean(m, 40)).filter(Boolean)
      : [];
    if (!safeName) {
      return new Response(JSON.stringify({ error: "Invalid exerciseName" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if image already exists
    const storagePath = `${exerciseId}.png`;
    const { data: existing } = await supabase.storage
      .from("exercise-images")
      .list("", { search: storagePath });

    if (existing && existing.length > 0 && existing.some(f => f.name === storagePath)) {
      const { data: urlData } = supabase.storage
        .from("exercise-images")
        .getPublicUrl(storagePath);
      return new Response(JSON.stringify({ url: urlData.publicUrl, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map category to body area for better prompts
    const categoryMap: Record<string, string> = {
      core: "abdominal and core muscles highlighted",
      gambe: "leg muscles highlighted",
      glutei: "glute muscles highlighted",
      schiena: "back muscles highlighted",
      "mobilità": "flexibility and stretching pose",
      "stabilità": "balance and stability pose",
      cardio: "dynamic cardio movement",
      braccia: "arm and shoulder muscles highlighted",
    };

    const bodyFocus = categoryMap[category] || "full body exercise";
    const muscleList = muscles?.join(", ") || "";

    const prompt = `Create a clean, minimal fitness illustration of a person performing the Pilates/fitness exercise "${exerciseName}" with ${equipment || "body weight"}. The illustration should be a simple, elegant line drawing style with soft colors on a clean white background. Show the correct form and posture. ${bodyFocus}. Target muscles: ${muscleList}. Style: modern fitness app illustration, anatomical accuracy, clean lines, pastel accent colors highlighting active muscles.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI generation failed", status: response.status }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "No image generated" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract base64 data and upload to storage
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    const { error: uploadError } = await supabase.storage
      .from("exercise-images")
      .upload(storagePath, binaryData, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      // Return the base64 image directly as fallback
      return new Response(JSON.stringify({ url: imageUrl, cached: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from("exercise-images")
      .getPublicUrl(storagePath);

    return new Response(JSON.stringify({ url: publicUrlData.publicUrl, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-exercise-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
