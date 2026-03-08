import { Exercise } from "./exercise-types";

export type ProgramFocus = "full_body" | "core" | "lower_body" | "tonificazione";

export interface ProgramWeek {
  settimana: number;
  giorni: {
    giorno: string;
    focus: ProgramFocus;
    attrezzo: string;
    numEsercizi: number;
  }[];
}

export interface TrainingProgram {
  id: string;
  nome: string;
  descrizione: string;
  durata: number; // weeks
  livello: string;
  icon: string;
  color: string;
  settimane: ProgramWeek[];
}

// Exercise distribution per focus type
export const FOCUS_DISTRIBUTION: Record<ProgramFocus, string[][]> = {
  full_body: [["core"], ["core"], ["gambe", "glutei"], ["braccia", "schiena"], ["stabilità"], ["mobilità"], ["cardio"]],
  core: [["core"], ["core"], ["core"], ["glutei"], ["stabilità"], ["mobilità"]],
  lower_body: [["gambe"], ["glutei"], ["gambe", "glutei"], ["core"], ["core"], ["mobilità"]],
  tonificazione: [["core"], ["core"], ["gambe", "glutei"], ["braccia", "schiena"], ["braccia"], ["stabilità"], ["cardio"]],
};

function generateWeeks(
  durata: number,
  attrezzi: string[],
  focusPattern: ProgramFocus[]
): ProgramWeek[] {
  const giorni = ["Lunedì", "Mercoledì", "Venerdì"];
  return Array.from({ length: durata }, (_, i) => ({
    settimana: i + 1,
    giorni: giorni.map((g, j) => ({
      giorno: g,
      focus: focusPattern[j % focusPattern.length],
      attrezzo: attrezzi[(i + j) % attrezzi.length],
      numEsercizi: 6 + (i >= durata / 2 ? 1 : 0), // increase after midpoint
    })),
  }));
}

export const TRAINING_PROGRAMS: TrainingProgram[] = [
  {
    id: "base_4w",
    nome: "Programma Base",
    descrizione: "Introduzione al Pilates con esercizi fondamentali. Perfetto per chi inizia.",
    durata: 4,
    livello: "BASSO",
    icon: "🌱",
    color: "pilates-green",
    settimane: generateWeeks(4, ["Corpo Libero", "Palla Piccola", "Corpo Libero"], ["full_body", "core", "full_body"]),
  },
  {
    id: "toning_6w",
    nome: "Tonificazione",
    descrizione: "6 settimane per tonificare tutto il corpo con focus su gambe, glutei e braccia.",
    durata: 6,
    livello: "MEDIO",
    icon: "💪",
    color: "primary",
    settimane: generateWeeks(6, ["Ring", "Pesi", "Elastico Chiuso"], ["tonificazione", "lower_body", "tonificazione"]),
  },
  {
    id: "core_8w",
    nome: "Core Strength",
    descrizione: "8 settimane intensive per un core d'acciaio e una postura perfetta.",
    durata: 8,
    livello: "MEDIO",
    icon: "🔥",
    color: "pilates-amber",
    settimane: generateWeeks(8, ["Corpo Libero", "Palla Piccola", "Rullo"], ["core", "core", "full_body"]),
  },
  {
    id: "complete_8w",
    nome: "Pilates Completo",
    descrizione: "Il programma definitivo: 8 settimane per padroneggiare il Pilates a 360°.",
    durata: 8,
    livello: "AVANZATO",
    icon: "👑",
    color: "secondary",
    settimane: generateWeeks(8, ["Corpo Libero", "Ring", "Pesi", "Rullo", "Elastico Chiuso"], ["full_body", "core", "lower_body"]),
  },
];
