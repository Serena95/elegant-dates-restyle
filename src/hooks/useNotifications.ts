import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface NotificationSettings {
  notifiche_abilitate: boolean;
  notifica_orario: string;
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
  });
  const [showInAppReminder, setShowInAppReminder] = useState(false);

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
      }
      await updateSettings({ notifiche_abilitate: enabled });
    },
    [requestPermission, updateSettings]
  );

  // Check if today is a training day and workout not done
  const isTodayTrainingDay = useCallback(() => {
    const today = new Date();
    const dow = today.getDay();
    if (!giorniAllenamento.includes(dow)) return false;

    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return !storicoCal[key]?.completato;
  }, [giorniAllenamento, storicoCal]);

  // Schedule local notification
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
              renotify: true,
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
