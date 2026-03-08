import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePremium } from "@/hooks/usePremium";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check, Sparkles, Loader2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const FEATURES_FREE = [
  "Allenamenti base",
  "Libreria esercizi",
  "Statistiche base",
  "Monitoraggio ciclo",
];

const FEATURES_PREMIUM = [
  "AI Coach avanzato",
  "Programmi allenamento completi",
  "Statistiche avanzate con grafici",
  "Challenge avanzate",
  "Workout illimitati",
  "Supporto prioritario",
];

interface PremiumViewProps {
  onNavigate?: (view: string) => void;
}

export function PremiumView({ onNavigate }: PremiumViewProps) {
  const { user, isAdmin } = useAuth();
  const { isPremium, premiumExpires, loading, checkSubscription } = usePremium();
  const [checkingOut, setCheckingOut] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Devi effettuare il login per abbonarti");
      return;
    }
    setCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast.error("Errore durante il checkout: " + (e.message || "Riprova"));
    } finally {
      setCheckingOut(false);
    }
  };

  const handleManageSubscription = async () => {
    setOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast.error("Errore: " + (e.message || "Nessun abbonamento attivo trovato"));
    } finally {
      setOpeningPortal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30"
        >
          <Crown className="w-5 h-5 text-amber-500" />
          <span className="font-semibold text-amber-700 dark:text-amber-400">Premium</span>
        </motion.div>
        <h2 className="text-2xl font-bold">Sblocca tutto il potenziale</h2>
        <p className="text-muted-foreground text-sm">
          Allenamenti personalizzati con AI Coach, statistiche avanzate e molto altro
        </p>
      </div>

      {isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-yellow-500/5">
            <CardContent className="p-4 text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  {isAdmin ? "Premium Lifetime (Admin)" : "Sei Premium!"}
                </span>
              </div>
              {premiumExpires && (
                <p className="text-xs text-muted-foreground">
                  Scade il: {new Date(premiumExpires).toLocaleDateString("it-IT")}
                </p>
              )}
              {!isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManageSubscription}
                  disabled={openingPortal}
                  className="mt-2"
                >
                  {openingPortal ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <ExternalLink className="w-4 h-4 mr-1" />}
                  Gestisci abbonamento
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-4">
        {/* Free Plan */}
        <Card className={`transition-all ${!isPremium ? "border-primary/30 ring-2 ring-primary/20" : ""}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Piano Free</span>
              {!isPremium && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Il tuo piano</span>
              )}
            </CardTitle>
            <p className="text-2xl font-bold">€0<span className="text-sm font-normal text-muted-foreground">/mese</span></p>
          </CardHeader>
          <CardContent className="space-y-2">
            {FEATURES_FREE.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card className={`transition-all ${isPremium ? "border-amber-500/30 ring-2 ring-amber-500/20" : ""}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Piano Premium
              </span>
              {isPremium && (
                <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-1 rounded-full">Il tuo piano</span>
              )}
            </CardTitle>
            <p className="text-2xl font-bold">€9.99<span className="text-sm font-normal text-muted-foreground">/mese</span></p>
          </CardHeader>
          <CardContent className="space-y-2">
            {FEATURES_FREE.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 shrink-0" />
                <span>{f}</span>
              </div>
            ))}
            {FEATURES_PREMIUM.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-medium">{f}</span>
              </div>
            ))}
            {!isPremium && (
              <Button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full mt-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
              >
                {checkingOut ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Crown className="w-4 h-4 mr-2" />}
                Abbonati a Premium
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Button variant="ghost" size="sm" onClick={() => checkSubscription()} className="w-full text-muted-foreground">
        Aggiorna stato abbonamento
      </Button>
    </div>
  );
}
