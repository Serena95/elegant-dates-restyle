import { useState, useRef } from "react";
import { Camera, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProfileData } from "@/hooks/useCloudData";
import { BadgeDisplay } from "./BadgeDisplay";
import { Badge } from "@/hooks/useBadges";

interface ProfileViewProps {
  profile: ProfileData;
  onUpdateProfile: (updates: Partial<ProfileData>) => Promise<void>;
  unlockedBadges?: Badge[];
}

export function ProfileView({ profile, onUpdateProfile, unlockedBadges = [] }: ProfileViewProps) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGoogleAvatar = avatarUrl?.startsWith("http");

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
