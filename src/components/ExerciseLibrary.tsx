import { useState } from "react";
import { ChevronLeft, Search } from "lucide-react";
import { databaseEsercizi } from "@/data/exercises";

interface ExerciseLibraryProps {
  onBack: () => void;
}

export function ExerciseLibrary({ onBack }: ExerciseLibraryProps) {
  const [search, setSearch] = useState("");
  const [openItem, setOpenItem] = useState<string | null>(null);

  const filteredDB = Object.entries(databaseEsercizi).map(([attrezzo, esercizi]) => {
    const filtered = esercizi.filter(e =>
      e.nome.toLowerCase().includes(search.toLowerCase()) ||
      e.focus.toLowerCase().includes(search.toLowerCase())
    );
    return { attrezzo, esercizi: filtered };
  }).filter(g => g.esercizi.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-primary"><ChevronLeft /></button>
        <h2 className="text-xl font-bold text-primary flex-1 text-center">📚 Libreria</h2>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cerca esercizio o focus..."
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-card text-foreground"
        />
      </div>

      {filteredDB.map(({ attrezzo, esercizi }) => (
        <div key={attrezzo}>
          <div className="bg-primary text-primary-foreground p-3 rounded-xl font-bold uppercase text-center text-sm">
            {attrezzo}
          </div>

          {Object.entries(
            esercizi.reduce((acc, e) => {
              (acc[e.focus] = acc[e.focus] || []).push(e);
              return acc;
            }, {} as Record<string, typeof esercizi>)
          ).map(([focus, items]) => (
            <div key={focus} className="mt-3 px-2">
              <div className="text-xs font-bold text-pilates-glow uppercase border-b border-border pb-1 mb-2">{focus}</div>
              {items.map(e => (
                <div
                  key={e.nome}
                  onClick={() => setOpenItem(openItem === e.nome ? null : e.nome)}
                  className="py-2 border-b border-border/50 cursor-pointer"
                >
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-primary">{e.nome}</span>
                  </div>
                  {openItem === e.nome && (
                    <div className="mt-2 p-3 bg-pilates-light dark:bg-accent rounded-lg border-l-4 border-primary text-sm text-foreground">
                      {e.spiegazione}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      <button onClick={onBack} className="w-full py-3 rounded-2xl border-2 border-primary text-primary font-bold bg-card">
        ⬅ TORNA ALLA DASHBOARD
      </button>
    </div>
  );
}
