import { X, Dumbbell } from "lucide-react";

interface WorkoutReminderProps {
  onDismiss: () => void;
  onStart: () => void;
}

export function WorkoutReminder({ onDismiss, onStart }: WorkoutReminderProps) {
  return (
    <div className="relative bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
        <Dumbbell size={20} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">Allenamento di oggi</p>
        <p className="text-xs text-muted-foreground">Hai un workout programmato! Inizia ora 💪</p>
      </div>
      <button
        onClick={onStart}
        className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex-shrink-0"
      >
        Vai
      </button>
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X size={14} />
      </button>
    </div>
  );
}
