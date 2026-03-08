import { CalendarDays } from "lucide-react";

const DAYS = [
  { value: 1, label: "Lun", full: "Lunedì" },
  { value: 2, label: "Mar", full: "Martedì" },
  { value: 3, label: "Mer", full: "Mercoledì" },
  { value: 4, label: "Gio", full: "Giovedì" },
  { value: 5, label: "Ven", full: "Venerdì" },
  { value: 6, label: "Sab", full: "Sabato" },
  { value: 0, label: "Dom", full: "Domenica" },
];

interface TrainingDaysPickerProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
  min?: number;
  max?: number;
}

export function TrainingDaysPicker({ selectedDays, onChange, min = 2, max = 5 }: TrainingDaysPickerProps) {
  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length <= min) return;
      onChange(selectedDays.filter(d => d !== day));
    } else {
      if (selectedDays.length >= max) return;
      onChange([...selectedDays, day].sort((a, b) => {
        // Sort Mon-Sun (1,2,3,4,5,6,0)
        const orderA = a === 0 ? 7 : a;
        const orderB = b === 0 ? 7 : b;
        return orderA - orderB;
      }));
    }
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <CalendarDays size={18} className="text-muted-foreground" />
        <span className="flex-1 text-sm font-medium text-foreground">Giorni di Allenamento</span>
        <span className="text-xs text-muted-foreground">{selectedDays.length} giorni</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {DAYS.map(day => {
          const isSelected = selectedDays.includes(day.value);
          return (
            <button
              key={day.value}
              onClick={() => toggleDay(day.value)}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {day.label}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground text-center">
        Seleziona da {min} a {max} giorni
      </p>
    </div>
  );
}
