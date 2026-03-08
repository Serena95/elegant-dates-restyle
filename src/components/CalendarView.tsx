import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { CONFIG_LIVELLI, ATTREZZO_SHORT, ATTREZZO_ICONS } from "@/data/exercises";

interface CalendarViewProps {
  livello: string;
  storicoCal: Record<string, any>;
  onBack: () => void;
}

export function CalendarView({ livello, storicoCal, onBack }: CalendarViewProps) {
  const [meseCorrente, setMeseCorrente] = useState(new Date().getMonth());
  const [annoCorrente, setAnnoCorrente] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const mesi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
  const giorni = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

  const oggi = new Date();
  const oggiStr = oggi.toISOString().split("T")[0];

  const { primoGiorno, giorniNelMese } = useMemo(() => {
    const primo = new Date(annoCorrente, meseCorrente, 1).getDay();
    return { primoGiorno: primo === 0 ? 6 : primo - 1, giorniNelMese: new Date(annoCorrente, meseCorrente + 1, 0).getDate() };
  }, [annoCorrente, meseCorrente]);

  const cambiaMese = (d: number) => {
    let m = meseCorrente + d;
    let a = annoCorrente;
    if (m < 0) { m = 11; a--; }
    if (m > 11) { m = 0; a++; }
    setMeseCorrente(m);
    setAnnoCorrente(a);
  };

  const { completati, totale, streak } = useMemo(() => {
    let comp = 0, tot = 0;
    for (let g = 1; g <= giorniNelMese; g++) {
      const data = new Date(annoCorrente, meseCorrente, g);
      const dow = data.getDay();
      if (dow === 1 || dow === 3 || dow === 5) {
        tot++;
        const key = `${annoCorrente}-${String(meseCorrente + 1).padStart(2, "0")}-${String(g).padStart(2, "0")}`;
        if (storicoCal[key]) comp++;
      }
    }

    let s = 0;
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    while (true) {
      const dow = d.getDay();
      if (dow === 1 || dow === 3 || dow === 5) {
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        if (storicoCal[k]) s++; else break;
      }
      d.setDate(d.getDate() - 1);
      if (s > 365) break;
    }
    return { completati: comp, totale: tot, streak: s };
  }, [storicoCal, annoCorrente, meseCorrente, giorniNelMese]);

  const pct = totale === 0 ? 0 : Math.round((completati / totale) * 100);
  const selectedWorkout = selectedDay ? storicoCal[selectedDay] : null;

  const handleDayClick = (key: string) => {
    if (!storicoCal[key]) {
      alert("Data: " + key + "\nNessun allenamento registrato.");
      return;
    }
    setSelectedDay(key);
  };

  return (
    <div className="space-y-5 relative">
      {selectedDay && selectedWorkout && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDay(null)}>
          <div className="bg-card rounded-2xl border border-border shadow-2xl p-6 max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-lg text-foreground">📅 Dettaglio Allenamento</h4>
              <button onClick={() => setSelectedDay(null)} className="text-muted-foreground hover:text-foreground p-1"><X size={20} /></button>
            </div>
            <div className="text-center space-y-3">
              <span className="text-4xl">{ATTREZZO_ICONS[selectedWorkout.attrezzo] || "🏋️"}</span>
              <div><p className="text-sm text-muted-foreground">Data</p><p className="font-bold text-foreground">{selectedDay}</p></div>
              <div><p className="text-sm text-muted-foreground">Attrezzo</p><p className="font-bold text-primary text-lg">{selectedWorkout.attrezzo}</p></div>
              {selectedWorkout.focus && (
                <div><p className="text-sm text-muted-foreground">Focus</p><p className="font-bold text-foreground text-lg">{selectedWorkout.focus.icon} {selectedWorkout.focus.label}</p></div>
              )}
              <div><p className="text-sm text-muted-foreground">Round completati</p><p className="font-bold text-foreground text-lg">{selectedWorkout.round}</p></div>
              {selectedWorkout.completato && (
                <div className="bg-pilates-green/20 text-pilates-green text-sm font-bold p-3 rounded-xl">✅ Sessione completata con successo!</div>
              )}
            </div>
            <button onClick={() => setSelectedDay(null)} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Chiudi</button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-primary text-xl"><ChevronLeft /></button>
        <h2 className="text-xl font-bold text-primary">📅 Calendario Workout</h2>
        <div className="w-6" />
      </div>

      <div className="flex justify-between items-center">
        <button onClick={() => cambiaMese(-1)} className="text-foreground text-lg p-2"><ChevronLeft size={20} /></button>
        <h3 className="text-lg font-bold text-foreground">{mesi[meseCorrente]} {annoCorrente}</h3>
        <button onClick={() => cambiaMese(1)} className="text-foreground text-lg p-2"><ChevronRight size={20} /></button>
      </div>

      <div className="bg-gradient-to-br from-card to-pilates-light/50 dark:from-card dark:to-accent rounded-2xl p-4 border border-border shadow-md">
        <div className="flex items-center justify-around mb-3">
          <div className="text-center">
            <div className="text-2xl font-black text-primary">{streak}</div>
            <div className="text-xs text-muted-foreground">🔥 Serie</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-2xl font-black text-primary">{completati}</div>
            <div className="text-xs text-muted-foreground">✅ Fatti</div>
          </div>
        </div>
        <div className="flex justify-between text-xs font-semibold text-foreground mb-1">
          <span>Completamento mese</span>
          <span className="text-primary">{pct}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-pilates-glow rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-xs font-bold text-muted-foreground uppercase mb-1">
        {giorni.map(g => <div key={g}>{g}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: primoGiorno }, (_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: giorniNelMese }, (_, i) => {
          const g = i + 1;
          const key = `${annoCorrente}-${String(meseCorrente + 1).padStart(2, "0")}-${String(g).padStart(2, "0")}`;
          const isOggi = key === oggiStr;
          const hasWorkout = storicoCal[key];
          const dow = new Date(annoCorrente, meseCorrente, g).getDay();
          const isTraining = dow === 1 || dow === 3 || dow === 5;

          return (
            <div
              key={g}
              onClick={() => (hasWorkout || isTraining) && handleDayClick(key)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-semibold relative transition-all select-none
                ${hasWorkout || isTraining ? "cursor-pointer hover:scale-105" : ""}
                ${isOggi ? "ring-2 ring-primary bg-primary/15 text-primary font-black" : ""}
                ${hasWorkout ? "bg-pilates-green/15 border-2 border-pilates-green text-pilates-green" : ""}
                ${!isOggi && !hasWorkout && isTraining ? "bg-pilates-light dark:bg-accent text-foreground" : ""}
                ${!isOggi && !hasWorkout && !isTraining ? "bg-muted/50 text-muted-foreground" : ""}
              `}
            >
              <span className="text-sm">{g}</span>
              {hasWorkout && (
                <>
                  <span className="text-[8px] mt-0.5 bg-card/80 px-1 rounded font-black">
                    {ATTREZZO_SHORT[hasWorkout.attrezzo] || hasWorkout.attrezzo?.substring(0, 2).toUpperCase()}
                  </span>
                  <span className="absolute top-0.5 right-0.5 text-[9px] text-pilates-green font-black">✓</span>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground border-t border-border pt-3">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-pilates-light dark:bg-accent border border-border" /><span>Allenamento (L-M-V)</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-muted/50 border border-border" /><span>Riposo</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-pilates-green/15 border-2 border-pilates-green" /><span>Sessione Fatta</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded ring-2 ring-primary" /><span>Oggi</span></div>
      </div>

      <button onClick={onBack} className="w-full py-3 rounded-2xl border-2 border-primary text-primary font-bold bg-card">
        ⬅ TORNA ALLA DASHBOARD
      </button>
    </div>
  );
}
