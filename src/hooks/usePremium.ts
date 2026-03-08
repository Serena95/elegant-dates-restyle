import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PremiumStatus {
  isPremium: boolean;
  premiumExpires: string | null;
  loading: boolean;
}

export function usePremium(): PremiumStatus {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpires, setPremiumExpires] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsPremium(false);
      setPremiumExpires(null);
      setLoading(false);
      return;
    }

    const fetchPremium = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("premium, premium_expires")
        .eq("user_id", user.id)
        .single();

      if (data) {
        const now = new Date();
        const expired = data.premium_expires && new Date(data.premium_expires) < now;
        setIsPremium(data.premium === true && !expired);
        setPremiumExpires(data.premium_expires);
      }
      setLoading(false);
    };

    fetchPremium();
  }, [user]);

  return { isPremium, premiumExpires, loading };
}
