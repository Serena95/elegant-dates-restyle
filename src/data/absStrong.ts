// Blocco "Addominali Strong" - eseguito DOPO i round principali e PRIMA del finisher brucia grassi.
// Lavoro a REPETIZIONI (non a tempo): attiva in maniera profonda addome, obliqui, fianchi e punto vita.
// Selezione deterministica per giorno per garantire varietà ma stabilità nella sessione.

export interface AbsStrongExercise {
  nome: string;
  emoji: string;
  desc: string;
  reps: string; // es: "20 reps", "15 per lato", "30 sec hold"
  zona: "addome" | "obliqui" | "fianchi" | "core profondo";
  coreNote: string;
  setup?: string;
  steps?: string[];
  errors?: string[];
  breathing?: string;
}

const ABS_POOL: AbsStrongExercise[] = [
  {
    nome: "Crunch Inverso",
    emoji: "💪",
    desc: "Sdraiata, porta le ginocchia al petto sollevando il bacino dal pavimento.",
    reps: "20 reps",
    zona: "addome",
    coreNote: "Solleva con l'addome basso, NON con lo slancio delle gambe.",
    setup: "Sdraiata supina, gambe piegate a 90°, braccia distese lungo i fianchi.",
    steps: [
      "Espira e arriccia il bacino verso il petto.",
      "Solleva i glutei di pochi cm dal tappeto.",
      "Inspira e torna giù lentamente, controllando.",
    ],
    errors: ["Usare lo slancio", "Sollevare la testa", "Non controllare la discesa"],
    breathing: "Espira salendo, inspira scendendo.",
  },
  {
    nome: "Russian Twist",
    emoji: "🔥",
    desc: "Seduta, inclina il busto indietro e ruota da un lato all'altro toccando il pavimento.",
    reps: "30 reps totali (15 per lato)",
    zona: "obliqui",
    coreNote: "La rotazione parte dal busto, non dalle braccia.",
    setup: "Seduta, ginocchia piegate, talloni sollevati o appoggiati, busto a 45°.",
    steps: [
      "Mani giunte davanti al petto.",
      "Ruota il busto a destra e tocca il pavimento accanto al fianco.",
      "Ruota verso sinistra. Continua alternando.",
    ],
    errors: ["Muovere solo le braccia", "Curvare la schiena", "Velocità eccessiva"],
    breathing: "Espira ad ogni rotazione.",
  },
  {
    nome: "V-Ups",
    emoji: "✨",
    desc: "Da supina solleva contemporaneamente busto e gambe formando una V.",
    reps: "12 reps",
    zona: "addome",
    coreNote: "Movimento esplosivo in salita, controllato in discesa.",
    setup: "Supina, braccia distese sopra la testa, gambe lunghe.",
    steps: [
      "Espira e solleva busto e gambe insieme.",
      "Mani verso i piedi, formando una V.",
      "Inspira e torna lenta in posizione di partenza.",
    ],
    errors: ["Usare slancio", "Piegare ginocchia", "Curvare le spalle"],
    breathing: "Espira salendo.",
  },
  {
    nome: "Side Plank Dips",
    emoji: "⚡",
    desc: "In plank laterale, abbassa e solleva il fianco lavorando il punto vita.",
    reps: "15 per lato",
    zona: "fianchi",
    coreNote: "Massima attivazione del punto vita ad ogni risalita.",
    setup: "Plank laterale su avambraccio, piedi sovrapposti, fianco sollevato.",
    steps: [
      "Abbassa il fianco verso il pavimento senza toccare.",
      "Risali contraendo forte l'obliquo.",
      "Mantieni allineamento testa-bacino-piedi.",
    ],
    errors: ["Ruotare il busto", "Spalla che collassa", "Bacino non allineato"],
    breathing: "Espira risalendo.",
  },
  {
    nome: "Bicycle Crunch",
    emoji: "🚴‍♀️",
    desc: "Pedala in aria portando il gomito al ginocchio opposto. Lento e controllato.",
    reps: "30 reps totali (15 per lato)",
    zona: "obliqui",
    coreNote: "La torsione viene dal busto, non dal collo.",
    setup: "Supina, mani dietro la nuca, gambe sollevate a 90°.",
    steps: [
      "Estendi una gamba e porta il gomito opposto al ginocchio piegato.",
      "Alterna lentamente con torsione completa del busto.",
    ],
    errors: ["Tirare il collo", "Movimento veloce e sciatto", "Schiena staccata da terra"],
    breathing: "Espira ad ogni torsione.",
  },
  {
    nome: "Hollow Hold",
    emoji: "🛶",
    desc: "Tieni la posizione 'a barchetta' con lombare schiacciata a terra.",
    reps: "30 sec hold",
    zona: "core profondo",
    coreNote: "Lombare incollata al pavimento per tutta la durata.",
    setup: "Supina, braccia oltre la testa, gambe lunghe sollevate.",
    steps: [
      "Solleva spalle e gambe contemporaneamente.",
      "Schiaccia la lombare a terra.",
      "Mantieni respirando normalmente.",
    ],
    errors: ["Lombare che si stacca", "Trattenere il respiro", "Spalle in tensione"],
    breathing: "Respiri brevi mantenendo la contrazione.",
  },
  {
    nome: "Leg Raise",
    emoji: "🦵",
    desc: "Sdraiata, solleva e abbassa le gambe distese lentamente.",
    reps: "15 reps",
    zona: "addome",
    coreNote: "Lavora l'addome basso, NON le anche.",
    setup: "Supina, mani sotto i glutei o lungo i fianchi, gambe distese.",
    steps: [
      "Solleva le gambe fino a 90°.",
      "Abbassa lentamente senza toccare terra.",
      "Risali con controllo.",
    ],
    errors: ["Inarcare la lombare", "Movimento veloce", "Toccare terra"],
    breathing: "Espira salendo, inspira scendendo.",
  },
  {
    nome: "Plank con Tocco Anche",
    emoji: "🎯",
    desc: "In plank su avambracci, tocca alternativamente le anche al pavimento.",
    reps: "20 reps totali (10 per lato)",
    zona: "fianchi",
    coreNote: "Rotazione controllata, attiva intensamente i fianchi.",
    setup: "Plank su avambracci, corpo allineato.",
    steps: [
      "Ruota leggermente il bacino e tocca l'anca destra a terra.",
      "Risali e ruota dall'altro lato.",
      "Mantieni i gomiti fermi.",
    ],
    errors: ["Sollevare i glutei", "Rotazione troppo ampia", "Spalle ondeggianti"],
    breathing: "Espira ad ogni tocco.",
  },
  {
    nome: "Flutter Kicks",
    emoji: "🌊",
    desc: "Sdraiata, calci alternati piccoli e veloci con gambe distese.",
    reps: "40 reps totali",
    zona: "addome",
    coreNote: "Lombare schiacciata a terra, addome sempre attivo.",
    setup: "Supina, gambe sollevate di 20cm, mani sotto i glutei.",
    steps: [
      "Alterna piccoli calci verticali.",
      "Mantieni la lombare incollata al pavimento.",
    ],
    errors: ["Lombare staccata", "Gambe troppo alte", "Tensione nel collo"],
    breathing: "Respira normalmente, addome attivo.",
  },
  {
    nome: "Side Bend",
    emoji: "🌙",
    desc: "In piedi o in ginocchio, inclina il busto lateralmente attivando i fianchi.",
    reps: "15 per lato",
    zona: "fianchi",
    coreNote: "Senti l'allungamento e contrazione del punto vita.",
    setup: "In piedi o in ginocchio, una mano dietro la nuca, l'altra distesa.",
    steps: [
      "Inclinati lateralmente verso il lato libero.",
      "Risali contraendo il fianco opposto.",
    ],
    errors: ["Inclinarsi avanti o indietro", "Movimento sciatto"],
    breathing: "Espira inclinandoti.",
  },
];

/**
 * Restituisce 5 esercizi addominali strong selezionati in modo deterministico
 * per il giorno, garantendo varietà di zone (addome, obliqui, fianchi, core profondo).
 */
export function getAbsStrongForWorkout(giorno: string): AbsStrongExercise[] {
  const seed = giorno.split("-").reduce((a, p) => a + parseInt(p, 10), 0);
  const ordered = [...ABS_POOL].sort((a, b) => {
    const ha = (a.nome.charCodeAt(0) + seed) % 97;
    const hb = (b.nome.charCodeAt(0) + seed) % 97;
    return ha - hb;
  });

  // Garantisci varietà: prendi almeno 1 da ciascuna zona se possibile
  const result: AbsStrongExercise[] = [];
  const zoneViste = new Set<string>();

  for (const ex of ordered) {
    if (!zoneViste.has(ex.zona)) {
      result.push(ex);
      zoneViste.add(ex.zona);
    }
    if (result.length >= 4) break;
  }
  // Riempi fino a 5 con i restanti
  for (const ex of ordered) {
    if (result.length >= 5) break;
    if (!result.includes(ex)) result.push(ex);
  }

  return result;
}
