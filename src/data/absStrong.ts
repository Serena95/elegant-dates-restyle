// Blocco "Addominali Strong" - eseguito DOPO i round principali e PRIMA del finisher brucia grassi.
// Un solo esercizio fisso: "Topo crunch", a ripetizioni in base al livello dell'utente.

export interface AbsStrongExercise {
  nome: string;
  emoji: string;
  desc: string;
  reps: string;
  zona: "addome" | "obliqui" | "fianchi" | "core profondo";
  coreNote: string;
  setup?: string;
  steps?: string[];
  errors?: string[];
  breathing?: string;
}

function repsForLivello(livello?: string): number {
  const l = (livello || "").toUpperCase();
  if (l.startsWith("AVANZ")) return 100;
  if (l.startsWith("MED")) return 75;
  return 50; // BASE / default
}

const TOPO_CRUNCH_BASE: Omit<AbsStrongExercise, "reps"> = {
  nome: "Topo Crunch",
  emoji: "🐭",
  desc: "Crunch a piccolo raggio: spalle staccate da terra con micro-impulsi continui per attivare in profondità l'addome.",
  zona: "addome",
  coreNote: "Movimento corto e contratto: l'addome resta sempre attivo, niente pause.",
  setup: "Sdraiata supina, ginocchia piegate, piedi a terra (o gambe sollevate a 90° per intensità maggiore). Mani dietro la nuca, gomiti larghi.",
  steps: [
    "Solleva le scapole da terra di pochi centimetri.",
    "Esegui piccoli impulsi continui verso l'alto, senza riappoggiare le spalle.",
    "Mantieni la lombare schiacciata al pavimento per tutta la durata.",
    "Conta ogni impulso come 1 ripetizione.",
  ],
  errors: [
    "Tirare il collo con le mani",
    "Riappoggiare le spalle a terra tra un impulso e l'altro",
    "Inarcare la lombare",
    "Trattenere il respiro",
  ],
  breathing: "Espira corto ad ogni impulso verso l'alto.",
};

/**
 * Ritorna SEMPRE un singolo esercizio "Topo Crunch" con ripetizioni
 * calibrate sul livello dell'utente: BASE 50 / MEDIO 75 / AVANZATO 100.
 * Il parametro `giorno` è mantenuto per retro-compatibilità ma non influenza la selezione.
 */
export function getAbsStrongForWorkout(_giorno: string, livello?: string): AbsStrongExercise[] {
  const reps = repsForLivello(livello);
  return [{ ...TOPO_CRUNCH_BASE, reps: `${reps} ripetizioni` }];
}
