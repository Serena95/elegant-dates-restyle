import { useState, useEffect } from "react";
import { healthService, HealthData } from "@/services/healthService";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Footprints, Flame, MapPin, Timer, RefreshCw, Smartphone } from "lucide-react";

export function HealthIntegration() {
  const isNative = healthService.isAvailable();
  const platform = healthService.getPlatform();
  const [connected, setConnected] = useState(healthService.isConnected());
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const granted = await healthService.requestAuthorization();
      setConnected(granted);
      if (granted) {
        toast.success(platform === "ios" ? "Apple Health connesso!" : "Google Fit connesso!");
        await refreshData();
      } else {
        toast.error("Autorizzazione negata. Controlla le impostazioni del telefono.");
      }
    } catch {
      toast.error("Errore nella connessione");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    const result = await healthService.getTodayData();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    if (connected) refreshData();
  }, [connected]);

  // Web mode: show info card
  if (!isNative) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-emerald-500" />
          <h3 className="text-base font-bold text-foreground">Salute & Fitness</h3>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-2xl border border-emerald-500/15 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
              <Smartphone size={24} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Google Fit & Apple Health</p>
              <p className="text-xs text-muted-foreground">Disponibile nell'app nativa</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Installa l'app nativa sul tuo telefono per sincronizzare passi, calorie e allenamenti 
            con Google Fit (Android) o Apple Health (iPhone).
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="bg-card/60 rounded-xl p-3 text-center">
              <span className="text-lg">🍎</span>
              <p className="text-[10px] font-bold text-muted-foreground mt-1">Apple Health</p>
            </div>
            <div className="bg-card/60 rounded-xl p-3 text-center">
              <span className="text-lg">💚</span>
              <p className="text-[10px] font-bold text-muted-foreground mt-1">Google Fit</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Native mode: full integration
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-emerald-500" />
          <h3 className="text-base font-bold text-foreground">
            {platform === "ios" ? "Apple Health" : "Google Fit"}
          </h3>
        </div>
        {connected && (
          <button onClick={refreshData} disabled={loading} className="p-2 rounded-xl hover:bg-muted transition">
            <RefreshCw size={16} className={`text-muted-foreground ${loading ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>

      {!connected ? (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleConnect}
          disabled={loading}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-emerald-500/20 text-left transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
              <Activity size={22} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {loading ? "Connessione..." : `Connetti ${platform === "ios" ? "Apple Health" : "Google Fit"}`}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Sincronizza passi, calorie e allenamenti
              </p>
            </div>
          </div>
        </motion.button>
      ) : (
        <AnimatePresence>
          {data && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-2"
            >
              <StatCard icon={Footprints} label="Passi" value={data.steps.toLocaleString()} color="text-blue-500" bg="bg-blue-500/10" />
              <StatCard icon={Flame} label="Calorie" value={`${data.calories} kcal`} color="text-orange-500" bg="bg-orange-500/10" />
              <StatCard icon={MapPin} label="Distanza" value={`${(data.distance / 1000).toFixed(1)} km`} color="text-emerald-500" bg="bg-emerald-500/10" />
              <StatCard icon={Timer} label="Allenamento" value={`${data.workoutMinutes} min`} color="text-violet-500" bg="bg-violet-500/10" />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {connected && data?.lastSync && (
        <p className="text-[10px] text-muted-foreground text-center">
          Ultimo aggiornamento: {new Date(data.lastSync).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
        </p>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: { icon: React.ElementType; label: string; value: string; color: string; bg: string }) {
  return (
    <div className={`${bg} rounded-2xl p-3.5 border border-border/50`}>
      <Icon size={16} className={color} />
      <p className="text-lg font-black text-foreground mt-1">{value}</p>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}
