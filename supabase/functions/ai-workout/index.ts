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
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: claims, error: authErr } = await sb.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (authErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const { data: isPremium } = await admin.rpc("is_premium_or_admin", { _user_id: claims.claims.sub });
    if (!isPremium) {
      return new Response(JSON.stringify({ error: "premium_required", message: "Funzionalità riservata agli utenti Premium." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const cap = (v: unknown, max = 60): string =>
      typeof v === "string" ? v.replace(/[\r\n]+/g, " ").slice(0, max) : "";
    const ID_RE = /^[a-zA-Z0-9_-]{1,64}$/;
    const attrezzo = cap(body.attrezzo, 40);
    const livello = cap(body.livello, 20);
    const focus = cap(body.focus, 40);
    const storici = Array.isArray(body.storici)
      ? body.storici.slice(-20).filter((s: unknown) => typeof s === "string" && ID_RE.test(s))
      : [];
    const targetCount = typeof body.targetCount === "number" ? Math.max(3, Math.min(12, body.targetCount)) : 7;
    const exerciseLibrary = Array.isArray(body.exerciseLibrary)
      ? body.exerciseLibrary
          .slice(0, 300)
          .filter((e: any) => e && typeof e.id === "string" && ID_RE.test(e.id))
          .map((e: any) => ({
            id: e.id,
            nome: cap(e.nome, 80),
            categoria: cap(e.categoria, 40),
            livello: cap(e.livello, 20),
            muscoli: Array.isArray(e.muscoli) ? e.muscoli.slice(0, 8).map((m: unknown) => cap(m, 30)) : [],
          }))
      : [];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build a compact list of available exercises for the AI
    const exerciseList = exerciseLibrary.map((e: any) => 
      `${e.id}|${e.nome}|${e.categoria}|${e.livello}|${e.muscoli.join(",")}`
    ).join("\n");

    const storiciStr = storici?.length > 0 
      ? `\nEVITA questi esercizi già usati di recente: ${storici.join(", ")}` 
      : "";

    const systemPrompt = `Sei un trainer di Pilates esperto. Il tuo compito è selezionare esercizi dalla libreria fornita per comporre un allenamento bilanciato.

REGOLE IMPORTANTI:
- Seleziona SOLO esercizi dalla lista fornita usando gli ID esatti
- Bilanciamento: 2 core, 1 gambe/glutei, 1 parte superiore, 1 stabilità, 1 mobilità
- Se il focus è specifico, aumenta gli esercizi di quel gruppo
- Non inventare esercizi nuovi
- Seleziona ${targetCount || 7} esercizi
- Preferisci varietà di muscoli coinvolti`;

    const userPrompt = `LIBRERIA ESERCIZI DISPONIBILI (formato: id|nome|categoria|livello|muscoli):
${exerciseList}

PARAMETRI ALLENAMENTO:
- Attrezzo: ${attrezzo}
- Livello utente: ${livello}
- Focus: ${focus || "full_body"}
- Numero esercizi: ${targetCount || 7}
${storiciStr}

Seleziona gli esercizi migliori per questo allenamento.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "select_exercises",
              description: "Select exercise IDs from the library for the workout",
              parameters: {
                type: "object",
                properties: {
                  exercise_ids: {
                    type: "array",
                    items: { type: "string" },
                    description: "Array of exercise IDs from the library",
                  },
                  reasoning: {
                    type: "string",
                    description: "Brief explanation of the selection rationale",
                  },
                },
                required: ["exercise_ids"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "select_exercises" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "rate_limited", message: "Troppe richieste, riprova tra poco." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "payment_required", message: "Crediti AI esauriti." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "ai_error", message: "Errore AI, uso generazione locale." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "no_selection", message: "AI non ha selezionato esercizi." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const args = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({
      exercise_ids: args.exercise_ids,
      reasoning: args.reasoning || "",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-workout error:", e);
    return new Response(JSON.stringify({ error: "server_error", message: "Si è verificato un errore interno. Riprova più tardi." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
