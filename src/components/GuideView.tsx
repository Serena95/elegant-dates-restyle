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
      { q: "Come è organizzata l'app?", a: "In basso trovi 5 sezioni principali: Dashboard, Progressi, Calendario, Programmi e Alimentazione. Nella sezione 'Altro' trovi Monitoraggio Ciclo, Modalità Gravidanza, Libreria Esercizi e Impostazioni." },
      { q: "Dove trovo il mio profilo?", a: "Tocca l'icona del profilo (avatar) in alto a destra nell'header. Da lì puoi modificare nome, foto e vedere i tuoi badge." },
      { q: "Come installo l'app sul telefono?", a: "Vai in 'Altro' e tocca 'Installa App'. Su iPhone segui le istruzioni per aggiungerla alla schermata Home tramite il pulsante Condividi." },
    ]
  },
  {
    title: "ALLENAMENTO", emoji: "🏋️‍♀️", color: "text-primary",
    faqs: [
      { q: "Cosa cambia tra i livelli?", a: "L'app prevede tre livelli: Base, Intermedio e Avanzato. Cambiano numero di round, intensità e ripetizioni degli esercizi." },
      { q: "Come funzionano i round e le pause?", a: "Il numero di round varia in base al livello. Ogni round è composto da 13 esercizi. Dopo ogni round, clicca 'SEGNA ROUND' per la pausa automatica." },
      { q: "Non ho il tapis roulant, cosa faccio?", a: "Nella sezione cardio puoi scegliere tra tapis roulant, camminata o cardio sul posto." },
      { q: "Come funzionano i Programmi?", a: "Nella sezione Programmi trovi percorsi strutturati con obiettivi specifici. Scegli quello più adatto a te e segui il piano settimana per settimana." },
    ]
  },
  {
    title: "ALIMENTAZIONE", emoji: "🍎", color: "text-emerald-600",
    faqs: [
      { q: "Perché il consiglio del giorno cambia?", a: "Il consiglio è dinamico: si adatta all'attrezzo che userai oggi." },
      { q: "Cosa significano i colori nel diario?", a: "🟢 Sano (equilibrato), 🟡 Neutro (abbondante), 🔴 Sfizio (dolci, fritti, alcol). Serve a monitorare l'equilibrio." },
    ]
  },
  {
    title: "PROGRESSI & CALENDARIO", emoji: "📊", color: "text-amber-600",
    faqs: [
      { q: "Come funziona la Sfida 30 giorni?", a: "Scegli un'abitudine da cambiare. Ogni giorno che resisti, clicca 'VINTO OGGI'. La costanza è la chiave!" },
      { q: "Ogni quanto devo inserire le misure?", a: "Consigliamo una volta a settimana, al mattino a digiuno, per dati confrontabili." },
      { q: "A cosa serve il Calendario?", a: "Il Calendario mostra la tua cronologia di allenamenti completati con gli attrezzi usati, così puoi avere una visione d'insieme dei tuoi progressi." },
    ]
  },
  {
    title: "CICLO & GRAVIDANZA", emoji: "🌸", color: "text-pink-500",
    faqs: [
      { q: "Come funziona il Monitoraggio Ciclo?", a: "Registra l'inizio del ciclo, i sintomi e le note. L'app calcola automaticamente le previsioni dei cicli futuri e le finestre di fertilità in base alla durata impostata." },
      { q: "Dove trovo queste funzioni?", a: "Vai in 'Altro' (l'ultima icona nella barra in basso) e troverai sia il Monitoraggio Ciclo che la Modalità Gravidanza." },
      { q: "Cos'è la Modalità Gravidanza?", a: "Attiva allenamenti adattati e sicuri settimana per settimana durante la gravidanza. Puoi impostare la settimana gestazionale nelle impostazioni." },
    ]
  },
  {
    title: "LIBRERIA ESERCIZI", emoji: "📚", color: "text-sky-500",
    faqs: [
      { q: "Posso vedere come si fa un esercizio?", a: "Sì, nella Libreria (accessibile da 'Altro') clicca sul nome di qualsiasi esercizio per la spiegazione dettagliata. Gli esercizi sono organizzati per attrezzo." },
    ]
  },
  {
    title: "IMPOSTAZIONI", emoji: "⚙️", color: "text-muted-foreground",
    faqs: [
      { q: "Dove cambio livello o attrezzi?", a: "Vai in Altro → Impostazioni. Lì puoi modificare livello, giorni di allenamento, attrezzi e attivare/disattivare la dark mode." },
      { q: "Come ripristino il programma?", a: "Usa 'Ripristina dati allenamento' nella Dashboard (in fondo) per ricominciare da zero." },
    ]
  },
];

const infoCards = [
  { emoji: "🏋️‍♀️", title: "Allenamento Smart", desc: "Ogni settimana l'app sceglie 3 attrezzi diversi. Ogni sessione ha 13 esercizi per round, bilanciati su tutto il corpo." },
  { emoji: "📱", title: "5 Sezioni + Altro", desc: "Dashboard, Progressi, Calendario, Programmi e Alimentazione nella barra. Ciclo, Gravidanza, Libreria e Impostazioni in 'Altro'." },
  { emoji: "🌙", title: "Dark Mode", desc: "Attiva la modalità scura dalle Impostazioni. La preferenza viene salvata e applicata automaticamente ad ogni apertura." },
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
      {infoCards.map(card => (
        <div key={card.title} className="bg-card p-4 rounded-2xl border border-border border-l-4 border-l-primary">
          <h3 className="font-bold text-primary text-sm">{card.emoji} {card.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{card.desc}</p>
        </div>
      ))}

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
