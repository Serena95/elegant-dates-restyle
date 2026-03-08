import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePremium } from "@/hooks/usePremium";
import { FITNESS_CHALLENGES, FitnessChallenge } from "@/data/challenges";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Crown, Trophy, Play, CheckCircle, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ChallengeParticipation {
  challenge_id: string;
  completed_days: number;
  last_completed_date: string | null;
  completed: boolean;
  start_date: string;
}

interface ChallengesViewProps {
  onBack?: () => void;
}

export function ChallengesView({ onBack }: ChallengesViewProps) {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const [participations, setParticipations] = useState<ChallengeParticipation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadParticipations();
  }, [user]);

  const loadParticipations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("challenge_participations")
      .select("challenge_id, completed_days, last_completed_date, completed, start_date")
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
    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("challenge_participations").upsert({
      user_id: user.id,
      challenge_id: challenge.id,
      start_date: today,
      completed_days: 0,
      completed: false,
    }, { onConflict: "user_id,challenge_id" });

    if (error) {
      toast.error("Errore nell'iscrizione alla challenge");
    } else {
      toast.success(`Iscritto a "${challenge.title}"!`);
      loadParticipations();
    }
  };

  const completeDay = async (challengeId: string) => {
    if (!user) return;
    const p = participations.find(pp => pp.challenge_id === challengeId);
    const challenge = FITNESS_CHALLENGES.find(c => c.id === challengeId);
    if (!p || !challenge) return;

    const today = new Date().toISOString().split("T")[0];
    if (p.last_completed_date === today) {
      toast.info("Hai già completato la challenge oggi!");
      return;
    }

    const newDays = p.completed_days + 1;
    const isCompleted = newDays >= challenge.durationDays;

    const { error } = await supabase
      .from("challenge_participations")
      .update({
        completed_days: newDays,
        last_completed_date: today,
        completed: isCompleted,
      })
      .eq("user_id", user.id)
      .eq("challenge_id", challengeId);

    if (!error) {
      if (isCompleted) {
        toast.success(`🎉 Hai completato "${challenge.title}"!`);
      } else {
        toast.success(`Giorno ${newDays}/${challenge.durationDays} completato!`);
      }
      loadParticipations();
    }
  };

  const getParticipation = (id: string) => participations.find(p => p.challenge_id === id);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Challenge Fitness</h2>
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>Indietro</Button>
        )}
      </div>

      <div className="space-y-4">
        {FITNESS_CHALLENGES.map((challenge, i) => {
          const participation = getParticipation(challenge.id);
          const isJoined = !!participation;
          const isLocked = challenge.premium && !isPremium;
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
              <Card className={`relative overflow-hidden ${participation?.completed ? "border-green-500/30" : isLocked ? "opacity-70" : ""}`}>
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
                      <h3 className="font-bold text-sm">{challenge.title}</h3>
                      <p className="text-xs text-muted-foreground">{challenge.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {challenge.durationDays} giorni · Focus: {challenge.focus}
                      </p>
                    </div>
                  </div>

                  {isJoined && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">
                          Giorno {participation!.completed_days} / {challenge.durationDays}
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

                  <div className="flex gap-2">
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
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => completeDay(challenge.id)}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completa Giorno {participation!.completed_days + 1}
                      </Button>
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
    </div>
  );
}
