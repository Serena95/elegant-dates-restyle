import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useDarkMode } from "@/hooks/useDarkMode";
import { toast } from "sonner";
import {
  LogOut,
  Moon,
  Sun,
  Trash2,
  Mail,
  Lock,
  HelpCircle,
  Shield,
  FileText,
  MessageCircle,
  ChevronRight,
  Settings,
  Wrench,
  Droplets,
  Baby,
  Volume2,
  Download,
} from "lucide-react";

interface SettingsViewProps {
  onNavigate: (view: string) => void;
  onModificaAttrezzi: () => void;
  voiceEnabled?: boolean;
  onToggleVoice?: (enabled: boolean) => void;
}

export function SettingsView({ onNavigate, onModificaAttrezzi, voiceEnabled = true, onToggleVoice }: SettingsViewProps) {
  const { user, signOut } = useAuth();
  const { isDark, toggle } = useDarkMode();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const isStandalone = typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone);

  useEffect(() => {
    const iosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iosDevice && !isStandalone);
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallApp = async () => {
    if (isIOS) { setShowIOSGuide(true); return; }
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.rpc("delete_user_account");
      if (error) throw error;
      await signOut();
      toast.success("Account eliminato con successo");
    } catch (err: any) {
      toast.error(err.message || "Errore nell'eliminazione");
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast.success("Email di conferma inviata al nuovo indirizzo");
      setShowChangeEmail(false);
      setNewEmail("");
    } catch (err: any) {
      toast.error(err.message || "Errore nel cambio email");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim() || newPassword.length < 6) {
      toast.error("La password deve avere almeno 6 caratteri");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password aggiornata con successo");
      setShowChangePassword(false);
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Errore nel cambio password");
    } finally {
      setSaving(false);
    }
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">{title}</h3>
      <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
        {children}
      </div>
    </div>
  );

  const SettingsRow = ({
    icon: Icon,
    label,
    value,
    onClick,
    danger,
  }: {
    icon: React.ElementType;
    label: string;
    value?: string;
    onClick?: () => void;
    danger?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 text-left transition hover:bg-muted/50 ${
        danger ? "text-destructive" : "text-foreground"
      }`}
    >
      <Icon size={18} className={danger ? "text-destructive" : "text-muted-foreground"} />
      <span className="flex-1 text-sm font-medium">{label}</span>
      {value && <span className="text-xs text-muted-foreground">{value}</span>}
      {onClick && <ChevronRight size={16} className="text-muted-foreground" />}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Settings size={24} className="text-primary" />
        <h2 className="text-xl font-bold text-foreground">Impostazioni</h2>
      </div>

      {/* Account */}
      <Section title="Account">
        <SettingsRow icon={Mail} label="Cambia Email" value={user?.email || ""} onClick={() => setShowChangeEmail(true)} />
        <SettingsRow icon={Lock} label="Cambia Password" onClick={() => setShowChangePassword(true)} />
      </Section>

      {/* Preferenze */}
      <Section title="Preferenze App">
        <div className="flex items-center gap-3 p-4">
          {isDark ? <Moon size={18} className="text-muted-foreground" /> : <Sun size={18} className="text-muted-foreground" />}
          <span className="flex-1 text-sm font-medium text-foreground">Modalità {isDark ? "Dark" : "Light"}</span>
          <button
            onClick={toggle}
            className={`w-12 h-7 rounded-full transition-colors relative ${isDark ? "bg-primary" : "bg-muted"}`}
          >
            <span className={`block w-5 h-5 rounded-full bg-card shadow-sm absolute top-1 transition-transform ${isDark ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
        <SettingsRow icon={Wrench} label="Modifica Attrezzi" onClick={onModificaAttrezzi} />
        <div className="flex items-center gap-3 p-4">
          <Volume2 size={18} className="text-muted-foreground" />
          <span className="flex-1 text-sm font-medium text-foreground">Trainer Vocale</span>
          <button
            onClick={() => onToggleVoice?.(!voiceEnabled)}
            className={`w-12 h-7 rounded-full transition-colors relative ${voiceEnabled ? "bg-primary" : "bg-muted"}`}
          >
            <span className={`block w-5 h-5 rounded-full bg-card shadow-sm absolute top-1 transition-transform ${voiceEnabled ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
        <SettingsRow icon={Droplets} label="Monitoraggio Ciclo" onClick={() => onNavigate("cycle")} />
        <SettingsRow icon={Baby} label="Modalità Gravidanza" onClick={() => onNavigate("pregnancy")} />
      </Section>

      {/* Privacy */}
      <Section title="Privacy">
        <SettingsRow icon={Trash2} label="Elimina Account" onClick={() => setShowDelete(true)} danger />
      </Section>

      {/* Supporto */}
      <Section title="Supporto">
        <SettingsRow icon={HelpCircle} label="Guida all'uso" onClick={() => onNavigate("guide")} />
        <SettingsRow icon={MessageCircle} label="Contatta il supporto" onClick={() => window.open("mailto:support@mypilatesplan.app")} />
        <SettingsRow icon={Shield} label="Privacy Policy" onClick={() => {}} />
        <SettingsRow icon={FileText} label="Termini di servizio" onClick={() => {}} />
      </Section>

      {/* Logout */}
      <button
        onClick={signOut}
        className="w-full py-4 rounded-2xl border-2 border-destructive text-destructive font-bold flex items-center justify-center gap-2 hover:bg-destructive/10 transition"
      >
        <LogOut size={18} /> Logout
      </button>

      {/* Change Email Modal */}
      {showChangeEmail && (
        <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-3xl max-w-sm w-[90%] shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">Cambia Email</h3>
            <p className="text-sm text-muted-foreground">Riceverai un'email di conferma al nuovo indirizzo.</p>
            <input
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="Nuova email"
              type="email"
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowChangeEmail(false)} className="flex-1 py-2 rounded-xl bg-muted text-foreground font-bold">Annulla</button>
              <button onClick={handleChangeEmail} disabled={saving} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50">
                {saving ? "..." : "Conferma"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-3xl max-w-sm w-[90%] shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">Cambia Password</h3>
            <input
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Nuova password (min 6 caratteri)"
              type="password"
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowChangePassword(false)} className="flex-1 py-2 rounded-xl bg-muted text-foreground font-bold">Annulla</button>
              <button onClick={handleChangePassword} disabled={saving} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50">
                {saving ? "..." : "Conferma"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-3xl max-w-xs w-[90%] text-center shadow-2xl">
            <h3 className="text-lg font-bold text-foreground mb-2">Eliminare l'account?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Questa azione è irreversibile. Tutti i tuoi dati verranno cancellati.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="flex-1 py-2 rounded-xl bg-muted text-foreground font-bold">Annulla</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 rounded-xl bg-destructive text-destructive-foreground font-bold disabled:opacity-50">
                {deleting ? "..." : "Elimina"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
