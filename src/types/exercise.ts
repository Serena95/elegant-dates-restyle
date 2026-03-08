export interface Exercise {
  id: string;
  name: string;
  equipment: string;
  focus: string;
  muscles: string[];
  difficulty: "beginner" | "medium" | "advanced";
  duration: number;
  gif: string;
}

/**
 * Map from legacy Italian difficulty to new English difficulty.
 */
export function mapDifficulty(livello: "base" | "medio" | "avanzato"): Exercise["difficulty"] {
  const map: Record<string, Exercise["difficulty"]> = {
    base: "beginner",
    medio: "medium",
    avanzato: "advanced",
  };
  return map[livello] || "medium";
}
