// Stretching pools used both by WorkoutView (fine sessione) e dalla Libreria.
export interface StretchExercise {
  nome: string;
  emoji: string;
  desc: string;
  durata: number;
}

export const STRETCHING_UPPER: StretchExercise[] = [
  { nome: "Stretch Schiena (Cat-Cow)", emoji: "🐱", desc: "In quadrupedia, alterna inarcamento e arrotondamento della schiena.", durata: 30 },
  { nome: "Stretch Spalle", emoji: "🙆", desc: "Porta un braccio al petto e tira col braccio opposto. Alterna.", durata: 30 },
  { nome: "Stretch Tricipiti", emoji: "💪", desc: "Braccio dietro la testa, spingi il gomito con l'altra mano.", durata: 30 },
  { nome: "Stretch Petto Apertura", emoji: "🦅", desc: "Braccia dietro la schiena intrecciate, apri il petto e guarda su.", durata: 30 },
  { nome: "Rilascio Core", emoji: "🧘", desc: "Posizione del bambino: braccia avanti, fronte a terra, respira.", durata: 30 },
];

export const STRETCHING_LOWER: StretchExercise[] = [
  { nome: "Stretch Glutei (Piriforme)", emoji: "🍑", desc: "Supina, caviglia sulla coscia opposta, tira il ginocchio al petto.", durata: 30 },
  { nome: "Stretch Quadricipiti", emoji: "🦵", desc: "In piedi, porta il tallone al gluteo e tieni. Alterna.", durata: 30 },
  { nome: "Stretch Femorali", emoji: "🦿", desc: "Seduta, gambe tese, piegati avanti cercando le punte.", durata: 30 },
  { nome: "Stretch Interno Coscia (Farfalla)", emoji: "🦋", desc: "Seduta, piante dei piedi unite, spingi le ginocchia verso il basso.", durata: 30 },
  { nome: "Rilascio Core", emoji: "🧘", desc: "Posizione del bambino: braccia avanti, fronte a terra, respira.", durata: 30 },
];

export const STRETCHING_TOTAL: StretchExercise[] = [
  { nome: "Stretch Schiena (Cat-Cow)", emoji: "🐱", desc: "In quadrupedia, alterna inarcamento e arrotondamento della schiena.", durata: 30 },
  { nome: "Stretch Spalle e Petto", emoji: "🙆", desc: "Braccia intrecciate dietro, apri il petto. Poi braccio al petto, alterna.", durata: 30 },
  { nome: "Stretch Glutei", emoji: "🍑", desc: "Supina, caviglia sulla coscia opposta, tira al petto.", durata: 30 },
  { nome: "Stretch Quadricipiti", emoji: "🦵", desc: "In piedi, tallone al gluteo, mantieni l'equilibrio.", durata: 30 },
  { nome: "Rilascio Finale", emoji: "🧘", desc: "Posizione del bambino: braccia avanti, fronte a terra, 5 respiri profondi.", durata: 30 },
];

export function getStretchingForFocus(focus: string): StretchExercise[] {
  if (focus === "upper_body") return STRETCHING_UPPER;
  if (focus === "lower_body") return STRETCHING_LOWER;
  return STRETCHING_TOTAL;
}

/** Lista deduplicata di tutti gli stretching per la Libreria. */
export const ALL_STRETCHING: StretchExercise[] = (() => {
  const seen = new Set<string>();
  const all = [...STRETCHING_UPPER, ...STRETCHING_LOWER, ...STRETCHING_TOTAL];
  return all.filter(s => {
    if (seen.has(s.nome)) return false;
    seen.add(s.nome);
    return true;
  });
})();
