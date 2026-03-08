import { getLocalDateKey } from "@/data/exercises";

export interface ProgressData {
  totalWorkouts: number;
  totalMinutes: number;
  focusStats: Record<string, number>;
  weeklyFocusStats: Record<string, number>;
  mostTrainedThisWeek: string;
  lastFocus: string;
  recentIntensity: "bassa" | "media" | "alta";
}

/**
 * Compute progress data from workout history
 */
export function computeProgress(
  storicoCal: Record<string, any>,
  livello: string
): ProgressData {
  const completedEntries = Object.entries(storicoCal).filter(([, v]) => v?.completato);
  const totalWorkouts = completedEntries.length;

  // Estimate minutes per workout based on level
  const minutesPerWorkout = livello === "BASSO" ? 15 : livello === "MEDIO" ? 25 : 35;
  const totalMinutes = totalWorkouts * minutesPerWorkout;

  // Focus stats from all history
  const focusStats: Record<string, number> = {};
  completedEntries.forEach(([, v]) => {
    const focus = v?.focus?.key || v?.focus?.label || "full_body";
    focusStats[focus] = (focusStats[focus] || 0) + 1;
  });

  // This week's focus stats
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - (day === 0 ? 6 : day - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const weeklyFocusStats: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    const key = getLocalDateKey(d);
    const entry = storicoCal[key];
    if (entry?.completato) {
      const focus = entry?.focus?.key || entry?.focus?.label || "full_body";
      weeklyFocusStats[focus] = (weeklyFocusStats[focus] || 0) + 1;
    }
  }

  const mostTrainedThisWeek = Object.entries(weeklyFocusStats)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || "nessuno";

  // Last focus
  const sorted = completedEntries.sort(([a], [b]) => b.localeCompare(a));
  const lastFocus = sorted[0]?.[1]?.focus?.key || sorted[0]?.[1]?.focus?.label || "nessuno";

  // Recent intensity
  const last7 = sorted.slice(0, 7).length;
  const recentIntensity: "bassa" | "media" | "alta" = last7 >= 5 ? "alta" : last7 >= 3 ? "media" : "bassa";

  return {
    totalWorkouts,
    totalMinutes,
    focusStats,
    weeklyFocusStats,
    mostTrainedThisWeek,
    lastFocus,
    recentIntensity,
  };
}

/**
 * Suggest which focus to do today to balance training
 */
export function suggestDailyFocus(weeklyFocusStats: Record<string, number>): string {
  const focusOptions = ["core", "lower_body", "full_body", "mobilita"];
  
  // Find least trained focus this week
  let minCount = Infinity;
  let suggestion = "full_body";
  
  for (const focus of focusOptions) {
    const count = weeklyFocusStats[focus] || 0;
    if (count < minCount) {
      minCount = count;
      suggestion = focus;
    }
  }

  return suggestion;
}
