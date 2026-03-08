// Main exercise library barrel file
// Re-exports the complete exercise library and generation functions

export type { Exercise, DayPlan, WeekPlan } from "./exercise-types";
export {
  CONFIG_LIVELLI,
  TUTTI_GLI_ATTREZZI,
  ATTREZZO_ICONS,
  ATTREZZO_SHORT,
  TEMA_CONFIG,
  suggerimentiNutrizionali,
} from "./exercise-types";

export {
  EXERCISE_LIBRARY,
  selezionaAttrezziSettimana,
  generaEserciziGiorno,
  databaseEsercizi,
  cardioAlternativo,
} from "./exercises";
