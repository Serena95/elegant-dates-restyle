import { useEffect, useCallback } from "react";

const STORAGE_KEY = "workout_session_state";

export interface WorkoutSessionState {
  giornoSelezionato: string;
  currentExerciseIdx: number;
  completati: number[];
  roundCorrenti: number;
  timerSeconds: number | null;
  timerLabel: string | null;
  showStretching: boolean;
  timestamp: number;
}

export function saveWorkoutSession(state: WorkoutSessionState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, timestamp: Date.now() }));
  } catch {}
}

export function loadWorkoutSession(): WorkoutSessionState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as WorkoutSessionState;
    // Expire after 2 hours
    if (Date.now() - state.timestamp > 2 * 60 * 60 * 1000) {
      clearWorkoutSession();
      return null;
    }
    return state;
  } catch {
    return null;
  }
}

export function clearWorkoutSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function useWorkoutAutosave(
  isInWorkout: boolean,
  giornoSelezionato: string | null,
  currentExerciseIdx: number,
  completati: Set<number>,
  roundCorrenti: number,
  timerTimeLeft: number,
  timerLabel: string,
  timerIsActive: boolean,
  showStretching: boolean = false
) {
  // Auto-save on visibility change and periodically
  const save = useCallback(() => {
    if (!isInWorkout || !giornoSelezionato) return;
    saveWorkoutSession({
      giornoSelezionato,
      currentExerciseIdx,
      completati: Array.from(completati),
      roundCorrenti,
      timerSeconds: timerIsActive ? timerTimeLeft : null,
      timerLabel: timerIsActive ? timerLabel : null,
      timestamp: Date.now(),
    });
  }, [isInWorkout, giornoSelezionato, currentExerciseIdx, completati, roundCorrenti, timerTimeLeft, timerLabel, timerIsActive]);

  useEffect(() => {
    if (!isInWorkout) return;

    const handleVisibility = () => {
      if (document.hidden) save();
    };
    const handleBeforeUnload = () => save();
    const interval = setInterval(save, 5000); // Save every 5s

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isInWorkout, save]);
}
