import { useState } from "react";
import { ChevronLeft, Search, Dumbbell } from "lucide-react";
import { EXERCISE_LIBRARY, Exercise, ATTREZZO_ICONS } from "@/data/exercises";
import { ExerciseImage } from "./ExerciseImage";

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
