// AI Coach edge function - v2 with complete type
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    const cycleAdaptation = context.cyclePhase ? `\nFase del ciclo: ${context.cyclePhase}. ${
      context.cyclePhase === "mestruale" ? "Suggerisci mobilità e stretching leggero." :
      context.cyclePhase === "luteale" ? "Suggerisci allenamenti moderati." :
      context.cyclePhase === "follicolare" ? "Puoi suggerire allenamenti più intensi." : ""
    }` : "";
    
    const pregnancyAdaptation = context.pregnancyMode ? `\nModalità gravidanza attiva (settimana ${context.pregnancyWeek || "?"}). Evita addominali compressivi e movimenti intensi del core. Favorisci mobilità, respirazione e stabilità.` : "";

    const cycleNote = context.cyclePhase === "mestruale" ? " L'utente è in fase mestruale, suggerisci attività dolci." : "";

    if (type === "complete") {
      // Single call that returns everything: suggestion + motivation + recovery
      const needsRecovery = (context.streak || 0) >= 5 || context.recentIntensity === "alta" || context.cyclePhase === "mestruale";

      systemPrompt = `Sei un coach di Pilates professionista italiano. Rispondi SEMPRE in formato JSON valido con questa struttura esatta:
{
  "suggestion": {"titolo": "string", "descrizione": "string (max 2 frasi)", "focus": "string (gruppo muscolare principale)"},
  "motivation": "string (messaggio motivazionale 1-2 frasi, personalizzato)",
  ${needsRecovery ? '"recovery": {"consiglio": "string (max 2 frasi)", "tipo": "stretch|mobilità|riposo"}' : '"recovery": null'}
}
Non aggiungere testo fuori dal JSON. Non usare markdown.`;

      userPrompt = `Dati utente:
- Livello: ${context.level || "MEDIO"}
- Attrezzi disponibili: ${(context.equipment || []).join(", ") || "Corpo Libero"}
- Focus preferito: ${context.preferredFocus || "full body"}
- Streak allenamenti: ${context.streak || 0} giorni
- Allenamenti totali: ${context.totalWorkouts || 0}
- Ultimo focus allenato: ${context.lastFocus || "nessuno"}
- Gruppi muscolari più allenati questa settimana: ${context.mostTrainedThisWeek || "nessuno"}
- Ultimo tipo allenamento: ${context.lastWorkoutType || "sconosciuto"}
- Intensità recente: ${context.recentIntensity || "media"}${cycleAdaptation}${pregnancyAdaptation}${cycleNote}

Genera:
1. Un suggerimento allenamento che bilanci i gruppi muscolari
2. Un messaggio motivazionale personalizzato (${context.streak >= 7 ? "ha una streak impressionante!" : context.streak >= 3 ? "sta costruendo una buona abitudine" : "sta iniziando il suo percorso"})
${needsRecovery ? "3. Un consiglio di recupero appropriato" : ""}
Rispondi SOLO con il JSON.`;

    } else if (type === "workout_suggestion") {
      systemPrompt = `Sei un coach di Pilates professionista italiano. Suggerisci un allenamento basato sui dati dell'utente. Non inventare esercizi. Usa solo esercizi comuni di Pilates e fitness funzionale. Rispondi SEMPRE in formato JSON valido con questa struttura: {"titolo": "string", "descrizione": "string (max 2 frasi)", "focus": "string (gruppo muscolare principale)"}`;
      
      userPrompt = `Dati utente:
- Livello: ${context.level || "MEDIO"}
- Attrezzi disponibili: ${(context.equipment || []).join(", ") || "Corpo Libero"}
- Focus preferito: ${context.preferredFocus || "full body"}
- Streak allenamenti: ${context.streak || 0} giorni
- Ultimo focus allenato: ${context.lastFocus || "nessuno"}
- Gruppi muscolari più allenati questa settimana: ${context.mostTrainedThisWeek || "nessuno"}${cycleAdaptation}${pregnancyAdaptation}

Suggerisci un allenamento per oggi che bilanci i gruppi muscolari (se ieri core, oggi gambe/glutei). Rispondi SOLO con il JSON.`;

    } else if (type === "motivation") {
      systemPrompt = `Sei un coach motivazionale di Pilates italiano. Genera un messaggio motivazionale breve (1-2 frasi) e personalizzato. Rispondi SOLO con il testo del messaggio, senza virgolette.`;
      userPrompt = `L'utente ha una streak di ${context.streak || 0} giorni. Ha completato ${context.totalWorkouts || 0} allenamenti totali. ${context.streak >= 7 ? "Ha una streak impressionante!" : context.streak >= 3 ? "Sta costruendo una buona abitudine." : "Sta iniziando il suo percorso."} Genera un messaggio motivazionale personalizzato.`;

    } else if (type === "recovery") {
      systemPrompt = `Sei un coach di Pilates italiano esperto in recupero. Suggerisci consigli di recupero brevi e pratici. Rispondi SEMPRE in formato JSON: {"consiglio": "string (max 2 frasi)", "tipo": "stretch|mobilità|riposo"}`;
      userPrompt = `L'utente ha una streak di ${context.streak || 0} giorni. Ultimo allenamento: ${context.lastWorkoutType || "sconosciuto"}. Intensità recente: ${context.recentIntensity || "media"}.${cycleNote} Suggerisci un consiglio di recupero. Rispondi SOLO con il JSON.`;

    } else {
      return new Response(JSON.stringify({ error: "Unknown type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
