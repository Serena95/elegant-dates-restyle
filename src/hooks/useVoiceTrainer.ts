import { useCallback, useRef, useState } from "react";

interface VoiceTrainerOptions {
  enabled: boolean;
  lang?: string;
}

const VOICE_CUES = {
  startExercise: (name: string) => `Inizia: ${name}`,
  midExercise: "A metà esercizio. Mantieni il core attivo.",
  almostDone: "Ancora 10 secondi!",
  endExercise: "Bene! Recupera e preparati al prossimo esercizio.",
  countdown: (n: number) => `${n}`,
  roundComplete: (round: number, max: number) => `Round ${round} completato su ${max}. Pausa.`,
  allComplete: "Allenamento completato! Ottimo lavoro!",
  pause: "Allenamento in pausa.",
  resume: "Si riparte!",
  warmup: "Inizia il riscaldamento.",
};

export function useVoiceTrainer({ enabled, lang = "it-IT" }: VoiceTrainerOptions) {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const timerCallbacksRef = useRef<Map<number, boolean>>(new Map());
  const [isSpeaking, setIsSpeaking] = useState(false);

  const getVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    // Prefer Italian voice
    return voices.find(v => v.lang.startsWith("it")) || voices.find(v => v.lang.startsWith("en")) || voices[0] || null;
  }, []);

  const speak = useCallback((text: string, priority = false) => {
    if (!enabled || !window.speechSynthesis) return;

    if (priority) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voice = getVoice();
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [enabled, lang, getVoice]);

  const announceExercise = useCallback((name: string) => {
    speak(VOICE_CUES.startExercise(name), true);
  }, [speak]);

  const announceMidExercise = useCallback(() => {
    speak(VOICE_CUES.midExercise);
  }, [speak]);

  const announceAlmostDone = useCallback(() => {
    speak(VOICE_CUES.almostDone);
  }, [speak]);

  const announceEndExercise = useCallback(() => {
    speak(VOICE_CUES.endExercise);
  }, [speak]);

  const announceCountdown = useCallback((n: number) => {
    speak(VOICE_CUES.countdown(n), true);
  }, [speak]);

  const announceRoundComplete = useCallback((round: number, max: number) => {
    speak(VOICE_CUES.roundComplete(round, max), true);
  }, [speak]);

  const announceAllComplete = useCallback(() => {
    speak(VOICE_CUES.allComplete, true);
  }, [speak]);

  const announcePause = useCallback(() => {
    speak(VOICE_CUES.pause, true);
  }, [speak]);

  const announceResume = useCallback(() => {
    speak(VOICE_CUES.resume, true);
  }, [speak]);

  const announceWarmup = useCallback(() => {
    speak(VOICE_CUES.warmup, true);
  }, [speak]);

  /**
   * Get timer cue callbacks for a given exercise duration.
   * Returns a function to call on each tick with remaining seconds.
   */
  const getTimerCueHandler = useCallback((exerciseName: string, totalSeconds: number) => {
    const midPoint = Math.floor(totalSeconds / 2);
    const firedRef = { mid: false, almost: false, countdown: new Set<number>() };

    return (remainingSeconds: number) => {
      if (!enabled) return;

      // Start announcement
      if (remainingSeconds === totalSeconds) {
        announceExercise(exerciseName);
        firedRef.mid = false;
        firedRef.almost = false;
        firedRef.countdown.clear();
      }

      // Mid exercise
      if (remainingSeconds === midPoint && !firedRef.mid && totalSeconds >= 20) {
        firedRef.mid = true;
        announceMidExercise();
      }

      // Almost done (10 seconds remaining)
      if (remainingSeconds === 10 && !firedRef.almost && totalSeconds >= 20) {
        firedRef.almost = true;
        announceAlmostDone();
      }

      // Countdown last 5 seconds
      if (remainingSeconds <= 5 && remainingSeconds > 0 && !firedRef.countdown.has(remainingSeconds)) {
        firedRef.countdown.add(remainingSeconds);
        announceCountdown(remainingSeconds);
      }

      // End
      if (remainingSeconds === 0) {
        announceEndExercise();
      }
    };
  }, [enabled, announceExercise, announceMidExercise, announceAlmostDone, announceCountdown, announceEndExercise]);

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    isSpeaking,
    announceExercise,
    announceMidExercise,
    announceAlmostDone,
    announceEndExercise,
    announceCountdown,
    announceRoundComplete,
    announceAllComplete,
    announcePause,
    announceResume,
    announceWarmup,
    getTimerCueHandler,
    stop,
  };
}
