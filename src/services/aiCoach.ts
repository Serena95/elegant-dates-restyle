import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export interface WorkoutSuggestion {
  titolo: string;
  descrizione: string;
  focus: string;
}

export interface RecoveryAdvice {
  consiglio: string;
  tipo: "stretch" | "mobilità" | "riposo";
}

export interface AICoachContext {
  level: string;
  equipment: string[];
  preferredFocus?: string;
  cyclePhase?: string;
  pregnancyMode?: boolean;
  pregnancyWeek?: number;
  streak: number;
  lastFocus?: string;
  mostTrainedThisWeek?: string;
  totalWorkouts?: number;
  lastWorkoutType?: string;
  recentIntensity?: string;
}

export async function generateWorkoutSuggestion(context: AICoachContext): Promise<WorkoutSuggestion> {
  try {
    const { data, error } = await supabase.functions.invoke("ai-coach", {
      body: { type: "workout_suggestion", context },
    });
    if (error) {
      handleAIError(error);
      throw error;
    }

    const raw = data?.result || "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { titolo: "Allenamento del Giorno", descrizione: raw.slice(0, 100), focus: "Full Body" };
  } catch (e) {
    console.error("AI workout suggestion error:", e);
    return {
      titolo: "Allenamento Bilanciato",
      descrizione: "Un mix di esercizi per tutto il corpo per mantenerti in forma.",
      focus: "Full Body",
    };
  }
}

export async function generateMotivationMessage(context: Pick<AICoachContext, "streak" | "totalWorkouts">): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke("ai-coach", {
      body: { type: "motivation", context },
    });
    if (error) {
      handleAIError(error);
      throw error;
    }
    return data?.result?.replace(/^["']|["']$/g, "").trim() || getDefaultMotivation(context.streak);
  } catch {
    return getDefaultMotivation(context.streak);
  }
}

export async function generateRecoveryAdvice(context: AICoachContext): Promise<RecoveryAdvice> {
  try {
    const { data, error } = await supabase.functions.invoke("ai-coach", {
      body: { type: "recovery", context },
    });
    if (error) {
      handleAIError(error);
      throw error;
    }

    const raw = data?.result || "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { consiglio: "Concediti qualche minuto di stretching per recuperare.", tipo: "stretch" };
  } catch {
    return { consiglio: "Fai qualche esercizio di mobilità per recuperare.", tipo: "mobilità" };
  }
}

let lastRateLimitToast = 0;
function handleAIError(error: any) {
  const msg = typeof error === "object" && error?.message ? error.message : String(error);
  const now = Date.now();
  // Show toast max once every 30s to avoid spam
  if (now - lastRateLimitToast < 30000) return;
  
  if (msg.includes("429") || msg.toLowerCase().includes("rate limit")) {
    lastRateLimitToast = now;
    toast.error("AI Coach temporaneamente non disponibile. Riprova tra qualche secondo.");
  } else if (msg.includes("402")) {
    lastRateLimitToast = now;
    toast.error("Crediti AI esauriti. Contatta il supporto.");
  }
}

function getDefaultMotivation(streak: number): string {
  if (streak >= 7) return "Incredibile! Stai mantenendo una streak fantastica 🔥";
  if (streak >= 3) return "Ottimo ritmo! Continua così 💪";
  return "Ogni allenamento ti rende più forte. Inizia oggi! 🌟";
}
