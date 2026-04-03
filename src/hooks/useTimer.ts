import { useState, useRef, useCallback, useEffect } from "react";

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
          setIsActive(false);
          setTimeLeft(0);
        }
      };
      workerRef.current = worker;
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

    if (workerRef.current) {
      workerRef.current.postMessage({ type: "start", seconds, timerLabel });
    } else {
      // Fallback for no worker
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
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
