import { useState } from "react";
import { Exercise, CONFIG_LIVELLI, ATTREZZO_ICONS, TEMA_CONFIG, detectFocus } from "@/data/exercises";
import { useTimer } from "@/hooks/useTimer";
import { TimerOverlay } from "./TimerOverlay";
import { ChevronLeft, Timer, Check, RefreshCw, Dumbbell, Pause, Play, SkipForward, X } from "lucide-react";

interface WorkoutViewProps {
  giorno: string;
  tema: string;
  esercizi: Exercise[];
  livello: string;
  roundCorrenti: number;
  onSegnaRound: () => void;
  onBack: () => void;
}

const RISCALDAMENTO_MODES = [
  { tipo: "TAPIS ROULANT", emoji: "🏃‍♂️", desc: "20 min • Pendenza 3% • Vel. 5.5 - 6.0 km/h", durata: 1200, label: "20 MIN" },
  { tipo: "CARDIO SOFT", emoji: "🏠", desc: "Esegui: 30\" Jumping Jacks, 30\" Corsa sul posto, 30\" Kick back (Ripeti 4 volte)", durata: 360, label: "6 MIN" },
  { tipo: "CAMMINATA ESTERNA", emoji: "🌳", desc: "25 min • Passo svelto • Braccia attive e rullata del piede completa.", durata: 1500, label: "25 MIN" },
];

export function WorkoutView({ giorno, tema, esercizi, livello, roundCorrenti, onSegnaRound, onBack }: WorkoutViewProps) {
  const config = CONFIG_LIVELLI[livello];
  const maxRound = config.round;
  const timer = useTimer();
  const [completati, setCompletati] = useState<Set<number>>(new Set());
  const [tipoRiscaldamento, setTipoRiscaldamento] = useState(0);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const isCompleted = roundCorrenti >= maxRound;

  const temaConfig = TEMA_CONFIG[tema];
  const temaLabel = temaConfig?.label || tema;
  const temaIcon = temaConfig?.icon || "🏋️";

  const toggleEsercizio = (idx: number) => {
    setCompletati(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const handleSegnaRound = () => {
    onSegnaRound();
    setCompletati(new Set());
    if (roundCorrenti + 1 < maxRound) {
      timer.start(config.pausa, `PAUSA ROUND ${roundCorrenti + 1}`);
    }
  };

  const cambiaRiscaldamento = () => {
    setTipoRiscaldamento(prev => (prev + 1) % 3);
  };

  const nextExercise = () => {
    if (currentExerciseIdx < esercizi.length - 1) {
      toggleEsercizio(currentExerciseIdx);
      setCurrentExerciseIdx(prev => prev + 1);
    }
  };

  const risc = RISCALDAMENTO_MODES[tipoRiscaldamento];

  return (
    <div className="space-y-4">
      <TimerOverlay timer={timer} />

      {/* Quit confirmation */}
      {showQuitConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowQuitConfirm(false)}>
          <div className="bg-card rounded-2xl border border-border shadow-2xl p-6 max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground">Terminare l'allenamento?</h3>
            <p className="text-sm text-muted-foreground">Il progresso di questo round non verrà salvato.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowQuitConfirm(false)} className="flex-1 py-3 rounded-xl bg-muted text-foreground font-bold">Continua</button>
              <button onClick={onBack} className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground font-bold">Termina</button>
            </div>
          </div>
        </div>
      )}

      {/* Top controls */}
      <div className="flex items-center justify-between">
        <button onClick={() => setShowQuitConfirm(true)} className="flex items-center gap-1 text-primary font-bold text-sm hover:opacity-80 transition">
          <ChevronLeft size={18} /> Indietro
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setIsPaused(p => !p)}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition"
          >
            {isPaused ? <Play size={16} className="text-primary" /> : <Pause size={16} className="text-muted-foreground" />}
          </button>
          <button
            onClick={() => setShowQuitConfirm(true)}
            className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition"
          >
            <X size={16} className="text-destructive" />
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold text-foreground">
        {temaIcon} {giorno} <span className="text-primary">({temaLabel})</span>
      </h2>

      <div className="text-sm text-muted-foreground">
        ⏱️ {config.tempoEsercizio}s esercizio • {config.pausa}s pausa • {maxRound} round
      </div>

      {/* Riscaldamento */}
      <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border-l-[5px] border-amber-400 dark:border-amber-600 space-y-2">
        <strong className="text-amber-700 dark:text-amber-300 text-sm">
          {risc.emoji} RISCALDAMENTO: {risc.tipo}
        </strong>
        <p className="text-xs text-muted-foreground">{risc.desc}</p>
        <button
          onClick={() => timer.start(risc.durata, risc.tipo)}
          className="w-full py-2 bg-amber-400 dark:bg-amber-600 text-amber-900 dark:text-white rounded-lg font-bold text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
        >
          <Timer size={14} /> ⏱️ AVVIA {risc.label}
        </button>
        <button
          onClick={cambiaRiscaldamento}
          className="w-full py-2 bg-transparent border border-dashed border-amber-400 dark:border-amber-600 rounded-lg text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition flex items-center justify-center gap-1"
        >
          <RefreshCw size={12} /> CAMBIA MODALITÀ
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${isCompleted ? "bg-pilates-green" : "bg-primary"}`}
          style={{ width: `${(completati.size / esercizi.length) * 100}%` }}
        />
      </div>

      {/* Exercises list */}
      <div className="space-y-3">
        {esercizi.map((es, idx) => {
          const done = completati.has(idx);
          const attrIcon = ATTREZZO_ICONS[es.attrezzo] || "🏋️";

          return (
            <div
              key={idx}
              onClick={() => toggleEsercizio(idx)}
              className={`rounded-xl border p-4 transition-all cursor-pointer ${
                done
                  ? "opacity-40 bg-muted border-border"
                  : "bg-card border-border hover:border-primary/30 hover:shadow-md"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {done && <Check size={16} className="text-pilates-green" />}
                    <strong className="text-base text-foreground">{idx + 1}. {es.nome}</strong>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm">{attrIcon}</span>
                    <span className="text-xs text-muted-foreground">{es.attrezzo}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-lg text-xs font-bold">
                    {config.tempoEsercizio}s
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); timer.start(config.tempoEsercizio, es.nome); }}
                    className="flex items-center gap-1 bg-pilates-green text-white px-2 py-1 rounded-lg text-xs font-bold hover:opacity-80"
                  >
                    <Timer size={12} /> AVVIA
                  </button>
                </div>
              </div>

              {/* GIF preview */}
              {es.gif && (
                <img
                  src={es.gif}
                  alt={es.nome}
                  className="w-full h-36 object-cover rounded-lg mt-2 bg-muted"
                  onError={(ev) => { (ev.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              )}

              <div className="mt-2 bg-accent/50 p-3 rounded-lg border-l-4 border-primary">
                <span className="text-xs font-bold text-primary uppercase">🎬 Azione:</span>
                <p className="text-sm text-foreground mt-1">{es.descrizione}</p>
              </div>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Dumbbell size={12} className="text-muted-foreground" />
                {es.muscoli.map(m => (
                  <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {m}
                  </span>
                ))}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/20 text-secondary-foreground font-medium ml-auto">
                  {es.categoria.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating next exercise button */}
      {!isCompleted && !isPaused && currentExerciseIdx < esercizi.length - 1 && (
        <div className="sticky bottom-20 z-30">
          <button
            onClick={nextExercise}
            className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-bold shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            <SkipForward size={16} /> Prossimo Esercizio ({currentExerciseIdx + 1}/{esercizi.length})
          </button>
        </div>
      )}

      {/* Paused overlay */}
      {isPaused && (
        <div className="bg-card rounded-2xl border-2 border-primary p-8 text-center space-y-4">
          <Pause size={40} className="text-primary mx-auto" />
          <h3 className="text-xl font-bold text-foreground">Allenamento in Pausa</h3>
          <button
            onClick={() => setIsPaused(false)}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg flex items-center justify-center gap-2"
          >
            <Play size={18} /> Riprendi
          </button>
        </div>
      )}

      {/* Stretching note */}
      <div className="bg-pilates-amber/10 border border-pilates-amber/30 p-3 rounded-xl text-center text-sm font-bold text-pilates-amber">
        ✨ Al termine dei round inizierà lo stretching finale
      </div>

      {/* Round control */}
      <div className="border-t border-border pt-4 text-center space-y-3">
        <p className="text-lg font-bold text-foreground">
          Round Completati: <span className={isCompleted ? "text-pilates-green" : "text-primary"}>{roundCorrenti}</span>/{maxRound}
        </p>
        {!isCompleted && (
          <button onClick={handleSegnaRound} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg">
            SEGNA ROUND E PAUSA
          </button>
        )}
        {isCompleted && (
          <div className="space-y-4 bg-accent/30 p-6 rounded-2xl border-2 border-primary">
            <h3 className="text-xl font-bold text-primary">🌊 Defaticamento Rigenerante</h3>
            <p className="text-sm text-muted-foreground">Espira profondamente e rilassa i muscoli.</p>

            {[
              { nome: "Posizione del Bambino", emoji: "🧒", desc: "Fronte a terra, allunga le braccia avanti." },
              { nome: "Farfalla", emoji: "🦋", desc: "Pianta dei piedi uniti, ginocchia in fuori." },
              { nome: "Cobra", emoji: "🐍", desc: "Distendi le braccia e allunga l'addome." },
            ].map(s => (
              <div key={s.nome} className="flex justify-between items-center bg-card p-3 rounded-xl border border-border">
                <div>
                  <strong className="text-primary">{s.emoji} {s.nome}</strong>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
                <button
                  onClick={() => timer.start(60, s.nome)}
                  className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Timer size={12} /> 60s
                </button>
              </div>
            ))}

            <button onClick={onBack} className="w-full py-4 rounded-2xl bg-pilates-green text-white font-bold shadow-lg">
              🏆 COMPLETA SESSIONE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
