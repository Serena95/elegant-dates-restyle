// Blocco "Addominali Strong" - eseguito DOPO i round principali e PRIMA del finisher brucia grassi.
// Contiene 3 esercizi distinti dedicati a core / addome / fianchi / punto vita.
// Ogni esercizio usa lo STESSO numero di ripetizioni in base al livello scelto:
//   BASE 50 / MEDIO 75 / AVANZATO 100 (NON divise tra esercizi).

export interface AbsStrongExercise {
  id: string;
  nome: string;
  emoji: string;
  desc: string;
  reps: string;
  zona: "addome" | "obliqui" | "fianchi" | "core profondo";
  muscoli: string[];
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

const POOL: Omit<AbsStrongExercise, "reps">[] = [
  {
    id: "abs-strong-topo-crunch",
    nome: "Topo Crunch",
    emoji: "🐭",
    desc: "Crunch a piccolo raggio: spalle staccate da terra con micro-impulsi continui per attivare in profondità l'addome.",
    zona: "addome",
    muscoli: ["addominali", "retto"],
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
  },
  {
    id: "abs-strong-russian-twist",
    nome: "Russian Twist",
    emoji: "🔄",
    desc: "Seduta in equilibrio, ruota il busto da un lato all'altro per attivare gli obliqui e scolpire il punto vita.",
    zona: "obliqui",
    muscoli: ["obliqui", "addominali"],
    coreNote: "La rotazione parte dal busto, non dalle braccia: punto vita acceso.",
    setup: "Seduta con ginocchia piegate, piedi sollevati o appoggiati. Busto inclinato indietro a 45°, mani unite davanti al petto.",
    steps: [
      "Mantieni il busto inclinato e l'addome contratto.",
      "Ruota il busto a destra portando le mani vicino al fianco.",
      "Torna al centro e ruota a sinistra.",
      "Conta ogni rotazione (destra + sinistra = 2 ripetizioni).",
    ],
    errors: [
      "Curvare la schiena",
      "Muovere solo le braccia senza ruotare il busto",
      "Appoggiare i piedi se l'esercizio è a gambe sollevate",
      "Trattenere il respiro",
    ],
    breathing: "Espira ad ogni rotazione laterale.",
  },
  {
    id: "abs-strong-side-plank-dip",
    nome: "Side Plank Hip Dip",
    emoji: "📐",
    desc: "Plank laterale con discesa e risalita del bacino per accendere fianchi, obliqui e punto vita in profondità.",
    zona: "fianchi",
    muscoli: ["obliqui", "fianchi", "core profondo"],
    coreNote: "Fianco e obliqui lavorano insieme: movimento lento e controllato.",
    setup: "In side plank sull'avambraccio, gomito sotto la spalla, gambe distese e piedi sovrapposti. Bacino allineato.",
    steps: [
      "Parti con il corpo in linea perfetta dalla testa ai piedi.",
      "Abbassa lentamente il bacino verso il pavimento senza toccarlo.",
      "Risali spingendo dal fianco fino a riallineare il corpo.",
      "Esegui le ripetizioni indicate per lato, poi cambia.",
    ],
    errors: [
      "Spalla che cede sul gomito",
      "Bacino che ruota in avanti",
      "Movimento troppo veloce e poco controllato",
      "Trattenere il respiro",
    ],
    breathing: "Inspira nella discesa, espira nella risalita.",
  },
];

/**
 * Restituisce 3 esercizi distinti del blocco Addominali Strong.
 * Ogni esercizio riceve lo STESSO numero di ripetizioni in base al livello:
 *   BASE 50 / MEDIO 75 / AVANZATO 100.
 * Le ripetizioni NON sono divise tra gli esercizi.
 * Il parametro `giorno` è mantenuto per retro-compatibilità.
 */
export function getAbsStrongForWorkout(_giorno: string, livello?: string): AbsStrongExercise[] {
  const reps = repsForLivello(livello);
  return POOL.map(ex => ({ ...ex, reps: `${reps} ripetizioni` }));
}
