// Main exercise library barrel file
// Re-exports the complete exercise library, generation functions, and English-typed helpers

export type { Exercise, DayPlan, WeekPlan, FocusInfo } from "./exercise-types";
export {
  CONFIG_LIVELLI,
  TUTTI_GLI_ATTREZZI,
  ATTREZZO_ICONS,
  ATTREZZO_SHORT,
  TEMA_CONFIG,
  suggerimentiNutrizionali,
  detectFocus,
} from "./exercise-types";

export {
  EXERCISE_LIBRARY,
  selezionaAttrezziSettimana,
  generaEserciziGiorno,
  generaSettimanaIntelligente,
  computeProgressionContext,
  FOCUS_LABELS,
  databaseEsercizi,
  cardioAlternativo,
} from "./exercises";

export type { DayFocus, ProgressionContext, GeneratedWeek } from "./exercises";

// ============================================================
// ENGLISH-TYPED UNIFIED LIBRARY & HELPERS
// ============================================================

import type { Exercise as EnglishExercise } from "@/types/exercise";
import { mapDifficulty } from "@/types/exercise";
import { EXERCISE_LIBRARY } from "./exercises";

/** Pre-built ID → legacy exercise map for O(1) lookups */
const exerciseByIdMap = new Map(EXERCISE_LIBRARY.map(e => [e.id, e]));

/** Retrieve a legacy exercise by ID */
export function getExerciseById(id: string) {
  return exerciseByIdMap.get(id) ?? null;
}

/** Retrieve multiple legacy exercises by IDs (preserves order) */
export function getExercisesByIds(ids: string[]) {
  return ids.map(id => exerciseByIdMap.get(id)).filter(Boolean);
}

/** Convert a legacy exercise to the new English-typed format */
export function toEnglishExercise(e: { id: string; nome: string; attrezzo: string; livello: "base" | "medio" | "avanzato"; muscoli: string[]; categoria: string; descrizione: string; gif?: string }): EnglishExercise {
  return {
    id: e.id,
    name: e.nome,
    equipment: e.attrezzo,
    focus: e.categoria,
    muscles: e.muscoli,
    difficulty: mapDifficulty(e.livello),
    duration: 30,
    gif: e.gif || `/exercises/${e.attrezzo.toLowerCase().replace(/ /g, "-")}/${e.id}.gif`,
  };
}

/** Full library in English-typed format (lazy-initialized) */
let _englishLibrary: EnglishExercise[] | null = null;
export function getExerciseLibrary(): EnglishExercise[] {
  if (!_englishLibrary) {
    _englishLibrary = EXERCISE_LIBRARY.map(toEnglishExercise);
  }
  return _englishLibrary;
}
