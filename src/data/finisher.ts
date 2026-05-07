// Finisher (blocco brucia grassi) - UN SOLO blocco per workout.
// Due varianti: "metabolic" (circuito metabolico classico) e "combat" (movimenti
// dinamici stile combattimento, comunque controllati e con coinvolgimento del core).
// La selezione è deterministica in base a focus + giorno per garantire:
//  - Total Body → preferire combat
//  - Lower Body → alternare metabolic/combat
//  - Upper Body → limitare combat
//  - mai due combat in giorni consecutivi (di fatto i workout sono lun-mer-ven)
//  - frequenza combat 1-2 volte a settimana

import jabCrossImg from "@/assets/combat/jab-cross.jpg";
import hookImg from "@/assets/combat/hook.jpg";
import frontKickImg from "@/assets/combat/front-kick.jpg";
import kneeStrikeImg from "@/assets/combat/knee-strike.jpg";
import sprawlImg from "@/assets/combat/sprawl.jpg";
import sideKickImg from "@/assets/combat/side-kick.jpg";
import comboImg from "@/assets/combat/combo.jpg";
import slipPunchImg from "@/assets/combat/slip-punch.jpg";

export type FinisherVariant = "metabolic" | "combat";

export interface FinisherExercise {
  nome: string;
  emoji: string;
  desc: string;
  durata: number; // seconds
  coreNote: string;
  image?: string;
  setup?: string;
  steps?: string[];
  errors?: string[];
  breathing?: string;
}

const METABOLIC_POOL: FinisherExercise[] = [
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

// Variante COMBAT: movimenti stile combattimento, controllati e fluidi,
// con forte coinvolgimento della parte centrale del corpo (core, fianchi, punto vita).
// NON sono movimenti caotici: ogni colpo parte dal core con rotazione del busto.
const COMBAT_POOL: FinisherExercise[] = [
  {
    nome: "Jab + Cross (boxing)",
    emoji: "🥊",
    image: jabCrossImg,
    desc: "In guardia, alterna jab (braccio anteriore) e cross (braccio posteriore) con rotazione del busto.",
    durata: 30,
    coreNote: "Il colpo parte dal core: ruota fianchi e busto, addome contratto.",
    setup: "Piedi alla larghezza delle spalle, piede debole avanti. Mani aperte all'altezza degli zigomi, gomiti dentro, mento basso.",
    steps: [
      "Estendi il braccio avanti (jab) ruotando leggermente la spalla.",
      "Richiama subito il pugno sulla guardia.",
      "Lancia il cross posteriore ruotando il piede dietro e l'anca.",
      "Torna in guardia mantenendo lo sguardo avanti.",
    ],
    errors: [
      "Spalle alte verso le orecchie.",
      "Pugno che parte dal solo braccio, senza rotazione.",
      "Mano che si ferma estesa invece di tornare in guardia.",
    ],
    breathing: "Espira corto e secco a ogni colpo, inspira tra una combo e l'altra.",
  },
  {
    nome: "Hook Sinistro/Destro",
    emoji: "🥊",
    image: hookImg,
    desc: "Ganci alternati a media velocità con gomito alto e rotazione delle anche.",
    durata: 30,
    coreNote: "Rotazione del punto vita ad ogni gancio: obliqui attivi.",
    setup: "Posizione di guardia, peso distribuito 50/50, ginocchia morbide.",
    steps: [
      "Ruota anca e piede dello stesso lato del braccio che colpisce.",
      "Porta il braccio orizzontale con gomito alla spalla.",
      "Colpisci a 90° davanti a te, tornando subito in guardia.",
      "Alterna lato dopo lato seguendo la rotazione del busto.",
    ],
    errors: [
      "Gomito basso (rischio spalla).",
      "Braccio rigido senza rotazione del bacino.",
      "Sbilanciarsi in avanti perdendo la guardia.",
    ],
    breathing: "Soffia ad ogni hook, inspirazione breve durante il ritorno.",
  },
  {
    nome: "Front Kick Controllato",
    emoji: "🦶",
    image: frontKickImg,
    desc: "Calcio frontale alternato all'altezza del bacino. Movimento lento e controllato.",
    durata: 30,
    coreNote: "Core e fianchi stabili: il calcio parte dall'addome basso.",
    setup: "In piedi, mani in guardia, peso sulla gamba di appoggio leggermente piegata.",
    steps: [
      "Solleva il ginocchio della gamba che calcia all'altezza dell'anca.",
      "Estendi il piede avanti spingendo dal tallone.",
      "Richiama subito il ginocchio prima di riappoggiare.",
      "Torna in posizione e cambia gamba.",
    ],
    errors: [
      "Inarcare la schiena per arrivare più alti.",
      "Lasciare la gamba estesa dopo il calcio.",
      "Perdere la guardia con le mani.",
    ],
    breathing: "Espira durante l'estensione, inspira nel richiamo.",
  },
  {
    nome: "Knee Strike",
    emoji: "🦵",
    image: kneeStrikeImg,
    desc: "Ginocchiate frontali alternate, mani in guardia e busto leggermente avanti.",
    durata: 30,
    coreNote: "Contrai addome e fianchi ad ogni ginocchiata.",
    setup: "Piedi paralleli, mani avanti come ad afferrare la nuca di un bersaglio immaginario.",
    steps: [
      "Tira le mani verso il petto in modo deciso.",
      "Contemporaneamente porta il ginocchio in alto verso le mani.",
      "Spingi le anche leggermente avanti nell'impatto.",
      "Riappoggia con controllo e cambia gamba.",
    ],
    errors: [
      "Ginocchio che sale di lato invece che frontale.",
      "Schiena curva, spalle chiuse.",
      "Movimento solo di gamba, senza spinta dell'anca.",
    ],
    breathing: "Espira con un \"tss\" secco ad ogni ginocchiata.",
  },
  {
    nome: "Sprawl Soft",
    emoji: "💪",
    image: sprawlImg,
    desc: "Da posizione eretta scendi in plank e risali, controllata, senza salto.",
    durata: 30,
    coreNote: "Core sempre attivo nella discesa e nella risalita.",
    setup: "In piedi, mani in guardia, ginocchia morbide.",
    steps: [
      "Appoggia le mani a terra davanti ai piedi.",
      "Spingi le gambe indietro arrivando in plank alto.",
      "Tieni la posizione 1 secondo, addome contratto.",
      "Richiama i piedi verso le mani e risali in guardia.",
    ],
    errors: [
      "Sedere alto in plank.",
      "Ginocchia bloccate nella risalita.",
      "Movimento di sole gambe, senza coinvolgere il core.",
    ],
    breathing: "Inspira nella discesa, espira spingendo per risalire.",
  },
  {
    nome: "Side Kick Controllato",
    emoji: "🦿",
    image: sideKickImg,
    desc: "Calcio laterale alternato all'altezza dell'anca. Movimento lento e potente.",
    durata: 30,
    coreNote: "Fianchi e obliqui lavorano per stabilizzare e proiettare la gamba.",
    setup: "In piedi di fianco, peso sulla gamba di appoggio, mani in guardia.",
    steps: [
      "Solleva il ginocchio della gamba che calcia verso il petto.",
      "Ruota leggermente l'anca di appoggio aprendo il bacino.",
      "Estendi il piede di lato spingendo dal tallone.",
      "Richiama il ginocchio e torna in posizione.",
    ],
    errors: [
      "Inclinare troppo il busto perdendo la guardia.",
      "Calciare con la punta invece che con il taglio del piede.",
      "Bloccare il ginocchio in estensione.",
    ],
    breathing: "Espira lungo durante l'estensione, inspira nel richiamo.",
  },
  {
    nome: "Combo 1-2-Knee",
    emoji: "🥋",
    image: comboImg,
    desc: "Jab, cross e ginocchiata in sequenza. Ritmo controllato, respira.",
    durata: 30,
    coreNote: "Tutto il movimento nasce dal core: rotazione fluida del busto.",
    setup: "Posizione di guardia base, peso bilanciato, sguardo avanti.",
    steps: [
      "Lancia il jab e richiama subito.",
      "Lancia il cross ruotando l'anca posteriore.",
      "Tira le mani verso il petto e porta il ginocchio frontale.",
      "Torna in guardia mantenendo l'addome contratto.",
    ],
    errors: [
      "Trattenere il respiro durante la combo.",
      "Perdere la guardia tra un colpo e l'altro.",
      "Saltare la rotazione delle anche su cross e ginocchiata.",
    ],
    breathing: "Tre espirazioni brevi: jab, cross, ginocchiata. Inspira tra una combo e la successiva.",
  },
  {
    nome: "Slip + Punch",
    emoji: "🌀",
    image: slipPunchImg,
    desc: "Schiva laterale con piegamento del busto, poi pugno. Alterna i lati.",
    durata: 30,
    coreNote: "Lo slip allena obliqui e punto vita: addome contratto.",
    setup: "In guardia, ginocchia leggermente piegate, sguardo avanti.",
    steps: [
      "Piega il busto a destra spostando il peso sulla gamba destra (slip).",
      "Risali e lancia il cross sinistro con rotazione del busto.",
      "Ripeti dal lato opposto: slip a sinistra e cross destro.",
      "Mantieni le mani in guardia tra una schivata e l'altra.",
    ],
    errors: [
      "Piegare solo la testa senza coinvolgere il busto.",
      "Schiena curva durante lo slip.",
      "Pugno senza rotazione dopo la schivata.",
    ],
    breathing: "Inspira durante lo slip, espira sul pugno.",
  },
];

/**
 * Hash deterministico ISO-week dal giorno (YYYY-MM-DD).
 * Usato per ruotare/alternare la variante in modo stabile per giorno.
 */
function isoWeekNumber(giorno: string): number {
  const d = new Date(giorno + "T00:00:00");
  if (isNaN(d.getTime())) return 0;
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

/**
 * Sceglie la variante del blocco brucia grassi in base a:
 *  - focus del workout
 *  - giorno (per alternare deterministicamente, max 1-2 combat/settimana)
 * I workout sono lun/mer/ven quindi mai consecutivi.
 */
export function pickFinisherVariant(focus: string | undefined, giorno: string): FinisherVariant {
  const week = isoWeekNumber(giorno);
  const f = (focus || "total_body").toLowerCase();

  // Total Body → preferire combat (ma alterna ogni 3 settimane per non saturare)
  if (f === "total_body" || f === "full_body") {
    return week % 3 === 0 ? "metabolic" : "combat";
  }
  // Lower Body → alternare settimana per settimana
  if (f === "lower_body" || f === "gambe_glutei") {
    return week % 2 === 0 ? "combat" : "metabolic";
  }
  // Upper Body → limitare combat (solo 1 settimana su 4)
  if (f === "upper_body" || f === "core" || f === "core_stabilita") {
    return week % 4 === 0 ? "combat" : "metabolic";
  }
  return "metabolic";
}

/**
 * Restituisce ESATTAMENTE un blocco brucia grassi (5 esercizi, ~2.5 min)
 * con la variante scelta in modo deterministico per il giorno + focus.
 * Non duplica mai due varianti nello stesso workout.
 */
export function getFinisherForWorkout(focus: string | undefined, giorno: string): { exercises: FinisherExercise[]; variant: FinisherVariant } {
  const variant = pickFinisherVariant(focus, giorno);
  const pool = variant === "combat" ? COMBAT_POOL : METABOLIC_POOL;
  // Selezione deterministica: usa il giorno come seed semplice
  const seed = giorno.split("-").reduce((a, p) => a + parseInt(p, 10), 0);
  const ordered = [...pool].sort((a, b) => {
    const ha = (a.nome.charCodeAt(0) + seed) % 97;
    const hb = (b.nome.charCodeAt(0) + seed) % 97;
    return ha - hb;
  });
  return { exercises: ordered.slice(0, 5), variant };
}

/**
 * Compat layer: la vecchia API restituiva 5 esercizi random metabolic.
 * Manteniamo la firma per non rompere import esterni; preferire getFinisherForWorkout.
 */
export function getFinisherExercises(): FinisherExercise[] {
  const shuffled = [...METABOLIC_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

export function getFinisherDuration(exercises: FinisherExercise[]): string {
  const total = exercises.reduce((s, e) => s + e.durata, 0);
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return sec > 0 ? `${min}:${sec < 10 ? "0" : ""}${sec}` : `${min}:00`;
}
