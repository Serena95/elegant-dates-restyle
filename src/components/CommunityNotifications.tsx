import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Heart, MessageCircle, Trophy, Loader2, ArrowLeft, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchNotifications, markNotificationsRead } from "@/services/supabase/communityService";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface CommunityNotificationsProps {
  onBack: () => void;
}

const NOTIF_ICONS: Record<string, { icon: typeof Heart; color: string }> = {
  like: { icon: Heart, color: "text-red-500" },
  comment: { icon: MessageCircle, color: "text-primary" },
  leaderboard: { icon: Trophy, color: "text-amber-500" },
};

const NOTIF_TEXT: Record<string, string> = {
  like: "ha messo ❤️ al tuo post",
  comment: "ha commentato il tuo post",
  leaderboard: "Sei entrato nella Top 10! 🏆",
};

export function CommunityNotifications({ onBack }: CommunityNotificationsProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchNotifications(user.id).then(data => {
      setNotifications(data);
      setLoading(false);
      markNotificationsRead(user.id);
    });
  }, [user]);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={22} className="text-primary" />
          <h2 className="text-xl font-bold text-foreground">Notifiche</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={16} />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-10">
          Nessuna notifica 📭
        </p>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((notif, i) => {
              const config = NOTIF_ICONS[notif.type] || NOTIF_ICONS.like;
              const Icon = config.icon;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className={notif.read ? "opacity-60" : ""}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-muted ${config.color}`}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          <span className="font-bold">{notif.from_display_name}</span>{" "}
                          {NOTIF_TEXT[notif.type] || notif.type}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: it })}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
