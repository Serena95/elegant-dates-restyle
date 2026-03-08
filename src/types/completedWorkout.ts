export interface CompletedWorkout {
  id: string;
  userId: string;
  workoutId: string;
  duration: number;
  completedAt: string;
  xpEarned: number;
}
