import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePremium } from "@/hooks/usePremium";
import { FITNESS_CHALLENGES, FitnessChallenge } from "@/data/challenges";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar as CalendarIcon, Crown, Trophy, Play, CheckCircle, Lock, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO, startOfDay } from "date-fns";
import { it } from "date-fns/locale";

interface ChallengeParticipation {
  challenge_id: string;
  completed_days: number;
  last_completed_date: string | null;
  completed: boolean;
  start_date: string;
  completed_dates?: string[];
}

interface ChallengesViewProps {
  onBack?: () => void;
  activeChallenge?: { id: string; name: string } | null;
  onStartChallenge?: (id: string, name: string) => void;
  onCancelChallenge?: () => void;
}

const toDateKey = (date: Date) => format(date, "yyyy-MM-dd");

export function ChallengesView({ onBack, activeChallenge, onStartChallenge, onCancelChallenge }: ChallengesViewProps) {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const [participations, setParticipations] = useState<ChallengeParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarChallengeId, setCalendarChallengeId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [savingRetroactive, setSavingRetroactive] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadParticipations();
  }, [user]);

  const loadParticipations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("challenge_participations")
      .select("challenge_id, completed_days, last_completed_date, completed, start_date, completed_dates")
      .eq("user_id", user.id);
    setParticipations(data || []);
    setLoading(false);
  };

  const joinChallenge = async (challenge: FitnessChallenge) => {
    if (!user) return;
    if (challenge.premium && !isPremium) {
      toast.error("Questa challenge è riservata agli utenti Premium");
      return;
    }
    const today = toDateKey(new Date());
    const { error } = await supabase.from("challenge_participations").upsert({
      user_id: user.id,
      challenge_id: challenge.id,
      start_date: today,
      completed_days: 0,
      completed: false,
      completed_dates: [],
    }, { onConflict: "user_id,challenge_id" });

    if (error) {
      toast.error("Errore nell'iscrizione alla challenge");
    } else {
      toast.success(`Iscritto a "${challenge.title}"!`);
      onStartChallenge?.(challenge.id, challenge.title);
      loadParticipations();
    }
  };

  const cancelChallenge = async (challengeId: string) => {
    if (!user) return;
    await supabase
      .from("challenge_participations")
      .delete()
      .eq("user_id", user.id)
      .eq("challenge_id", challengeId);
    onCancelChallenge?.();
    loadParticipations();
    toast.success("Challenge annullata");
  };

  const syncParticipationDates = async (challengeId: string, dates: string[]) => {
    if (!user) {
      return { error: new Error("Utente non autenticato"), completedDays: 0, isCompleted: false };
    }

    const challenge = FITNESS_CHALLENGES.find(c => c.id === challengeId);
    if (!challenge) {
      return { error: new Error("Challenge non trovata"), completedDays: 0, isCompleted: false };
    }

    const sortedDates = [...new Set(dates)].sort();
    const completedDays = sortedDates.length;
    const isCompleted = completedDays >= challenge.durationDays;
    const lastCompletedDate = sortedDates.at(-1) ?? null;

    const { error } = await supabase
      .from("challenge_participations")
      .update({
        completed_dates: sortedDates,
        completed_days: completedDays,
        last_completed_date: lastCompletedDate,
        completed: isCompleted,
      })
      .eq("user_id", user.id)
      .eq("challenge_id", challengeId);

    return { error, completedDays, isCompleted };
  };

  const completeDay = async (challengeId: string) => {
    if (!user) return;
    const p = participations.find(pp => pp.challenge_id === challengeId);
    const challenge = FITNESS_CHALLENGES.find(c => c.id === challengeId);
    if (!p || !challenge) return;

    const today = toDateKey(new Date());
    const completedDates = p.completed_dates || [];
    if (completedDates.includes(today)) {
      toast.info("Hai già completato la challenge oggi!");
      return;
    }

    const { error, completedDays, isCompleted } = await syncParticipationDates(challengeId, [...completedDates, today]);

    if (!error) {
      if (isCompleted) {
        toast.success(`🎉 Hai completato "${challenge.title}"!`);
        onCancelChallenge?.();
      } else {
        toast.success(`Giorno ${completedDays}/${challenge.durationDays} completato!`);
      }
      loadParticipations();
    }
  };

  const saveRetroactiveDay = async () => {
    if (!calendarChallengeId || !selectedDate) return;
    const participation = participations.find(p => p.challenge_id === calendarChallengeId);
    const challenge = FITNESS_CHALLENGES.find(c => c.id === calendarChallengeId);
    if (!participation || !challenge) return;

    const dateKey = toDateKey(selectedDate);
    const today = toDateKey(new Date());
    const startDate = participation.start_date;
    const existingDates = participation.completed_dates || [];

    if (dateKey < startDate) {
      toast.error("Puoi segnare solo dal giorno di inizio challenge in poi");
      return;
    }

    if (dateKey > today) {
      toast.error("Non puoi segnare giorni futuri");
      return;
    }

    if (existingDates.includes(dateKey)) {
      toast.info("Questo giorno è già registrato");
      return;
    }

    setSavingRetroactive(true);
    const { error, completedDays, isCompleted } = await syncParticipationDates(calendarChallengeId, [...existingDates, dateKey]);
    setSavingRetroactive(false);

    if (error) {
      toast.error("Errore nel salvataggio del giorno");
      return;
    }

    if (isCompleted) {
      toast.success(`🎉 Hai completato "${challenge.title}"!`);
      onCancelChallenge?.();
    } else {
      toast.success(`Registrato il ${format(selectedDate, "d MMMM", { locale: it })} · ${completedDays}/${challenge.durationDays}`);
    }

    setCalendarChallengeId(null);
    setSelectedDate(undefined);
    loadParticipations();
  };

  const getParticipation = (id: string) => participations.find(p => p.challenge_id === id);
  const activeCalendarParticipation = useMemo(
    () => participations.find(p => p.challenge_id === calendarChallengeId),
    [calendarChallengeId, participations],
  );
  const selectedChallenge = useMemo(
    () => FITNESS_CHALLENGES.find(c => c.id === calendarChallengeId),
    [calendarChallengeId],
  );
  const completedDateObjects = useMemo(
    () => (activeCalendarParticipation?.completed_dates || []).map((date) => parseISO(`${date}T00:00:00`)),
    [activeCalendarParticipation],
  );
  const calendarDisabled = useMemo(() => {
    if (!activeCalendarParticipation) return [(date: Date) => true];
    const start = startOfDay(parseISO(`${activeCalendarParticipation.start_date}T00:00:00`));
    const today = startOfDay(new Date());
    return [
      (date: Date) => startOfDay(date) < start || startOfDay(date) > today,
    ];
  }, [activeCalendarParticipation]);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Challenge Fitness</h2>
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>Indietro</Button>
        )}
      </div>

      {activeChallenge && (
        <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-primary uppercase">Challenge Attiva</p>
            <p className="text-sm font-bold text-foreground mt-1 truncate">{activeChallenge.name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => cancelChallenge(activeChallenge.id)} className="text-destructive hover:text-destructive">
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {FITNESS_CHALLENGES.map((challenge, i) => {
          const participation = getParticipation(challenge.id);
          const isJoined = !!participation;
          const isLocked = challenge.premium && !isPremium;
          const isActive = activeChallenge?.id === challenge.id;
          const progress = participation
            ? (participation.completed_days / challenge.durationDays) * 100
            : 0;

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`relative overflow-hidden ${participation?.completed ? "border-green-500/30" : isActive ? "border-primary/40" : isLocked ? "opacity-70" : ""}`}>
                {isLocked && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="flex items-center gap-1 bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full text-xs font-medium">
                      <Crown className="w-3 h-3" />
                      Premium
                    </div>
                  </div>
                )}
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{challenge.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm">{challenge.title}</h3>
                        {isActive && (
                          <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">ATTIVA</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{challenge.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {challenge.durationDays} giorni · Focus: {challenge.focus}
                      </p>
                    </div>
                  </div>

                  {isJoined && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs gap-3">
                        <span className="font-medium">
                          Giorni completati {participation!.completed_days} / {challenge.durationDays}
                        </span>
                        {participation!.completed && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-3 h-3" /> Completata!
                          </span>
                        )}
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {!isJoined && (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => joinChallenge(challenge)}
                        disabled={isLocked}
                      >
                        {isLocked ? (
                          <><Lock className="w-3 h-3 mr-1" /> Sblocca con Premium</>
                        ) : (
                          <><Play className="w-3 h-3 mr-1" /> Inizia Challenge</>
                        )}
                      </Button>
                    )}
                    {isJoined && !participation!.completed && (
                      <div className="flex gap-2 w-full flex-wrap sm:flex-nowrap">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => completeDay(challenge.id)}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Oggi
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setCalendarChallengeId(challenge.id);
                            setSelectedDate(undefined);
                          }}
                        >
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          Calendario
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => cancelChallenge(challenge.id)}
                        >
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    {isJoined && participation!.completed && (
                      <Button size="sm" variant="outline" className="w-full" disabled>
                        <Trophy className="w-3 h-3 mr-1" /> Challenge Completata
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={!!calendarChallengeId} onOpenChange={(open) => {
        if (!open) {
          setCalendarChallengeId(null);
          setSelectedDate(undefined);
        }
      }}>
        <DialogContent className="max-w-[calc(100vw-24px)] sm:max-w-md p-4">
          <DialogHeader>
            <DialogTitle>Calendario challenge</DialogTitle>
            <DialogDescription>
              Seleziona un giorno precedente o di oggi per registrare il completamento manualmente.
            </DialogDescription>
          </DialogHeader>

          {activeCalendarParticipation && selectedChallenge && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-sm font-semibold text-foreground">{selectedChallenge.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Iniziata il {format(parseISO(`${activeCalendarParticipation.start_date}T00:00:00`), "d MMM yyyy", { locale: it })}
                </p>
              </div>

              <div className="flex justify-center overflow-x-auto">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={it}
                  disabled={calendarDisabled}
                  modifiers={{ completed: completedDateObjects }}
                  modifiersClassNames={{ completed: "bg-primary text-primary-foreground rounded-md" }}
                  className="rounded-md border border-border"
                />
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                {selectedDate
                  ? `Giorno selezionato: ${format(selectedDate, "EEEE d MMMM yyyy", { locale: it })}`
                  : "Seleziona una data dal calendario completo."}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCalendarChallengeId(null);
              setSelectedDate(undefined);
            }}>
              Annulla
            </Button>
            <Button onClick={saveRetroactiveDay} disabled={!selectedDate || savingRetroactive}>
              {savingRetroactive ? "Salvataggio..." : "Salva giorno"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}