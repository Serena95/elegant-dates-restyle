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
 * Token → synonyms used to match against either `categoria` or `muscoli`.
 * Lets us require granular muscle groups (e.g. "interno coscia", "spalle", "petto")
 * while staying compatible with the existing exercise tagging.
 */
const MUSCLE_TOKEN_SYNONYMS: Record<string, string[]> = {
  schiena: ["schiena", "dorsali", "romboidi", "erettori spinali", "trapezio"],
  spalle: ["spalle", "deltoidi"],
  braccia: ["braccia", "bicipiti", "tricipiti"],
  petto: ["petto", "pettorali"],
  glutei: ["glutei"],
  quadricipiti: ["quadricipiti", "gambe"],
  femorali: ["femorali", "ischiocrurali", "posteriori coscia"],
  "interno coscia": ["interno coscia", "adduttori"],
  core: ["core", "addominali", "addominali bassi", "obliqui", "trasverso", "stabilità"],
};

function exerciseMatchesToken(e: Exercise, token: string): boolean {
  const syn = MUSCLE_TOKEN_SYNONYMS[token] || [token];
  if (syn.includes(e.categoria)) return true;
  return e.muscoli.some(m => syn.includes(m.toLowerCase()));
}

/**
 * Muscle-group slots per focus. Each entry is a token (matched via synonyms above).
 * MANDATORY tokens are listed first; the engine will enforce they appear in the workout.
 */
const FOCUS_SLOTS: Record<DayFocus, string[][]> = {
  // Upper Body (Lunedì): schiena x2, core x2, spalle, braccia, petto + extra
  upper_body: [
    ["schiena"],
    ["core"],
    ["schiena"],
    ["core"],
    ["spalle"],
    ["braccia"],
    ["petto"],
    ["spalle", "braccia", "petto"],
    ["schiena", "spalle", "braccia", "petto"],
  ],
  // Lower Body (Mercoledì): glutei x2, core x2, quadricipiti, femorali, interno coscia
  lower_body: [
    ["interno coscia"],
    ["core"],
    ["glutei"],
    ["core"],
    ["glutei"],
    ["quadricipiti"],
    ["femorali"],
    ["interno coscia", "glutei", "quadricipiti", "femorali"],
    ["glutei", "quadricipiti", "femorali"],
  ],
  // Total Body (Venerdì): allenamento completo 8-10 esercizi
  total_body: [
    ["core"],
    ["schiena"],
    ["glutei"],
    ["core"],
    ["spalle", "petto"],
    ["quadricipiti", "femorali"],
    ["braccia"],
    ["schiena", "spalle", "petto", "braccia"],
    ["glutei", "quadricipiti", "femorali", "interno coscia"],
    ["core"],
  ],
};

/**
 * Minimum required occurrences per token for each focus.
 * Enforced after balanced selection — if below minimum, we swap in matching exercises.
 */
const MIN_PER_TOKEN: Record<DayFocus, Record<string, number>> = {
  upper_body: { schiena: 2, core: 2, spalle: 1, braccia: 1, petto: 1 },
  lower_body: { glutei: 2, core: 2, quadricipiti: 1, femorali: 1, "interno coscia": 1 },
  total_body: {
    core: 2,
    schiena: 1,
    glutei: 1,
  },
};

/**
 * Tokens that MUST appear in the final workout for each focus (legacy guard).
 */
const MANDATORY_TOKENS: Record<DayFocus, string[]> = {
  upper_body: ["schiena", "core"],
  lower_body: ["interno coscia", "core", "glutei"],
  total_body: ["core"],
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

const WEEKDAY_SHORT_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function getDatePartsInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: lookup.year,
    month: lookup.month,
    day: lookup.day,
  };
}

/**
 * Local date key formatter to avoid timezone shifts from toISOString.
 */
export function getLocalDateKey(date: Date, timeZone?: string): string {
  if (timeZone) {
    const parts = getDatePartsInTimeZone(date, timeZone);
    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey: string): Date {
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return new Date(NaN);

  const [, year, month, day] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

export function getWeekdayFromDateKey(dateKey: string): number {
  return parseDateKey(dateKey).getDay();
}

export function getWeekdayInTimeZone(date: Date, timeZone?: string): number {
  if (!timeZone) return date.getDay();
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(date);
  return WEEKDAY_SHORT_MAP[weekday] ?? date.getDay();
}

/**
 * Get the Monday of the current week.
 */
export function getMondayOfWeek(date: Date = new Date(), timeZone?: string): Date {
  if (timeZone) {
    const tzDate = parseDateKey(getLocalDateKey(date, timeZone));
    const day = getWeekdayInTimeZone(date, timeZone);
    const diff = tzDate.getDate() - day + (day === 0 ? -6 : 1);
    tzDate.setDate(diff);
    return tzDate;
  }

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
export function getWeekDates(giorniSettimana: number[], refDate: Date = new Date(), timeZone?: string): string[] {
  const buildWeekDates = (monday: Date) =>
    giorniSettimana.map(dayNum => {
      const d = new Date(monday);
      const offset = dayNum === 0 ? 6 : dayNum - 1; // Mon=0 offset, Tue=1, ..., Sun=6
      d.setDate(d.getDate() + offset);
      return getLocalDateKey(d);
    });

  const monday = getMondayOfWeek(refDate, timeZone);
  const currentWeekDates = buildWeekDates(monday);

  // No manual rollover override here:
  // the current week naturally changes on Monday because `getMondayOfWeek(refDate)`
  // already points to the new week's Monday.
  return currentWeekDates;
}

/**
 * Format a date key "YYYY-MM-DD" to "Lunedì 10 Mar"
 */
export function formatDateLabel(dateKey: string): string {
  const d = parseDateKey(dateKey);
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
    const diffMs = now.getTime() - parseDateKey(lastDate).getTime();
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

function getTargetCount(weekNumber: number, baseLivello: string, focus?: DayFocus): number {
  // Total body must be a complete workout (8-10). Upper/Lower 7-9.
  if (focus === "total_body") {
    if (baseLivello === "AVANZATO") return 10;
    if (baseLivello === "MEDIO") return 9;
    return 8;
  }
  // Upper / Lower
  if (baseLivello === "AVANZATO") return 9;
  if (baseLivello === "MEDIO") return 8;
  return 7;
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
  let dayFocus: DayFocus;
  if (focus === "upper_body" || focus === "core" || focus === "core_stabilita") {
    dayFocus = "upper_body";
  } else if (focus === "lower_body" || focus === "gambe_glutei") {
    dayFocus = "lower_body";
  } else {
    dayFocus = "total_body";
  }
  const targetCount = getTargetCount(ctx.weekNumber, effectiveLevel, dayFocus);

  const disponibili = EXERCISE_LIBRARY.filter(e =>
    e.attrezzo === attrezzo && livelloAccessibile(e.livello, effectiveLevel)
  );
  if (disponibili.length === 0) return [];

  const allRecent = new Set([...storici, ...ctx.recentExerciseIds]);
  let pool = disponibili.filter(e => !allRecent.has(e.id));
  if (pool.length < targetCount) pool = disponibili;

  const levelPref = getLevelPreference(ctx.weekNumber, effectiveLevel);
  pool = weightByLevel(pool, levelPref);

  const prioritySlots: string[][] = [...FOCUS_SLOTS[dayFocus]];
  const preferredCategories: string[] = FOCUS_PREFERRED_CATEGORIES[dayFocus];
  const mandatoryTokens: string[] = MANDATORY_TOKENS[dayFocus];
  const minPerToken = MIN_PER_TOKEN[dayFocus];

  return pickBalanced(
    pool,
    prioritySlots,
    Math.max(targetCount, Math.min(targetCount, pool.length)),
    preferredCategories,
    mandatoryTokens,
    minPerToken,
  );
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

function pickBalanced(
  pool: Exercise[],
  prioritySlots: string[][],
  count: number,
  preferredCategories: string[] = [],
  mandatoryTokens: string[] = [],
  minPerToken: Record<string, number> = {},
): Exercise[] {
  const used = new Set<string>();
  const result: Exercise[] = [];

  const takeForTokens = (tokens: string[]): Exercise | null => {
    const candidates = pool.filter(e => !used.has(e.id) && tokens.some(t => exerciseMatchesToken(e, t)));
    if (candidates.length === 0) return null;
    const picked = shuffle(candidates)[0];
    used.add(picked.id);
    return picked;
  };

  const countForToken = (token: string): number =>
    result.reduce((acc, e) => acc + (exerciseMatchesToken(e, token) ? 1 : 0), 0);

  // 1) Walk priority slots in order
  for (const slot of prioritySlots) {
    if (result.length >= count) break;
    const picked = takeForTokens(slot);
    if (picked) result.push(picked);
  }

  // 2) Enforce per-token minimums (e.g. schiena>=2, core>=2, glutei>=2)
  const minTokens = Object.keys(minPerToken);
  for (const token of minTokens) {
    const min = minPerToken[token] || 0;
    while (countForToken(token) < min) {
      const candidate = pool.find(e => !used.has(e.id) && exerciseMatchesToken(e, token));
      if (!candidate) break;
      if (result.length < count) {
        result.push(candidate);
        used.add(candidate.id);
      } else {
        // Replace an exercise that doesn't help any minimum requirement and isn't unique-mandatory
        const replaceableIdx = result.findIndex(e => {
          // Don't drop exercises that are the only contributor to a still-needed token
          for (const t of minTokens) {
            if (exerciseMatchesToken(e, t) && countForToken(t) <= (minPerToken[t] || 0)) return false;
          }
          return true;
        });
        if (replaceableIdx < 0) break;
        used.delete(result[replaceableIdx].id);
        result[replaceableIdx] = candidate;
        used.add(candidate.id);
      }
    }
  }

  // 3) Enforce mandatory tokens — if a required muscle group is still missing, swap in
  for (const token of mandatoryTokens) {
    const present = result.some(e => exerciseMatchesToken(e, token));
    if (present) continue;
    const candidate = pool.find(e => !used.has(e.id) && exerciseMatchesToken(e, token));
    if (!candidate) continue;
    if (result.length < count) {
      result.push(candidate);
      used.add(candidate.id);
    } else {
      const replaceableIdx = result.findIndex(e =>
        !mandatoryTokens.some(mt => exerciseMatchesToken(e, mt))
      );
      if (replaceableIdx >= 0) {
        used.delete(result[replaceableIdx].id);
        result[replaceableIdx] = candidate;
        used.add(candidate.id);
      }
    }
  }

  // 4) Fill remaining slots with preferred-category, then anything else
  if (result.length < count) {
    const remaining = pool.filter(e => !used.has(e.id));
    const preferredSet = new Set(preferredCategories);
    const prioritized = shuffle(remaining.filter(e => preferredSet.has(e.categoria)));
    const fallback = shuffle(remaining.filter(e => !preferredSet.has(e.categoria)));
    for (const e of [...prioritized, ...fallback]) {
      if (result.length >= count) break;
      result.push(e);
      used.add(e.id);
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
    const dayFocus = getFocusForWeekday(getWeekdayFromDateKey(dateKey), i);
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
