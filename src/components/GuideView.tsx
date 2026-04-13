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
      { q: "Come è organizzata l'app?", a: "In basso trovi 5 pulsanti: Home, Allenamenti, Calendario, Community e Altro. In 'Altro' trovi Profilo, Progressi, Piani Nutrizionali, Diario & Sfide Alimentari, Libreria Esercizi, Monitoraggio Ciclo, Gravidanza, Challenge Fitness, Premium e Impostazioni." },
      { q: "Dove trovo il mio profilo?", a: "Tocca l'icona avatar in alto a destra oppure vai in Altro → Profilo. Da lì puoi modificare nome, foto e vedere badge, livello e XP." },
      { q: "Come installo l'app sul telefono?", a: "Vai in Altro → Installa App. Su iPhone segui le istruzioni per aggiungerla alla schermata Home tramite il pulsante Condividi. Su Android tocca 'Installa' nel popup." },
      { q: "Esiste una versione desktop?", a: "Sì! Su tablet e PC la navigazione si sposta in una sidebar laterale con tutte le sezioni sempre visibili." },
    ]
  },
  {
    title: "ALLENAMENTO", emoji: "🏋️‍♀️", color: "text-primary",
    faqs: [
      { q: "Cosa cambia tra i livelli?", a: "L'app prevede tre livelli: Base (2 round), Intermedio (3 round) e Avanzato (4 round). Cambiano intensità e ripetizioni degli esercizi." },
      { q: "Come funzionano i round e le pause?", a: "Il numero di round varia in base al livello. Ogni round ha esercizi bilanciati su tutto il corpo. Dopo ogni round, clicca 'SEGNA ROUND' per la pausa automatica con timer." },
      { q: "Come funziona la struttura settimanale?", a: "Ogni settimana vengono generati 3 allenamenti: 1 Upper Body, 1 Lower Body e 1 Total Body. I workout rimangono fissi per tutta la settimana e vengono rigenerati solo alla nuova settimana." },
      { q: "Che differenza c'è tra Free e Plus?", a: "Gli utenti Free possono completare 1 allenamento al giorno con esercizi base. Gli utenti Premium (Plus) hanno accesso illimitato agli allenamenti, AI Coach avanzato, generazione AI personalizzata e programmi strutturati completi." },
      { q: "Posso recuperare un workout non fatto?", a: "Sì! I workout non completati rimangono disponibili fino alla fine della settimana. Puoi recuperarli nei giorni successivi senza perderli." },
      { q: "Non ho il tapis roulant, cosa faccio?", a: "Nella sezione cardio puoi scegliere tra tapis roulant, camminata o cardio sul posto." },
      { q: "Come funzionano i Programmi?", a: "Nella sezione Allenamenti trovi percorsi strutturati con obiettivi specifici (tonificazione, flessibilità, postura...). Scegli quello più adatto e segui il piano settimana per settimana." },
      { q: "Cos'è l'AI Coach?", a: "È un assistente intelligente che ti dà consigli personalizzati su allenamento, alimentazione e recupero. Funziona anche come nutrizionista virtuale, suggerendo modifiche al piano alimentare in base ai tuoi obiettivi." },
      { q: "Posso generare allenamenti con l'AI?", a: "Sì! L'AI può creare allenamenti personalizzati in base ai tuoi attrezzi, livello e obiettivi. Funzionalità disponibile per gli utenti Premium." },
      { q: "Come funziona lo stretching?", a: "Dopo aver completato tutti i round, parte una sessione di stretching di 5 esercizi da 30 secondi ciascuno, mirati ai muscoli allenati nella sessione." },
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
    title: "PIANI NUTRIZIONALI", emoji: "🥗", color: "text-green-600",
    faqs: [
      { q: "Cosa sono i Piani Nutrizionali?", a: "Sono piani alimentari completi con pasti giornalieri, quantità, distribuzione dei nutrienti e lista della spesa automatica. Li trovi in Altro → Piani Nutrizionali." },
      { q: "Quali tipi di piano sono disponibili?", a: "Puoi scegliere tra piani predefiniti (Mediterraneo, Proteico, Vegetariano, Vegano, Chetogenico, Digiuno Intermittente 16:8) oppure creare un piano personalizzato con il questionario guidato dall'AI." },
      { q: "Cos'è la Dieta Chetogenica?", a: "Un piano alimentare ad alto contenuto di grassi buoni (70%), proteine moderate (25%) e bassissimi carboidrati (5%). Include alimenti come avocado, salmone, uova e frutta secca." },
      { q: "Come funziona il Digiuno Intermittente?", a: "Segui un protocollo 16:8: 16 ore di digiuno e 8 ore di finestra alimentare. Puoi scegliere quale pasto saltare (colazione, pranzo o cena) e il piano si adatta automaticamente." },
      { q: "Posso creare un piano personalizzato?", a: "Sì! Con il questionario AI indichi obiettivo, preferenze, allergie, livello di attività e tipo di dieta. L'AI genera un piano su misura con lista della spesa inclusa." },
      { q: "Il piano si salva nella Dashboard?", a: "Sì! Quando selezioni un piano, viene salvato automaticamente e appare nella Dashboard per un accesso rapido. Puoi entrare direttamente nel piano senza doverlo cercare di nuovo." },
      { q: "Posso sostituire gli alimenti?", a: "I piani usano categorie flessibili (es. 'Proteine magre', 'Verdure a foglia') con alternative suggerite tra parentesi, così puoi adattare facilmente il piano alle tue preferenze." },
    ]
  },
  {
    title: "DIARIO & SFIDE ALIMENTARI", emoji: "🍎", color: "text-amber-600",
    faqs: [
      { q: "Cos'è il Diario Alimentare?", a: "Registra i tuoi pasti quotidiani con emoji colorate: 🟢 Sano (equilibrato), 🟡 Neutro (abbondante), 🔴 Sfizio (dolci, fritti, alcol). Serve a monitorare l'equilibrio alimentare." },
      { q: "Come funziona il tracciamento dell'acqua?", a: "Nel Diario puoi registrare i bicchieri d'acqua bevuti ogni giorno (obiettivo: 10 bicchieri) per monitorare la tua idratazione." },
      { q: "Cosa sono le Sfide Alimentari?", a: "Sono sfide come 'No Zucchero', 'No Junk Food', 'Solo Cibi Integrali'. Le trovi nella sezione Diario & Sfide Alimentari (Altro → Diario & Sfide Alimentari)." },
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
    title: "CHALLENGE FITNESS", emoji: "🏆", color: "text-orange-500",
    faqs: [
      { q: "Cosa sono le Challenge?", a: "Sono sfide fitness da 7, 14 o 30 giorni per metterti alla prova. Ogni sfida ha un obiettivo specifico e puoi monitorare i tuoi progressi giornalieri." },
      { q: "Come partecipo a una Challenge?", a: "Vai in Altro → Challenge Fitness, scegli la sfida che ti interessa e tocca 'Partecipa'. Poi segna ogni giorno il completamento." },
    ]
  },
  {
    title: "CICLO & GRAVIDANZA", emoji: "🌸", color: "text-pink-500",
    faqs: [
      { q: "Come funziona il Monitoraggio Ciclo?", a: "Registra l'inizio del ciclo, i sintomi e le note. L'app calcola automaticamente le previsioni dei cicli futuri e le finestre di fertilità. Durante la fase mestruale, l'intensità dell'allenamento viene ridotta automaticamente." },
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
    title: "FREE vs PREMIUM", emoji: "👑", color: "text-amber-500",
    faqs: [
      { q: "Cosa include il piano Free?", a: "Allenamenti base (1 al giorno), libreria esercizi, statistiche base, monitoraggio ciclo, diario alimentare e tracciamento acqua." },
      { q: "Cosa include Premium?", a: "Tutto il piano Free più: AI Coach avanzato con nutrizionista, generazione allenamenti personalizzati AI, programmi strutturati completi, piani nutrizionali personalizzati con AI, challenge avanzate, workout illimitati, statistiche avanzate con grafici e supporto prioritario." },
      { q: "Come passo a Premium?", a: "Vai in Altro → Premium e tocca 'Abbonati a Premium'. Puoi abbonarti a €9.99/mese con accesso completo a tutte le funzionalità." },
    ]
  },
  {
    title: "AI COACH & NUTRIZIONISTA", emoji: "🤖", color: "text-primary",
    faqs: [
      { q: "Cos'è l'AI Coach?", a: "È un assistente intelligente nella Dashboard che ti dà consigli personalizzati su allenamento e recupero. Analizza i tuoi dati (streak, attrezzi, fase del ciclo, gravidanza) per consigli mirati." },
      { q: "L'AI Coach è anche nutrizionista?", a: "Sì! Se hai un piano alimentare attivo, l'AI Coach fornisce anche consigli nutrizionali coerenti con il tuo piano (es. consigli per chetogenica, supporto per digiuno intermittente)." },
      { q: "L'AI Coach è gratuito?", a: "La versione base dell'AI Coach è gratuita. Le funzionalità avanzate (generazione workout personalizzati, consigli nutrizionali dettagliati) sono riservate agli utenti Premium." },
    ]
  },
  {
    title: "FUNZIONAMENTO OFFLINE", emoji: "📶", color: "text-muted-foreground",
    faqs: [
      { q: "Posso usare l'app senza internet?", a: "Sì! I workout e i dati salvati sono disponibili anche offline. Quando la connessione torna disponibile, i dati vengono sincronizzati automaticamente." },
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
  { emoji: "📱", title: "Navigazione", desc: "In basso: Home, Allenamenti, Calendario, Community e Altro. In 'Altro' trovi Profilo, Progressi, Piani Nutrizionali, Diario, Challenge, Ciclo, Gravidanza, Premium e Impostazioni." },
  { emoji: "🏋️‍♀️", title: "Allenamento Smart", desc: "Ogni settimana 3 allenamenti: Upper Body, Lower Body e Total Body. Rimangono fissi tutta la settimana. Stretching finale di 5 esercizi da 30s mirati ai muscoli allenati." },
  { emoji: "🆓", title: "Free vs Premium", desc: "Free: 1 allenamento/giorno, esercizi base, statistiche e diario. Premium: workout illimitati, AI Coach avanzato, piani nutrizionali AI, programmi completi e molto altro." },
  { emoji: "🤖", title: "AI Coach & Nutrizionista", desc: "Assistente intelligente che fornisce consigli su allenamento E alimentazione. Si adatta al tuo piano nutrizionale attivo per consigli mirati e coerenti." },
  { emoji: "👥", title: "Community & Classifica", desc: "Condividi allenamenti, commenta e metti like ai post degli altri. Competi nella classifica settimanale basata su XP e allenamenti completati." },
  { emoji: "⭐", title: "XP, Livelli & Badge", desc: "Guadagni XP completando allenamenti e mantenendo streak. Sali di livello e sblocca badge speciali visibili nel tuo Profilo." },
  { emoji: "🏆", title: "Challenge Fitness", desc: "Sfide da 7, 14 e 30 giorni per metterti alla prova. Scegli una challenge, partecipa e segna i progressi giorno per giorno." },
  { emoji: "🥗", title: "Piani Nutrizionali", desc: "Piani predefiniti (Mediterraneo, Proteico, Vegetariano, Vegano, Chetogenico, Digiuno Intermittente) o personalizzati con AI. Include lista della spesa automatica." },
  { emoji: "🍎", title: "Diario & Sfide Alimentari", desc: "Registra pasti, traccia l'acqua (obiettivo 10 bicchieri) e partecipa a sfide alimentari come No Zucchero o No Junk Food." },
  { emoji: "📊", title: "Progressi & Misurazioni", desc: "Grafici, storico allenamenti e streak. Inserisci le misure una volta a settimana al mattino per dati confrontabili nel tempo." },
  { emoji: "🌸", title: "Ciclo & Gravidanza", desc: "Monitora il ciclo con previsioni automatiche e adattamento dell'intensità. In gravidanza, allenamenti sicuri settimana per settimana." },
  { emoji: "📶", title: "Offline & Stabilità", desc: "L'app funziona anche senza internet. I workout rimangono fissi per tutta la settimana e i dati si sincronizzano automaticamente quando torni online." },
  { emoji: "🔔", title: "Notifiche & Promemoria", desc: "Attiva le notifiche push nelle Impostazioni per ricevere promemoria giornalieri per l'allenamento all'orario che preferisci." },
  { emoji: "🌙", title: "Dark Mode", desc: "Attiva la modalità scura dalle Impostazioni. La preferenza viene salvata e applicata automaticamente ad ogni apertura." },
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
