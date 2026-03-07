import { useState, useCallback } from "react";
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
import { useCloudData } from "@/hooks/useCloudData";
import { useAuth } from "@/contexts/AuthContext";
import { Exercise, pescaEsercizi, CONFIG_LIVELLI } from "@/data/exercises";

const Index = () => {
  const cloud = useCloudData();
  const { user } = useAuth();
  const [view, setView] = useState<AppView>("dashboard");
  const [giornoSelezionato, setGiornoSelezionato] = useState<string | null>(null);
  const [eserciziCorrenti, setEserciziCorrenti] = useState<Exercise[]>([]);
  const [roundCorrenti, setRoundCorrenti] = useState(0);
  const [showGuide, setShowGuide] = useState(false);

  const userName = cloud.profile.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Utente";

  const effectiveView: AppView | "loading" | "equipment-init" = cloud.loading
    ? "loading"
    : cloud.attrezzi.length === 0 && view === "dashboard"
      ? "equipment-init"
      : view;

  const navigate = useCallback((v: AppView) => {
    setView(v);
    setGiornoSelezionato(null);
    setShowGuide(false);
  }, []);

  const generaNuovaSettimana = useCallback((overrideAttrezzi?: string[]) => {
    const salvati = overrideAttrezzi || cloud.attrezzi;
    if (salvati.length === 0) {
      alert("⚠️ Non hai selezionato nessun attrezzo!");
      setView("equipment");
      return;
    }

    const ultimi = cloud.ultimiAttrezzi;
    let scelti: string[] = [];

    if (salvati.length === 1) {
      scelti = [salvati[0], salvati[0], salvati[0]];
    } else if (salvati.length === 2) {
      scelti = [salvati[0], salvati[1], salvati[0]];
    } else {
      let disponibili = salvati.filter(a => !ultimi.includes(a));
      if (disponibili.length < 3) disponibili = [...salvati];
      disponibili.sort(() => 0.5 - Math.random());
      scelti = disponibili.slice(0, 3);
    }
    while (scelti.length < 3) scelti.push(salvati[0]);

    const nuovoPiano = {
      "Lunedì": { attrezzo: scelti[0], round: 0 },
      "Mercoledì": { attrezzo: scelti[1], round: 0 },
      "Venerdì": { attrezzo: scelti[2], round: 0 },
    };

    cloud.savePiano(nuovoPiano, { esercizi: {}, storico: cloud.allenamentiData.storico || {} });
    cloud.setUltimiAttrezzi(scelti);
    alert("✅ Nuovo piano generato con successo!");
  }, [cloud.attrezzi, cloud.ultimiAttrezzi, cloud.allenamentiData.storico, cloud.savePiano, cloud.setUltimiAttrezzi]);

  const avviaAllenamento = useCallback((giorno: string) => {
    setGiornoSelezionato(giorno);
    const dati = cloud.piano[giorno];
    if (!dati) return;

    const allenamentiEsercizi = cloud.allenamentiData.esercizi || {};
    const allenamentiStorico = cloud.allenamentiData.storico || {};

    let esercizi: Exercise[];
    if (allenamentiEsercizi[giorno]) {
      esercizi = allenamentiEsercizi[giorno];
    } else {
      const storici = allenamentiStorico[dati.attrezzo] || [];
      esercizi = pescaEsercizi(dati.attrezzo, storici);

      const nuovoStorico = [...storici, ...esercizi.map(e => e.nome)];
      const newAllenamenti = {
        esercizi: { ...allenamentiEsercizi, [giorno]: esercizi },
        storico: { ...allenamentiStorico, [dati.attrezzo]: nuovoStorico }
      };
      cloud.savePiano(cloud.piano, newAllenamenti);
    }

    setEserciziCorrenti(esercizi);
    setRoundCorrenti(dati.round || 0);
    setView("workout");
  }, [cloud.piano, cloud.allenamentiData, cloud.savePiano]);

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
      const attrezzo = cloud.piano[giornoSelezionato]?.attrezzo || "";
      cloud.saveStoricoCal(dataKey, { attrezzo, round: nuoviRound, completato: true });
    }
  }, [giornoSelezionato, roundCorrenti, cloud.livello, cloud.piano, cloud.savePiano, cloud.saveStoricoCal]);

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
              generaNuovaSettimana(selected);
            }}
          />
        </div>
      </div>
    );
  }

  // Workout view is full-screen without nav
  if (view === "workout" && giornoSelezionato) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <WorkoutView
            giorno={giornoSelezionato}
            attrezzo={cloud.piano[giornoSelezionato]?.attrezzo || ""}
            esercizi={eserciziCorrenti}
            livello={cloud.livello}
            roundCorrenti={roundCorrenti}
            onSegnaRound={segnaRound}
            onBack={() => navigate("dashboard")}
          />
        </div>
      </div>
    );
  }

  // Equipment editing
  if (view === "equipment") {
    return (
      <AppLayout currentView={view} onNavigate={navigate} profile={cloud.profile} userName={userName}>
        <EquipmentSelection
          savedAttrezzi={cloud.attrezzi}
          onComplete={(selected) => {
            cloud.setAttrezzi(selected);
            navigate("dashboard");
          }}
        />
      </AppLayout>
    );
  }

  const renderContent = () => {
    if (showGuide) {
      return <GuideView onBack={() => setShowGuide(false)} />;
    }

    switch (view) {
      case "dashboard":
        return (
          <Dashboard
            piano={cloud.piano}
            livello={cloud.livello}
            onGeneraNuova={() => generaNuovaSettimana()}
            onAvviaAllenamento={avviaAllenamento}
            onChangeLivello={changeLivello}
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
        return <ExerciseLibrary onBack={() => navigate("dashboard")} />;
      case "profile":
        return <ProfileView profile={cloud.profile} onUpdateProfile={cloud.updateProfile} />;
      case "settings":
        return (
          <SettingsView
            onNavigate={(v) => {
              if (v === "guide") setShowGuide(true);
              else navigate(v as AppView);
            }}
            onModificaAttrezzi={() => navigate("equipment")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AppLayout currentView={view} onNavigate={navigate} profile={cloud.profile} userName={userName}>
      {renderContent()}
    </AppLayout>
  );
};

export default Index;
