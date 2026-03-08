export interface Exercise {
  id: string;
  nome: string;
  attrezzo: string;
  livello: "base" | "medio" | "avanzato";
  muscoli: string[];
  categoria: "core" | "gambe" | "glutei" | "schiena" | "mobilità" | "stabilità" | "cardio" | "braccia";
  descrizione: string;
  gif?: string;
}

export interface DayPlan {
  attrezzo: string;
  round: number;
}

export type WeekPlan = Record<string, DayPlan>;

export const CONFIG_LIVELLI: Record<string, { round: number; tempoEsercizio: number; pausa: number }> = {
  "BASSO": { round: 2, tempoEsercizio: 30, pausa: 60 },
  "MEDIO": { round: 3, tempoEsercizio: 45, pausa: 45 },
  "AVANZATO": { round: 4, tempoEsercizio: 60, pausa: 30 },
};

export const TUTTI_GLI_ATTREZZI = [
  "Corpo Libero", "Ring", "Rullo", "Pesi",
  "Elastico Chiuso", "Fascia Aperta", "Palla Piccola", "Palla Grande",
  "Reformer", "Cadillac", "Wunda Chair", "Ladder Barrel", "Spine Corrector",
];

export const ATTREZZO_ICONS: Record<string, string> = {
  "Corpo Libero": "🧘", "Ring": "⭕", "Rullo": "🔄", "Pesi": "🏋️",
  "Pesi(da 1 a 4kg)": "🏋️", "Elastico Chiuso": "🔗", "Fascia Aperta": "🎗️",
  "Palla Piccola": "⚽", "Palla Grande": "🔵", "Reformer": "🛏️",
  "Cadillac": "🗼", "Wunda Chair": "🪑", "Ladder Barrel": "🪜", "Spine Corrector": "🌀",
};

export const ATTREZZO_SHORT: Record<string, string> = {
  "Corpo Libero": "CL", "Ring": "RG", "Rullo": "RL", "Pesi": "PS",
  "Pesi(da 1 a 4kg)": "PS", "Elastico Chiuso": "EC", "Fascia Aperta": "FA",
  "Palla Piccola": "PP", "Palla Grande": "PG", "Reformer": "RF",
  "Cadillac": "CD", "Wunda Chair": "WC", "Ladder Barrel": "LB", "Spine Corrector": "SC",
};

export const TEMA_CONFIG: Record<string, { label: string; tipi: string[]; icon: string }> = {
  "core_mobilita": { label: "Core + Mobilità", tipi: ["core", "mobilità", "stabilità", "schiena"], icon: "🧘" },
  "gambe_glutei": { label: "Gambe + Glutei", tipi: ["gambe", "glutei"], icon: "🦵" },
  "full_body_cardio": { label: "Full Body + Cardio", tipi: ["core", "gambe", "glutei", "schiena", "braccia", "cardio", "stabilità"], icon: "🔥" },
};

export interface FocusInfo {
  key: string;
  label: string;
  icon: string;
}

const FOCUS_MAP: Record<string, FocusInfo> = {
  core: { key: "core", label: "Core & Stabilità", icon: "🎯" },
  lower_body: { key: "lower_body", label: "Gambe & Glutei", icon: "🦵" },
  full_body: { key: "full_body", label: "Full Body", icon: "🔥" },
  mobilita: { key: "mobilita", label: "Mobilità", icon: "🧘" },
  stabilita: { key: "stabilita", label: "Stabilità", icon: "⚖️" },
  postura: { key: "postura", label: "Postura", icon: "🧍" },
};

/**
 * Detect workout focus based on exercise category composition.
 */
export function detectFocus(esercizi: { categoria: string }[]): FocusInfo {
  if (!esercizi || esercizi.length === 0) return FOCUS_MAP.full_body;

  const counts: Record<string, number> = {};
  esercizi.forEach(e => {
    const cat = e.categoria;
    counts[cat] = (counts[cat] || 0) + 1;
  });

  const total = esercizi.length;
  const coreCount = (counts["core"] || 0) + (counts["stabilità"] || 0);
  const lowerCount = (counts["gambe"] || 0) + (counts["glutei"] || 0);
  const mobilityCount = counts["mobilità"] || 0;
  const backCount = counts["schiena"] || 0;

  // If >50% is core/stability → core focus
  if (coreCount / total > 0.5) return FOCUS_MAP.core;
  // If >50% is lower body → lower body focus
  if (lowerCount / total > 0.5) return FOCUS_MAP.lower_body;
  // If >40% mobility → mobility focus
  if (mobilityCount / total > 0.4) return FOCUS_MAP.mobilita;
  // If >40% back + stability → postura
  if ((backCount + (counts["stabilità"] || 0)) / total > 0.4) return FOCUS_MAP.postura;
  // If >40% stability alone → stability
  if ((counts["stabilità"] || 0) / total > 0.4) return FOCUS_MAP.stabilita;

  return FOCUS_MAP.full_body;
}

export const suggerimentiNutrizionali: Record<string, string> = {
  "Corpo Libero": "Oggi focus sulla fluidità: bevi un bicchiere d'acqua extra prima di iniziare.",
  "Ring": "Il Ring richiede forza resistente: una manciata di mandorle 30 min prima ti darà energia.",
  "Rullo": "Sessione intensa: post-allenamento mangia frutta ricca di vitamina C.",
  "Pesi": "Lavori sul tono muscolare: inserisci una fonte proteica nel prossimo pasto.",
  "Elastico Chiuso": "L'elastico crea tensione costante: il magnesio aiuterà a prevenire i crampi.",
  "Fascia Aperta": "Focus sull'allungamento: mantieni l'idratazione alta.",
  "Palla Piccola": "Lavoro di precisione e core: un pasto leggero eviterà pesantezza.",
  "Palla Grande": "Stabilità e controllo oggi: non allenarti a stomaco pieno.",
  "Reformer": "Sessione Reformer: mantieni una buona idratazione e respira profondamente.",
  "Cadillac": "Allenamento sul Cadillac: concentrati sulla respirazione e il controllo.",
  "Wunda Chair": "Chair workout: energia costante con frutta secca prima della sessione.",
  "Ladder Barrel": "Barrel: stretching profondo, mantieni l'idratazione.",
  "Spine Corrector": "Spine Corrector: lavoro posturale, respira e allunga.",
};
