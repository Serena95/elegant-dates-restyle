import { useCallback, useRef, useState, useEffect } from "react";

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const queueRef = useRef<string[]>([]);
  const processingRef = useRef(false);

  // Get or create a shared AudioContext (for beep sounds)
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  // Chrome/WebKit bug: speechSynthesis pauses after ~15s. Keep-alive pings it.
  useEffect(() => {
    if (!enabled || !window.speechSynthesis) return;

    keepAliveRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);

    return () => {
      if (keepAliveRef.current) clearInterval(keepAliveRef.current);
    };
  }, [enabled]);

  // Pre-load voices on mount
  useEffect(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.getVoices();
    const handleVoicesChanged = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
  }, []);

  const getVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.lang.startsWith("it")) || voices.find(v => v.lang.startsWith("en")) || voices[0] || null;
  }, []);

  // Process speech queue sequentially to avoid overlapping
  const processQueue = useCallback(() => {
    if (processingRef.current || queueRef.current.length === 0) return;
    if (!window.speechSynthesis) return;

    processingRef.current = true;
    const text = queueRef.current.shift()!;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voice = getVoice();
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      processingRef.current = false;
      // Process next in queue
      processQueue();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      processingRef.current = false;
      processQueue();
    };

    window.speechSynthesis.speak(utterance);
  }, [lang, getVoice]);

  const speak = useCallback((text: string, priority = false) => {
    if (!enabled || !window.speechSynthesis) return;

    if (priority) {
      // Clear queue and cancel current speech for priority messages
      window.speechSynthesis.cancel();
      queueRef.current = [];
      processingRef.current = false;
    }

    queueRef.current.push(text);
    processQueue();
  }, [enabled, processQueue]);

  // Play a short beep for countdown ticks (more reliable than speech for single numbers)
  const playCountdownBeep = useCallback((n: number) => {
    if (!enabled) return;
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      // Higher pitch for final second
      osc.frequency.value = n === 1 ? 1000 : 700;
      gain.gain.value = 0.25;
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }, [enabled, getAudioCtx]);

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
    speak(VOICE_CUES.endExercise, true);
  }, [speak]);

  const announceCountdown = useCallback((n: number) => {
    // Use beep for 3,2,1 and speech for 5,4
    if (n <= 3) {
      playCountdownBeep(n);
    } else {
      speak(VOICE_CUES.countdown(n), true);
    }
  }, [speak, playCountdownBeep]);

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

  const getTimerCueHandler = useCallback((exerciseName: string, totalSeconds: number) => {
    const midPoint = Math.floor(totalSeconds / 2);
    const firedRef = { mid: false, almost: false, countdown: new Set<number>(), started: false, ended: false };

    return (remainingSeconds: number) => {
      if (!enabled) return;

      // Start announcement
      if (remainingSeconds === totalSeconds && !firedRef.started) {
        firedRef.started = true;
        announceExercise(exerciseName);
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
      if (remainingSeconds === 0 && !firedRef.ended) {
        firedRef.ended = true;
        announceEndExercise();
      }
    };
  }, [enabled, announceExercise, announceMidExercise, announceAlmostDone, announceCountdown, announceEndExercise]);

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    queueRef.current = [];
    processingRef.current = false;
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
