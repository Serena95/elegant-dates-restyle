// Main exercise library barrel file
// Re-exports the complete exercise library and generation functions

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
