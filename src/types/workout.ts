export interface Workout {
  id: string;
  title: string;
  focus: string;
  duration: number;
  exercises: string[]; // exercise IDs only
  createdAt: string;
}
