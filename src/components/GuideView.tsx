import { useState } from "react";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";

interface GuideViewProps {
  onBack: () => void;
}

interface FaqItem {
  q: string;
  a: string;
}

const sections: { title: string; emoji: string; color: string; faqs: FaqItem[] }[] = [
  {
    title: "NAVIGAZIONE", emoji: "📱", color: "text-primary",
    faqs: [
      { q: "Come è organizzata l'app?", a: "In basso trovi 5 pulsanti: Home, Allenamenti, Calendario, Community e Altro. In 'Altro' trovi Profilo, Progressi, Alimentazione, Libreria Esercizi, Monitoraggio Ciclo, Gravidanza, Challenge, Premium e Impostazioni." },
      { q: "Dove trovo il mio profilo?", a: "Tocca l'icona avatar in alto a destra oppure vai in Altro → Profilo. Da lì puoi modificare nome, foto e vedere badge, livello e XP." },
      { q: "Come installo l'app sul telefono?", a: "Vai in Altro → Installa App. Su iPhone segui le istruzioni per aggiungerla alla schermata Home tramite il pulsante Condividi. Su Android tocca 'Installa' nel popup." },
      { q: "Esiste una versione desktop?", a: "Sì! Su tablet e PC la navigazione si sposta in una sidebar laterale con tutte le sezioni sempre visibili." },
    ]
  },
  {
    title: "ALLENAMENTO", emoji: "🏋️‍♀️", color: "text-primary",
    faqs: [
      { q: "Cosa cambia tra i livelli?", a: "L'app prevede tre livelli: Base, Intermedio e Avanzato. Cambiano numero di round, intensità e ripetizioni degli esercizi." },
      { q: "Come funzionano i round e le pause?", a: "Il numero di round varia in base al livello. Ogni round è composto da 13 esercizi. Dopo ogni round, clicca 'SEGNA ROUND' per la pausa automatica con timer." },
      { q: "Non ho il tapis roulant, cosa faccio?", a: "Nella sezione cardio puoi scegliere tra tapis roulant, camminata o cardio sul posto." },
      { q: "Come funzionano i Programmi?", a: "Nella sezione Allenamenti trovi percorsi strutturati con obiettivi specifici (tonificazione, flessibilità, postura...). Scegli quello più adatto e segui il piano settimana per settimana." },
      { q: "Cos'è l'AI Coach?", a: "È un assistente intelligente integrato che ti dà consigli personalizzati su allenamento, alimentazione e recupero. Lo trovi nella Dashboard. Funziona con l'intelligenza artificiale di Lovable AI." },
      { q: "Posso generare allenamenti con l'AI?", a: "Sì! L'AI può creare allenamenti personalizzati in base ai tuoi attrezzi, livello e obiettivi. Trovi questa opzione nella sezione Allenamenti." },
    ]
  },
  {
    title: "COMMUNITY", emoji: "👥", color: "text-emerald-600",
    faqs: [
      { q: "Cos'è la Community?", a: "È uno spazio dove condividere i tuoi allenamenti completati, motivarti con altri utenti, commentare e mettere like ai post degli altri." },
      { q: "Come pubblico un post?", a: "Dopo aver completato un allenamento puoi condividerlo automaticamente. Oppure vai nella sezione Community per creare un nuovo post." },
      { q: "Cos'è la Classifica?", a: "La Classifica settimanale mostra chi ha accumulato più XP e completato più allenamenti nella settimana. Compete con gli altri utenti!" },
      { q: "Ricevo notifiche dalla Community?", a: "Sì, ricevi notifiche quando qualcuno mette like o commenta i tuoi post. Le trovi nell'icona campanella nella Community." },
    ]
  },
  {
    title: "XP, LIVELLI & BADGE", emoji: "⭐", color: "text-amber-500",
    faqs: [
      { q: "Come funzionano gli XP?", a: "Guadagni XP completando allenamenti, mantenendo streak e partecipando alla Community. Più XP accumuli, più sale il tuo livello." },
      { q: "Cosa sono i Badge?", a: "Sono riconoscimenti che ottieni raggiungendo traguardi specifici: primo allenamento, streak di 7 giorni, 50 allenamenti e molti altri. Li vedi nel tuo Profilo." },
      { q: "Come salgo di livello?", a: "Accumula XP con gli allenamenti. Ogni livello richiede più XP del precedente. Il tuo progresso è visibile nel Profilo." },
    ]
  },
  {
    title: "ALIMENTAZIONE & ACQUA", emoji: "🍎", color: "text-emerald-600",
    faqs: [
      { q: "Perché il consiglio del giorno cambia?", a: "Il consiglio è dinamico: si adatta all'attrezzo che userai oggi per ottimizzare energia e recupero." },
      { q: "Cosa significano i colori nel diario?", a: "🟢 Sano (equilibrato), 🟡 Neutro (abbondante), 🔴 Sfizio (dolci, fritti, alcol). Serve a monitorare l'equilibrio alimentare." },
      { q: "Come funziona il tracciamento dell'acqua?", a: "Nella sezione Alimentazione puoi registrare i bicchieri d'acqua bevuti ogni giorno per monitorare la tua idratazione." },
    ]
  },
  {
    title: "PROGRESSI & CALENDARIO", emoji: "📊", color: "text-amber-600",
    faqs: [
      { q: "Cosa trovo nei Progressi?", a: "Grafici delle misurazioni, storico allenamenti, streak attuale e statistiche complete. Inserisci le misure regolarmente per vedere l'andamento." },
      { q: "Ogni quanto devo inserire le misure?", a: "Consigliamo una volta a settimana, al mattino a digiuno, per dati confrontabili." },
      { q: "A cosa serve il Calendario?", a: "Mostra la cronologia degli allenamenti completati con gli attrezzi usati, così hai una visione d'insieme dei tuoi progressi giorno per giorno." },
    ]
  },
  {
    title: "CHALLENGE", emoji: "🏆", color: "text-orange-500",
    faqs: [
      { q: "Cosa sono le Challenge?", a: "Sono sfide fitness da 7, 14 o 30 giorni per metterti alla prova. Ogni sfida ha un obiettivo specifico e puoi monitorare i tuoi progressi giornalieri." },
      { q: "Come partecipo a una Challenge?", a: "Vai in Altro → Challenge Fitness, scegli la sfida che ti interessa e tocca 'Partecipa'. Poi segna ogni giorno il completamento." },
    ]
  },
  {
    title: "CICLO & GRAVIDANZA", emoji: "🌸", color: "text-pink-500",
    faqs: [
      { q: "Come funziona il Monitoraggio Ciclo?", a: "Registra l'inizio del ciclo, i sintomi e le note. L'app calcola automaticamente le previsioni dei cicli futuri e le finestre di fertilità in base alla durata impostata." },
      { q: "Dove trovo queste funzioni?", a: "Vai in Altro e troverai sia il Monitoraggio Ciclo che la Modalità Gravidanza." },
      { q: "Cos'è la Modalità Gravidanza?", a: "Attiva allenamenti adattati e sicuri settimana per settimana durante la gravidanza. Puoi impostare la settimana gestazionale nelle impostazioni." },
    ]
  },
  {
    title: "LIBRERIA ESERCIZI", emoji: "📚", color: "text-sky-500",
    faqs: [
      { q: "Posso vedere come si fa un esercizio?", a: "Sì, nella Libreria (Altro → Libreria Esercizi) clicca sul nome di qualsiasi esercizio per la spiegazione dettagliata. Gli esercizi sono organizzati per attrezzo." },
    ]
  },
  {
    title: "PREMIUM", emoji: "👑", color: "text-amber-500",
    faqs: [
      { q: "Cosa include Premium?", a: "AI Coach avanzato, generazione allenamenti personalizzati con AI, funzionalità extra e contenuti esclusivi. Vai in Altro → Premium per tutti i dettagli." },
    ]
  },
  {
    title: "IMPOSTAZIONI", emoji: "⚙️", color: "text-muted-foreground",
    faqs: [
      { q: "Dove cambio livello o attrezzi?", a: "Vai in Altro → Impostazioni. Lì puoi modificare livello, giorni di allenamento, attrezzi preferiti e attivare/disattivare la dark mode." },
      { q: "Come attivo le notifiche?", a: "In Impostazioni puoi abilitare le notifiche push e impostare l'orario del promemoria allenamento giornaliero." },
      { q: "Come ripristino il programma?", a: "Usa 'Ripristina dati allenamento' nella Dashboard (in fondo) per ricominciare da zero." },
      { q: "Posso eliminare il mio account?", a: "Sì, nelle Impostazioni trovi l'opzione per eliminare definitivamente il tuo account e tutti i dati associati." },
    ]
  },
];

const infoCards = [
  { emoji: "🏋️‍♀️", title: "Allenamento Smart", desc: "Ogni settimana l'app sceglie 3 attrezzi diversi. Ogni sessione ha 13 esercizi per round, bilanciati su tutto il corpo." },
  { emoji: "📱", title: "Home + Altro", desc: "Home, Allenamenti, Calendario e Community nella barra. Profilo, Progressi, Alimentazione, Libreria, Challenge e Impostazioni in 'Altro'." },
  { emoji: "⭐", title: "XP & Livelli", desc: "Completa allenamenti per guadagnare XP, salire di livello e sbloccare badge. Competi nella classifica settimanale!" },
  { emoji: "🤖", title: "AI Coach", desc: "Un assistente intelligente che ti dà consigli personalizzati e può generare allenamenti su misura per te." },
  { emoji: "🌙", title: "Dark Mode", desc: "Attiva la modalità scura dalle Impostazioni. La preferenza viene salvata e applicata automaticamente." },
  { emoji: "📈", title: "Misurazioni", desc: "Inserisci le misure una volta a settimana, al mattino a digiuno, per dati confrontabili nel tempo." },
];

export function GuideView({ onBack }: GuideViewProps) {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-primary"><ChevronLeft /></button>
        <h2 className="text-xl font-bold text-primary flex-1 text-center">❓ Guida & FAQ</h2>
      </div>

      {/* General info cards */}
      <div className="space-y-3">
        {infoCards.map(card => (
          <div key={card.title} className="bg-card p-4 rounded-2xl border border-border border-l-4 border-l-primary">
            <h3 className="font-bold text-primary text-sm">{card.emoji} {card.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* FAQ sections */}
      {sections.map(sec => (
        <div key={sec.title}>
          <h3 className={`${sec.color} font-bold text-sm mb-2`}>{sec.emoji} {sec.title}</h3>
          {sec.faqs.map(faq => (
            <div
              key={faq.q}
              onClick={() => setOpenFaq(openFaq === faq.q ? null : faq.q)}
              className="bg-card p-4 rounded-2xl border border-border mb-2 cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-foreground">{faq.q}</span>
                {openFaq === faq.q ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
              {openFaq === faq.q && (
                <p className="text-sm text-muted-foreground mt-2">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      ))}

      <button onClick={onBack} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold">HO CAPITO!</button>
    </div>
  );
}
