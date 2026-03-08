export interface FitnessChallenge {
  id: string;
  title: string;
  durationDays: number;
  focus: string;
  description: string;
  icon: string;
  premium: boolean;
}

export const FITNESS_CHALLENGES: FitnessChallenge[] = [
  {
    id: "core_7",
    title: "7 Giorni Core Challenge",
    durationDays: 7,
    focus: "core",
    description: "Rafforza il tuo core in una settimana con esercizi mirati ogni giorno",
    icon: "🔥",
    premium: false,
  },
  {
    id: "glutes_14",
    title: "14 Giorni Glutei Challenge",
    durationDays: 14,
    focus: "glutei",
    description: "Due settimane dedicate a tonificare e rafforzare i glutei",
    icon: "🍑",
    premium: false,
  },
  {
    id: "pilates_30",
    title: "30 Giorni Pilates Reset",
    durationDays: 30,
    focus: "full_body",
    description: "Un mese completo di Pilates per trasformare il tuo corpo",
    icon: "🧘",
    premium: true,
  },
  {
    id: "mobility_7",
    title: "7 Giorni Mobilità",
    durationDays: 7,
    focus: "mobilita",
    description: "Migliora la tua flessibilità e riduci le tensioni muscolari",
    icon: "🌊",
    premium: false,
  },
  {
    id: "upper_14",
    title: "14 Giorni Upper Body",
    durationDays: 14,
    focus: "upper_body",
    description: "Braccia, spalle e schiena: tonifica la parte superiore del corpo",
    icon: "💪",
    premium: true,
  },
  {
    id: "total_30",
    title: "30 Giorni Total Body",
    durationDays: 30,
    focus: "full_body",
    description: "La sfida definitiva: un mese per un corpo completamente trasformato",
    icon: "⭐",
    premium: true,
  },
];
