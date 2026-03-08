import { getLocalDateKey } from "@/data/exercises";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
}

/**
 * Calculate streak data from workout history calendar.
 * Only counts training days (not rest days) for streak calculation.
 */
export function calculateStreak(
  storicoCal: Record<string, any>,
  giorniAllenamento: number[]
): StreakData {
  const trainingDaysSet = new Set(giorniAllenamento);
  let currentStreak = 0;
  let longestStreak = 0;
  let lastWorkoutDate: string | null = null;
  let tempStreak = 0;

  const d = new Date();
  d.setHours(0, 0, 0, 0);

  // Find last workout date
  for (let i = 0; i < 365; i++) {
    const k = getLocalDateKey(d);
    if (storicoCal[k]?.completato) {
      if (!lastWorkoutDate) lastWorkoutDate = k;
      break;
    }
    d.setDate(d.getDate() - 1);
  }

  // Calculate current streak (consecutive training days completed)
  const d2 = new Date();
  d2.setHours(0, 0, 0, 0);
  let foundFirst = false;

  for (let i = 0; i < 365; i++) {
    const dow = d2.getDay();
    if (trainingDaysSet.has(dow)) {
      const k = getLocalDateKey(d2);
      if (storicoCal[k]?.completato) {
        currentStreak++;
        foundFirst = true;
      } else if (foundFirst || i > 0) {
        break;
      }
    }
    d2.setDate(d2.getDate() - 1);
  }

  // Calculate longest streak (scan all history)
  const allDates = Object.keys(storicoCal)
    .filter(k => storicoCal[k]?.completato)
    .sort();

  tempStreak = 0;
  for (let i = 0; i < allDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(allDates[i - 1] + "T00:00:00");
      const curr = new Date(allDates[i] + "T00:00:00");
      
      // Check if there's a missed training day between them
      let missed = false;
      const check = new Date(prev);
      check.setDate(check.getDate() + 1);
      while (check < curr) {
        if (trainingDaysSet.has(check.getDay())) {
          missed = true;
          break;
        }
        check.setDate(check.getDate() + 1);
      }
      
      if (missed) {
        tempStreak = 1;
      } else {
        tempStreak++;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  return { currentStreak, longestStreak, lastWorkoutDate };
}

/**
 * Get streak level for visual representation
 */
export function getStreakLevel(streak: number): { label: string; color: string; emoji: string } {
  if (streak >= 30) return { label: "Leggenda", color: "text-yellow-500", emoji: "👑" };
  if (streak >= 14) return { label: "Inarrestabile", color: "text-orange-500", emoji: "🔥" };
  if (streak >= 7) return { label: "In forma", color: "text-primary", emoji: "💪" };
  if (streak >= 3) return { label: "In crescita", color: "text-emerald-500", emoji: "🌱" };
  return { label: "Inizio", color: "text-muted-foreground", emoji: "✨" };
}
