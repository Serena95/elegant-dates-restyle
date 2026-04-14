// ============================================================
// LUNAR PHASE UTILITIES
// ============================================================

export interface LunarPhaseInfo {
  id: LunarPhaseId;
  name: string;
  icon: string;
  illumination: number;
  energy: "bassa" | "crescente" | "alta" | "calante";
  description: string;
  workoutModifier: string;
}

export type LunarPhaseId = "nuova" | "crescente" | "primo_quarto" | "gibbosa_crescente" | "piena" | "gibbosa_calante" | "ultimo_quarto" | "calante";

// Simplified 4 phases for workout adaptation
export type LunarEnergyPhase = "nuova" | "crescente" | "piena" | "calante";

const SYNODIC_MONTH = 29.53058770576;
const KNOWN_NEW_MOON = new Date(2000, 0, 6, 18, 14).getTime();

export function getLunarPhase(date: Date): LunarPhaseInfo {
  const daysSince = (date.getTime() - KNOWN_NEW_MOON) / (1000 * 60 * 60 * 24);
  const phase = ((daysSince % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const illumination = Math.round((1 - Math.cos(2 * Math.PI * phase / SYNODIC_MONTH)) / 2 * 100);

  if (phase < 1.85) return { id: "nuova", name: "Luna Nuova", icon: "🌑", illumination, energy: "bassa", description: "Energia interiore. Momento ideale per riposare e rigenerarsi.", workoutModifier: "Recupero e mobilità" };
  if (phase < 7.38) return { id: "crescente", name: "Luna Crescente", icon: "🌒", illumination, energy: "crescente", description: "Energia in crescita. Buon momento per costruire nuove abitudini.", workoutModifier: "Aumento graduale intensità" };
  if (phase < 9.23) return { id: "primo_quarto", name: "Primo Quarto", icon: "🌓", illumination, energy: "crescente", description: "Determinazione e azione. Spingi oltre i tuoi limiti.", workoutModifier: "Progressione e sfida" };
  if (phase < 14.77) return { id: "gibbosa_crescente", name: "Gibbosa Crescente", icon: "🌔", illumination, energy: "crescente", description: "Avvicinamento al picco. Perfeziona la tua tecnica.", workoutModifier: "Intensità medio-alta" };
  if (phase < 16.61) return { id: "piena", name: "Luna Piena", icon: "🌕", illumination, energy: "alta", description: "Massima energia! Il corpo è al suo picco di performance.", workoutModifier: "Massima intensità e performance" };
  if (phase < 22.15) return { id: "gibbosa_calante", name: "Gibbosa Calante", icon: "🌖", illumination, energy: "calante", description: "Inizia il rilascio. Mantieni costanza con moderazione.", workoutModifier: "Intensità controllata" };
  if (phase < 24.0) return { id: "ultimo_quarto", name: "Ultimo Quarto", icon: "🌗", illumination, energy: "calante", description: "Lascia andare ciò che non serve. Focus su tecnica e core.", workoutModifier: "Focus tecnica e stabilità" };
  if (phase < 27.69) return { id: "calante", name: "Luna Calante", icon: "🌘", illumination, energy: "calante", description: "Preparati al rinnovamento. Stretching e recupero profondo.", workoutModifier: "Recupero e stretching" };
  return { id: "nuova", name: "Luna Nuova", icon: "🌑", illumination, energy: "bassa", description: "Energia interiore. Momento ideale per riposare e rigenerarsi.", workoutModifier: "Recupero e mobilità" };
}

export function getLunarEnergyPhase(date: Date): LunarEnergyPhase {
  const info = getLunarPhase(date);
  if (info.energy === "bassa") return "nuova";
  if (info.energy === "crescente") return "crescente";
  if (info.energy === "alta") return "piena";
  return "calante";
}

/**
 * Get combined cycle + lunar workout adaptation message
 */
export function getCombinedAdaptationMessage(
  cyclePhase: string | undefined,
  lunarPhase: LunarPhaseInfo
): string | null {
  if (!cyclePhase) return null;

  const combos: Record<string, Record<string, string>> = {
    mestruale: {
      bassa: "🌑🩸 Fase di rigenerazione profonda — allenamento leggero e mobilità",
      crescente: "🌒🩸 Corpo in riposo ma energia lunare in crescita — stretching attivo",
      alta: "🌕🩸 Luna piena ma fase mestruale — ascolta il corpo, resta leggera",
      calante: "🌘🩸 Doppia fase di rilascio — yoga dolce e respirazione",
    },
    follicolare: {
      bassa: "🌑🌱 Nuova energia ciclica, luna introspettiva — costruisci le basi",
      crescente: "🌒🌱 Doppia crescita! Energia perfetta per aumentare l'intensità",
      alta: "🌕🌱 Luna piena + fase follicolare — spingi al massimo!",
      calante: "🌘🌱 Energia ciclica in crescita, luna calante — progressione moderata",
    },
    ovulazione: {
      bassa: "🌑✨ Picco ormonale ma luna nuova — intensità alta, ascolta i segnali",
      crescente: "🌒✨ Ovulazione + luna crescente — performance in crescita!",
      alta: "🌕✨ Allineamento perfetto! Massima potenza e resistenza",
      calante: "🌘✨ Picco di energia ciclica — sfruttalo nonostante la luna calante",
    },
    luteale: {
      bassa: "🌑🍂 Doppia fase di raccoglimento — focus su tecnica e core",
      crescente: "🌒🍂 Energia lunare in crescita bilancia la fase luteale — mantieni costanza",
      alta: "🌕🍂 Luna piena dona energia extra — allenamento controllato ma deciso",
      calante: "🌘🍂 Rallenta con grazia — stabilità, controllo e respirazione",
    },
  };

  return combos[cyclePhase]?.[lunarPhase.energy] || null;
}

/**
 * Get effective workout intensity modifier based on cycle + lunar combination
 * Returns: -2 (very light), -1 (light), 0 (normal), +1 (boost)
 */
export function getWorkoutIntensityModifier(
  cyclePhase: string | undefined,
  lunarEnergy: LunarEnergyPhase
): number {
  if (!cyclePhase) {
    // Lunar only
    if (lunarEnergy === "nuova") return -1;
    if (lunarEnergy === "piena") return 1;
    return 0;
  }

  // Combined logic
  const matrix: Record<string, Record<LunarEnergyPhase, number>> = {
    mestruale: { nuova: -2, crescente: -1, piena: -1, calante: -2 },
    follicolare: { nuova: 0, crescente: 1, piena: 1, calante: 0 },
    ovulazione: { nuova: 0, crescente: 1, piena: 1, calante: 1 },
    luteale: { nuova: -1, crescente: 0, piena: 0, calante: -1 },
  };

  return matrix[cyclePhase]?.[lunarEnergy] ?? 0;
}
