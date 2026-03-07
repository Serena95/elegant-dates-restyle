import { useState } from "react";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";

interface GuideViewProps {
  onBack: () => void;
}

interface FaqItem {
  q: string;
  a: string;
  color?: string;
}

const sections: { title: string; emoji: string; color: string; faqs: FaqItem[] }[] = [
  {
    title: "ALLENAMENTO", emoji: "🏃‍♂️", color: "text-primary",
    faqs: [
      { q: "Cosa cambia tra i livelli?", a: "L'app prevede tre livelli di difficoltà: Base, Intermedio e Avanzato. Cambiano numero di round, intensità e ripetizioni degli esercizi." },
      { q: "Come funzionano i round e le pause?", a: "Il numero di round varia in base al livello. Ogni round è composto da 13 esercizi. Dopo ogni round, clicca 'SEGNA ROUND' per la pausa automatica." },
      { q: "Non ho il tapis roulant, cosa faccio?", a: "Nella sezione cardio puoi scegliere tra tapis roulant, camminata o cardio sul posto." },
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
    title: "PROGRESSI & SFIDE", emoji: "🎯", color: "text-amber-600",
    faqs: [
      { q: "Come funziona la Sfida 30 giorni?", a: "Scegli un'abitudine da cambiare. Ogni giorno che resisti, clicca 'VINTO OGGI'. La costanza è la chiave!" },
      { q: "Ogni quanto devo inserire le misure?", a: "Consigliamo una volta a settimana, al mattino a digiuno, per dati confrontabili." },
    ]
  },
  {
    title: "LIBRERIA", emoji: "📚", color: "text-secondary",
    faqs: [
      { q: "Posso vedere come si fa un esercizio?", a: "Sì, nella Libreria clicca sul nome di qualsiasi esercizio per la spiegazione dettagliata." },
    ]
  },
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
      {[
        { emoji: "🏃‍♂️", title: "Allenamento Smart", desc: "Ogni settimana l'app sceglie 3 attrezzi diversi. Ogni sessione ha 13 esercizi per round, bilanciati su tutto il corpo." },
        { emoji: "🍎", title: "Nutrizione Dinamica", desc: "Il consiglio alimentare cambia in base all'attrezzo del giorno." },
        { emoji: "🎯", title: "Sfida dei 30 Giorni", desc: "Scegli un'abitudine da eliminare. Segna ogni vittoria per far crescere il tuo streak." },
        { emoji: "📈", title: "Misurazioni", desc: "Inserisci le misure una volta a settimana, al mattino a digiuno." },
        { emoji: "🔄", title: "Ripristinare il programma", desc: "Usa 'Ripristina dati allenamento' in fondo alla Dashboard per ricominciare da zero." },
      ].map(card => (
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
