import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface NotificationSettings {
  notifiche_abilitate: boolean;
  notifica_orario: string;
  fuso_orario: string;
}

// Convert base64url string to Uint8Array for applicationServerKey
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useNotifications(
  giorniAllenamento: number[],
  storicoCal: Record<string, any>
) {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [settings, setSettings] = useState<NotificationSettings>({
    notifiche_abilitate: false,
    notifica_orario: "09:00",
    fuso_orario: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Rome",
  });
  const [showInAppReminder, setShowInAppReminder] = useState(false);
  const vapidKeyRef = useRef<string | null>(null);

  // Load settings from DB
  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_settings")
      .select("notifiche_abilitate, notifica_orario, fuso_orario")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setSettings({
            notifiche_abilitate: data.notifiche_abilitate || false,
            notifica_orario: data.notifica_orario || "09:00",
            fuso_orario: data.fuso_orario || Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Rome",
          });
        }
      });
  }, [user]);

  // Get VAPID public key (requires authenticated user)
  const getVapidKey = useCallback(async (): Promise<string | null> => {
    if (vapidKeyRef.current) return vapidKeyRef.current;
    try {
      const { data, error } = await supabase.functions.invoke("generate-vapid", {
        body: {},
      });
      if (error) {
        console.error("generate-vapid error:", error);
        return null;
      }
      if (data?.publicKey) {
        vapidKeyRef.current = data.publicKey;
        return data.publicKey;
      }
    } catch (e) {
      console.error("Failed to get VAPID key:", e);
    }
    return null;
  }, []);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Le notifiche push non sono supportate da questo browser.");
      return false;
    }

    try {
      const vapidKey = await getVapidKey();
      if (!vapidKey) {
        toast.error("Impossibile recuperare la chiave di notifica. Riprova.");
        return false;
      }

      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed; if VAPID key changed, resubscribe
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const applicationServerKey = urlBase64ToUint8Array(vapidKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
        });
      }

      const subJson = subscription.toJSON();
      if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
        toast.error("Iscrizione notifiche non valida.");
        return false;
      }

      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: user.id,
          endpoint: subJson.endpoint,
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
        } as any,
        { onConflict: "user_id,endpoint" }
      );
      if (error) {
        console.error("Save subscription failed:", error);
        toast.error("Errore nel salvataggio delle notifiche.");
        return false;
      }
      return true;
    } catch (e: any) {
      console.error("Push subscription failed:", e);
      toast.error(e?.message?.includes("denied")
        ? "Permesso notifiche negato dal browser."
        : "Iscrizione notifiche fallita.");
      return false;
    }
  }, [user, getVapidKey]);

  // Unsubscribe from push
  const unsubscribeFromPush = useCallback(async () => {
    if (!user || !("serviceWorker" in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("user_id", user.id)
          .eq("endpoint", endpoint);
      }
    } catch (e) {
      console.error("Push unsubscribe failed:", e);
    }
  }, [user]);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return "denied" as NotificationPermission;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  // Save settings
  const updateSettings = useCallback(
    async (updates: Partial<NotificationSettings>) => {
      if (!user) return;
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await supabase
        .from("user_settings")
        .update({
          notifiche_abilitate: newSettings.notifiche_abilitate,
          notifica_orario: newSettings.notifica_orario,
          fuso_orario: newSettings.fuso_orario,
        })
        .eq("user_id", user.id);
    },
    [user, settings]
  );

  // Toggle notifications - optimistic UI + graceful fallback
  const toggleNotifications = useCallback(
    async (enabled: boolean) => {
      // Optimistic UI update so the switch always responds
      setSettings((s) => ({ ...s, notifiche_abilitate: enabled }));

      if (enabled) {
        // Check browser support
        if (typeof Notification === "undefined") {
          toast.error("Questo browser non supporta le notifiche.");
          setSettings((s) => ({ ...s, notifiche_abilitate: false }));
          return;
        }

        // Request OS permission (must run in user gesture)
        let perm: NotificationPermission = Notification.permission;
        if (perm === "default") {
          try {
            perm = await Notification.requestPermission();
            setPermission(perm);
          } catch (e) {
            console.error("requestPermission failed:", e);
          }
        }

        if (perm !== "granted") {
          toast.error(
            perm === "denied"
              ? "Permesso negato. Attiva le notifiche dalle impostazioni del browser/sistema."
              : "Permesso notifiche non concesso."
          );
          setSettings((s) => ({ ...s, notifiche_abilitate: false }));
          return;
        }

        // Persist setting first so the toggle stays on even if push subscription is slow/unavailable
        await updateSettings({ notifiche_abilitate: true });

        // Try subscribing to push in background (non-blocking for the toggle)
        const ok = await subscribeToPush();
        if (ok) {
          toast.success("Notifiche attivate ✓");
        } else {
          toast.message("Notifiche locali attive. Push non disponibile su questo dispositivo.");
        }
      } else {
        await updateSettings({ notifiche_abilitate: false });
        unsubscribeFromPush().catch((e) => console.error("unsubscribe error:", e));
        toast.success("Notifiche disattivate");
      }
    },
    [updateSettings, subscribeToPush, unsubscribeFromPush]
  );

  // Auto-subscribe if notifications are already enabled
  useEffect(() => {
    if (settings.notifiche_abilitate && permission === "granted" && user) {
      subscribeToPush();
    }
  }, [settings.notifiche_abilitate, permission, user]);

  // Check if today is a training day and workout not done
  const isTodayTrainingDay = useCallback(() => {
    const today = new Date();
    const dow = today.getDay();
    if (!giorniAllenamento.includes(dow)) return false;

    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return !storicoCal[key]?.completato;
  }, [giorniAllenamento, storicoCal]);

  // Schedule local notification (fallback when app is open)
  useEffect(() => {
    if (!settings.notifiche_abilitate || permission !== "granted") return;
    if (!isTodayTrainingDay()) return;

    const [hours, minutes] = settings.notifica_orario.split(":").map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    const diff = target.getTime() - now.getTime();

    if (diff > 0 && diff < 12 * 60 * 60 * 1000) {
      const timer = setTimeout(() => {
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification("🏋️ Allenamento di oggi", {
              body: "Hai un allenamento programmato per oggi! Apri l'app per iniziare.",
              icon: "/pwa-192x192.png",
              badge: "/pwa-192x192.png",
              tag: "workout-reminder",
            });
          });
        } else if (typeof Notification !== "undefined") {
          new Notification("🏋️ Allenamento di oggi", {
            body: "Hai un allenamento programmato per oggi! Apri l'app per iniziare.",
            icon: "/pwa-192x192.png",
            tag: "workout-reminder",
          });
        }
      }, diff);
      return () => clearTimeout(timer);
    }
  }, [settings, permission, isTodayTrainingDay]);

  // In-app reminder check
  useEffect(() => {
    if (isTodayTrainingDay()) {
      setShowInAppReminder(true);
    }
  }, [isTodayTrainingDay]);

  const dismissReminder = useCallback(() => setShowInAppReminder(false), []);

  return {
    permission,
    settings,
    showInAppReminder,
    toggleNotifications,
    updateSettings,
    dismissReminder,
    requestPermission,
  };
}
