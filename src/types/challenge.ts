export interface Challenge {
  id: string;
  title: string;
  durationDays: number;
  focus: string;
  description: string;
}

export interface ChallengeProgress {
  userId: string;
  challengeId: string;
  currentDay: number;
  completed: boolean;
}
