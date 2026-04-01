import { useState, useRef, useCallback, useEffect } from "react";

export function useTimer() {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [label, setLabel] = useState("");
  const workerRef = useRef<Worker | null>(null);

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
          // Play finish sound
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = 880;
            gain.gain.value = 0.3;
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
          } catch {}
          if ("vibrate" in navigator) {
            try { navigator.vibrate([200, 100, 200]); } catch {}
          }
          // Show notification if app is in background
          if (document.hidden && "Notification" in window && Notification.permission === "granted") {
            try {
              new Notification("⏱️ Timer completato!", { body: `${lbl} terminato`, icon: "/pwa-192x192.png" });
            } catch {}
          }
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
  }, []);

  const start = useCallback((seconds: number, timerLabel: string) => {
    setTimeLeft(seconds);
    setLabel(timerLabel);
    setIsActive(true);

    if (workerRef.current) {
      workerRef.current.postMessage({ type: "start", seconds, timerLabel });
    } else {
      // Fallback for no worker
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsActive(false);
            try {
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = "sine";
              osc.frequency.value = 880;
              gain.gain.value = 0.3;
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.3);
            } catch {}
            if ("vibrate" in navigator) {
              try { navigator.vibrate([200, 100, 200]); } catch {}
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, []);

  const stop = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: "stop" });
    }
    setIsActive(false);
    setTimeLeft(0);
  }, []);

  const formatTime = (t: number) => {
    const min = Math.floor(t / 60);
    const sec = t % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return { isActive, timeLeft, label, start, stop, formatTime: () => formatTime(timeLeft) };
}
