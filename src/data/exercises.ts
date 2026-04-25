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

export type DayFocus = "upper_body" | "lower_body" | "total_body";

export const DAY_FOCUS_PATTERN: DayFocus[] = ["upper_body", "lower_body", "total_body"];

/**
 * FIXED training days: Monday (1), Wednesday (3), Friday (5).
 * This is the canonical source of truth — never changes.
 */
export const FIXED_TRAINING_DAYS: number[] = [1, 3, 5];

/**
 * Fixed weekday-to-focus mapping:
 * Monday (1) → Upper Body, Wednesday (3) → Lower Body, Friday (5) → Total Body.
 * Other days get a round-robin fallback.
 */
export const WEEKDAY_FOCUS_MAP: Record<number, DayFocus> = {
  1: "upper_body",   // Lunedì
  3: "lower_body",   // Mercoledì
  5: "total_body",   // Venerdì
};

export function getFocusForWeekday(dayOfWeek: number, fallbackIndex: number = 0): DayFocus {
  return WEEKDAY_FOCUS_MAP[dayOfWeek] ?? DAY_FOCUS_PATTERN[fallbackIndex % DAY_FOCUS_PATTERN.length];
}

/**
 * Muscle-group slots for each focus type.
 * Each slot is a list of muscoli/categoria to look for.
 */
const FOCUS_SLOTS: Record<DayFocus, string[][]> = {
  upper_body: [
    ["schiena"],           // mandatory
    ["braccia", "schiena"], // petto/tricipiti
    ["schiena", "braccia"], // dorsali
    ["braccia", "schiena", "stabilità"], // spalle
    ["core"],              // addominali (mandatory)
    ["core", "stabilità"], // fianchi/obliqui (mandatory)
  ],
  lower_body: [
    ["gambe"],             // quadricipiti
    ["glutei"],            // glutei
    ["gambe"],             // femorali
    ["gambe"],             // interno coscia (mandatory)
    ["core"],              // addominali (mandatory)
    ["core"],              // fianchi/obliqui (mandatory)
  ],
  total_body: [
    ["schiena", "braccia"], // upper
    ["gambe", "glutei"],    // lower
    ["braccia", "schiena", "stabilità"], // upper
    ["gambe", "glutei"],    // lower
    ["core"],              // addominali (mandatory)
    ["core", "stabilità"], // fianchi/obliqui (mandatory)
  ],
};

const FOCUS_PREFERRED_CATEGORIES: Record<DayFocus, string[]> = {
  upper_body: ["schiena", "braccia", "stabilità", "core"],
  lower_body: ["gambe", "glutei", "core", "stabilità"],
  total_body: ["schiena", "braccia", "gambe", "glutei", "core", "stabilità"],
};

export const FOCUS_LABELS: Record<DayFocus, { label: string; icon: string }> = {
  upper_body: { label: "Upper Body", icon: "💪" },
  lower_body: { label: "Lower Body", icon: "🦵" },
  total_body: { label: "Total Body", icon: "🔥" },
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
 * Local date key formatter to avoid timezone shifts from toISOString.
 */
export function getLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

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
  const buildWeekDates = (monday: Date) =>
    giorniSettimana.map(dayNum => {
      const d = new Date(monday);
      const offset = dayNum === 0 ? 6 : dayNum - 1; // Mon=0 offset, Tue=1, ..., Sun=6
      d.setDate(d.getDate() + offset);
      return getLocalDateKey(d);
    });

  const monday = getMondayOfWeek(refDate);
  const currentWeekDates = buildWeekDates(monday);

  // The week rolls over only on Sunday evening (>=18:00) or on Monday.
  // This keeps the current week's plan visible through Saturday and most of Sunday,
  // so users can still complete a missed session on the day after their last training day.
  const dayOfWeek = refDate.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  const hour = refDate.getHours();
  const isSundayEvening = dayOfWeek === 0 && hour >= 18;

  if (isSundayEvening) {
    const nextMonday = new Date(monday);
    nextMonday.setDate(nextMonday.getDate() + 7);
    return buildWeekDates(nextMonday);
  }

  return currentWeekDates;
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
 * Check if a piano's keys exactly match the current week's expected dates.
 */
export function isPianoCurrentWeek(piano: Record<string, any>, giorniSettimana: number[]): boolean {
  const expectedDates = getWeekDates(giorniSettimana);
  const pianoKeys = Object.keys(piano).sort();
  if (pianoKeys.length === 0) return false;
  if (pianoKeys.length !== expectedDates.length) return false;
  const sortedExpected = [...expectedDates].sort();
  return sortedExpected.every((d, i) => d === pianoKeys[i]);
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
      const key = getLocalDateKey(dd);
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
  const orderedEquipment = getOrderedWeeklyEquipment(attrezziUtente, lastWeekEquipment);
  if (orderedEquipment.length === 0) return [];

  if (orderedEquipment.length <= count) {
    const result = [...orderedEquipment];
    while (result.length < count) result.push(orderedEquipment[result.length % orderedEquipment.length]);
    return result;
  }

  return orderedEquipment.slice(0, count);
}

function getOrderedWeeklyEquipment(
  attrezziUtente: string[],
  lastWeekEquipment: string[] = []
): string[] {
  const normalized = Array.from(new Set(attrezziUtente.map(a => a === "Pesi(da 1 a 4kg)" ? "Pesi" : a)));
  if (normalized.length === 0) return [];

  const fresh = normalized.filter(a => !lastWeekEquipment.includes(a));
  const stale = normalized.filter(a => lastWeekEquipment.includes(a));

  return [...shuffle(fresh), ...shuffle(stale)];
}

/**
 * Returns true when the user has enough equipment to guarantee
 * no overlap between the current week and the previous one.
 * Requires: total selected equipment >= trainingDays * 2.
 */
function canFullyAvoidLastWeek(
  attrezziUtente: string[],
  lastWeekEquipment: string[],
  trainingDays: number
): boolean {
  const normalized = new Set(attrezziUtente.map(a => a === "Pesi(da 1 a 4kg)" ? "Pesi" : a));
  const lastNormalized = new Set(lastWeekEquipment.map(a => a === "Pesi(da 1 a 4kg)" ? "Pesi" : a));
  const fresh = [...normalized].filter(a => !lastNormalized.has(a));
  return fresh.length >= trainingDays;
}

function getEquipmentCategoryCounts(attrezzo: string, livello: string) {
  const disponibili = EXERCISE_LIBRARY.filter(e =>
    e.attrezzo === attrezzo && livelloAccessibile(e.livello, livello)
  );

  const counts = disponibili.reduce<Record<string, number>>((acc, exercise) => {
    acc[exercise.categoria] = (acc[exercise.categoria] || 0) + 1;
    return acc;
  }, {});

  return {
    total: disponibili.length,
    upper: (counts.schiena || 0) + (counts.braccia || 0),
    lower: (counts.gambe || 0) + (counts.glutei || 0),
    core: (counts.core || 0) + (counts.stabilità || 0),
  };
}

function equipmentSupportsFocus(attrezzo: string, livello: string, focus: DayFocus): boolean {
  const counts = getEquipmentCategoryCounts(attrezzo, livello);
  if (counts.total === 0) return false;

  if (focus === "upper_body") return counts.upper >= 3 && counts.core >= 1;
  if (focus === "lower_body") return counts.lower >= 3 && counts.core >= 1;

  return counts.upper >= 1 && counts.lower >= 2 && counts.core >= 1;
}

function selectEquipmentForFocus(
  orderedEquipment: string[],
  livello: string,
  focus: DayFocus,
  usedEquipment: string[] = [],
  forbiddenEquipment: string[] = []
): string {
  const forbidden = new Set(forbiddenEquipment);
  const used = new Set(usedEquipment);

  const compatible = orderedEquipment.filter(a => equipmentSupportsFocus(a, livello, focus));

  // 1st choice: compatible, not used this week, not used last week
  const ideal = compatible.filter(a => !used.has(a) && !forbidden.has(a));
  if (ideal.length > 0) return ideal[0];

  // 2nd: compatible, not used this week (allow last week if needed)
  const unusedCompatible = compatible.filter(a => !used.has(a));
  if (unusedCompatible.length > 0) return unusedCompatible[0];

  // 3rd: any compatible, preferring those not used last week
  const compatibleFresh = compatible.filter(a => !forbidden.has(a));
  if (compatibleFresh.length > 0) return compatibleFresh[0];
  if (compatible.length > 0) return compatible[0];

  // 4th: Corpo Libero fallback if available
  if (!orderedEquipment.includes("Corpo Libero") && equipmentSupportsFocus("Corpo Libero", livello, focus)) {
    return "Corpo Libero";
  }

  const unusedAny = orderedEquipment.filter(a => !used.has(a));
  return unusedAny[0] || orderedEquipment[0] || "Corpo Libero";
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
  let preferredCategories: string[];

  if (focus === "upper_body" || focus === "core" || focus === "core_stabilita") {
    prioritySlots = [...FOCUS_SLOTS.upper_body];
    preferredCategories = FOCUS_PREFERRED_CATEGORIES.upper_body;
  } else if (focus === "lower_body" || focus === "gambe_glutei") {
    prioritySlots = [...FOCUS_SLOTS.lower_body];
    preferredCategories = FOCUS_PREFERRED_CATEGORIES.lower_body;
  } else if (focus === "total_body" || focus === "full_body" || focus === "full_body_mobilita" || focus === "tonificazione") {
    prioritySlots = [...FOCUS_SLOTS.total_body];
    preferredCategories = FOCUS_PREFERRED_CATEGORIES.total_body;
  } else {
    prioritySlots = [...FOCUS_SLOTS.total_body];
    preferredCategories = FOCUS_PREFERRED_CATEGORIES.total_body;
  }

  if (ctx.weekNumber >= 4 && prioritySlots.length < targetCount) {
    prioritySlots.push(["core", "gambe", "glutei", "braccia"]);
  }

  return pickBalanced(pool, prioritySlots, Math.max(6, Math.min(targetCount, pool.length)), preferredCategories);
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

function pickBalanced(pool: Exercise[], prioritySlots: string[][], count: number, preferredCategories: string[] = []): Exercise[] {
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
    const remaining = pool.filter(e => !result.find(r => r.id === e.id));
    const preferredSet = new Set(preferredCategories);
    const prioritized = shuffle(remaining.filter(e => preferredSet.has(e.categoria)));
    const fallback = shuffle(remaining.filter(e => !preferredSet.has(e.categoria)));

    for (const e of [...prioritized, ...fallback]) {
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
  const orderedEquipment = getOrderedWeeklyEquipment(attrezziUtente, lastWeekEquipment);

  // If user has enough equipment, forbid any equipment used last week.
  const enforceFreshWeek = canFullyAvoidLastWeek(attrezziUtente, lastWeekEquipment, dateKeys.length);
  const forbidden = enforceFreshWeek
    ? Array.from(new Set(lastWeekEquipment.map(a => a === "Pesi(da 1 a 4kg)" ? "Pesi" : a)))
    : [];

  const piano: Record<string, { attrezzo: string; round: number }> = {};
  const esercizi: Record<string, Exercise[]> = {};
  const focusPerDay: Record<string, DayFocus> = {};
  let runningStorico = Object.values(previousStorico).flat();
  const usedEquipment: string[] = [];

  dateKeys.forEach((dateKey, i) => {
    // Use fixed weekday-based focus: Mon→Upper, Wed→Lower, Fri→Total
    const dateObj = new Date(dateKey + "T00:00:00");
    const dayFocus = getFocusForWeekday(dateObj.getDay(), i);
    const attrezzo = selectEquipmentForFocus(orderedEquipment, livello, dayFocus, usedEquipment, forbidden);

    ctx.recentExerciseIds = runningStorico;

    const dayExercises = generaEserciziGiorno(attrezzo, livello, [], dayFocus, ctx);

    piano[dateKey] = { attrezzo, round: 0 };
    esercizi[dateKey] = dayExercises;
    focusPerDay[dateKey] = dayFocus;

    usedEquipment.push(attrezzo);
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
