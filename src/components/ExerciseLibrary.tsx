import { useState } from "react";
import { ChevronLeft, Search, Dumbbell } from "lucide-react";
import { EXERCISE_LIBRARY, Exercise, ATTREZZO_ICONS } from "@/data/exercises";
import { ExerciseImage } from "./ExerciseImage";
import { ALL_STRETCHING } from "@/data/stretching";

import jabCrossImg from "@/assets/combat/jab-cross.jpg";
import hookImg from "@/assets/combat/hook.jpg";
import frontKickImg from "@/assets/combat/front-kick.jpg";
import kneeStrikeImg from "@/assets/combat/knee-strike.jpg";
import sprawlImg from "@/assets/combat/sprawl.jpg";
import sideKickImg from "@/assets/combat/side-kick.jpg";
import comboImg from "@/assets/combat/combo.jpg";
import slipPunchImg from "@/assets/combat/slip-punch.jpg";

interface ExtraExercise {
  id: string;
  nome: string;
  emoji: string;
  desc: string;
  durata: number;
  livello: "base" | "medio" | "avanzato";
  coreNote?: string;
  setup?: string;
  steps?: string[];
  errors?: string[];
  breathing?: string;
  image?: string;
}

const METABOLIC_LIB: ExtraExercise[] = [
  { id: "met_jj", nome: "Jumping Jack", emoji: "⭐", desc: "Salta aprendo braccia e gambe, poi torna in posizione. Ritmo alto.", durata: 30, livello: "base", coreNote: "Mantieni l'addome contratto durante ogni salto." },
  { id: "met_mc", nome: "Mountain Climber", emoji: "🏔️", desc: "In plank, porta le ginocchia al petto in modo alternato e veloce.", durata: 30, livello: "medio", coreNote: "Core attivo: non sollevare i fianchi." },
  { id: "met_pd", nome: "Plank Dinamico", emoji: "💥", desc: "Alterna plank su avambracci e plank su mani.", durata: 30, livello: "medio", coreNote: "Addome e glutei contratti." },
  { id: "met_bp", nome: "Burpee Modificato", emoji: "🔥", desc: "Squat, mani a terra, salta indietro in plank, torna su.", durata: 30, livello: "avanzato", coreNote: "Attiva il core nel passaggio da squat a plank." },
  { id: "met_hk", nome: "High Knees", emoji: "🦵", desc: "Corsa sul posto portando le ginocchia alte.", durata: 30, livello: "base", coreNote: "Contrai l'addome ad ogni sollevamento." },
  { id: "met_sj", nome: "Squat Jump", emoji: "🚀", desc: "Squat profondo poi salto in alto. Atterra morbida.", durata: 30, livello: "avanzato", coreNote: "Core attivo nel salto e nell'atterraggio." },
  { id: "met_ts", nome: "Plank con Tocco Spalla", emoji: "🎯", desc: "In plank, tocca la spalla opposta con ogni mano.", durata: 30, livello: "medio", coreNote: "Stabilizza i fianchi: non ruotare il bacino." },
  { id: "met_ss", nome: "Speed Skater", emoji: "⛸️", desc: "Saltelli laterali ampi, gamba dietro in diagonale.", durata: 30, livello: "medio", coreNote: "Busto stabile, addome contratto." },
];

const COMBAT_LIB: ExtraExercise[] = [
  { id: "cmb_jc", nome: "Jab + Cross (boxing)", emoji: "🥊", image: jabCrossImg, livello: "base", durata: 30, desc: "Alterna jab e cross con rotazione del busto.", coreNote: "Il colpo parte dal core.", setup: "Piedi alla larghezza spalle, piede debole avanti. Mani sugli zigomi.", steps: ["Estendi il braccio avanti (jab) ruotando la spalla.", "Richiama in guardia.", "Lancia il cross posteriore ruotando piede e anca.", "Torna in guardia."], errors: ["Spalle alte.", "Pugno solo di braccio.", "Mano ferma estesa."], breathing: "Espira corto a ogni colpo." },
  { id: "cmb_hk", nome: "Hook Sinistro/Destro", emoji: "🥊", image: hookImg, livello: "medio", durata: 30, desc: "Ganci alternati con gomito alto e rotazione delle anche.", coreNote: "Rotazione del punto vita: obliqui attivi.", setup: "Guardia, peso 50/50, ginocchia morbide.", steps: ["Ruota anca e piede del lato che colpisce.", "Braccio orizzontale, gomito alla spalla.", "Colpisci a 90° e torna in guardia.", "Alterna seguendo il busto."], errors: ["Gomito basso.", "Braccio rigido.", "Sbilanciarsi in avanti."], breathing: "Soffia ad ogni hook." },
  { id: "cmb_fk", nome: "Front Kick Controllato", emoji: "🦶", image: frontKickImg, livello: "medio", durata: 30, desc: "Calcio frontale all'altezza del bacino, lento e controllato.", coreNote: "Il calcio parte dall'addome basso.", setup: "Mani in guardia, gamba di appoggio leggermente piegata.", steps: ["Solleva il ginocchio all'altezza dell'anca.", "Estendi spingendo dal tallone.", "Richiama il ginocchio prima di riappoggiare.", "Cambia gamba."], errors: ["Inarcare la schiena.", "Gamba estesa dopo il calcio.", "Perdere la guardia."], breathing: "Espira nell'estensione, inspira nel richiamo." },
  { id: "cmb_kn", nome: "Knee Strike", emoji: "🦵", image: kneeStrikeImg, livello: "base", durata: 30, desc: "Ginocchiate frontali alternate, mani in guardia.", coreNote: "Contrai addome e fianchi ad ogni ginocchiata.", setup: "Piedi paralleli, mani avanti.", steps: ["Tira le mani al petto.", "Porta il ginocchio in alto.", "Spingi le anche avanti nell'impatto.", "Cambia gamba."], errors: ["Ginocchio di lato.", "Schiena curva.", "Solo gamba, senza anca."], breathing: "Espira con un \"tss\" secco." },
  { id: "cmb_sp", nome: "Sprawl Soft", emoji: "💪", image: sprawlImg, livello: "medio", durata: 30, desc: "Da eretto scendi in plank e risali, controllata.", coreNote: "Core attivo nella discesa e risalita.", setup: "Mani in guardia, ginocchia morbide.", steps: ["Mani a terra davanti ai piedi.", "Spingi le gambe in plank alto.", "Tieni 1 secondo addome contratto.", "Risali in guardia."], errors: ["Sedere alto.", "Ginocchia bloccate in risalita.", "Senza coinvolgere il core."], breathing: "Inspira giù, espira su." },
  { id: "cmb_sk", nome: "Side Kick Controllato", emoji: "🦿", image: sideKickImg, livello: "avanzato", durata: 30, desc: "Calcio laterale all'altezza dell'anca.", coreNote: "Fianchi e obliqui stabilizzano la gamba.", setup: "Di fianco, peso sulla gamba di appoggio, mani in guardia.", steps: ["Ginocchio verso il petto.", "Ruota l'anca di appoggio aprendo il bacino.", "Estendi di lato spingendo dal tallone.", "Richiama e torna."], errors: ["Inclinare troppo il busto.", "Calciare con la punta.", "Bloccare il ginocchio."], breathing: "Espira lungo nell'estensione." },
  { id: "cmb_co", nome: "Combo 1-2-Knee", emoji: "🥋", image: comboImg, livello: "avanzato", durata: 30, desc: "Jab, cross e ginocchiata in sequenza.", coreNote: "Tutto nasce dal core: rotazione fluida del busto.", setup: "Guardia base, peso bilanciato.", steps: ["Jab e richiamo.", "Cross ruotando l'anca posteriore.", "Mani al petto e ginocchio frontale.", "Torna in guardia."], errors: ["Trattenere il respiro.", "Perdere la guardia.", "Saltare la rotazione delle anche."], breathing: "Tre espirazioni brevi: jab, cross, ginocchiata." },
  { id: "cmb_sl", nome: "Slip + Punch", emoji: "🌀", image: slipPunchImg, livello: "medio", durata: 30, desc: "Schiva laterale e poi pugno. Alterna i lati.", coreNote: "Slip allena obliqui e punto vita.", setup: "Guardia, ginocchia morbide.", steps: ["Piega il busto a destra (slip).", "Risali e lancia il cross sinistro.", "Ripeti dal lato opposto.", "Mani in guardia tra una schivata e l'altra."], errors: ["Piegare solo la testa.", "Schiena curva.", "Pugno senza rotazione."], breathing: "Inspira nello slip, espira sul pugno." },
];

const STRETCH_LIB: ExtraExercise[] = ALL_STRETCHING.map((s, i) => ({
  id: `str_${i}`,
  nome: s.nome,
  emoji: s.emoji,
  desc: s.desc,
  durata: s.durata,
  livello: "base" as const,
}));

interface ExtraSection {
  key: string;
  title: string;
  icon: string;
  intro: string;
  items: ExtraExercise[];
}

const EXTRA_SECTIONS: ExtraSection[] = [
  { key: "metabolic", title: "BRUCIA GRASSI - METABOLICO", icon: "🔥", intro: "Circuito ad alta intensità per attivare il metabolismo.", items: METABOLIC_LIB },
  { key: "combat", title: "BRUCIA GRASSI - COMBAT", icon: "🥊", intro: "Movimenti stile combattimento, controllati, con forte attivazione del core.", items: COMBAT_LIB },
  { key: "stretching", title: "STRETCHING", icon: "🧘", intro: "Allungamento finale 30s per esercizio, in base al focus del giorno.", items: STRETCH_LIB },
];

interface ExerciseLibraryProps {
  onBack: () => void;
}

const LIVELLO_COLORS: Record<string, string> = {
  base: "bg-pilates-green text-white",
  medio: "bg-primary text-primary-foreground",
  avanzato: "bg-pilates-red text-white",
};

export function ExerciseLibrary({ onBack }: ExerciseLibraryProps) {
  const [search, setSearch] = useState("");
  const [openItem, setOpenItem] = useState<string | null>(null);

  // Group by attrezzo
  const grouped = EXERCISE_LIBRARY.reduce((acc, e) => {
    if (!acc[e.attrezzo]) acc[e.attrezzo] = [];
    acc[e.attrezzo].push(e);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const filteredDB = Object.entries(grouped)
    .map(([attrezzo, esercizi]) => {
      const filtered = esercizi.filter(e =>
        e.nome.toLowerCase().includes(search.toLowerCase()) ||
        e.categoria.toLowerCase().includes(search.toLowerCase()) ||
        e.muscoli.some(m => m.toLowerCase().includes(search.toLowerCase()))
      );
      return { attrezzo, esercizi: filtered };
    })
    .filter(g => g.esercizi.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-primary"><ChevronLeft /></button>
        <h2 className="text-xl font-bold text-primary flex-1 text-center">📚 Libreria Esercizi</h2>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cerca esercizio, tipo o muscolo..."
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-card text-foreground"
        />
      </div>

      {filteredDB.map(({ attrezzo, esercizi }) => {
        const icon = ATTREZZO_ICONS[attrezzo] || "🏋️";
        return (
          <div key={attrezzo}>
            <div className="bg-primary text-primary-foreground p-3 rounded-xl font-bold uppercase text-center text-sm flex items-center justify-center gap-2">
              <span>{icon}</span> {attrezzo}
            </div>

            {/* Group by tipo within attrezzo */}
            {Object.entries(
              esercizi.reduce((acc, e) => {
                (acc[e.categoria] = acc[e.categoria] || []).push(e);
                return acc;
              }, {} as Record<string, typeof esercizi>)
            ).map(([tipo, items]) => (
              <div key={tipo} className="mt-3 px-2">
                <div className="text-xs font-bold text-secondary uppercase border-b border-border pb-1 mb-2">
                  {tipo}
                </div>
                {items.map(e => (
                  <div
                    key={e.id}
                    onClick={() => setOpenItem(openItem === e.id ? null : e.id)}
                    className="py-2 border-b border-border/50 cursor-pointer"
                  >
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-primary">{e.nome}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${LIVELLO_COLORS[e.livello]}`}>
                        {e.livello.toUpperCase()}
                      </span>
                    </div>
                    {openItem === e.id && (
                      <div className="mt-2 p-3 bg-accent/50 rounded-lg border-l-4 border-primary text-sm text-foreground space-y-2">
                        <ExerciseImage
                          exerciseId={e.id}
                          exerciseName={e.nome}
                          category={e.categoria}
                          muscles={e.muscoli}
                          equipment={e.attrezzo}
                          className="w-full"
                          showGenerateButton={true}
                        />
                        <p>{e.descrizione}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Dumbbell size={12} className="text-muted-foreground mt-0.5" />
                          {e.muscoli.map(m => (
                            <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      })}

      <button onClick={onBack} className="w-full py-3 rounded-2xl border-2 border-primary text-primary font-bold bg-card">
        ⬅ TORNA ALLA DASHBOARD
      </button>
    </div>
  );
}
