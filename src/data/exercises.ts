export interface Exercise {
  nome: string;
  focus: string;
  reps: string;
  spiegazione: string;
}

export interface DayPlan {
  attrezzo: string;
  round: number;
}

export type WeekPlan = Record<string, DayPlan>;

export const CONFIG_LIVELLI: Record<string, { round: number; repsMoltiplicatore: number; tempoEsercizio: number; pausa: number }> = {
  "BASSO": { round: 2, repsMoltiplicatore: 0.8, tempoEsercizio: 30, pausa: 60 },
  "MEDIO": { round: 3, repsMoltiplicatore: 1, tempoEsercizio: 45, pausa: 45 },
  "AVANZATO": { round: 4, repsMoltiplicatore: 1.5, tempoEsercizio: 60, pausa: 30 }
};

export const ATTREZZO_SHORT: Record<string, string> = {
  "Corpo Libero": "CL",
  "Ring": "RG",
  "Rullo": "RL",
  "Pesi(da 1 a 4kg)": "PS",
  "Elastico Chiuso": "EC",
  "Fascia Aperta": "FA",
  "Palla Piccola": "PP",
  "Palla Grande": "PG"
};

export const TUTTI_GLI_ATTREZZI = [
  "Corpo Libero", "Ring", "Rullo", "Pesi(da 1 a 4kg)",
  "Elastico Chiuso", "Fascia Aperta", "Palla Piccola", "Palla Grande"
];

export const ATTREZZO_ICONS: Record<string, string> = {
  "Corpo Libero": "🧘",
  "Ring": "⭕",
  "Rullo": "🔄",
  "Pesi(da 1 a 4kg)": "🏋️",
  "Elastico Chiuso": "🔗",
  "Fascia Aperta": "🎗️",
  "Palla Piccola": "⚽",
  "Palla Grande": "🔵"
};

export const cardioAlternativo: Exercise[] = [
  { nome: "Jumping Jacks", reps: "180 sec", focus: "Cardio", spiegazione: "Saltelli aprendo braccia e gambe contemporaneamente." },
  { nome: "Corsa sul posto", reps: "240 sec", focus: "Cardio", spiegazione: "Corri sul posto portando le ginocchia mediamente alte." },
  { nome: "Mountain Climbers", reps: "120 sec", focus: "Cardio", spiegazione: "In posizione plank, porta velocemente le ginocchia al petto." },
  { nome: "Burpees (Slow)", reps: "180 sec", focus: "Cardio", spiegazione: "Dalla posizione eretta a plank e ritorno, senza salto se preferisci." }
];

export const suggerimentiNutrizionali: Record<string, string> = {
  "Corpo Libero": "Oggi focus sulla fluidità: bevi un bicchiere d'acqua extra prima di iniziare per mantenere i tessuti elastici.",
  "Ring": "Il Ring richiede molta forza resistente: una manciata di mandorle o noci 30 min prima ti darà l'energia giusta.",
  "Rullo": "Sessione intensa e massaggiante: post-allenamento mangia frutta ricca di vitamina C per aiutare il collagene.",
  "Pesi(da 1 a 4kg)": "Oggi lavori sul tono muscolare: assicurati di inserire una fonte proteica (uova, yogurt o legumi) nel prossimo pasto.",
  "Elastico Chiuso": "L'elastico crea tensione costante: il magnesio (es. cioccolato fondente o spinaci) aiuterà a prevenire i crampi.",
  "Fascia Aperta": "Focus sull'allungamento: mantieni l'idratazione alta per favorire la flessibilità dei muscoli.",
  "Palla Piccola": "Lavoro di precisione e core: un pasto leggero ma equilibrato eviterà il senso di pesantezza durante gli addominali.",
  "Palla Grande": "Stabilità e controllo oggi: assicurati di non allenarti a stomaco pieno.",
  "Riposo": "Giorno di recupero: prediligi tisane drenanti e fibre per aiutare il corpo a eliminare le tossine."
};

export const databaseEsercizi: Record<string, Exercise[]> = {
  "Corpo Libero": [
    // ADDOME
    { nome: "The hundred", focus: "Addome", reps: "100 molleggi", spiegazione: "Supina, solleva testa e spalle, distendi le gambe a 45 gradi (o piegate a 90°). Muovi le braccia su e giù in modo controllato mentre respiri: inspira per 5 movimenti, espira per 5." },
    { nome: "The roll up", focus: "Addome", reps: "15 reps", spiegazione: "Supina, braccia tese oltre la testa. Espira, arrotola la colonna fino a sederti e fletti avanti. Ritorna lentamente vertebra per vertebra." },
    { nome: "Single leg stretch", focus: "Addome", reps: "16 reps", spiegazione: "Supina, solleva testa e spalle. Porta un ginocchio al petto mentre l'altra gamba è distesa. Scambia le gambe espirando ad ogni movimento, mantenendo la parte superiore del corpo ferma." },
    { nome: "Double leg stretch", focus: "Addome", reps: "15 reps", spiegazione: "Supina con le ginocchia al petto, solleva testa e spalle. Espirando, stendi le braccia oltre la testa e le gambe in avanti. Inspirando, torna alla posizione di partenza. Questo esercizio rinforza l'intera parete addominale." },
    { nome: "Lower lift", focus: "Addome", reps: "15 reps", spiegazione: "Supina e mani dietro la nuca, gambe a 90°. Scendi con le gambe tese unite e risali senza inarcare la schiena." },
    { nome: "Criss cross", focus: "Addome", reps: "16 reps", spiegazione: "Supina, con le mani dietro la nuca e le ginocchia al petto, porta il gomito destro verso il ginocchio sinistro mentre distendi la gamba destra. Alterna i lati in modo controllato, lavorando sugli obliqui." },
    { nome: "Scissors", focus: "Addome", reps: "16 reps", spiegazione: "Supina e gambe tese al soffitto. Tira una gamba al viso con due impulsi mentre l'altra scende." },
    { nome: "Teaser prep", focus: "Addome", reps: "15 reps", spiegazione: "Supina, sali con il busto mantenendo le gambe a tavolino, braccia tese verso i piedi." },
    { nome: "The teaser", focus: "Addome", reps: "45 sec", spiegazione: "In equilibrio sugli ischi, gambe e braccia a V. Mantieni l'equilibrio." },
    { nome: "Plank classico", focus: "Addome", reps: "45 sec", spiegazione: "Prona, appoggio su avambracci e punte dei piedi. Mantieni il corpo in linea retta." },
    { nome: "Can can", focus: "Addome", reps: "16 reps", spiegazione: "Seduti su avambracci, gambe a tavolino. Ruota le ginocchia Dx/Sx/Dx e stendi le gambe in diagonale." },
    { nome: "Side bend", focus: "Addome", reps: "15 reps per lato", spiegazione: "Sul fianco, appoggio su una mano o avambraccio. Solleva il bacino creando un arco laterale perfetto. Sali e scendi." },
    { nome: "Side plank", focus: "Addome", reps: "45 sec per lato", spiegazione: "Sul fianco, appoggio su una mano o avambraccio. Solleva il bacino creando un arco laterale perfetto. Resta in alto in isometria." },
    { nome: "Neck pull", focus: "Addome", reps: "15 reps", spiegazione: "Supini, mani dietro la nuca, gambe tese. Sali in posizione seduta usando solo l'addome (senza slancio)." },
    // INTERNO GAMBA
    { nome: "Inner thigh lifts", focus: "Interno Gamba", reps: "16 reps per lato", spiegazione: "Sul fianco, gamba sopra piegata avanti, gamba sotto tesa. Solleva la gamba sotto verso l'alto." },
    { nome: "Inner thigh circles", focus: "Interno Gamba", reps: "16 reps per lato", spiegazione: "Sul fianco, gamba sopra piegata avanti, gamba sotto tesa. Fai piccoli cerchi con la gamba sotto." },
    { nome: "Beats on belly", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Prona, mani sotto la fronte, gambe tese sollevate. Batti i talloni velocemente tra loro." },
    { nome: "Frog press", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Supina, talloni uniti e punte aperte (rana). Stendi le gambe a 45° premendo l'interno coscia." },
    { nome: "Plie squat", focus: "Interno Gamba", reps: "16 reps", spiegazione: "In piedi, gambe larghe, punte in fuori. Scendi in squat mantenendo il busto dritto." },
    { nome: "Side leg kick", focus: "Interno Gamba", reps: "16 reps per lato", spiegazione: "Sul fianco, gamba sopra tesa, sposta il piede avanti a martello e indietro a punta." },
    { nome: "Diamond lift", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Supina, gambe a rombo (piedi uniti), stendi le gambe verso l'alto stringendo le cosce." },
    { nome: "Double leg circles", focus: "Interno Gamba", reps: "15 reps", spiegazione: "Supina, gambe tese al soffitto. Divarica le gambe a V, scendi, uniscile e risali (cerchio inverso)." },
    // GAMBE
    { nome: "Single leg circle", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Supina, una gamba tesa in alto, disegna cerchi ampi senza oscillare con il bacino." },
    { nome: "Side kick up/down", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Sul fianco, solleva la gamba tesa lateralmente e scendi con controllo senza toccare l'altra." },
    { nome: "Leg pull front", focus: "Gambe", reps: "14 reps", spiegazione: "Plank, solleva una gamba tesa verso l'alto mantenendo il bacino stabile, poi alterna." },
    { nome: "Lunges (affondi)", focus: "Gambe", reps: "14 reps per lato", spiegazione: "In piedi, fai un passo avanti e scendi con il ginocchio dietro verso terra a 90°." },
    { nome: "Side leg swing", focus: "Gambe", reps: "14 reps per lato", spiegazione: "In piedi o sul fianco, slancia la gamba avanti e indietro mantenendo il busto immobile." },
    { nome: "Wall sit", focus: "Gambe", reps: "45 sec", spiegazione: "Appoggiata al muro, schiena aderente, gambe a 90° come se fossi seduta. Mantieni." },
    { nome: "One leg squat prep", focus: "Gambe", reps: "14 reps per lato", spiegazione: "In piedi, solleva una gamba avanti, scendi leggermente con l'altra gamba e risali." },
    { nome: "Bicycle legs", focus: "Gambe", reps: "14 reps", spiegazione: "Supina, pedala con le gambe in aria disegnando cerchi ampi e fluidi." },
    { nome: "One leg kick", focus: "Gambe", reps: "14 reps", spiegazione: "Prona, sollevati sugli avambracci. Due calci veloci del tallone al gluteo e stendi, alternando." },
    // GLUTEI
    { nome: "Shoulder bridge", focus: "Glutei", reps: "14 reps", spiegazione: "Supina, piedi a terra, solleva il bacino contraendo forte i glutei." },
    { nome: "Bridge marching", focus: "Glutei", reps: "14 reps", spiegazione: "In Bridge, solleva un piede alla volta portando il ginocchio al petto senza abbassare il bacino." },
    { nome: "Single leg bridge", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Supina, una gamba tesa al soffitto, l'altra piegata. Solleva il bacino usando solo una gamba." },
    { nome: "Donkey kicks", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Quadrupedia, calcia il tallone verso il soffitto mantenendo il ginocchio a 90°." },
    { nome: "Fire hydrant", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Quadrupedia, apri il ginocchio lateralmente come un cane all'idrante, mantenendo il busto fermo." },
    { nome: "Prone leg lifts", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Prona, fronte sulle mani, solleva la gamba tesa dietro senza inarcare la schiena." },
    { nome: "Swimming legs", focus: "Glutei", reps: "45 sec", spiegazione: "Prona, gambe tese e sollevate, alterna piccoli molleggi velocissimi dall'anca." },
    { nome: "Heel beats", focus: "Glutei", reps: "45 sec", spiegazione: "Proni, gambe sollevate e tese, talloni uniti. Batti i talloni velocemente attivando i glutei." },
    { nome: "Leg pull back", focus: "Glutei", reps: "45 sec", spiegazione: "Reverse Plank (pancia in su), mani a terra. Solleva il bacino teso e alza alternativamente una gamba." },
    { nome: "Glute sqeeze", focus: "Glutei", reps: "45 sec", spiegazione: "Proni, gambe tese, mani sotto la fronte. Contrazione isometrica dei glutei (stringi e rilascia)." },
    // SCHIENA
    { nome: "Swimming", focus: "Schiena", reps: "12 reps", spiegazione: "Prona. braccia e gambe tese. Solleva alternativamente braccio e gamba opposta velocemente simulando il nuoto." },
    { nome: "Swan dive prep", focus: "Schiena", reps: "12 reps", spiegazione: "Prona, mani sotto le spalle. Estendi la schiena sollevando il busto, mantenendo il collo lungo." },
    { nome: "Spine stretch forward", focus: "Schiena", reps: "12 reps", spiegazione: "Seduta, gambe divaricate. Allungati in avanti come per superare un ostacolo, arrotondando la schiena." },
    { nome: "The saw", focus: "Schiena", reps: "12 reps", spiegazione: "Seduta, gambe divaricate e braccia a T. Ruota il busto e flettiti verso il piede opposto." },
    { nome: "Cat stretch", focus: "Schiena", reps: "12 reps", spiegazione: "Quadrupeda, arrotonda la schiena portando l'ombelico alla colonna, poi inarca leggermente guardando avanti." },
    { nome: "Single leg kick", focus: "Schiena", reps: "12 reps", spiegazione: "Prona sui gomiti: Spingi il petto lontano da terra. Calcia il gluteo con il tallone due volte per gamba." },
    { nome: "Double leg kick", focus: "Schiena", reps: "12 reps", spiegazione: "Prona, mani intrecciate dietro la schiena: 3 calci dei talloni ai glutei, poi stendi tutto sollevando il petto." },
    { nome: "Prone t-lift", focus: "Schiena", reps: "12 reps", spiegazione: "Prona, braccia aperte a T. Solleva il busto e le braccia avvicinando le scapole tra loro." },
    // BRACCIA
    { nome: "Tricep dips", focus: "Braccia", reps: "12 reps", spiegazione: "Seduta, mani dietro i fianchi. Solleva il bacino e fletti i gomiti verso l'indietro." },
    { nome: "Push ups pilates", focus: "Braccia", reps: "12 reps", spiegazione: "Plank, mani sotto le spalle. Scendi con il corpo in linea, gomiti stretti vicino ai fianchi." },
    { nome: "Boxing", focus: "Braccia", reps: "12 reps", spiegazione: "Seduta, busto leggermente avanti. Stendi le braccia alternandole con forza e controllo." },
    { nome: "Diamond push up", focus: "Braccia", reps: "12 reps", spiegazione: "Prona, mani a diamante sotto il petto. Spingi verso l'alto attivando i tricipiti." },
    { nome: "Circle arms", focus: "Braccia", reps: "12 reps", spiegazione: "In piedi, braccia tese lateralmente. Disegna piccoli cerchi veloci mantenendo le spalle basse." },
    { nome: "Arm pulses (back)", focus: "Braccia", reps: "12 reps", spiegazione: "In piedi, braccia tese dietro la schiena. Molleggia le mani l'una verso l'altra." },
    { nome: "Wall push up", focus: "Braccia", reps: "12 reps", spiegazione: "In piedi, mani al muro larghezza spalle. Piegamenti controllati mantenendo i talloni a terra." },
    { nome: "The seal", focus: "Braccia", reps: "12 reps", spiegazione: "Seduti, mani sotto le caviglie dall'interno. La pressione delle braccia contro le gambe attiva i bicipiti/tricipiti." },
  ],
  "Ring": [
    // ADDOME
    { nome: "Hundred con ring", focus: "Addome", reps: "100 molleggi", spiegazione: "Supina, ring tra le caviglie da stringere costantemente mentre molleggi con le braccia." },
    { nome: "Ring crunch", focus: "Addome", reps: "15 reps", spiegazione: "Supina, ring tra le mani. Sali in crunch e tocca le ginocchia con il ring." },
    { nome: "Roll up con crunch", focus: "Addome", reps: "15 reps", spiegazione: "Supina, braccia al soffitto, ring tra i palmi delle mani. Sali in posizione seduta premendo il ring verso l'interno per attivare il core profondo." },
    { nome: "Criss cross", focus: "Addome", reps: "16 reps", spiegazione: "Supini, gambe a tavolino, ring tra le mani davanti al petto. Ruota il busto portando l'esterno del ring oltre il ginocchio opposto." },
    { nome: "Ab curl squeeze", focus: "Addome", reps: "15 reps", spiegazione: "Supina, ring tra le cosce. Schiaccia il ring ogni volta che sali in crunch." },
    { nome: "Teaser", focus: "Addome", reps: "45 sec", spiegazione: "Seduta, ring tra le mani teso verso i piedi in equilibrio a V sul sacro." },
    { nome: "Obliqui con ring", focus: "Addome", reps: "16 reps", spiegazione: "Supina, ring tra le mani. Ruota il busto portando il ring all'esterno del fianco opposto." },
    { nome: "Lower lift con ring", focus: "Addome", reps: "15 reps", spiegazione: "Supina, mani sotto il sacro. Ring tra le caviglie. Scendi con le gambe tese e risali." },
    { nome: "Side plank press", focus: "Addome", reps: "45 sec per lato", spiegazione: "Plank laterale, ring sotto la mano libera. Mentre tieni la posizione, premi il ring verso terra con piccoli impulsi." },
    // INTERNO GAMBA
    { nome: "Aductor squeeze", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Supina, ring tra le ginocchia. Stringi il cerchio con forza e rilascia con controllo." },
    { nome: "Inner thigh pulse", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Supina, gambe tese a 90°, ring tra le caviglie. Fai piccoli impulsi rapidi verso l'interno senza mai mollare. Mantieni schiena diritta e spalle basse." },
    { nome: "Side ring press", focus: "Interno Gamba", reps: "16 reps per lato", spiegazione: "Sul fianco, ring tra le cosce (sopra il ginocchio). Stringi la gamba superiore verso quella inferiore." },
    { nome: "Ring bridge squeeze", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Supina, ring tra le ginocchia in posizione ponte. Stringi il cerchio mentre sollevi il bacino." },
    { nome: "Bridge adduction", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Ponte sulle spalle, ring tra le ginocchia. Mantieni il bacino alto e molleggia chiudendo il ring con l'interno coscia." },
    { nome: "Ring frog press", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Supina, piedi dentro il ring, stendi le gambe a 45° spingendo l'interno coscia verso l'esterno." },
    { nome: "Seated adduction", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Seduti (gambe flesse), ring tra le ginocchia. Schiaccia il ring mantenendo la schiena dritta e le spalle basse." },
    // GAMBE
    { nome: "Ring leg press", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Supina, un piede nel ring, mani che tengono l'altro lato. Spingi la gamba contro la resistenza del cerchio." },
    { nome: "Ring side kick", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Sul fianco, caviglia superiore nel ring. Schiaccia il ring con la gamba superiore verso quella inferiore." },
    { nome: "Ring hamstring curl", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Prona, ring incastrato tra gluteo e caviglia. Stringi il cerchio flettendo la gamba verso il gluteo." },
    { nome: "Standing balance ring", focus: "Gambe", reps: "14 reps per lato", spiegazione: "In piedi, ring appoggiato sulla coscia a 90°. Premi con la mano il ring contro la coscia mentre cerchi di sollevare il ginocchio." },
    { nome: "Forward lunge with ring", focus: "Gambe", reps: "14 reps per lato", spiegazione: "In piedi, fai un affondo avanti premendo il ring tra le mani per stabilizzare il core e le gambe." },
    { nome: "Ring squat hold", focus: "Gambe", reps: "45 sec", spiegazione: "In piedi, ring tra le cosce. Scendi in squat e rimani in posizione premendo costantemente il cerchio." },
    { nome: "Leg circles con ring", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Supina, un piede nel ring, mani all'altra estremità. Disegna cerchi con la gamba tesa usando il ring come assistenza e guida." },
    // GLUTEI
    { nome: "Ring donkey kick", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Quadrupedia, ring dietro il ginocchio. Stringi il ring tra polpaccio e coscia mentre calci su." },
    { nome: "Prone ring squeeze", focus: "Glutei", reps: "14 reps", spiegazione: "Prona, ring tra le caviglie. Piega le ginocchia a 90° e schiaccia il ring con i talloni." },
    { nome: "Single leg bridge ring", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Supina, una gamba in alto, l'altra a 90 gradi sul lato posteriore del ring, alza i glutei schiacciando il ring." },
    { nome: "Clamshell ring", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Sul fianco, ring tra le ginocchia. Schiaccia il ring controllando la resistenza." },
    { nome: "Swimming con ring", focus: "Glutei", reps: "45 sec", spiegazione: "Prona, ring tra le mani avanti sollevato, gambe che nuotano velocemente." },
    { nome: "Abductor bridge", focus: "Glutei", reps: "14 reps", spiegazione: "Supina, ginocchia dentro il ring, alzati in ponte spingendo le gambe verso l'esterno." },
    { nome: "Side leg press", focus: "Glutei", reps: "14 reps", spiegazione: "Sul fianco, ring tra le caviglie (all'esterno). Solleva entrambe le gambe; la superiore preme in basso attivando il gluteo medio." },
    // SCHIENA
    { nome: "Ring swan", focus: "Schiena", reps: "12 reps", spiegazione: "Prona, mani sul ring appoggiato a terra davanti a te. Premi il cerchio mentre sollevi il petto." },
    { nome: "Ring spine twist", focus: "Schiena", reps: "12 reps", spiegazione: "Seduta, gambe tese, ring tra le mani avanti. Ruota il busto lateralmente mantenendo la schiena dritta." },
    { nome: "Ring back extension", focus: "Schiena", reps: "12 reps", spiegazione: "Prona, ring dietro la schiena tra le mani. Solleva il petto portando il cerchio verso i talloni." },
    { nome: "Overhead ring reach", focus: "Schiena", reps: "12 reps", spiegazione: "Supina, ring tra le mani. Porta il cerchio dietro la testa cercando di toccare terra senza inarcare la schiena." },
    { nome: "Ring lat pull", focus: "Schiena", reps: "12 reps", spiegazione: "In piedi, ring sopra la testa. Tiralo giù verso il petto immaginando di unire le scapole dietro." },
    { nome: "T-lift with ring", focus: "Schiena", reps: "12 reps", spiegazione: "Prona, ring tra le mani, braccia tese avanti. Solleva braccia e testa mantenendo lo sguardo a terra." },
    { nome: "Lateral stretch ring", focus: "Schiena", reps: "12 reps", spiegazione: "Seduti, ring sopra la testa. Fletti il busto lateralmente premendo il cerchio per stabilizzare le scapole." },
    // BRACCIA
    { nome: "Ring chest press", focus: "Braccia", reps: "12 reps", spiegazione: "In piedi, ring tra le mani davanti al petto. Schiaccia con i palmi e rilascia lentamente." },
    { nome: "Ring overhead press", focus: "Braccia", reps: "12 reps", spiegazione: "In piedi, ring sopra la testa. Schiaccia il cerchio con piccoli impulsi lavorando su spalle e tricipidi." },
    { nome: "Side ring triceps", focus: "Braccia", reps: "12 reps per lato", spiegazione: "In piedi, ring appoggiato sulla spalla, premilo con la mano opposta verso il basso." },
    { nome: "Bicep curl ring", focus: "Braccia", reps: "12 reps per lato", spiegazione: "In piedi, ring tra spalla e palmo della mano. Fletti il braccio premendo il cerchio." },
    { nome: "Ring behind back", focus: "Braccia", reps: "12 reps", spiegazione: "In piedi, ring dietro la schiena. Stringi le mani tra loro premendo il cerchio." },
    { nome: "Front arm pulses", focus: "Braccia", reps: "12 reps", spiegazione: "In piedi, braccia tese avanti con ring. Piccoli impulsi veloci di pressione." },
    { nome: "Tricep squeeze ring", focus: "Braccia", reps: "12 reps", spiegazione: "Seduta, ring dietro la nuca, gomiti stretti. Schiaccia il cerchio con le mani." },
    { nome: "One arm press", focus: "Braccia", reps: "12 reps per lato", spiegazione: "In piedi, ring contro il fianco, premilo con l'esterno del braccio teso." },
  ],
  "Rullo": [
    // ADDOME
    { nome: "Dead bug rullo", focus: "Addome", reps: "16 reps", spiegazione: "Supina sul rullo (lungo), solleva una gamba a tavolino alla volta alternando senza oscillare o cadere." },
    { nome: "Toe taps rullo", focus: "Addome", reps: "16 reps", spiegazione: "Supina sul rullo (lungo), tocca terra con le punte dei piedi alternandole." },
    { nome: "Ab curl rullo", focus: "Addome", reps: "15 reps", spiegazione: "Supina sul rullo (lungo), esegui piccoli crunch cercando di non oscillare lateralmente." },
    { nome: "Plank sul rullo", focus: "Addome", reps: "45 sec", spiegazione: "Prona, avambracci sul rullo. Mantieni la posizione di plank sfidando l'instabilità." },
    { nome: "Mountain climber rullo", focus: "Addome", reps: "45 sec", spiegazione: "Prona, mani sul rullo, porta le ginocchia al petto velocemente." },
    { nome: "Leg lowering", focus: "Addome", reps: "15 reps", spiegazione: "Rullo trasversale sotto il sacro. Mani alle estremità del rullo. Scendi con le gambe tese e unite verso il basso e risali (Lavoro intenso addome basso)." },
    { nome: "Double leg stretch", focus: "Addome", reps: "16 reps", spiegazione: "Sdraiati sul rullo lungo la colonna. Gambe a tavolino. Stendi braccia e gambe in direzioni opposte, mantenendo la schiena aderente al rullo." },
    { nome: "Knee pull in", focus: "Addome", reps: "15 reps", spiegazione: "Plank alto, tibie sopra il rullo trasversale. Respira e fletti le ginocchia al petto facendo rotolare il rullo sotto le gambe." },
    // INTERNO GAMBA
    { nome: "Adductor slide", focus: "Interno Gamba", reps: "16 reps per lato", spiegazione: "In piedi, un piede a terra, l'altro sul rullo (laterale). Fai scivolare il rullo lontano e riportalo verso di te usando l'interno coscia." },
    { nome: "Frog press", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Rullo trasversale sotto il sacro. Talloni uniti, ginocchia aperte. Stendi le gambe a 45° premendo forte i talloni tra loro." },
    { nome: "Inner thigh pulse", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Rullo trasversale sotto il sacro. Gambe a V al soffitto. Chiudi e apri le gambe con piccoli impulsi veloci (molleggi interni)." },
    { nome: "Adductor lift", focus: "Interno Gamba", reps: "16 reps per lato", spiegazione: "Sul fianco, gamba sopra sul rullo, gamba sotto tesa. Solleva la gamba inferiore verso il soffitto senza muovere il rullo." },
    // GAMBE
    { nome: "Single leg roller bridge", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Supina, un piede sul rullo, l'altra gamba tesa in alto. Solleva il bacino stabilizzando il rullo." },
    { nome: "Hamstring roll", focus: "Gambe", reps: "14 reps", spiegazione: "Seduta, mani a terra dietro, gambe sul rullo. Solleva il bacino e rulla avanti/dietro per massaggiare e tonificare le cosce." },
    { nome: "Lunge con rullo", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Affondo, piede posteriore appoggiato sul rullo. Scendi in affondo mentre il piede dietro scivola sul rullo." },
    { nome: "Bicycle", focus: "Gambe", reps: "14 reps", spiegazione: "Rullo trasversale sotto il sacro. Gambe in aria. Pedalata ampia; l'altezza del rullo aumenta la mobilità dell'anca." },
    { nome: "Scissors", focus: "Gambe", reps: "14 reps", spiegazione: "Rullo trasversale sotto il sacro. Gambe tese. Sforbiciata ampia: una gamba tesa verso il viso, l'altra scende verso terra." },
    { nome: "Leg circles", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Rullo trasversale sotto il sacro. Una gamba al soffitto. Disegna cerchi ampi con la gamba tesa (stabilità del bacino rialzato)." },
    // GLUTEI
    { nome: "Glute bridge", focus: "Glutei", reps: "14 reps", spiegazione: "Supina, entrambi i piedi sul rullo. Solleva il bacino al massimo contraendo i glutei." },
    { nome: "Single leg bridge", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Come il ponte, ma con una gamba tesa. Focus sulla spinta del gluteo della gamba sul rullo." },
    { nome: "Prone leg lift", focus: "Glutei", reps: "14 reps", spiegazione: "Prona, rullo sotto le cosce. Solleva le gambe tese alternandole." },
    { nome: "Bridge pulses", focus: "Glutei", reps: "14 reps", spiegazione: "In posizione di ponte sul rullo, fai piccoli molleggi verso l'alto con il bacino." },
    { nome: "Marching bridge", focus: "Glutei", reps: "14 reps", spiegazione: "Ponte sulle spalle con i piedi sul rullo. Solleva un piede alla volta dal rullo mantenendo il bacino alto e immobile." },
    { nome: "Frog bridge", focus: "Glutei", reps: "14 reps", spiegazione: "Ponte, piante dei piedi unite sul rullo, ginocchia aperte. Solleva il bacino in posizione rana per isolare i glutei laterali." },
    { nome: "Hip extension", focus: "Glutei", reps: "14 reps", spiegazione: "Proni, rullo trasversale sotto le caviglie. Solleva una gamba tesa alla volta contraendo il gluteo (pressione opposta sul rullo)." },
    // SCHIENA
    { nome: "Swan sul rullo", focus: "Schiena", reps: "12 reps", spiegazione: "Prona, avambracci sul rullo avanti a te. Tira il rullo verso di te sollevando il petto in estensione." },
    { nome: "Thoracic extension", focus: "Schiena", reps: "12 reps", spiegazione: "Supina, rullo trasversale sotto le scapole, mani alla nuca. Appoggia la testa verso terra aprendo il petto, poi risali." },
    { nome: "Roller spine stretch", focus: "Schiena", reps: "12 reps", spiegazione: "Seduta, gambe divaricate, rullo tra le mani a terra. Fai rotolare il rullo avanti allungando la colonna." },
    { nome: "Swimming con rullo", focus: "Schiena", reps: "12 reps", spiegazione: "Prona, mani sul rullo tese avanti. Solleva gambe e petto alternando piccoli movimenti delle gambe." },
    { nome: "Mermaid sul rullo", focus: "Schiena", reps: "12 reps per lato", spiegazione: "Seduti, rullo di fianco. Fai rotolare il rullo lateralmente allungando tutto il fianco e la schiena." },
    { nome: "Cat stretch sul rullo", focus: "Schiena", reps: "12 reps", spiegazione: "Quadrupedia, mani sopra il rullo. Arrotonda la schiena portando il rullo verso le ginocchia, poi estendi." },
    // BRACCIA
    { nome: "Arm circles rullo", focus: "Braccia", reps: "12 reps", spiegazione: "Supina sul rullo (lungo): Disegna grandi cerchi con le braccia." },
    { nome: "Scapular protraction", focus: "Braccia", reps: "12 reps", spiegazione: "Supina sul rullo (lungo): Spingi le braccia al soffitto staccando le scapole dal rullo." },
    { nome: "Forearm roll-out", focus: "Braccia", reps: "12 reps", spiegazione: "In ginocchio, avambracci sul rullo. Scivola avanti col busto finché le braccia sono tese e ritorna." },
    { nome: "Rolling plank side", focus: "Braccia", reps: "45 sec", spiegazione: "Plank laterale, avambraccio sul rullo. Mantieni la posizione cercando di non far muovere l'attrezzo." },
    { nome: "Triceps press", focus: "Braccia", reps: "12 reps", spiegazione: "Sdraiati sul rullo lungo la colonna. Mani a terra. Solleva leggermente il bacino facendo forza sui tricipiti e sui piedi (tenuta)." },
    { nome: "Push-ups sul rullo", focus: "Braccia", reps: "12 reps", spiegazione: "Mani sul rullo a terra. Esegui i piegamenti mantenendo il rullo stabile sotto le spalle." },
  ],
  "Pesi(da 1 a 4kg)": [
    // ADDOME
    { nome: "Weighted crunch", focus: "Addome", reps: "15 reps", spiegazione: "Supina, peso al petto. Sali in crunch espirando profondamente." },
    { nome: "Weighted roll up", focus: "Addome", reps: "15 reps", spiegazione: "Supina, braccia al soffitto con i pesi. Sali lentamente." },
    { nome: "Russian twist", focus: "Addome", reps: "16 reps", spiegazione: "Seduta, gambe sollevate. Ruota il peso da un lato all'altro del bacino." },
    { nome: "Toe touch weighted", focus: "Addome", reps: "15 reps", spiegazione: "Supina, gambe tese al soffitto, peso tra le mani. Prova a toccare i piedi con il peso." },
    { nome: "Weighted dead bug", focus: "Addome", reps: "15 reps per lato", spiegazione: "Supina, peso in una mano, scendi con braccio e gamba opposta." },
    { nome: "Side plank reach", focus: "Addome", reps: "15 reps per lato", spiegazione: "Plank laterale, passa il peso sotto il fianco e poi portalo al soffitto." },
    { nome: "Side plank isometrico", focus: "Addome", reps: "25 sec per lato", spiegazione: "In posizione di plank laterale, sollevare un manubrio verso l'alto con il braccio libero, attivando glutei e obliqui, evitando la caduta del bacino." },
    { nome: "Side bending (piegamenti laterali)", focus: "Addome", reps: "15 reps per lato", spiegazione: "In piedi, con un manubrio in una mano, inclinare il busto lateralmente dallo stesso lato, poi tornare in posizione eretta contraendo gli addominali. Mantenere le spalle frontali." },
    { nome: "Woodchopper", focus: "Addome", reps: "15 reps per lato", spiegazione: "In Piedi, porta il peso dall'alto (diagonale) al ginocchio opposto." },
    { nome: "Weighted v-sit", focus: "Addome", reps: "45 sec", spiegazione: "Seduta, mantieni la V con il peso teso davanti a te." },
    { nome: "Double leg stretch", focus: "Addome", reps: "15 reps", spiegazione: "Supini, ginocchia al petto, pesi alle mani. Stendi braccia e gambe." },
    // INTERNO GAMBA
    { nome: "Plie squat con peso", focus: "Interno Gamba", reps: "16 reps", spiegazione: "In piedi, gambe larghe, punte in fuori. Tieni i pesi al petto o verso terra mentre scendi in squat profondo." },
    { nome: "Inner thigh lift con peso", focus: "Interno Gamba", reps: "16 reps per lato", spiegazione: "Sul fianco, appoggia un manubrio sull'interno della coscia della gamba sotto e solleva verso l'alto." },
    { nome: "Affondi laterali", focus: "Interno Gamba", reps: "16 reps per lato", spiegazione: "Partendo in piedi, fai un passo ampio verso il lato, piegando il ginocchio corrispondente e tenendo l'altra gamba distesa. Impugna i manubri lungo i fianchi per aumentare il carico." },
    { nome: "Affondi incrociati", focus: "Interno Gamba", reps: "16 reps per lato", spiegazione: "Esegui un affondo portando una gamba indietro e diagonalmente rispetto all'altra, tenendo un manubrio al petto o due manubri lungo i fianchi." },
    // GAMBE
    { nome: "Weighted squat", focus: "Gambe", reps: "14 reps", spiegazione: "In piedi, pesi sulle spalle o lungo i fianchi. Scendi in squat controllato mantenendo il petto aperto." },
    { nome: "Alternating lunges", focus: "Gambe", reps: "14 reps", spiegazione: "In piedi, affondi alternati avanti tenendo i pesi tesi lungo i fianchi." },
    { nome: "Deadlift (stacco)", focus: "Gambe", reps: "14 reps", spiegazione: "In piedi, gambe leggermente flesse. Scendi con i pesi verso i piedi mantenendo la schiena piatta." },
    { nome: "Side kick con peso", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Sul fianco, appoggia il peso sulla coscia esterna. Solleva e abbassa la gamba tesa con controllo." },
    { nome: "Calf raises con pesi", focus: "Gambe", reps: "14 reps", spiegazione: "In piedi, pesi lungo i fianchi. Sali sulle punte dei piedi e scendi lentamente senza toccare i talloni." },
    { nome: "Weighted wall sit", focus: "Gambe", reps: "45 sec", spiegazione: "Schiena al muro in posizione di sedia, pesi sulle cosce. Tenuta isometrica; i pesi aumentano il carico su glutei e quadricipiti." },
    // GLUTEI
    { nome: "Weighted bridge", focus: "Glutei", reps: "14 reps", spiegazione: "Supina, peso sul bacino. Solleva e contrai forte i glutei." },
    { nome: "Single leg bridge weighted", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Supina, peso sul fianco della gamba a terra. Solleva il bacino." },
    { nome: "Deadlift una gamba", focus: "Glutei", reps: "14 reps per lato", spiegazione: "In piedi, peso nella mano opposta alla gamba che si alza indietro. Fletti il busto avanti." },
    { nome: "Weighted frog pumps", focus: "Glutei", reps: "14 reps", spiegazione: "Supina, piante dei piedi unite, peso sul bacino. Solleva il bacino." },
    { nome: "Dondey kick", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Quadrupedia, peso incastrato nell'incavo del ginocchio. Spingi il tallone verso il soffitto contraendo il gluteo (carico diretto)." },
    { nome: "ClamShell weighted", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Sul fianco, peso appoggiato lateralmente sulla coscia. Apri il ginocchio superiore contro la resistenza del peso tenendo i piedi uniti." },
    // SCHIENA
    { nome: "Reverse fly", focus: "Schiena", reps: "12 reps", spiegazione: "In piedi e busto avanti. Apri le braccia lateralmente come ali, attivando la parte alta della schiena." },
    { nome: "Spine twist con pesi", focus: "Schiena", reps: "12 reps", spiegazione: "Seduta e schiena dritta, pesi al petto. Ruota il busto espirando e mantieni la colonna lunga." },
    { nome: "Renegade row static", focus: "Schiena", reps: "12 reps", spiegazione: "In plank, mantieni la posizione sollevando un peso e tenendolo fermo contro il fianco per 5 secondi." },
    { nome: "One arm row", focus: "Schiena", reps: "12 reps", spiegazione: "In quadrupedia o flessi avanti, peso in una mano. Tira il peso verso l'anca portando il gomito indietro (lavoro di dorsale)." },
    { nome: "Bird-dog con peso", focus: "Schiena", reps: "12 reps", spiegazione: "Quadrupedia, un peso in una mano. Solleva braccio (col peso) e gamba opposta: sfida massima per la catena crociata." },
    // BRACCIA
    { nome: "Bicep curls", focus: "Braccia", reps: "12 reps", spiegazione: "In piedi, palmi in avanti. Fletti le braccia portando i pesi alle spalle. Gomiti incollati ai fianchi." },
    { nome: "Tricep kickbacks", focus: "Braccia", reps: "12 reps", spiegazione: "Busto avanti, gomiti alti e fermi. Distendi le braccia indietro contraendo i tricipiti." },
    { nome: "Overhead press", focus: "Braccia", reps: "12 reps", spiegazione: "In piedi, spingi i pesi dalle spalle verso il soffitto, distendendo completamente le braccia." },
    { nome: "Front raises", focus: "Braccia", reps: "12 reps", spiegazione: "In piedi, solleva i pesi tesi davanti a te fino all'altezza degli occhi in maniera alternata." },
    { nome: "Hammer curls", focus: "Braccia", reps: "12 reps", spiegazione: "In piedi, palmi rivolti verso l'interno. Fletti le braccia mantenendo i pesi in verticale." },
    { nome: "Chest press", focus: "Braccia", reps: "12 reps", spiegazione: "Supina, pesi orizzontali. Spingi i pesi verso l'alto partendo dal petto, unendo i manubri al centro." },
    { nome: "Skull crushers", focus: "Braccia", reps: "12 reps", spiegazione: "Supina, braccia tese in alto. Fletti solo i gomiti portando i pesi alle tempie e risali." },
  ],
  "Elastico Chiuso": [
    // ADDOME
    { nome: "Bicycle band", focus: "Addome", reps: "16 reps", spiegazione: "Supina, elastico alle piante dei piedi. Pedala spingendo contro la resistenza." },
    { nome: "Band leg lowers", focus: "Addome", reps: "15 reps", spiegazione: "Supina, elastico alle caviglie. Scendi con le gambe tese mantenendo la tensione verso l'esterno." },
    { nome: "Plank out-in", focus: "Addome", reps: "16 reps", spiegazione: "Plank alto, elastico intorno alle caviglie. Apri chiudi le gambe lateralmente (passi o salti) mantenendo il core immobile." },
    { nome: "Mountain climbers band", focus: "Addome", reps: "45 sec", spiegazione: "Prona, elastico alle piante dei piedi. Tira le ginocchia al petto alternandole." },
    { nome: "Dead bug band", focus: "Addome", reps: "16 reps", spiegazione: "Supina, elastico ai piedi. Spingi una gamba avanti mentre l'altra resiste a tavolino." },
    { nome: "Scissors band", focus: "Addome", reps: "16 reps", spiegazione: "Supina, elastico alle caviglie. Sforbicia verticalmente mantenendo l'elastico teso." },
    { nome: "Side plank leg lift", focus: "Addome", reps: "15 reps per lato", spiegazione: "Side Plank, elastico sopra le ginocchia. Solleva la gamba sopra." },
    { nome: "Obliqui band", focus: "Addome", reps: "16 reps", spiegazione: "Seduta, elastico ai polsi. Ruota il busto tirando l'elastico verso l'esterno." },
    { nome: "Hollow position", focus: "Addome", reps: "45 sec", spiegazione: "Supina, con l'elastico attorno ai piedi, spingere con i piedi e contemporaneamente sollevare testa, spalle e gambe da terra, mantenendo la zona lombare incollata al pavimento." },
    // INTERNO GAMBA
    { nome: "Adductor v-hold band", focus: "Interno Gamba", reps: "45 sec", spiegazione: "Supina, elastico alle caviglie, gambe a V. Spingi verso l'esterno e mantieni." },
    { nome: "Band squat", focus: "Interno Gamba", reps: "16 reps", spiegazione: "In Piedi, elastico sopra le ginocchia. Squat spingendo le ginocchia in fuori." },
    { nome: "Inner thigh pull", focus: "Interno Gamba", reps: "16 reps per lato", spiegazione: "In piedi, elastico a un palo o caviglia. Tira la gamba verso il centro del corpo." },
    { nome: "Plié band pulses", focus: "Interno Gamba", reps: "15 reps", spiegazione: "In plié, elastico sopra le ginocchia. Molleggia spingendo in fuori." },
    { nome: "Bridge band squeeze", focus: "Interno Gamba", reps: "16 reps", spiegazione: "In bridge, elastico sopra le ginocchia. Apri e chiudi le ginocchia restando su." },
    { nome: "Seated band abduction", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Seduta, elastico sopra le ginocchia. Apri e chiudi le ginocchia concentrandoti sul ritorno controllato." },
    { nome: "Inner thigh pulse", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Sul fianco, elastico alle caviglie. Solleva la gamba sotto verso l'alto superando la resistenza della gamba sopra." },
    { nome: "Adductor slide", focus: "Interno Gamba", reps: "16 reps", spiegazione: "In piedi, elastico alle caviglie. Fai scivolare un piede lateralmente e riportalo al centro con un movimento di adduzione." },
    // GAMBE
    { nome: "Lateral band walk", focus: "Gambe", reps: "14 reps", spiegazione: "In piedi, elastico alle caviglie. Fai passi laterali mantenendo le gambe semi-flesse e l'elastico sempre teso." },
    { nome: "Standing leg lift", focus: "Gambe", reps: "14 reps lato", spiegazione: "In piedi, elastico alle caviglie. Solleva la gamba tesa lateralmente mantenendo il busto dritto." },
    { nome: "Banded side kick up", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Sul fianco, elastico alle caviglie. Solleva la gamba superiore il più possibile e scendi lentamente." },
    { nome: "Forward kick banded", focus: "Gambe", reps: "14 reps per lato", spiegazione: "In piedi, elastico alle caviglie. Calcia in avanti con la gamba tesa attivando il quadricipite." },
    { nome: "Wall sit con elastico", focus: "Gambe", reps: "45 sec", spiegazione: "Contro il muro, elastico sopra le ginocchia. Mantieni lo squat spingendo le ginocchia verso l'esterno." },
    { nome: "Hamstring curl", focus: "Gambe", reps: "14 reps per lato", spiegazione: "In piedi, elastico alle caviglie. Fletti il ginocchio portando il tallone al gluteo (Lavoro posteriore della coscia)." },
    // GLUTEI
    { nome: "Glute bridge band", focus: "Glutei", reps: "14 reps", spiegazione: "Supina, elastico sopra le ginocchia. Sali in bridge spingendo i talloni." },
    { nome: "Donkey kicks band", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Quadrupedi, elastico intorno alle ginocchia. Calcia una gamba dietro." },
    { nome: "Fire hydrant band", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Quadrupedia, elastico sopra le ginocchia. Apri lateralmente." },
    { nome: "Side kick band", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Sul fianco, calcia avanti e dietro mantenendo l'elastico teso." },
    { nome: "Prone band lifts", focus: "Glutei", reps: "14 reps", spiegazione: "Prona, elastico alle caviglie. Solleva entrambe le gambe tese." },
    { nome: "Plank glute lift", focus: "Glutei", reps: "14 reps", spiegazione: "Plank alto, elastico alle caviglie. Solleva una gamba tesa alla volta senza inarcare la schiena." },
    { nome: "Glute rainbow", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Quadrupedia, elastico alle caviglie. Solleva la gamba tesa e disegna un arco da destra a sinistra oltre la gamba d'appoggio." },
    // SCHIENA
    { nome: "Banded lat pull down", focus: "Schiena", reps: "12 reps", spiegazione: "In piedi, braccia tese sopra la testa, elastico tra i polsi. Tira i gomiti verso il basso aprendo l'elastico." },
    { nome: "Banded row", focus: "Schiena", reps: "12 reps", spiegazione: "Seduta, elastico intorno ai piedi, impugnalo con le mani. Tira i gomiti indietro unendo le scapole." },
    { nome: "Rear delt fly", focus: "Schiena", reps: "12 reps", spiegazione: "In piedi, braccia tese avanti all'altezza del petto, elastico tra i polsi. Apri le braccia lateralmente." },
    { nome: "Archer pull", focus: "Schiena", reps: "12 per lato", spiegazione: "In piedi, tieni un lato dell'elastico fermo, tira l'altro indietro come per scoccare una freccia." },
    { nome: "Superman banded", focus: "Schiena", reps: "12 reps", spiegazione: "Prona, elastico tra i polsi. Solleva busto e braccia aprendo leggermente l'elastico verso l'esterno." },
    { nome: "Shoulder retraction", focus: "Schiena", reps: "12 reps", spiegazione: "In piedi, braccia tese avanti, elastico tra i polsi. Apri solo di 10 cm focalizzandoti sulle scapole." },
    { nome: "Prone y-press", focus: "Schiena", reps: "12 reps", spiegazione: "Proni, braccia a Y, elastico ai polsi. Solleva petto e braccia tendendo l'elastico verso l'esterno." },
    // BRACCIA
    { nome: "Bicep curl con elastico", focus: "Braccia", reps: "12 reps", spiegazione: "Seduta un'estremità dell'elastico sotto il piede, l'altra nella mano. Fletti il braccio verso la spalla." },
    { nome: "Tricep extension", focus: "Braccia", reps: "12 reps per lato", spiegazione: "In piedi, una mano tiene l'elastico sulla spalla opposta, l'altra lo spinge verso il basso stendendo il braccio." },
    { nome: "Overhead press banded", focus: "Braccia", reps: "12 reps", spiegazione: "In piedi, elastico tra i polsi sopra la testa. Spingi verso l'alto e l'esterno contemporaneamente piegando i gomiti." },
    { nome: "Bust the band", focus: "Braccia", reps: "12 reps", spiegazione: "Braccia a 90° (candeliere), elastico ai polsi. Spingi i polsi verso l'esterno con piccoli impulsi veloci (tono spalle)." },
    { nome: "Lateral raise", focus: "Braccia", reps: "12 reps", spiegazione: "Braccia tese avanti, elastico ai polsi. Apri le braccia verso l'esterno tendendo l'elastico (deltoidi)." },
  ],
  "Fascia Aperta": [
    // ADDOME
    { nome: "Roll up con fascia", focus: "Addome", reps: "15 reps", spiegazione: "Seduti, fascia intorno ai piedi, capi nelle mani. Rotola e risali; la fascia assiste il movimento rendendolo fluido e controllato." },
    { nome: "Teaser assistito", focus: "Addome", reps: "15 reps", spiegazione: "Supina, fascia ai piedi. Sali in equilibrio a V usando la tensione della fascia." },
    { nome: "Hundred con fascia", focus: "Addome", reps: "100 molleggi", spiegazione: "Supina, fascia tesa tra le mani sopra le cosce o sotto la schiena mentre molleggi." },
    { nome: "Double leg stretch", focus: "Addome", reps: "16 reps", spiegazione: "Supina, fascia tra le mani e piedi. Allunga braccia e gambe in direzioni opposte." },
    { nome: "Obliqui", focus: "Addome", reps: "16 reps", spiegazione: "Seduta, fascia sotto i piedi. Ruota il busto tirando un capo della fascia." },
    { nome: "Plank row", focus: "Addome", reps: "16 reps", spiegazione: "In plank, blocca la fascia sotto una mano, tira l'altro capo al fianco." },
    { nome: "Bicycle con fascia", focus: "Addome", reps: "16 reps", spiegazione: "Supini, fascia intorno ai piedi, capi alle mani. Pedalata nell'aria; la fascia oppone resistenza alla gamba che si stende (addome basso)." },
    { nome: "Side-plank T pull", focus: "Addome", reps: "15 reps per lato", spiegazione: "Side plank, fascia bloccata sotto la mano a terra. Tira il capo libero verso il soffitto (braccio a T) sfidando gli obliqui." },
    { nome: "Plank con trazione elastica", focus: "Addome", reps: "45 sec", spiegazione: "Posizionati in posizione di plank (sui gomiti o sulle mani). Passa una banda elastica aperta attorno alla parte superiore della schiena e tieni le estremità con le mani a terra. Mantieni la posizione di plank, attivando il core e spingendo contro la resistenza della fascia." },
    { nome: "Barchetta con elastico", focus: "Addome", reps: "45 sec", spiegazione: "Sdraiato supino, avvolgi la fascia attorno ai piedi e tieni le estremità con le mani, mantenendo le braccia tese oltre la testa. Solleva leggermente testa, spalle e gambe da terra, creando una forma a barchetta. Tieni la posizione mentre tiri l'elastico." },
    { nome: "Dead bug con banda elastica", focus: "Addome", reps: "45 sec per lato", spiegazione: "Sdraiato sulla schiena, avvolgi la fascia attorno a un piede e tieni le estremità con la mano opposta, tenendo il ginocchio piegato a 90°. Estendi la gamba opposta e il braccio opposto, mantenendo la tensione della fascia e la parte bassa della schiena pressata a terra." },
    // INTERNO GAMBA
    { nome: "Inner thigh pull down", focus: "Interno Gamba", reps: "16 reps per lato", spiegazione: "Sul fianco, fascia legata alla caviglia della gamba sotto e fissata in alto (o tenuta dalla mano sopra). Solleva la gamba interna." },
    { nome: "Frog press con fascia", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Supina, fascia intorno ai piedi, mani ai fianchi che tengono i capi. Talloni uniti, stendi le gambe a 45° premendo l'interno coscia." },
    { nome: "Adductor pull", focus: "Interno Gamba", reps: "16 reps per lato", spiegazione: "Supina, fascia al piede, gamba al soffitto. Apri la gamba lateralmente e riporta la al centro usando solo l'interno coscia." },
    { nome: "Side leg circle inner", focus: "Interno Gamba", reps: "16 reps per lato", spiegazione: "Sul fianco, fascia alla caviglia della gamba sotto. Disegna piccoli cerchi mantenendo la gamba tesa e il piede a martello." },
    { nome: "Plie squat tension", focus: "Interno Gamba", reps: "16 reps", spiegazione: "In piedi, fascia sotto i piedi divaricati, impugna i capi al petto. Scendi in squat spingendo le ginocchia verso l'esterno." },
    { nome: "Lateral slide con fascia", focus: "Interno Gamba", reps: "16 reps per lato", spiegazione: "In piedi, fascia sotto un piede e tenuta dalla mano opposta. Scivola lateralmente e richiudi con forza la gamba." },
    { nome: "Crossed leg pull", focus: "Interno Gamba", reps: "16 reps per lato", spiegazione: "Supina, una gamba tesa in alto con fascia. Porta la gamba oltre la linea mediana del corpo e torna al centro con controllo." },
    { nome: "Helicopter con fascia", focus: "Interno Gamba", reps: "24 reps", spiegazione: "Supina, fascia intorno ai piedi, capi alle mani. Divaricate a V, ruota e incrocia le gambe mantenendo la tensione costante." },
    // GAMBE
    { nome: "Leg press con fascia", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Supina: Fascia sotto la pianta di un piede. Estendi la gamba a 45° vincendo la resistenza elastica, poi fletti con controllo." },
    { nome: "Side kick con resistenza", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Sul fianco, fascia al piede superiore. Calcia avanti e indietro; la fascia stabilizza la traiettoria e tonifica la coscia." },
    { nome: "Banded squat", focus: "Gambe", reps: "14 reps", spiegazione: "In piedi sopra la fascia, impugna i capi alle spalle. Esegui lo squat: la resistenza aumenta man mano che risali." },
    { nome: "Lunge pull", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Affondo, fascia sotto il piede avanti. Scendi in affondo mentre tiri i capi della fascia verso l'alto." },
    { nome: "Standing side kick", focus: "Gambe", reps: "14 reps per lato", spiegazione: "In piedi, fascia sotto il piede d'appoggio. Solleva la gamba lateralmente contro la resistenza della fascia (esterno coscia)." },
    { nome: "Scissors assistite", focus: "Gambe", reps: "14 reps", spiegazione: "Supina, fascia intorno a entrambi i piedi. Sforbiciata ampia controllata dalla tensione elastica nelle mani." },
    { nome: "Banded calf raises", focus: "Gambe", reps: "14 reps", spiegazione: "In piedi sulla fascia, impugna i capi tesi. Sali sulle punte dei piedi sentendo la resistenza che ti spinge giù." },
    // GLUTEI
    { nome: "Donkey kick fascia", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Quadrupedia, fascia sotto un piede, capi nelle mani. Calcia dietro." },
    { nome: "Bridge fascia press", focus: "Glutei", reps: "14 reps", spiegazione: "In Bridge, fascia tesa sopra il bacino, mani a terra. Spingi contro la fascia." },
    { nome: "Prone leg lift fascia", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Prona, fascia alla caviglia, blocca l'altro capo a terra. Solleva la gamba." },
    { nome: "Prone flutter kicks", focus: "Glutei", reps: "14 reps", spiegazione: "Proni, fascia legata alle caviglie. Piccoli calci veloci (nuotata) mantenendo la fascia tesa per attivare i glutei." },
    { nome: "Single leg bridge fascia", focus: "Glutei", reps: "14 reps per lato", spiegazione: "In Bridge, fascia al piede sollevato, tira verso il basso mentre il bacino sale." },
    { nome: "Superwoman fascia", focus: "Glutei", reps: "14 reps", spiegazione: "Prona, fascia tesa tra le mani. Solleva petto e gambe." },
    // SCHIENA
    { nome: "Spine twist con fascia", focus: "Schiena", reps: "12 reps", spiegazione: "Seduta, fascia tesa tra le mani avanti. Ruota il busto lateralmente mantenendo la fascia sempre in tensione." },
    { nome: "Swan con fascia", focus: "Schiena", reps: "12 reps", spiegazione: "Prona, fascia tra le mani tese avanti. Solleva il busto e tira la fascia verso il petto flettendo i gomiti." },
    { nome: "Lat pull down", focus: "Schiena", reps: "12 reps", spiegazione: "Seduta o in piedi, fascia sopra la testa. Tirala verso il petto allargando le mani e unendo le scapole." },
    { nome: "Spine stretch forward assistito", focus: "Schiena", reps: "12 reps", spiegazione: "Seduta, fascia ai piedi. Allungati avanti usando la fascia per aumentare lo stretch e controllare il ritorno." },
    { nome: "T-raise con fascia", focus: "Schiena", reps: "12 reps", spiegazione: "In piedi o seduta, braccia tese avanti, fascia tra i palmi. Apri le braccia a T sentendo lavorare la parte alta del dorso." },
    // BRACCIA
    { nome: "Bicep curl", focus: "Braccia", reps: "12 reps", spiegazione: "In piedi sulla fascia, impugna i capi. Fletti i gomiti portando le mani alle spalle con i gomiti fermi ai fianchi." },
    { nome: "Tricep extension", focus: "Braccia", reps: "12 reps per lato", spiegazione: "In piedi, una mano tiene la fascia dietro la schiena bassa, l'altra la tira dal collo verso l'alto stendendo il gomito." },
    { nome: "Chest press con fascia", focus: "Braccia", reps: "12 reps", spiegazione: "Fascia dietro la schiena (sotto le ascelle). Spingi le mani avanti unendole e torna con controllo." },
    { nome: "Overhead press", focus: "Braccia", reps: "12 reps", spiegazione: "Seduta sulla fascia, impugna i capi alle spalle e spingi le braccia verso il soffitto distendendole completamente." },
    { nome: "Front raise con fascia", focus: "Braccia", reps: "12 reps", spiegazione: "In piedi sulla fascia, solleva le braccia tese davanti a te fino all'altezza delle spalle." },
    { nome: "Lateral raise con fascia", focus: "Braccia", reps: "12 reps", spiegazione: "In piedi sulla fascia, solleva le braccia lateralmente vincendo la resistenza elastica." },
    { nome: "Boxing con fascia", focus: "Braccia", reps: "12 reps", spiegazione: "Fascia dietro la schiena, esegui dei pugni alternati avanti mantenendo il core stabile e la fascia in tensione." },
    { nome: "Reverse fly", focus: "Braccia", reps: "12 reps", spiegazione: "In piedi, busto leggermente avanti, fascia tra le mani, apri le braccia lateralmente per rinforzare spalle e dorso." },
  ],
  "Palla Piccola": [
    // ADDOME
    { nome: "Ab curl ball", focus: "Addome", reps: "15 reps", spiegazione: "Supina, palla sotto le scapole. Esegui crunch espirando profondamente." },
    { nome: "Bicycle con palla", focus: "Addome", reps: "16 reps", spiegazione: "Supina, passa la palla dietro le ginocchia mentre pedali." },
    { nome: "Teaser ball", focus: "Addome", reps: "15 reps", spiegazione: "Seduta, equilibrio sul sacro, palla tra le mani che tocca i piedi." },
    { nome: "Plank ball", focus: "Addome", reps: "45 sec", spiegazione: "Prona, mani sulla palla o palla sotto le tibie. Mantieni la stabilità." },
    { nome: "Toe taps ball", focus: "Addome", reps: "16 reps", spiegazione: "Supina, palla sotto l'osso sacro. Tocca terra alternando le punte dei piedi." },
    { nome: "The hundred con palla", focus: "Addome", reps: "15 reps", spiegazione: "Supini, palla stretta tra le caviglie. Molleggia le braccia schiacciando la palla; connette adduttori e core profondo." },
    { nome: "Double leg stretch", focus: "Addome", reps: "15 reps", spiegazione: "Supini, palla tra le caviglie. Stendi braccia e gambe; la pressione sulla palla attiva intensamente l'addome basso." },
    { nome: "Knee tuck", focus: "Addome", reps: "15 reps", spiegazione: "Plank alto con i piedi sulla palla. Fletti le ginocchia al petto facendo rotolare la palla, poi stendi di nuovo." },
    { nome: "Leg pass", focus: "Addome", reps: "16 reps", spiegazione: "Supini, palla tra le mani. Passa la palla dalle mani alle caviglie durante il crunch e stendi braccia e gambe." },
    { nome: "Tenuta Addominale (Ball Pass)", focus: "Addome", reps: "45 sec", spiegazione: "Schiaccia la palla tra le ginocchia e porta le gambe a tavolino (90°), sollevando spalle e testa, mantenendo la contrazione." },
    { nome: "Crunch in isometria (ball back)", focus: "Addome", reps: "45 sec", spiegazione: "Metti la palla piccola dietro la zona lombare mentre sei seduto sul tappetino. Inclinati all'indietro fino a sentire la tensione addominale e mantieni la posizione." },
    // INTERNO GAMBA
    { nome: "Ball squeeze hold", focus: "Interno Gamba", reps: "45 sec", spiegazione: "Seduta, palla tra le cosce. Schiaccia con forza e mantieni." },
    { nome: "Inner thigh pulses ball", focus: "Interno Gamba", reps: "100 molleggi", spiegazione: "Supina, palla tra le ginocchia. Molleggia verso l'interno." },
    { nome: "Bridge ball squeeze", focus: "Interno Gamba", reps: "16 reps", spiegazione: "In Bridge, palla tra le ginocchia. Schiaccia mentre sali e scendi." },
    { nome: "Palla tra caviglie lift", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Supina, palla tra le caviglie. Solleva le gambe a 90° schiacciando." },
    { nome: "Wall sit ball", focus: "Interno Gamba", reps: "45 sec", spiegazione: "Al muro, palla tra le ginocchia. Schiaccia durante la sedia." },
    { nome: "Inner thigh V-position", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Supina, palla tra le cosce, talloni uniti. Stendi e piega le gambe." },
    { nome: "Seated adductor lift", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Seduti, gambe a V, palla tra le caviglie. Solleva le gambe da terra di pochi centimetri mantenendo la pressione costante." },
    // GAMBE
    { nome: "Wall squat con palla", focus: "Gambe", reps: "14 reps", spiegazione: "In piedi, palla tra la zona lombare e il muro. Scendi in squat facendo rotolare la palla sulla schiena." },
    { nome: "Palla side kick", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Sul fianco, palla sotto il fianco a terra. Solleva la gamba tesa; la palla ti obbliga a non crollare col busto." },
    { nome: "Leg circles", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Supina, una gamba tesa in alto, palla sotto l'osso sacro. Disegna cerchi col piede senza dondolare." },
    { nome: "Hamstring curl", focus: "Gambe", reps: "14 reps", spiegazione: "Supina, piedi sulla palla, bacino sollevato. Tira la palla verso i glutei con i talloni e riallunga." },
    { nome: "Lunge balance", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Affondo, piede posteriore sulla palla. Scendi in affondo mantenendo l'equilibrio sulla palla dietro." },
    { nome: "Palla leg swing", focus: "Gambe", reps: "14 reps per lato", spiegazione: "In piedi, palla tra le mani sopra la testa. Slancia la gamba avanti e tocca la palla con la punta del piede." },
    { nome: "Quad squeeze", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Seduta, palla sotto il ginocchio. Spingi il ginocchio verso il basso schiacciando la palla e stendi il piede." },
    { nome: "Standing balance", focus: "Gambe", reps: "14 reps per lato", spiegazione: "In piedi, palla tra le cosce. Esegui sollevamenti sulle punte mantenendo la palla stretta." },
    // GLUTEI
    { nome: "One leg bridge ball", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Supina, un piede sulla palla. Solleva il bacino in bridge." },
    { nome: "Ball donkey kick", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Quadrupedia, palla incastrata dietro il ginocchio. Calcia su." },
    { nome: "Glute squeeze ball", focus: "Glutei", reps: "45 sec", spiegazione: "Proni, palla tra tallone e gluteo. Spingi il tallone contro la palla verso il gluteo (isolamento bicipite femorale)." },
    { nome: "Clamshell ball", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Sul fianco, palla sotto il fianco a terra. Apri la gamba sopra." },
    { nome: "Fire hydrant ball", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Quadrupedia, palla dietro il ginocchio. Apri lateralmente." },
    { nome: "Prone ball lift", focus: "Glutei", reps: "14 reps", spiegazione: "Prona, palla tra le caviglie. Solleva le gambe tese." },
    { nome: "All-fours leg lift", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Quadrupedia, palla sotto il ginocchio a terra. Solleva lateralmente la gamba libera; la base instabile attiva i glutei profondi." },
    // SCHIENA
    { nome: "Swan su palla", focus: "Schiena", reps: "12 reps", spiegazione: "Prona, mani sulla palla avanti a te. Falla rotolare verso di te sollevando il petto e aprendo le spalle." },
    { nome: "Spine twist con palla", focus: "Schiena", reps: "12 reps", spiegazione: "Seduta, palla tra le mani tese in avanti. Ruota il busto lateralmente seguendo la palla con lo sguardo." },
    { nome: "Thoracic extension", focus: "Schiena", reps: "12 reps", spiegazione: "Supini, palla sotto le scapole. Abbandona il peso e apri le braccia per mobilizzare la colonna dorsale." },
    { nome: "Back extension", focus: "Schiena", reps: "12 reps", spiegazione: "Prona, palla sotto lo sterno. Solleva il busto e le braccia a T cercando l'estensione dorsale." },
    { nome: "Prone arm reach", focus: "Schiena", reps: "12 reps", spiegazione: "Prona, palla sotto la fronte. Solleva le braccia tese lateralmente unendo le scapole." },
    { nome: "Swimming con palla", focus: "Schiena", reps: "12 reps", spiegazione: "Prona, palla sotto lo sterno. Muovi gambe e braccia velocemente mantenendo il busto fermo." },
    { nome: "Mermaid con palla", focus: "Schiena", reps: "12 reps", spiegazione: "Seduti (z-sit), palla lateralmente. Falla rotolare lontano flettendo il busto; allunga profondamente fianco e schiena." },
    // BRACCIA
    { nome: "Palla chest press", focus: "Braccia", reps: "12 reps", spiegazione: "In piedi, palla tra i palmi davanti al petto. Schiaccia la palla con forza e rilascia lentamente." },
    { nome: "Tricep push", focus: "Braccia", reps: "12 reps per lato", spiegazione: "In piedi, appoggia la palla al muro, premila con il palmo e stendi il braccio attivando il tricipite." },
    { nome: "Overhead squeeze", focus: "Braccia", reps: "12 reps", spiegazione: "In piedi, palla tra le mani sopra la testa. Stringi la palla mentre pieghi e stendi i gomiti." },
    { nome: "Bicep curl con palla", focus: "Braccia", reps: "12 reps per lato", spiegazione: "In piedi, palla tra avambraccio e spalla. Stringi la palla flettendo il braccio al massimo." },
    { nome: "Palla push ups", focus: "Braccia", reps: "12 reps", spiegazione: "Plank, una mano sulla palla, l'altra a terra. Esegui il piegamento e scambia la palla di mano." },
    { nome: "Lateral arm circles", focus: "Braccia", reps: "12 reps per lato", spiegazione: "In piedi, tieni la palla lateralmente con un braccio teso e disegna piccoli cerchi veloci." },
    { nome: "Tricep dips su palla", focus: "Braccia", reps: "12 reps", spiegazione: "Seduta, mani sulla palla dietro i fianchi (palla molto sgonfia). Fletti i gomiti e risali." },
  ],
  "Palla Grande": [
    // ADDOME
    { nome: "Ball crunch", focus: "Addome", reps: "15 reps", spiegazione: "Seduta sulla palla, cammina avanti finché la zona lombare è appoggiata. Mani dietro la nuca, sali in crunch." },
    { nome: "Plank on ball", focus: "Addome", reps: "45 sec", spiegazione: "Appoggia gli avambracci sulla palla, gambe tese a terra. Mantieni il corpo in linea sfidando l'instabilità." },
    { nome: "Dead bug con palla", focus: "Addome", reps: "16 reps", spiegazione: "Supina, tieni la palla tra ginocchia e mani. Estendi braccio e gamba opposta senza far cadere la palla." },
    { nome: "Ball pass", focus: "Addome", reps: "15 reps", spiegazione: "Supina, passa la palla dalle mani alle caviglie e viceversa, scendendo ogni volta quasi a terra." },
    { nome: "Obliqui sulla palla", focus: "Addome", reps: "15 reps per lato", spiegazione: "Fianco appoggiato alla palla, piedi al muro per stabilità. Solleva il busto lateralmente." },
    { nome: "Knee tucks", focus: "Addome", reps: "15 reps", spiegazione: "Posizione in plank con stinchi sulla palla. Tira le ginocchia al petto facendo rotolare la palla." },
    { nome: "Pike (v-push)", focus: "Addome", reps: "15 reps", spiegazione: "In plank con piedi sulla palla, solleva il bacino verso l'alto portando la palla verso le mani." },
    { nome: "Crunch isometrico con estensione", focus: "Addome", reps: "45 sec", spiegazione: "Sdraiato con la schiena sulla palla, esegui un crunch parziale e mantieni la contrazione massima degli addominali." },
    // INTERNO GAMBA
    { nome: "Ball squeeze supino", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Supina, palla tra le caviglie sollevate. Stringi con forza per 2 secondi e rilascia." },
    { nome: "Wall squat con palla", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Palla tra schiena e muro. Piedi larghi, scendi in squat stringendo idealmente le cosce verso l'interno." },
    { nome: "Frog press su palla", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Supina, palla tra i piedi a 'rana'. Stendi le gambe in alto stringendo l'interno coscia." },
    { nome: "Side ball squeeze", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Supina, gambe tese che stringono la palla. Ruota leggermente le gambe a destra e sinistra." },
    { nome: "Adductor bridge", focus: "Interno Gamba", reps: "16 reps", spiegazione: "In ponte con i piedi sopra la palla, tieni le ginocchia unite mentre sali e scendi." },
    { nome: "Standing ball press", focus: "Interno Gamba", reps: "16 reps", spiegazione: "In piedi, palla tra le cosce sopra il ginocchio. Stringi e rilascia senza farla cadere." },
    { nome: "Seated adductor pulse", focus: "Interno Gamba", reps: "16 reps", spiegazione: "Seduti sulla palla, schiena dritta. Cerca di strizzare la palla verso l'interno usando i muscoli del pavimento pelvico." },
    // GAMBE
    { nome: "Ball leg curl", focus: "Gambe", reps: "14 reps", spiegazione: "Supina, talloni sulla palla. Solleva il bacino e tira la palla verso i glutei flettendo le ginocchia." },
    { nome: "Bulgarian split su palla", focus: "Gambe", reps: "14 reps per lato", spiegazione: "In piedi, un piede appoggiato dietro sulla palla. Esegui un affondo con la gamba avanti." },
    { nome: "Ball side kicks", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Inginocchiata di fianco alla palla, busto appoggiato lateralmente. Slancia la gamba esterna." },
    { nome: "Wall slide squat", focus: "Gambe", reps: "14 reps", spiegazione: "Palla tra schiena e muro. Scendi in squat; la palla guida la colonna e permette una discesa profonda." },
    { nome: "Hamstring stretch active", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Supina, palla sotto un tallone. Spingi la palla lontano e tirala a te mantenendo il bacino basso." },
    { nome: "Side lunges with ball", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Affondi laterali tenendo la palla al petto per mantenere l'equilibrio." },
    { nome: "Wall sit on ball", focus: "Gambe", reps: "45 sec", spiegazione: "Appoggia la schiena alla palla contro il muro e mantieni la posizione di squat statico." },
    { nome: "Lateral leg lift", focus: "Gambe", reps: "14 reps per lato", spiegazione: "Sul fianco, palla tra le caviglie. Solleva entrambe le gambe tese controllando la catena laterale." },
    // GLUTEI
    { nome: "Ball bridge", focus: "Glutei", reps: "14 reps", spiegazione: "Supina, piedi piatti sulla palla. Solleva il bacino contraendo i glutei al massimo." },
    { nome: "Hip thrust su palla", focus: "Glutei", reps: "14 reps", spiegazione: "Scapole sulla palla, piedi a terra. Scendi col bacino e risali spingendo dai talloni." },
    { nome: "Single leg bridge ball", focus: "Glutei", reps: "14 reps per lato", spiegazione: "Un solo piede sulla palla, l'altra gamba su. Solleva il bacino gestendo l'equilibrio su una sola gamba instabile." },
    { nome: "Prona leg lifts", focus: "Glutei", reps: "14 reps", spiegazione: "Pancia sulla palla, mani a terra. Solleva entrambe le gambe tese dietro di te." },
    { nome: "Reverse hyper on ball", focus: "Glutei", reps: "14 reps", spiegazione: "Busto sulla palla, mani a terra. Solleva le gambe unite oltre la linea del busto." },
    { nome: "Ball bridge marching", focus: "Glutei", reps: "14 reps", spiegazione: "In ponte sulla palla, solleva alternativamente un piede mantenendo il bacino immobile." },
    { nome: "Heel squeeze", focus: "Glutei", reps: "14 reps", spiegazione: "Prona sulla palla, talloni uniti. Premi i talloni tra loro con forza contraendo i glutei." },
    { nome: "Side leg lift", focus: "Glutei", reps: "14 reps", spiegazione: "In ginocchio, un fianco sulla palla. Solleva la gamba esterna lateralmente; la palla isola il movimento del gluteo." },
    // SCHIENA
    { nome: "Superman su palla", focus: "Schiena", reps: "12 reps", spiegazione: "Pancia sulla palla, solleva braccio destro e gamba sinistra contemporaneamente." },
    { nome: "Y-extension", focus: "Schiena", reps: "12 reps", spiegazione: "Pancia sulla palla, solleva il busto portando le braccia fuori a 'Y' per le scapole." },
    { nome: "Back extension", focus: "Schiena", reps: "12 reps", spiegazione: "Bacino sulla palla, piedi al muro. Mani dietro la nuca, solleva il busto estendendo la schiena." },
    { nome: "Spine twist on ball", focus: "Schiena", reps: "12 reps", spiegazione: "Seduta sulla palla, braccia a T. Ruota il busto a destra e sinistra mantenendo il bacino fermo." },
    { nome: "Scapular squeeze", focus: "Schiena", reps: "12 reps", spiegazione: "Pancia sulla palla, braccia lungo i fianchi. Avvicina le scapole sollevando leggermente il petto." },
    { nome: "Cat-cow su palla", focus: "Schiena", reps: "12 reps", spiegazione: "In ginocchio, mani sulla palla. Arrotonda e inarca la schiena facendo rotolare leggermente la palla." },
    // BRACCIA
    { nome: "Ball push ups", focus: "Braccia", reps: "12 reps", spiegazione: "Mani a terra, stinchi o punte dei piedi sulla palla. Esegui i piegamenti mantenendo il core saldo." },
    { nome: "Incline push ups", focus: "Braccia", reps: "12 reps", spiegazione: "Mani sulla palla, piedi a terra. Piegamenti sulle braccia per i pettorali." },
    { nome: "Ball tricep dips", focus: "Braccia", reps: "12 reps", spiegazione: "Seduta sul bordo della palla, mani sulla palla. Scendi coi glutei e risali lavorando sui tricipiti." },
    { nome: "Circle arms on ball", focus: "Braccia", reps: "12 reps", spiegazione: "Seduta sulla palla, braccia tese fuori. Disegna piccoli cerchi mantenendo la postura perfetta." },
    { nome: "Tricep extension nall", focus: "Braccia", reps: "12 reps", spiegazione: "Pancia sulla palla, braccia tese dietro. Molleggia le mani verso l'alto attivando i tricipiti." },
    { nome: "Ball chest fly", focus: "Braccia", reps: "12 reps", spiegazione: "Appoggiata con la schiena sulla palla, braccia a T. Chiudi le braccia davanti al petto." },
    { nome: "Shoulder press on ball", focus: "Braccia", reps: "12 reps", spiegazione: "Seduta sulla palla, spingi le braccia verso l'alto mantenendo le spalle basse." },
  ]
};

export function calcolaReps(repsOriginali: string, livello: string): string {
  const config = CONFIG_LIVELLI[livello];
  if (repsOriginali.includes("sec")) {
    return config.tempoEsercizio + " sec";
  }
  const numero = parseInt(repsOriginali);
  if (!isNaN(numero)) {
    return Math.round(numero * config.repsMoltiplicatore) + " reps";
  }
  return repsOriginali;
}

export function pescaEsercizi(attrezzo: string, storici: string[]): Exercise[] {
  const tutti = databaseEsercizi[attrezzo] || [];
  let disponibili = tutti.filter(es => !storici.includes(es.nome));
  if (disponibili.length < 13) {
    disponibili = [...tutti];
  }

  const cat: Record<string, Exercise[]> = {
    "Addome": [], "Interno Gamba": [], "Glutei": [],
    "Gambe": [], "Braccia": [], "Schiena": []
  };

  disponibili.forEach(es => {
    let f = es.focus;
    if (["Core", "Addome Basso", "Addome Profondo", "Fianchi"].includes(f)) f = "Addome";
    if (["Spalle", "Braccia & Spalle"].includes(f)) f = "Braccia";
    if (cat[f]) cat[f].push(es);
  });

  const pesca = (focus: string, q: number) => {
    if (!cat[focus] || cat[focus].length === 0) return [];
    return [...cat[focus]].sort(() => 0.5 - Math.random()).slice(0, q);
  };

  const gambe = pesca("Gambe", 2);
  const glutei = pesca("Glutei", 2);
  const interno = pesca("Interno Gamba", 2);
  const braccia = pesca("Braccia", 2);
  const schiena = pesca("Schiena", 2);

  const addomeTutti = cat["Addome"] || [];
  const addomeIso = addomeTutti.filter(e => /plank|hold|hollow/i.test(e.nome));
  const addomeDin = addomeTutti.filter(e => !/plank|hold|hollow/i.test(e.nome));

  const randomPick = (arr: Exercise[]) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;
  const addome = [randomPick(addomeDin), randomPick(addomeIso)].filter(Boolean) as Exercise[];

  const usato = addome[0];
  const finalePool = addomeDin.filter(e => e && e.nome !== usato?.nome);
  const finale = finalePool.length > 0 ? finalePool[Math.floor(Math.random() * finalePool.length)] : null;

  return [
    gambe[0], schiena[0], glutei[0], addome[0], braccia[0], interno[0],
    gambe[1], schiena[1], glutei[1], addome[1], braccia[1], interno[1],
    finale
  ].filter(Boolean) as Exercise[];
}
