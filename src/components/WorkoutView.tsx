import { useState, useEffect, useRef, useCallback } from "react";
import { Exercise, CONFIG_LIVELLI, ATTREZZO_ICONS, TEMA_CONFIG, detectFocus } from "@/data/exercises";
import { useTimer } from "@/hooks/useTimer";
import { useVoiceTrainer } from "@/hooks/useVoiceTrainer";
import { TimerOverlay } from "./TimerOverlay";
import { ExerciseImage } from "./ExerciseImage";
import { ChevronLeft, Timer, Check, RefreshCw, Dumbbell, Pause, Play, X, Volume2, VolumeX, Sparkles, ArrowRight } from "lucide-react";
import type { DayFocus } from "@/data/exercises";

// ============================================================
// DYNAMIC STRETCHING DATA
// ============================================================

interface StretchExercise {
  nome: string;
  emoji: string;
  desc: string;
  durata: number;
}

const STRETCHING_UPPER: StretchExercise[] = [
  { nome: "Stretch Schiena (Cat-Cow)", emoji: "🐱", desc: "In quadrupedia, alterna inarcamento e arrotondamento della schiena.", durata: 60 },
  { nome: "Stretch Spalle", emoji: "🙆", desc: "Porta un braccio al petto e tira col braccio opposto. Alterna.", durata: 45 },
  { nome: "Stretch Tricipiti", emoji: "💪", desc: "Braccio dietro la testa, spingi il gomito con l'altra mano.", durata: 45 },
  { nome: "Stretch Petto Apertura", emoji: "🦅", desc: "Braccia dietro la schiena intrecciate, apri il petto e guarda su.", durata: 45 },
  { nome: "Torsione Spinale", emoji: "🔄", desc: "Seduta, ruota il busto portando la mano al ginocchio opposto.", durata: 60 },
  { nome: "Rilascio Core", emoji: "🧘", desc: "Posizione del bambino: braccia avanti, fronte a terra, respira.", durata: 60 },
];

const STRETCHING_LOWER: StretchExercise[] = [
  { nome: "Stretch Glutei (Piriforme)", emoji: "🍑", desc: "Supina, caviglia sulla coscia opposta, tira il ginocchio al petto.", durata: 60 },
  { nome: "Stretch Quadricipiti", emoji: "🦵", desc: "In piedi, porta il tallone al gluteo e tieni. Alterna.", durata: 45 },
  { nome: "Stretch Femorali", emoji: "🦿", desc: "Seduta, gambe tese, piegati avanti cercando le punte.", durata: 60 },
  { nome: "Stretch Interno Coscia (Farfalla)", emoji: "🦋", desc: "Seduta, piante dei piedi unite, spingi le ginocchia verso il basso.", durata: 60 },
  { nome: "Affondo Basso", emoji: "🧎", desc: "Un ginocchio a terra, spingi il bacino avanti per allungare il flessore.", durata: 45 },
  { nome: "Rilascio Core", emoji: "🧘", desc: "Posizione del bambino: braccia avanti, fronte a terra, respira.", durata: 60 },
];

const STRETCHING_TOTAL: StretchExercise[] = [
  { nome: "Stretch Schiena (Cat-Cow)", emoji: "🐱", desc: "In quadrupedia, alterna inarcamento e arrotondamento della schiena.", durata: 60 },
  { nome: "Stretch Spalle e Petto", emoji: "🙆", desc: "Braccia intrecciate dietro, apri il petto. Poi braccio al petto, alterna.", durata: 45 },
  { nome: "Stretch Glutei", emoji: "🍑", desc: "Supina, caviglia sulla coscia opposta, tira al petto.", durata: 60 },
  { nome: "Stretch Quadricipiti", emoji: "🦵", desc: "In piedi, tallone al gluteo, mantieni l'equilibrio.", durata: 45 },
  { nome: "Stretch Femorali", emoji: "🦿", desc: "Seduta, gambe tese, piegati avanti cercando le punte.", durata: 60 },
  { nome: "Farfalla + Core", emoji: "🦋", desc: "Piante dei piedi unite, spingi ginocchia giù, poi piegati avanti.", durata: 60 },
  { nome: "Torsione Spinale", emoji: "🔄", desc: "Seduta, ruota il busto. Allunga obliqui e colonna.", durata: 45 },
  { nome: "Rilascio Finale", emoji: "🧘", desc: "Posizione del bambino: braccia avanti, fronte a terra, 5 respiri profondi.", durata: 60 },
];

function getStretchingForFocus(focus: DayFocus | string): StretchExercise[] {
  if (focus === "upper_body") return STRETCHING_UPPER;
  if (focus === "lower_body") return STRETCHING_LOWER;
  return STRETCHING_TOTAL;
}

// ============================================================
// WORKOUT VIEW
// ============================================================

interface WorkoutViewProps {
  giorno: string;
  tema: string;
  esercizi: Exercise[];
  livello: string;
  roundCorrenti: number;
  onSegnaRound: () => void;
  onBack: () => void;
  voiceEnabled?: boolean;
  aiGenerated?: boolean;
  initialExerciseIdx?: number;
  initialCompletati?: number[];
  onStateChange?: (state: { currentExerciseIdx: number; completati: number[] }) => void;
  dayFocus?: DayFocus;
}

const RISCALDAMENTO_MODES = [
  { tipo: "TAPIS ROULANT", emoji: "🏃‍♂️", desc: "20 min • Pendenza 3% • Vel. 5.5 - 6.0 km/h", durata: 1200, label: "20 MIN" },
  { tipo: "CARDIO SOFT", emoji: "🏠", desc: "Esegui: 30\" Jumping Jacks, 30\" Corsa sul posto, 30\" Kick back (Ripeti 4 volte)", durata: 360, label: "6 MIN" },
  { tipo: "CAMMINATA ESTERNA", emoji: "🌳", desc: "25 min • Passo svelto • Braccia attive e rullata del piede completa.", durata: 1500, label: "25 MIN" },
];

export function WorkoutView({ giorno, tema, esercizi, livello, roundCorrenti, onSegnaRound, onBack, voiceEnabled = true, aiGenerated = false, initialExerciseIdx = 0, initialCompletati = [], onStateChange, dayFocus }: WorkoutViewProps) {
  const config = CONFIG_LIVELLI[livello];
  const maxRound = config.round;
  const timer = useTimer();
  const voice = useVoiceTrainer({ enabled: voiceEnabled });
  const [completati, setCompletati] = useState<Set<number>>(new Set(initialCompletati));
  const [tipoRiscaldamento, setTipoRiscaldamento] = useState(0);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(initialExerciseIdx);
  const [isPaused, setIsPaused] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [voiceActive, setVoiceActive] = useState(voiceEnabled);
  const [showStretching, setShowStretching] = useState(false);
  const [stretchingComplete, setStretchingComplete] = useState(false);
  const [completedStretches, setCompletedStretches] = useState<Set<number>>(new Set());
  const lastTimerRef = useRef<string | null>(null);
  const exerciseRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isCompleted = roundCorrenti >= maxRound;

  // Report state changes for persistence
  useEffect(() => {
    onStateChange?.({ currentExerciseIdx, completati: Array.from(completati) });
  }, [currentExerciseIdx, completati, onStateChange]);

  // Voice cues synced with timer
  useEffect(() => {
    if (!voiceActive || !timer.isActive) return;
    const remaining = timer.timeLeft;
    const label = timer.label;
    
    if (label !== lastTimerRef.current) {
      lastTimerRef.current = label;
    }

    if (remaining === Math.floor(config.tempoEsercizio / 2) && config.tempoEsercizio >= 20) {
      voice.announceMidExercise();
    }
    if (remaining === 10 && config.tempoEsercizio >= 20) {
      voice.announceAlmostDone();
    }
    if (remaining <= 5 && remaining > 0) {
      voice.announceCountdown(remaining);
    }
    if (remaining === 0 && lastTimerRef.current) {
      voice.announceEndExercise();
      lastTimerRef.current = null;
    }
  }, [timer.timeLeft, timer.isActive, timer.label, voiceActive, voice, config.tempoEsercizio]);

  // Cleanup voice on unmount
  useEffect(() => {
    return () => voice.stop();
  }, [voice]);

  // Auto-scroll to next exercise
  const scrollToExercise = useCallback((idx: number) => {
    setTimeout(() => {
      exerciseRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  }, []);

  const temaConfig = TEMA_CONFIG[tema];
  const temaLabel = temaConfig?.label || tema;
  const temaIcon = temaConfig?.icon || "🏋️";

  // Determine focus for stretching
  const effectiveFocus = dayFocus || "total_body";
  const stretchingExercises = getStretchingForFocus(effectiveFocus);

  const toggleEsercizio = (idx: number) => {
    setCompletati(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
        // Auto-advance to next exercise
        if (idx < esercizi.length - 1) {
          setCurrentExerciseIdx(idx + 1);
          scrollToExercise(idx + 1);
        }
      }
      return next;
    });
  };

  const handleSegnaRound = () => {
    onSegnaRound();
    // Reset: deselect all and go back to first exercise
    setCompletati(new Set());
    setCurrentExerciseIdx(0);
    
    if (voiceActive) voice.announceRoundComplete(roundCorrenti + 1, maxRound);
    
    if (roundCorrenti + 1 < maxRound) {
      timer.start(config.pausa, `PAUSA ROUND ${roundCorrenti + 1}`);
      // Scroll back to first exercise after pause starts
      setTimeout(() => scrollToExercise(0), 300);
    } else {
      // All rounds completed → show stretching
      if (voiceActive) voice.announceAllComplete();
      setShowStretching(true);
    }
  };

  const toggleStretch = (idx: number) => {
    setCompletedStretches(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const cambiaRiscaldamento = () => {
    setTipoRiscaldamento(prev => (prev + 1) % 3);
  };

  const risc = RISCALDAMENTO_MODES[tipoRiscaldamento];

  // ============================================================
  // STRETCHING SCREEN
  // ============================================================
  if (showStretching && !stretchingComplete) {
    const focusLabel = effectiveFocus === "upper_body" ? "Upper Body" : effectiveFocus === "lower_body" ? "Lower Body" : "Total Body";
    return (
      <div className="space-y-4">
        <TimerOverlay timer={timer} />
        
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">🌊 Stretching {focusLabel}</h2>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Espira profondamente e rilassa i muscoli lavorati durante l'allenamento.
        </p>

        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500 bg-pilates-green"
            style={{ width: `${(completedStretches.size / stretchingExercises.length) * 100}%` }}
          />
        </div>

        <div className="space-y-3">
          {stretchingExercises.map((s, idx) => {
            const done = completedStretches.has(idx);
            return (
              <div
                key={s.nome}
                onClick={() => toggleStretch(idx)}
                className={`rounded-xl border p-4 transition-all cursor-pointer ${
                  done ? "opacity-40 bg-muted border-border" : "bg-card border-border hover:border-primary/30 hover:shadow-md"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {done && <Check size={16} className="text-pilates-green" />}
                      <strong className="text-base text-foreground">{s.emoji} {s.nome}</strong>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); timer.start(s.durata, s.nome); }}
                    className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    <Timer size={12} /> {s.durata}s
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setStretchingComplete(true)}
          className="w-full py-4 rounded-2xl bg-pilates-green text-white font-bold shadow-lg flex items-center justify-center gap-2"
        >
          ✅ Stretching Completato
        </button>
      </div>
    );
  }

  // ============================================================
  // COMPLETION SCREEN (after stretching)
  // ============================================================
  if (stretchingComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="w-20 h-20 rounded-full bg-pilates-green/20 flex items-center justify-center">
          <span className="text-4xl">🏆</span>
        </div>
        <h2 className="text-2xl font-black text-foreground">Allenamento Completato!</h2>
        <p className="text-muted-foreground">Ottimo lavoro! Hai completato tutti i round e lo stretching.</p>
        <button
          onClick={onBack}
          className="w-full max-w-xs py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg flex items-center justify-center gap-2"
        >
          <ArrowRight size={18} /> Torna alla Dashboard
        </button>
      </div>
    );
  }

  // ============================================================
  // MAIN WORKOUT VIEW
  // ============================================================
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
            onClick={() => {
              setVoiceActive(v => {
                if (v) voice.stop();
                return !v;
              });
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition ${voiceActive ? "bg-primary/15" : "bg-muted"}`}
            title={voiceActive ? "Disattiva trainer vocale" : "Attiva trainer vocale"}
          >
            {voiceActive ? <Volume2 size={16} className="text-primary" /> : <VolumeX size={16} className="text-muted-foreground" />}
          </button>
          <button
            onClick={() => {
              setIsPaused(p => {
                if (!p && voiceActive) voice.announcePause();
                if (p && voiceActive) voice.announceResume();
                return !p;
              });
            }}
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

      {(() => {
        const focus = detectFocus(esercizi);
        const focusLabel = effectiveFocus === "upper_body" ? "💪 Upper Body" : effectiveFocus === "lower_body" ? "🦵 Lower Body" : "🔥 Total Body";
        return (
          <>
            <h2 className="text-xl font-bold text-foreground">
              {temaIcon} {giorno} <span className="text-primary">({temaLabel})</span>
            </h2>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
              <span className="whitespace-nowrap">⏱️ {config.tempoEsercizio}s esercizio • {config.pausa}s pausa • {maxRound} round</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/50 text-foreground text-xs font-bold">
                {focusLabel}
              </span>
              {aiGenerated && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold">
                  <Sparkles size={12} /> AI
                </span>
              )}
            </div>
          </>
        );
      })()}

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
              ref={el => { exerciseRefs.current[idx] = el; }}
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
                    onClick={e => { e.stopPropagation(); timer.start(config.tempoEsercizio, es.nome); if (voiceActive) voice.announceExercise(es.nome); }}
                    className="flex items-center gap-1 bg-pilates-green text-white px-2 py-1 rounded-lg text-xs font-bold hover:opacity-80"
                  >
                    <Timer size={12} /> AVVIA
                  </button>
                </div>
              </div>

              {/* Exercise image */}
              <ExerciseImage
                exerciseId={es.id}
                exerciseName={es.nome}
                category={es.categoria}
                muscles={es.muscoli}
                equipment={es.attrezzo}
                className="w-full h-36 mt-2"
                showGenerateButton={true}
              />

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
      </div>
    </div>
  );
}
