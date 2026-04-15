import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon, Loader2 } from "lucide-react";

interface ExerciseImageProps {
  exerciseId: string;
  exerciseName: string;
  category: string;
  muscles: string[];
  equipment?: string;
  className?: string;
  showGenerateButton?: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; accent: string }> = {
  core: { bg: "from-amber-500/20 via-orange-400/15 to-amber-300/10", accent: "text-amber-600 dark:text-amber-400" },
  gambe: { bg: "from-blue-500/20 via-cyan-400/15 to-blue-300/10", accent: "text-blue-600 dark:text-blue-400" },
  glutei: { bg: "from-pink-500/20 via-rose-400/15 to-pink-300/10", accent: "text-pink-600 dark:text-pink-400" },
  schiena: { bg: "from-green-500/20 via-emerald-400/15 to-green-300/10", accent: "text-green-600 dark:text-green-400" },
  "mobilità": { bg: "from-purple-500/20 via-violet-400/15 to-purple-300/10", accent: "text-purple-600 dark:text-purple-400" },
  "stabilità": { bg: "from-teal-500/20 via-cyan-400/15 to-teal-300/10", accent: "text-teal-600 dark:text-teal-400" },
  cardio: { bg: "from-red-500/20 via-orange-400/15 to-red-300/10", accent: "text-red-600 dark:text-red-400" },
  braccia: { bg: "from-indigo-500/20 via-blue-400/15 to-indigo-300/10", accent: "text-indigo-600 dark:text-indigo-400" },
};

const CATEGORY_ICONS: Record<string, string> = {
  core: "🎯", gambe: "🦵", glutei: "🍑", schiena: "🔙",
  "mobilità": "🧘", "stabilità": "⚖️", cardio: "❤️‍🔥", braccia: "💪",
};

// Muscle to body-part emoji for visual cues
const MUSCLE_EMOJI: Record<string, string> = {
  addominali: "🎯", obliqui: "🔄", retto: "🎯", trasverso: "🌀",
  glutei: "🍑", quadricipiti: "🦵", femorali: "🦿", polpacci: "🦶",
  dorsali: "🔙", romboidi: "🔙", trapezi: "🔙", lombari: "🔙",
  petto: "💪", bicipiti: "💪", tricipiti: "💪", spalle: "🙆",
  "hip flexors": "🦵", interno: "🦵", esterno: "🦵",
};

function getMuscleEmoji(muscle: string): string {
  const lower = muscle.toLowerCase();
  for (const [key, emoji] of Object.entries(MUSCLE_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return "•";
}

export function ExerciseImage({
  exerciseId,
  exerciseName,
  category,
  muscles,
  equipment,
  className = "w-full",
  showGenerateButton = false,
}: ExerciseImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  // Check storage for existing image
  useEffect(() => {
    const checkImage = async () => {
      try {
        const { data } = supabase.storage
          .from("exercise-images")
          .getPublicUrl(`${exerciseId}.png`);

        const resp = await fetch(data.publicUrl, { method: "HEAD" });
        if (resp.ok) {
          setImageUrl(data.publicUrl);
        }
      } catch {
        // Image doesn't exist
      } finally {
        setChecked(true);
      }
    };
    checkImage();
  }, [exerciseId]);

  const generateImage = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-exercise-image", {
        body: { exerciseId, exerciseName, category, muscles, equipment },
      });
      if (error) throw error;
      if (data?.url) {
        setImageUrl(data.url);
      }
    } catch (err) {
      console.error("Failed to generate image:", err);
    } finally {
      setLoading(false);
    }
  };

  // Show image if available — responsive with aspect-ratio
  if (imageUrl) {
    return (
      <div className={`${className} relative overflow-hidden rounded-xl`}>
        <div className="aspect-[16/10] w-full">
          <img
            src={imageUrl}
            alt={exerciseName}
            className="w-full h-full object-contain bg-muted/30 rounded-xl"
            loading="lazy"
            onError={() => setImageUrl(null)}
          />
        </div>
      </div>
    );
  }

  // Enhanced placeholder
  const colors = CATEGORY_COLORS[category] || { bg: "from-muted/30 via-muted/20 to-muted/10", accent: "text-muted-foreground" };
  const icon = CATEGORY_ICONS[category] || "🏋️";

  return (
    <div className={`${className} relative overflow-hidden rounded-xl`}>
      <div className="aspect-[16/10] w-full bg-gradient-to-br ${colors.bg} flex flex-col items-center justify-center relative"
        style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
      >
        {/* Background decoration */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)", backgroundSize: "24px 24px" }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-1.5 px-4">
          <span className="text-4xl sm:text-5xl drop-shadow-sm">{icon}</span>
          <span className={`text-[11px] sm:text-xs font-semibold ${colors.accent} text-center leading-tight line-clamp-2 max-w-[90%]`}>
            {exerciseName}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1 mt-0.5">
            {muscles.slice(0, 3).map((m, i) => (
              <span key={i} className="text-[9px] sm:text-[10px] font-medium text-foreground/50 flex items-center gap-0.5">
                <span className="text-xs">{getMuscleEmoji(m)}</span>
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Generate button */}
        {showGenerateButton && checked && !loading && (
          <button
            onClick={(e) => { e.stopPropagation(); generateImage(); }}
            className="absolute bottom-2 right-2 bg-primary/80 text-primary-foreground rounded-full p-1.5 hover:bg-primary transition-colors shadow-md z-20"
            title="Genera immagine AI"
          >
            <ImageIcon size={14} />
          </button>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center rounded-xl z-20">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
