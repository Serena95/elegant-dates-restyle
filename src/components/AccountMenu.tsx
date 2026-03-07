import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Trash2, User } from "lucide-react";
import { toast } from "sonner";

export function AccountMenu() {
  const { user, signOut } = useAuth();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  return (
    <>
      <div className="flex items-center justify-between bg-pilates-light dark:bg-accent rounded-2xl p-3 border border-primary/15">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground truncate">
            {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Utente"}
          </span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setShowDelete(true)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition" title="Elimina account">
            <Trash2 size={16} />
          </button>
          <button onClick={signOut} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition" title="Esci">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {showDelete && (
        <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-3xl max-w-xs w-[90%] text-center shadow-2xl">
            <h3 className="text-lg font-bold text-foreground mb-2">Eliminare l'account?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Questa azione è irreversibile. Tutti i tuoi dati verranno cancellati.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="flex-1 py-2 rounded-xl bg-muted text-foreground font-bold">
                Annulla
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 rounded-xl bg-destructive text-destructive-foreground font-bold disabled:opacity-50">
                {deleting ? "..." : "Elimina"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
