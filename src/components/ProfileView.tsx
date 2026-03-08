import { useState, useRef, useEffect } from "react";
import { Camera, User, Dumbbell, BarChart3, Zap, Crown, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProfileData } from "@/hooks/useCloudData";
import { BadgeDisplay } from "./BadgeDisplay";
import { Badge } from "@/hooks/useBadges";
import { ATTREZZO_ICONS } from "@/data/exercises";
import { getLevelInfo, LEVELS } from "@/services/xpService";
import { Progress } from "@/components/ui/progress";

interface ProfileViewProps {
  profile: ProfileData;
  onUpdateProfile: (updates: Partial<ProfileData>) => Promise<void>;
  unlockedBadges?: Badge[];
  livello?: string;
  attrezzi?: string[];
  totalWorkouts?: number;
}

export function ProfileView({ profile, onUpdateProfile, unlockedBadges = [], livello, attrezzi = [], totalWorkouts = 0 }: ProfileViewProps) {
  const { user, isAdmin } = useAuth();
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [xpData, setXpData] = useState<{ xp: number; level: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("xp, level").eq("user_id", user.id).single().then(({ data }) => {
      if (data) setXpData({ xp: data.xp ?? 0, level: data.level ?? 1 });
    });
  }, [user]);

  const levelInfo = xpData ? getLevelInfo(xpData.xp) : null;
  const isGoogleAvatar = avatarUrl?.startsWith("http");
  const badgeColor = livello === "BASSO" ? "bg-pilates-green" : livello === "AVANZATO" ? "bg-pilates-red" : "bg-primary";

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateProfile({ display_name: displayName, avatar_url: avatarUrl });
      if (newEmail !== user?.email && newEmail.trim()) {
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        if (error) throw error;
        toast.success("Profilo aggiornato! Controlla la nuova email per la conferma.");
      } else {
        toast.success("Profilo aggiornato!");
      }
    } catch (err: any) {
      toast.error(err.message || "Errore nel salvataggio");
    }
    setSaving(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Immagine troppo grande (max 2MB)"); return; }
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 200; canvas.height = 200;
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2, sy = (img.height - size) / 2;
      ctx?.drawImage(img, sx, sy, size, size, 0, 0, 200, 200);
      setAvatarUrl(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">👤 Profilo</h2>

      {/* Admin + Premium Badge */}
      {isAdmin && (
        <div className="flex items-center justify-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Admin</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <Crown className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-purple-700 dark:text-purple-400">Premium Lifetime</span>
          </div>
        </div>
      )}

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center border-4 border-primary/20">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User size={40} className="text-muted-foreground" />
            )}
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
            <Camera size={14} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
        </div>
        {isGoogleAvatar && <p className="text-xs text-muted-foreground">Foto da Google • Clicca 📷 per cambiarla</p>}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-2xl border border-border p-3 text-center">
          <BarChart3 size={18} className="text-primary mx-auto mb-1" />
          <p className="text-lg font-black text-foreground">{totalWorkouts}</p>
          <p className="text-[10px] text-muted-foreground font-bold uppercase">Allenamenti</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-3 text-center">
          <span className={`inline-block ${badgeColor} text-primary-foreground px-2 py-0.5 rounded-full text-[10px] font-bold`}>
            {livello || "MEDIO"}
          </span>
          <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Livello</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-3 text-center">
          <Dumbbell size={18} className="text-primary mx-auto mb-1" />
          <p className="text-lg font-black text-foreground">{attrezzi.length}</p>
          <p className="text-[10px] text-muted-foreground font-bold uppercase">Attrezzi</p>
        </div>
      </div>

      {/* XP & Level */}
      {levelInfo && (
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{levelInfo.current.icon}</span>
              <div>
                <p className="font-bold text-foreground">Lv.{levelInfo.current.level} {levelInfo.current.name}</p>
                <p className="text-xs text-muted-foreground">{xpData!.xp} XP totali</p>
              </div>
            </div>
            <Zap size={20} className="text-amber-500" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Progresso</span>
              <span>{levelInfo.next ? `${xpData!.xp} / ${levelInfo.next.minXp} XP` : "MAX"}</span>
            </div>
            <Progress value={levelInfo.progressToNext * 100} className="h-2" />
          </div>
          <div className="flex gap-1.5 justify-center overflow-x-auto pb-1 -mx-1 px-1">
            {LEVELS.map(l => (
              <div
                key={l.level}
                className={`text-center px-2 py-1 rounded-lg text-[10px] flex-shrink-0 ${l.level <= levelInfo.current.level ? "bg-primary/10 font-bold" : "bg-muted/50 text-muted-foreground"}`}
              >
                <span className="text-sm">{l.icon}</span>
                <p className="whitespace-nowrap">{l.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipment list */}
      {attrezzi.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wide">🏋️ I tuoi Attrezzi</h3>
          <div className="flex flex-wrap gap-2">
            {attrezzi.map(a => (
              <span key={a} className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                {ATTREZZO_ICONS[a] || "🏋️"} {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Badges */}
      <BadgeDisplay unlockedBadges={unlockedBadges} />

      {/* Info fields */}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Nome</label>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full p-3 rounded-xl border border-border bg-card text-foreground" placeholder="Il tuo nome" />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Email</label>
          <input value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full p-3 rounded-xl border border-border bg-card text-foreground" placeholder="La tua email" type="email" />
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg disabled:opacity-50 transition">
        {saving ? "Salvataggio..." : "SALVA MODIFICHE"}
      </button>
    </div>
  );
}
