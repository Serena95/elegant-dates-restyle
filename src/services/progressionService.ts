// Weekly progression system for exercise duration
// Automatically increases exercise time each week based on level

export interface ProgressionConfig {
  tempoEsercizio: number;
  pausa: number;
  round: number;
}

// Week number since user started (1-indexed, cycles every 3 weeks)
export function getCurrentProgressionWeek(): number {
  const startKey = "progression_start_date";
  let startDate = localStorage.getItem(startKey);
  if (!startDate) {
    startDate = new Date().toISOString();
    localStorage.setItem(startKey, startDate);
  }
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  // Cycle every 3 weeks (1, 2, 3, 1, 2, 3, ...)
  return (diffWeeks % 3) + 1;
}

// Progression tables (seconds per exercise)
const PROGRESSION: Record<string, Record<number, number>> = {
  "BASSO": { 1: 28, 2: 33, 3: 38 },
  "MEDIO": { 1: 33, 2: 38, 3: 43 },
  "AVANZATO": { 1: 38, 2: 43, 3: 48 },
};

const PAUSE: Record<string, number> = {
  "BASSO": 60,
  "MEDIO": 45,
  "AVANZATO": 30,
};

const ROUNDS: Record<string, number> = {
  "BASSO": 2,
  "MEDIO": 3,
  "AVANZATO": 4,
};

export function getProgressionConfig(livello: string): ProgressionConfig {
  const week = getCurrentProgressionWeek();
  const tempo = PROGRESSION[livello]?.[week] ?? PROGRESSION["MEDIO"][1];
  return {
    tempoEsercizio: tempo,
    pausa: PAUSE[livello] ?? 45,
    round: ROUNDS[livello] ?? 3,
  };
}

export function getProgressionLabel(livello: string): string {
  const week = getCurrentProgressionWeek();
  const tempo = PROGRESSION[livello]?.[week] ?? 33;
  return `Sett. ${week}/3 • ${tempo}s per esercizio`;
}
