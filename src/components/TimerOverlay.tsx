import { useTimer } from "@/hooks/useTimer";

interface TimerOverlayProps {
  timer: ReturnType<typeof useTimer>;
}

export function TimerOverlay({ timer }: TimerOverlayProps) {
  if (!timer.isActive) return null;

  const buttonLabel = timer.label.toLowerCase().includes("pausa") ? "SALTA PAUSA" : "TERMINA";

  return (
    <div className="fixed top-0 left-0 w-full z-[1000] bg-gradient-to-r from-pilates-deep to-primary text-primary-foreground flex justify-between items-center px-6 py-4 shadow-xl animate-in slide-in-from-top duration-400">
      <div>
        <div className="text-xs uppercase tracking-widest font-bold opacity-80">{timer.label}</div>
        <div className="text-3xl font-black font-mono">{timer.formatTime()}</div>
      </div>
      <button
        onClick={timer.stop}
        className="bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/50 px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary-foreground/30 transition"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
