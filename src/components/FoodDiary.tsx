import { useState } from "react";
import { ChevronLeft, Trash2, Droplets, Plus, Calendar, Check } from "lucide-react";
import { suggerimentiNutrizionali, WeekPlan } from "@/data/exercises";
import { Pasto, Sfida } from "@/hooks/useCloudData";

interface FoodDiaryProps {
  piano: WeekPlan;
  pasti: Pasto[];
  onAddPasto: (pasto: Omit<Pasto, "id">) => Promise<void>;
  onDeletePasto: (id: string) => Promise<void>;
  acqua: number;
  onSetAcqua: (n: number) => Promise<void>;
  sfide: Sfida[];
  onAddSfida: (nome: string) => Promise<Sfida | null>;
  onDeleteSfida: (id: string) => Promise<void>;
  onToggleSfidaDate: (id: string, dateKey: string) => Promise<void>;
  onBack: () => void;
}

const TARGET_DAYS = 30;

// Get YYYY-MM-DD using local timezone
function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function FoodDiary({
  piano, pasti, onAddPasto, onDeletePasto,
  acqua, onSetAcqua,
  sfide, onAddSfida, onDeleteSfida, onToggleSfidaDate,
  onBack,
}: FoodDiaryProps) {
  const [tipo, setTipo] = useState("Colazione");
  const [desc, setDesc] = useState("");
  const [mood, setMood] = useState("🟢");
  const [sfidaNome, setSfidaNome] = useState("");
  const [showCalendarFor, setShowCalendarFor] = useState<string | null>(null);

  const todayKey = localDateKey(new Date());
  const dataOggi = new Date().toLocaleDateString();
  const pastiRecenti = pasti.slice(0, 12);

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
    if (!sfidaNome.trim()) return alert("Inserisci un nome per la sfida!");
    await onAddSfida(sfidaNome.trim());
    setSfidaNome("");
  };

  const moodBorder = (m: string) => m === "🟢" ? "border-pilates-green" : m === "🟡" ? "border-pilates-amber" : "border-pilates-red";

  // Build last 30 days for calendar picker
  const buildLast30Days = (): { key: string; label: string; isFuture: boolean }[] => {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push({
        key: localDateKey(d),
        label: d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" }),
        isFuture: false,
      });
    }
    return days;
  };

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

      {/* Active challenges (multiple) */}
      <div className="space-y-3">
        <h4 className="font-bold text-foreground px-1 flex items-center gap-2">🎯 Sfide Alimentari Attive
          {sfide.length > 0 && <span className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full">{sfide.length}</span>}
        </h4>

        {sfide.map(s => {
          const completedToday = s.completedDates.includes(todayKey);
          const isCompleted = s.streak >= TARGET_DAYS;
          const calendarOpen = showCalendarFor === s.id;
          return (
            <div key={s.id} className={`bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border ${isCompleted ? "border-pilates-green" : "border-amber-200 dark:border-amber-800"} space-y-3`}>
              <div className="flex items-center justify-between gap-2">
                <h5 className="font-bold text-amber-800 dark:text-amber-200 text-sm flex-1">{s.nome}</h5>
                <button
                  onClick={() => { if (s.id && confirm("Eliminare questa sfida?")) onDeleteSfida(s.id); }}
                  className="text-muted-foreground hover:text-destructive p-1"
                  aria-label="Elimina sfida"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="text-center">
                <div className="text-3xl font-black text-amber-600 dark:text-amber-400">{s.streak}/{TARGET_DAYS}</div>
                <div className="w-full h-2 mt-2 bg-amber-100 dark:bg-amber-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all"
                    style={{ width: `${Math.min(100, (s.streak / TARGET_DAYS) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => s.id && onToggleSfidaDate(s.id, todayKey)}
                  disabled={isCompleted}
                  className={`py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 ${
                    completedToday ? "bg-pilates-green text-white" :
                    isCompleted ? "bg-muted text-muted-foreground" :
                    "bg-amber-600 text-white hover:bg-amber-700"
                  }`}
                >
                  {completedToday ? <><Check size={14}/> Oggi fatto</> : "✅ Segna oggi"}
                </button>
                <button
                  onClick={() => setShowCalendarFor(calendarOpen ? null : (s.id ?? null))}
                  className="py-2.5 rounded-xl font-bold text-sm bg-card border-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 flex items-center justify-center gap-1.5"
                >
                  <Calendar size={14} /> Giorni passati
                </button>
              </div>

              {/* Retroactive day picker */}
              {calendarOpen && (
                <div className="bg-card rounded-xl p-3 border border-border">
                  <p className="text-xs text-muted-foreground mb-2 text-center">
                    Tocca un giorno per segnarlo o annullarlo
                  </p>
                  <div className="grid grid-cols-5 gap-1.5 max-h-64 overflow-y-auto">
                    {buildLast30Days().map(d => {
                      const done = s.completedDates.includes(d.key);
                      const isToday = d.key === todayKey;
                      return (
                        <button
                          key={d.key}
                          onClick={() => s.id && onToggleSfidaDate(s.id, d.key)}
                          className={`p-2 rounded-lg text-[10px] font-medium border transition ${
                            done
                              ? "bg-pilates-green text-white border-pilates-green"
                              : "bg-card border-border text-foreground hover:border-amber-400"
                          } ${isToday ? "ring-2 ring-amber-400" : ""}`}
                        >
                          {d.label}
                          {done && <Check size={10} className="mx-auto mt-0.5"/>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isCompleted && (
                <div className="text-center text-pilates-green font-bold text-sm">
                  🎉 Sfida completata!
                </div>
              )}
            </div>
          );
        })}

        {/* New challenge form */}
        <div className="bg-card p-4 rounded-2xl border border-border space-y-3">
          <h5 className="font-bold text-sm text-foreground text-center">➕ Nuova sfida {TARGET_DAYS}gg</h5>
          <input
            value={sfidaNome}
            onChange={e => setSfidaNome(e.target.value)}
            placeholder="Esempio: No Dolci"
            className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-center"
          />
          <div className="flex justify-center gap-2 flex-wrap">
            {["🚫 No Dolci", "☕ No Zucchero", "🍔 No Junk Food", "🥤 No Bibite", "🥗 5 Verdure/Giorno", "💧 2L Acqua", "🍎 Frutta Ogni Pasto", "🍕 No Raffinati"].map(s => (
              <button key={s} onClick={() => setSfidaNome(s)} className="bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full text-xs font-bold">{s}</button>
            ))}
          </div>
          <button onClick={avviaSfida} className="w-full py-3 rounded-2xl bg-amber-600 text-white font-bold flex items-center justify-center gap-2">
            <Plus size={16}/> AGGIUNGI SFIDA
          </button>
          <p className="text-[11px] text-muted-foreground text-center">Puoi attivare più sfide insieme — sono indipendenti</p>
        </div>
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

      {/* Recent meals */}
      {pastiRecenti.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-foreground px-1">🗂️ Diario recente</h4>
          {pastiRecenti.map((p) => (
            <div key={p.id} className={`bg-card rounded-xl p-3 border border-border border-l-4 ${moodBorder(p.mood)} flex justify-between items-center`}>
              <div>
                <div className="flex gap-2 text-xs font-bold text-primary flex-wrap"><span>{p.tipo}</span><span>{p.mood}</span><span className="text-muted-foreground">{p.data === dataOggi ? "Oggi" : p.data}</span></div>
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
