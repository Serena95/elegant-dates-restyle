import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { AppLayout, AppView } from "@/components/AppLayout";
import { Dashboard } from "@/components/Dashboard";
import { EquipmentSelection } from "@/components/EquipmentSelection";
import { WorkoutView } from "@/components/WorkoutView";
import { CalendarView } from "@/components/CalendarView";
import { ProgressView } from "@/components/ProgressView";
import { FoodDiary } from "@/components/FoodDiary";
import { ExerciseLibrary } from "@/components/ExerciseLibrary";
import { GuideView } from "@/components/GuideView";
import { ProfileView } from "@/components/ProfileView";
import { SettingsView } from "@/components/SettingsView";
import { WorkoutComplete } from "@/components/WorkoutComplete";
import { InstallBanner } from "@/components/InstallBanner";
import { ProgramsView } from "@/components/ProgramsView";
import { CycleTracking } from "@/components/CycleTracking";
import { PregnancyMode } from "@/components/PregnancyMode";
import { MoreView } from "@/components/MoreView";
import { WorkoutReminder } from "@/components/WorkoutReminder";
import { useNotifications } from "@/hooks/useNotifications";
import { LegalPage } from "@/components/LegalPage";
import { PremiumView } from "@/components/PremiumView";
import { TRAINING_PROGRAMS, TrainingProgram } from "@/data/programs";
import { useCloudData } from "@/hooks/useCloudData";
import { useAuth } from "@/contexts/AuthContext";
import { useBadges, Badge } from "@/hooks/useBadges";
import { Exercise, generaEserciziGiorno, selezionaAttrezziSettimana, CONFIG_LIVELLI, ATTREZZO_ICONS, detectFocus, FocusInfo, generaSettimanaIntelligente, FOCUS_LABELS, DayFocus, computeProgressionContext, isPianoCurrentWeek, getWeekDates, getLocalDateKey } from "@/data/exercises";
import { generateAIWorkout } from "@/services/aiWorkout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CycleEntry, PregnancySettings } from "@/hooks/useCloudData";

function getCyclePhase(entries: CycleEntry[], settings: PregnancySettings): string | undefined {
  if (!entries || entries.length === 0) return undefined;
  
  const lastPeriod = entries
    .filter(e => e.tipo === "mestruazione")
    .sort((a, b) => b.data.localeCompare(a.data))[0];
  
  if (!lastPeriod) return undefined;
  
  const lastDate = new Date(lastPeriod.data + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const cycleLength = settings.durata_ciclo || 28;
  const periodLength = settings.durata_mestruazione || 5;
  
  if (daysSince < periodLength) return "mestruale";
  if (daysSince < cycleLength / 2) return "follicolare";
  if (daysSince < cycleLength / 2 + 2) return "ovulazione";
  return "luteale";
}

const Index = () => {
  const cloud = useCloudData();
  const { user } = useAuth();
  const [view, setView] = useState<AppView | "cycle" | "pregnancy" | "privacy" | "terms">("dashboard");
  const [giornoSelezionato, setGiornoSelezionato] = useState<string | null>(null);
  const [eserciziCorrenti, setEserciziCorrenti] = useState<Exercise[]>([]);
  const [roundCorrenti, setRoundCorrenti] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<number>(0);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useLocalStorage("voice_trainer_enabled", true);
  const prevBadgeCountRef = useRef(0);
  const lastGeneratedKey = useRef("");

  const { unlockedBadges, checkNewBadges } = useBadges(cloud.storicoCal);
  const notifications = useNotifications(cloud.giorniAllenamento, cloud.storicoCal);
  prevBadgeCountRef.current = unlockedBadges.length;

  const userName = cloud.profile.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Utente";

  // Auto-generate weekly plan when needed
  useEffect(() => {
    const equipmentPool = cloud.attrezzi.length > 0
      ? cloud.attrezzi
      : Array.from(new Set(Object.values(cloud.piano).map((d) => d?.attrezzo).filter(Boolean) as string[]));

    if (cloud.loading || equipmentPool.length === 0) return;

    // Create a key that represents the expected plan
    const expectedKey = getWeekDates(cloud.giorniAllenamento).sort().join(",");

    // Skip if we already generated for this exact configuration
    if (lastGeneratedKey.current === expectedKey) return;

    const needsGeneration = !isPianoCurrentWeek(cloud.piano, cloud.giorniAllenamento);

    if (needsGeneration) {
      lastGeneratedKey.current = expectedKey;
      const result = generaSettimanaIntelligente(
        equipmentPool,
        cloud.livello,
        cloud.allenamentiData.storico || {},
        cloud.storicoCal,
        cloud.ultimiAttrezzi,
        cloud.giorniAllenamento
      );
      cloud.savePiano(result.piano, { esercizi: result.esercizi, storico: result.storico });
      const usedEquipment = Object.values(result.piano).map(d => d.attrezzo);
      cloud.setUltimiAttrezzi(usedEquipment);
    } else {
      // Piano matches, record the key so we don't re-check
      lastGeneratedKey.current = expectedKey;
    }
  }, [cloud.loading, cloud.attrezzi, cloud.piano, cloud.giorniAllenamento]);

  const weeklyStats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - (day === 0 ? 6 : day - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    let completed = 0;
    const total = cloud.giorniAllenamento.length;
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      const key = getLocalDateKey(d);
      if (cloud.storicoCal[key]?.completato) completed++;
    }

    // Streak
    let streak = 0;
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const trainingDaysSet = new Set(cloud.giorniAllenamento);
    for (let i = 0; i < 365; i++) {
      const dow = d.getDay();
      if (trainingDaysSet.has(dow)) {
        const k = getLocalDateKey(d);
        if (cloud.storicoCal[k]?.completato) streak++;
        else if (i > 0) break;
      }
      d.setDate(d.getDate() - 1);
    }

    return { completed, total, streak };
  }, [cloud.storicoCal, cloud.giorniAllenamento]);

  // Compute focus for each day based on cached exercises
  const focusMap = useMemo<Record<string, FocusInfo>>(() => {
    const allenamentiEsercizi = cloud.allenamentiData.esercizi || {};
    const map: Record<string, FocusInfo> = {};
    for (const giorno of Object.keys(cloud.piano)) {
      const cached = allenamentiEsercizi[giorno];
      if (cached && cached.length > 0 && (cached[0] as any).categoria) {
        map[giorno] = detectFocus(cached);
      }
    }
    return map;
  }, [cloud.piano, cloud.allenamentiData.esercizi]);

  const effectiveView: string = cloud.loading
    ? "loading"
    : cloud.attrezzi.length === 0 && Object.keys(cloud.piano).length === 0 && view === "dashboard"
      ? "equipment-init"
      : view;

  const navigate = useCallback((v: AppView) => {
    setView(v);
    setGiornoSelezionato(null);
    setShowGuide(false);
  }, []);

  const avviaAllenamento = useCallback(async (giorno: string) => {
    setGiornoSelezionato(giorno);
    setWorkoutStartTime(Date.now());
    setAiGenerated(false);
    const dati = cloud.piano[giorno];
    if (!dati) return;

    const allenamentiEsercizi = cloud.allenamentiData.esercizi || {};
    const allenamentiStorico = cloud.allenamentiData.storico || {};
    let esercizi: Exercise[];
    const cached = allenamentiEsercizi[giorno];

    if (cached && cached.length > 0 && (cached[0] as any).categoria) {
      esercizi = cached;
    } else {
      const attrezzo = dati.attrezzo || "Corpo Libero";
      const storici = Object.values(allenamentiStorico).flat();
      const ctx = computeProgressionContext(cloud.storicoCal, cloud.ultimiAttrezzi);
      ctx.recentExerciseIds = storici;

      const result = await generateAIWorkout({
        attrezzo,
        livello: cloud.livello,
        storici,
        targetCount: 7,
        progressionCtx: ctx,
      });

      esercizi = result.exercises;
      setAiGenerated(result.aiGenerated);

      const nuovoStorico = [...storici, ...esercizi.map(e => e.id)];
      const newAllenamenti = {
        esercizi: { ...allenamentiEsercizi, [giorno]: esercizi },
        storico: { ...allenamentiStorico, [attrezzo]: nuovoStorico }
      };
      cloud.savePiano(cloud.piano, newAllenamenti);
    }

    setEserciziCorrenti(esercizi);
    setRoundCorrenti(dati.round || 0);
    setView("workout");
  }, [cloud.piano, cloud.allenamentiData, cloud.savePiano, cloud.attrezzi, cloud.livello, cloud.storicoCal, cloud.ultimiAttrezzi]);

  const segnaRound = useCallback(() => {
    if (!giornoSelezionato) return;
    const config = CONFIG_LIVELLI[cloud.livello];
    const nuoviRound = roundCorrenti + 1;
    if (nuoviRound > config.round) return;

    setRoundCorrenti(nuoviRound);
    const updatedPiano = { ...cloud.piano };
    if (updatedPiano[giornoSelezionato]) {
      updatedPiano[giornoSelezionato] = { ...updatedPiano[giornoSelezionato], round: nuoviRound };
    }
    cloud.savePiano(updatedPiano);

    if (nuoviRound >= config.round) {
      const dataKey = getLocalDateKey(new Date());
      const attrezzo = cloud.piano[giornoSelezionato]?.attrezzo || "allenamento";
      const focus = detectFocus(eserciziCorrenti);
      cloud.saveStoricoCal(dataKey, { attrezzo, round: nuoviRound, completato: true, focus });

      const prevCount = prevBadgeCountRef.current;
      setTimeout(() => {
        const nb = checkNewBadges(prevCount);
        setNewBadges(nb);
        setShowComplete(true);
      }, 500);
    }
  }, [giornoSelezionato, roundCorrenti, cloud.livello, cloud.piano, cloud.savePiano, cloud.saveStoricoCal, checkNewBadges]);

  const changeLivello = useCallback((l: string) => {
    const nuovoMax = CONFIG_LIVELLI[l].round;
    cloud.setLivello(l);
    const updatedPiano = { ...cloud.piano };
    let changed = false;
    Object.keys(updatedPiano).forEach(g => {
      if (updatedPiano[g].round > nuovoMax) {
        updatedPiano[g] = { ...updatedPiano[g], round: nuovoMax };
        changed = true;
      }
    });
    if (changed) cloud.savePiano(updatedPiano);
  }, [cloud.piano, cloud.setLivello, cloud.savePiano]);

  const handleChangeTrainingDays = useCallback((days: number[]) => {
    cloud.setGiorniAllenamento(days);
    // Reset generation key to force regeneration
    lastGeneratedKey.current = "";
  }, [cloud.setGiorniAllenamento]);

  if (effectiveView === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (effectiveView === "equipment-init") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card rounded-3xl shadow-xl border border-border p-6">
          <EquipmentSelection
            savedAttrezzi={cloud.attrezzi}
            onComplete={(selected) => {
              cloud.setAttrezzi(selected);
              setView("dashboard");
              const result = generaSettimanaIntelligente(selected, cloud.livello, {}, {}, [], cloud.giorniAllenamento);
              cloud.savePiano(result.piano, { esercizi: result.esercizi, storico: result.storico });
              cloud.setUltimiAttrezzi(Object.values(result.piano).map(d => d.attrezzo));
            }}
          />
        </div>
      </div>
    );
  }

  if (view === "workout" && giornoSelezionato) {
    const attrezzo = cloud.piano[giornoSelezionato]?.attrezzo || "Corpo Libero";
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <WorkoutView
            giorno={giornoSelezionato}
            tema={attrezzo}
            esercizi={eserciziCorrenti}
            livello={cloud.livello}
            roundCorrenti={roundCorrenti}
            onSegnaRound={segnaRound}
            onBack={() => navigate("dashboard")}
            voiceEnabled={voiceEnabled}
            aiGenerated={aiGenerated}
          />
        </div>
        {showComplete && (
          <WorkoutComplete
            esercizi={eserciziCorrenti.length}
            tempoTotale={Math.floor((Date.now() - workoutStartTime) / 1000)}
            attrezzo={attrezzo}
            newBadges={newBadges}
            onClose={() => {
              setShowComplete(false);
              setNewBadges([]);
              navigate("dashboard");
            }}
          />
        )}
        <InstallBanner />
      </div>
    );
  }

  if (view === "equipment") {
    return (
      <AppLayout currentView={view} onNavigate={navigate} profile={cloud.profile} userName={userName}>
        <EquipmentSelection savedAttrezzi={cloud.attrezzi} onComplete={(selected) => { cloud.setAttrezzi(selected); navigate("dashboard"); }} />
      </AppLayout>
    );
  }

  const renderContent = () => {
    if (showGuide) return <GuideView onBack={() => setShowGuide(false)} />;

    switch (view) {
      case "dashboard":
        return (
          <Dashboard
            piano={cloud.piano}
            livello={cloud.livello}
            onAvviaAllenamento={avviaAllenamento}
            onChangeLivello={changeLivello}
            userName={userName}
            weeklyStats={weeklyStats}
            onNavigate={navigate}
            focusMap={focusMap}
            storicoCal={cloud.storicoCal}
            giorniAllenamento={cloud.giorniAllenamento}
            attrezzi={cloud.attrezzi}
            cyclePhase={cloud.pregnancySettings.modalita_gravidanza ? undefined : getCyclePhase(cloud.cycleEntries, cloud.pregnancySettings)}
            pregnancyMode={cloud.pregnancySettings.modalita_gravidanza}
            pregnancyWeek={cloud.pregnancySettings.settimana_gestazionale}
          />
        );
      case "progress":
        return <ProgressView misure={cloud.misure} onAddMisura={cloud.addMisura} onDeleteMisura={cloud.deleteMisura} onBack={() => navigate("dashboard")} />;
      case "calendar":
        return <CalendarView livello={cloud.livello} storicoCal={cloud.storicoCal} onBack={() => navigate("dashboard")} />;
      case "food":
        return (
          <FoodDiary
            piano={cloud.piano}
            pasti={cloud.pasti}
            onAddPasto={cloud.addPasto}
            onDeletePasto={cloud.deletePasto}
            acqua={cloud.acqua}
            onSetAcqua={cloud.setAcqua}
            sfida={cloud.sfida}
            onSetSfida={cloud.setSfida}
            onBack={() => navigate("dashboard")}
          />
        );
      case "library":
        return <ExerciseLibrary onBack={() => navigate("more")} />;
      case "more":
        return <MoreView onNavigate={(v) => navigate(v as any)} />;
      case "programs":
        return (
          <ProgramsView
            userAttrezzi={cloud.attrezzi}
            onStartProgram={(program) => {
              const week = program.settimane[0];
              const nuovoPiano: Record<string, { attrezzo: string; round: number }> = {};
              week.giorni.forEach(g => {
                nuovoPiano[g.giorno] = { attrezzo: g.attrezzo, round: 0 };
              });
              cloud.savePiano(nuovoPiano, { esercizi: {}, storico: cloud.allenamentiData.storico || {} });
              navigate("dashboard");
            }}
          />
        );
      case "profile":
        return (
          <ProfileView
            profile={cloud.profile}
            onUpdateProfile={cloud.updateProfile}
            unlockedBadges={unlockedBadges}
            livello={cloud.livello}
            attrezzi={cloud.attrezzi}
            totalWorkouts={Object.values(cloud.storicoCal).filter((v: any) => v?.completato).length}
          />
        );
      case "settings":
        return (
          <SettingsView
            onNavigate={(v) => {
              if (v === "guide") setShowGuide(true);
              else if (v === "cycle" || v === "pregnancy" || v === "privacy" || v === "terms") setView(v as any);
              else navigate(v as AppView);
            }}
            onModificaAttrezzi={() => navigate("equipment")}
            voiceEnabled={voiceEnabled}
            onToggleVoice={setVoiceEnabled}
            giorniAllenamento={cloud.giorniAllenamento}
            onChangeGiorniAllenamento={handleChangeTrainingDays}
            notificheAbilitate={notifications.settings.notifiche_abilitate}
            notificaOrario={notifications.settings.notifica_orario}
            onToggleNotifiche={notifications.toggleNotifications}
            onChangeOrarioNotifica={(orario) => notifications.updateSettings({ notifica_orario: orario })}
          />
        );
      case "cycle" as any:
        return (
          <CycleTracking
            entries={cloud.cycleEntries}
            onAddEntry={cloud.addCycleEntry}
            onDeleteEntry={cloud.deleteCycleEntry}
            durataCiclo={cloud.pregnancySettings.durata_ciclo}
            durataMestruazione={cloud.pregnancySettings.durata_mestruazione}
            onUpdateSettings={(s) => cloud.updatePregnancySettings(s)}
            onBack={() => navigate("more")}
          />
        );
      case "pregnancy" as any:
        return (
          <PregnancyMode
            isActive={cloud.pregnancySettings.modalita_gravidanza}
            settimanaGestazionale={cloud.pregnancySettings.settimana_gestazionale}
            onToggle={(active) => cloud.updatePregnancySettings({ modalita_gravidanza: active, settimana_gestazionale: active ? Math.max(1, cloud.pregnancySettings.settimana_gestazionale) : 0 })}
            onUpdateWeek={(week) => cloud.updatePregnancySettings({ settimana_gestazionale: week })}
            onBack={() => navigate("more")}
          />
        );
      case "privacy" as any:
        return <LegalPage type="privacy" onBack={() => setView("settings" as any)} />;
      case "terms" as any:
        return <LegalPage type="terms" onBack={() => setView("settings" as any)} />;
      default:
        return null;
    }
  };

  return (
    <AppLayout currentView={view as AppView} onNavigate={navigate} profile={cloud.profile} userName={userName}>
      {renderContent()}
      <InstallBanner />
    </AppLayout>
  );
};

export default Index;
