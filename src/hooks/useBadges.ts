import { useMemo } from "react";

export interface Badge {
  id: string;
  unlockedAt?: string;
}

export interface BadgeDefinition {
  id: string;
  nome: string;
  descrizione: string;
  icon: string;
  check: (stats: BadgeStats) => boolean;
}

export interface BadgeStats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "first_workout",
    nome: "Prima Volta",
    descrizione: "Completa il tuo primo allenamento",
    icon: "🌟",
    check: (s) => s.totalWorkouts >= 1,
  },
  {
    id: "five_workouts",
    nome: "In Forma",
    descrizione: "Completa 5 allenamenti",
    icon: "💪",
    check: (s) => s.totalWorkouts >= 5,
  },
  {
    id: "ten_workouts",
    nome: "Costanza",
    descrizione: "Completa 10 allenamenti",
    icon: "🔥",
    check: (s) => s.totalWorkouts >= 10,
  },
  {
    id: "thirty_workouts",
    nome: "Atleta",
    descrizione: "Completa 30 allenamenti",
    icon: "🏆",
    check: (s) => s.totalWorkouts >= 30,
  },
  {
    id: "seven_streak",
    nome: "Settimana Perfetta",
    descrizione: "7 allenamenti consecutivi",
    icon: "⚡",
    check: (s) => s.currentStreak >= 7 || s.longestStreak >= 7,
  },
  {
    id: "thirty_streak",
    nome: "Inarrestabile",
    descrizione: "30 allenamenti consecutivi",
    icon: "👑",
    check: (s) => s.currentStreak >= 30 || s.longestStreak >= 30,
  },
];

export function useBadges(storicoCal: Record<string, any>) {
  const stats: BadgeStats = useMemo(() => {
    const entries = Object.entries(storicoCal).filter(([, v]) => v?.completato);
    const totalWorkouts = entries.length;

    // Calculate streak
    const dates = entries.map(([k]) => k).sort().reverse();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Simple streak: count consecutive workout days
    const dateSet = new Set(dates);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(today);

    // Current streak from today backwards
    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().split("T")[0];
      const dow = d.getDay();
      // Only count training days (Mon=1, Wed=3, Fri=5)
      if (dow === 1 || dow === 3 || dow === 5) {
        if (dateSet.has(key)) {
          currentStreak++;
        } else {
          // If it's today and no workout yet, skip
          if (i === 0) { d.setDate(d.getDate() - 1); continue; }
          break;
        }
      }
      d.setDate(d.getDate() - 1);
    }

    // Longest streak (simple count)
    const sortedDates = [...dates].sort();
    tempStreak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      // Reset if gap > 3 days
      if (i < sortedDates.length - 1) {
        const curr = new Date(sortedDates[i]);
        const next = new Date(sortedDates[i + 1]);
        const diff = (next.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
        if (diff > 3) tempStreak = 0;
      }
    }

    return { totalWorkouts, currentStreak, longestStreak };
  }, [storicoCal]);

  const unlockedBadges = useMemo(() => {
    return BADGE_DEFINITIONS.filter(b => b.check(stats)).map(b => ({ id: b.id }));
  }, [stats]);

  const checkNewBadges = (previousCount: number): Badge[] => {
    if (unlockedBadges.length > previousCount) {
      return unlockedBadges.slice(previousCount);
    }
    return [];
  };

  return { stats, unlockedBadges, checkNewBadges, allBadges: BADGE_DEFINITIONS };
}
