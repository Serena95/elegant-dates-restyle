import { useState, useRef, useCallback, useEffect } from "react";

const TIMER_PERSIST_KEY = "active_timer_state";

interface PersistedTimer {
  endTime: number;
  label: string;
}

function loadPersistedTimer(): PersistedTimer | null {
  try {
    const raw = localStorage.getItem(TIMER_PERSIST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedTimer;
    if (!parsed.endTime || parsed.endTime <= Date.now()) {
      localStorage.removeItem(TIMER_PERSIST_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function savePersistedTimer(endTime: number, label: string) {
  try {
    localStorage.setItem(TIMER_PERSIST_KEY, JSON.stringify({ endTime, label }));
  } catch {}
}

function clearPersistedTimer() {
  try {
    localStorage.removeItem(TIMER_PERSIST_KEY);
  } catch {}
}

export function useTimer() {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [label, setLabel] = useState("");
  const workerRef = useRef<Worker | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const onDoneRef = useRef<(() => void) | null>(null);

  // Shared AudioContext - created once on first user interaction
  const ensureAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const playFinishSound = useCallback(() => {
    try {
      const ctx = ensureAudioCtx();
      // Double beep for timer end
      [0, 0.2].forEach(delay => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 880;
        gain.gain.value = 0.35;
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.25);
      });
    } catch {}
  }, [ensureAudioCtx]);

  // Initialize Web Worker for background timer
  useEffect(() => {
    try {
      const worker = new Worker("/timer-worker.js");
      worker.onmessage = (e) => {
        const { type, remaining, label: lbl } = e.data;
        if (type === "tick") {
          setTimeLeft(remaining);
          setLabel(lbl);
        }
        if (type === "done") {
          clearPersistedTimer();
          setIsActive(false);
          setTimeLeft(0);
          playFinishSound();
          if ("vibrate" in navigator) {
            try { navigator.vibrate([200, 100, 200]); } catch {}
          }
          // Show notification if app is in background
          if (document.hidden && "Notification" in window && Notification.permission === "granted") {
            try {
              new Notification("⏱️ Timer completato!", { body: `${lbl} terminato`, icon: "/pwa-192x192.png" });
            } catch {}
          }
          onDoneRef.current?.();
        }
        if (type === "stopped") {
          clearPersistedTimer();
          setIsActive(false);
          setTimeLeft(0);
        }
      };
      workerRef.current = worker;

      // RESTORE persisted timer after refresh: resume worker with remaining time
      const persisted = loadPersistedTimer();
      if (persisted) {
        const remaining = Math.max(0, Math.round((persisted.endTime - Date.now()) / 1000));
        if (remaining > 0) {
          setTimeLeft(remaining);
          setLabel(persisted.label);
          setIsActive(true);
          worker.postMessage({ type: "start", seconds: remaining, timerLabel: persisted.label });
        } else {
          clearPersistedTimer();
        }
      }
    } catch {
      // Fallback: no worker support
    }
    return () => {
      workerRef.current?.terminate();
    };
  }, [playFinishSound]);

  const start = useCallback((seconds: number, timerLabel: string, onDone?: () => void) => {
    // Pre-warm AudioContext on user interaction
    ensureAudioCtx();

    setTimeLeft(seconds);
    setLabel(timerLabel);
    setIsActive(true);
    onDoneRef.current = onDone || null;
    savePersistedTimer(Date.now() + seconds * 1000, timerLabel);

    if (workerRef.current) {
      workerRef.current.postMessage({ type: "start", seconds, timerLabel });
    } else {
      // Fallback for no worker
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            clearPersistedTimer();
            setIsActive(false);
            playFinishSound();
            if ("vibrate" in navigator) {
              try { navigator.vibrate([200, 100, 200]); } catch {}
            }
            onDoneRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [ensureAudioCtx, playFinishSound]);

  const stop = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: "stop" });
    }
    clearPersistedTimer();
    setIsActive(false);
    setTimeLeft(0);
    onDoneRef.current = null;
  }, []);

  const formatTime = (t: number) => {
    const min = Math.floor(t / 60);
    const sec = t % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return { isActive, timeLeft, label, start, stop, formatTime: () => formatTime(timeLeft) };
}

