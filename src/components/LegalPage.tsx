import { ChevronLeft } from "lucide-react";

interface LegalPageProps {
  type: "privacy" | "terms";
  onBack: () => void;
}

export function LegalPage({ type, onBack }: LegalPageProps) {
  if (type === "privacy") {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-primary"><ChevronLeft /></button>
          <h2 className="text-xl font-bold text-foreground flex-1 text-center">🔒 Privacy Policy</h2>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p className="text-xs text-muted-foreground">Ultimo aggiornamento: 8 Marzo 2026</p>

          <section>
            <h3 className="font-bold text-foreground mb-1">1. Titolare del trattamento</h3>
            <p>My Pilates Plan ("l'App") è un'applicazione web per il fitness personale. Il titolare del trattamento dei dati personali è il gestore dell'App.</p>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-1">2. Dati raccolti</h3>
            <p>Raccogliamo i seguenti dati:</p>
            <ul className="list-disc ml-5 space-y-1 mt-1">
              <li><strong>Dati di registrazione:</strong> email, nome visualizzato, foto profilo</li>
              <li><strong>Dati di allenamento:</strong> esercizi completati, progressi, misurazioni corporee</li>
              <li><strong>Dati sulla salute:</strong> monitoraggio ciclo mestruale (opzionale), settimana gestazionale (opzionale)</li>
              <li><strong>Dati alimentari:</strong> diario alimentare e tracciamento acqua</li>
              <li><strong>Preferenze:</strong> livello, attrezzi selezionati, giorni di allenamento</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-1">3. Finalità del trattamento</h3>
            <p>I dati vengono utilizzati esclusivamente per:</p>
            <ul className="list-disc ml-5 space-y-1 mt-1">
              <li>Fornire un'esperienza di allenamento personalizzata</li>
              <li>Salvare e sincronizzare i tuoi progressi tra dispositivi</li>
              <li>Generare statistiche e grafici sui tuoi progressi</li>
              <li>Migliorare il servizio offerto</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-1">4. Conservazione dei dati</h3>
            <p>I dati vengono conservati sui nostri server sicuri per tutta la durata dell'account. Puoi richiedere la cancellazione completa del tuo account e di tutti i dati associati in qualsiasi momento dalle Impostazioni.</p>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-1">5. Condivisione dei dati</h3>
            <p>I tuoi dati personali <strong>non vengono venduti, condivisi o ceduti a terzi</strong> per finalità di marketing. I dati sono accessibili solo a te e ai servizi tecnici necessari per il funzionamento dell'App.</p>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-1">6. Sicurezza</h3>
            <p>Utilizziamo misure di sicurezza tecniche e organizzative per proteggere i tuoi dati, tra cui crittografia, autenticazione sicura e accesso limitato ai dati.</p>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-1">7. I tuoi diritti</h3>
            <p>Hai diritto a:</p>
            <ul className="list-disc ml-5 space-y-1 mt-1">
              <li>Accedere ai tuoi dati personali</li>
              <li>Rettificare dati inesatti</li>
              <li>Cancellare il tuo account e tutti i dati</li>
              <li>Revocare il consenso in qualsiasi momento</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-1">8. Cookie e archiviazione locale</h3>
            <p>L'App utilizza il local storage del browser per salvare preferenze (come la dark mode). Non utilizziamo cookie di profilazione o di terze parti per pubblicità.</p>
          </section>

          <section>
            <h3 className="font-bold text-foreground mb-1">9. Contatti</h3>
            <p>Per qualsiasi domanda relativa alla privacy, puoi contattarci tramite le informazioni presenti nella sezione Impostazioni dell'App.</p>
          </section>
        </div>

        <button onClick={onBack} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold">Torna indietro</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-primary"><ChevronLeft /></button>
        <h2 className="text-xl font-bold text-foreground flex-1 text-center">📋 Termini di Servizio</h2>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p className="text-xs text-muted-foreground">Ultimo aggiornamento: 8 Marzo 2026</p>

        <section>
          <h3 className="font-bold text-foreground mb-1">1. Accettazione dei termini</h3>
          <p>Utilizzando My Pilates Plan ("l'App"), accetti i presenti Termini di Servizio. Se non sei d'accordo, ti invitiamo a non utilizzare l'App.</p>
        </section>

        <section>
          <h3 className="font-bold text-foreground mb-1">2. Descrizione del servizio</h3>
          <p>L'App fornisce piani di allenamento Pilates personalizzati, tracciamento dei progressi, diario alimentare e strumenti di monitoraggio della salute. Il servizio è fornito "così com'è".</p>
        </section>

        <section>
          <h3 className="font-bold text-foreground mb-1">3. Account utente</h3>
          <p>Per utilizzare l'App è necessario creare un account. Sei responsabile della sicurezza delle tue credenziali e di tutte le attività svolte con il tuo account.</p>
        </section>

        <section>
          <h3 className="font-bold text-foreground mb-1">4. Avvertenze sulla salute</h3>
          <p className="font-semibold text-foreground">⚠️ L'App non sostituisce il parere medico.</p>
          <ul className="list-disc ml-5 space-y-1 mt-1">
            <li>Consulta un medico prima di iniziare qualsiasi programma di esercizio</li>
            <li>Le funzionalità di monitoraggio ciclo e gravidanza sono indicative e non hanno valore diagnostico</li>
            <li>In gravidanza, segui sempre le indicazioni del tuo ginecologo</li>
            <li>I consigli alimentari sono generici e non sostituiscono un piano nutrizionale personalizzato</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-foreground mb-1">5. Proprietà intellettuale</h3>
          <p>Tutti i contenuti dell'App (esercizi, testi, grafica, codice) sono protetti da diritto d'autore. È vietata la riproduzione senza autorizzazione.</p>
        </section>

        <section>
          <h3 className="font-bold text-foreground mb-1">6. Limitazione di responsabilità</h3>
          <p>L'App è fornita senza garanzie. Non siamo responsabili per eventuali infortuni o danni derivanti dall'uso dell'App o dall'esecuzione degli esercizi proposti.</p>
        </section>

        <section>
          <h3 className="font-bold text-foreground mb-1">7. Cancellazione dell'account</h3>
          <p>Puoi cancellare il tuo account in qualsiasi momento dalle Impostazioni. La cancellazione comporta l'eliminazione definitiva di tutti i tuoi dati.</p>
        </section>

        <section>
          <h3 className="font-bold text-foreground mb-1">8. Modifiche ai termini</h3>
          <p>Ci riserviamo il diritto di modificare i presenti Termini. Le modifiche saranno comunicate tramite l'App. L'uso continuato dopo le modifiche costituisce accettazione.</p>
        </section>

        <section>
          <h3 className="font-bold text-foreground mb-1">9. Legge applicabile</h3>
          <p>I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente il foro del luogo di residenza del consumatore.</p>
        </section>
      </div>

      <button onClick={onBack} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold">Torna indietro</button>
    </div>
  );
}
