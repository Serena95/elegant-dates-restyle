import { useState } from "react";
import { TUTTI_GLI_ATTREZZI, ATTREZZO_ICONS } from "@/data/exercises";
import { motion } from "framer-motion";

interface EquipmentSelectionProps {
  savedAttrezzi: string[];
  onComplete: (selected: string[]) => void;
}

export function EquipmentSelection({ savedAttrezzi, onComplete }: EquipmentSelectionProps) {
  // Normalize old equipment names
  const normalizedSaved = savedAttrezzi.map(a => a === "Pesi(da 1 a 4kg)" ? "Pesi" : a);
  const [selected, setSelected] = useState<string[]>(normalizedSaved);

  const toggle = (a: string) => {
    setSelected(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const save = () => {
    if (selected.length === 0) return alert("Seleziona almeno un attrezzo!");
    onComplete(selected);
  };

  // Split into home and studio equipment
  const homeEquipment = ["Corpo Libero", "Ring", "Rullo", "Pesi", "Kettlebell", "Elastico Chiuso", "Fascia Aperta", "Palla Piccola", "Palla Grande"];
  const studioEquipment = ["Reformer", "Cadillac", "Wunda Chair", "Ladder Barrel", "Spine Corrector"];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary">Scegli i tuoi attrezzi</h2>
        <p className="text-sm text-muted-foreground mt-2">Seleziona gli attrezzi che hai disponibili</p>
      </div>

      {/* Home equipment */}
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">🏠 Casa / Palestra</h3>
        <div className="grid grid-cols-2 gap-3">
          {homeEquipment.map((attrezzo, i) => (
            <motion.button
              key={attrezzo}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => toggle(attrezzo)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selected.includes(attrezzo)
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <span className="text-2xl block mb-1">{ATTREZZO_ICONS[attrezzo]}</span>
              <span className="text-sm font-semibold text-foreground">{attrezzo}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Studio equipment */}
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">🏢 Studio Pilates</h3>
        <div className="grid grid-cols-2 gap-3">
          {studioEquipment.map((attrezzo, i) => (
            <motion.button
              key={attrezzo}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (i + homeEquipment.length) * 0.03 }}
              onClick={() => toggle(attrezzo)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selected.includes(attrezzo)
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <span className="text-2xl block mb-1">{ATTREZZO_ICONS[attrezzo]}</span>
              <span className="text-sm font-semibold text-foreground">{attrezzo}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <button onClick={save} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-lg hover:opacity-90 transition">
        SALVA E CONTINUA
      </button>
    </div>
  );
}
