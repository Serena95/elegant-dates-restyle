import { useState } from "react";
import { ChevronLeft, Trash2 } from "lucide-react";
import { Misura } from "@/hooks/useCloudData";

interface ProgressViewProps {
  misure: Misura[];
  onAddMisura: (m: Omit<Misura, "id">) => Promise<void>;
  onDeleteMisura: (id: string) => Promise<void>;
  onBack: () => void;
}

export function ProgressView({ misure, onAddMisura, onDeleteMisura, onBack }: ProgressViewProps) {
  const [peso, setPeso] = useState("");
  const [vita, setVita] = useState("");
  const [fianchi, setFianchi] = useState("");
  const [coscia, setCoscia] = useState("");
  const [saving, setSaving] = useState(false);

  const salva = async () => {
    if (!peso || parseFloat(peso) <= 0) return alert("Inserisci almeno il peso.");
    setSaving(true);
    await onAddMisura({
      data: new Date().toLocaleDateString("it-IT"),
      peso, vita: vita || "-", fianchi: fianchi || "-", coscia: coscia || "-"
    });
    setPeso(""); setVita(""); setFianchi(""); setCoscia("");
    setSaving(false);
    alert("Progressi salvati! 🎉");
  };

  const elimina = async (id: string) => {
    if (confirm("Vuoi eliminare questa misurazione?")) {
      await onDeleteMisura(id);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-primary"><ChevronLeft /></button>
        <h2 className="text-xl font-bold text-primary">📈 I Miei Progressi</h2>
        <div className="w-6" />
      </div>

      <div className="bg-card rounded-2xl p-5 border border-border">
        <h3 className="text-sm font-bold uppercase text-primary mb-3">Nuove Misure</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={peso} onChange={e => setPeso(e.target.value)} type="number" placeholder="Peso (kg)" step="0.1" className="w-full p-3 rounded-xl border border-border bg-card text-foreground" />
          <input value={vita} onChange={e => setVita(e.target.value)} type="number" placeholder="Vita (cm)" className="w-full p-3 rounded-xl border border-border bg-card text-foreground" />
          <input value={fianchi} onChange={e => setFianchi(e.target.value)} type="number" placeholder="Fianchi (cm)" className="w-full p-3 rounded-xl border border-border bg-card text-foreground" />
          <input value={coscia} onChange={e => setCoscia(e.target.value)} type="number" placeholder="Coscia (cm)" className="w-full p-3 rounded-xl border border-border bg-card text-foreground" />
        </div>
        <button onClick={salva} disabled={saving} className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold disabled:opacity-50">
          {saving ? "SALVATAGGIO..." : "SALVA PROGRESSI"}
        </button>
      </div>

      <h3 className="text-sm font-bold uppercase text-primary">Storico Misurazioni</h3>

      {misure.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">Nessuna misura salvata ancora.</p>
      ) : (
        <div className="space-y-2">
          {misure.map((m) => (
            <div key={m.id} className="bg-card rounded-xl p-4 border border-border flex justify-between items-center border-l-4 border-l-primary">
              <div>
                <strong className="text-primary text-sm">{m.data}</strong>
                <p className="text-xs text-muted-foreground mt-1">
                  Peso: {m.peso}kg | V: {m.vita}cm | F: {m.fianchi}cm | C: {m.coscia}cm
                </p>
              </div>
              {m.id && (
                <button onClick={() => elimina(m.id!)} className="bg-destructive/10 text-destructive p-2 rounded-lg hover:bg-destructive/20">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <button onClick={onBack} className="w-full py-3 rounded-2xl border-2 border-primary text-primary font-bold bg-card">
        ⬅ TORNA ALLA DASHBOARD
      </button>
    </div>
  );
}
