import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PremiumStatus {
  isPremium: boolean;
  premiumExpires: string | null;
  loading: boolean;
  checkSubscription: () => Promise<void>;
}

// Admin users always have premium - this is an additional safety net

export function usePremium(): PremiumStatus {
  const { user, isAdmin } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpires, setPremiumExpires] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setIsPremium(false);
      setPremiumExpires(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;

      setIsPremium(data?.subscribed === true);
      setPremiumExpires(data?.subscription_end || null);
    } catch (e) {
      console.error("Error checking subscription:", e);
      // Fallback to DB check
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
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  return { isPremium, premiumExpires, loading, checkSubscription };
}
