import { useState } from "react";
import { TRAINING_PROGRAMS, TrainingProgram } from "@/data/programs";
import { ChevronRight, Clock, Dumbbell, Trophy, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ProgramsViewProps {
  userAttrezzi: string[];
  onStartProgram: (program: TrainingProgram) => void;
  onCancelProgram?: () => void;
  activeProgram?: { id: string; week: number } | null;
}

export function ProgramsView({ userAttrezzi, onStartProgram, onCancelProgram, activeProgram }: ProgramsViewProps) {
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);

  if (selectedProgram) {
    const isActive = activeProgram?.id === selectedProgram.id;
    return (
      <div className="space-y-5">
        <button onClick={() => setSelectedProgram(null)} className="text-primary font-bold text-sm">
          ← Torna ai programmi
        </button>

        <div className="text-center space-y-2">
          <span className="text-5xl">{selectedProgram.icon}</span>
          <h2 className="text-2xl font-black text-foreground">{selectedProgram.nome}</h2>
          <p className="text-sm text-muted-foreground">{selectedProgram.descrizione}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <Clock size={16} className="text-primary mx-auto mb-1" />
            <p className="text-sm font-black text-foreground">{selectedProgram.durata}</p>
            <p className="text-[10px] text-muted-foreground font-bold">Settimane</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <Dumbbell size={16} className="text-primary mx-auto mb-1" />
            <p className="text-sm font-black text-foreground">{selectedProgram.durata * 3}</p>
            <p className="text-[10px] text-muted-foreground font-bold">Allenamenti</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <Trophy size={16} className="text-primary mx-auto mb-1" />
            <p className="text-sm font-black text-foreground">{selectedProgram.livello}</p>
            <p className="text-[10px] text-muted-foreground font-bold">Livello</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase text-muted-foreground">Piano Settimanale</h3>
          {selectedProgram.settimane.slice(0, 4).map((week) => (
            <div key={week.settimana} className="bg-card rounded-xl border border-border p-3">
              <p className="text-xs font-bold text-primary mb-2">Settimana {week.settimana}</p>
              <div className="flex gap-2">
                {week.giorni.map((g, i) => (
                  <div key={i} className="flex-1 bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] font-bold text-muted-foreground">{g.giorno.slice(0, 3)}</p>
                    <p className="text-xs font-bold text-foreground mt-0.5">{g.attrezzo.split(" ")[0]}</p>
                    <p className="text-[9px] text-muted-foreground">{g.numEsercizi} es.</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {selectedProgram.durata > 4 && (
            <p className="text-xs text-center text-muted-foreground">
              + altre {selectedProgram.durata - 4} settimane...
            </p>
          )}
        </div>

        {isActive ? (
          <div className="space-y-2">
            <div className="bg-primary/10 rounded-xl p-3 border border-primary/20 text-center">
              <p className="text-sm font-bold text-primary">✅ Programma attivo — Settimana {activeProgram?.week}</p>
            </div>
            <Button variant="destructive" className="w-full" onClick={onCancelProgram}>
              <XCircle className="w-4 h-4 mr-2" /> Annulla Programma
            </Button>
          </div>
        ) : (
          <button
            onClick={() => onStartProgram(selectedProgram)}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg hover:opacity-90 transition"
          >
            Inizia Programma
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-foreground">📋 Programmi di Allenamento</h2>
        <p className="text-sm text-muted-foreground mt-1">Scegli un programma guidato per raggiungere i tuoi obiettivi</p>
      </div>

      {activeProgram && (
        <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-primary uppercase">Programma Attivo</p>
            <p className="text-sm font-bold text-foreground mt-1">
              {TRAINING_PROGRAMS.find(p => p.id === activeProgram.id)?.nome} — Settimana {activeProgram.week}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancelProgram} className="text-destructive hover:text-destructive">
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {TRAINING_PROGRAMS.map((program, i) => {
          const isActive = activeProgram?.id === program.id;
          return (
            <motion.button
              key={program.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setSelectedProgram(program)}
              className={`w-full bg-card rounded-2xl border p-4 text-left hover:shadow-md transition flex items-center gap-4 ${
                isActive ? "border-primary/40 bg-primary/5" : "border-border"
              }`}
            >
              <span className="text-4xl">{program.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground">{program.nome}</h3>
                  {isActive && (
                    <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">ATTIVO</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{program.descrizione}</p>
                <div className="flex gap-3 mt-1.5">
                  <span className="text-[10px] text-muted-foreground font-bold">{program.durata} sett.</span>
                  <span className="text-[10px] text-muted-foreground font-bold">{program.livello}</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
