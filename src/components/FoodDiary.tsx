import { useState } from "react";
import { ChevronLeft, Trash2, Droplets } from "lucide-react";
import { suggerimentiNutrizionali, WeekPlan } from "@/data/exercises";
import { Pasto, Sfida } from "@/hooks/useCloudData";

interface FoodDiaryProps {
  piano: WeekPlan;
  pasti: Pasto[];
  onAddPasto: (pasto: Omit<Pasto, "id">) => Promise<void>;
  onDeletePasto: (id: string) => Promise<void>;
  acqua: number;
  onSetAcqua: (n: number) => Promise<void>;
  sfida: Sfida | null;
  onSetSfida: (s: Sfida | null) => Promise<void>;
  onBack: () => void;
}

export function FoodDiary({ piano, pasti, onAddPasto, onDeletePasto, acqua, onSetAcqua, sfida, onSetSfida, onBack }: FoodDiaryProps) {
  const [tipo, setTipo] = useState("Colazione");
  const [desc, setDesc] = useState("");
  const [mood, setMood] = useState("🟢");
  const [sfidaNome, setSfidaNome] = useState("");

  const dataOggi = new Date().toLocaleDateString();
  const pastiOggi = pasti.filter(p => p.data === dataOggi);

  const oggi = new Date().toLocaleDateString("it-IT", { weekday: "long" });
  const giornoFormatted = oggi.charAt(0).toUpperCase() + oggi.slice(1);
  const attrezzoOggi = piano[giornoFormatted]?.attrezzo || "Riposo";
  const suggerimento = suggerimentiNutrizionali[attrezzoOggi] || suggerimentiNutrizionali["Riposo"];

  const salvaPasto = async () => {
    if (!desc) return alert("Scrivi cosa hai mangiato!");
    await onAddPasto({ tipo, desc, mood, data: dataOggi });
    setDesc("");
  };

  const eliminaPasto = async (id: string) => {
    if (confirm("Eliminare questo pasto?")) await onDeletePasto(id);
  };

  const avviaSfida = async () => {
    if (!sfidaNome) return alert("Inserisci un nome per la sfida!");
    await onSetSfida({ nome: sfidaNome, streak: 0, ultimaData: null });
  };

  const segnaVittoria = async () => {
    if (!sfida) return;
    if (sfida.ultimaData === dataOggi) return alert("Per oggi hai già dato!");
    const newStreak = sfida.streak + 1;
    if (newStreak >= 30) {
      alert("🎉 Hai completato 30 giorni di: " + sfida.nome);
      await onSetSfida(null);
    } else {
      await onSetSfida({ ...sfida, streak: newStreak, ultimaData: dataOggi });
    }
  };

  const moodBorder = (m: string) => m === "🟢" ? "border-pilates-green" : m === "🟡" ? "border-pilates-amber" : "border-pilates-red";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-primary"><ChevronLeft /></button>
        <h2 className="text-xl font-bold text-primary flex-1 text-center">🍎 Diario & Sfide</h2>
      </div>

      {/* Consiglio del giorno */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center">
        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase block mb-1">💡 Consiglio del giorno</span>
        <p className="text-sm text-foreground leading-relaxed">{suggerimento}</p>
      </div>

      {/* Water tracking */}
      <div className="bg-sky-50 dark:bg-sky-900/20 p-5 rounded-2xl border border-sky-200 dark:border-sky-800 text-center">
        <h4 className="font-bold text-sky-800 dark:text-sky-200 flex items-center justify-center gap-2">
          <Droplets size={18} /> Acqua (Obiettivo 2L)
        </h4>
        <div className="flex justify-center gap-2 my-3 text-2xl flex-wrap">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} onClick={() => onSetAcqua(i + 1 === acqua ? i : i + 1)} className="cursor-pointer hover:scale-110 transition-transform">
              {i < acqua ? "💧" : "⚪"}
            </span>
          ))}
        </div>
        <div className="w-full h-2.5 bg-card rounded-full overflow-hidden border border-sky-300 dark:border-sky-700">
          <div className="h-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all" style={{ width: `${acqua * 10}%` }} />
        </div>
        <small className="block mt-2 text-sm font-bold text-sky-600 dark:text-sky-300">{acqua}/10 Bicchieri</small>
      </div>

      {/* Challenge */}
      <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-2xl border border-amber-200 dark:border-amber-800 text-center">
        {!sfida ? (
          <div className="space-y-3">
            <h4 className="font-bold text-amber-800 dark:text-amber-200">🎯 Nuova Sfida 30gg</h4>
            <input value={sfidaNome} onChange={e => setSfidaNome(e.target.value)} placeholder="Esempio: No Dolci" className="w-full p-3 rounded-xl border border-amber-300 dark:border-amber-700 bg-card text-foreground text-center" />
            <div className="flex justify-center gap-2">
              {["🚫 No Dolci", "☕ No Zucchero"].map(s => (
                <button key={s} onClick={() => setSfidaNome(s)} className="bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full text-xs font-bold">{s}</button>
              ))}
            </div>
            <button onClick={avviaSfida} className="w-full py-3 rounded-2xl bg-amber-600 text-white font-bold">INIZIA SFIDA</button>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="font-bold text-amber-800 dark:text-amber-200">{sfida.nome}</h4>
            <div className="text-4xl font-black text-amber-600 dark:text-amber-400">{sfida.streak}/30</div>
            <button
              onClick={segnaVittoria}
              disabled={sfida.ultimaData === dataOggi}
              className={`w-full py-3 rounded-2xl font-bold text-white ${sfida.ultimaData === dataOggi ? "bg-muted text-muted-foreground" : "bg-pilates-green"}`}
            >
              {sfida.ultimaData === dataOggi ? "COMPLETATA PER OGGI" : "HO VINTO OGGI! ✅"}
            </button>
            <button onClick={() => { if (confirm("Vuoi ricominciare?")) onSetSfida(null); }} className="text-xs text-amber-600 dark:text-amber-400 underline">
              Cambia sfida
            </button>
          </div>
        )}
      </div>

      {/* Food diary */}
      <div className="bg-card p-5 rounded-2xl border border-border text-center space-y-4">
        <h4 className="font-bold text-primary">📝 Diario Alimentare</h4>
        <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full p-3 rounded-xl border border-border bg-card text-foreground">
          <option>Colazione</option><option>Pranzo</option><option>Spuntino</option><option>Cena</option>
        </select>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Cosa hai mangiato?" className="w-full p-3 rounded-xl border border-border bg-card text-foreground h-20 resize-none" />
        <p className="text-xs font-bold text-muted-foreground uppercase">Com'era questo pasto?</p>
        <div className="space-y-2">
          {[
            { m: "🟢", label: "SANO", desc: "Equilibrato e leggero" },
            { m: "🟡", label: "NEUTRO", desc: "Abbondante o fuori casa" },
            { m: "🔴", label: "SFIZIO", desc: "Dolci, fritti o alcol" },
          ].map(opt => (
            <div
              key={opt.m}
              onClick={() => setMood(opt.m)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                mood === opt.m ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <span className="text-xl">{opt.m}</span>
              <div className="text-left">
                <b className="text-xs text-foreground">{opt.label}</b>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={salvaPasto} className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold">AGGIUNGI AL DIARIO</button>
      </div>

      {/* Today's meals */}
      {pastiOggi.length > 0 && (
        <div className="space-y-2">
          {pastiOggi.map((p) => (
            <div key={p.id} className={`bg-card rounded-xl p-3 border border-border border-l-4 ${moodBorder(p.mood)} flex justify-between items-center`}>
              <div>
                <div className="flex gap-2 text-xs font-bold text-primary"><span>{p.tipo}</span><span>{p.mood}</span></div>
                <div className="text-sm text-foreground mt-1">{p.desc}</div>
              </div>
              {p.id && (
                <button onClick={() => eliminaPasto(p.id!)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 size={14} /></button>
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
