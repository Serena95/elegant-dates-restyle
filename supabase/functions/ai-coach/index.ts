// AI Coach + Nutritionist edge function - v4 context-aware (synced with daily plan + nutrition)
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

    // Nutrition plan context
    const nutritionPlanName = context.nutritionPlan || null;

    const cycleAdaptation = context.cyclePhase ? `\nFase del ciclo: ${context.cyclePhase}. ${
      context.cyclePhase === "mestruale" ? "Suggerisci mobilità e stretching leggero." :
      context.cyclePhase === "luteale" ? "Suggerisci allenamenti moderati." :
      context.cyclePhase === "follicolare" ? "Puoi suggerire allenamenti più intensi." : ""
    }` : "";
    
    const pregnancyAdaptation = context.pregnancyMode ? `\nModalità gravidanza attiva (settimana ${context.pregnancyWeek || "?"}). Evita addominali compressivi e movimenti intensi del core. Favorisci mobilità, respirazione e stabilità.` : "";

    const cycleNote = context.cyclePhase === "mestruale" ? " L'utente è in fase mestruale, suggerisci attività dolci." : "";

    // Build today's plan context
    const isRestDay = context.isRestDay === true;
    const isCompleted = context.isAlreadyCompleted === true;
    const todayEquipment = context.todayEquipment || null;
    const todayFocus = context.todayFocus || null;

    let todayPlanContext = "";
    if (isCompleted) {
      todayPlanContext = "\n🎉 L'utente ha GIÀ COMPLETATO l'allenamento di oggi! Complimentati e suggerisci recupero attivo.";
    } else if (isRestDay) {
      todayPlanContext = "\n😴 OGGI È GIORNO DI RIPOSO (nessun allenamento programmato). Suggerisci attività di recupero: stretching leggero, mobilità, respirazione, passeggiata, foam rolling. NON suggerire allenamenti intensi.";
    } else if (todayEquipment) {
      todayPlanContext = `\n📋 ALLENAMENTO PROGRAMMATO OGGI: ${todayEquipment}${todayFocus ? ` con focus ${todayFocus}` : ""}. Il suggerimento DEVE essere coerente con questo allenamento. Parla di questo attrezzo e di questo focus specifico.`;
    }

    if (type === "complete") {
      const needsRecovery = isRestDay || isCompleted || (context.streak || 0) >= 5 || context.recentIntensity === "alta" || context.cyclePhase === "mestruale";

      systemPrompt = `Sei un coach di Pilates e nutrizionista professionista italiano, empatico e motivante. Rispondi SEMPRE in formato JSON valido con questa struttura esatta:
{
  "suggestion": {"titolo": "string", "descrizione": "string (max 2 frasi)", "focus": "string (gruppo muscolare o attività principale)"},
  "motivation": "string (messaggio motivazionale 1-2 frasi, personalizzato e caloroso)",
  ${needsRecovery ? '"recovery": {"consiglio": "string (max 2 frasi)", "tipo": "stretch|mobilità|riposo"}' : '"recovery": null'}${nutritionPlanName ? ',\n  "nutritionTip": "string (un consiglio nutrizionale breve coerente con il piano alimentare dell\'utente)"' : ''}
}

REGOLE IMPORTANTI:
- Se è giorno di riposo: il campo "suggestion" deve contenere un consiglio di recupero attivo (stretching, mobilità, respirazione), NON un allenamento.
- Se l'allenamento è già completato: complimentati nel "motivation" e suggerisci recupero nel "suggestion".
- Se c'è un allenamento programmato: il "suggestion" DEVE parlare di quell'attrezzo e focus specifico.
${nutritionPlanName ? `- L'utente segue il piano alimentare "${nutritionPlanName}". Integra consigli nutrizionali coerenti con questo piano. Se è chetogenica, ricorda grassi buoni. Se è digiuno intermittente, supporta la finestra alimentare.` : ""}
- Sii specifico, non generico. Menziona l'attrezzo per nome.
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
- Intensità recente: ${context.recentIntensity || "media"}${todayPlanContext}${cycleAdaptation}${pregnancyAdaptation}${cycleNote}

Genera:
1. Un suggerimento coerente con il piano di oggi
2. Un messaggio motivazionale personalizzato (${isCompleted ? "ha già completato l'allenamento, celebra!" : context.streak >= 7 ? "ha una streak impressionante!" : context.streak >= 3 ? "sta costruendo una buona abitudine" : "sta iniziando il suo percorso"})
${needsRecovery ? "3. Un consiglio di recupero appropriato" : ""}
Rispondi SOLO con il JSON.`;

    } else if (type === "workout_suggestion") {
      systemPrompt = `Sei un coach di Pilates professionista italiano. Suggerisci un allenamento basato sui dati dell'utente. Rispondi SEMPRE in formato JSON valido con questa struttura: {"titolo": "string", "descrizione": "string (max 2 frasi)", "focus": "string (gruppo muscolare principale)"}`;
      
      userPrompt = `Dati utente:
- Livello: ${context.level || "MEDIO"}
- Attrezzi disponibili: ${(context.equipment || []).join(", ") || "Corpo Libero"}
- Focus preferito: ${context.preferredFocus || "full body"}
- Streak allenamenti: ${context.streak || 0} giorni
- Ultimo focus allenato: ${context.lastFocus || "nessuno"}
- Gruppi muscolari più allenati questa settimana: ${context.mostTrainedThisWeek || "nessuno"}${todayPlanContext}${cycleAdaptation}${pregnancyAdaptation}

Suggerisci un allenamento coerente con il piano di oggi. Rispondi SOLO con il JSON.`;

    } else if (type === "motivation") {
      systemPrompt = `Sei un coach motivazionale di Pilates italiano. Genera un messaggio motivazionale breve (1-2 frasi) e personalizzato. Rispondi SOLO con il testo del messaggio, senza virgolette.`;
      userPrompt = `L'utente ha una streak di ${context.streak || 0} giorni. Ha completato ${context.totalWorkouts || 0} allenamenti totali. ${isCompleted ? "Ha appena completato l'allenamento di oggi!" : isRestDay ? "Oggi è il suo giorno di riposo." : "Deve ancora fare l'allenamento di oggi."} Genera un messaggio motivazionale personalizzato.`;

    } else if (type === "recovery") {
      systemPrompt = `Sei un coach di Pilates italiano esperto in recupero. Suggerisci consigli di recupero brevi e pratici. Rispondi SEMPRE in formato JSON: {"consiglio": "string (max 2 frasi)", "tipo": "stretch|mobilità|riposo"}`;
      userPrompt = `L'utente ha una streak di ${context.streak || 0} giorni. Ultimo allenamento: ${context.lastWorkoutType || "sconosciuto"}. Intensità recente: ${context.recentIntensity || "media"}.${cycleNote}${todayPlanContext} Suggerisci un consiglio di recupero. Rispondi SOLO con il JSON.`;

    } else if (type === "nutrition_advice") {
      systemPrompt = `Sei un nutrizionista italiano professionista. Fornisci consigli personalizzati in base al piano alimentare e agli obiettivi dell'utente. Rispondi SEMPRE in formato JSON valido:
{"consiglio": "string (2-3 frasi con consiglio pratico)", "suggerimento_pasto": "string (un suggerimento specifico per il prossimo pasto)", "nota": "string (nota motivazionale breve)"}
Non aggiungere testo fuori dal JSON.`;
      userPrompt = `Piano alimentare attivo: ${nutritionPlanName || "Nessuno"}
Obiettivo: ${context.nutritionGoal || "benessere"}
Livello attività: ${context.level || "MEDIO"}
Streak allenamenti: ${context.streak || 0}
${context.cyclePhase ? `Fase ciclo: ${context.cyclePhase}` : ""}
${context.pregnancyMode ? `Gravidanza settimana ${context.pregnancyWeek}` : ""}
Fornisci un consiglio nutrizionale personalizzato e coerente con il piano. Rispondi SOLO con il JSON.`;

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
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      
      // Return 200 with fallback flag so frontend doesn't crash
      return new Response(JSON.stringify({ 
        error: response.status === 402 ? "PAYMENT_REQUIRED" : response.status === 429 ? "RATE_LIMITED" : "SERVICE_ERROR",
        fallback: true,
        result: null 
      }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
