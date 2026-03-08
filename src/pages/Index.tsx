import { useState, useCallback, useMemo, useRef } from "react";
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
import { TRAINING_PROGRAMS, TrainingProgram } from "@/data/programs";
import { useCloudData } from "@/hooks/useCloudData";
import { useAuth } from "@/contexts/AuthContext";
import { useBadges, Badge } from "@/hooks/useBadges";
import { Exercise, generaEserciziGiorno, selezionaAttrezziSettimana, CONFIG_LIVELLI, ATTREZZO_ICONS, detectFocus, FocusInfo } from "@/data/exercises";

const Index = () => {
  const cloud = useCloudData();
  const { user } = useAuth();
  const [view, setView] = useState<AppView | "cycle" | "pregnancy">("dashboard");
  const [giornoSelezionato, setGiornoSelezionato] = useState<string | null>(null);
  const [eserciziCorrenti, setEserciziCorrenti] = useState<Exercise[]>([]);
  const [roundCorrenti, setRoundCorrenti] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<number>(0);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const prevBadgeCountRef = useRef(0);

  const { unlockedBadges, checkNewBadges } = useBadges(cloud.storicoCal);

  // Track previous badge count
  prevBadgeCountRef.current = unlockedBadges.length;

  const userName = cloud.profile.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Utente";

  const weeklyStats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - (day === 0 ? 6 : day - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    let completed = 0;
    let total = 3;
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0];
      if (cloud.storicoCal[key]?.completato) completed++;
    }

    // Streak
    let streak = 0;
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const dow = d.getDay();
      if (dow === 1 || dow === 3 || dow === 5) {
        const k = d.toISOString().split("T")[0];
        if (cloud.storicoCal[k]?.completato) streak++;
        else if (i > 0) break;
      }
      d.setDate(d.getDate() - 1);
    }

    return { completed, total, streak };
  }, [cloud.storicoCal]);

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
    : cloud.attrezzi.length === 0 && view === "dashboard"
      ? "equipment-init"
      : view;

  const navigate = useCallback((v: AppView) => {
    setView(v);
    setGiornoSelezionato(null);
    setShowGuide(false);
  }, []);

  const generaNuovaSettimana = useCallback(() => {
    if (cloud.attrezzi.length === 0) {
      alert("⚠️ Non hai selezionato nessun attrezzo!");
      setView("equipment");
      return;
    }
    const attrezziSettimana = selezionaAttrezziSettimana(cloud.attrezzi);
    const giorni = ["Lunedì", "Mercoledì", "Venerdì"];
    const nuovoPiano: Record<string, { attrezzo: string; round: number }> = {};
    giorni.forEach((g, i) => { nuovoPiano[g] = { attrezzo: attrezziSettimana[i], round: 0 }; });
    cloud.savePiano(nuovoPiano, { esercizi: {}, storico: cloud.allenamentiData.storico || {} });
    alert("✅ Nuovo piano generato con successo!");
  }, [cloud.attrezzi, cloud.allenamentiData.storico, cloud.savePiano]);

  const avviaAllenamento = useCallback((giorno: string) => {
    setGiornoSelezionato(giorno);
    setWorkoutStartTime(Date.now());
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
      esercizi = generaEserciziGiorno(attrezzo, cloud.livello, storici);
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
  }, [cloud.piano, cloud.allenamentiData, cloud.savePiano, cloud.attrezzi, cloud.livello]);

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
      const dataKey = new Date().toISOString().split("T")[0];
      const attrezzo = cloud.piano[giornoSelezionato]?.attrezzo || "allenamento";
      const focus = detectFocus(eserciziCorrenti);
      cloud.saveStoricoCal(dataKey, { attrezzo, round: nuoviRound, completato: true, focus });

      // Check for new badges after a short delay to let state update
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
              const attrezziSettimana = selezionaAttrezziSettimana(selected);
              const giorni = ["Lunedì", "Mercoledì", "Venerdì"];
              const nuovoPiano: Record<string, { attrezzo: string; round: number }> = {};
              giorni.forEach((g, i) => { nuovoPiano[g] = { attrezzo: attrezziSettimana[i], round: 0 }; });
              cloud.savePiano(nuovoPiano, { esercizi: {}, storico: {} });
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
            onGeneraNuova={generaNuovaSettimana}
            onAvviaAllenamento={avviaAllenamento}
            onChangeLivello={changeLivello}
            userName={userName}
            weeklyStats={weeklyStats}
            onNavigate={navigate}
            focusMap={focusMap}
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
        return <ExerciseLibrary onBack={() => navigate("dashboard")} />;
      case "programs":
        return (
          <ProgramsView
            userAttrezzi={cloud.attrezzi}
            onStartProgram={(program) => {
              // Generate workout plan based on program's first week
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
              else if (v === "cycle" || v === "pregnancy") setView(v);
              else navigate(v as AppView);
            }}
            onModificaAttrezzi={() => navigate("equipment")}
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
          />
        );
      case "pregnancy" as any:
        return (
          <PregnancyMode
            isActive={cloud.pregnancySettings.modalita_gravidanza}
            settimanaGestazionale={cloud.pregnancySettings.settimana_gestazionale}
            onToggle={(active) => cloud.updatePregnancySettings({ modalita_gravidanza: active, settimana_gestazionale: active ? Math.max(1, cloud.pregnancySettings.settimana_gestazionale) : 0 })}
            onUpdateWeek={(week) => cloud.updatePregnancySettings({ settimana_gestazionale: week })}
          />
        );
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
