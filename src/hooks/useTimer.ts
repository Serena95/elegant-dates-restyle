import { useState, useRef, useCallback } from "react";

export function useTimer() {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [label, setLabel] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback((seconds: number, timerLabel: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeLeft(seconds);
    setLabel(timerLabel);
    setIsActive(true);

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsActive(false);
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
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
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
