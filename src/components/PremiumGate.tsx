import { ReactNode } from "react";
import { usePremium } from "@/hooks/usePremium";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PremiumGateProps {
  children: ReactNode;
  feature?: string;
  onUpgrade?: () => void;
}

export function PremiumGate({ children, feature = "questa funzionalità", onUpgrade }: PremiumGateProps) {
  const { isPremium, loading } = usePremium();

  if (loading) return <>{children}</>;
  if (isPremium) return <>{children}</>;

  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-yellow-500/5">
      <CardContent className="p-6 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center">
          <Lock className="w-6 h-6 text-amber-500" />
        </div>
        <h3 className="font-bold text-sm">Funzionalità Premium</h3>
        <p className="text-xs text-muted-foreground">
          Sblocca {feature} con il piano Premium
        </p>
        {onUpgrade && (
          <Button
            size="sm"
            onClick={onUpgrade}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
          >
            <Crown className="w-4 h-4 mr-1" /> Passa a Premium
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
