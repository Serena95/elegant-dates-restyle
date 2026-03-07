import { DayCard } from "./DayCard";
import { WeekPlan, CONFIG_LIVELLI } from "@/data/exercises";

interface DashboardProps {
  piano: WeekPlan;
  livello: string;
  onGeneraNuova: () => void;
  onAvviaAllenamento: (giorno: string) => void;
  onChangeLivello: (l: string) => void;
}

export function Dashboard({
  piano, livello, onGeneraNuova, onAvviaAllenamento, onChangeLivello,
}: DashboardProps) {
  const badgeColor = livello === "BASSO" ? "bg-pilates-green" : livello === "MEDIO" ? "bg-primary" : "bg-pilates-red";

  return (
    <div className="space-y-6">
      {/* Level selector */}
      <div className="bg-pilates-light dark:bg-accent rounded-2xl p-4 border border-primary/15">
        <label className="font-bold text-sm uppercase tracking-wide text-foreground flex items-center gap-2 mb-2">
          IL TUO LIVELLO:
          <span className={`${badgeColor} text-primary-foreground px-3 py-0.5 rounded-full text-xs`}>{livello}</span>
        </label>
        <select
          value={livello}
          onChange={e => onChangeLivello(e.target.value)}
          className="w-full p-3 rounded-xl border border-border bg-card text-foreground font-bold text-sm"
        >
          <option value="BASSO">BASSO (2 Round - Leggero)</option>
          <option value="MEDIO">MEDIO (3 Round - Standard)</option>
          <option value="AVANZATO">AVANZATO (4 Round - Intenso)</option>
        </select>
      </div>

      {/* Day Cards */}
      <div className="space-y-3">
        {Object.keys(piano).length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nessun piano generato. Clicca il tasto sotto!</p>
        ) : (
          ["Lunedì", "Mercoledì", "Venerdì"]
            .filter(g => piano[g])
            .map((giorno, i) => (
              <DayCard key={giorno} giorno={giorno} dati={piano[giorno]} livello={livello} index={i} onClick={() => onAvviaAllenamento(giorno)} />
            ))
        )}
      </div>

      {/* Generate button */}
      <button onClick={onGeneraNuova} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg hover:opacity-90 transition">
        Genera Nuova Settimana
      </button>
    </div>
  );
}
