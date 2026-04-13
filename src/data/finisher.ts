// Finisher exercises - high intensity, short duration, no equipment needed
// Added at the end of every workout session

export interface FinisherExercise {
  nome: string;
  emoji: string;
  desc: string;
  durata: number; // seconds
  coreNote: string;
}

const FINISHER_POOL: FinisherExercise[] = [
  {
    nome: "Jumping Jack",
    emoji: "⭐",
    desc: "Salta aprendo braccia e gambe, poi torna in posizione. Ritmo alto!",
    durata: 30,
    coreNote: "Mantieni l'addome contratto durante ogni salto.",
  },
  {
    nome: "Mountain Climber",
    emoji: "🏔️",
    desc: "In plank, porta le ginocchia al petto in modo alternato e veloce.",
    durata: 30,
    coreNote: "Core attivo: non sollevare i fianchi, stabilizza il busto.",
  },
  {
    nome: "Plank Dinamico",
    emoji: "💥",
    desc: "Alterna plank su avambracci e plank su mani. Ritmo costante.",
    durata: 30,
    coreNote: "Addome e glutei contratti per tutta la durata.",
  },
  {
    nome: "Burpee Modificato",
    emoji: "🔥",
    desc: "Squat, mani a terra, salta indietro in plank, torna su. Senza push-up.",
    durata: 30,
    coreNote: "Attiva il core nel passaggio da squat a plank.",
  },
  {
    nome: "High Knees",
    emoji: "🦵",
    desc: "Corsa sul posto portando le ginocchia alte. Braccia attive.",
    durata: 30,
    coreNote: "Contrai l'addome ad ogni sollevamento del ginocchio.",
  },
  {
    nome: "Squat Jump",
    emoji: "🚀",
    desc: "Squat profondo e poi salta in alto. Atterra morbida.",
    durata: 30,
    coreNote: "Core attivo durante il salto e l'atterraggio.",
  },
  {
    nome: "Plank con Tocco Spalla",
    emoji: "🎯",
    desc: "In plank, tocca la spalla opposta con ogni mano. Alterna.",
    durata: 30,
    coreNote: "Stabilizza i fianchi: non ruotare il bacino.",
  },
  {
    nome: "Speed Skater",
    emoji: "⛸️",
    desc: "Saltelli laterali ampi, porta la gamba dietro in diagonale.",
    durata: 30,
    coreNote: "Mantieni il busto stabile e l'addome contratto.",
  },
];

/**
 * Select 4-5 finisher exercises for a session (approx. 2-2.5 min)
 * Always different order using a simple shuffle
 */
export function getFinisherExercises(): FinisherExercise[] {
  const shuffled = [...FINISHER_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5); // 5 × 30s = 2.5 min
}

export function getFinisherDuration(exercises: FinisherExercise[]): string {
  const total = exercises.reduce((s, e) => s + e.durata, 0);
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return sec > 0 ? `${min}:${sec < 10 ? "0" : ""}${sec}` : `${min}:00`;
}
