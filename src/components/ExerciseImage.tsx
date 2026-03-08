import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dumbbell, ImageIcon, Loader2 } from "lucide-react";

interface ExerciseImageProps {
  exerciseId: string;
  exerciseName: string;
  category: string;
  muscles: string[];
  equipment?: string;
  className?: string;
  showGenerateButton?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  core: "from-amber-400/30 to-orange-400/30",
  gambe: "from-blue-400/30 to-cyan-400/30",
  glutei: "from-pink-400/30 to-rose-400/30",
  schiena: "from-green-400/30 to-emerald-400/30",
  "mobilità": "from-purple-400/30 to-violet-400/30",
  "stabilità": "from-teal-400/30 to-cyan-400/30",
  cardio: "from-red-400/30 to-orange-400/30",
  braccia: "from-indigo-400/30 to-blue-400/30",
};

const CATEGORY_ICONS: Record<string, string> = {
  core: "🎯",
  gambe: "🦵",
  glutei: "🍑",
  schiena: "🔙",
  "mobilità": "🧘",
  "stabilità": "⚖️",
  cardio: "❤️‍🔥",
  braccia: "💪",
};

export function ExerciseImage({
  exerciseId,
  exerciseName,
  category,
  muscles,
  equipment,
  className = "w-full h-40",
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
        
        // Try to fetch the image to see if it exists
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

  // Show image if available
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={exerciseName}
        className={`${className} object-cover rounded-lg`}
        loading="lazy"
        onError={() => setImageUrl(null)}
      />
    );
  }

  // Placeholder with category-based design
  const gradient = CATEGORY_COLORS[category] || "from-muted/50 to-muted";
  const icon = CATEGORY_ICONS[category] || "🏋️";

  return (
    <div className={`${className} rounded-lg bg-gradient-to-br ${gradient} flex flex-col items-center justify-center relative overflow-hidden`}>
      <span className="text-4xl mb-1">{icon}</span>
      <span className="text-[10px] font-medium text-foreground/60 text-center px-2 leading-tight">
        {muscles.slice(0, 2).join(" • ")}
      </span>
      
      {showGenerateButton && checked && !loading && (
        <button
          onClick={(e) => { e.stopPropagation(); generateImage(); }}
          className="absolute bottom-1 right-1 bg-primary/80 text-primary-foreground rounded-full p-1.5 hover:bg-primary transition-colors"
          title="Genera immagine AI"
        >
          <ImageIcon size={12} />
        </button>
      )}
      
      {loading && (
        <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-lg">
          <Loader2 size={20} className="animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
