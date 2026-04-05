import { useState } from "react";
import { ChevronLeft, ShoppingCart, Check, ChevronDown, ChevronUp, Utensils, Leaf, Apple } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NutritionPlanViewProps {
  onBack: () => void;
  onNavigateFood?: () => void;
}

interface MealPlan {
  colazione: string;
  spuntino1: string;
  pranzo: string;
  spuntino2: string;
  cena: string;
}

interface NutritionPlan {
  id: string;
  nome: string;
  descrizione: string;
  icon: string;
  color: string;
  durata: string;
  obiettivo: string;
  giorni: Record<string, MealPlan>;
  listaSpesa: Record<string, string[]>;
}

const NUTRITION_PLANS: NutritionPlan[] = [
  {
    id: "mediterranea",
    nome: "Dieta Mediterranea",
    descrizione: "Alimentazione equilibrata ispirata alla tradizione mediterranea",
    icon: "🫒",
    color: "from-emerald-500/10 to-green-500/10",
    durata: "7 giorni",
    obiettivo: "Benessere generale",
    giorni: {
      "Lunedì": { colazione: "Yogurt greco con miele e noci", spuntino1: "Frutta di stagione", pranzo: "Insalata di farro con pomodorini, olive e feta", spuntino2: "Mandorle (30g)", cena: "Salmone al forno con verdure grigliate" },
      "Martedì": { colazione: "Pane integrale con avocado e pomodoro", spuntino1: "Mela", pranzo: "Pasta integrale al pesto con fagiolini", spuntino2: "Carote e hummus", cena: "Petto di pollo alla griglia con insalata mista" },
      "Mercoledì": { colazione: "Porridge con frutti di bosco", spuntino1: "Banana", pranzo: "Zuppa di lenticchie con crostini", spuntino2: "Noci miste (30g)", cena: "Orata al cartoccio con patate" },
      "Giovedì": { colazione: "Toast integrale con ricotta e miele", spuntino1: "Pera", pranzo: "Riso venere con gamberi e zucchine", spuntino2: "Yogurt greco", cena: "Frittata di verdure con insalata" },
      "Venerdì": { colazione: "Smoothie banana e spinaci", spuntino1: "Kiwi", pranzo: "Cous cous con verdure e ceci", spuntino2: "Frutta secca (30g)", cena: "Merluzzo con pomodorini e olive" },
      "Sabato": { colazione: "Pancake integrali con frutta", spuntino1: "Arancia", pranzo: "Insalata di quinoa con verdure", spuntino2: "Crackers integrali e hummus", cena: "Polpo con patate e insalata" },
      "Domenica": { colazione: "Uova strapazzate con pane integrale", spuntino1: "Mix di frutta", pranzo: "Pasta al ragù di verdure", spuntino2: "Yogurt con granola", cena: "Tagliata di manzo con rucola" },
    },
    listaSpesa: {
      "🥬 Verdure": ["Pomodorini", "Zucchine", "Spinaci", "Rucola", "Carote", "Fagiolini", "Verdure miste", "Insalata mista", "Patate", "Avocado"],
      "🍎 Frutta": ["Banana", "Mela", "Pera", "Kiwi", "Arancia", "Frutti di bosco", "Frutta di stagione"],
      "🥩 Proteine": ["Salmone", "Petto di pollo", "Orata", "Gamberi", "Merluzzo", "Polpo", "Manzo", "Uova"],
      "🌾 Cereali": ["Farro", "Pasta integrale", "Riso venere", "Cous cous", "Quinoa", "Pane integrale", "Fiocchi d'avena", "Crackers integrali", "Granola"],
      "🥛 Latticini": ["Yogurt greco", "Feta", "Ricotta"],
      "🥜 Altro": ["Noci", "Mandorle", "Frutta secca", "Olive", "Hummus", "Miele", "Olio EVO", "Pesto", "Lenticchie", "Ceci"],
    },
  },
  {
    id: "high_protein",
    nome: "High Protein",
    descrizione: "Piano ad alto contenuto proteico per supportare gli allenamenti",
    icon: "💪",
    color: "from-blue-500/10 to-indigo-500/10",
    durata: "7 giorni",
    obiettivo: "Tonificazione muscolare",
    giorni: {
      "Lunedì": { colazione: "Uova sode (3) con pane integrale", spuntino1: "Skyr con noci", pranzo: "Petto di pollo con riso e broccoli", spuntino2: "Barretta proteica", cena: "Salmone con asparagi" },
      "Martedì": { colazione: "Frittata di albumi con spinaci", spuntino1: "Cottage cheese con frutta", pranzo: "Tonno con insalata di fagioli", spuntino2: "Yogurt greco proteico", cena: "Filetto di tacchino con verdure" },
      "Mercoledì": { colazione: "Porridge proteico con whey e banana", spuntino1: "Edamame", pranzo: "Bowl di quinoa con pollo e avocado", spuntino2: "Mandorle (40g)", cena: "Bistecca con patate dolci" },
      "Giovedì": { colazione: "Pancake proteici", spuntino1: "Skyr naturale", pranzo: "Gamberi con riso integrale e verdure", spuntino2: "Hummus con verdure crude", cena: "Merluzzo al vapore con broccoli" },
      "Venerdì": { colazione: "Smoothie proteico (latte, banana, burro d'arachidi)", spuntino1: "Uovo sodo", pranzo: "Insalata Caesar con pollo", spuntino2: "Mix di noci", cena: "Tagliata di manzo con rucola" },
      "Sabato": { colazione: "Uova strapazzate con salmone affumicato", spuntino1: "Yogurt greco con semi", pranzo: "Polpette di tacchino con verdure", spuntino2: "Barretta proteica", cena: "Orata al forno con patate" },
      "Domenica": { colazione: "French toast proteico", spuntino1: "Cottage cheese", pranzo: "Bowl di riso con salmone e avocado", spuntino2: "Frutta secca", cena: "Petto di pollo alla griglia con insalata" },
    },
    listaSpesa: {
      "🥬 Verdure": ["Broccoli", "Spinaci", "Asparagi", "Rucola", "Verdure miste", "Insalata", "Patate dolci", "Avocado"],
      "🍎 Frutta": ["Banana", "Frutta di stagione"],
      "🥩 Proteine": ["Petto di pollo (1kg)", "Salmone (500g)", "Tonno", "Gamberi", "Tacchino", "Merluzzo", "Manzo", "Orata", "Uova (18)", "Salmone affumicato"],
      "🌾 Cereali": ["Riso integrale", "Quinoa", "Pane integrale", "Fiocchi d'avena"],
      "🥛 Latticini": ["Skyr", "Yogurt greco proteico", "Cottage cheese"],
      "🥜 Altro": ["Whey protein", "Mandorle", "Noci", "Barrette proteiche", "Burro d'arachidi", "Hummus", "Edamame", "Fagioli", "Semi misti"],
    },
  },
  {
    id: "detox",
    nome: "Detox & Reset",
    descrizione: "Piano depurativo per resettare il corpo e ritrovare energia",
    icon: "🌿",
    color: "from-teal-500/10 to-cyan-500/10",
    durata: "5 giorni",
    obiettivo: "Depurazione e energia",
    giorni: {
      "Lunedì": { colazione: "Smoothie verde (spinaci, mela, zenzero)", spuntino1: "Tè verde + mandorle", pranzo: "Insalata detox con avocado e semi", spuntino2: "Centrifuga carota e zenzero", cena: "Zuppa di verdure con curcuma" },
      "Martedì": { colazione: "Porridge con semi di chia e frutti di bosco", spuntino1: "Tisana drenante + noci", pranzo: "Buddha bowl con quinoa e verdure", spuntino2: "Mela verde", cena: "Salmone al vapore con broccoli e limone" },
      "Mercoledì": { colazione: "Acqua tiepida e limone + toast con avocado", spuntino1: "Frullato di ananas e menta", pranzo: "Riso integrale con verdure al vapore", spuntino2: "Sedano e hummus", cena: "Minestrone leggero" },
      "Giovedì": { colazione: "Smoothie bowl con banana e spirulina", spuntino1: "Tè matcha + frutta secca", pranzo: "Insalata di lenticchie con limone e erbe", spuntino2: "Carote crude", cena: "Pesce bianco al cartoccio con zucchine" },
      "Venerdì": { colazione: "Yogurt di cocco con granola senza zucchero", spuntino1: "Tisana detox", pranzo: "Cous cous con verdure grigliate", spuntino2: "Mix di semi", cena: "Crema di zucca con semi di zucca" },
    },
    listaSpesa: {
      "🥬 Verdure": ["Spinaci", "Broccoli", "Zucchine", "Sedano", "Carote", "Zucca", "Verdure miste per minestrone", "Avocado"],
      "🍎 Frutta": ["Mela verde", "Banana", "Ananas", "Limoni", "Frutti di bosco"],
      "🥩 Proteine": ["Salmone", "Pesce bianco", "Lenticchie"],
      "🌾 Cereali": ["Riso integrale", "Quinoa", "Cous cous", "Fiocchi d'avena", "Granola senza zucchero", "Pane integrale"],
      "🥛 Latticini": ["Yogurt di cocco"],
      "🥜 Altro": ["Semi di chia", "Semi di zucca", "Semi misti", "Mandorle", "Noci", "Frutta secca", "Hummus", "Zenzero fresco", "Curcuma", "Menta", "Tè verde", "Tè matcha", "Tisane detox", "Spirulina", "Olio EVO"],
    },
  },
];

const FOOD_CHALLENGE_PRESETS = [
  "🚫 No Dolci",
  "☕ No Zucchero",
  "🍔 No Junk Food",
  "🥤 No Bevande Gassate",
  "🍕 No Carboidrati Raffinati",
  "🥗 5 Porzioni Verdura/Giorno",
  "💧 2L Acqua al Giorno",
  "🍎 Frutta a Ogni Pasto",
];

export function NutritionPlanView({ onBack, onNavigateFood }: NutritionPlanViewProps) {
  const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (item: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  if (selectedPlan && showShoppingList) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowShoppingList(false)} className="text-primary"><ChevronLeft size={24} /></button>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShoppingCart size={20} className="text-primary" /> Lista della Spesa
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">Piano: {selectedPlan.nome}</p>

        {Object.entries(selectedPlan.listaSpesa).map(([category, items]) => (
          <div key={category} className="bg-card rounded-2xl border border-border p-4 space-y-2">
            <h3 className="text-sm font-bold text-foreground">{category}</h3>
            {items.map(item => (
              <button
                key={item}
                onClick={() => toggleItem(item)}
                className={`flex items-center gap-3 w-full text-left p-2 rounded-xl transition ${checkedItems.has(item) ? "bg-muted/50 line-through text-muted-foreground" : "hover:bg-muted/30"}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${checkedItems.has(item) ? "bg-primary border-primary" : "border-muted-foreground/30"}`}>
                  {checkedItems.has(item) && <Check size={12} className="text-primary-foreground" />}
                </div>
                <span className="text-sm">{item}</span>
              </button>
            ))}
          </div>
        ))}

        <div className="text-center text-xs text-muted-foreground">
          {checkedItems.size} / {Object.values(selectedPlan.listaSpesa).flat().length} acquistati
        </div>
      </div>
    );
  }

  if (selectedPlan) {
    const days = Object.keys(selectedPlan.giorni);
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedPlan(null)} className="text-primary"><ChevronLeft size={24} /></button>
          <h2 className="text-xl font-bold text-foreground flex-1">{selectedPlan.icon} {selectedPlan.nome}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{selectedPlan.descrizione}</p>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <p className="text-xs text-muted-foreground font-bold">Durata</p>
            <p className="text-sm font-black text-foreground">{selectedPlan.durata}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <p className="text-xs text-muted-foreground font-bold">Obiettivo</p>
            <p className="text-sm font-black text-foreground">{selectedPlan.obiettivo}</p>
          </div>
        </div>

        <button
          onClick={() => { setShowShoppingList(true); setCheckedItems(new Set()); }}
          className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2"
        >
          <ShoppingCart size={18} /> Genera Lista della Spesa
        </button>

        <div className="space-y-2">
          {days.map(day => {
            const meals = selectedPlan.giorni[day];
            const isExpanded = expandedDay === day;
            return (
              <motion.div key={day} className="bg-card rounded-2xl border border-border overflow-hidden">
                <button
                  onClick={() => setExpandedDay(isExpanded ? null : day)}
                  className="w-full flex items-center justify-between p-4"
                >
                  <span className="font-bold text-sm text-foreground">{day}</span>
                  {isExpanded ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-2">
                        {[
                          { label: "☀️ Colazione", val: meals.colazione },
                          { label: "🍊 Spuntino", val: meals.spuntino1 },
                          { label: "🍽️ Pranzo", val: meals.pranzo },
                          { label: "🥜 Merenda", val: meals.spuntino2 },
                          { label: "🌙 Cena", val: meals.cena },
                        ].map(m => (
                          <div key={m.label} className="flex items-start gap-2">
                            <span className="text-xs font-bold text-muted-foreground w-24 flex-shrink-0">{m.label}</span>
                            <span className="text-xs text-foreground">{m.val}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-primary"><ChevronLeft size={24} /></button>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Utensils size={20} className="text-primary" /> Piani Nutrizionali
        </h2>
      </div>
      <p className="text-sm text-muted-foreground">Scegli un piano alimentare con lista della spesa automatica</p>

      <div className="space-y-3">
        {NUTRITION_PLANS.map((plan, i) => (
          <motion.button
            key={plan.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setSelectedPlan(plan)}
            className={`w-full bg-gradient-to-r ${plan.color} rounded-2xl border border-border p-5 text-left hover:shadow-md transition`}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">{plan.icon}</span>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{plan.nome}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{plan.descrizione}</p>
                <div className="flex gap-3 mt-1.5">
                  <span className="text-[10px] text-muted-foreground font-bold">{plan.durata}</span>
                  <span className="text-[10px] text-muted-foreground font-bold">{plan.obiettivo}</span>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export { FOOD_CHALLENGE_PRESETS };
