import { useLocalStorage } from "./useLocalStorage";

export interface ActiveProgramState {
  type: "program" | "challenge";
  id: string;
  name: string;
  week?: number; // for programs
  startDate: string;
}

export function useActiveProgram() {
  const [active, setActive] = useLocalStorage<ActiveProgramState | null>("active_program", null);

  const startProgram = (id: string, name: string) => {
    setActive({ type: "program", id, name, week: 1, startDate: new Date().toISOString().split("T")[0] });
  };

  const startChallenge = (id: string, name: string) => {
    setActive({ type: "challenge", id, name, startDate: new Date().toISOString().split("T")[0] });
  };

  const cancel = () => setActive(null);

  const advanceWeek = () => {
    if (active?.type === "program") {
      setActive({ ...active, week: (active.week || 1) + 1 });
    }
  };

  return { active, startProgram, startChallenge, cancel, advanceWeek };
}
