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
import { KETTLEBELL_EXERCISES } from "./exercises-kettlebell";
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
  ...KETTLEBELL_EXERCISES,
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

function normalizeEquipmentName(attrezzo: string): string {
  return attrezzo === "Pesi(da 1 a 4kg)" ? "Pesi" : attrezzo;
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
  // Core ESTESO: include addome, obliqui, fianchi, trasverso, punto vita
  // sia come categoria principale sia come muscolo primario coinvolto.
  // Questo amplia la varietà pescando anche da esercizi taggati mobilità/stabilità
  // ma il cui muscolo PRIMARIO è addominale/obliquo/fianchi.
  core: ["core", "addominali", "addominali bassi", "addominali alti", "obliqui", "trasverso", "punto vita", "fianchi", "core profondo"],
};

const CORE_PRIMARY_MUSCLES = new Set([
  "addominali", "addominali bassi", "addominali alti", "obliqui",
  "trasverso", "punto vita", "fianchi", "core profondo", "core",
]);

export function exerciseMatchesToken(e: Exercise, token: string): boolean {
  const syn = MUSCLE_TOKEN_SYNONYMS[token] || [token];
  // Core: categoria "core" OPPURE primo muscolo (PRIMARIO) appartiene al gruppo core.
  // Esclude esercizi dove il core è solo stabilizzatore secondario.
  if (token === "core") {
    if (e.categoria === "core") return true;
    const primary = (e.muscoli[0] || "").toLowerCase();
    return CORE_PRIMARY_MUSCLES.has(primary);
  }
  if (syn.includes(e.categoria)) return true;
  return e.muscoli.some(m => syn.includes(m.toLowerCase()));
}

/**
 * Muscle-group slots per focus. Each entry is a token (matched via synonyms above).
 * MANDATORY tokens are listed first; the engine will enforce they appear in the workout.
 */
const FOCUS_SLOTS: Record<DayFocus, string[][]> = {
  // Upper Body (Lunedì): schiena x2, core x3 (REALE), spalle, braccia, petto + extra
  upper_body: [
    ["core"],
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
  // Lower Body (Mercoledì): glutei x2, core x3 (REALE), interno coscia x2, quadricipiti, femorali
  lower_body: [
    ["interno coscia"],
    ["core"],
    ["glutei"],
    ["interno coscia"],
    ["core"],
    ["glutei"],
    ["core"],
    ["quadricipiti"],
    ["femorali"],
    ["glutei", "quadricipiti", "femorali"],
  ],
  // Total Body (Venerdì): core x2, interno coscia x2, full coverage
  total_body: [
    ["core"],
    ["schiena"],
    ["interno coscia"],
    ["glutei"],
    ["core"],
    ["interno coscia"],
    ["spalle", "petto"],
    ["quadricipiti", "femorali"],
    ["braccia"],
    ["schiena", "spalle", "petto", "braccia"],
  ],
};

/**
 * Minimum required occurrences per token for each focus.
 * Enforced after balanced selection — if below minimum, we swap in matching exercises.
 */
const MIN_PER_TOKEN: Record<DayFocus, Record<string, number>> = {
  // Upper Body: ≥3 core REALI + schiena/spalle/braccia/petto
  upper_body: { schiena: 2, core: 3, spalle: 1, braccia: 1, petto: 1 },
  // Lower Body: ≥3 core REALI + ≥2 interno coscia + glutei/quad/femorali
  lower_body: { glutei: 2, core: 3, quadricipiti: 1, femorali: 1, "interno coscia": 2 },
  // Total Body: ≥2 core REALI + ≥2 interno coscia + copertura completa
  total_body: {
    core: 2,
    "interno coscia": 2,
    schiena: 1,
    spalle: 1,
    petto: 1,
    glutei: 1,
    quadricipiti: 1,
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

/**
 * Tokens that MUST NOT appear in the workout for each focus.
 * Exercises matching any of these tokens (and not matching an allowed token)
 * are filtered out of the pool before selection.
 *
 * - Upper Body: vietati glutei/quadricipiti/femorali/interno coscia
 * - Lower Body: vietati schiena/spalle/braccia/petto
 * - Total Body: nessun divieto
 */
const FORBIDDEN_TOKENS: Record<DayFocus, string[]> = {
  upper_body: ["glutei", "quadricipiti", "femorali", "interno coscia"],
  lower_body: ["schiena", "spalle", "braccia", "petto"],
  total_body: [],
};

/**
 * Tokens considered "allowed" for the focus — used to keep an exercise that
 * touches a forbidden group only as a secondary muscle (e.g. core+glutei in
 * Upper would be excluded; pure core stays).
 */
const ALLOWED_TOKENS: Record<DayFocus, string[]> = {
  upper_body: ["schiena", "spalle", "braccia", "petto", "core"],
  lower_body: ["glutei", "quadricipiti", "femorali", "interno coscia", "core"],
  total_body: ["schiena", "spalle", "braccia", "petto", "glutei", "quadricipiti", "femorali", "interno coscia", "core"],
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
// WORKOUT INTERNAL PHASES (Attivazione → Pilates → Metabolico → Core finale)
// ============================================================

type WorkoutPhase = "attivazione" | "centrale" | "metabolica" | "core_finale";

/**
 * Heuristic phase classification based on existing categoria/muscoli.
 * - attivazione: mobilità + stabilità + core warm-up
 * - metabolica: cardio + esercizi dinamici (categoria cardio o nome contenente "jump"/"climb"/"burpee")
 * - core_finale: core (assegnato all'ultima posizione)
 * - centrale: tutto il resto (esercizi controllati stile pilates)
 */
function classifyExercisePhase(e: Exercise): WorkoutPhase {
  const cat = e.categoria;
  const nameLow = (e.nome || "").toLowerCase();
  if (cat === "cardio" || /jump|climb|burpee|skip|salto/.test(nameLow)) return "metabolica";
  if (cat === "mobilità" || cat === "stabilità") return "attivazione";
  if (cat === "core") return "centrale"; // verrà spostato al finale solo l'ultimo
  return "centrale";
}

/**
 * Reorder exercises into the required workout phases:
 * 1) Attivazione (mobilità/stabilità + 1 core)
 * 2) Centrale (esercizi controllati pilates)
 * 3) Metabolica (1-2 esercizi dinamici se presenti)
 * 4) Core finale (1 esercizio core)
 * Mantiene tutti gli esercizi, cambia solo l'ordine.
 */
function orderByPhases(exs: Exercise[]): Exercise[] {
  if (exs.length <= 3) return exs;

  const attivazione: Exercise[] = [];
  const centrale: Exercise[] = [];
  const metabolica: Exercise[] = [];
  const coreList: Exercise[] = [];

  for (const e of exs) {
    if (e.categoria === "core") coreList.push(e);
    else {
      const phase = classifyExercisePhase(e);
      if (phase === "attivazione") attivazione.push(e);
      else if (phase === "metabolica") metabolica.push(e);
      else centrale.push(e);
    }
  }

  // Distribuzione core: 1 in apertura (se presente), 1 in chiusura, resto in centrale
  const coreOpen = coreList.length > 1 ? [coreList.shift()!] : [];
  const coreFinal = coreList.length > 0 ? [coreList.pop()!] : [];
  const coreMid = coreList; // restanti core nel blocco centrale

  return [
    ...attivazione,
    ...coreOpen,
    ...centrale,
    ...coreMid,
    ...metabolica,
    ...coreFinal,
  ];
}

// ============================================================
// EQUIPMENT MIX — sempre ESATTAMENTE 3 attrezzi per workout:
//   • 1 primario (dominante, il più usato)
//   • 2 di supporto (coerenti con focus + gruppi muscolari)
// ============================================================

/**
 * Affinità deterministica attrezzo↔focus: punteggio basato sul numero di esercizi
 * disponibili dell'attrezzo che servono i token muscolari richiesti dal focus.
 * Più alto = più coerente con il tipo di allenamento.
 */
function equipmentFocusAffinity(attrezzo: string, livello: string, focus: DayFocus): number {
  const required = MIN_PER_TOKEN[focus] || {};
  let score = 0;
  for (const token of Object.keys(required)) {
    const count = countTokenForEquipment(attrezzo, livello, token);
    // Pesato sul minimo richiesto: più contribuisce a soddisfare i minimi, più punti
    score += Math.min(count, (required[token] || 0) * 2);
  }
  // Bonus se l'attrezzo copre tutti i token richiesti
  if (equipmentSupportsFocus(attrezzo, livello, focus)) score += 5;
  return score;
}

/**
 * Sceglie deterministicamente i 3 attrezzi (primario + 2 supporto) per il workout
 * tra quelli disponibili dell'utente, in modo logico e coerente con il focus.
 */
function selectThreeEquipment(
  primaryAttrezzo: string,
  livello: string,
  availableEquipment: string[],
  dayFocus: DayFocus,
  avoidAsSupport: string[] = [],
): { primary: string; support: string[] } {
  const normPrimary = normalizeEquipmentName(primaryAttrezzo);
  const userPool = Array.from(new Set(availableEquipment.map(normalizeEquipmentName)));
  const avoidSet = new Set(avoidAsSupport.map(normalizeEquipmentName));

  // Candidati di supporto: tutti gli attrezzi utente diversi dal primario
  const supportCandidates = userPool.filter(a => a !== normPrimary);

  // Ordinamento DETERMINISTICO: 1) preferisci attrezzi NON ancora usati come supporto
  // negli altri giorni della settimana (varietà tra giorni); 2) per affinità col focus;
  // 3) per nome (stabile).
  supportCandidates.sort((a, b) => {
    const aAvoid = avoidSet.has(a) ? 1 : 0;
    const bAvoid = avoidSet.has(b) ? 1 : 0;
    if (aAvoid !== bAvoid) return aAvoid - bAvoid;
    const sa = equipmentFocusAffinity(a, livello, dayFocus);
    const sb = equipmentFocusAffinity(b, livello, dayFocus);
    if (sb !== sa) return sb - sa;
    return a.localeCompare(b);
  });

  // Prendi i 2 di supporto più coerenti (e preferibilmente "freschi" nella settimana)
  const support: string[] = [];
  for (const a of supportCandidates) {
    if (support.length >= 2) break;
    support.push(a);
  }

  // Se l'utente ha < 3 attrezzi totali, completa con "Corpo Libero" (sempre disponibile,
  // garantisce esattamente 3 attrezzi anche con pool ridotto).
  while (support.length < 2) {
    const fallback = "Corpo Libero";
    if (fallback !== normPrimary && !support.includes(fallback)) {
      support.push(fallback);
    } else {
      // Edge case: primario è Corpo Libero e l'utente ha solo 1 attrezzo aggiuntivo
      // → usiamo qualunque altro attrezzo non ancora incluso
      const extra = userPool.find(a => a !== normPrimary && !support.includes(a));
      if (extra) support.push(extra);
      else break; // impossibile arrivare a 3 — accettiamo 2
    }
  }

  return { primary: normPrimary, support };
}

/**
 * Garantisce che il workout usi ESATTAMENTE i 3 attrezzi scelti, con:
 *   • il primario dominante (≥ ceil(N/2) esercizi)
 *   • ciascun supporto presente almeno 1 volta (se possibile data la libreria)
 *   • nessun attrezzo extra fuori dai 3
 * Sostituzioni preservano la categoria muscolare di ogni esercizio.
 */
function enforceThreeEquipment(
  exs: Exercise[],
  livello: string,
  primary: string,
  support: string[],
  dayFocus: DayFocus,
): Exercise[] {
  if (exs.length === 0) return exs;
  const allowed = [primary, ...support];
  const allowedSet = new Set(allowed);
  const result = [...exs];

  const minPerToken = MIN_PER_TOKEN[dayFocus] || {};
  const tokenCount = (arr: Exercise[]): Record<string, number> => {
    const tc: Record<string, number> = {};
    for (const t of Object.keys(minPerToken)) {
      tc[t] = arr.reduce((acc, e) => acc + (exerciseMatchesToken(e, t) ? 1 : 0), 0);
    }
    return tc;
  };

  // Sostituisci un esercizio nella posizione `idx` con uno dell'attrezzo `targetAttr`
  // mantenendo categoria e senza compromettere i minimi muscolari.
  const trySwap = (idx: number, targetAttr: string): boolean => {
    const current = result[idx];
    if (normalizeEquipmentName(current.attrezzo) === targetAttr) return true;
    const usedIds = new Set(result.map(e => e.id));
    const cat = current.categoria;

    // Candidati: stesso categoria preferita, poi qualunque
    const sameCat = EXERCISE_LIBRARY.filter(e =>
      normalizeEquipmentName(e.attrezzo) === targetAttr &&
      livelloAccessibile(e.livello, livello) &&
      !usedIds.has(e.id) &&
      e.categoria === cat
    ).sort((a, b) => a.id.localeCompare(b.id));

    const anyCat = sameCat.length > 0 ? sameCat : EXERCISE_LIBRARY.filter(e =>
      normalizeEquipmentName(e.attrezzo) === targetAttr &&
      livelloAccessibile(e.livello, livello) &&
      !usedIds.has(e.id)
    ).sort((a, b) => a.id.localeCompare(b.id));

    if (anyCat.length === 0) return false;

    // Verifica che la sostituzione non rompa i minimi muscolari
    const candidate = anyCat[0];
    const before = tokenCount(result);
    const tentative = [...result];
    tentative[idx] = candidate;
    const after = tokenCount(tentative);
    for (const t of Object.keys(minPerToken)) {
      const min = minPerToken[t] || 0;
      if (before[t] >= min && after[t] < min) return false;
    }

    result[idx] = candidate;
    return true;
  };

  // 1) Rimuovi attrezzi NON ammessi: ogni esercizio fuori dai 3 viene rimpiazzato
  //    con uno del primario (se possibile) o di un supporto.
  for (let i = 0; i < result.length; i++) {
    const a = normalizeEquipmentName(result[i].attrezzo);
    if (allowedSet.has(a)) continue;
    if (!trySwap(i, primary)) {
      for (const s of support) {
        if (trySwap(i, s)) break;
      }
    }
  }

  // 2) Garantisci che il PRIMARIO sia dominante (≥ ceil(N/2)).
  const targetPrimaryCount = Math.ceil(result.length / 2);
  const countOf = (attr: string) =>
    result.filter(e => normalizeEquipmentName(e.attrezzo) === attr).length;

  let primaryCount = countOf(primary);
  if (primaryCount < targetPrimaryCount) {
    // Riconvertiamo prima i supporti in eccesso (chi ha più esercizi) verso il primario
    for (let i = 0; i < result.length && primaryCount < targetPrimaryCount; i++) {
      const a = normalizeEquipmentName(result[i].attrezzo);
      if (a === primary) continue;
      // Mantieni almeno 1 esercizio per ogni supporto
      const supportCount = countOf(a);
      if (support.includes(a) && supportCount <= 1) continue;
      if (trySwap(i, primary)) primaryCount++;
    }
  }

  // 3) Garantisci che ogni SUPPORTO compaia almeno 1 volta.
  //    Sacrificiamo nell'ordine: (a) un altro supporto in eccesso (count > 1),
  //    poi (b) il primario se sopra il target dominante,
  //    infine (c) il primario anche se al target (preferibile a perdere un attrezzo).
  for (const s of support) {
    if (countOf(s) >= 1) continue;

    // (a) altro supporto in eccesso
    let placed = false;
    for (let i = result.length - 1; i >= 0 && !placed; i--) {
      const a = normalizeEquipmentName(result[i].attrezzo);
      if (a === s || a === primary) continue;
      if (!support.includes(a)) continue;
      if (countOf(a) <= 1) continue;
      if (trySwap(i, s)) placed = true;
    }
    if (placed) continue;

    // (b) primario in eccesso rispetto al target
    for (let i = result.length - 1; i >= 0 && !placed; i--) {
      const a = normalizeEquipmentName(result[i].attrezzo);
      if (a !== primary) continue;
      if (countOf(primary) <= targetPrimaryCount) break;
      if (trySwap(i, s)) placed = true;
    }
    if (placed) continue;

    // (c) primario anche se al target (meglio 3 attrezzi che 2): mantieni comunque
    //     almeno la metà arrotondata per difetto degli esercizi sul primario.
    const minPrimaryFloor = Math.max(1, Math.floor(result.length / 2));
    for (let i = result.length - 1; i >= 0 && !placed; i--) {
      const a = normalizeEquipmentName(result[i].attrezzo);
      if (a !== primary) continue;
      if (countOf(primary) <= minPrimaryFloor) break;
      if (trySwap(i, s)) placed = true;
    }
  }

  return result;
}
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
  const normalized = Array.from(new Set(attrezziUtente.map(normalizeEquipmentName)));
  if (normalized.length === 0) return [];

  const lastWeekNormalized = new Set(lastWeekEquipment.map(normalizeEquipmentName));

  const fresh = normalized.filter(a => !lastWeekNormalized.has(a));
  const stale = normalized.filter(a => lastWeekNormalized.has(a));

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
  const normalized = new Set(attrezziUtente.map(normalizeEquipmentName));
  const lastNormalized = new Set(lastWeekEquipment.map(normalizeEquipmentName));
  const fresh = [...normalized].filter(a => !lastNormalized.has(a));
  return fresh.length >= trainingDays;
}

function resolveWeeklyEquipmentAssignment(
  orderedEquipment: string[],
  livello: string,
  focuses: DayFocus[],
  forbiddenEquipment: string[] = [],
  requireFreshOnly: boolean = false
): string[] | null {
  const uniqueOrdered = Array.from(new Set(orderedEquipment.map(normalizeEquipmentName)));
  const forbidden = new Set(forbiddenEquipment.map(normalizeEquipmentName));
  const orderIndex = new Map(uniqueOrdered.map((attrezzo, index) => [attrezzo, index]));

  const candidatesPerFocus = focuses.map((focus) =>
    uniqueOrdered.filter((attrezzo) => {
      if (requireFreshOnly && forbidden.has(attrezzo)) return false;
      return equipmentSupportsFocus(attrezzo, livello, focus);
    })
  );

  if (candidatesPerFocus.some((candidates) => candidates.length === 0)) return null;

  const assignment: string[] = new Array(focuses.length).fill("");
  const used = new Set<string>();
  const focusOrder = focuses
    .map((_, index) => index)
    .sort((a, b) => {
      const freshA = candidatesPerFocus[a].filter((attrezzo) => !forbidden.has(attrezzo)).length;
      const freshB = candidatesPerFocus[b].filter((attrezzo) => !forbidden.has(attrezzo)).length;
      return freshA - freshB || candidatesPerFocus[a].length - candidatesPerFocus[b].length;
    });

  const backtrack = (position: number): boolean => {
    if (position >= focusOrder.length) return true;

    const focusIndex = focusOrder[position];
    const rankedCandidates = [...candidatesPerFocus[focusIndex]].sort((a, b) => {
      const aForbidden = forbidden.has(a) ? 1 : 0;
      const bForbidden = forbidden.has(b) ? 1 : 0;
      return aForbidden - bForbidden || (orderIndex.get(a) ?? 0) - (orderIndex.get(b) ?? 0);
    });

    for (const candidate of rankedCandidates) {
      if (used.has(candidate)) continue;
      assignment[focusIndex] = candidate;
      used.add(candidate);
      if (backtrack(position + 1)) return true;
      used.delete(candidate);
      assignment[focusIndex] = "";
    }

    return false;
  };

  return backtrack(0) ? assignment : null;
}

export function canAvoidLastWeekForFocuses(
  attrezziUtente: string[],
  livello: string,
  focuses: DayFocus[],
  lastWeekEquipment: string[] = []
): boolean {
  const orderedEquipment = getOrderedWeeklyEquipment(attrezziUtente, lastWeekEquipment);
  const forbidden = Array.from(new Set(lastWeekEquipment.map(normalizeEquipmentName)));
  return resolveWeeklyEquipmentAssignment(orderedEquipment, livello, focuses, forbidden, true) !== null;
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

/**
 * Counts how many exercises of an equipment match a given muscle token.
 * Uses the same synonym table as pickBalanced so vincoli muscolari are verificati realmente.
 */
function countTokenForEquipment(attrezzo: string, livello: string, token: string): number {
  return EXERCISE_LIBRARY.filter(e =>
    e.attrezzo === attrezzo &&
    livelloAccessibile(e.livello, livello) &&
    exerciseMatchesToken(e, token)
  ).length;
}

function equipmentSupportsFocus(attrezzo: string, livello: string, focus: DayFocus): boolean {
  const counts = getEquipmentCategoryCounts(attrezzo, livello);
  if (counts.total === 0) return false;

  // Verifica i MINIMI MUSCOLARI reali richiesti dal focus (MIN_PER_TOKEN)
  const required = MIN_PER_TOKEN[focus];
  for (const token of Object.keys(required)) {
    if (countTokenForEquipment(attrezzo, livello, token) < required[token]) {
      return false;
    }
  }
  return true;
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

/**
 * Numero di esercizi per workout, con progressione settimanale graduale per livello.
 * - BASSO (Base): 5–6 (settimana 1) → progressione lenta, max 7 per Upper/Lower e 8 per Total
 * - MEDIO: 6–8 (settimana 1) → progressione media, max 8 Upper/Lower, 9 Total
 * - AVANZATO (Alto): 7–9 (settimana 1) → progressione più rapida, max 10 (cap globale)
 * Cap assoluto: 10 esercizi. Oltre, l'intensità cresce ma il numero non aumenta.
 */
function getTargetCount(weekNumber: number, baseLivello: string, focus?: DayFocus): number {
  const ABS_MAX = 10;
  const w = Math.max(1, weekNumber);
  const isTotal = focus === "total_body";

  let base: number;
  let step: number; // incremento per settimana
  let maxForType: number;

  if (baseLivello === "AVANZATO") {
    base = isTotal ? 9 : 9;          // Upper/Lower: 9 (3 core + 2 schiena/glutei + altri); Total: 9
    step = 1;
    maxForType = 10;
  } else if (baseLivello === "MEDIO") {
    base = isTotal ? 8 : 8;          // 8 esercizi per coprire i minimi (3 core, 2 schiena/glutei...)
    step = 0.5;
    maxForType = isTotal ? 10 : 9;
  } else {
    // BASSO / Base
    base = isTotal ? 7 : 8;          // Upper/Lower: 8 minimi richiesti; Total: 7
    step = 1 / 3;
    maxForType = isTotal ? 9 : 9;
  }

  const progressed = Math.floor(base + step * (w - 1));
  return Math.min(ABS_MAX, maxForType, progressed);
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
  progressionCtx?: ProgressionContext,
  availableEquipment: string[] = [],
  avoidAsSupport: string[] = [],
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

  // Selezione deterministica dei 3 attrezzi: 1 primario (dominante) + 2 di supporto
  // coerenti con focus + gruppi muscolari + attrezzi selezionati dall'utente.
  // `avoidAsSupport` (attrezzi già usati negli altri giorni della settimana) è
  // usato come tie-breaker: se possibile, NON ripetiamo gli stessi 3 attrezzi tra giorni.
  const { primary, support } = selectThreeEquipment(attrezzo, effectiveLevel, availableEquipment, dayFocus, avoidAsSupport);
  const allowedEquipment = new Set([primary, ...support].map(normalizeEquipmentName));

  // Esclude esercizi il cui gruppo principale è vietato per il focus del giorno
  // (es. nessun gluteo/quad/femorali/interno coscia in Upper; nessuna schiena/spalle/braccia/petto in Lower).
  // Un esercizio passa solo se NON matcha alcun token vietato, oppure matcha
  // anche un token consentito come muscolo principale (categoria).
  const forbidden = FORBIDDEN_TOKENS[dayFocus];
  const allowed = ALLOWED_TOKENS[dayFocus];
  const disponibili = EXERCISE_LIBRARY.filter(e => {
    if (!allowedEquipment.has(normalizeEquipmentName(e.attrezzo))) return false;
    if (!livelloAccessibile(e.livello, effectiveLevel)) return false;
    // Cardio NON va negli esercizi iniziali del workout: viene gestito dopo (finisher).
    if (e.categoria === "cardio") return false;
    if (forbidden.length > 0) {
      const hitsForbidden = forbidden.some(t => exerciseMatchesToken(e, t));
      if (hitsForbidden) {
        // mantieni solo se la categoria principale è un token consentito
        const primaryAllowed = allowed.some(t => {
          const syn = MUSCLE_TOKEN_SYNONYMS[t] || [t];
          return syn.includes(e.categoria);
        });
        if (!primaryAllowed) return false;
        // Se la categoria primaria è "consentita" ma matcha anche forbidden,
        // accetta solo se NON è la categoria primaria del forbidden token.
        const forbiddenIsPrimary = forbidden.some(t => {
          const syn = MUSCLE_TOKEN_SYNONYMS[t] || [t];
          return syn.includes(e.categoria);
        });
        if (forbiddenIsPrimary) return false;
      }
    }
    return true;
  });
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

  const balanced = pickBalanced(
    pool,
    prioritySlots,
    Math.max(targetCount, Math.min(targetCount, pool.length)),
    preferredCategories,
    mandatoryTokens,
    minPerToken,
  );

  const finalEx = enforceThreeEquipment(balanced, effectiveLevel, primary, support, dayFocus);

  // Ordina per fasi: Attivazione → Centrale (pilates) → Metabolica → Core finale
  return orderByPhases(finalEx);
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
  const weekFocuses = dateKeys.map((dateKey, i) => getFocusForWeekday(getWeekdayFromDateKey(dateKey), i));

  // If user has enough equipment, forbid any equipment used last week.
  const enforceFreshWeek = canFullyAvoidLastWeek(attrezziUtente, lastWeekEquipment, dateKeys.length);
  const forbidden = enforceFreshWeek
    ? Array.from(new Set(lastWeekEquipment.map(normalizeEquipmentName)))
    : [];
  const preselectedEquipment =
    resolveWeeklyEquipmentAssignment(orderedEquipment, livello, weekFocuses, forbidden, enforceFreshWeek) ||
    resolveWeeklyEquipmentAssignment(orderedEquipment, livello, weekFocuses, forbidden, false);

  const piano: Record<string, { attrezzo: string; round: number }> = {};
  const esercizi: Record<string, Exercise[]> = {};
  const focusPerDay: Record<string, DayFocus> = {};
  let runningStorico = Object.values(previousStorico).flat();
  const usedEquipment: string[] = [];
  // Tracciamo TUTTI gli attrezzi (primario + supporti) già usati nei giorni precedenti
  // della settimana, così ogni giorno preferisce supporti diversi → varietà reale tra giorni.
  const usedSupportsThisWeek: string[] = [];

  dateKeys.forEach((dateKey, i) => {
    // Use fixed weekday-based focus: Mon→Upper, Wed→Lower, Fri→Total
    const dayFocus = weekFocuses[i];
    const attrezzo = preselectedEquipment?.[i] || selectEquipmentForFocus(orderedEquipment, livello, dayFocus, usedEquipment, forbidden);

    ctx.recentExerciseIds = runningStorico;

    const dayExercises = generaEserciziGiorno(
      attrezzo,
      livello,
      [],
      dayFocus,
      ctx,
      attrezziUtente,
      usedSupportsThisWeek,
    );

    piano[dateKey] = { attrezzo, round: 0 };
    esercizi[dateKey] = dayExercises;
    focusPerDay[dateKey] = dayFocus;

    usedEquipment.push(attrezzo);
    // Aggiungi al "evita come supporto" tutti gli attrezzi distinti effettivamente
    // usati nel workout di oggi (sia primario sia supporti).
    const todaysAttrezzi = Array.from(new Set(dayExercises.map(e => normalizeEquipmentName(e.attrezzo))));
    for (const a of todaysAttrezzi) {
      if (!usedSupportsThisWeek.includes(a)) usedSupportsThisWeek.push(a);
    }
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
