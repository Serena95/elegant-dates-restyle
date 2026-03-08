// Barrel file - re-exports everything from split modules
export type { Exercise, FocusInfo } from "./exercise-types";
export { CONFIG_LIVELLI, TUTTI_GLI_ATTREZZI, ATTREZZO_ICONS, ATTREZZO_SHORT, TEMA_CONFIG, suggerimentiNutrizionali, detectFocus } from "./exercise-types";
export type { DayPlan, WeekPlan } from "./exercise-types";

import { Exercise } from "./exercise-types";
import { MAT_EXERCISES } from "./exercises-mat";
import { RING_EXERCISES } from "./exercises-ring";
import { SMALL_BALL_EXERCISES } from "./exercises-small-ball";
import { FITBALL_EXERCISES } from "./exercises-fitball";
import { ELASTICO_EXERCISES, FASCIA_EXERCISES } from "./exercises-bands";
import { PESI_EXERCISES } from "./exercises-pesi";
import { RULLO_EXERCISES } from "./exercises-rullo";
import { REFORMER_EXERCISES, CADILLAC_EXERCISES, CHAIR_EXERCISES, BARREL_EXERCISES, SPINE_CORRECTOR_EXERCISES } from "./exercises-studio";

export const EXERCISE_LIBRARY: Exercise[] = [
  ...MAT_EXERCISES,
  ...RING_EXERCISES,
  ...SMALL_BALL_EXERCISES,
  ...FITBALL_EXERCISES,
  ...ELASTICO_EXERCISES,
  ...FASCIA_EXERCISES,
  ...PESI_EXERCISES,
  ...RULLO_EXERCISES,
  ...REFORMER_EXERCISES,
  ...CADILLAC_EXERCISES,
  ...CHAIR_EXERCISES,
  ...BARREL_EXERCISES,
  ...SPINE_CORRECTOR_EXERCISES,
];

// ============================================================
// GENERATION FUNCTIONS
// ============================================================

const LIVELLO_ACCESSO: Record<string, string[]> = {
  "BASSO": ["base"],
  "MEDIO": ["base", "medio"],
  "AVANZATO": ["base", "medio", "avanzato"],
};

function livelloAccessibile(eserLivello: string, userLivello: string): boolean {
  const accesso = LIVELLO_ACCESSO[userLivello] || ["base", "medio", "avanzato"];
  return accesso.includes(eserLivello);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Select 3 different equipment types for the week.
 */
export function selezionaAttrezziSettimana(attrezziUtente: string[]): string[] {
  const normalized = attrezziUtente.map(a => a === "Pesi(da 1 a 4kg)" ? "Pesi" : a);
  if (normalized.length === 0) return [];
  if (normalized.length <= 3) {
    const result = [...normalized];
    while (result.length < 3) result.push(normalized[result.length % normalized.length]);
    return result;
  }
  return shuffle(normalized).slice(0, 3);
}

/**
 * Generate 6-8 balanced exercises for a single equipment type.
 * Distribution: 2 core, 1 gambe/glutei, 1 upper body, 1 stabilità, 1 mobilità, +1 optional cardio
 */
export function generaEserciziGiorno(
  attrezzo: string,
  livello: string,
  storici: string[] = [],
  focus?: string
): Exercise[] {
  const disponibili = EXERCISE_LIBRARY.filter(e =>
    e.attrezzo === attrezzo && livelloAccessibile(e.livello, livello)
  );
  if (disponibili.length === 0) return [];

  let pool = disponibili.filter(e => !storici.includes(e.id));
  if (pool.length < 8) pool = disponibili;

  // Default balanced distribution
  let prioritySlots: string[][];

  if (focus === "core") {
    prioritySlots = [["core"], ["core"], ["core"], ["glutei"], ["stabilità"], ["mobilità"]];
  } else if (focus === "lower_body") {
    prioritySlots = [["gambe"], ["glutei"], ["gambe", "glutei"], ["core"], ["core"], ["mobilità"]];
  } else if (focus === "tonificazione") {
    prioritySlots = [["core"], ["core"], ["gambe", "glutei"], ["braccia", "schiena"], ["braccia"], ["stabilità"], ["cardio"]];
  } else {
    // full_body default
    prioritySlots = [
      ["core"],
      ["core"],
      ["gambe", "glutei"],
      ["braccia", "schiena"],
      ["stabilità"],
      ["mobilità"],
      ["cardio"],
    ];
  }

  const targetCount = Math.min(prioritySlots.length, pool.length);
  return pickBalanced(pool, prioritySlots, Math.max(6, targetCount));
}

function pickBalanced(pool: Exercise[], prioritySlots: string[][], count: number): Exercise[] {
  const byCat: Record<string, Exercise[]> = {};
  pool.forEach(e => {
    if (!byCat[e.categoria]) byCat[e.categoria] = [];
    byCat[e.categoria].push(e);
  });
  Object.keys(byCat).forEach(k => { byCat[k] = shuffle(byCat[k]); });

  const result: Exercise[] = [];

  // First pass: pick one from each priority slot
  for (const slot of prioritySlots) {
    if (result.length >= count) break;
    const availableCats = shuffle(slot.filter(c => byCat[c] && byCat[c].length > 0));
    if (availableCats.length > 0) {
      result.push(byCat[availableCats[0]].shift()!);
    }
  }

  // Fill remaining from any category
  if (result.length < count) {
    const remaining = shuffle(pool.filter(e => !result.find(r => r.id === e.id)));
    for (const e of remaining) {
      if (result.length >= count) break;
      result.push(e);
    }
  }
  return result;
}

// Legacy compat
export const databaseEsercizi: Record<string, Exercise[]> = EXERCISE_LIBRARY.reduce((acc, e) => {
  if (!acc[e.attrezzo]) acc[e.attrezzo] = [];
  acc[e.attrezzo].push(e);
  return acc;
}, {} as Record<string, Exercise[]>);

export const cardioAlternativo: Exercise[] = [
  { id: "jumping_jacks_cardio", nome: "Jumping Jacks", attrezzo: "Corpo Libero", livello: "base", muscoli: ["corpo intero"], categoria: "cardio", descrizione: "Saltelli aprendo braccia e gambe." },
  { id: "corsa_sul_posto", nome: "Corsa sul posto", attrezzo: "Corpo Libero", livello: "base", muscoli: ["gambe", "cardiovascolare"], categoria: "cardio", descrizione: "Corri sul posto con ginocchia alte." },
  { id: "mountain_climber_cardio", nome: "Mountain Climbers", attrezzo: "Corpo Libero", livello: "medio", muscoli: ["core", "spalle", "gambe"], categoria: "cardio", descrizione: "In plank, porta le ginocchia al petto alternandole." },
  { id: "burpees_slow", nome: "Burpees (Slow)", attrezzo: "Corpo Libero", livello: "medio", muscoli: ["corpo intero"], categoria: "cardio", descrizione: "Da eretti a plank e ritorno." },
];
