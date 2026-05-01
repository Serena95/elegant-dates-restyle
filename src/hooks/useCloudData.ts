import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { WeekPlan, Exercise, getWeekdayFromDateKey } from "@/data/exercises";
import { loadOfflineCache, isOnline } from "@/hooks/useOfflineCache";

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
  completedDates: string[]; // Array of YYYY-MM-DD or locale dates marked as completed (supports retroactive)
  completed?: boolean;
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

export interface NutritionProfile {
  peso: number | null;
  altezza: number | null;
  eta: number | null;
  attivita_livello: string;
  obiettivo_nutrizionale: string;
  calorie_target: number | null;
}

export interface UserTimeSettings {
  fuso_orario: string;
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
  const [sfide, setSfideState] = useState<Sfida[]>([]);
  const [ultimiAttrezzi, setUltimiAttrezziState] = useState<string[]>([]);
  const [profile, setProfileState] = useState<ProfileData>({ display_name: null, avatar_url: null });
  const [cycleEntries, setCycleEntriesState] = useState<CycleEntry[]>([]);
  const [giorniAllenamento, setGiorniAllenamentoState] = useState<number[]>([1, 3, 5]);
  const [workoutGenerationKey, setWorkoutGenerationKeyState] = useState<string>("");
  const [pregnancySettings, setPregnancySettingsState] = useState<PregnancySettings>({
    modalita_gravidanza: false,
    settimana_gestazionale: 0,
    durata_ciclo: 28,
    durata_mestruazione: 5,
  });
  const [nutritionProfile, setNutritionProfileState] = useState<NutritionProfile>({
    peso: null, altezza: null, eta: null,
    attivita_livello: "moderata", obiettivo_nutrizionale: "mantenimento", calorie_target: null,
  });
  const [timeSettings, setTimeSettingsState] = useState<UserTimeSettings>({
    fuso_orario: "Europe/Rome",
  });

  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  const extractEquipmentFromPlan = (planData: any): string[] => {
    const raw = Object.values((planData || {}) as Record<string, any>)
      .map((v: any) => v?.attrezzo)
      .filter(Boolean) as string[];
    return Array.from(new Set(raw));
  };

  const extractTrainingDaysFromPlan = (planData: any): number[] => {
    const days = Object.keys((planData || {}) as Record<string, any>)
      .map((k) => getWeekdayFromDateKey(k))
      .filter((d, i, arr) => arr.indexOf(d) === i);

    if (days.length === 0) return [1, 3, 5];

    return days.sort((a, b) => {
      const an = a === 0 ? 7 : a;
      const bn = b === 0 ? 7 : b;
      return an - bn;
    });
  };

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);

    // If offline, load from cache
    if (!isOnline()) {
      const cache = loadOfflineCache();
      if (cache) {
        setPianoState(cache.piano || {});
        setAllenamentiDataState(cache.allenamentiData || { esercizi: {}, storico: {} });
        setStoricoCalState(cache.storicoCal || {});
        setAttrezziState(cache.attrezzi || []);
        setLivelloState(cache.livello || "MEDIO");
        setGiorniAllenamentoState(cache.giorniAllenamento || [1, 3, 5]);
        setUltimiAttrezziState(cache.ultimiAttrezzi || []);
        if (cache.profile) setProfileState(cache.profile);
        if (cache.misure) setMisureState(cache.misure);
        if (cache.pasti) setPastiState(cache.pasti);
        if (typeof cache.acqua === "number") setAcquaState(cache.acqua);
        if (cache.sfide) setSfideState(cache.sfide);
        if (cache.cycleEntries) setCycleEntriesState(cache.cycleEntries);
        if (cache.pregnancySettings) setPregnancySettingsState(cache.pregnancySettings);
        if ((cache as any).nutritionProfile) setNutritionProfileState((cache as any).nutritionProfile);
        setLoading(false);
        // Register sync listener for when online returns
        const handleOnline = () => { window.removeEventListener("online", handleOnline); loadAll(); };
        window.addEventListener("online", handleOnline);
        return;
      }
    }

    const [settingsRes, plansRes, historyRes, measRes, foodRes, waterRes, challengeRes, profileRes, cycleRes] = await Promise.all([
      supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("workout_plans").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("workout_history").select("*").eq("user_id", user.id),
      supabase.from("measurements").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("food_diary").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("water_tracking").select("*").eq("user_id", user.id).eq("data", new Date().toISOString().split("T")[0]).maybeSingle(),
      supabase.from("challenges").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, display_name, avatar_url, xp, level, premium, premium_expires").eq("user_id", user.id).maybeSingle(),
      supabase.from("cycle_tracking").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);

    const planData = (plansRes.data?.piano as any) || {};
    const fallbackAttrezzi = extractEquipmentFromPlan(planData);
    const fallbackGiorni = extractTrainingDaysFromPlan(planData);

    if (settingsRes.data) {
      setAttrezziState((settingsRes.data.attrezzi_selezionati || fallbackAttrezzi) as string[]);
      setLivelloState(settingsRes.data.livello || "MEDIO");
      setUltimiAttrezziState(settingsRes.data.ultimi_attrezzi || []);
      setGiorniAllenamentoState((settingsRes.data as any).giorni_allenamento || fallbackGiorni);
      setWorkoutGenerationKeyState((settingsRes.data as any).workout_generation_key || "");
      setTimeSettingsState({
        fuso_orario: (settingsRes.data as any).fuso_orario || "Europe/Rome",
      });
      setPregnancySettingsState({
        modalita_gravidanza: (settingsRes.data as any).modalita_gravidanza || false,
        settimana_gestazionale: (settingsRes.data as any).settimana_gestazionale || 0,
        durata_ciclo: (settingsRes.data as any).durata_ciclo || 28,
        durata_mestruazione: (settingsRes.data as any).durata_mestruazione || 5,
      });
      setNutritionProfileState({
        peso: (settingsRes.data as any).peso || null,
        altezza: (settingsRes.data as any).altezza || null,
        eta: (settingsRes.data as any).eta || null,
        attivita_livello: (settingsRes.data as any).attivita_livello || "moderata",
        obiettivo_nutrizionale: (settingsRes.data as any).obiettivo_nutrizionale || "mantenimento",
        calorie_target: (settingsRes.data as any).calorie_target || null,
      });
    } else {
      setAttrezziState(fallbackAttrezzi);
      setLivelloState("MEDIO");
      setUltimiAttrezziState([]);
      setGiorniAllenamentoState(fallbackGiorni);
      setTimeSettingsState({ fuso_orario: "Europe/Rome" });
      await supabase.from("user_settings").insert({
        user_id: user.id,
        attrezzi_selezionati: fallbackAttrezzi,
        livello: "MEDIO",
        ultimi_attrezzi: [],
        giorni_allenamento: fallbackGiorni,
      } as any);
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

    if (challengeRes.data && Array.isArray(challengeRes.data)) {
      setSfideState(challengeRes.data.map((c: any) => ({
        id: c.id,
        nome: c.nome,
        streak: c.streak,
        ultimaData: c.ultima_data,
        completedDates: c.completed_dates || [],
      })));
    }

    if (profileRes.data) {
      setProfileState({ display_name: profileRes.data.display_name, avatar_url: profileRes.data.avatar_url });
    } else if (user) {
      // Fallback: use Google metadata if profile row is missing (trigger may not have fired)
      const meta = user.user_metadata;
      const fallbackProfile: ProfileData = {
        display_name: meta?.full_name || meta?.name || user.email?.split("@")[0] || null,
        avatar_url: meta?.avatar_url || meta?.picture || null,
      };
      setProfileState(fallbackProfile);
      // Try to create the missing profile row
      supabase.from("profiles").insert({
        user_id: user.id,
        display_name: fallbackProfile.display_name,
        avatar_url: fallbackProfile.avatar_url,
      }).then(() => {});
    }

    if (cycleRes.data) {
      setCycleEntriesState(cycleRes.data.map((c: any) => ({
        id: c.id, data: c.data, tipo: c.tipo, sintomi: c.sintomi || [], note: c.note || "",
      })));
    }

    setLoading(false);
  };

  const upsertUserSettings = useCallback(async (updates: Record<string, any>) => {
    if (!user) return;
    const { data: existing } = await supabase.from("user_settings").select("id").eq("user_id", user.id).maybeSingle();
    if (existing) {
      await supabase.from("user_settings").update(updates as any).eq("user_id", user.id);
    } else {
      await supabase.from("user_settings").insert({ user_id: user.id, ...(updates as any) } as any);
    }
  }, [user]);

  const setAttrezzi = useCallback(async (v: string[]) => {
    if (!user) return;
    setAttrezziState(v);
    await upsertUserSettings({ attrezzi_selezionati: v });
  }, [user, upsertUserSettings]);

  const setLivello = useCallback(async (v: string) => {
    if (!user) return;
    setLivelloState(v);
    await upsertUserSettings({ livello: v });
  }, [user, upsertUserSettings]);

  const setUltimiAttrezzi = useCallback(async (v: string[]) => {
    if (!user) return;
    setUltimiAttrezziState(v);
    await upsertUserSettings({ ultimi_attrezzi: v });
  }, [user, upsertUserSettings]);

  const setGiorniAllenamento = useCallback(async (v: number[]) => {
    if (!user) return;
    setGiorniAllenamentoState(v);
    await upsertUserSettings({ giorni_allenamento: v });
  }, [user, upsertUserSettings]);

  const setWorkoutGenerationKey = useCallback(async (v: string) => {
    if (!user) return;
    setWorkoutGenerationKeyState(v);
    await upsertUserSettings({ workout_generation_key: v });
  }, [user, upsertUserSettings]);

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

  const saveStoricoCal = useCallback(async (dataKey: string, entry: { attrezzo: string; round: number; completato: boolean; focus?: any }) => {
    if (!user) return;
    setStoricoCalState(prev => ({ ...prev, [dataKey]: entry }));

    const { focus, ...dbEntry } = entry;
    const { data: existing } = await supabase.from("workout_history").select("id").eq("user_id", user.id).eq("data_key", dataKey).maybeSingle();
    if (existing) {
      await supabase.from("workout_history").update(dbEntry).eq("id", existing.id);
    } else {
      await supabase.from("workout_history").insert({ user_id: user.id, data_key: dataKey, ...dbEntry });
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

  // Add a new food challenge (each user can have many concurrent ones)
  const addSfida = useCallback(async (nome: string): Promise<Sfida | null> => {
    if (!user) return null;
    const { data, error } = await supabase.from("challenges").insert({
      user_id: user.id,
      nome,
      streak: 0,
      ultima_data: null,
      completed_dates: [],
    } as any).select().single();
    if (error || !data) return null;
    const created: Sfida = {
      id: data.id,
      nome: data.nome,
      streak: data.streak,
      ultimaData: data.ultima_data,
      completedDates: (data as any).completed_dates || [],
    };
    setSfideState(prev => [created, ...prev]);
    return created;
  }, [user]);

  // Delete a single challenge
  const deleteSfida = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from("challenges").delete().eq("id", id);
    setSfideState(prev => prev.filter(s => s.id !== id));
  }, [user]);

  // Toggle a specific date as completed/uncompleted for a given challenge.
  // Supports retroactive (any date in YYYY-MM-DD format).
  const toggleSfidaDate = useCallback(async (id: string, dateKey: string) => {
    if (!user) return;
    const target = (await new Promise<Sfida | undefined>(resolve => {
      setSfideState(prev => {
        const found = prev.find(s => s.id === id);
        resolve(found);
        return prev;
      });
    }));
    if (!target) return;

    const dates = new Set(target.completedDates);
    if (dates.has(dateKey)) {
      dates.delete(dateKey);
    } else {
      dates.add(dateKey);
    }
    const newDates = Array.from(dates).sort();
    const newStreak = newDates.length;
    const newLast = newDates.length > 0 ? newDates[newDates.length - 1] : null;

    setSfideState(prev => prev.map(s => s.id === id
      ? { ...s, completedDates: newDates, streak: newStreak, ultimaData: newLast }
      : s
    ));

    await supabase.from("challenges").update({
      completed_dates: newDates,
      streak: newStreak,
      ultima_data: newLast,
    } as any).eq("id", id);
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

  const addCycleEntry = useCallback(async (entry: Omit<CycleEntry, "id">) => {
    if (!user) return;
    const { data } = await supabase.from("cycle_tracking").insert({
      user_id: user.id, data: entry.data, tipo: entry.tipo, sintomi: entry.sintomi, note: entry.note,
    }).select().single();
    if (data) setCycleEntriesState(prev => [{ id: data.id, ...entry }, ...prev]);
  }, [user]);

  const deleteCycleEntry = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from("cycle_tracking").delete().eq("id", id);
    setCycleEntriesState(prev => prev.filter(e => e.id !== id));
  }, [user]);

  const updatePregnancySettings = useCallback(async (updates: Partial<PregnancySettings>) => {
    if (!user) return;
    setPregnancySettingsState(prev => ({ ...prev, ...updates }));
    const dbUpdates: any = {};
    if (updates.modalita_gravidanza !== undefined) dbUpdates.modalita_gravidanza = updates.modalita_gravidanza;
    if (updates.settimana_gestazionale !== undefined) dbUpdates.settimana_gestazionale = updates.settimana_gestazionale;
    if (updates.durata_ciclo !== undefined) dbUpdates.durata_ciclo = updates.durata_ciclo;
    if (updates.durata_mestruazione !== undefined) dbUpdates.durata_mestruazione = updates.durata_mestruazione;
    await upsertUserSettings(dbUpdates);
  }, [user, upsertUserSettings]);

  const updateNutritionProfile = useCallback(async (updates: Partial<NutritionProfile>) => {
    if (!user) return;
    setNutritionProfileState(prev => ({ ...prev, ...updates }));
    const dbUpdates: any = {};
    if (updates.peso !== undefined) dbUpdates.peso = updates.peso;
    if (updates.altezza !== undefined) dbUpdates.altezza = updates.altezza;
    if (updates.eta !== undefined) dbUpdates.eta = updates.eta;
    if (updates.attivita_livello !== undefined) dbUpdates.attivita_livello = updates.attivita_livello;
    if (updates.obiettivo_nutrizionale !== undefined) dbUpdates.obiettivo_nutrizionale = updates.obiettivo_nutrizionale;
    if (updates.calorie_target !== undefined) dbUpdates.calorie_target = updates.calorie_target;
    await upsertUserSettings(dbUpdates);
  }, [user, upsertUserSettings]);

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
    sfide, addSfida, deleteSfida, toggleSfidaDate,
    ultimiAttrezzi, setUltimiAttrezzi,
    profile, updateProfile,
    resetWorkoutData,
    cycleEntries, addCycleEntry, deleteCycleEntry,
    pregnancySettings, updatePregnancySettings,
    giorniAllenamento, setGiorniAllenamento,
    nutritionProfile, updateNutritionProfile,
    workoutGenerationKey, setWorkoutGenerationKey,
    timeSettings,
  };
}
