// Curated YouTube guided workouts library.
// Every entry must be hand-picked from a vetted channel (certified trainers /
// physios / pro athletes). New entries default to approved: false so they do
// not appear until manually reviewed and approved in the UI / data file.

export type GuidedFocus = "upper" | "lower" | "total" | "core" | "stretching" | "combat";
export type GuidedLevel = "base" | "medium" | "advanced";

export interface CuratedChannel {
  id: string;
  name: string;
  credentials: string; // why we trust this channel
  language: "it" | "en";
  url: string;
}

export interface GuidedWorkout {
  id: string;
  title: string;
  videoId: string; // YouTube video ID (the v= param)
  channelId: string; // ref CuratedChannel.id
  focus: GuidedFocus;
  level: GuidedLevel;
  durationMin: number;
  equipment: string[]; // free-form tags: "corpo libero", "manubri", "kettlebell"...
  language: "it" | "en";
  notes: string; // why we chose it
  approved: boolean; // gate: only true entries are shown in the app
}

export const CURATED_CHANNELS: CuratedChannel[] = [
  {
    id: "miletto",
    name: "Umberto Miletto",
    credentials:
      "Personal trainer certificato, tra i divulgatori fitness più seguiti in Italia. Tecnica curata, riscaldamento incluso.",
    language: "it",
    url: "https://www.youtube.com/@UmbertoMiletto",
  },
  {
    id: "chisari",
    name: "Sergio Chisari Fitness",
    credentials:
      "Coach con background in scienze motorie, focus su progressioni a corpo libero sicure.",
    language: "it",
    url: "https://www.youtube.com/@SergioChisariFitness",
  },
  {
    id: "girvan",
    name: "Caroline Girvan",
    credentials:
      "Personal trainer certificata UK, programmazione strutturata, ottima per manubri e kettlebell.",
    language: "en",
    url: "https://www.youtube.com/@CarolineGirvan",
  },
  {
    id: "hasfit",
    name: "HASfit",
    credentials:
      "Coach certificati ACE/NASM, progressioni per ogni livello con modifiche low-impact spiegate.",
    language: "en",
    url: "https://www.youtube.com/@HASfit",
  },
  {
    id: "heather",
    name: "Heather Robertson",
    credentials:
      "Personal trainer certificata, workout strutturati con timer e form cues a schermo.",
    language: "en",
    url: "https://www.youtube.com/@HeatherRobertson",
  },
  {
    id: "madfit",
    name: "MadFit",
    credentials:
      "Coach certificata, allenamenti silenziosi/apartment friendly molto chiari nella forma.",
    language: "en",
    url: "https://www.youtube.com/@MadFit",
  },
];

// Starter selection. NOTE: every entry is unapproved by default — review the
// video manually, then set approved: true to make it visible in the app.
export const GUIDED_WORKOUTS: GuidedWorkout[] = [
  // ---------- UPPER ----------
  {
    id: "girvan-upper-dumbbell-30",
    title: "30 Min Upper Body Dumbbell Workout",
    videoId: "Lp53zk1ehMA",
    channelId: "girvan",
    focus: "upper",
    level: "medium",
    durationMin: 30,
    equipment: ["manubri"],
    language: "en",
    notes:
      "Push/pull bilanciato con tempo controllato, ideale per il giorno Upper. Riscaldamento incluso.",
    approved: false,
  },
  {
    id: "heather-upper-dumbbell-30",
    title: "30 Min UPPER BODY Workout with Dumbbells",
    videoId: "8gZTQ7xWnPE",
    channelId: "heather",
    focus: "upper",
    level: "base",
    durationMin: 30,
    equipment: ["manubri"],
    language: "en",
    notes: "Esecuzione lenta e didattica, ottima per chi inizia con i manubri.",
    approved: false,
  },
  {
    id: "hasfit-upper-bodyweight-20",
    title: "20 Min Upper Body Bodyweight Workout",
    videoId: "BFRq5zE1Nko",
    channelId: "hasfit",
    focus: "upper",
    level: "base",
    durationMin: 20,
    equipment: ["corpo libero"],
    language: "en",
    notes: "Coach mostra varianti facili/avanzate, perfetto a corpo libero.",
    approved: false,
  },

  // ---------- LOWER ----------
  {
    id: "girvan-lower-dumbbell-30",
    title: "30 Min Lower Body Dumbbell Workout",
    videoId: "lMxs1qiD7XU",
    channelId: "girvan",
    focus: "lower",
    level: "medium",
    durationMin: 30,
    equipment: ["manubri"],
    language: "en",
    notes: "Squat, RDL, affondi: pattern fondamentali con buona spiegazione tecnica.",
    approved: false,
  },
  {
    id: "heather-lower-bodyweight-30",
    title: "30 Min LOWER BODY Workout - No Equipment",
    videoId: "rmsxL1FlbGI",
    channelId: "heather",
    focus: "lower",
    level: "base",
    durationMin: 30,
    equipment: ["corpo libero"],
    language: "en",
    notes: "Niente attrezzi, ottimo per il giorno Lower in trasferta.",
    approved: false,
  },
  {
    id: "madfit-lower-bodyweight-20",
    title: "20 Min LOWER BODY Workout - No Jumping",
    videoId: "aclVuTu_uF4",
    channelId: "madfit",
    focus: "lower",
    level: "base",
    durationMin: 20,
    equipment: ["corpo libero"],
    language: "en",
    notes: "Senza salti: amico dei vicini e delle articolazioni.",
    approved: false,
  },

  // ---------- TOTAL ----------
  {
    id: "girvan-full-kb-30",
    title: "30 Min Full Body Kettlebell Workout",
    videoId: "iz8r1y6P5pE",
    channelId: "girvan",
    focus: "total",
    level: "medium",
    durationMin: 30,
    equipment: ["kettlebell"],
    language: "en",
    notes: "Fattibile con un solo kettlebell — coerente con il vincolo da 10 kg.",
    approved: false,
  },
  {
    id: "hasfit-full-bodyweight-25",
    title: "25 Min Full Body Workout at Home",
    videoId: "M0uO8X3_tEA",
    channelId: "hasfit",
    focus: "total",
    level: "base",
    durationMin: 25,
    equipment: ["corpo libero"],
    language: "en",
    notes: "Total body senza attrezzi con cues continui sulla postura.",
    approved: false,
  },

  // ---------- CORE ----------
  {
    id: "heather-core-10",
    title: "10 Min AB Workout",
    videoId: "AnYl6Nk9GOA",
    channelId: "heather",
    focus: "core",
    level: "base",
    durationMin: 10,
    equipment: ["corpo libero"],
    language: "en",
    notes: "Blocco core breve, da abbinare al workout principale.",
    approved: false,
  },
  {
    id: "girvan-core-15",
    title: "15 Min INTENSE AB Workout",
    videoId: "MQHbAyL5W1c",
    channelId: "girvan",
    focus: "core",
    level: "advanced",
    durationMin: 15,
    equipment: ["corpo libero"],
    language: "en",
    notes: "Stimolo addominale completo, abs + obliqui + trasverso.",
    approved: false,
  },

  // ---------- STRETCHING ----------
  {
    id: "madfit-stretch-10",
    title: "10 Min Full Body Stretch",
    videoId: "g_tea8ZNk5A",
    channelId: "madfit",
    focus: "stretching",
    level: "base",
    durationMin: 10,
    equipment: ["corpo libero"],
    language: "en",
    notes: "Sequenza dolce di defaticamento per fine sessione.",
    approved: false,
  },

  // ---------- COMBAT ----------
  {
    id: "hasfit-kickbox-20",
    title: "20 Min Kickboxing Workout",
    videoId: "wkY8FOgrXjs",
    channelId: "hasfit",
    focus: "combat",
    level: "medium",
    durationMin: 20,
    equipment: ["corpo libero"],
    language: "en",
    notes: "Combinazioni controllate di jab/cross/calci — coerente col blocco Combat.",
    approved: false,
  },
];

export const FOCUS_LABELS: Record<GuidedFocus, string> = {
  upper: "Upper Body",
  lower: "Lower Body",
  total: "Total Body",
  core: "Core",
  stretching: "Stretching",
  combat: "Combat / Brucia Grassi",
};

export const LEVEL_LABELS: Record<GuidedLevel, string> = {
  base: "Base",
  medium: "Medio",
  advanced: "Avanzato",
};

export function getChannel(id: string): CuratedChannel | undefined {
  return CURATED_CHANNELS.find((c) => c.id === id);
}
