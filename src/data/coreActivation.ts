// Core activation cues integrated into every exercise
// Maps exercise categories to specific core engagement instructions

export const CORE_ACTIVATION_CUES: Record<string, string> = {
  "gambe": "🎯 Core attivo: contrai l'addome durante tutto il movimento. Stabilizza il busto.",
  "glutei": "🎯 Core attivo: mantieni l'ombelico verso la colonna. Controlla i fianchi.",
  "schiena": "🎯 Core attivo: addome contratto per proteggere la zona lombare.",
  "braccia": "🎯 Core attivo: stabilizza il busto, non inarcare la schiena. Addome sempre contratto.",
  "core": "🎯 Massima attivazione: contrai profondamente l'addome, coinvolgi anche i fianchi.",
  "stabilità": "🎯 Core protagonista: ogni micro-aggiustamento parte dal centro.",
  "mobilità": "🎯 Core attivo: anche nel rilascio, mantieni una leggera contrazione addominale.",
  "cardio": "🎯 Core attivo: addome contratto per proteggere la schiena nei movimenti rapidi.",
};

export function getCoreActivationCue(categoria: string): string {
  return CORE_ACTIVATION_CUES[categoria] || CORE_ACTIVATION_CUES["core"];
}
