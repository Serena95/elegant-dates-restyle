import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ShoppingCart, Check, ChevronDown, ChevronUp, Utensils, Sparkles, ArrowRight, Loader2, RefreshCw, Lightbulb, User, Calculator } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { NutritionProfile } from "@/hooks/useCloudData";

interface NutritionPlanViewProps {
  onBack: () => void;
  onSavePlan?: (plan: any) => void;
  initialPlanId?: string;
  nutritionProfile?: NutritionProfile;
  onUpdateNutritionProfile?: (updates: Partial<NutritionProfile>) => Promise<void>;
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
  calorie_giornaliere?: number;
  macros?: { proteine: string; carboidrati: string; grassi: string };
  consigli?: string[];
}

// ============================================================
// PRESET PLANS
// ============================================================

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
  {
    id: "keto",
    nome: "Dieta Chetogenica",
    descrizione: "Alto contenuto di grassi, proteine moderate, bassissimi carboidrati",
    icon: "🥑",
    color: "from-purple-500/10 to-fuchsia-500/10",
    durata: "7 giorni",
    obiettivo: "Perdita grasso e chetosi",
    calorie_giornaliere: 1600,
    macros: { proteine: "25%", carboidrati: "5%", grassi: "70%" },
    giorni: {
      "Lunedì": { colazione: "Uova strapazzate (3) nel burro con avocado (100g)", spuntino1: "Noci di macadamia (30g)", pranzo: "Salmone al forno (200g) con burro alle erbe e spinaci saltati (150g)", spuntino2: "Formaggio Brie (40g)", cena: "Cosce di pollo arrosto (250g) con cavolfiore al burro (200g)" },
      "Martedì": { colazione: "Frittata con formaggio (3 uova, 40g cheddar) e pancetta (30g)", spuntino1: "Olive (50g)", pranzo: "Insalata di tonno (150g) con avocado (100g), olio EVO, cetrioli", spuntino2: "Sedano con burro d'arachidi (20g)", cena: "Bistecca (200g) con funghi trifolati (150g) e burro" },
      "Mercoledì": { colazione: "Yogurt greco intero (150g) con semi di chia (15g) e noci (20g)", spuntino1: "Uovo sodo", pranzo: "Petto di pollo (200g) con crema di avocado e insalata verde (150g)", spuntino2: "Mandorle (30g)", cena: "Merluzzo (200g) al burro con zucchine grigliate (200g)" },
      "Giovedì": { colazione: "Bulletproof coffee + 2 uova al tegamino", spuntino1: "Cioccolato fondente 90% (20g)", pranzo: "Hamburger senza pane (150g) con avocado, bacon e insalata", spuntino2: "Noci (30g)", cena: "Salmone (200g) con asparagi (200g) e salsa al limone" },
      "Venerdì": { colazione: "Omelette con spinaci (100g) e formaggio cremoso (30g)", spuntino1: "Olive (50g) e formaggio (30g)", pranzo: "Insalata Caesar senza crostini, pollo (200g), parmigiano (30g)", spuntino2: "Avocado (mezzo)", cena: "Costolette di agnello (200g) con broccoli al vapore (200g)" },
      "Sabato": { colazione: "Pancake keto (farina di mandorle, 3 uova, cream cheese)", spuntino1: "Noci pecan (30g)", pranzo: "Zuppa di cocco con gamberi (200g) e verdure", spuntino2: "Cetrioli con guacamole", cena: "Tagliata (200g) con rucola, parmigiano e olio EVO" },
      "Domenica": { colazione: "Uova Benedict senza muffin con salmone affumicato (80g)", spuntino1: "Formaggio stagionato (40g)", pranzo: "Bowl di pollo (200g) con avocado, cetrioli e semi di sesamo", spuntino2: "Cioccolato fondente 90% (20g)", cena: "Orata al forno (200g) con verdure grigliate e burro alle erbe" },
    },
    listaSpesa: {
      "🥬 Verdure": ["Spinaci (500g)", "Avocado (7)", "Zucchine (500g)", "Broccoli (500g)", "Cavolfiore (1)", "Asparagi (500g)", "Rucola", "Cetrioli", "Funghi (300g)", "Insalata verde"],
      "🍎 Frutta": ["Limoni", "Olive (200g)"],
      "🥩 Proteine": ["Uova (24)", "Salmone (600g)", "Petto di pollo (600g)", "Cosce di pollo (500g)", "Bistecca (400g)", "Merluzzo (200g)", "Gamberi (200g)", "Tonno (300g)", "Agnello (200g)", "Orata (200g)", "Pancetta (100g)", "Salmone affumicato (80g)"],
      "🥛 Latticini": ["Burro (250g)", "Yogurt greco intero", "Cheddar (100g)", "Brie (100g)", "Parmigiano (100g)", "Cream cheese (100g)", "Formaggio stagionato (100g)"],
      "🥜 Altro": ["Noci macadamia", "Mandorle", "Noci", "Noci pecan", "Semi di chia", "Semi di sesamo", "Burro d'arachidi", "Olio EVO", "Olio di cocco", "Cioccolato fondente 90%", "Farina di mandorle"],
    },
  },
  {
    id: "intermittent_fasting",
    nome: "Digiuno Intermittente 16:8",
    descrizione: "Finestra alimentare di 8 ore con 2 pasti principali e 1 spuntino",
    icon: "⏰",
    color: "from-orange-500/10 to-amber-500/10",
    durata: "7 giorni",
    obiettivo: "Dimagrimento e salute metabolica",
    calorie_giornaliere: 1500,
    macros: { proteine: "30%", carboidrati: "40%", grassi: "30%" },
    consigli: [
      "La finestra alimentare consigliata è dalle 12:00 alle 20:00",
      "Al mattino puoi bere acqua, tè o caffè senza zucchero",
      "Puoi personalizzare quale pasto saltare nella versione AI"
    ],
    giorni: {
      "Lunedì": { colazione: "☕ Solo caffè/tè senza zucchero", spuntino1: "—", pranzo: "Bowl di riso integrale (80g) con pollo (200g), avocado (80g) e verdure grigliate (200g)", spuntino2: "Yogurt greco (150g) con noci (20g)", cena: "Salmone al forno (200g) con patate dolci (150g) e spinaci (150g)" },
      "Martedì": { colazione: "☕ Solo caffè/tè senza zucchero", spuntino1: "—", pranzo: "Pasta integrale (80g) con tonno (150g), pomodorini e olive", spuntino2: "Frutta secca mista (40g)", cena: "Petto di tacchino (200g) con quinoa (80g) e broccoli (200g)" },
      "Mercoledì": { colazione: "☕ Solo caffè/tè senza zucchero", spuntino1: "—", pranzo: "Insalata proteica con uova (2), feta (50g), noci e verdure miste (250g)", spuntino2: "Banana con burro d'arachidi (15g)", cena: "Orata al cartoccio (200g) con riso basmati (80g) e zucchine (200g)" },
      "Giovedì": { colazione: "☕ Solo caffè/tè senza zucchero", spuntino1: "—", pranzo: "Buddha bowl con ceci (150g), avocado (80g), verdure e tahini", spuntino2: "Mela + mandorle (20g)", cena: "Bistecca (180g) con patate al forno (150g) e insalata mista" },
      "Venerdì": { colazione: "☕ Solo caffè/tè senza zucchero", spuntino1: "—", pranzo: "Wrap integrale con pollo (180g), hummus, verdure crude", spuntino2: "Yogurt greco (150g) con frutti di bosco", cena: "Gamberi (200g) saltati con verdure (250g) e riso (80g)" },
      "Sabato": { colazione: "☕ Solo caffè/tè senza zucchero", spuntino1: "—", pranzo: "Poke bowl con salmone (150g), riso (80g), edamame, avocado (80g)", spuntino2: "Cioccolato fondente (20g) + noci (20g)", cena: "Polpette di tacchino (200g) con sugo e verdure al vapore (200g)" },
      "Domenica": { colazione: "☕ Solo caffè/tè senza zucchero", spuntino1: "—", pranzo: "Frittata con verdure (3 uova) + pane integrale (60g) + insalata", spuntino2: "Smoothie (banana, latte, burro d'arachidi)", cena: "Merluzzo (200g) con cous cous (80g) e pomodorini" },
    },
    listaSpesa: {
      "🥬 Verdure": ["Spinaci (300g)", "Broccoli (400g)", "Zucchine (400g)", "Pomodorini", "Verdure miste (500g)", "Avocado (4)", "Insalata mista", "Patate dolci (300g)", "Patate (300g)"],
      "🍎 Frutta": ["Banana (4)", "Mela (2)", "Frutti di bosco", "Limoni"],
      "🥩 Proteine": ["Pollo (600g)", "Salmone (350g)", "Tonno (150g)", "Tacchino (400g)", "Orata (200g)", "Gamberi (200g)", "Merluzzo (200g)", "Bistecca (180g)", "Uova (12)", "Ceci (300g)"],
      "🌾 Cereali": ["Riso integrale", "Pasta integrale", "Quinoa", "Riso basmati", "Cous cous", "Pane integrale", "Wrap integrali"],
      "🥛 Latticini": ["Yogurt greco (500g)", "Feta (100g)"],
      "🥜 Altro": ["Noci", "Mandorle", "Frutta secca mista", "Burro d'arachidi", "Hummus", "Tahini", "Olive", "Olio EVO", "Edamame", "Cioccolato fondente", "Caffè/Tè"],
    },
  },
];


// ============================================================
// QUESTIONNAIRE
// ============================================================

interface QuestionnaireData {
  obiettivo: string;
  preferenze: string;
  restrizioni: string;
  attivita: string;
  calorie: string;
  durata: string;
  tipo_dieta: string;
  pasto_saltato: string;
}

const OBIETTIVI = [
  { value: "dimagrimento", label: "🔥 Dimagrimento", desc: "Perdere peso in modo sano" },
  { value: "mantenimento", label: "⚖️ Mantenimento", desc: "Mantenere il peso attuale" },
  { value: "massa", label: "💪 Aumento massa", desc: "Aumentare massa muscolare" },
  { value: "energia", label: "⚡ Più energia", desc: "Migliorare energia e vitalità" },
  { value: "benessere", label: "🧘 Benessere generale", desc: "Alimentazione equilibrata" },
];

const PREFERENZE = [
  { value: "onnivoro", label: "🍖 Onnivoro" },
  { value: "vegetariano", label: "🥗 Vegetariano" },
  { value: "vegano", label: "🌱 Vegano" },
  { value: "pescetariano", label: "🐟 Pescetariano" },
  { value: "mediterraneo", label: "🫒 Mediterraneo" },
];

const RESTRIZIONI_OPTIONS = [
  { value: "nessuna", label: "Nessuna" },
  { value: "senza_glutine", label: "Senza glutine" },
  { value: "senza_lattosio", label: "Senza lattosio" },
  { value: "senza_frutta_secca", label: "No frutta secca" },
  { value: "senza_uova", label: "Senza uova" },
  { value: "senza_soia", label: "Senza soia" },
];

const ATTIVITA_OPTIONS = [
  { value: "sedentario", label: "🪑 Sedentario", desc: "Poco movimento" },
  { value: "leggera", label: "🚶 Attività leggera", desc: "1-2 allenamenti/settimana" },
  { value: "moderata", label: "🏃 Moderata", desc: "3-4 allenamenti/settimana" },
  { value: "intensa", label: "🔥 Intensa", desc: "5+ allenamenti/settimana" },
];

// ============================================================
// TDEE CALCULATION (Mifflin-St Jeor)
// ============================================================

function calculateTDEE(peso: number, altezza: number, eta: number, attivita: string, obiettivo: string): { tdee: number; target: number; macros: { proteine: string; carboidrati: string; grassi: string }; bmr: number } {
  // Mifflin-St Jeor for women (default for Pilates app)
  const bmr = 10 * peso + 6.25 * altezza - 5 * eta - 161;
  
  const activityMultiplier: Record<string, number> = {
    sedentario: 1.2,
    leggera: 1.375,
    moderata: 1.55,
    intensa: 1.725,
  };
  
  const tdee = Math.round(bmr * (activityMultiplier[attivita] || 1.55));
  
  let target = tdee;
  let macros = { proteine: "25%", carboidrati: "45%", grassi: "30%" };
  
  if (obiettivo === "dimagrimento") {
    target = Math.round(tdee * 0.8); // -20%
    macros = { proteine: "30%", carboidrati: "40%", grassi: "30%" };
  } else if (obiettivo === "massa") {
    target = Math.round(tdee * 1.15); // +15%
    macros = { proteine: "30%", carboidrati: "45%", grassi: "25%" };
  }
  
  return { tdee, target, macros, bmr };
}

function adjustPlanPortions(plan: NutritionPlan, calorieTarget: number, macros: { proteine: string; carboidrati: string; grassi: string }): NutritionPlan {
  return {
    ...plan,
    calorie_giornaliere: calorieTarget,
    macros,
  };
}

export function NutritionPlanView({ onBack, onSavePlan, initialPlanId, nutritionProfile, onUpdateNutritionProfile }: NutritionPlanViewProps) {
  const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(() => {
    if (!initialPlanId) return null;
    try {
      const savedFull = localStorage.getItem("activeNutritionPlanFull");
      if (savedFull) {
        const parsed = JSON.parse(savedFull);
        if (parsed?.id === initialPlanId) return parsed;
      }
    } catch {}
    return NUTRITION_PLANS.find(p => p.id === initialPlanId) || null;
  });
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showBodyDataForm, setShowBodyDataForm] = useState(false);

  // Local body data form state
  const [bodyPeso, setBodyPeso] = useState<string>(nutritionProfile?.peso?.toString() || "");
  const [bodyAltezza, setBodyAltezza] = useState<string>(nutritionProfile?.altezza?.toString() || "");
  const [bodyEta, setBodyEta] = useState<string>(nutritionProfile?.eta?.toString() || "");
  const [bodyAttivita, setBodyAttivita] = useState(nutritionProfile?.attivita_livello || "moderata");
  const [bodyObiettivo, setBodyObiettivo] = useState(nutritionProfile?.obiettivo_nutrizionale || "mantenimento");

  // Sync from props
  useEffect(() => {
    if (nutritionProfile) {
      if (nutritionProfile.peso) setBodyPeso(nutritionProfile.peso.toString());
      if (nutritionProfile.altezza) setBodyAltezza(nutritionProfile.altezza.toString());
      if (nutritionProfile.eta) setBodyEta(nutritionProfile.eta.toString());
      if (nutritionProfile.attivita_livello) setBodyAttivita(nutritionProfile.attivita_livello);
      if (nutritionProfile.obiettivo_nutrizionale) setBodyObiettivo(nutritionProfile.obiettivo_nutrizionale);
    }
  }, [nutritionProfile]);

  // Computed TDEE
  const tdeeData = useMemo(() => {
    const peso = parseFloat(bodyPeso);
    const altezza = parseFloat(bodyAltezza);
    const eta = parseInt(bodyEta);
    if (!peso || !altezza || !eta) return null;
    return calculateTDEE(peso, altezza, eta, bodyAttivita, bodyObiettivo);
  }, [bodyPeso, bodyAltezza, bodyEta, bodyAttivita, bodyObiettivo]);

  const hasBodyData = !!(nutritionProfile?.peso && nutritionProfile?.altezza && nutritionProfile?.eta);

  const saveBodyData = async () => {
    const peso = parseFloat(bodyPeso);
    const altezza = parseFloat(bodyAltezza);
    const eta = parseInt(bodyEta);
    if (!peso || !altezza || !eta) {
      toast({ title: "Completa tutti i campi", variant: "destructive" });
      return;
    }
    const td = calculateTDEE(peso, altezza, eta, bodyAttivita, bodyObiettivo);
    await onUpdateNutritionProfile?.({
      peso, altezza, eta,
      attivita_livello: bodyAttivita,
      obiettivo_nutrizionale: bodyObiettivo,
      calorie_target: td.target,
    });
    setShowBodyDataForm(false);
    toast({ title: "Profilo nutrizionale salvato! ✅", description: `Fabbisogno: ${td.target} kcal/giorno` });
  };

  // Questionnaire state
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionStep, setQuestionStep] = useState(0);
  const [formData, setFormData] = useState<QuestionnaireData>({
    obiettivo: "",
    preferenze: "",
    restrizioni: "",
    attivita: "",
    calorie: "",
    durata: "7 giorni",
    tipo_dieta: "standard",
    pasto_saltato: "",
  });
  const [selectedRestrizioni, setSelectedRestrizioni] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPlan, setCustomPlan] = useState<NutritionPlan | null>(null);

  const toggleItem = (item: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const toggleRestrizione = (val: string) => {
    setSelectedRestrizioni(prev => {
      const next = new Set(prev);
      if (val === "nessuna") return new Set(["nessuna"]);
      next.delete("nessuna");
      if (next.has(val)) next.delete(val);
      else next.add(val);
      return next;
    });
  };

  const totalSteps = formData.tipo_dieta === "digiuno_intermittente" ? 7 : 6;

  const canProceed = () => {
    switch (questionStep) {
      case 0: return !!formData.tipo_dieta;
      case 1: return !!formData.obiettivo;
      case 2: return !!formData.preferenze;
      case 3: return selectedRestrizioni.size > 0;
      case 4: return !!formData.attivita;
      case 5: return formData.tipo_dieta !== "digiuno_intermittente" || !!formData.pasto_saltato;
      default: return true;
    }
  };

  const generatePlan = async () => {
    setIsGenerating(true);
    try {
      const restrizioniText = Array.from(selectedRestrizioni).filter(r => r !== "nessuna").join(", ");
      
      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: {
          obiettivo: formData.obiettivo,
          preferenze: formData.preferenze,
          restrizioni: restrizioniText || "Nessuna",
          attivita: formData.attivita,
          calorie: tdeeData?.target?.toString() || formData.calorie || null,
          durata: formData.durata,
          tipo_dieta: formData.tipo_dieta,
          pasto_saltato: formData.pasto_saltato || null,
        },
      });

      if (error) throw error;
      if (data?.fallback || data?.error) {
        toast({ title: "⚠️ Servizio non disponibile", description: data.error || "Riprova più tardi", variant: "destructive" });
        setIsGenerating(false);
        return;
      }
      if (!data?.result) throw new Error("Nessun piano generato");

      const plan = data.result;
      const generated: NutritionPlan = {
        id: "custom_" + Date.now(),
        nome: plan.nome || "Piano Personalizzato",
        descrizione: plan.descrizione || "Piano creato su misura per te",
        icon: "✨",
        color: "from-primary/10 to-accent/10",
        durata: formData.durata,
        obiettivo: formData.obiettivo,
        giorni: plan.giorni || {},
        listaSpesa: plan.listaSpesa || {},
        calorie_giornaliere: plan.calorie_giornaliere,
        macros: plan.macros,
        consigli: plan.consigli,
      };

      setCustomPlan(generated);
      setSelectedPlan(generated);
      setShowQuestionnaire(false);
      toast({ title: "Piano generato! ✨", description: "Il tuo piano personalizzato è pronto" });
    } catch (e: any) {
      console.error("Error generating plan:", e);
      toast({ title: "Errore", description: e.message || "Errore nella generazione. Riprova.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  // ============================================================
  // QUESTIONNAIRE VIEW
  // ============================================================

  if (showQuestionnaire) {
    if (isGenerating) {
      return (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowQuestionnaire(false)} className="text-primary"><ChevronLeft size={24} /></button>
            <h2 className="text-xl font-bold text-foreground">✨ Generazione in corso...</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={48} className="animate-spin text-primary" />
            <p className="text-sm text-muted-foreground text-center">
              Stiamo creando il tuo piano personalizzato<br/>con pasti bilanciati e lista della spesa
            </p>
          </div>
        </div>
      );
    }

    const TIPO_DIETA = [
      { value: "standard", label: "🍽️ Standard", desc: "Piano equilibrato classico" },
      { value: "chetogenica", label: "🥑 Chetogenica", desc: "Alto grassi, bassissimi carboidrati" },
      { value: "digiuno_intermittente", label: "⏰ Digiuno Intermittente 16:8", desc: "Finestra alimentare di 8 ore" },
    ];

    const PASTO_SALTATO = [
      { value: "colazione", label: "☀️ Salta Colazione", desc: "Finestra 12:00 – 20:00" },
      { value: "cena", label: "🌙 Salta Cena", desc: "Finestra 7:00 – 15:00" },
      { value: "pranzo", label: "🍽️ Salta Pranzo", desc: "Colazione + Cena" },
    ];

    const steps = [
      // Step 0: Tipo dieta
      <div key="tipo_dieta" className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">Che tipo di piano vuoi? 🍽️</h3>
        <p className="text-xs text-muted-foreground">Scegli l'approccio alimentare</p>
        {TIPO_DIETA.map(t => (
          <button
            key={t.value}
            onClick={() => setFormData(p => ({ ...p, tipo_dieta: t.value }))}
            className={`w-full p-4 rounded-2xl border-2 text-left transition ${
              formData.tipo_dieta === t.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
            }`}
          >
            <span className="font-bold text-foreground">{t.label}</span>
            <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
          </button>
        ))}
      </div>,

      // Step 1: Obiettivo
      <div key="obiettivo" className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">Qual è il tuo obiettivo? 🎯</h3>
        <p className="text-xs text-muted-foreground">Scegli l'obiettivo principale del piano</p>
        {OBIETTIVI.map(o => (
          <button
            key={o.value}
            onClick={() => setFormData(p => ({ ...p, obiettivo: o.value }))}
            className={`w-full p-4 rounded-2xl border-2 text-left transition ${
              formData.obiettivo === o.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
            }`}
          >
            <span className="font-bold text-foreground">{o.label}</span>
            <p className="text-xs text-muted-foreground mt-0.5">{o.desc}</p>
          </button>
        ))}
      </div>,

      // Step 2: Preferenze
      <div key="preferenze" className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">Tipo di alimentazione? 🥗</h3>
        <p className="text-xs text-muted-foreground">Scegli il tuo stile alimentare</p>
        {PREFERENZE.map(p => (
          <button
            key={p.value}
            onClick={() => setFormData(prev => ({ ...prev, preferenze: p.value }))}
            className={`w-full p-4 rounded-2xl border-2 text-left transition ${
              formData.preferenze === p.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
            }`}
          >
            <span className="font-bold text-foreground">{p.label}</span>
          </button>
        ))}
      </div>,

      // Step 3: Restrizioni
      <div key="restrizioni" className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">Allergie o restrizioni? ⚠️</h3>
        <p className="text-xs text-muted-foreground">Seleziona tutte quelle applicabili</p>
        {RESTRIZIONI_OPTIONS.map(r => (
          <button
            key={r.value}
            onClick={() => toggleRestrizione(r.value)}
            className={`w-full p-4 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
              selectedRestrizioni.has(r.value) ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              selectedRestrizioni.has(r.value) ? "bg-primary border-primary" : "border-muted-foreground/30"
            }`}>
              {selectedRestrizioni.has(r.value) && <Check size={12} className="text-primary-foreground" />}
            </div>
            <span className="font-bold text-foreground">{r.label}</span>
          </button>
        ))}
      </div>,

      // Step 4: Attività
      <div key="attivita" className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">Livello di attività? 🏃</h3>
        <p className="text-xs text-muted-foreground">Quanto ti alleni durante la settimana</p>
        {ATTIVITA_OPTIONS.map(a => (
          <button
            key={a.value}
            onClick={() => setFormData(prev => ({ ...prev, attivita: a.value }))}
            className={`w-full p-4 rounded-2xl border-2 text-left transition ${
              formData.attivita === a.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
            }`}
          >
            <span className="font-bold text-foreground">{a.label}</span>
            <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
          </button>
        ))}
      </div>,

      // Step 5: Pasto saltato (IF only) - or Riepilogo for standard/keto
      ...(formData.tipo_dieta === "digiuno_intermittente" ? [
        <div key="pasto_saltato" className="space-y-3">
          <h3 className="text-lg font-bold text-foreground">Quale pasto vuoi saltare? ⏰</h3>
          <p className="text-xs text-muted-foreground">Il piano si adatterà alla tua finestra alimentare</p>
          {PASTO_SALTATO.map(p => (
            <button
              key={p.value}
              onClick={() => setFormData(prev => ({ ...prev, pasto_saltato: p.value }))}
              className={`w-full p-4 rounded-2xl border-2 text-left transition ${
                formData.pasto_saltato === p.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              }`}
            >
              <span className="font-bold text-foreground">{p.label}</span>
              <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
            </button>
          ))}
        </div>,
      ] : []),

      // Riepilogo (last step)
      <div key="riepilogo" className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">Riepilogo ✅</h3>
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground font-bold">Tipo piano</span>
            <span className="text-xs text-foreground font-bold">{TIPO_DIETA.find(t => t.value === formData.tipo_dieta)?.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground font-bold">Obiettivo</span>
            <span className="text-xs text-foreground font-bold">{OBIETTIVI.find(o => o.value === formData.obiettivo)?.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground font-bold">Alimentazione</span>
            <span className="text-xs text-foreground font-bold">{PREFERENZE.find(p => p.value === formData.preferenze)?.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground font-bold">Restrizioni</span>
            <span className="text-xs text-foreground font-bold">{Array.from(selectedRestrizioni).join(", ") || "Nessuna"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground font-bold">Attività</span>
            <span className="text-xs text-foreground font-bold">{ATTIVITA_OPTIONS.find(a => a.value === formData.attivita)?.label}</span>
          </div>
          {formData.tipo_dieta === "digiuno_intermittente" && formData.pasto_saltato && (
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground font-bold">Pasto saltato</span>
              <span className="text-xs text-foreground font-bold">{PASTO_SALTATO.find(p => p.value === formData.pasto_saltato)?.label}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground text-center">Premi "Genera Piano" per creare il tuo piano personalizzato con AI</p>
      </div>,
    ];

    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <button onClick={() => questionStep > 0 ? setQuestionStep(s => s - 1) : setShowQuestionnaire(false)} className="text-primary">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-foreground flex-1">✨ Piano Personalizzato</h2>
          <span className="text-xs text-muted-foreground font-bold">{questionStep + 1}/{totalSteps}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((questionStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={questionStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {steps[questionStep]}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3">
          {questionStep < totalSteps - 1 ? (
            <button
              onClick={() => setQuestionStep(s => s + 1)}
              disabled={!canProceed()}
              className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-40"
            >
              Avanti <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={generatePlan}
              className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2"
            >
              <Sparkles size={16} /> Genera Piano
            </button>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // SHOPPING LIST VIEW
  // ============================================================

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

  // ============================================================
  // PLAN DETAIL VIEW
  // ============================================================

  if (selectedPlan) {
    const days = Object.keys(selectedPlan.giorni);
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <button onClick={() => { setSelectedPlan(null); setCustomPlan(null); }} className="text-primary"><ChevronLeft size={24} /></button>
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

        {/* Macros & Calories for custom plans */}
        {selectedPlan.calorie_giornaliere && (
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-primary/20 p-4 space-y-2">
            <p className="text-xs font-bold text-primary uppercase">📊 Nutrizione giornaliera</p>
            <p className="text-lg font-black text-foreground">{selectedPlan.calorie_giornaliere} kcal/giorno</p>
            {selectedPlan.macros && (
              <div className="flex gap-3">
                <span className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-bold">🥩 {selectedPlan.macros.proteine}</span>
                <span className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full font-bold">🌾 {selectedPlan.macros.carboidrati}</span>
                <span className="text-xs bg-green-500/10 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-bold">🥑 {selectedPlan.macros.grassi}</span>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        {selectedPlan.consigli && selectedPlan.consigli.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-4 space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1"><Lightbulb size={12} /> Consigli</p>
            {selectedPlan.consigli.map((c, i) => (
              <p key={i} className="text-xs text-foreground">• {c}</p>
            ))}
          </div>
        )}

        {/* Save plan button */}
        <button
          onClick={() => {
            const planToSave = { nome: selectedPlan.nome, icon: selectedPlan.icon, id: selectedPlan.id, descrizione: selectedPlan.descrizione };
            localStorage.setItem("activeNutritionPlan", JSON.stringify(planToSave));
            // Save full plan data for direct access from dashboard
            localStorage.setItem("activeNutritionPlanFull", JSON.stringify(selectedPlan));
            onSavePlan?.(planToSave);
            toast({ title: "Piano salvato! ✅", description: "Lo troverai nella dashboard" });
          }}
          className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2"
        >
          <Check size={18} /> Segui questo Piano
        </button>

        <button
          onClick={() => { setShowShoppingList(true); setCheckedItems(new Set()); }}
          className="w-full py-3 rounded-2xl border-2 border-primary text-primary font-bold flex items-center justify-center gap-2 bg-card"
        >
          <ShoppingCart size={18} /> Lista della Spesa
        </button>

        {/* Regenerate button for custom plans */}
        {customPlan && selectedPlan.id === customPlan.id && (
          <button
            onClick={() => { setSelectedPlan(null); setShowQuestionnaire(true); setQuestionStep(4); }}
            className="w-full py-3 rounded-2xl border-2 border-primary text-primary font-bold flex items-center justify-center gap-2 bg-card"
          >
            <RefreshCw size={16} /> Rigenera Piano
          </button>
        )}

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

  // ============================================================
  // MAIN LIST VIEW
  // ============================================================

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-primary"><ChevronLeft size={24} /></button>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Utensils size={20} className="text-primary" /> Piani Nutrizionali
        </h2>
      </div>
      <p className="text-sm text-muted-foreground">Scegli un piano alimentare o creane uno personalizzato</p>

      {/* Body Data Card */}
      {showBodyDataForm ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground flex items-center gap-2"><User size={16} className="text-primary" /> I tuoi dati</h3>
            <button onClick={() => setShowBodyDataForm(false)} className="text-xs text-muted-foreground">Chiudi</button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Peso (kg)</label>
              <input type="number" value={bodyPeso} onChange={e => setBodyPeso(e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm text-center font-bold focus:ring-2 focus:ring-primary/30" placeholder="65" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Altezza (cm)</label>
              <input type="number" value={bodyAltezza} onChange={e => setBodyAltezza(e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm text-center font-bold focus:ring-2 focus:ring-primary/30" placeholder="165" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Età</label>
              <input type="number" value={bodyEta} onChange={e => setBodyEta(e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm text-center font-bold focus:ring-2 focus:ring-primary/30" placeholder="30" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-2">Livello attività</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: "sedentario", l: "🪑 Sedentario" },
                { v: "leggera", l: "🚶 Leggera" },
                { v: "moderata", l: "🏃 Moderata" },
                { v: "intensa", l: "🔥 Intensa" },
              ].map(a => (
                <button key={a.v} onClick={() => setBodyAttivita(a.v)}
                  className={`p-2.5 rounded-xl border-2 text-xs font-bold transition ${bodyAttivita === a.v ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"}`}
                >{a.l}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-2">Obiettivo</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: "dimagrimento", l: "🔥 Dimagrire" },
                { v: "mantenimento", l: "⚖️ Mantenere" },
                { v: "massa", l: "💪 Massa" },
              ].map(o => (
                <button key={o.v} onClick={() => setBodyObiettivo(o.v)}
                  className={`p-2.5 rounded-xl border-2 text-xs font-bold transition ${bodyObiettivo === o.v ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"}`}
                >{o.l}</button>
              ))}
            </div>
          </div>

          {/* Live TDEE preview */}
          {tdeeData && (
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-3 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Fabbisogno giornaliero</p>
                  <p className="text-xl font-black text-foreground">{tdeeData.target} <span className="text-xs font-bold text-muted-foreground">kcal</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-muted-foreground">TDEE: {tdeeData.tdee} kcal</p>
                  <p className="text-[9px] text-muted-foreground">BMR: {tdeeData.bmr} kcal</p>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <span className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">🥩 {tdeeData.macros.proteine}</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">🌾 {tdeeData.macros.carboidrati}</span>
                <span className="text-[10px] bg-green-500/10 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-bold">🥑 {tdeeData.macros.grassi}</span>
              </div>
            </div>
          )}

          <button onClick={saveBodyData} className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm">
            💾 Salva Profilo Nutrizionale
          </button>
        </motion.div>
      ) : (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowBodyDataForm(true)}
          className={`w-full rounded-2xl border p-4 text-left transition ${hasBodyData ? "border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5" : "border-dashed border-primary/30 bg-primary/5"}`}
        >
          <div className="flex items-center gap-3">
            <Calculator size={20} className="text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {hasBodyData ? (
                <>
                  <p className="text-[10px] font-bold uppercase text-primary tracking-wide">Profilo Nutrizionale</p>
                  <p className="text-sm font-bold text-foreground">{nutritionProfile?.calorie_target} kcal/giorno</p>
                  <p className="text-[11px] text-muted-foreground">{nutritionProfile?.peso}kg · {nutritionProfile?.altezza}cm · {nutritionProfile?.eta} anni · {
                    nutritionProfile?.obiettivo_nutrizionale === "dimagrimento" ? "🔥 Dimagrimento" :
                    nutritionProfile?.obiettivo_nutrizionale === "massa" ? "💪 Massa" : "⚖️ Mantenimento"
                  }</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-foreground">Inserisci i tuoi dati</p>
                  <p className="text-xs text-muted-foreground">Peso, altezza, età per calcolare il fabbisogno</p>
                </>
              )}
            </div>
            <ArrowRight size={16} className="text-primary flex-shrink-0" />
          </div>
        </motion.button>
      )}

      {/* Custom plan CTA */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => { setShowQuestionnaire(true); setQuestionStep(0); }}
        className="w-full bg-gradient-to-r from-primary/15 to-accent/15 rounded-2xl border-2 border-primary/30 p-5 text-left hover:shadow-lg transition"
      >
        <div className="flex items-center gap-4">
          <span className="text-4xl">✨</span>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">Crea Piano Personalizzato</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rispondi a poche domande e l'AI genererà un piano su misura con quantità e lista della spesa
            </p>
          </div>
          <ArrowRight size={20} className="text-primary" />
        </div>
      </motion.button>

      {/* Preset plans */}
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Oppure scegli un piano predefinito</p>
      <div className="space-y-3">
        {NUTRITION_PLANS.map((plan, i) => {
          const adjusted = tdeeData ? adjustPlanPortions(plan, tdeeData.target, tdeeData.macros) : plan;
          return (
            <motion.button
              key={plan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setSelectedPlan(adjusted)}
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
                    {tdeeData && <span className="text-[10px] text-primary font-bold">{tdeeData.target} kcal</span>}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
