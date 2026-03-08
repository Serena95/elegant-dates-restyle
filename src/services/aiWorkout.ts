import { supabase } from "@/integrations/supabase/client";
import { Exercise, EXERCISE_LIBRARY, generaEserciziGiorno } from "@/data/exercises";
import type { ProgressionContext } from "@/data/exercises";

interface AIWorkoutParams {
  attrezzo: string;
  livello: string;
  focus?: string;
  storici?: string[];
  targetCount?: number;
  progressionCtx?: ProgressionContext;
}

/**
 * Generate a workout using AI, with fallback to local generation.
 * AI selects from the existing exercise library - never invents new exercises.
 */
export async function generateAIWorkout({
  attrezzo,
  livello,
  focus,
  storici = [],
  targetCount = 7,
  progressionCtx,
}: AIWorkoutParams): Promise<{ exercises: Exercise[]; aiGenerated: boolean; reasoning?: string }> {
  // Filter exercises for this equipment and level
  const LIVELLO_ACCESSO: Record<string, string[]> = {
    "BASSO": ["base"],
    "MEDIO": ["base", "medio"],
    "AVANZATO": ["base", "medio", "avanzato"],
  };
  const accessible = LIVELLO_ACCESSO[livello] || ["base", "medio", "avanzato"];

  const disponibili = EXERCISE_LIBRARY.filter(
    e => e.attrezzo === attrezzo && accessible.includes(e.livello)
  );

  if (disponibili.length === 0) {
    return { exercises: [], aiGenerated: false };
  }

  try {
    const { data, error } = await supabase.functions.invoke("ai-workout", {
      body: {
        exerciseLibrary: disponibili.map(e => ({
          id: e.id,
          nome: e.nome,
          categoria: e.categoria,
          livello: e.livello,
          muscoli: e.muscoli,
        })),
        attrezzo,
        livello,
        focus: focus || "full_body",
        storici: storici.slice(-20), // Last 20 to keep payload small
        targetCount,
      },
    });

    if (error) throw error;

    if (data?.exercise_ids && Array.isArray(data.exercise_ids)) {
      // Validate: only use exercises that actually exist in the library
      const validExercises: Exercise[] = [];
      const libraryMap = new Map(disponibili.map(e => [e.id, e]));

      for (const id of data.exercise_ids) {
        const exercise = libraryMap.get(id);
        if (exercise) {
          validExercises.push(exercise);
        }
      }

      // If AI returned too few valid exercises, fill with local generation
      if (validExercises.length < Math.min(6, disponibili.length)) {
        console.warn("AI returned too few valid exercises, using local fallback");
        const localExercises = generaEserciziGiorno(attrezzo, livello, storici, focus, progressionCtx);
        return { exercises: localExercises, aiGenerated: false };
      }

      return {
        exercises: validExercises.slice(0, targetCount),
        aiGenerated: true,
        reasoning: data.reasoning,
      };
    }

    throw new Error("Invalid AI response format");
  } catch (err) {
    console.warn("AI workout generation failed, using local fallback:", err);
    // Fallback to local generation
    const localExercises = generaEserciziGiorno(attrezzo, livello, storici, focus, progressionCtx);
    return { exercises: localExercises, aiGenerated: false };
  }
}
