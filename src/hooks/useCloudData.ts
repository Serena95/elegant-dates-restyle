import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { WeekPlan, Exercise } from "@/data/exercises";

export interface Misura {
  id?: string;
  data: string;
  peso: string;
  vita: string;
  fianchi: string;
  coscia: string;
}

export interface Pasto {
  id?: string;
  tipo: string;
  desc: string;
  mood: string;
  data: string;
}

export interface Sfida {
  id?: string;
  nome: string;
  streak: number;
  ultimaData: string | null;
}

export interface AllenamentiData {
  esercizi: Record<string, Exercise[]>;
  storico: Record<string, string[]>;
}

export interface ProfileData {
  display_name: string | null;
  avatar_url: string | null;
}

export interface CycleEntry {
  id?: string;
  data: string;
  tipo: string;
  sintomi: string[];
  note: string;
}

export interface PregnancySettings {
  modalita_gravidanza: boolean;
  settimana_gestazionale: number;
  durata_ciclo: number;
  durata_mestruazione: number;
}

export function useCloudData() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [attrezzi, setAttrezziState] = useState<string[]>([]);
  const [livello, setLivelloState] = useState("MEDIO");
  const [piano, setPianoState] = useState<WeekPlan>({});
  const [allenamentiData, setAllenamentiDataState] = useState<AllenamentiData>({ esercizi: {}, storico: {} });
  const [storicoCal, setStoricoCalState] = useState<Record<string, any>>({});
  const [misure, setMisureState] = useState<Misura[]>([]);
  const [pasti, setPastiState] = useState<Pasto[]>([]);
  const [acqua, setAcquaState] = useState(0);
  const [sfida, setSfidaState] = useState<Sfida | null>(null);
  const [ultimiAttrezzi, setUltimiAttrezziState] = useState<string[]>([]);
  const [profile, setProfileState] = useState<ProfileData>({ display_name: null, avatar_url: null });
  const [cycleEntries, setCycleEntriesState] = useState<CycleEntry[]>([]);
  const [pregnancySettings, setPregnancySettingsState] = useState<PregnancySettings>({
    modalita_gravidanza: false,
    settimana_gestazionale: 0,
    durata_ciclo: 28,
    durata_mestruazione: 5,
  });
  const sfidaRef = useRef<Sfida | null>(null);

  useEffect(() => {
    sfidaRef.current = sfida;
  }, [sfida]);

  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);

    const [settingsRes, plansRes, historyRes, measRes, foodRes, waterRes, challengeRes, profileRes, cycleRes] = await Promise.all([
      supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("workout_plans").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("workout_history").select("*").eq("user_id", user.id),
      supabase.from("measurements").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("food_diary").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("water_tracking").select("*").eq("user_id", user.id).eq("data", new Date().toISOString().split("T")[0]).maybeSingle(),
      supabase.from("challenges").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("cycle_tracking").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);

    if (settingsRes.data) {
      setAttrezziState(settingsRes.data.attrezzi_selezionati || []);
      setLivelloState(settingsRes.data.livello || "MEDIO");
      setUltimiAttrezziState(settingsRes.data.ultimi_attrezzi || []);
    }

    if (plansRes.data) {
      setPianoState((plansRes.data.piano as any) || {});
      const ad = (plansRes.data.allenamenti as any) || {};
      setAllenamentiDataState({ esercizi: ad.esercizi || {}, storico: ad.storico || {} });
    }

    if (historyRes.data) {
      const cal: Record<string, any> = {};
      historyRes.data.forEach((h: any) => {
        cal[h.data_key] = { attrezzo: h.attrezzo, round: h.round, completato: h.completato };
      });
      setStoricoCalState(cal);
    }

    if (measRes.data) {
      setMisureState(measRes.data.map((m: any) => ({
        id: m.id, data: m.data, peso: m.peso, vita: m.vita, fianchi: m.fianchi, coscia: m.coscia
      })));
    }

    if (foodRes.data) {
      setPastiState(foodRes.data.map((f: any) => ({
        id: f.id, tipo: f.tipo, desc: f.descrizione, mood: f.mood, data: f.data
      })));
    }

    if (waterRes.data) setAcquaState(waterRes.data.bicchieri);

    if (challengeRes.data) {
      const s = {
        id: challengeRes.data.id, nome: challengeRes.data.nome,
        streak: challengeRes.data.streak, ultimaData: challengeRes.data.ultima_data
      };
      setSfidaState(s);
      sfidaRef.current = s;
    }

    if (profileRes.data) {
      setProfileState({ display_name: profileRes.data.display_name, avatar_url: profileRes.data.avatar_url });
    }

    setLoading(false);
  };

  const setAttrezzi = useCallback(async (v: string[]) => {
    if (!user) return;
    setAttrezziState(v);
    await supabase.from("user_settings").update({ attrezzi_selezionati: v }).eq("user_id", user.id);
  }, [user]);

  const setLivello = useCallback(async (v: string) => {
    if (!user) return;
    setLivelloState(v);
    await supabase.from("user_settings").update({ livello: v }).eq("user_id", user.id);
  }, [user]);

  const setUltimiAttrezzi = useCallback(async (v: string[]) => {
    if (!user) return;
    setUltimiAttrezziState(v);
    await supabase.from("user_settings").update({ ultimi_attrezzi: v }).eq("user_id", user.id);
  }, [user]);

  const savePiano = useCallback(async (newPiano: WeekPlan, newAllenamenti?: AllenamentiData) => {
    if (!user) return;
    setPianoState(newPiano);
    if (newAllenamenti) setAllenamentiDataState(newAllenamenti);

    const updateData: any = { piano: newPiano };
    if (newAllenamenti) updateData.allenamenti = newAllenamenti;

    const { data: existing } = await supabase.from("workout_plans").select("id").eq("user_id", user.id).maybeSingle();
    if (existing) {
      await supabase.from("workout_plans").update(updateData).eq("user_id", user.id);
    } else {
      await supabase.from("workout_plans").insert({ user_id: user.id, ...updateData });
    }
  }, [user]);

  const saveStoricoCal = useCallback(async (dataKey: string, entry: { attrezzo: string; round: number; completato: boolean }) => {
    if (!user) return;
    setStoricoCalState(prev => ({ ...prev, [dataKey]: entry }));

    const { data: existing } = await supabase.from("workout_history").select("id").eq("user_id", user.id).eq("data_key", dataKey).maybeSingle();
    if (existing) {
      await supabase.from("workout_history").update(entry).eq("id", existing.id);
    } else {
      await supabase.from("workout_history").insert({ user_id: user.id, data_key: dataKey, ...entry });
    }
  }, [user]);

  const addMisura = useCallback(async (misura: Omit<Misura, "id">) => {
    if (!user) return;
    const { data } = await supabase.from("measurements").insert({
      user_id: user.id, data: misura.data, peso: misura.peso, vita: misura.vita, fianchi: misura.fianchi, coscia: misura.coscia
    }).select().single();
    if (data) setMisureState(prev => [{ id: data.id, ...misura }, ...prev]);
  }, [user]);

  const deleteMisura = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from("measurements").delete().eq("id", id);
    setMisureState(prev => prev.filter(m => m.id !== id));
  }, [user]);

  const addPasto = useCallback(async (pasto: Omit<Pasto, "id">) => {
    if (!user) return;
    const { data } = await supabase.from("food_diary").insert({
      user_id: user.id, tipo: pasto.tipo, descrizione: pasto.desc, mood: pasto.mood, data: pasto.data
    }).select().single();
    if (data) setPastiState(prev => [{ id: data.id, ...pasto }, ...prev]);
  }, [user]);

  const deletePasto = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from("food_diary").delete().eq("id", id);
    setPastiState(prev => prev.filter(p => p.id !== id));
  }, [user]);

  const setAcqua = useCallback(async (bicchieri: number) => {
    if (!user) return;
    setAcquaState(bicchieri);
    const oggi = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase.from("water_tracking").select("id").eq("user_id", user.id).eq("data", oggi).maybeSingle();
    if (existing) {
      await supabase.from("water_tracking").update({ bicchieri }).eq("id", existing.id);
    } else {
      await supabase.from("water_tracking").insert({ user_id: user.id, data: oggi, bicchieri });
    }
  }, [user]);

  const setSfida = useCallback(async (newSfida: Sfida | null) => {
    if (!user) return;
    const currentSfida = sfidaRef.current;
    setSfidaState(newSfida);
    sfidaRef.current = newSfida;

    if (!newSfida) {
      if (currentSfida?.id) {
        await supabase.from("challenges").delete().eq("id", currentSfida.id);
      }
    } else if (newSfida.id) {
      await supabase.from("challenges").update({
        nome: newSfida.nome, streak: newSfida.streak, ultima_data: newSfida.ultimaData
      }).eq("id", newSfida.id);
    } else {
      const { data } = await supabase.from("challenges").insert({
        user_id: user.id, nome: newSfida.nome, streak: newSfida.streak, ultima_data: newSfida.ultimaData
      }).select().single();
      if (data) {
        const updated = { ...newSfida, id: data.id };
        setSfidaState(updated);
        sfidaRef.current = updated;
      }
    }
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<ProfileData>) => {
    if (!user) return;
    setProfileState(prev => ({ ...prev, ...updates }));
    await supabase.from("profiles").update(updates).eq("user_id", user.id);
  }, [user]);

  const resetWorkoutData = useCallback(async () => {
    if (!user) return;
    await Promise.all([
      supabase.from("workout_history").delete().eq("user_id", user.id),
      supabase.from("workout_plans").update({ piano: {}, allenamenti: {} }).eq("user_id", user.id),
    ]);
    setPianoState({});
    setAllenamentiDataState({ esercizi: {}, storico: {} });
    setStoricoCalState({});
  }, [user]);

  return {
    loading,
    attrezzi, setAttrezzi,
    livello, setLivello,
    piano, savePiano,
    allenamentiData,
    storicoCal, saveStoricoCal,
    misure, addMisura, deleteMisura,
    pasti, addPasto, deletePasto,
    acqua, setAcqua,
    sfida, setSfida,
    ultimiAttrezzi, setUltimiAttrezzi,
    profile, updateProfile,
    resetWorkoutData,
  };
}
