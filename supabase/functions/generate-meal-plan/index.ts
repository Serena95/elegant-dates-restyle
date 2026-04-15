import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { obiettivo, preferenze, restrizioni, attivita, calorie, pasti_giorno, durata, tipo_dieta, pasto_saltato } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Sei un nutrizionista italiano professionista. Genera un piano alimentare personalizzato in formato JSON valido.

Il JSON deve avere questa struttura ESATTA:
{
  "nome": "string (nome del piano)",
  "descrizione": "string (breve descrizione)",
  "calorie_giornaliere": number,
  "macros": {"proteine": "string%", "carboidrati": "string%", "grassi": "string%"},
  "giorni": {
    "Lunedì": {
      "colazione": "string (descrizione con quantità in grammi)",
      "spuntino1": "string",
      "pranzo": "string (descrizione con quantità in grammi)",
      "spuntino2": "string",
      "cena": "string (descrizione con quantità in grammi)"
    },
    ... (per ogni giorno della settimana richiesto)
  },
  "listaSpesa": {
    "🥬 Verdure": ["item (quantità)", ...],
    "🍎 Frutta": ["item (quantità)", ...],
    "🥩 Proteine": ["item (quantità)", ...],
    "🌾 Cereali": ["item (quantità)", ...],
    "🥛 Latticini": ["item (quantità)", ...],
    "🥜 Altro": ["item (quantità)", ...]
  },
  "consigli": ["string", "string", "string"]
}

REGOLE:
- Includi le quantità in grammi nei pasti (es. "Proteine magre alla griglia (150g) con cereali integrali (80g) e verdure (200g)")
- USA CATEGORIE GENERICHE quando possibile (es. "proteine magre" invece di "petto di pollo specifico", "cereali integrali" invece di "farro", "verdure di stagione" invece di una verdura specifica)
- Suggerisci ALTERNATIVE tra parentesi (es. "Proteine magre (pollo/tacchino/pesce) 150g con verdure a scelta 200g")
- La lista della spesa deve avere le quantità TOTALI per l'intera settimana
- Rispetta RIGOROSAMENTE le restrizioni alimentari
- Bilancia i macronutrienti in base all'obiettivo
- I consigli devono essere pratici e personalizzati
- Aggiungi un campo "alternative" per ogni pasto se possibile
- Rispondi SOLO con il JSON, nessun testo aggiuntivo
${tipo_dieta === "chetogenica" ? "- DIETA CHETOGENICA: max 20-30g carboidrati netti al giorno, 70% grassi, 25% proteine, 5% carboidrati. NO cereali, NO pane, NO pasta, NO zuccheri. SÌ avocado, olio EVO, burro, noci, formaggi grassi." : ""}
${tipo_dieta === "digiuno_intermittente" ? `- DIGIUNO INTERMITTENTE 16:8: Il pasto "${pasto_saltato || "colazione"}" deve essere sostituito con "☕ Solo caffè/tè senza zucchero" o "—". Concentra le calorie nei pasti rimanenti. Mantieni le calorie totali giornaliere invariate.` : ""}`;

    const userPrompt = `Genera un piano alimentare personalizzato con questi parametri:
- Tipo dieta: ${tipo_dieta === "chetogenica" ? "Dieta Chetogenica" : tipo_dieta === "digiuno_intermittente" ? "Digiuno Intermittente 16:8" : "Standard"}
${tipo_dieta === "digiuno_intermittente" && pasto_saltato ? `- Pasto da saltare: ${pasto_saltato}` : ""}
- Obiettivo: ${obiettivo}
- Preferenze alimentari: ${preferenze || "Nessuna preferenza specifica"}
- Restrizioni/Allergie: ${restrizioni || "Nessuna"}
- Livello attività fisica: ${attivita}
- Calorie target: ${calorie || "da calcolare in base all'obiettivo"}
- Pasti al giorno: ${pasti_giorno || 5}
- Durata piano: ${durata || "7 giorni"}

Genera il piano completo in JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Troppe richieste, riprova tra poco" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crediti AI esauriti. Ricarica il saldo in Settings → Workspace → Usage.", fallback: true }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Servizio AI temporaneamente non disponibile, riprova più tardi.", fallback: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    // Clean markdown code blocks if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    // Parse to validate JSON
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-meal-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Errore nella generazione del piano" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
