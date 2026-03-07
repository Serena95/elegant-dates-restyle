import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery token in URL
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      // Supabase will handle session from hash automatically
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password aggiornata con successo!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Errore nel reset della password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-5 px-4">
      <DarkModeToggle />
      <div className="w-full max-w-md bg-card rounded-3xl shadow-xl border border-border p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">Nuova Password</h1>
          <p className="text-muted-foreground text-sm mt-2">Inserisci la tua nuova password</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nuova password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground"
              required
              minLength={6}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg hover:opacity-90 transition disabled:opacity-50">
            {loading ? "Caricamento..." : "Aggiorna Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
