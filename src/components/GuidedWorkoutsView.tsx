import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, ShieldCheck, ExternalLink, Filter, Info } from "lucide-react";
import {
  GUIDED_WORKOUTS,
  CURATED_CHANNELS,
  FOCUS_LABELS,
  LEVEL_LABELS,
  GuidedFocus,
  GuidedLevel,
  getChannel,
} from "@/data/guidedWorkouts";

interface Props {
  onBack: () => void;
}

const FOCUS_FILTERS: (GuidedFocus | "all")[] = [
  "all",
  "upper",
  "lower",
  "total",
  "core",
  "stretching",
  "combat",
];
const LEVEL_FILTERS: (GuidedLevel | "all")[] = ["all", "base", "medium", "advanced"];

export function GuidedWorkoutsView({ onBack }: Props) {
  const [focus, setFocus] = useState<GuidedFocus | "all">("all");
  const [level, setLevel] = useState<GuidedLevel | "all">("all");
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [showUnapproved, setShowUnapproved] = useState(false);

  const items = useMemo(() => {
    return GUIDED_WORKOUTS.filter((w) => (showUnapproved ? true : w.approved))
      .filter((w) => focus === "all" || w.focus === focus)
      .filter((w) => level === "all" || w.level === level);
  }, [focus, level, showUnapproved]);

  const approvedCount = GUIDED_WORKOUTS.filter((w) => w.approved).length;
  const pendingCount = GUIDED_WORKOUTS.length - approvedCount;

  return (
    <div className="space-y-5 pb-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} /> Indietro
      </button>

      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Play size={20} className="text-primary" /> Workout Guidati YouTube
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Video selezionati a mano da canali affidabili (trainer certificati, atleti pro).
          Ogni video è taggato per focus, livello e attrezzatura.
        </p>
      </div>

      {/* Info / approval status */}
      <div className="p-3 rounded-2xl bg-muted/50 border border-border text-xs text-muted-foreground flex items-start gap-2">
        <Info size={14} className="mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <p>
            <strong className="text-foreground">{approvedCount} approvati</strong> ·{" "}
            {pendingCount} in attesa di revisione.
          </p>
          <p>
            Ogni video va revisionato manualmente prima di essere mostrato. Per approvare un video,
            apri <code className="text-foreground">src/data/guidedWorkouts.ts</code> e imposta{" "}
            <code className="text-foreground">approved: true</code>.
          </p>
          <button
            onClick={() => setShowUnapproved((v) => !v)}
            className="text-primary font-semibold mt-1"
          >
            {showUnapproved ? "Nascondi non approvati" : "Mostra anche non approvati (anteprima)"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <Filter size={12} /> Focus
          </p>
          <div className="flex flex-wrap gap-2">
            {FOCUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFocus(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  focus === f
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {f === "all" ? "Tutti" : FOCUS_LABELS[f]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Livello</p>
          <div className="flex flex-wrap gap-2">
            {LEVEL_FILTERS.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  level === l
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {l === "all" ? "Tutti" : LEVEL_LABELS[l]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="p-6 rounded-2xl bg-card border border-border text-center">
          <p className="text-sm text-muted-foreground">
            Nessun video corrisponde ai filtri. Prova a modificare focus o livello.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((w, i) => {
            const ch = getChannel(w.channelId);
            const isPlaying = activeVideo === w.id;
            return (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                {/* Thumbnail / player */}
                <div className="relative aspect-video bg-black">
                  {isPlaying ? (
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${w.videoId}?autoplay=1&rel=0`}
                      title={w.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      onClick={() => setActiveVideo(w.id)}
                      className="w-full h-full relative group"
                    >
                      <img
                        src={`https://img.youtube.com/vi/${w.videoId}/hqdefault.jpg`}
                        alt={w.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                          <Play size={26} className="text-primary-foreground ml-1" fill="currentColor" />
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-foreground leading-tight">{w.title}</h3>
                    {w.approved ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                        <ShieldCheck size={10} /> Approvato
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                        Da verificare
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {FOCUS_LABELS[w.focus]}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-foreground">
                      {LEVEL_LABELS[w.level]}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-foreground">
                      {w.durationMin} min
                    </span>
                    {w.equipment.map((e) => (
                      <span
                        key={e}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-foreground"
                      >
                        {e}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground">{w.notes}</p>

                  {ch && (
                    <a
                      href={ch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
                    >
                      <ExternalLink size={12} /> {ch.name}
                      <span className="text-muted-foreground font-normal">· {ch.credentials}</span>
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Channels reference */}
      <div className="pt-2">
        <h3 className="text-sm font-bold text-foreground mb-2">Canali selezionati</h3>
        <div className="space-y-2">
          {CURATED_CHANNELS.map((c) => (
            <a
              key={c.id}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-xl bg-card border border-border hover:bg-muted/40 transition"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-foreground">{c.name}</p>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  {c.language}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{c.credentials}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
