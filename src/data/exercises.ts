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
// DATE UTILITIES
// ============================================================

const DAY_NAMES: Record<number, string> = {
  0: "Domenica", 1: "Lunedì", 2: "Martedì", 3: "Mercoledì",
  4: "Giovedì", 5: "Venerdì", 6: "Sabato",
};

const MONTH_NAMES = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

/**
 * Get the Monday of the current week.
 */
export function getMondayOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

/**
 * Get dates for the given day-of-week numbers in the current week.
 * @param giorniSettimana Array of day numbers (0=Sun, 1=Mon, ..., 6=Sat)
 */
export function getWeekDates(giorniSettimana: number[], refDate: Date = new Date()): string[] {
  const monday = getMondayOfWeek(refDate);
  return giorniSettimana.map(dayNum => {
    const d = new Date(monday);
    const offset = dayNum === 0 ? 6 : dayNum - 1; // Mon=0 offset, Tue=1, ..., Sun=6
    d.setDate(d.getDate() + offset);
    return d.toISOString().split("T")[0];
  });
}

/**
 * Format a date key "YYYY-MM-DD" to "Lunedì 10 Mar"
 */
export function formatDateLabel(dateKey: string): string {
  const d = new Date(dateKey + "T00:00:00");
  const dayName = DAY_NAMES[d.getDay()] || "";
  const dayNum = d.getDate();
  const month = MONTH_NAMES[d.getMonth()] || "";
  return `${dayName} ${dayNum} ${month}`;
}

/**
 * Check if a piano's keys belong to the current week for the given training days.
 */
export function isPianoCurrentWeek(piano: Record<string, any>, giorniSettimana: number[]): boolean {
  const expectedDates = getWeekDates(giorniSettimana);
  const pianoKeys = Object.keys(piano);
  if (pianoKeys.length === 0) return false;
  // Check if at least one expected date is in the piano
  return expectedDates.some(d => pianoKeys.includes(d));
}

// ============================================================
// PROGRESSION CONTEXT
// ============================================================

export interface ProgressionContext {
  weekNumber: number;
  recentExerciseIds: string[];
  lastWeekEquipment: string[];
  totalCompleted: number;
  activeStreak: number;
  weeksSinceLastWorkout: number;
}

export function computeProgressionContext(
  storicoCal: Record<string, any>,
  lastWeekEquipment: string[]
): ProgressionContext {
  const entries = Object.entries(storicoCal).filter(([_, v]) => v?.completato);
  const totalCompleted = entries.length;
  const weekNumber = (Math.floor(totalCompleted / 3) % 4) + 1;

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

  let weeksSinceLastWorkout = 0;
  if (entries.length > 0) {
    const lastDate = entries.map(([k]) => k).sort().pop()!;
    const diffMs = now.getTime() - new Date(lastDate).getTime();
    weeksSinceLastWorkout = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  }

  return {
    weekNumber,
    recentExerciseIds: [],
    lastWeekEquipment,
    totalCompleted,
    activeStreak,
    weeksSinceLastWorkout,
  };
}

// ============================================================
// SMART EQUIPMENT ROTATION
// ============================================================

export function selezionaAttrezziSettimana(
  attrezziUtente: string[],
  lastWeekEquipment: string[] = [],
  count: number = 3
): string[] {
  const normalized = attrezziUtente.map(a => a === "Pesi(da 1 a 4kg)" ? "Pesi" : a);
  if (normalized.length === 0) return [];

  if (normalized.length <= count) {
    const result = [...normalized];
    while (result.length < count) result.push(normalized[result.length % normalized.length]);
    return result;
  }

  const fresh = normalized.filter(a => !lastWeekEquipment.includes(a));
  const stale = normalized.filter(a => lastWeekEquipment.includes(a));

  const picked: string[] = [];
  const freshShuffled = shuffle(fresh);
  const staleShuffled = shuffle(stale);

  for (const a of [...freshShuffled, ...staleShuffled]) {
    if (picked.length >= count) break;
    if (!picked.includes(a)) picked.push(a);
  }

  return picked;
}

// ============================================================
// PROGRESSION-AWARE EXERCISE GENERATION
// ============================================================

function getEffectiveLevel(baseLivello: string, ctx: ProgressionContext): string {
  if (ctx.weeksSinceLastWorkout > 1) {
    if (baseLivello === "AVANZATO") return "MEDIO";
    return baseLivello;
  }
  return baseLivello;
}

function getTargetCount(weekNumber: number, baseLivello: string): number {
  const base = baseLivello === "AVANZATO" ? 7 : 6;
  if (weekNumber <= 2) return base;
  if (weekNumber === 3) return base + 1;
  return base + (baseLivello === "AVANZATO" ? 1 : Math.random() > 0.5 ? 1 : 0);
}

function getLevelPreference(weekNumber: number, baseLivello: string): string[] {
  const accessible = LIVELLO_ACCESSO[baseLivello] || ["base", "medio", "avanzato"];
  if (accessible.length === 1) return accessible;
  if (weekNumber <= 2) {
    return accessible.length >= 2 ? [accessible[0], accessible[0], accessible[1]] : accessible;
  }
  if (weekNumber === 3) return accessible;
  return accessible.length >= 2
    ? [accessible[accessible.length - 1], accessible[accessible.length - 1], ...accessible]
    : accessible;
}

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

  const disponibili = EXERCISE_LIBRARY.filter(e =>
    e.attrezzo === attrezzo && livelloAccessibile(e.livello, effectiveLevel)
  );
  if (disponibili.length === 0) return [];

  const allRecent = new Set([...storici, ...ctx.recentExerciseIds]);
  let pool = disponibili.filter(e => !allRecent.has(e.id));
  if (pool.length < targetCount) pool = disponibili;

  const levelPref = getLevelPreference(ctx.weekNumber, effectiveLevel);
  pool = weightByLevel(pool, levelPref);

  let prioritySlots: string[][];

  if (focus === "core" || focus === "core_stabilita") {
    prioritySlots = [...FOCUS_SLOTS.core_stabilita];
  } else if (focus === "lower_body" || focus === "gambe_glutei") {
    prioritySlots = [...FOCUS_SLOTS.gambe_glutei];
  } else if (focus === "full_body" || focus === "full_body_mobilita" || focus === "tonificazione") {
    prioritySlots = [...FOCUS_SLOTS.full_body_mobilita];
  } else {
    prioritySlots = [...FOCUS_SLOTS.full_body_mobilita];
  }

  if (ctx.weekNumber >= 4 && prioritySlots.length < targetCount) {
    prioritySlots.push(["core", "gambe", "glutei", "braccia"]);
  }

  return pickBalanced(pool, prioritySlots, Math.max(6, Math.min(targetCount, pool.length)));
}

function weightByLevel(pool: Exercise[], levelPref: string[]): Exercise[] {
  if (levelPref.length === 0) return pool;
  const counts: Record<string, number> = {};
  levelPref.forEach(l => { counts[l] = (counts[l] || 0) + 1; });

  const byLevel: Record<string, Exercise[]> = {};
  pool.forEach(e => {
    if (!byLevel[e.livello]) byLevel[e.livello] = [];
    byLevel[e.livello].push(e);
  });

  const result: Exercise[] = [];
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

  const result: Exercise[] = [];

  for (const slot of prioritySlots) {
    if (result.length >= count) break;
    const availableCats = shuffle(slot.filter(c => byCat[c] && byCat[c].length > 0));
    if (availableCats.length > 0) {
      result.push(byCat[availableCats[0]].shift()!);
    }
  }

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
// SMART WEEK GENERATION (date-based keys)
// ============================================================

export interface GeneratedWeek {
  piano: Record<string, { attrezzo: string; round: number }>;
  esercizi: Record<string, Exercise[]>;
  storico: Record<string, string[]>;
  focusPerDay: Record<string, DayFocus>;
}

/**
 * Generate a full week with smart progression.
 * Keys are now ISO date strings (YYYY-MM-DD).
 */
export function generaSettimanaIntelligente(
  attrezziUtente: string[],
  livello: string,
  previousStorico: Record<string, string[]>,
  storicoCal: Record<string, any>,
  lastWeekEquipment: string[],
  giorniSettimana: number[] = [1, 3, 5]
): GeneratedWeek {
  const ctx = computeProgressionContext(storicoCal, lastWeekEquipment);
  const dateKeys = getWeekDates(giorniSettimana);
  const attrezziSettimana = selezionaAttrezziSettimana(attrezziUtente, lastWeekEquipment, dateKeys.length);

  const piano: Record<string, { attrezzo: string; round: number }> = {};
  const esercizi: Record<string, Exercise[]> = {};
  const focusPerDay: Record<string, DayFocus> = {};
  let runningStorico = Object.values(previousStorico).flat();

  dateKeys.forEach((dateKey, i) => {
    const attrezzo = attrezziSettimana[i % attrezziSettimana.length];
    const dayFocus = DAY_FOCUS_PATTERN[i % DAY_FOCUS_PATTERN.length];

    ctx.recentExerciseIds = runningStorico;

    const dayExercises = generaEserciziGiorno(attrezzo, livello, [], dayFocus, ctx);

    piano[dateKey] = { attrezzo, round: 0 };
    esercizi[dateKey] = dayExercises;
    focusPerDay[dateKey] = dayFocus;

    runningStorico = [...runningStorico, ...dayExercises.map(e => e.id)];
  });

  const nuovoStorico = { ...previousStorico };
  dateKeys.forEach(dk => {
    const att = piano[dk].attrezzo;
    nuovoStorico[att] = [...(nuovoStorico[att] || []), ...esercizi[dk].map(e => e.id)];
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
