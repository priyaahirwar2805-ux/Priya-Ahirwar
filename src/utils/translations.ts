export interface TranslationDictionary {
  appName: string;
  tagline: string;
  signUp: string;
  signIn: string;
  email: string;
  password: string;
  loginTitle: string;
  loginSub: string;
  selectLanguage: string;
  startCoaching: string;
  dashboard: string;
  aiCoach: string;
  greenTwin: string;
  whatIf: string;
  challenges: string;
  leaderboard: string;
  badges: string;
  overallScore: string;
  carbonFootprint: string;
  monthlyEmissions: string;
  sustainableTarget: string;
  points: string;
  level: string;
  logout: string;
  welcome: string;
  createAccount: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  fullName: string;
  college: string;
  teamName: string;
  reset: string;
  quickDemo: string;
  chooseLangPrompt: string;
  enterValidCredentials: string;
  loginSuccess: string;
  registerSuccess: string;
  heroSub: string;
  heroIntro: string;
  viewDashboard: string;
  ecoMindDescription: string;
  backToLanding: string;
  submit: string;
  saving: string;
  analyticsOverview: string;
  transport: string;
  electricity: string;
  water: string;
  diet: string;
  shopping: string;
  // Extra localized keys for inside of the application
  totalFootprint: string;
  breakdownByCategory: string;
  footprintSliceRatio: string;
  earnedBadges: string;
  dailyEmission: string;
  weeklyEmission: string;
  activeChallengesTitle: string;
  askCoachAI: string;
  generateFullReport: string;
  carbonAuditComplete: string;
  scoreExplanation: string;
  breakdownSubtitle: string;
  ratioSubtitle: string;
}

export const TRANSLATIONS: Record<string, TranslationDictionary> = {
  en: {
    appName: "EcoMind AI",
    tagline: "Personal Carbon Coach",
    signUp: "Sign Up",
    signIn: "Sign In",
    email: "Email Address",
    password: "Password",
    loginTitle: "Welcome back, Earth Guardian!",
    loginSub: "Log in or register to track your progress, compete with other universities, and secure actionable feedback.",
    selectLanguage: "Language Preference / भाषा चयन",
    startCoaching: "Build Your Carbon Profile",
    dashboard: "Dashboard",
    aiCoach: "AI Carbon Coach",
    greenTwin: "Green Twin Simulator",
    whatIf: "What-If Simulator",
    challenges: "Eco Challenges",
    leaderboard: "Leaderboard",
    badges: "My Achievements",
    overallScore: "Sustainability Score",
    carbonFootprint: "Monthly Carbon Footprint",
    monthlyEmissions: "Monthly Carbon Footprint Scorecard",
    sustainableTarget: "Sustainable target is under 150 kg/month",
    points: "pts",
    level: "Eco Level",
    logout: "Log Out",
    welcome: "Welcome",
    createAccount: "Register Account",
    alreadyHaveAccount: "Already have an account? Sign In",
    dontHaveAccount: "Don't have an account? Register Now",
    fullName: "Full Name",
    college: "College / University Community",
    teamName: "Eco Team / Ranger Squad",
    reset: "Reset Profile",
    quickDemo: "Skip to Live Dashboard",
    chooseLangPrompt: "Select Application Language",
    enterValidCredentials: "Please provide valid credentials.",
    loginSuccess: "Successfully logged in!",
    registerSuccess: "Account registered successfully!",
    heroSub: "Modern AI Personal Coach & Predictive Environment Simulator",
    heroIntro: "EcoMind AI isn't just a carbon counter. It is an intelligent behavioral modifier that empowers college communities and green citizens to transform daily routines through conversational coaching, real-time What-If engines, and predictive twin models.",
    viewDashboard: "Launch Simulator Sandbox",
    ecoMindDescription: "Start editing your life's emissions variables dynamically.",
    backToLanding: "Return to Landing Page",
    submit: "Submit Details",
    saving: "Processing...",
    analyticsOverview: "Real-time Footprint Analytics",
    transport: "Transportation",
    electricity: "Electricity",
    water: "Water Usage",
    diet: "Dietary",
    shopping: "Shopping Habit",
    totalFootprint: "Total Carbon Footprint",
    breakdownByCategory: "Emissions Breakdown by Category",
    footprintSliceRatio: "Footprint Slice Ratio",
    earnedBadges: "Earned Badges",
    dailyEmission: "Daily Emissions",
    weeklyEmission: "Weekly Emissions",
    activeChallengesTitle: "Active Eco Challenges",
    askCoachAI: "Ask Coach AI",
    generateFullReport: "Generate full Audit Report",
    carbonAuditComplete: "Carbon Audit Complete",
    scoreExplanation: "By optimizing your current transportation and energy behaviors, you can level up to Planet Guardian!",
    breakdownSubtitle: "Shows relative carbon burden associated with your routine choices.",
    ratioSubtitle: "Percentage of emissions created per domain."
  },
  es: {
    appName: "EcoMind AI",
    tagline: "Entrenador Carbono Personal",
    signUp: "Registrarse",
    signIn: "Iniciar Sesión",
    email: "Correo Electrónico",
    password: "Contraseña",
    loginTitle: "¡Bienvenido de nuevo, Guardián del Planeta!",
    loginSub: "Inicie sesión o regístrese para seguir su progreso, competir con otras universidades y obtener comentarios útiles.",
    selectLanguage: "Preferencia de Idioma",
    startCoaching: "Crear Perfil de Carbono",
    dashboard: "Panel de control",
    aiCoach: "Entrenador de IA Carbono",
    greenTwin: "Simulador de Gemelo Verde",
    whatIf: "Simulador de Qué Pasaría Si",
    challenges: "Desafíos Ecológicos",
    leaderboard: "Clasificación",
    badges: "Mis Logros",
    overallScore: "Puntaje de Sostenibilidad",
    carbonFootprint: "Huella de Carbono Mensual",
    monthlyEmissions: "Tarjeta de Puntuación de Carbono Mensual",
    sustainableTarget: "El objetivo sostenible es inferior a 150 kg/mes",
    points: "pts",
    level: "Nivel ecológico",
    logout: "Cerrar sesión",
    welcome: "Bienvenido",
    createAccount: "Registrar Cuenta",
    alreadyHaveAccount: "¿Ya tiene una cuenta? Inicie sesión",
    dontHaveAccount: "¿No tiene una cuenta? Regístrese ahora",
    fullName: "Nombre Completo",
    college: "Comunidad de Colegio / Universidad",
    teamName: "Equipo Ecológico / Escuadrón Ranger",
    reset: "Reiniciar perfil",
    quickDemo: "Omitir al panel en vivo",
    chooseLangPrompt: "Seleccionar idioma de la aplicación",
    enterValidCredentials: "Por favor, proporcione credenciales válidas.",
    loginSuccess: "¡Sesión iniciada con éxito!",
    registerSuccess: "¡Cuenta registrada con éxito!",
    heroSub: "Entrenador personal de IA moderno y simulador ambiental predictivo",
    heroIntro: "EcoMind AI no es solo un contador de carbono. Es un modificador de comportamiento inteligente que empodera a las comunidades universitarias y a los ciudadanos ecológicos para transformar sus rutinas diarias a través del entrenamiento conversacional, motores de simulación en tiempo real y gemelos predictivos.",
    viewDashboard: "Iniciar entorno de pruebas",
    ecoMindDescription: "Comience a editar las variables de emisiones de su vida de forma dinámica.",
    backToLanding: "Volver a la página de inicio",
    submit: "Enviar detalles",
    saving: "Procesando...",
    analyticsOverview: "Análisis de huella en tiempo real",
    transport: "Transporte",
    electricity: "Electricidad",
    water: "Uso de agua",
    diet: "Dieta alimenticia",
    shopping: "Hábito de compras",
    totalFootprint: "Huella de carbono total",
    breakdownByCategory: "Desglose de emisiones por categoría",
    footprintSliceRatio: "Proporción de rebanadas de huella",
    earnedBadges: "Insignias de mérito",
    dailyEmission: "Emisiones diarias",
    weeklyEmission: "Emisiones semanales",
    activeChallengesTitle: "Desafíos ecológicos activos",
    askCoachAI: "Preguntar al Entrenador IA",
    generateFullReport: "Generar informe de auditoría completo",
    carbonAuditComplete: "Auditoría de carbono completada",
    scoreExplanation: "Al optimizar sus hábitos de tránsito y energía, ¡puede subir de nivel a Guardián del Planeta!",
    breakdownSubtitle: "Muestra la carga de carbono relativa asociada con sus elecciones diarias.",
    ratioSubtitle: "Porcentaje de emisiones generadas por cada ámbito."
  },
  fr: {
    appName: "EcoMind AI",
    tagline: "Coach Carbone Personnel",
    signUp: "S'inscrire",
    signIn: "Se Connecter",
    email: "Adresse e-mail",
    password: "Mot de passe",
    loginTitle: "Bon retour, Gardien de la Terre!",
    loginSub: "Connectez-vous ou inscrivez-vous pour suivre vos progrès, rivaliser avec d'autres universités et obtenir des conseils d'experts.",
    selectLanguage: "Préférence de Langue",
    startCoaching: "Créer un Profil Carbone",
    dashboard: "Tableau de Bord",
    aiCoach: "Coach Carbone IA",
    greenTwin: "Simulateur Jumeau Vert",
    whatIf: "Simulateur Et-Si",
    challenges: "Défis Écologiques",
    leaderboard: "Classement",
    badges: "Mes Réussites",
    overallScore: "Score de Durabilité",
    carbonFootprint: "Empreinte Carbone Mensuelle",
    monthlyEmissions: "Fiche de Rendement Carbone Mensuelle",
    sustainableTarget: "La cible durable est de moins de 150 kg/mois",
    points: "pts",
    level: "Niveau Éco",
    logout: "Se déconnecter",
    welcome: "Bienvenue",
    createAccount: "Créer un Compte",
    alreadyHaveAccount: "Vous avez déjà un compte? Se connecter",
    dontHaveAccount: "Pas encore de compte? Inscrivez-vous maintenant",
    fullName: "Nom Complet",
    college: "Club / Communauté Universitaire",
    teamName: "Équipe Éco / Escouade Ranger",
    reset: "Réinitialiser",
    quickDemo: "Accéder au tableau de bord",
    chooseLangPrompt: "Sélectionner la langue applicative",
    enterValidCredentials: "Veuillez fournir des informations valides.",
    loginSuccess: "Connexion réussie!",
    registerSuccess: "Compte créé avec succès!",
    heroSub: "Coach Personnel IA Moderne & Simulateur d'Environnement Prédictif",
    heroIntro: "EcoMind AI n'est pas seulement un compteur de carbone. C'est un modificateur de comportement intelligent qui permet aux communautés étudiantes et aux citoyens écologiques de transformer leurs habitudes quotidiennes grâce au coaching interactif et à la modélisation prédictive.",
    viewDashboard: "Lancer le bac à sable",
    ecoMindDescription: "Modifiez dynamiquement vos variables d'émissions au quotidien.",
    backToLanding: "Retour à l'accueil",
    submit: "Soumettre les détails",
    saving: "Traitement en cours...",
    analyticsOverview: "Analyses de l'empreinte en temps réel",
    transport: "Transport",
    electricity: "Électricité",
    water: "Usage de l'eau",
    diet: "Alimentation",
    shopping: "Habitude de shopping",
    totalFootprint: "Empreinte carbone totale",
    breakdownByCategory: "Répartition des émissions par catégorie",
    footprintSliceRatio: "Ratios énergétiques par secteur",
    earnedBadges: "Badges débloqués",
    dailyEmission: "Émissions quotidiennes",
    weeklyEmission: "Émissions hebdomadaires",
    activeChallengesTitle: "Défis écologiques actifs",
    askCoachAI: "Discuter avec l'IA",
    generateFullReport: "Générer le rapport complet",
    carbonAuditComplete: "Bilan carbone terminé",
    scoreExplanation: "En optimisant vos choix actuels, vous pouvez rapidement devenir un Gardien de la Terre!",
    breakdownSubtitle: "Affiche la charge carbone relative liée à votre mode de vie.",
    ratioSubtitle: "Pourcentage d'émissions créées par domaine d'activité."
  },
  de: {
    appName: "EcoMind AI",
    tagline: "Persönlicher CO2-Coach",
    signUp: "Registrieren",
    signIn: "Einloggen",
    email: "E-Mail-Adresse",
    password: "Passwort",
    loginTitle: "Willkommen zurück, Beschützer der Erde!",
    loginSub: "Melden Sie sich an oder registrieren Sie sich, um Ihre Fortschritte zu verfolgen, sich mit anderen Universitäten zu messen und direktes Feedback zu erhalten.",
    selectLanguage: "Sprachpräferenz",
    startCoaching: "CO2-Profil Erstellen",
    dashboard: "Dashboard",
    aiCoach: "KI-CO2-Coach",
    greenTwin: "Grüner Zwilling Simulator",
    whatIf: "Was-Wäre-Wenn Simulator",
    challenges: "Öko-Herausforderungen",
    leaderboard: "Bestenliste",
    badges: "Meine Erfolge",
    overallScore: "Nachhaltigkeits-Score",
    carbonFootprint: "Monatlicher CO2-Fußabdruck",
    monthlyEmissions: "Monatliche CO2-Bilanz",
    sustainableTarget: "Nachhaltiges Ziel liegt unter 150 kg/Monat",
    points: "Punkte",
    level: "Öko-Stufe",
    logout: "Ausloggen",
    welcome: "Willkommen",
    createAccount: "Konto Erstellen",
    alreadyHaveAccount: "Haben Sie bereits ein Konto? Einloggen",
    dontHaveAccount: "Noch kein Konto? Jetzt registrieren",
    fullName: "Vollständiger Name",
    college: "Hochschule / Universität",
    teamName: "Öko-Team / Ranger-Innung",
    reset: "Zurücksetzen",
    quickDemo: "Direkt zum Live-Dashboard",
    chooseLangPrompt: "Anwendungssprache auswählen",
    enterValidCredentials: "Bitte geben Sie gültige Anmeldedaten ein.",
    loginSuccess: "Erfolgreich angemeldet!",
    registerSuccess: "Konto erfolgreich registriert!",
    heroSub: "Moderner KI-CO2-Coach & vorausschauender Umweltsimulator",
    heroIntro: "EcoMind AI ist nicht nur ein Kohlenstoffzähler. Es ist ein intelligentes Werkzeug zur Verhaltensänderung, das Universitätsgemeinschaften und grüne Bürger befähigt, ihre täglichen Routinen durch Dialog-Coaching, Echtzeit-Szenarien und Simulationsmodelle zu verändern.",
    viewDashboard: "Simulations-Sandbox starten",
    ecoMindDescription: "Bearbeiten Sie die Variablen Ihrer täglichen Emissionen dynamisch.",
    backToLanding: "Zurück zur Startseite",
    submit: "Details absenden",
    saving: "Wird verarbeitet...",
    analyticsOverview: "Echtzeit-Fußabdruck-Analyse",
    transport: "Transport",
    electricity: "Elektrizität",
    water: "Wasserverbrauch",
    diet: "Ernährung",
    shopping: "Einkaufsgewohnheiten",
    totalFootprint: "Gesamter CO2-Fußabdruck",
    breakdownByCategory: "CO2-Emissionen nach Kategorie",
    footprintSliceRatio: "Verteilungsquote des Fußabdrucks",
    earnedBadges: "Erreichte Abzeichen",
    dailyEmission: "Tägliche Emissionen",
    weeklyEmission: "Wöchentliche Emissionen",
    activeChallengesTitle: "Aktive Öko-Missionen",
    askCoachAI: "KI-Coach chatten",
    generateFullReport: "Vollständiges CO2-Audit erstellen",
    carbonAuditComplete: "CO2-Audit abgeschlossen",
    scoreExplanation: "Durch die Optimierung Ihres Transports können Sie die höchste Stufe 'Planet Guardian' erreichen!",
    breakdownSubtitle: "Zeigt die relative CO2-Belastung Ihrer täglichen Gewohnheiten.",
    ratioSubtitle: "Prozentualer Anteil der Emissionen pro Lebensbereich."
  },
  hi: {
    appName: "EcoMind AI",
    tagline: "व्यक्तिगत कार्बन कोच",
    signUp: "साइन अप करें",
    signIn: "लॉग इन करें",
    email: "ईमेल पता",
    password: "पासवर्ड",
    loginTitle: "वापसी पर स्वागत है, पृथ्वी रक्षक!",
    loginSub: "अपनी प्रगति को ट्रैक करने, अन्य विश्वविद्यालयों के साथ प्रतिस्पर्धा करने और उचित मार्गदर्शन पाने के लिए लॉग इन या पंजीकरण करें।",
    selectLanguage: "भाषा चयन (Language)",
    startCoaching: "अपना कार्बन प्रोफ़ाइल बनाएं",
    dashboard: "डैशबोर्ड",
    aiCoach: "एआई कार्बन कोच",
    greenTwin: "ग्रीन ट्विन सिम्युलेटर",
    whatIf: "व्हाट-इफ़ सिम्युलेटर",
    challenges: "पर्यावरण चुनौतियां",
    leaderboard: "लीडरबोर्ड",
    badges: "मेरी उपलब्धियां",
    overallScore: "सस्टेनेबिलिटी स्कोर",
    carbonFootprint: "मासिक कार्बन फुटप्रिंट",
    monthlyEmissions: "मासिक कार्बन फुटप्रिंट स्कोरकार्ड",
    sustainableTarget: "सतत लक्ष्य 150 किग्रा/माह से कम है",
    points: "अंक",
    level: "इको स्तर",
    logout: "लॉग आउट",
    welcome: "स्वागत है",
    createAccount: "खाता पंजीकृत करें",
    alreadyHaveAccount: "क्या आपके पास पहले से खाता है? लॉग इन करें",
    dontHaveAccount: "क्या आपके पास खाता नहीं है? अभी पंजीकरण करें",
    fullName: "पूरा नाम",
    college: "कॉलेज / विश्वविद्यालय समुदाय",
    teamName: "इको टीम / रेंजर दस्ता",
    reset: "प्रोफ़ाइल रीसेट",
    quickDemo: "सीधे लाइव डैशबोर्ड पर जाएं",
    chooseLangPrompt: "एप्लिकेशन की भाषा चुनें",
    enterValidCredentials: "कृपया वैध क्रेडेंशियल प्रदान करें।",
    loginSuccess: "सफलतापूर्वक लॉग इन किया गया!",
    registerSuccess: "खाता सफलतापूर्वक पंजीकृत किया गया!",
    heroSub: "आधुनिक एआई व्यक्तिगत कोच और पर्यावरण सिम्युलेटर",
    heroIntro: "EcoMind AI केवल एक कार्बन काउंटर नहीं है। यह एक बुद्धिमान व्यावहारिक संशोधक है जो वार्तालाप आधारित कोचिंग, रीयल-टाइम सिम्युलेटर और पर्यावरण ट्विन मॉडल के माध्यम से कॉलेज समुदायों और पर्यावरण-अनुकूल नागरिकों को दैनिक दिनचर्या बदलने के लिए सशक्त बनाता है।",
    viewDashboard: "लाइव सिम्युलेटर सैंडबॉक्स खोलें",
    ecoMindDescription: "अपनी जीवनशैली के उत्सर्जन संबंधी कारकों को गतिशील रूप से सुधारना शुरू करें।",
    backToLanding: "मुख्य पृष्ठ पर वापस जाएं",
    submit: "विवरण सबमिट करें",
    saving: "प्रक्रिया की जा रही है...",
    analyticsOverview: "वास्तविक समय फुटप्रिंट विश्लेषण",
    transport: "परिवहन/यातायात",
    electricity: "बिजली उपयोग",
    water: "पानी का उपयोग",
    diet: "आहार शैली",
    shopping: "खरीदारी की आदतें",
    totalFootprint: "कुल कार्बन फुटप्रिंट",
    breakdownByCategory: "श्रेणी के अनुसार कार्बन उत्सर्जन की व्याख्या",
    footprintSliceRatio: "सकल कार्बन फुटप्रिंट का प्रतिशत वितरण",
    earnedBadges: "अर्जित बैज / पदक",
    dailyEmission: "दैनिक उत्सर्जन गति",
    weeklyEmission: "साप्ताहिक उत्सर्जन गति",
    activeChallengesTitle: "सक्रिय पर्यावरण चुनौतियाँ",
    askCoachAI: "कार्बन कोच से पूछें",
    generateFullReport: "पूर्ण ऑडिट रिपोर्ट बनाएं",
    carbonAuditComplete: "कार्बन ऑडिट पूर्ण हुआ",
    scoreExplanation: "अपने परिवहन और दैनिक ऊर्जा उपयोग को अनुकूलित करके, आप धरती रक्षक स्तर तक पहुँच सकते हैं!",
    breakdownSubtitle: "यह आपके दैनिक जीवन के विकल्पों से जुड़े सापेक्षिक कार्बन भार को दिखाता है।",
    ratioSubtitle: "विभिन्न श्रेणियों में उत्पादित उत्सर्जन का प्रतिशत भार।"
  }
};
