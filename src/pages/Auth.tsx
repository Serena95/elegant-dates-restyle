import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Email di reset inviata! Controlla la tua casella.");
        setMode("login");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Registrazione completata! Controlla l'email per confermare.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Accesso effettuato!");
      }
    } catch (err: any) {
      toast.error(err.message || "Errore di autenticazione");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch (err: any) {
      toast.error(err.message || "Errore accesso Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-5 px-4">
      <DarkModeToggle />

      <div className="w-full max-w-md bg-card rounded-3xl shadow-xl border border-border p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-pilates-deep bg-clip-text text-transparent">
            My Pilates Plan
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {mode === "login" && "Accedi al tuo account"}
            {mode === "signup" && "Crea un nuovo account"}
            {mode === "forgot" && "Recupera la tua password"}
          </p>
        </div>

        {/* Google Sign In */}
        {mode !== "forgot" && (
          <>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 rounded-2xl border-2 border-border bg-card text-foreground font-bold flex items-center justify-center gap-3 hover:bg-muted transition disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continua con Google
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px bg-border flex-1" />
              <span className="text-xs text-muted-foreground uppercase font-semibold">oppure</span>
              <div className="h-px bg-border flex-1" />
            </div>
          </>
        )}

        {/* Email form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === "signup" && (
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Il tuo nome"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          {mode !== "forgot" && (
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Caricamento..." : mode === "login" ? "Accedi" : mode === "signup" ? "Registrati" : "Invia link di reset"}
          </button>
        </form>

        {/* Mode switchers */}
        <div className="text-center space-y-2 text-sm">
          {mode === "login" && (
            <>
              <button onClick={() => setMode("forgot")} className="text-primary hover:underline block mx-auto">
                Password dimenticata?
              </button>
              <p className="text-muted-foreground">
                Non hai un account?{" "}
                <button onClick={() => setMode("signup")} className="text-primary font-bold hover:underline">
                  Registrati
                </button>
              </p>
            </>
          )}
          {mode === "signup" && (
            <p className="text-muted-foreground">
              Hai già un account?{" "}
              <button onClick={() => setMode("login")} className="text-primary font-bold hover:underline">
                Accedi
              </button>
            </p>
          )}
          {mode === "forgot" && (
            <button onClick={() => setMode("login")} className="text-primary hover:underline">
              ← Torna al login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
