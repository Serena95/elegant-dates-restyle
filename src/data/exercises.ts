export interface Exercise {
  id: string;
  nome: string;
  attrezzo: string;
  livello: "base" | "medio" | "avanzato";
  muscoli: string[];
  tipo: "core" | "gambe" | "glutei" | "schiena" | "mobilità" | "stabilità" | "cardio" | "braccia";
  descrizione: string;
  gif?: string;
}

export interface DayPlan {
  tema: string;
  round: number;
  attrezzo?: string; // backward compat
}

export type WeekPlan = Record<string, DayPlan>;

export const CONFIG_LIVELLI: Record<string, { round: number; tempoEsercizio: number; pausa: number }> = {
  "BASSO": { round: 2, tempoEsercizio: 30, pausa: 60 },
  "MEDIO": { round: 3, tempoEsercizio: 45, pausa: 45 },
  "AVANZATO": { round: 4, tempoEsercizio: 60, pausa: 30 },
};

export const TUTTI_GLI_ATTREZZI = [
  "Corpo Libero", "Ring", "Rullo", "Pesi",
  "Elastico Chiuso", "Fascia Aperta", "Palla Piccola", "Palla Grande",
  "Reformer", "Cadillac", "Wunda Chair", "Ladder Barrel", "Spine Corrector",
];

export const ATTREZZO_ICONS: Record<string, string> = {
  "Corpo Libero": "🧘",
  "Ring": "⭕",
  "Rullo": "🔄",
  "Pesi": "🏋️",
  "Pesi(da 1 a 4kg)": "🏋️",
  "Elastico Chiuso": "🔗",
  "Fascia Aperta": "🎗️",
  "Palla Piccola": "⚽",
  "Palla Grande": "🔵",
  "Reformer": "🛏️",
  "Cadillac": "🗼",
  "Wunda Chair": "🪑",
  "Ladder Barrel": "🪜",
  "Spine Corrector": "🌀",
};

export const ATTREZZO_SHORT: Record<string, string> = {
  "Corpo Libero": "CL",
  "Ring": "RG",
  "Rullo": "RL",
  "Pesi": "PS",
  "Pesi(da 1 a 4kg)": "PS",
  "Elastico Chiuso": "EC",
  "Fascia Aperta": "FA",
  "Palla Piccola": "PP",
  "Palla Grande": "PG",
  "Reformer": "RF",
  "Cadillac": "CD",
  "Wunda Chair": "WC",
  "Ladder Barrel": "LB",
  "Spine Corrector": "SC",
};

export const TEMA_CONFIG: Record<string, { label: string; tipi: string[]; icon: string }> = {
  "core_mobilita": {
    label: "Core + Mobilità",
    tipi: ["core", "mobilità", "stabilità", "schiena"],
    icon: "🧘",
  },
  "gambe_glutei": {
    label: "Gambe + Glutei",
    tipi: ["gambe", "glutei"],
    icon: "🦵",
  },
  "full_body_cardio": {
    label: "Full Body + Cardio",
    tipi: ["core", "gambe", "glutei", "schiena", "braccia", "cardio", "stabilità"],
    icon: "🔥",
  },
};

const LIVELLO_ACCESSO: Record<string, string[]> = {
  "BASSO": ["base"],
  "MEDIO": ["base", "medio"],
  "AVANZATO": ["base", "medio", "avanzato"],
};

// ============================================================
// EXERCISE LIBRARY - ~120 esercizi reali Pilates + fitness
// ============================================================

export const EXERCISE_LIBRARY: Exercise[] = [
  // ==================== CORPO LIBERO (27) ====================
  { id: "hundred", nome: "The Hundred", attrezzo: "Corpo Libero", livello: "base", muscoli: ["addominali", "core profondo"], tipo: "core", descrizione: "Supina, solleva testa e spalle, gambe a 45° o tavolino. Braccia lungo i fianchi, molleggia su e giù inspirando 5 ed espirando 5.", gif: "/exercises/hundred.gif" },
  { id: "roll_up", nome: "Roll Up", attrezzo: "Corpo Libero", livello: "base", muscoli: ["addominali", "flessori anca"], tipo: "core", descrizione: "Supina, braccia tese oltre la testa. Arrotola la colonna fino a sederti, fletti avanti. Torna vertebra per vertebra.", gif: "/exercises/roll-up.gif" },
  { id: "single_leg_stretch", nome: "Single Leg Stretch", attrezzo: "Corpo Libero", livello: "base", muscoli: ["addominali", "flessori anca"], tipo: "core", descrizione: "Supina, solleva testa e spalle. Porta un ginocchio al petto mentre l'altra gamba è distesa. Alterna con controllo.", gif: "/exercises/single-leg-stretch.gif" },
  { id: "double_leg_stretch", nome: "Double Leg Stretch", attrezzo: "Corpo Libero", livello: "base", muscoli: ["addominali", "core profondo"], tipo: "core", descrizione: "Supina con ginocchia al petto. Espirando stendi braccia e gambe in direzioni opposte. Inspirando torna alla posizione raccolta.", gif: "/exercises/double-leg-stretch.gif" },
  { id: "criss_cross", nome: "Criss Cross", attrezzo: "Corpo Libero", livello: "base", muscoli: ["obliqui", "addominali"], tipo: "core", descrizione: "Supina, mani dietro la nuca. Porta il gomito destro verso il ginocchio sinistro mentre distendi la gamba destra. Alterna.", gif: "/exercises/criss-cross.gif" },
  { id: "plank", nome: "Plank", attrezzo: "Corpo Libero", livello: "base", muscoli: ["core", "spalle", "braccia"], tipo: "stabilità", descrizione: "Appoggio su avambracci e punte dei piedi. Mantieni il corpo in linea retta dalla testa ai talloni, attivando il core.", gif: "/exercises/plank.gif" },
  { id: "side_plank", nome: "Side Plank", attrezzo: "Corpo Libero", livello: "medio", muscoli: ["obliqui", "spalle", "gluteo medio"], tipo: "stabilità", descrizione: "Sul fianco, appoggio su avambraccio. Solleva il bacino creando una linea retta. Mantieni la posizione.", gif: "/exercises/side-plank.gif" },
  { id: "shoulder_bridge", nome: "Shoulder Bridge", attrezzo: "Corpo Libero", livello: "base", muscoli: ["glutei", "posteriori coscia"], tipo: "glutei", descrizione: "Supina, piedi a terra. Solleva il bacino contraendo glutei al massimo. Mantieni o ripeti.", gif: "/exercises/shoulder-bridge.gif" },
  { id: "swan_prep", nome: "Swan Prep", attrezzo: "Corpo Libero", livello: "base", muscoli: ["erettori spinali", "dorsali"], tipo: "schiena", descrizione: "Prona, mani sotto le spalle. Solleva il busto estendendo la schiena. Mantieni il collo lungo e lo sguardo avanti.", gif: "/exercises/swan-prep.gif" },
  { id: "swimming", nome: "Swimming", attrezzo: "Corpo Libero", livello: "base", muscoli: ["erettori spinali", "glutei", "spalle"], tipo: "schiena", descrizione: "Prona, braccia e gambe tese. Solleva braccio e gamba opposta alternando velocemente, simulando il nuoto.", gif: "/exercises/swimming.gif" },
  { id: "side_kick", nome: "Side Kick", attrezzo: "Corpo Libero", livello: "base", muscoli: ["quadricipiti", "flessori anca", "glutei"], tipo: "gambe", descrizione: "Sul fianco, gamba sopra tesa. Calcia avanti con piede a martello, poi indietro con punta. Mantieni il busto fermo.", gif: "/exercises/side-kick.gif" },
  { id: "leg_circles", nome: "Leg Circles", attrezzo: "Corpo Libero", livello: "base", muscoli: ["flessori anca", "addominali", "interno coscia"], tipo: "mobilità", descrizione: "Supina, una gamba tesa verso il soffitto. Disegna cerchi ampi con il piede senza muovere il bacino.", gif: "/exercises/leg-circles.gif" },
  { id: "teaser", nome: "Teaser", attrezzo: "Corpo Libero", livello: "avanzato", muscoli: ["addominali", "flessori anca"], tipo: "core", descrizione: "Supina, sali in equilibrio sugli ischi formando una V con corpo e gambe. Braccia tese verso i piedi.", gif: "/exercises/teaser.gif" },
  { id: "spine_stretch_forward", nome: "Spine Stretch Forward", attrezzo: "Corpo Libero", livello: "base", muscoli: ["erettori spinali", "posteriori coscia"], tipo: "mobilità", descrizione: "Seduta a gambe divaricate. Allungati in avanti arrotondando la colonna, come per superare un ostacolo immaginario.", gif: "/exercises/spine-stretch.gif" },
  { id: "cat_stretch", nome: "Cat Stretch", attrezzo: "Corpo Libero", livello: "base", muscoli: ["colonna vertebrale", "addominali"], tipo: "mobilità", descrizione: "In quadrupedia, arrotonda la schiena portando l'ombelico alla colonna. Poi inarca dolcemente guardando avanti.", gif: "/exercises/cat-stretch.gif" },
  { id: "bird_dog", nome: "Bird Dog", attrezzo: "Corpo Libero", livello: "base", muscoli: ["core", "glutei", "erettori spinali"], tipo: "stabilità", descrizione: "In quadrupedia, solleva braccio destro e gamba sinistra contemporaneamente. Alterna mantenendo il bacino stabile.", gif: "/exercises/bird-dog.gif" },
  { id: "dead_bug", nome: "Dead Bug", attrezzo: "Corpo Libero", livello: "base", muscoli: ["addominali", "core profondo"], tipo: "core", descrizione: "Supina, braccia al soffitto e gambe a tavolino. Estendi braccio e gamba opposta verso il pavimento, senza inarcare la schiena.", gif: "/exercises/dead-bug.gif" },
  { id: "glute_bridge", nome: "Glute Bridge", attrezzo: "Corpo Libero", livello: "base", muscoli: ["glutei", "posteriori coscia"], tipo: "glutei", descrizione: "Supina, piedi a terra larghezza fianchi. Solleva e abbassa il bacino contraendo i glutei ad ogni ripetizione.", gif: "/exercises/glute-bridge.gif" },
  { id: "reverse_plank", nome: "Reverse Plank", attrezzo: "Corpo Libero", livello: "medio", muscoli: ["tricipiti", "glutei", "core"], tipo: "stabilità", descrizione: "Seduta, mani dietro. Solleva il bacino formando una linea retta dalla testa ai piedi. Mantieni.", gif: "/exercises/reverse-plank.gif" },
  { id: "mountain_climber", nome: "Mountain Climber", attrezzo: "Corpo Libero", livello: "medio", muscoli: ["core", "flessori anca", "spalle"], tipo: "cardio", descrizione: "In posizione plank, porta velocemente le ginocchia al petto alternandole. Mantieni il bacino basso e stabile.", gif: "/exercises/mountain-climber.gif" },
  { id: "donkey_kicks", nome: "Donkey Kicks", attrezzo: "Corpo Libero", livello: "base", muscoli: ["glutei"], tipo: "glutei", descrizione: "In quadrupedia, calcia il tallone verso il soffitto mantenendo il ginocchio a 90°. Contrai il gluteo in alto.", gif: "/exercises/donkey-kicks.gif" },
  { id: "fire_hydrant", nome: "Fire Hydrant", attrezzo: "Corpo Libero", livello: "base", muscoli: ["gluteo medio", "abduttori"], tipo: "glutei", descrizione: "In quadrupedia, apri il ginocchio lateralmente mantenendo 90° e il busto fermo.", gif: "/exercises/fire-hydrant.gif" },
  { id: "inner_thigh_lifts", nome: "Inner Thigh Lifts", attrezzo: "Corpo Libero", livello: "base", muscoli: ["adduttori", "interno coscia"], tipo: "gambe", descrizione: "Sul fianco, gamba sopra piegata avanti. Solleva la gamba sotto verso l'alto attivando l'interno coscia.", gif: "/exercises/inner-thigh-lifts.gif" },
  { id: "lunges", nome: "Affondi", attrezzo: "Corpo Libero", livello: "base", muscoli: ["quadricipiti", "glutei"], tipo: "gambe", descrizione: "In piedi, fai un passo avanti e scendi con il ginocchio posteriore verso terra formando due angoli di 90°.", gif: "/exercises/lunges.gif" },
  { id: "plie_squat", nome: "Plié Squat", attrezzo: "Corpo Libero", livello: "base", muscoli: ["adduttori", "quadricipiti", "glutei"], tipo: "gambe", descrizione: "In piedi, gambe larghe, punte in fuori. Scendi in squat mantenendo il busto dritto e le ginocchia sulla linea dei piedi.", gif: "/exercises/plie-squat.gif" },
  { id: "jumping_jacks", nome: "Jumping Jacks", attrezzo: "Corpo Libero", livello: "base", muscoli: ["corpo intero"], tipo: "cardio", descrizione: "Saltelli aprendo e chiudendo braccia e gambe contemporaneamente. Mantieni un ritmo costante.", gif: "/exercises/jumping-jacks.gif" },
  { id: "wall_sit", nome: "Wall Sit", attrezzo: "Corpo Libero", livello: "base", muscoli: ["quadricipiti", "glutei"], tipo: "gambe", descrizione: "Schiena al muro, scendi fino a gambe a 90°. Mantieni la posizione isometrica.", gif: "/exercises/wall-sit.gif" },

  // ==================== RING (13) ====================
  { id: "ring_squat", nome: "Ring Squat", attrezzo: "Ring", livello: "base", muscoli: ["quadricipiti", "glutei", "adduttori"], tipo: "gambe", descrizione: "In piedi, ring tra le cosce. Scendi in squat premendo costantemente il ring verso l'interno.", gif: "/exercises/ring-squat.gif" },
  { id: "inner_thigh_press_ring", nome: "Inner Thigh Press", attrezzo: "Ring", livello: "base", muscoli: ["adduttori", "interno coscia"], tipo: "gambe", descrizione: "Supina, ring tra le ginocchia. Stringi il ring con forza e rilascia con controllo.", gif: "/exercises/inner-thigh-press-ring.gif" },
  { id: "chest_press_ring", nome: "Chest Press con Ring", attrezzo: "Ring", livello: "base", muscoli: ["pettorali", "deltoidi anteriori"], tipo: "braccia", descrizione: "In piedi, ring tra i palmi davanti al petto. Schiaccia il ring e rilascia lentamente.", gif: "/exercises/chest-press-ring.gif" },
  { id: "overhead_press_ring", nome: "Overhead Press con Ring", attrezzo: "Ring", livello: "base", muscoli: ["deltoidi", "tricipiti"], tipo: "braccia", descrizione: "In piedi, ring sopra la testa. Schiaccia con piccoli impulsi lavorando su spalle e tricipiti.", gif: "/exercises/overhead-press-ring.gif" },
  { id: "bridge_ring", nome: "Bridge con Ring", attrezzo: "Ring", livello: "base", muscoli: ["glutei", "adduttori", "posteriori coscia"], tipo: "glutei", descrizione: "Supina, ring tra le ginocchia. Solleva il bacino in bridge stringendo il ring contemporaneamente.", gif: "/exercises/bridge-ring.gif" },
  { id: "ring_arm_press", nome: "Ring Arm Press", attrezzo: "Ring", livello: "base", muscoli: ["bicipiti", "tricipiti"], tipo: "braccia", descrizione: "In piedi, ring contro il fianco. Premi con l'esterno del braccio teso, attivando bicipiti e tricipiti.", gif: "/exercises/ring-arm-press.gif" },
  { id: "ring_leg_squeeze", nome: "Ring Leg Squeeze", attrezzo: "Ring", livello: "base", muscoli: ["adduttori", "quadricipiti"], tipo: "gambe", descrizione: "Supina, ring tra le caviglie. Stringi le gambe verso l'interno con impulsi controllati.", gif: "/exercises/ring-leg-squeeze.gif" },
  { id: "ring_side_press", nome: "Ring Side Press", attrezzo: "Ring", livello: "medio", muscoli: ["obliqui", "deltoidi"], tipo: "braccia", descrizione: "In piedi, ring al fianco. Premi il ring verso il basso con la mano attivando obliqui e spalla.", gif: "/exercises/ring-side-press.gif" },
  { id: "ring_ab_crunch", nome: "Ring Ab Crunch", attrezzo: "Ring", livello: "base", muscoli: ["addominali"], tipo: "core", descrizione: "Supina, ring tra le mani sopra le ginocchia. Sali in crunch premendo il ring ad ogni ripetizione.", gif: "/exercises/ring-ab-crunch.gif" },
  { id: "ring_shoulder_press", nome: "Ring Shoulder Press", attrezzo: "Ring", livello: "medio", muscoli: ["deltoidi", "trapezio"], tipo: "braccia", descrizione: "In piedi, ring dietro la nuca. Premi i palmi verso l'interno attivando spalle e parte alta della schiena.", gif: "/exercises/ring-shoulder-press.gif" },
  { id: "ring_hundred", nome: "Hundred con Ring", attrezzo: "Ring", livello: "medio", muscoli: ["addominali", "adduttori"], tipo: "core", descrizione: "Supina, ring tra le caviglie. Stringi costantemente mentre molleggi le braccia nella posizione dell'Hundred.", gif: "/exercises/ring-hundred.gif" },
  { id: "ring_swan", nome: "Swan con Ring", attrezzo: "Ring", livello: "medio", muscoli: ["erettori spinali", "dorsali"], tipo: "schiena", descrizione: "Prona, mani sul ring a terra davanti. Premi il ring sollevando il petto in estensione della colonna.", gif: "/exercises/ring-swan.gif" },
  { id: "ring_donkey_kick", nome: "Donkey Kick con Ring", attrezzo: "Ring", livello: "medio", muscoli: ["glutei"], tipo: "glutei", descrizione: "In quadrupedia, ring dietro il ginocchio. Stringi il ring calciando il tallone verso il soffitto.", gif: "/exercises/ring-donkey-kick.gif" },

  // ==================== PALLA PICCOLA (12) ====================
  { id: "bridge_palla_piccola", nome: "Bridge con Palla", attrezzo: "Palla Piccola", livello: "base", muscoli: ["glutei", "adduttori"], tipo: "glutei", descrizione: "Supina, palla tra le ginocchia. Solleva il bacino in bridge schiacciando la palla ad ogni ripetizione.", gif: "/exercises/bridge-palla.gif" },
  { id: "dead_bug_palla", nome: "Dead Bug con Palla", attrezzo: "Palla Piccola", livello: "base", muscoli: ["addominali", "core profondo"], tipo: "core", descrizione: "Supina, palla tra ginocchio e mano. Estendi braccio e gamba opposta mantenendo la pressione sulla palla.", gif: "/exercises/dead-bug-palla.gif" },
  { id: "squeeze_addominale", nome: "Squeeze Addominale", attrezzo: "Palla Piccola", livello: "base", muscoli: ["addominali"], tipo: "core", descrizione: "Supina, palla sotto le scapole. Esegui crunch sfruttando l'instabilità della palla per attivare il core profondo.", gif: "/exercises/squeeze-addominale.gif" },
  { id: "leg_lift_palla", nome: "Leg Lift con Palla", attrezzo: "Palla Piccola", livello: "base", muscoli: ["addominali bassi", "adduttori"], tipo: "core", descrizione: "Supina, palla tra le caviglie. Solleva le gambe tese a 90° schiacciando la palla durante il movimento.", gif: "/exercises/leg-lift-palla.gif" },
  { id: "inner_thigh_squeeze_palla", nome: "Inner Thigh Squeeze", attrezzo: "Palla Piccola", livello: "base", muscoli: ["adduttori", "interno coscia"], tipo: "gambe", descrizione: "Supina o seduta, palla tra le cosce. Schiaccia con forza e rilascia con controllo per 100 molleggi.", gif: "/exercises/inner-thigh-squeeze.gif" },
  { id: "crunch_palla", nome: "Crunch con Palla", attrezzo: "Palla Piccola", livello: "base", muscoli: ["addominali"], tipo: "core", descrizione: "Supina, palla tra le mani. Sali in crunch toccando le ginocchia con la palla ad ogni ripetizione.", gif: "/exercises/crunch-palla.gif" },
  { id: "russian_twist_palla", nome: "Russian Twist con Palla", attrezzo: "Palla Piccola", livello: "medio", muscoli: ["obliqui", "addominali"], tipo: "core", descrizione: "Seduta, gambe sollevate. Ruota il busto portando la palla da un lato all'altro del corpo.", gif: "/exercises/russian-twist-palla.gif" },
  { id: "plank_palla_piccola", nome: "Plank con Palla", attrezzo: "Palla Piccola", livello: "medio", muscoli: ["core", "spalle"], tipo: "stabilità", descrizione: "In plank, una mano sulla palla. Mantieni la stabilità sfidando l'equilibrio sulla superficie instabile.", gif: "/exercises/plank-palla.gif" },
  { id: "back_ext_palla_piccola", nome: "Back Extension con Palla", attrezzo: "Palla Piccola", livello: "base", muscoli: ["erettori spinali"], tipo: "schiena", descrizione: "Prona, palla sotto lo sterno. Solleva il busto e le braccia a T cercando l'estensione dorsale.", gif: "/exercises/back-ext-palla.gif" },
  { id: "wall_squat_palla_piccola", nome: "Wall Squat con Palla", attrezzo: "Palla Piccola", livello: "base", muscoli: ["quadricipiti", "glutei"], tipo: "gambe", descrizione: "Palla tra schiena e muro. Scendi in squat facendo rotolare la palla. Risali con forza dai talloni.", gif: "/exercises/wall-squat-palla.gif" },
  { id: "clamshell_palla", nome: "Clamshell con Palla", attrezzo: "Palla Piccola", livello: "base", muscoli: ["gluteo medio", "abduttori"], tipo: "glutei", descrizione: "Sul fianco, palla sotto il fianco. Apri il ginocchio superiore come una conchiglia mantenendo i piedi uniti.", gif: "/exercises/clamshell-palla.gif" },
  { id: "spine_twist_palla", nome: "Spine Twist con Palla", attrezzo: "Palla Piccola", livello: "base", muscoli: ["obliqui", "colonna vertebrale"], tipo: "mobilità", descrizione: "Seduta, palla tra le mani tese avanti. Ruota il busto lateralmente seguendo la palla con lo sguardo.", gif: "/exercises/spine-twist-palla.gif" },

  // ==================== PALLA GRANDE / FITBALL (12) ====================
  { id: "crunch_fitball", nome: "Crunch su Fitball", attrezzo: "Palla Grande", livello: "base", muscoli: ["addominali"], tipo: "core", descrizione: "Schiena sulla fitball, piedi a terra. Mani dietro la nuca, sali in crunch sfruttando l'ampiezza del movimento.", gif: "/exercises/crunch-fitball.gif" },
  { id: "wall_squat_fitball", nome: "Wall Squat con Fitball", attrezzo: "Palla Grande", livello: "base", muscoli: ["quadricipiti", "glutei"], tipo: "gambe", descrizione: "Fitball tra schiena e muro. Scendi in squat profondo, la palla guida il movimento della colonna.", gif: "/exercises/wall-squat-fitball.gif" },
  { id: "back_ext_fitball", nome: "Back Extension su Fitball", attrezzo: "Palla Grande", livello: "base", muscoli: ["erettori spinali", "glutei"], tipo: "schiena", descrizione: "Pancia sulla fitball, piedi al muro. Mani dietro la nuca, solleva il busto estendendo la schiena.", gif: "/exercises/back-ext-fitball.gif" },
  { id: "pike_fitball", nome: "Pike su Fitball", attrezzo: "Palla Grande", livello: "avanzato", muscoli: ["addominali", "spalle", "flessori anca"], tipo: "core", descrizione: "In plank con piedi sulla fitball. Solleva il bacino in alto portando la palla verso le mani con le gambe tese.", gif: "/exercises/pike-fitball.gif" },
  { id: "hamstring_curl_fitball", nome: "Hamstring Curl su Fitball", attrezzo: "Palla Grande", livello: "medio", muscoli: ["posteriori coscia", "glutei"], tipo: "gambe", descrizione: "Supina, talloni sulla fitball. Solleva il bacino e tira la palla verso i glutei flettendo le ginocchia.", gif: "/exercises/hamstring-curl-fitball.gif" },
  { id: "plank_fitball", nome: "Plank su Fitball", attrezzo: "Palla Grande", livello: "medio", muscoli: ["core", "spalle"], tipo: "stabilità", descrizione: "Avambracci sulla fitball, gambe tese a terra. Mantieni il corpo in linea sfidando l'instabilità.", gif: "/exercises/plank-fitball.gif" },
  { id: "rollout_fitball", nome: "Rollout Fitball", attrezzo: "Palla Grande", livello: "medio", muscoli: ["addominali", "dorsali"], tipo: "core", descrizione: "In ginocchio, avambracci sulla fitball. Scivola avanti allungando le braccia e torna con il core.", gif: "/exercises/rollout-fitball.gif" },
  { id: "bridge_fitball", nome: "Bridge Fitball", attrezzo: "Palla Grande", livello: "base", muscoli: ["glutei", "posteriori coscia"], tipo: "glutei", descrizione: "Supina, piedi sulla fitball. Solleva il bacino contraendo glutei al massimo. La palla sfida l'equilibrio.", gif: "/exercises/bridge-fitball.gif" },
  { id: "knee_tuck_fitball", nome: "Knee Tuck Fitball", attrezzo: "Palla Grande", livello: "medio", muscoli: ["addominali", "flessori anca"], tipo: "core", descrizione: "In plank con tibie sulla fitball. Fletti le ginocchia al petto facendo rotolare la palla sotto le gambe.", gif: "/exercises/knee-tuck-fitball.gif" },
  { id: "hip_thrust_fitball", nome: "Hip Thrust su Fitball", attrezzo: "Palla Grande", livello: "medio", muscoli: ["glutei", "posteriori coscia"], tipo: "glutei", descrizione: "Scapole sulla fitball, piedi a terra. Scendi col bacino e risali spingendo dai talloni.", gif: "/exercises/hip-thrust-fitball.gif" },
  { id: "superman_fitball", nome: "Superman su Fitball", attrezzo: "Palla Grande", livello: "medio", muscoli: ["erettori spinali", "glutei"], tipo: "schiena", descrizione: "Pancia sulla fitball, solleva braccio destro e gamba sinistra contemporaneamente. Alterna.", gif: "/exercises/superman-fitball.gif" },
  { id: "dead_bug_fitball", nome: "Dead Bug con Fitball", attrezzo: "Palla Grande", livello: "base", muscoli: ["addominali", "core profondo"], tipo: "core", descrizione: "Supina, fitball tra ginocchia e mani. Estendi braccio e gamba opposta senza far cadere la palla.", gif: "/exercises/dead-bug-fitball.gif" },

  // ==================== ELASTICO CHIUSO (7) ====================
  { id: "lateral_walk_elastico", nome: "Lateral Walk Elastico", attrezzo: "Elastico Chiuso", livello: "base", muscoli: ["gluteo medio", "abduttori"], tipo: "gambe", descrizione: "In piedi, elastico alle caviglie. Fai passi laterali mantenendo le gambe semi-flesse e l'elastico sempre in tensione.", gif: "/exercises/lateral-walk.gif" },
  { id: "side_leg_lift_elastico", nome: "Side Leg Lift con Elastico", attrezzo: "Elastico Chiuso", livello: "base", muscoli: ["gluteo medio", "abduttori"], tipo: "gambe", descrizione: "In piedi, elastico alle caviglie. Solleva la gamba tesa lateralmente mantenendo il busto dritto.", gif: "/exercises/side-leg-lift-elastico.gif" },
  { id: "glute_kickback_elastico", nome: "Glute Kickback con Elastico", attrezzo: "Elastico Chiuso", livello: "base", muscoli: ["glutei"], tipo: "glutei", descrizione: "In quadrupedia, elastico intorno alle ginocchia. Calcia una gamba dietro contro la resistenza dell'elastico.", gif: "/exercises/glute-kickback-elastico.gif" },
  { id: "squat_elastico", nome: "Squat con Elastico", attrezzo: "Elastico Chiuso", livello: "base", muscoli: ["quadricipiti", "glutei"], tipo: "gambe", descrizione: "In piedi, elastico sopra le ginocchia. Scendi in squat spingendo le ginocchia verso l'esterno contro la resistenza.", gif: "/exercises/squat-elastico.gif" },
  { id: "fire_hydrant_elastico", nome: "Fire Hydrant con Elastico", attrezzo: "Elastico Chiuso", livello: "base", muscoli: ["gluteo medio", "abduttori"], tipo: "glutei", descrizione: "In quadrupedia, elastico sopra le ginocchia. Apri lateralmente il ginocchio contro la resistenza.", gif: "/exercises/fire-hydrant-elastico.gif" },
  { id: "glute_bridge_elastico", nome: "Glute Bridge con Elastico", attrezzo: "Elastico Chiuso", livello: "base", muscoli: ["glutei", "adduttori"], tipo: "glutei", descrizione: "Supina, elastico sopra le ginocchia. Sali in bridge spingendo le ginocchia verso l'esterno.", gif: "/exercises/glute-bridge-elastico.gif" },
  { id: "plank_out_in_elastico", nome: "Plank Out-In", attrezzo: "Elastico Chiuso", livello: "medio", muscoli: ["core", "abduttori"], tipo: "stabilità", descrizione: "In plank, elastico alle caviglie. Apri e chiudi le gambe lateralmente mantenendo il core immobile.", gif: "/exercises/plank-out-in.gif" },

  // ==================== FASCIA APERTA (6) ====================
  { id: "row_fascia", nome: "Row con Fascia", attrezzo: "Fascia Aperta", livello: "base", muscoli: ["dorsali", "bicipiti", "romboidi"], tipo: "schiena", descrizione: "Seduta, fascia intorno ai piedi. Tira i gomiti indietro unendo le scapole.", gif: "/exercises/row-fascia.gif" },
  { id: "bicep_curl_fascia", nome: "Bicep Curl con Fascia", attrezzo: "Fascia Aperta", livello: "base", muscoli: ["bicipiti"], tipo: "braccia", descrizione: "In piedi sulla fascia, impugna i capi. Fletti i gomiti portando le mani alle spalle.", gif: "/exercises/bicep-curl-fascia.gif" },
  { id: "shoulder_press_fascia", nome: "Shoulder Press con Fascia", attrezzo: "Fascia Aperta", livello: "base", muscoli: ["deltoidi", "tricipiti"], tipo: "braccia", descrizione: "Seduta sulla fascia, impugna i capi alle spalle. Spingi verso il soffitto distendendo le braccia.", gif: "/exercises/shoulder-press-fascia.gif" },
  { id: "tricep_ext_fascia", nome: "Tricep Extension Fascia", attrezzo: "Fascia Aperta", livello: "base", muscoli: ["tricipiti"], tipo: "braccia", descrizione: "In piedi, una mano tiene la fascia dietro la schiena, l'altra la tira dal collo verso l'alto stendendo il gomito.", gif: "/exercises/tricep-ext-fascia.gif" },
  { id: "chest_press_fascia", nome: "Chest Press Fascia", attrezzo: "Fascia Aperta", livello: "base", muscoli: ["pettorali", "tricipiti"], tipo: "braccia", descrizione: "Fascia dietro la schiena, sotto le ascelle. Spingi le mani avanti unendole e torna con controllo.", gif: "/exercises/chest-press-fascia.gif" },
  { id: "lat_pull_fascia", nome: "Lat Pull Down con Fascia", attrezzo: "Fascia Aperta", livello: "base", muscoli: ["dorsali", "bicipiti"], tipo: "schiena", descrizione: "In piedi, fascia sopra la testa. Tirala verso il petto allargando le mani e unendo le scapole.", gif: "/exercises/lat-pull-fascia.gif" },

  // ==================== PESI (12) ====================
  { id: "shoulder_press_pesi", nome: "Shoulder Press con Manubri", attrezzo: "Pesi", livello: "base", muscoli: ["deltoidi", "tricipiti"], tipo: "braccia", descrizione: "In piedi, spingi i manubri dalle spalle verso il soffitto. Distendi completamente le braccia.", gif: "/exercises/shoulder-press-pesi.gif" },
  { id: "deadlift_leggero", nome: "Deadlift Leggero", attrezzo: "Pesi", livello: "base", muscoli: ["posteriori coscia", "glutei", "erettori spinali"], tipo: "gambe", descrizione: "In piedi, gambe leggermente flesse. Scendi con i manubri verso i piedi mantenendo la schiena piatta.", gif: "/exercises/deadlift-leggero.gif" },
  { id: "squat_pesi", nome: "Squat con Manubri", attrezzo: "Pesi", livello: "base", muscoli: ["quadricipiti", "glutei"], tipo: "gambe", descrizione: "In piedi, manubri lungo i fianchi o sulle spalle. Scendi in squat controllato mantenendo il petto aperto.", gif: "/exercises/squat-pesi.gif" },
  { id: "russian_twist_peso", nome: "Russian Twist con Peso", attrezzo: "Pesi", livello: "medio", muscoli: ["obliqui", "addominali"], tipo: "core", descrizione: "Seduta, gambe sollevate, manubrio al petto. Ruota il busto da un lato all'altro con controllo.", gif: "/exercises/russian-twist-peso.gif" },
  { id: "lateral_raise", nome: "Lateral Raise", attrezzo: "Pesi", livello: "base", muscoli: ["deltoidi laterali"], tipo: "braccia", descrizione: "In piedi, manubri lungo i fianchi. Solleva le braccia lateralmente fino all'altezza delle spalle.", gif: "/exercises/lateral-raise.gif" },
  { id: "front_raise", nome: "Front Raise", attrezzo: "Pesi", livello: "base", muscoli: ["deltoidi anteriori"], tipo: "braccia", descrizione: "In piedi, solleva i manubri tesi davanti a te fino all'altezza degli occhi alternando le braccia.", gif: "/exercises/front-raise.gif" },
  { id: "bent_over_row", nome: "Bent Over Row", attrezzo: "Pesi", livello: "base", muscoli: ["dorsali", "bicipiti", "romboidi"], tipo: "schiena", descrizione: "In piedi, busto avanti a 45°. Tira i manubri verso i fianchi portando i gomiti indietro.", gif: "/exercises/bent-over-row.gif" },
  { id: "goblet_squat", nome: "Goblet Squat", attrezzo: "Pesi", livello: "base", muscoli: ["quadricipiti", "glutei", "core"], tipo: "gambe", descrizione: "In piedi, manubrio al petto con entrambe le mani. Scendi in squat profondo mantenendo il petto alto.", gif: "/exercises/goblet-squat.gif" },
  { id: "reverse_lunge_pesi", nome: "Reverse Lunge con Manubri", attrezzo: "Pesi", livello: "medio", muscoli: ["quadricipiti", "glutei"], tipo: "gambe", descrizione: "In piedi, manubri lungo i fianchi. Fai un passo indietro e scendi in affondo. Torna alla posizione iniziale.", gif: "/exercises/reverse-lunge-pesi.gif" },
  { id: "bicep_curl_pesi", nome: "Bicep Curl con Manubri", attrezzo: "Pesi", livello: "base", muscoli: ["bicipiti"], tipo: "braccia", descrizione: "In piedi, palmi in avanti. Fletti le braccia portando i manubri alle spalle con gomiti fermi ai fianchi.", gif: "/exercises/bicep-curl-pesi.gif" },
  { id: "weighted_bridge", nome: "Weighted Bridge", attrezzo: "Pesi", livello: "medio", muscoli: ["glutei", "posteriori coscia"], tipo: "glutei", descrizione: "Supina, manubrio sul bacino. Solleva il bacino contraendo forte i glutei al massimo.", gif: "/exercises/weighted-bridge.gif" },
  { id: "reverse_fly", nome: "Reverse Fly", attrezzo: "Pesi", livello: "base", muscoli: ["deltoidi posteriori", "romboidi"], tipo: "schiena", descrizione: "In piedi, busto avanti. Apri le braccia lateralmente come ali, attivando la parte alta della schiena.", gif: "/exercises/reverse-fly.gif" },

  // ==================== RULLO (10) ====================
  { id: "roll_down_rullo", nome: "Roll Down su Rullo", attrezzo: "Rullo", livello: "base", muscoli: ["addominali", "colonna vertebrale"], tipo: "mobilità", descrizione: "Supina sul rullo lungo la colonna. Srotola lentamente la schiena vertebra per vertebra, mobilizzando la colonna.", gif: "/exercises/roll-down-rullo.gif" },
  { id: "core_balance_rullo", nome: "Core Balance su Rullo", attrezzo: "Rullo", livello: "medio", muscoli: ["core profondo", "stabilizzatori"], tipo: "stabilità", descrizione: "Supina sul rullo lungo la colonna, solleva gambe a tavolino alternandole senza oscillare.", gif: "/exercises/core-balance-rullo.gif" },
  { id: "bridge_rullo", nome: "Bridge con Rullo", attrezzo: "Rullo", livello: "base", muscoli: ["glutei", "posteriori coscia"], tipo: "glutei", descrizione: "Supina, entrambi i piedi sul rullo. Solleva il bacino al massimo contraendo i glutei, stabilizzando il rullo.", gif: "/exercises/bridge-rullo.gif" },
  { id: "stretch_schiena_rullo", nome: "Stretch Schiena su Rullo", attrezzo: "Rullo", livello: "base", muscoli: ["colonna toracica", "pettorali"], tipo: "mobilità", descrizione: "Supina, rullo sotto le scapole, mani alla nuca. Appoggia la testa indietro aprendo il petto. Mobilizza la zona dorsale.", gif: "/exercises/stretch-schiena-rullo.gif" },
  { id: "plank_rullo", nome: "Plank su Rullo", attrezzo: "Rullo", livello: "medio", muscoli: ["core", "spalle"], tipo: "stabilità", descrizione: "In plank, avambracci sul rullo. Mantieni la posizione sfidando l'instabilità dell'attrezzo.", gif: "/exercises/plank-rullo.gif" },
  { id: "chest_stretch_rullo", nome: "Chest Stretch Rullo", attrezzo: "Rullo", livello: "base", muscoli: ["pettorali", "deltoidi anteriori"], tipo: "mobilità", descrizione: "Supina sul rullo lungo la colonna. Apri le braccia a T o a candeliere, lasciandole scendere verso terra per lo stretch.", gif: "/exercises/chest-stretch-rullo.gif" },
  { id: "hip_release_rullo", nome: "Hip Release Rullo", attrezzo: "Rullo", livello: "base", muscoli: ["flessori anca", "quadricipiti"], tipo: "mobilità", descrizione: "Prona, rullo sotto le cosce. Rulla avanti e indietro per massaggiare e rilasciare la tensione nei flessori dell'anca.", gif: "/exercises/hip-release-rullo.gif" },
  { id: "swan_rullo", nome: "Swan sul Rullo", attrezzo: "Rullo", livello: "medio", muscoli: ["erettori spinali", "dorsali"], tipo: "schiena", descrizione: "Prona, avambracci sul rullo. Tira il rullo verso di te sollevando il petto in estensione.", gif: "/exercises/swan-rullo.gif" },
  { id: "hamstring_roll", nome: "Hamstring Roll", attrezzo: "Rullo", livello: "base", muscoli: ["posteriori coscia"], tipo: "mobilità", descrizione: "Seduta, gambe sul rullo. Solleva il bacino e rulla avanti e indietro per massaggiare i posteriori della coscia.", gif: "/exercises/hamstring-roll.gif" },
  { id: "mermaid_rullo", nome: "Mermaid sul Rullo", attrezzo: "Rullo", livello: "medio", muscoli: ["obliqui", "dorsali"], tipo: "mobilità", descrizione: "Seduta, rullo di fianco. Fai rotolare il rullo lateralmente allungando il fianco e la schiena.", gif: "/exercises/mermaid-rullo.gif" },

  // ==================== REFORMER (7) ====================
  { id: "reformer_footwork", nome: "Reformer Footwork", attrezzo: "Reformer", livello: "base", muscoli: ["quadricipiti", "glutei", "polpacci"], tipo: "gambe", descrizione: "Sdraiata sul carrello, piedi sulla barra. Spingi il carrello estendendo le gambe, poi torna con controllo.", gif: "/exercises/reformer-footwork.gif" },
  { id: "leg_circles_reformer", nome: "Leg Circles Reformer", attrezzo: "Reformer", livello: "medio", muscoli: ["adduttori", "abduttori", "flessori anca"], tipo: "gambe", descrizione: "Supina, piedi nelle cinghie. Disegna cerchi con le gambe mantenendo il bacino stabile sul carrello.", gif: "/exercises/leg-circles-reformer.gif" },
  { id: "elephant", nome: "Elephant", attrezzo: "Reformer", livello: "medio", muscoli: ["addominali", "posteriori coscia"], tipo: "core", descrizione: "In piedi sulla piattaforma, mani sulla barra. Spingi il carrello indietro con i piedi, arrotondando la colonna.", gif: "/exercises/elephant.gif" },
  { id: "long_stretch", nome: "Long Stretch", attrezzo: "Reformer", livello: "avanzato", muscoli: ["core", "spalle", "tricipiti"], tipo: "stabilità", descrizione: "In posizione plank sul Reformer, mani sulla barra e piedi sulla spalliera. Spingi il carrello avanti e indietro.", gif: "/exercises/long-stretch.gif" },
  { id: "knee_stretch", nome: "Knee Stretch", attrezzo: "Reformer", livello: "medio", muscoli: ["addominali", "quadricipiti"], tipo: "core", descrizione: "In ginocchio sul carrello, mani sulla barra. Spingi il carrello indietro con le ginocchia mantenendo il core attivo.", gif: "/exercises/knee-stretch.gif" },
  { id: "short_spine", nome: "Short Spine", attrezzo: "Reformer", livello: "avanzato", muscoli: ["colonna vertebrale", "addominali", "glutei"], tipo: "mobilità", descrizione: "Supina, piedi nelle cinghie. Arrotola la colonna sollevando le anche oltre le spalle, poi srotola con controllo.", gif: "/exercises/short-spine.gif" },
  { id: "reformer_bridge", nome: "Reformer Bridge", attrezzo: "Reformer", livello: "medio", muscoli: ["glutei", "posteriori coscia"], tipo: "glutei", descrizione: "Supina, piedi sulla barra. Solleva il bacino e spingi il carrello mantenendo i glutei attivi.", gif: "/exercises/reformer-bridge.gif" },

  // ==================== CADILLAC (4) ====================
  { id: "leg_spring_series", nome: "Leg Spring Series", attrezzo: "Cadillac", livello: "medio", muscoli: ["adduttori", "abduttori", "flessori anca"], tipo: "gambe", descrizione: "Supina, molle alle caviglie. Esegui cerchi, forbici e battiti con le gambe contro la resistenza delle molle.", gif: "/exercises/leg-spring-series.gif" },
  { id: "arm_spring_series", nome: "Arm Spring Series", attrezzo: "Cadillac", livello: "medio", muscoli: ["pettorali", "dorsali", "bicipiti"], tipo: "braccia", descrizione: "Supina o seduta, molle alle mani. Esegui movimenti di apertura, chiusura e cerchi con le braccia.", gif: "/exercises/arm-spring-series.gif" },
  { id: "roll_down_bar", nome: "Roll Down Bar", attrezzo: "Cadillac", livello: "medio", muscoli: ["addominali", "colonna vertebrale"], tipo: "core", descrizione: "Seduta, mani sulla barra con molla dall'alto. Arrotola la colonna vertebrale indietro con controllo, poi risali.", gif: "/exercises/roll-down-bar.gif" },
  { id: "hanging_pull_ups", nome: "Hanging Pull Ups", attrezzo: "Cadillac", livello: "avanzato", muscoli: ["dorsali", "bicipiti", "core"], tipo: "braccia", descrizione: "Appesa alla barra superiore del Cadillac. Tira il corpo verso l'alto usando la forza delle braccia e del dorso.", gif: "/exercises/hanging-pull-ups.gif" },

  // ==================== WUNDA CHAIR (4) ====================
  { id: "pike_chair", nome: "Pike Chair", attrezzo: "Wunda Chair", livello: "avanzato", muscoli: ["addominali", "spalle"], tipo: "core", descrizione: "In piedi sulla Chair, mani a terra davanti. Premi il pedale verso il basso con i piedi sollevando le anche.", gif: "/exercises/pike-chair.gif" },
  { id: "standing_pump", nome: "Standing Pump", attrezzo: "Wunda Chair", livello: "medio", muscoli: ["quadricipiti", "glutei", "core"], tipo: "gambe", descrizione: "In piedi di fronte alla Chair, un piede sul pedale. Premi il pedale verso il basso con controllo e risali.", gif: "/exercises/standing-pump.gif" },
  { id: "step_up_chair", nome: "Step Up Chair", attrezzo: "Wunda Chair", livello: "medio", muscoli: ["quadricipiti", "glutei"], tipo: "gambe", descrizione: "Di fronte alla Chair, sali con un piede sulla superficie e premi il pedale con l'altro. Alterna.", gif: "/exercises/step-up-chair.gif" },
  { id: "seated_press_down", nome: "Seated Press Down", attrezzo: "Wunda Chair", livello: "medio", muscoli: ["addominali", "dorsali"], tipo: "core", descrizione: "Seduta sulla Chair, mani ai lati. Premi il pedale verso il basso usando la forza del core e delle braccia.", gif: "/exercises/seated-press-down.gif" },

  // ==================== LADDER BARREL (3) ====================
  { id: "swan_barrel", nome: "Swan Barrel", attrezzo: "Ladder Barrel", livello: "medio", muscoli: ["erettori spinali", "glutei"], tipo: "schiena", descrizione: "Prona sulla curva del barrel. Solleva il busto in estensione sfruttando il supporto dell'arco.", gif: "/exercises/swan-barrel.gif" },
  { id: "side_stretch_barrel", nome: "Side Stretch Barrel", attrezzo: "Ladder Barrel", livello: "medio", muscoli: ["obliqui", "dorsali", "intercostali"], tipo: "mobilità", descrizione: "Fianco sul barrel, piedi agganciati alla scala. Fletti il busto lateralmente per un allungamento profondo.", gif: "/exercises/side-stretch-barrel.gif" },
  { id: "back_ext_barrel", nome: "Back Extension Barrel", attrezzo: "Ladder Barrel", livello: "medio", muscoli: ["erettori spinali", "glutei"], tipo: "schiena", descrizione: "Seduta sul barrel, piedi sulla scala. Scendi indietro in estensione e torna su con il core.", gif: "/exercises/back-ext-barrel.gif" },

  // ==================== SPINE CORRECTOR (3) ====================
  { id: "ab_curl_spine_corrector", nome: "Abdominal Curl Spine Corrector", attrezzo: "Spine Corrector", livello: "medio", muscoli: ["addominali"], tipo: "core", descrizione: "Schiena sulla curva dello Spine Corrector. Esegui crunch con ampia escursione sfruttando il supporto dell'arco.", gif: "/exercises/ab-curl-spine-corrector.gif" },
  { id: "back_ext_spine_corrector", nome: "Back Extension Spine Corrector", attrezzo: "Spine Corrector", livello: "medio", muscoli: ["erettori spinali"], tipo: "schiena", descrizione: "Pancia sull'arco dello Spine Corrector. Solleva il busto in estensione dorsale con le braccia a T.", gif: "/exercises/back-ext-spine-corrector.gif" },
  { id: "side_bend_spine_corrector", nome: "Side Bend Spine Corrector", attrezzo: "Spine Corrector", livello: "medio", muscoli: ["obliqui", "intercostali"], tipo: "mobilità", descrizione: "Fianco sull'arco dello Spine Corrector. Fletti lateralmente per allungare in profondità il fianco.", gif: "/exercises/side-bend-spine-corrector.gif" },
];

// ============================================================
// GENERATION FUNCTIONS
// ============================================================

function livelloAccessibile(eserLivello: string, userLivello: string): boolean {
  const accesso = LIVELLO_ACCESSO[userLivello] || ["base", "medio", "avanzato"];
  return accesso.includes(eserLivello);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generaEserciziGiorno(
  tema: string,
  attrezziUtente: string[],
  livello: string,
  storici: string[] = []
): Exercise[] {
  const temaConfig = TEMA_CONFIG[tema];
  if (!temaConfig) return [];

  // Normalize old equipment names
  const normalizedAttrezzi = attrezziUtente.map(a =>
    a === "Pesi(da 1 a 4kg)" ? "Pesi" : a
  );

  // Filter by user equipment and level
  const disponibili = EXERCISE_LIBRARY.filter(e =>
    normalizedAttrezzi.includes(e.attrezzo) &&
    livelloAccessibile(e.livello, livello)
  );

  // Filter by tema types
  const perTema = disponibili.filter(e => temaConfig.tipi.includes(e.tipo));

  // Exclude recently used
  let pool = perTema.filter(e => !storici.includes(e.id));
  if (pool.length < 6) pool = perTema;

  // For full_body_cardio, ensure variety of types
  if (tema === "full_body_cardio") {
    return pickVaried(pool, 6);
  }

  // For themed days, pick balanced exercises
  return pickBalanced(pool, temaConfig.tipi, 6);
}

function pickVaried(pool: Exercise[], count: number): Exercise[] {
  const byTipo: Record<string, Exercise[]> = {};
  pool.forEach(e => {
    if (!byTipo[e.tipo]) byTipo[e.tipo] = [];
    byTipo[e.tipo].push(e);
  });

  const result: Exercise[] = [];
  const tipos = shuffle(Object.keys(byTipo));

  // Pick one from each tipo first
  for (const tipo of tipos) {
    if (result.length >= count) break;
    const candidates = shuffle(byTipo[tipo]);
    if (candidates.length > 0) {
      result.push(candidates[0]);
      byTipo[tipo] = candidates.slice(1);
    }
  }

  // Fill remaining
  const remaining = shuffle(pool.filter(e => !result.find(r => r.id === e.id)));
  for (const e of remaining) {
    if (result.length >= count) break;
    result.push(e);
  }

  return result;
}

function pickBalanced(pool: Exercise[], tipi: string[], count: number): Exercise[] {
  const byTipo: Record<string, Exercise[]> = {};
  tipi.forEach(t => { byTipo[t] = []; });
  pool.forEach(e => {
    if (byTipo[e.tipo]) byTipo[e.tipo].push(e);
  });

  // Shuffle each group
  Object.keys(byTipo).forEach(k => { byTipo[k] = shuffle(byTipo[k]); });

  const result: Exercise[] = [];
  let roundIdx = 0;

  while (result.length < count) {
    let added = false;
    for (const tipo of tipi) {
      if (result.length >= count) break;
      if (byTipo[tipo] && byTipo[tipo].length > roundIdx) {
        result.push(byTipo[tipo][roundIdx]);
        added = true;
      }
    }
    if (!added) break;
    roundIdx++;
  }

  return result.slice(0, count);
}

// ============================================================
// LEGACY COMPAT - for components that reference old structure
// ============================================================

export const databaseEsercizi: Record<string, Exercise[]> = EXERCISE_LIBRARY.reduce((acc, e) => {
  if (!acc[e.attrezzo]) acc[e.attrezzo] = [];
  acc[e.attrezzo].push(e);
  return acc;
}, {} as Record<string, Exercise[]>);

export const suggerimentiNutrizionali: Record<string, string> = {
  "Corpo Libero": "Oggi focus sulla fluidità: bevi un bicchiere d'acqua extra prima di iniziare.",
  "Ring": "Il Ring richiede forza resistente: una manciata di mandorle 30 min prima ti darà energia.",
  "Rullo": "Sessione intensa: post-allenamento mangia frutta ricca di vitamina C.",
  "Pesi": "Lavori sul tono muscolare: inserisci una fonte proteica nel prossimo pasto.",
  "Elastico Chiuso": "L'elastico crea tensione costante: il magnesio aiuterà a prevenire i crampi.",
  "Fascia Aperta": "Focus sull'allungamento: mantieni l'idratazione alta.",
  "Palla Piccola": "Lavoro di precisione e core: un pasto leggero eviterà pesantezza.",
  "Palla Grande": "Stabilità e controllo oggi: non allenarti a stomaco pieno.",
  "Reformer": "Sessione Reformer: mantieni una buona idratazione e respira profondamente.",
  "Cadillac": "Allenamento sul Cadillac: concentrati sulla respirazione e il controllo.",
  "Wunda Chair": "Chair workout: energia costante con frutta secca prima della sessione.",
  "Ladder Barrel": "Barrel: stretching profondo, mantieni l'idratazione.",
  "Spine Corrector": "Spine Corrector: lavoro posturale, respira e allunga.",
};

export const cardioAlternativo: Exercise[] = [
  { id: "jumping_jacks_cardio", nome: "Jumping Jacks", attrezzo: "Corpo Libero", livello: "base", muscoli: ["corpo intero"], tipo: "cardio", descrizione: "Saltelli aprendo braccia e gambe contemporaneamente." },
  { id: "corsa_sul_posto", nome: "Corsa sul posto", attrezzo: "Corpo Libero", livello: "base", muscoli: ["gambe", "cardiovascolare"], tipo: "cardio", descrizione: "Corri sul posto portando le ginocchia mediamente alte." },
  { id: "mountain_climber_cardio", nome: "Mountain Climbers", attrezzo: "Corpo Libero", livello: "medio", muscoli: ["core", "spalle", "gambe"], tipo: "cardio", descrizione: "In plank, porta velocemente le ginocchia al petto alternandole." },
  { id: "burpees_slow", nome: "Burpees (Slow)", attrezzo: "Corpo Libero", livello: "medio", muscoli: ["corpo intero"], tipo: "cardio", descrizione: "Dalla posizione eretta a plank e ritorno, senza salto se preferisci." },
];
