import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
      .select("notifiche_abilitate, notifica_orario")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setSettings({
            notifiche_abilitate: (data as any).notifiche_abilitate || false,
            notifica_orario: (data as any).notifica_orario || "09:00",
          });
        }
      });
  }, [user]);

  // Get VAPID public key
  const getVapidKey = useCallback(async (): Promise<string | null> => {
    if (vapidKeyRef.current) return vapidKeyRef.current;
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/generate-vapid`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      if (data.publicKey) {
        vapidKeyRef.current = data.publicKey;
        return data.publicKey;
      }
    } catch (e) {
      console.error("Failed to get VAPID key:", e);
    }
    return null;
  }, []);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async () => {
    if (!user || !("serviceWorker" in navigator) || !("PushManager" in window)) return;

    try {
      const vapidKey = await getVapidKey();
      if (!vapidKey) return;

      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        const applicationServerKey = urlBase64ToUint8Array(vapidKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
        });
      }

      const subJson = subscription.toJSON();
      if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) return;

      // Save subscription to DB
      await supabase.from("push_subscriptions").upsert(
        {
          user_id: user.id,
          endpoint: subJson.endpoint,
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
        } as any,
        { onConflict: "user_id,endpoint" }
      );
    } catch (e) {
      console.error("Push subscription failed:", e);
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
        } as any)
        .eq("user_id", user.id);
    },
    [user, settings]
  );

  // Toggle notifications
  const toggleNotifications = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        const perm = await requestPermission();
        if (perm !== "granted") return;
        await subscribeToPush();
      } else {
        await unsubscribeFromPush();
      }
      await updateSettings({ notifiche_abilitate: enabled });
    },
    [requestPermission, updateSettings, subscribeToPush, unsubscribeFromPush]
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
