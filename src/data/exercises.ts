// Barrel file - re-exports everything from split modules
export type { Exercise, FocusInfo } from "./exercise-types";
export { CONFIG_LIVELLI, TUTTI_GLI_ATTREZZI, ATTREZZO_ICONS, ATTREZZO_SHORT, TEMA_CONFIG, suggerimentiNutrizionali, detectFocus } from "./exercise-types";
export type { DayPlan, WeekPlan } from "./exercise-types";

import { Exercise, FocusInfo, detectFocus } from "./exercise-types";
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
// HELPERS
// ============================================================

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LIVELLO_ACCESSO: Record<string, string[]> = {
  "BASSO": ["base"],
  "MEDIO": ["base", "medio"],
  "AVANZATO": ["base", "medio", "avanzato"],
};

function livelloAccessibile(eserLivello: string, userLivello: string): boolean {
  const accesso = LIVELLO_ACCESSO[userLivello] || ["base", "medio", "avanzato"];
  return accesso.includes(eserLivello);
}

// ============================================================
// WEEKLY FOCUS STRUCTURE (consistent across weeks)
// ============================================================

export type DayFocus = "core_stabilita" | "gambe_glutei" | "full_body_mobilita";

const DAY_FOCUS_PATTERN: DayFocus[] = ["core_stabilita", "gambe_glutei", "full_body_mobilita"];

const FOCUS_SLOTS: Record<DayFocus, string[][]> = {
  core_stabilita: [["core"], ["core"], ["stabilità"], ["core"], ["schiena"], ["mobilità"]],
  gambe_glutei: [["gambe"], ["glutei"], ["gambe", "glutei"], ["core"], ["stabilità"], ["mobilità"]],
  full_body_mobilita: [["core"], ["gambe", "glutei"], ["braccia", "schiena"], ["stabilità"], ["mobilità"], ["cardio"]],
};

export const FOCUS_LABELS: Record<DayFocus, { label: string; icon: string }> = {
  core_stabilita: { label: "Core & Stabilità", icon: "🎯" },
  gambe_glutei: { label: "Gambe & Glutei", icon: "🦵" },
  full_body_mobilita: { label: "Full Body & Mobilità", icon: "🔥" },
};

// ============================================================
// PROGRESSION CONTEXT
// ============================================================

export interface ProgressionContext {
  /** Which week number in the cycle (1-based, wraps after 4) */
  weekNumber: number;
  /** IDs of exercises used in the last 2 weeks */
  recentExerciseIds: string[];
  /** Equipment used last week (to rotate away from) */
  lastWeekEquipment: string[];
  /** Total completed workouts (for adaptive difficulty) */
  totalCompleted: number;
  /** Consecutive weeks with ≥2 completed workouts */
  activeStreak: number;
  /** Weeks since last completed workout (0 = this week) */
  weeksSinceLastWorkout: number;
}

/**
 * Compute progression context from storicoCal history.
 */
export function computeProgressionContext(
  storicoCal: Record<string, any>,
  lastWeekEquipment: string[]
): ProgressionContext {
  const entries = Object.entries(storicoCal).filter(([_, v]) => v?.completato);
  const totalCompleted = entries.length;

  // Determine week number based on total completed (cycle of 4)
  const weekNumber = (Math.floor(totalCompleted / 3) % 4) + 1;

  // Recent exercise IDs (last 2 weeks = last 6 workouts roughly)
  // We don't have per-exercise history in storicoCal, so this comes from allenamentiData.storico
  // passed separately

  // Active streak: count consecutive weeks with ≥2 completed
  let activeStreak = 0;
  const now = new Date();
  for (let w = 0; w < 52; w++) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1 - w * 7);
    let weekCompleted = 0;
    for (let d = 0; d < 7; d++) {
      const dd = new Date(weekStart);
      dd.setDate(dd.getDate() + d);
      const key = dd.toISOString().split("T")[0];
      if (storicoCal[key]?.completato) weekCompleted++;
    }
    if (weekCompleted >= 2) activeStreak++;
    else if (w > 0) break;
  }

  // Weeks since last workout
  let weeksSinceLastWorkout = 0;
  if (entries.length > 0) {
    const lastDate = entries.map(([k]) => k).sort().pop()!;
    const diffMs = now.getTime() - new Date(lastDate).getTime();
    weeksSinceLastWorkout = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  }

  return {
    weekNumber,
    recentExerciseIds: [], // filled by caller from allenamentiData
    lastWeekEquipment,
    totalCompleted,
    activeStreak,
    weeksSinceLastWorkout,
  };
}

// ============================================================
// SMART EQUIPMENT ROTATION
// ============================================================

/**
 * Select 3 equipment types, rotating away from last week's selection.
 */
export function selezionaAttrezziSettimana(
  attrezziUtente: string[],
  lastWeekEquipment: string[] = []
): string[] {
  const normalized = attrezziUtente.map(a => a === "Pesi(da 1 a 4kg)" ? "Pesi" : a);
  if (normalized.length === 0) return [];

  if (normalized.length <= 3) {
    const result = [...normalized];
    while (result.length < 3) result.push(normalized[result.length % normalized.length]);
    return result;
  }

  // Prefer equipment NOT used last week
  const fresh = normalized.filter(a => !lastWeekEquipment.includes(a));
  const stale = normalized.filter(a => lastWeekEquipment.includes(a));

  const picked: string[] = [];
  const freshShuffled = shuffle(fresh);
  const staleShuffled = shuffle(stale);

  // Pick from fresh first, then fill from stale
  for (const a of [...freshShuffled, ...staleShuffled]) {
    if (picked.length >= 3) break;
    if (!picked.includes(a)) picked.push(a);
  }

  return picked;
}

// ============================================================
// PROGRESSION-AWARE EXERCISE GENERATION
// ============================================================

/**
 * Determine effective difficulty level based on progression context.
 * Adapts up if user is consistent, down if they've been away.
 */
function getEffectiveLevel(baseLivello: string, ctx: ProgressionContext): string {
  // If user has been away >1 week, ease back in
  if (ctx.weeksSinceLastWorkout > 1) {
    if (baseLivello === "AVANZATO") return "MEDIO";
    return baseLivello;
  }

  // No auto-upgrade of user's chosen level, but we adjust exercise selection
  return baseLivello;
}

/**
 * Get the target exercise count based on progression week.
 * Week 1: 6, Week 2: 6, Week 3: 7, Week 4: 7-8
 */
function getTargetCount(weekNumber: number, baseLivello: string): number {
  const base = baseLivello === "AVANZATO" ? 7 : 6;
  if (weekNumber <= 2) return base;
  if (weekNumber === 3) return base + 1;
  return base + (baseLivello === "AVANZATO" ? 1 : Math.random() > 0.5 ? 1 : 0);
}

/**
 * Determine level preference for exercise selection based on week.
 * Earlier weeks: prefer base, later weeks: prefer medio/avanzato.
 */
function getLevelPreference(weekNumber: number, baseLivello: string): string[] {
  const accessible = LIVELLO_ACCESSO[baseLivello] || ["base", "medio", "avanzato"];

  if (accessible.length === 1) return accessible;

  // Week 1-2: mostly simpler exercises
  if (weekNumber <= 2) {
    return accessible.length >= 2
      ? [accessible[0], accessible[0], accessible[1]] // 66% base
      : accessible;
  }
  // Week 3: balanced
  if (weekNumber === 3) {
    return accessible;
  }
  // Week 4: prefer harder
  return accessible.length >= 2
    ? [accessible[accessible.length - 1], accessible[accessible.length - 1], ...accessible]
    : accessible;
}

/**
 * Generate exercises for a single day with progression awareness.
 */
export function generaEserciziGiorno(
  attrezzo: string,
  livello: string,
  storici: string[] = [],
  focus?: string,
  progressionCtx?: ProgressionContext
): Exercise[] {
  const ctx = progressionCtx || { weekNumber: 1, recentExerciseIds: [], lastWeekEquipment: [], totalCompleted: 0, activeStreak: 0, weeksSinceLastWorkout: 0 };
  const effectiveLevel = getEffectiveLevel(livello, ctx);
  const targetCount = getTargetCount(ctx.weekNumber, effectiveLevel);

  // Filter exercises for this equipment and accessible level
  const disponibili = EXERCISE_LIBRARY.filter(e =>
    e.attrezzo === attrezzo && livelloAccessibile(e.livello, effectiveLevel)
  );
  if (disponibili.length === 0) return [];

  // Combine storici with recent exercise IDs to avoid repetition
  const allRecent = new Set([...storici, ...ctx.recentExerciseIds]);
  let pool = disponibili.filter(e => !allRecent.has(e.id));
  if (pool.length < targetCount) pool = disponibili;

  // Apply level preference weighting
  const levelPref = getLevelPreference(ctx.weekNumber, effectiveLevel);
  pool = weightByLevel(pool, levelPref);

  // Determine focus slots
  let dayFocus: DayFocus | undefined;
  let prioritySlots: string[][];

  if (focus === "core" || focus === "core_stabilita") {
    dayFocus = "core_stabilita";
    prioritySlots = [...FOCUS_SLOTS.core_stabilita];
  } else if (focus === "lower_body" || focus === "gambe_glutei") {
    dayFocus = "gambe_glutei";
    prioritySlots = [...FOCUS_SLOTS.gambe_glutei];
  } else if (focus === "full_body" || focus === "full_body_mobilita" || focus === "tonificazione") {
    dayFocus = "full_body_mobilita";
    prioritySlots = [...FOCUS_SLOTS.full_body_mobilita];
  } else {
    // Default: full body
    prioritySlots = [...FOCUS_SLOTS.full_body_mobilita];
  }

  // Week 4: add an extra slot
  if (ctx.weekNumber >= 4 && prioritySlots.length < targetCount) {
    prioritySlots.push(["core", "gambe", "glutei", "braccia"]);
  }

  return pickBalanced(pool, prioritySlots, Math.max(6, Math.min(targetCount, pool.length)));
}

/**
 * Weight pool by level preference - duplicate preferred-level exercises.
 */
function weightByLevel(pool: Exercise[], levelPref: string[]): Exercise[] {
  if (levelPref.length === 0) return pool;

  const counts: Record<string, number> = {};
  levelPref.forEach(l => { counts[l] = (counts[l] || 0) + 1; });
  const maxCount = Math.max(...Object.values(counts));

  // For levels with higher preference, include them more in the shuffled pool
  const weighted: Exercise[] = [];
  pool.forEach(e => {
    const weight = counts[e.livello] || 1;
    // Add exercise once but use weight for sort priority
    weighted.push(e);
  });

  // Sort so preferred levels come first, then shuffle within groups
  const byLevel: Record<string, Exercise[]> = {};
  weighted.forEach(e => {
    if (!byLevel[e.livello]) byLevel[e.livello] = [];
    byLevel[e.livello].push(e);
  });

  const result: Exercise[] = [];
  // Add preferred levels first
  const sortedLevels = Object.keys(byLevel).sort((a, b) => (counts[b] || 0) - (counts[a] || 0));
  sortedLevels.forEach(l => {
    result.push(...shuffle(byLevel[l]));
  });

  return result;
}

function pickBalanced(pool: Exercise[], prioritySlots: string[][], count: number): Exercise[] {
  const byCat: Record<string, Exercise[]> = {};
  pool.forEach(e => {
    if (!byCat[e.categoria]) byCat[e.categoria] = [];
    byCat[e.categoria].push(e);
  });
  // Don't re-shuffle - pool is already weighted/ordered

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

// ============================================================
// SMART WEEK GENERATION (replaces simple generation in Index.tsx)
// ============================================================

export interface GeneratedWeek {
  piano: Record<string, { attrezzo: string; round: number }>;
  esercizi: Record<string, Exercise[]>;
  storico: Record<string, string[]>;
  focusPerDay: Record<string, DayFocus>;
}

/**
 * Generate a full week with smart progression.
 * Assigns focus per day, rotates equipment, respects history.
 */
export function generaSettimanaIntelligente(
  attrezziUtente: string[],
  livello: string,
  previousStorico: Record<string, string[]>,
  storicoCal: Record<string, any>,
  lastWeekEquipment: string[]
): GeneratedWeek {
  const ctx = computeProgressionContext(storicoCal, lastWeekEquipment);
  const attrezziSettimana = selezionaAttrezziSettimana(attrezziUtente, lastWeekEquipment);
  const giorni = ["Lunedì", "Mercoledì", "Venerdì"];

  const piano: Record<string, { attrezzo: string; round: number }> = {};
  const esercizi: Record<string, Exercise[]> = {};
  const focusPerDay: Record<string, DayFocus> = {};
  let runningStorico = Object.values(previousStorico).flat();

  giorni.forEach((giorno, i) => {
    const attrezzo = attrezziSettimana[i];
    const dayFocus = DAY_FOCUS_PATTERN[i];

    // Pass recent IDs to avoid repetition
    ctx.recentExerciseIds = runningStorico;

    const dayExercises = generaEserciziGiorno(attrezzo, livello, [], dayFocus, ctx);

    piano[giorno] = { attrezzo, round: 0 };
    esercizi[giorno] = dayExercises;
    focusPerDay[giorno] = dayFocus;

    // Add to running storico for next day's generation
    runningStorico = [...runningStorico, ...dayExercises.map(e => e.id)];
  });

  // Build updated storico
  const nuovoStorico = { ...previousStorico };
  giorni.forEach(g => {
    const att = piano[g].attrezzo;
    nuovoStorico[att] = [...(nuovoStorico[att] || []), ...esercizi[g].map(e => e.id)];
  });

  return { piano, esercizi, storico: nuovoStorico, focusPerDay };
}

// ============================================================
// LEGACY COMPAT
// ============================================================

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
