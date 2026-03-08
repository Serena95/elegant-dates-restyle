import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { exerciseLibrary, attrezzo, livello, focus, storici, targetCount } = await req.json();
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
    return new Response(JSON.stringify({ error: "server_error", message: e instanceof Error ? e.message : "Errore sconosciuto" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
