import { useState, useCallback, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout, AppView } from "@/components/AppLayout";
import { Dashboard } from "@/components/Dashboard";
import { EquipmentSelection } from "@/components/EquipmentSelection";
import { WorkoutView } from "@/components/WorkoutView";
import { CalendarView } from "@/components/CalendarView";
import { ProgressView } from "@/components/ProgressView";
import { FoodDiary } from "@/components/FoodDiary";
import { ExerciseLibrary } from "@/components/ExerciseLibrary";
import { GuideView } from "@/components/GuideView";
import { ProfileView } from "@/components/ProfileView";
import { SettingsView } from "@/components/SettingsView";
import { WorkoutComplete } from "@/components/WorkoutComplete";
import { InstallBanner } from "@/components/InstallBanner";
import { InstallAppView } from "@/components/InstallAppView";
import { ProgramsView } from "@/components/ProgramsView";
import { CycleTracking, getCyclePhaseForDate, CYCLE_PHASES } from "@/components/CycleTracking";
import { getLunarEnergyPhase, getWorkoutIntensityModifier } from "@/utils/lunarPhase";
import { PregnancyMonitoring } from "@/components/PregnancyMonitoring";
import { NutritionPlanView } from "@/components/NutritionPlanView";
import { MoreView } from "@/components/MoreView";
import { WorkoutReminder } from "@/components/WorkoutReminder";
import { useNotifications } from "@/hooks/useNotifications";
import { LegalPage } from "@/components/LegalPage";
import { PremiumView } from "@/components/PremiumView";
import { ChallengesView } from "@/components/ChallengesView";
import { FITNESS_CHALLENGES } from "@/data/challenges";
import { CommunityView } from "@/components/CommunityView";
import { LeaderboardView } from "@/components/LeaderboardView";
import { PublicProfileView } from "@/components/PublicProfileView";
import { CommunityNotifications } from "@/components/CommunityNotifications";
import { NativeBuildGuide } from "@/components/NativeBuildGuide";
import { addWorkoutXP } from "@/services/xpService";
import { calculateStreak } from "@/services/streakService";
import { updateLeaderboard } from "@/services/supabase/leaderboardService";
import { syncBadges } from "@/services/supabase/badgeService";
import { TRAINING_PROGRAMS, TrainingProgram } from "@/data/programs";
import { useCloudData } from "@/hooks/useCloudData";
import { useAuth } from "@/contexts/AuthContext";
import { useBadges, Badge } from "@/hooks/useBadges";
import { Exercise, generaEserciziGiorno, selezionaAttrezziSettimana, CONFIG_LIVELLI, ATTREZZO_ICONS, detectFocus, FocusInfo, generaSettimanaIntelligente, DayFocus, FIXED_TRAINING_DAYS, getFocusForWeekday, computeProgressionContext, isPianoCurrentWeek, getWeekDates, getLocalDateKey, getWeekdayFromDateKey, parseDateKey } from "@/data/exercises";
import { generateAIWorkout } from "@/services/aiWorkout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CycleEntry, PregnancySettings } from "@/hooks/useCloudData";
import { supabase } from "@/integrations/supabase/client";
import { useWorkoutAutosave, loadWorkoutSession, clearWorkoutSession } from "@/hooks/useWorkoutPersistence";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { saveOfflineCache, loadOfflineCache, getStoredGenerationKey, setStoredGenerationKey, isOnline } from "@/hooks/useOfflineCache";

function getCyclePhase(entries: CycleEntry[], settings: PregnancySettings): string | undefined {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return getCyclePhaseForDate(todayKey, entries, settings.durata_ciclo || 28, settings.durata_mestruazione || 5) || undefined;
}

function parseGenerationKeyDates(key: string): string[] {
  if (!key.startsWith("v3:")) return [];
  return key
    .slice(3)
    .split(",")
    .map((date) => date.trim())
    .filter(Boolean)
    .sort();
}

function shiftDateKey(dateKey: string, days: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return getLocalDateKey(date);
}

function getPreviousWeekEquipmentFromHistory(
  currentWeekDates: string[],
  storicoCal: Record<string, any>
): string[] {
  return currentWeekDates
    .map((dateKey) => storicoCal[shiftDateKey(dateKey, -7)]?.attrezzo)
    .filter(Boolean);
}

function getPreviousWeekEquipmentFromPlan(
  currentWeekDates: string[],
  piano: Record<string, { attrezzo?: string }>
): string[] {
  return currentWeekDates
    .map((dateKey) => piano[shiftDateKey(dateKey, -7)]?.attrezzo)
    .filter(Boolean) as string[];
}

// Muscle tokens that must NOT appear in an upper-body day
const LOWER_BODY_TOKENS = new Set([
  "gambe", "glutei", "quadricipiti", "femorali",
  "interno coscia", "adduttori", "ischiocrurali", "posteriori coscia",
]);
// Muscle tokens that must NOT appear in a lower-body day
const UPPER_BODY_TOKENS = new Set([
  "petto", "pettorali", "schiena", "dorsali", "romboidi", "trapezio",
  "spalle", "deltoidi", "braccia", "bicipiti", "tricipiti",
]);

function exerciseViolatesFocus(ex: Exercise, focus: DayFocus): boolean {
  if (focus === "total_body") return false;
  const forbidden = focus === "upper_body" ? LOWER_BODY_TOKENS : UPPER_BODY_TOKENS;
  const cat = (ex.categoria || "").toLowerCase();
  if (forbidden.has(cat)) return true;
  return (ex.muscoli || []).some((m) => forbidden.has(m.toLowerCase()));
}

function dayHasFocusViolation(exercises: Exercise[] | undefined, focus: DayFocus): boolean {
  if (!exercises || exercises.length === 0) return false;
  if (exercises.some((e) => exerciseViolatesFocus(e, focus))) return true;
  // Require at least 2 REAL core exercises (categoria === "core") in every workout
  const realCore = exercises.filter((e) => (e.categoria || "").toLowerCase() === "core").length;
  if (realCore < 2) return true;
  return false;
}

const Index = () => {
  const cloud = useCloudData();
  const { user } = useAuth();
  const [view, setView] = useState<AppView | "cycle" | "pregnancy" | "privacy" | "terms" | "premium" | "challenges" | "community" | "leaderboard" | "notifications" | "public-profile">("dashboard");
  const [publicProfileUserId, setPublicProfileUserId] = useState<string | null>(null);
  const [giornoSelezionato, setGiornoSelezionato] = useState<string | null>(null);
  const [eserciziCorrenti, setEserciziCorrenti] = useState<Exercise[]>([]);
  const [roundCorrenti, setRoundCorrenti] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [showNativeGuide, setShowNativeGuide] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<number>(0);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [xpResult, setXpResult] = useState<{ xpGained: number; newXp: number; leveledUp: boolean } | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useLocalStorage("voice_trainer_enabled", true);
  const [workoutExerciseIdx, setWorkoutExerciseIdx] = useState(0);
  const [workoutCompletati, setWorkoutCompletati] = useState<number[]>([]);
  const [workoutShowStretching, setWorkoutShowStretching] = useState(false);
  const prevBadgeCountRef = useRef(0);
  

  const { unlockedBadges, checkNewBadges, stats: badgeStats } = useBadges(cloud.storicoCal);
  const notifications = useNotifications(FIXED_TRAINING_DAYS, cloud.storicoCal);
  const activeProgState = useActiveProgram();
  prevBadgeCountRef.current = unlockedBadges.length;

  const userName = cloud.profile.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Utente";

  // Restore workout session on mount
  useEffect(() => {
    if (cloud.loading) return;
    const saved = loadWorkoutSession();
    if (saved && cloud.piano[saved.giornoSelezionato]) {
      const allenamentiEsercizi = cloud.allenamentiData.esercizi || {};
      const cached = allenamentiEsercizi[saved.giornoSelezionato];
      if (cached && cached.length > 0) {
        setGiornoSelezionato(saved.giornoSelezionato);
        setEserciziCorrenti(cached);
        setRoundCorrenti(saved.roundCorrenti);
        setWorkoutExerciseIdx(saved.currentExerciseIdx);
        setWorkoutCompletati(saved.completati);
        setWorkoutShowStretching(saved.showStretching || false);
        setWorkoutStartTime(Date.now() - 60000);
        setView("workout");
      }
    }
  }, [cloud.loading]);

  // Autosave workout state
  useWorkoutAutosave(
    view === "workout" && !!giornoSelezionato,
    giornoSelezionato,
    workoutExerciseIdx,
    new Set(workoutCompletati),
    roundCorrenti,
    0,
    "",
    false,
    workoutShowStretching
  );

  // Save cloud data to offline cache whenever it changes
  useEffect(() => {
    if (cloud.loading) return;
    saveOfflineCache({
      piano: cloud.piano,
      allenamentiData: cloud.allenamentiData,
      storicoCal: cloud.storicoCal,
      attrezzi: cloud.attrezzi,
      livello: cloud.livello,
      giorniAllenamento: FIXED_TRAINING_DAYS,
      ultimiAttrezzi: cloud.ultimiAttrezzi,
      profile: cloud.profile,
      misure: cloud.misure,
      pasti: cloud.pasti,
      acqua: cloud.acqua,
      sfide: cloud.sfide,
      cycleEntries: cloud.cycleEntries,
      pregnancySettings: cloud.pregnancySettings,
      nutritionProfile: cloud.nutritionProfile,
    });
  }, [cloud.loading, cloud.piano, cloud.allenamentiData, cloud.storicoCal, cloud.attrezzi, cloud.livello, cloud.ultimiAttrezzi, cloud.profile, cloud.misure, cloud.pasti, cloud.acqua, cloud.sfide, cloud.cycleEntries, cloud.pregnancySettings, cloud.nutritionProfile]);

  // Auto-generate weekly plan when needed — ONCE per week only
  // Uses FIXED_TRAINING_DAYS [1,3,5] = Mon/Wed/Fri always
  const generationGuardRef = useRef(false);
  const [midnightTick, setMidnightTick] = useState(0);

  // Force re-evaluation at local midnight (Monday 00:00 = new week rollover) and on app reopen.
  useEffect(() => {
    let timeoutId: number;
    const scheduleMidnight = () => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 5, 0); // ~5s after midnight
      const ms = Math.max(1000, next.getTime() - now.getTime());
      timeoutId = window.setTimeout(() => {
        generationGuardRef.current = false;
        setMidnightTick((t) => t + 1);
        scheduleMidnight();
      }, ms);
    };
    scheduleMidnight();

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        generationGuardRef.current = false;
        setMidnightTick((t) => t + 1);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);


  useEffect(() => {
    // Prevent multiple runs in the same component lifecycle
    if (generationGuardRef.current) return;
    if (cloud.loading) return;

    const equipmentPool = cloud.attrezzi.length > 0
      ? cloud.attrezzi
      : Array.from(new Set(Object.values(cloud.piano).map((d) => d?.attrezzo).filter(Boolean) as string[]));

    if (equipmentPool.length === 0) return;

    // Always use fixed training days [1,3,5]
    const currentWeekDates = getWeekDates(FIXED_TRAINING_DAYS, new Date(), cloud.timeSettings.fuso_orario);
    const expectedKey = "v3:" + [...currentWeekDates].sort().join(",");

    // Check if piano already has valid data for this week (from DB)
    const pianoKeys = Object.keys(cloud.piano).sort();
    const sortedExpected = [...currentWeekDates].sort();
    const pianoMatchesWeek = pianoKeys.length === sortedExpected.length &&
      sortedExpected.every((d, i) => d === pianoKeys[i]);

    const allenamentiEsercizi = cloud.allenamentiData.esercizi || {};
    const hasAnyCurrentWeekPlan = pianoMatchesWeek && currentWeekDates.every(d => !!cloud.piano[d]);
    const hasAllExercises = pianoMatchesWeek &&
      currentWeekDates.every(d => allenamentiEsercizi[d]?.length > 0);

    // Use the cloud-stored key (persists across devices/logins) — fallback to localStorage for legacy
    const storedKey = cloud.workoutGenerationKey || getStoredGenerationKey();
    const storedWeekDates = parseGenerationKeyDates(storedKey);
    const pianoMatchesStoredWeek = storedWeekDates.length === pianoKeys.length &&
      storedWeekDates.every((d, i) => d === pianoKeys[i]);
    const storedWeekIsFuture = storedWeekDates.length > 0 && sortedExpected.length > 0 &&
      storedWeekDates[0] > sortedExpected[0];
    const hasCompleteSavedPlan = pianoKeys.length > 0 &&
      pianoKeys.every(d => allenamentiEsercizi[d]?.length > 0);

    const previousWeekFromPlan = getPreviousWeekEquipmentFromPlan(currentWeekDates, cloud.piano);
    const previousWeekFromHistory = getPreviousWeekEquipmentFromHistory(currentWeekDates, cloud.storicoCal);

    // PRIMARY GUARD: once a week is generated, KEEP IT. Never regenerate/replace equipment on refresh.
    if (hasAnyCurrentWeekPlan) {
      generationGuardRef.current = true;
      // Persist key if it was missing
      if (storedKey !== expectedKey) {
        setStoredGenerationKey(expectedKey);
        cloud.setWorkoutGenerationKey(expectedKey);
      }

      // Restore completed-days info from history into piano (so today's completed workout
      // and equipment are reflected even after a logout/login)
      const updatedPiano = { ...cloud.piano };
      let pianoNeedsUpdate = false;
      currentWeekDates.forEach((dateKey) => {
        const histEntry = cloud.storicoCal[dateKey];
        if (histEntry?.completato && updatedPiano[dateKey]) {
          // Make sure the piano reflects what was actually done that day
          if (updatedPiano[dateKey].attrezzo !== histEntry.attrezzo ||
              (updatedPiano[dateKey].round || 0) < (histEntry.round || 0)) {
            updatedPiano[dateKey] = {
              ...updatedPiano[dateKey],
              attrezzo: histEntry.attrezzo,
              round: histEntry.round,
            };
            pianoNeedsUpdate = true;
          }
        }
      });

      if (pianoNeedsUpdate) {
        cloud.savePiano(updatedPiano, cloud.allenamentiData);
      }

      // ─────────────────────────────────────────────────────────────────
      // MUSCLE-ONLY REPAIR: fix exercises that don't match the day's focus
      // (e.g. leg exercises in an upper-body day) WITHOUT touching the
      // chosen equipment, the round counter, or any completed day.
      // Idempotent: once exercises are valid, no further changes happen.
      // ─────────────────────────────────────────────────────────────────
      const currentEsercizi = cloud.allenamentiData.esercizi || {};
      const repairedEsercizi: Record<string, Exercise[]> = { ...currentEsercizi };
      let needsExerciseRepair = false;
      const progressionCtx = computeProgressionContext(
        cloud.storicoCal,
        getPreviousWeekEquipmentFromPlan(currentWeekDates, cloud.piano)
      );

      // ONE-SHOT MIGRATION: applica multi-attrezzo + ordinamento per fasi
      // SOLO ai giorni futuri (da domani in avanti). Mai oggi, mai passati,
      // mai giorni completati. Avviene una sola volta per utente.
      const MIGRATION_FLAG = "workout_phases_multiequip_v3";
      const alreadyMigrated = localStorage.getItem(MIGRATION_FLAG) === "1";
      const forceRegenerateFuture = !alreadyMigrated;

      const todayKey = getLocalDateKey(new Date(), cloud.timeSettings.fuso_orario);

      currentWeekDates.forEach((dateKey) => {
        // BLOCCO ASSOLUTO: mai toccare giorni passati o il giorno odierno.
        // Le modifiche valgono solo da domani in avanti.
        if (dateKey <= todayKey) return;

        const histEntry = cloud.storicoCal[dateKey];
        if (histEntry?.completato) return; // never touch completed days
        const dayPlan = updatedPiano[dateKey];
        if (!dayPlan?.attrezzo) return;
        const weekday = getWeekdayFromDateKey(dateKey);
        const focus = getFocusForWeekday(weekday);
        const dayEx = currentEsercizi[dateKey];
        const needsRepair = forceRegenerateFuture || dayHasFocusViolation(dayEx, focus);
        if (!needsRepair) return;

        // Regenerate exercises for THIS day only, keeping the same equipment.
        const recentIds = Object.entries(currentEsercizi)
          .filter(([k]) => k !== dateKey)
          .flatMap(([, list]) => (list || []).map((e) => e.id));
        const newEx = generaEserciziGiorno(
          dayPlan.attrezzo,
          cloud.livello,
          recentIds,
          focus,
          progressionCtx,
          cloud.attrezzi,
        );
        if (newEx.length > 0 && !dayHasFocusViolation(newEx, focus)) {
          repairedEsercizi[dateKey] = newEx;
          needsExerciseRepair = true;
        }
      });

      if (forceRegenerateFuture) {
        localStorage.setItem(MIGRATION_FLAG, "1");
      }

      if (needsExerciseRepair) {
        cloud.savePiano(updatedPiano, {
          ...cloud.allenamentiData,
          esercizi: repairedEsercizi,
        });
      }
      return;
    }

    // No secondary guard: if the saved piano does not match the CURRENT week,
    // we must regenerate immediately so the user always sees the current week
    // (no "next week" stuck state, no stale weeks after refresh/republish).

    // Need to generate a new week plan (week truly changed or no piano yet)
    generationGuardRef.current = true;
    setStoredGenerationKey(expectedKey);
    cloud.setWorkoutGenerationKey(expectedKey);

    const lastWeekEquipmentForGen = storedWeekIsFuture
      ? previousWeekFromHistory
      : previousWeekFromPlan.length > 0
        ? previousWeekFromPlan
        : previousWeekFromHistory.length > 0
          ? previousWeekFromHistory
          : cloud.ultimiAttrezzi;
    const result = generaSettimanaIntelligente(
      equipmentPool,
      cloud.livello,
      cloud.allenamentiData.storico || {},
      cloud.storicoCal,
      lastWeekEquipmentForGen,
      FIXED_TRAINING_DAYS
    );

    // CRITICAL: preserve any already-completed days from history — never overwrite them
    const finalPiano = { ...result.piano };
    const finalEsercizi = { ...result.esercizi };
    currentWeekDates.forEach((dateKey) => {
      const histEntry = cloud.storicoCal[dateKey];
      if (histEntry?.completato) {
        finalPiano[dateKey] = {
          ...finalPiano[dateKey],
          attrezzo: histEntry.attrezzo,
          round: histEntry.round,
        };
        // Keep existing exercises for that day if present
        const existingEx = allenamentiEsercizi[dateKey];
        if (existingEx && existingEx.length > 0) {
          finalEsercizi[dateKey] = existingEx;
        }
      }
    });

    cloud.savePiano(finalPiano, { esercizi: finalEsercizi, storico: result.storico });
    const usedEquipment = Object.values(finalPiano).map(d => d.attrezzo);
    cloud.setUltimiAttrezzi(usedEquipment);
  }, [cloud.loading, midnightTick]); // re-runs at local midnight (Mon 00:00 rollover) and on app re-open

  const weeklyStats = useMemo(() => {
    const now = new Date();
    const startOfWeek = parseDateKey(getWeekDates([1], now, cloud.timeSettings.fuso_orario)[0]);

    let completed = 0;
    const total = FIXED_TRAINING_DAYS.length;
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      const key = getLocalDateKey(d);
      if (cloud.storicoCal[key]?.completato) completed++;
    }

    // Streak
    let streak = 0;
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const trainingDaysSet = new Set(FIXED_TRAINING_DAYS);
    for (let i = 0; i < 365; i++) {
      const dow = d.getDay();
      if (trainingDaysSet.has(dow)) {
        const k = getLocalDateKey(d);
        if (cloud.storicoCal[k]?.completato) streak++;
        else if (i > 0) break;
      }
      d.setDate(d.getDate() - 1);
    }

    return { completed, total, streak };
  }, [cloud.storicoCal]);

  // Compute focus labels from the fixed weekly calendar mapping.
  // Exercises are validated separately during generation/persistence checks.
  const focusMap = useMemo<Record<string, FocusInfo>>(() => {
    const map: Record<string, FocusInfo> = {};

    for (const giorno of Object.keys(cloud.piano)) {
      const dayFocus = getFocusForWeekday(getWeekdayFromDateKey(giorno));
      map[giorno] = {
        key: dayFocus,
        label: dayFocus === "total_body" ? "Total Body" : dayFocus === "upper_body" ? "Upper Body" : "Lower Body",
        icon: dayFocus === "total_body" ? "🔥" : dayFocus === "upper_body" ? "💪" : "🦵",
      };
    }

    return map;
  }, [cloud.piano]);

  const effectiveView: string = cloud.loading
    ? "loading"
    : cloud.attrezzi.length === 0 && Object.keys(cloud.piano).length === 0 && view === "dashboard"
      ? "equipment-init"
      : view;

  const navigate = useCallback((v: AppView) => {
    setView(v);
    setGiornoSelezionato(null);
    setShowGuide(false);
    setShowNativeGuide(false);
    // Scroll to top on navigation
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  const avviaAllenamento = useCallback(async (giorno: string) => {
    setGiornoSelezionato(giorno);
    setWorkoutStartTime(Date.now());
    setAiGenerated(false);
    const dati = cloud.piano[giorno];
    if (!dati) return;

    const allenamentiEsercizi = cloud.allenamentiData.esercizi || {};
    const allenamentiStorico = cloud.allenamentiData.storico || {};
    let esercizi: Exercise[];
    const cached = allenamentiEsercizi[giorno];

    if (cached && cached.length > 0 && (cached[0] as any).categoria) {
      esercizi = cached;
    } else {
      const attrezzo = dati.attrezzo || "Corpo Libero";
      const storici = Object.values(allenamentiStorico).flat();
      const ctx = computeProgressionContext(cloud.storicoCal, cloud.ultimiAttrezzi);
      ctx.recentExerciseIds = storici;

      // Cycle + Lunar workout adaptation: adjust level based on combined phases
      let effectiveLivello = cloud.livello;
      if (!cloud.pregnancySettings.modalita_gravidanza) {
        const phase = getCyclePhase(cloud.cycleEntries, cloud.pregnancySettings);
        const lunarEnergy = getLunarEnergyPhase(new Date());
        const modifier = getWorkoutIntensityModifier(phase, lunarEnergy);
        
        if (modifier <= -2) {
          // Very light: drop two levels
          effectiveLivello = "BASSO";
        } else if (modifier === -1) {
          // Light: drop one level
          if (effectiveLivello === "AVANZATO") effectiveLivello = "MEDIO";
          else if (effectiveLivello === "MEDIO") effectiveLivello = "BASSO";
        }
        // modifier 0 or +1: keep current (boost is handled naturally by progression)
      }

      const dayFocus = getFocusForWeekday(getWeekdayFromDateKey(giorno));

      const result = await generateAIWorkout({
        attrezzo,
        livello: effectiveLivello,
        focus: dayFocus,
        storici,
        targetCount: 7,
        progressionCtx: ctx,
      });

      esercizi = result.exercises;
      setAiGenerated(result.aiGenerated);

      const nuovoStorico = [...storici, ...esercizi.map(e => e.id)];
      const newAllenamenti = {
        esercizi: { ...allenamentiEsercizi, [giorno]: esercizi },
        storico: { ...allenamentiStorico, [attrezzo]: nuovoStorico }
      };
      cloud.savePiano(cloud.piano, newAllenamenti);
    }

    setEserciziCorrenti(esercizi);
    setRoundCorrenti(dati.round || 0);
    setView("workout");
  }, [cloud.piano, cloud.allenamentiData, cloud.savePiano, cloud.attrezzi, cloud.livello, cloud.storicoCal, cloud.ultimiAttrezzi, cloud.cycleEntries, cloud.pregnancySettings]);

  const segnaRound = useCallback(() => {
    if (!giornoSelezionato) return;
    const config = CONFIG_LIVELLI[cloud.livello];
    const nuoviRound = roundCorrenti + 1;
    if (nuoviRound > config.round) return;

    setRoundCorrenti(nuoviRound);
    const updatedPiano = { ...cloud.piano };
    if (updatedPiano[giornoSelezionato]) {
      updatedPiano[giornoSelezionato] = { ...updatedPiano[giornoSelezionato], round: nuoviRound };
    }
    cloud.savePiano(updatedPiano);

      if (nuoviRound >= config.round) {
      // Don't clear session yet - stretching still needs to happen
        const dataKey = giornoSelezionato;
      const attrezzo = cloud.piano[giornoSelezionato]?.attrezzo || "allenamento";
      const focus = detectFocus(eserciziCorrenti);
      cloud.saveStoricoCal(dataKey, { attrezzo, round: nuoviRound, completato: true, focus });

      // Add XP
      if (user) {
        const streakData = calculateStreak(cloud.storicoCal, FIXED_TRAINING_DAYS);
        addWorkoutXP(user.id, streakData.currentStreak).then(result => {
          setXpResult({ xpGained: result.xpGained, newXp: result.newXp, leveledUp: result.leveledUp });
          updateLeaderboard(user.id, result.xpGained).catch(console.error);
        }).catch(console.error);
        const badgeIds = unlockedBadges.map(b => b.id);
        syncBadges(user.id, badgeIds, badgeStats).catch(console.error);
      }
    }
  }, [giornoSelezionato, roundCorrenti, cloud.livello, cloud.piano, cloud.savePiano, cloud.saveStoricoCal, checkNewBadges, eserciziCorrenti, user, unlockedBadges]);

  const changeLivello = useCallback((l: string) => {
    cloud.setLivello(l);
    // Force full regeneration with new level
    setStoredGenerationKey("");
    generationGuardRef.current = false;
    const equipmentPool = cloud.attrezzi.length > 0 ? cloud.attrezzi : [];
    if (equipmentPool.length > 0) {
      const result = generaSettimanaIntelligente(
        equipmentPool, l, cloud.allenamentiData.storico || {}, cloud.storicoCal, cloud.ultimiAttrezzi, FIXED_TRAINING_DAYS
      );
      cloud.savePiano(result.piano, { esercizi: result.esercizi, storico: result.storico });
      cloud.setUltimiAttrezzi(Object.values(result.piano).map(d => d.attrezzo));
    }
  }, [cloud.attrezzi, cloud.setLivello, cloud.savePiano, cloud.allenamentiData, cloud.storicoCal, cloud.ultimiAttrezzi]);

  const handleChangeTrainingDays = useCallback((days: number[]) => {
    cloud.setGiorniAllenamento(days);
    // Reset generation key to force regeneration
    setStoredGenerationKey("");
    generationGuardRef.current = false;
  }, [cloud.setGiorniAllenamento]);

  if (effectiveView === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (effectiveView === "equipment-init") {
    return (
      <div className="min-h-screen min-h-dvh w-full max-w-full overflow-x-hidden bg-background flex items-center justify-center px-3 sm:px-4 py-4">
        <div className="w-full max-w-md mx-auto bg-card rounded-3xl shadow-xl border border-border p-6">
          <EquipmentSelection
            savedAttrezzi={cloud.attrezzi}
            onComplete={(selected) => {
              cloud.setAttrezzi(selected);
              setView("dashboard");
              const result = generaSettimanaIntelligente(selected, cloud.livello, {}, {}, [], FIXED_TRAINING_DAYS);
              cloud.savePiano(result.piano, { esercizi: result.esercizi, storico: result.storico });
              cloud.setUltimiAttrezzi(Object.values(result.piano).map(d => d.attrezzo));
            }}
          />
        </div>
      </div>
    );
  }

  if (view === "workout" && giornoSelezionato) {
    const attrezzo = cloud.piano[giornoSelezionato]?.attrezzo || "Corpo Libero";
    // Compute adaptation message for workout view
    const cyclePhaseNow = cloud.pregnancySettings.modalita_gravidanza ? undefined : getCyclePhase(cloud.cycleEntries, cloud.pregnancySettings);
    const lunarNow = getLunarEnergyPhase(new Date());
    const intensityMod = getWorkoutIntensityModifier(cyclePhaseNow, lunarNow);
    const adaptMsg = intensityMod !== 0 ? "Allenamento adattato alla tua fase attuale" : undefined;

    return (
      <div className="min-h-screen min-h-dvh w-full max-w-full overflow-x-hidden bg-background px-3 sm:px-4 py-4">
        <div className="w-full max-w-4xl mx-auto min-w-0">
          <WorkoutView
            giorno={giornoSelezionato}
            tema={attrezzo}
            esercizi={eserciziCorrenti}
            livello={cloud.livello}
            roundCorrenti={roundCorrenti}
            onSegnaRound={segnaRound}
            onBack={() => { clearWorkoutSession(); navigate("dashboard"); }}
            onStretchingComplete={() => {
              clearWorkoutSession();
              const prevCount = prevBadgeCountRef.current;
              const nb = checkNewBadges(prevCount);
              setNewBadges(nb);
              setShowComplete(true);
            }}
            voiceEnabled={voiceEnabled}
            aiGenerated={aiGenerated}
            initialExerciseIdx={workoutExerciseIdx}
            initialCompletati={workoutCompletati}
            initialShowStretching={workoutShowStretching}
            onStateChange={(state) => {
              setWorkoutExerciseIdx(state.currentExerciseIdx);
              setWorkoutCompletati(state.completati);
              setWorkoutShowStretching(state.showStretching);
            }}
            dayFocus={focusMap[giornoSelezionato]?.key as any}
            adaptationMessage={adaptMsg}
          />
        </div>
        {showComplete && (
          <WorkoutComplete
            esercizi={eserciziCorrenti.length}
            tempoTotale={Math.floor((Date.now() - workoutStartTime) / 1000)}
            attrezzo={attrezzo}
            newBadges={newBadges}
            xpGained={xpResult?.xpGained}
            newXp={xpResult?.newXp}
            leveledUp={xpResult?.leveledUp}
            onShare={async () => {
              if (!user) return;
              const minuti = Math.floor((Date.now() - workoutStartTime) / 60000);
              const focus = detectFocus(eserciziCorrenti);
              await supabase.from("community_posts").insert({
                user_id: user.id,
                text: `Ho completato il mio allenamento ${attrezzo}! 💪`,
                workout_type: attrezzo,
                workout_focus: focus.label,
                workout_duration_min: minuti,
              });
            }}
            onClose={() => {
              setShowComplete(false);
              setNewBadges([]);
              setXpResult(null);
              navigate("dashboard");
            }}
          />
        )}
        <InstallBanner />
      </div>
    );
  }

  if (view === "equipment") {
    return (
      <AppLayout currentView={view} onNavigate={navigate} profile={cloud.profile} userName={userName}>
        <EquipmentSelection savedAttrezzi={cloud.attrezzi} onComplete={(selected) => {
          cloud.setAttrezzi(selected);
          // Force full regeneration with new equipment
           setStoredGenerationKey("");
           generationGuardRef.current = false;
          const result = generaSettimanaIntelligente(
            selected, cloud.livello, cloud.allenamentiData.storico || {}, cloud.storicoCal, cloud.ultimiAttrezzi, FIXED_TRAINING_DAYS
          );
          cloud.savePiano(result.piano, { esercizi: result.esercizi, storico: result.storico });
          cloud.setUltimiAttrezzi(Object.values(result.piano).map(d => d.attrezzo));
          navigate("dashboard");
        }} />
      </AppLayout>
    );
  }

  const renderContent = () => {
    if (showGuide) return <GuideView onBack={() => setShowGuide(false)} />;
    if (showNativeGuide) return <NativeBuildGuide onBack={() => setShowNativeGuide(false)} />;

    switch (view) {
      case "dashboard":
        return (
          <Dashboard
            piano={cloud.piano}
            livello={cloud.livello}
            onAvviaAllenamento={avviaAllenamento}
            onChangeLivello={changeLivello}
            userName={userName}
            weeklyStats={weeklyStats}
            onNavigate={navigate}
            focusMap={focusMap}
            storicoCal={cloud.storicoCal}
            giorniAllenamento={FIXED_TRAINING_DAYS}
            attrezzi={cloud.attrezzi}
            exercisesMap={cloud.allenamentiData.esercizi || {}}
            cyclePhase={cloud.pregnancySettings.modalita_gravidanza ? undefined : getCyclePhase(cloud.cycleEntries, cloud.pregnancySettings)}
            pregnancyMode={cloud.pregnancySettings.modalita_gravidanza}
            pregnancyWeek={cloud.pregnancySettings.settimana_gestazionale}
            activeProgram={activeProgState.active}
            onCancelProgram={activeProgState.cancel}
            fusoOrario={cloud.timeSettings.fuso_orario}
            onActivateInDashboard={() => {
              if (activeProgState.active?.type === "program") navigate("programs" as any);
              else navigate("challenges" as any);
            }}
          />
        );
      case "progress":
        return <ProgressView misure={cloud.misure} onAddMisura={cloud.addMisura} onDeleteMisura={cloud.deleteMisura} onBack={() => navigate("dashboard")} />;
      case "calendar":
        return <CalendarView livello={cloud.livello} storicoCal={cloud.storicoCal} onBack={() => navigate("dashboard")} />;
      case "food":
        return (
          <FoodDiary
            piano={cloud.piano}
            pasti={cloud.pasti}
            onAddPasto={cloud.addPasto}
            onDeletePasto={cloud.deletePasto}
            acqua={cloud.acqua}
            onSetAcqua={cloud.setAcqua}
            sfide={cloud.sfide}
            onAddSfida={cloud.addSfida}
            onDeleteSfida={cloud.deleteSfida}
            onToggleSfidaDate={cloud.toggleSfidaDate}
            onBack={() => navigate("dashboard")}
          />
        );
      case "library":
        return <ExerciseLibrary onBack={() => navigate("more")} />;
      case "more":
        return <MoreView onNavigate={(v) => navigate(v as any)} />;
      case "programs":
        return (
          <ProgramsView
            userAttrezzi={cloud.attrezzi}
            activeProgram={activeProgState.active?.type === "program" ? { id: activeProgState.active.id, week: activeProgState.active.week || 1 } : null}
            onStartProgram={(program) => {
              activeProgState.startProgram(program.id, program.nome);
              const weekIdx = 0;
              const week = program.settimane[weekIdx];
              // Map program days to real date keys
                const dateKeys = getWeekDates(FIXED_TRAINING_DAYS, new Date(), cloud.timeSettings.fuso_orario);
              const nuovoPiano: Record<string, { attrezzo: string; round: number }> = {};
              const nuoviEsercizi: Record<string, Exercise[]> = {};
              const ctx = computeProgressionContext(cloud.storicoCal, cloud.ultimiAttrezzi);
              let runningStorico = Object.values(cloud.allenamentiData.storico || {}).flat();
              
              dateKeys.forEach((dateKey, i) => {
                const giorno = week.giorni[i % week.giorni.length];
                const attrezzo = giorno.attrezzo;
                const dayFocus = getFocusForWeekday(getWeekdayFromDateKey(dateKey), i);
                ctx.recentExerciseIds = runningStorico;
                const exercises = generaEserciziGiorno(attrezzo, cloud.livello, [], dayFocus, ctx, cloud.attrezzi);
                nuovoPiano[dateKey] = { attrezzo, round: 0 };
                nuoviEsercizi[dateKey] = exercises;
                runningStorico = [...runningStorico, ...exercises.map(e => e.id)];
              });
              
              cloud.savePiano(nuovoPiano, { esercizi: nuoviEsercizi, storico: cloud.allenamentiData.storico || {} });
              navigate("dashboard");
            }}
            onCancelProgram={() => {
              activeProgState.cancel();
              // Regenerate standard plan
              setStoredGenerationKey("");
              generationGuardRef.current = false;
              const equipmentPool = cloud.attrezzi.length > 0 ? cloud.attrezzi : [];
              if (equipmentPool.length > 0) {
                const result = generaSettimanaIntelligente(
                  equipmentPool, cloud.livello, cloud.allenamentiData.storico || {}, cloud.storicoCal, cloud.ultimiAttrezzi, FIXED_TRAINING_DAYS
                );
                cloud.savePiano(result.piano, { esercizi: result.esercizi, storico: result.storico });
              }
            }}
          />
        );
      case "profile":
        return (
          <ProfileView
            profile={cloud.profile}
            onUpdateProfile={cloud.updateProfile}
            unlockedBadges={unlockedBadges}
            livello={cloud.livello}
            attrezzi={cloud.attrezzi}
            totalWorkouts={Object.values(cloud.storicoCal).filter((v: any) => v?.completato).length}
          />
        );
      case "settings":
        return (
          <SettingsView
            onNavigate={(v) => {
              if (v === "guide") setShowGuide(true);
              else if (v === "native-guide") setShowNativeGuide(true);
              else if (v === "cycle" || v === "pregnancy" || v === "privacy" || v === "terms") setView(v as any);
              else navigate(v as AppView);
            }}
            onModificaAttrezzi={() => navigate("equipment")}
            voiceEnabled={voiceEnabled}
            onToggleVoice={setVoiceEnabled}
            giorniAllenamento={FIXED_TRAINING_DAYS}
            notificheAbilitate={notifications.settings.notifiche_abilitate}
            notificaOrario={notifications.settings.notifica_orario}
            fusoOrario={notifications.settings.fuso_orario}
            onToggleNotifiche={notifications.toggleNotifications}
            onChangeOrarioNotifica={(orario) => notifications.updateSettings({ notifica_orario: orario })}
            onChangeFusoOrario={(tz) => notifications.updateSettings({ fuso_orario: tz })}
          />
        );
      case "cycle" as any:
        return (
          <CycleTracking
            entries={cloud.cycleEntries}
            onAddEntry={cloud.addCycleEntry}
            onDeleteEntry={cloud.deleteCycleEntry}
            durataCiclo={cloud.pregnancySettings.durata_ciclo}
            durataMestruazione={cloud.pregnancySettings.durata_mestruazione}
            onUpdateSettings={(s) => cloud.updatePregnancySettings(s)}
            onBack={() => navigate("more")}
          />
        );
      case "pregnancy" as any:
        return (
          <PregnancyMonitoring
            isActive={cloud.pregnancySettings.modalita_gravidanza}
            settimanaGestazionale={cloud.pregnancySettings.settimana_gestazionale}
            onToggle={(active) => cloud.updatePregnancySettings({ modalita_gravidanza: active, settimana_gestazionale: active ? Math.max(1, cloud.pregnancySettings.settimana_gestazionale) : 0 })}
            onUpdateWeek={(week) => cloud.updatePregnancySettings({ settimana_gestazionale: week })}
            onBack={() => navigate("more")}
          />
        );
      case "nutrition" as any: {
        const planId = (() => { try { const s = localStorage.getItem("activeNutritionPlan"); return s ? JSON.parse(s)?.id : undefined; } catch { return undefined; } })();
        return <NutritionPlanView key={`nutrition-${planId || 'browse'}`} onBack={() => navigate("more")} onSavePlan={() => setView("dashboard")} initialPlanId={planId} nutritionProfile={cloud.nutritionProfile} onUpdateNutritionProfile={cloud.updateNutritionProfile} />;
      }
      case "privacy" as any:
        return <LegalPage type="privacy" onBack={() => setView("settings" as any)} />;
      case "terms" as any:
        return <LegalPage type="terms" onBack={() => setView("settings" as any)} />;
      case "premium" as any:
        return <PremiumView onNavigate={(v) => navigate(v as AppView)} />;
      case "challenges" as any:
        return (
          <ChallengesView
            onBack={() => navigate("more")}
            activeChallenge={activeProgState.active?.type === "challenge" ? { id: activeProgState.active.id, name: activeProgState.active.name } : null}
            onStartChallenge={(id, name) => {
              activeProgState.startChallenge(id, name);
              // Generate workout for the challenge based on its focus
              const challenge = FITNESS_CHALLENGES.find(c => c.id === id);
              const dateKeys = getWeekDates(FIXED_TRAINING_DAYS, new Date(), cloud.timeSettings.fuso_orario);
              const nuovoPiano: Record<string, { attrezzo: string; round: number }> = {};
              const nuoviEsercizi: Record<string, Exercise[]> = {};
              const ctx = computeProgressionContext(cloud.storicoCal, cloud.ultimiAttrezzi);
              let runningStorico = Object.values(cloud.allenamentiData.storico || {}).flat();
              const equipmentPool = cloud.attrezzi.length > 0 ? cloud.attrezzi : ["Corpo Libero"];

              dateKeys.forEach((dateKey, i) => {
                const attrezzo = equipmentPool[i % equipmentPool.length];
                const challengeFocus = challenge?.focus || "full_body";
                // Map challenge focus to DayFocus
                let dayFocus: DayFocus = "total_body";
                if (challengeFocus === "core") dayFocus = "upper_body";
                else if (challengeFocus === "glutei" || challengeFocus === "lower_body") dayFocus = "lower_body";
                else if (challengeFocus === "upper_body") dayFocus = "upper_body";
                
                ctx.recentExerciseIds = runningStorico;
                const exercises = generaEserciziGiorno(attrezzo, cloud.livello, [], dayFocus, ctx, cloud.attrezzi);
                nuovoPiano[dateKey] = { attrezzo, round: 0 };
                nuoviEsercizi[dateKey] = exercises;
                runningStorico = [...runningStorico, ...exercises.map(e => e.id)];
              });

              cloud.savePiano(nuovoPiano, { esercizi: nuoviEsercizi, storico: cloud.allenamentiData.storico || {} });
              navigate("dashboard");
            }}
            onCancelChallenge={() => {
              activeProgState.cancel();
              setStoredGenerationKey("");
              generationGuardRef.current = false;
              const equipmentPool = cloud.attrezzi.length > 0 ? cloud.attrezzi : [];
              if (equipmentPool.length > 0) {
                const result = generaSettimanaIntelligente(
                  equipmentPool, cloud.livello, cloud.allenamentiData.storico || {}, cloud.storicoCal, cloud.ultimiAttrezzi, FIXED_TRAINING_DAYS
                );
                cloud.savePiano(result.piano, { esercizi: result.esercizi, storico: result.storico });
              }
            }}
          />
        );
      case "install-app" as any:
        return <InstallAppView />;
      case "community" as any:
        return (
          <CommunityView
            onViewProfile={(userId) => { setPublicProfileUserId(userId); setView("public-profile" as any); }}
            onViewLeaderboard={() => setView("leaderboard" as any)}
            onViewNotifications={() => setView("notifications" as any)}
          />
        );
      case "leaderboard" as any:
        return (
          <LeaderboardView
            onBack={() => setView("community" as any)}
            onViewProfile={(userId) => { setPublicProfileUserId(userId); setView("public-profile" as any); }}
          />
        );
      case "notifications" as any:
        return <CommunityNotifications onBack={() => setView("community" as any)} />;
      case "public-profile" as any:
        return publicProfileUserId ? (
          <PublicProfileView userId={publicProfileUserId} onBack={() => setView("community" as any)} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <AppLayout currentView={view as AppView} onNavigate={navigate} profile={cloud.profile} userName={userName}>
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
      <InstallBanner />
    </AppLayout>
  );
};

export default Index;
