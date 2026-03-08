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
  // Today's plan context
  todayEquipment?: string;
  todayFocus?: string;
  todayFocusIcon?: string;
  isRestDay?: boolean;
  isAlreadyCompleted?: boolean;
}

export interface CompleteCoachResponse {
  suggestion: WorkoutSuggestion;
  motivation: string;
  recovery: RecoveryAdvice | null;
}

/**
 * Single AI call that returns suggestion + motivation + recovery in one response.
 */
// Session cache for AI coach responses
const sessionCache = new Map<string, { data: CompleteCoachResponse; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function getCacheKey(context: AICoachContext): string {
  return `${context.level}-${(context.equipment || []).sort().join(",")}-${context.streak}-${context.cyclePhase || ""}-${context.pregnancyMode || false}`;
}

export async function generateCompleteCoachData(context: AICoachContext, forceRefresh = false): Promise<CompleteCoachResponse> {
  const key = getCacheKey(context);
  const cached = sessionCache.get(key);
  if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const { data, error } = await supabase.functions.invoke("ai-coach", {
      body: { type: "complete", context },
    });
    if (error) {
      handleAIError(error);
      throw error;
    }

    const raw = data?.result || "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const result: CompleteCoachResponse = {
        suggestion: parsed.suggestion || getDefaultSuggestion(),
        motivation: parsed.motivation || getDefaultMotivation(context.streak),
        recovery: parsed.recovery || null,
      };
      sessionCache.set(key, { data: result, timestamp: Date.now() });
      return result;
    }
    return getDefaultResponse(context.streak);
  } catch (e) {
    console.error("AI complete coach error:", e);
    return getDefaultResponse(context.streak);
  }
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
    return getDefaultSuggestion();
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

function getDefaultSuggestion(): WorkoutSuggestion {
  return {
    titolo: "Allenamento Bilanciato",
    descrizione: "Un mix di esercizi per tutto il corpo per mantenerti in forma.",
    focus: "Full Body",
  };
}

function getDefaultMotivation(streak: number): string {
  if (streak >= 7) return "Incredibile! Stai mantenendo una streak fantastica 🔥";
  if (streak >= 3) return "Ottimo ritmo! Continua così 💪";
  return "Ogni allenamento ti rende più forte. Inizia oggi! 🌟";
}

function getDefaultResponse(streak: number): CompleteCoachResponse {
  return {
    suggestion: getDefaultSuggestion(),
    motivation: getDefaultMotivation(streak),
    recovery: null,
  };
}

let lastRateLimitToast = 0;
function handleAIError(error: any) {
  const msg = typeof error === "object" && error?.message ? error.message : String(error);
  const now = Date.now();
  if (now - lastRateLimitToast < 30000) return;
  
  if (msg.includes("429") || msg.toLowerCase().includes("rate limit")) {
    lastRateLimitToast = now;
    toast.error("AI Coach temporaneamente non disponibile. Riprova tra qualche secondo.");
  } else if (msg.includes("402")) {
    lastRateLimitToast = now;
    toast.error("Crediti AI esauriti. Contatta il supporto.");
  }
}
