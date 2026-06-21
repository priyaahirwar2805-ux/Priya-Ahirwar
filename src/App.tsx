import React, { useState, useEffect } from "react";
import {
  Leaf,
  Zap,
  Droplets,
  Bike,
  Shield,
  Trophy,
  Sparkles,
  MessageSquare,
  Compass,
  Cpu,
  Gauge,
  TrendingUp,
  AlertCircle,
  ShoppingBag,
  Plus,
  User,
  Users,
  School,
  ChevronRight,
  CheckCircle,
  Flame,
  Globe,
  Share2,
  Bookmark,
  Calendar,
  DollarSign,
  TrendingDown,
  Info,
  Award,
  Lock,
  ArrowRight,
  LogOut,
  Send,
  RefreshCw,
  FileText
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { UserProfile, CarbonResult, ChatMessage, Challenge, Badge } from "./types";
import { ALL_BADGES, INITIAL_INDIVIDUAL_LEADERBOARD, INITIAL_COLLEGE_LEADERBOARD, INITIAL_TEAM_LEADERBOARD } from "./utils/mockData";
import { TRANSLATIONS } from "./utils/translations";

export default function App() {
  // 0. Language & Auth State
  const [language, setLanguage] = useState<string>("en");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authName, setAuthName] = useState<string>("");
  const [authCollege, setAuthCollege] = useState<string>("");
  const [authTeam, setAuthTeam] = useState<string>("");
  const [authFeedback, setAuthFeedback] = useState<string>("");

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key as keyof typeof TRANSLATIONS[typeof language]] || 
           TRANSLATIONS["en"]?.[key as keyof typeof TRANSLATIONS["en"]] || 
           key;
  };

  // 1. Core State
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [onboarded, setOnboarded] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Priya Ahirwar",
    email: "priyaahirwar2805@gmail.com",
    college: "Harvard Eco Alliance",
    teamName: "Energy Rangers",
    transportation: { type: "car_petrol", distance: 15 },
    electricity: 180,
    water: 160,
    foodType: "balanced",
    deliveryCount: 3,
    shoppingHabit: "average"
  });

  const [carbonResult, setCarbonResult] = useState<CarbonResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Gamification & Badges State
  const [userPoints, setUserPoints] = useState<number>(1450);
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<string[]>(["badge_commuter", "badge_saver"]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completedChallengeIds, setCompletedChallengeIds] = useState<string[]>([]);
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<string>("individual");
  
  // Custom chatbot state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "Hi Priya! 🌿 I'm your **EcoMind AI Carbon Coach**. I've digested your domestic sustainability profile. Tell me about your routine, or ask any question (e.g. *'How can I lower my electricity footprint?'* or *'What is my largest carbon driver?'*) to start making micro-habits!",
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // What-If Simulator state
  const [customScenario, setCustomScenario] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<{
    carbonSavedAnnual: number;
    carbonSavedMonthly: number;
    costSavedMonthly: number;
    scoreImprovement: number;
    explanation: string;
  } | null>({
    carbonSavedAnnual: 240,
    carbonSavedMonthly: 20,
    costSavedMonthly: 15,
    scoreImprovement: 4,
    explanation: "Switching from driving to public transport for short distances lowers carbon by ~20 kg monthly. That acts equivalent to planting 12 spruce trees and clears ozone precursors!"
  });

  // Green Twin live slider temporary overrides for intuitive visual play
  const [twinTransitOverride, setTwinTransitOverride] = useState<string>("bicycle");
  const [twinAcHours, setTwinAcHours] = useState<number>(2); // target hours
  const [twinDietStyle, setTwinDietStyle] = useState<string>("vegan");

  // Insights / Official Audit Report card
  const [reportMarkdown, setReportMarkdown] = useState<string>("");
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);

  // Onboarding Step State
  const [onboardingStep, setOnboardingStep] = useState<number>(1);

  // -----------------------------------------------------
  // Trigger carbon analysis on startup / configuration
  // -----------------------------------------------------
  const runCarbonAnalysis = async (profileToAnalyze: UserProfile) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-lifestyle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profileToAnalyze, language })
      });
      const data = await response.json();
      if (data.success) {
        setCarbonResult({
          breakdown: data.breakdown,
          totalCarbon: data.totalCarbon,
          sustainabilityScore: data.sustainabilityScore,
          level: data.level,
          insights: data.insights,
          recommendations: data.recommendations
        });
        
        // Dynamically unlock standard badges based on actual sustainability score
        let currentBadges = [...unlockedBadgeIds];
        if (data.sustainabilityScore >= 80 && !currentBadges.includes("badge_champion")) {
          currentBadges.push("badge_champion");
        }
        setUnlockedBadgeIds(currentBadges);
      }
    } catch (err) {
      console.error("Error analyzing carbon trajectory:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run initial analysis with starter details
  useEffect(() => {
    runCarbonAnalysis(userProfile);
    fetchChallenges();

    // Dynamically localize initial chat message based on selected language
    const currentName = userProfile.name || "Earth Guardian";
    let text = "";
    if (language === "hi") {
      text = `नमस्ते ${currentName}! 🌿 मैं आपका **EcoMind AI कार्बन कोच** हूँ। मैंने आपके घरेलू सस्टेनेबिलिटी प्रोफ़ाइल का विश्लेषण किया है। अपनी दिनचर्या के बारे में बताएं, या कोई भी प्रश्न पूछें (जैसे *'मैं अपना बिजली पदचिह्न कैसे कम करूँ?'* या *'मेरा सबसे बड़ा कार्बन घटक क्या है?'*) ताकि हम सूक्ष्म-आदतें बनाना शुरू कर सकें!`;
    } else if (language === "es") {
      text = `¡Hola ${currentName}! 🌿 Soy tu **Adiestrador de Carbono EcoMind AI**. He digerido tu perfil de sostenibilidad doméstica. ¡Cuéntame sobre tu rutina o hazme cualquier pregunta (por ejemplo, *'¿Cómo puedo reducir mi huella eléctrica?'* o *'¿Cuál es mi mayor emisor de carbono?'*) para comenzar a crear micro-hábitos!`;
    } else if (language === "fr") {
      text = `Bonjour ${currentName} ! 🌿 Je suis votre **Coach Carbone EcoMind AI**. J'ai analysé votre profil de durabilité domestique. Parlez-moi de votre routine, ou posez-moi n'importe quelle question (par exemple : *'Comment réduire mon empreinte électrique ?'* ou *'Quel est mon principal facteur de carbone ?'*) pour commencer à adopter de bonnes habitudes !`;
    } else if (language === "de") {
      text = `Hallo ${currentName}! 🌿 Ich bin Ihr **EcoMind KI-CO2-Coach**. Ich habe Ihr Nachhaltigkeitsprofil analysiert. Erzählen Sie mir von Ihrem Alltag oder stellen Sie eine Frage (z.B. *'Wie kann ich meinen Stromverbrauch senken?'* oder *'Was ist mein größter CO2-Treiber?'*), um mit der Entwicklung umweltfreundlicher Gewohnheiten zu beginnen!`;
    } else {
      text = `Hi ${currentName}! 🌿 I'm your **EcoMind AI Carbon Coach**. I've digested your domestic sustainability profile. Tell me about your routine, or ask any question (e.g. *'How can I lower my electricity footprint?'* or *'What is my largest carbon driver?'*) to start making micro-habits!`;
    }

    setChatMessages([
      {
        sender: "bot",
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      }
    ]);
  }, [language]);

  const fetchChallenges = async () => {
    try {
      const response = await fetch("/api/challenges/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentProfile: userProfile, language })
      });
      const data = await response.json();
      if (data.success) {
        setChallenges(data.challenges);
      }
    } catch (err) {
      console.error("Error generating customized challenges:", err);
    }
  };

  const skipOnboardingToDefault = () => {
    setUserProfile({
      name: "Priya Ahirwar",
      email: "priyaahirwar2805@gmail.com",
      college: "Harvard Eco Alliance",
      teamName: "Energy Rangers",
      transportation: { type: "car_hybrid", distance: 8 },
      electricity: 110,
      water: 120,
      foodType: "vegetarian",
      deliveryCount: 1,
      shoppingHabit: "minimalist"
    });
    setOnboarded(true);
    setActiveTab("dashboard");
    runCarbonAnalysis({
      name: "Priya Ahirwar",
      email: "priyaahirwar2805@gmail.com",
      college: "Harvard Eco Alliance",
      teamName: "Energy Rangers",
      transportation: { type: "car_hybrid", distance: 8 },
      electricity: 110,
      water: 120,
      foodType: "vegetarian",
      deliveryCount: 1,
      shoppingHabit: "minimalist"
    });
  };

  // Convert raw transport IDs to labels
  const getTransportLabel = (type: string) => {
    switch (type) {
      case "car_petrol": return "Petrol Vehicle";
      case "car_hybrid": return "Hybrid Sedan";
      case "car_electric": return "Electric SUV";
      case "public_transit": return "Public Transit";
      case "motorbike": return "Motorbike";
      case "bicycle": return "Bicycle";
      default: return "Active Walking";
    }
  };

  const handleFinishOnboarding = () => {
    setOnboarded(true);
    setActiveTab("dashboard");
    runCarbonAnalysis(userProfile);
  };

  // Onboarding Field Change handlers
  const updateOnboardingField = (section: string, value: any) => {
    setUserProfile(prev => {
      if (section === "transport_type") {
        return { ...prev, transportation: { ...prev.transportation, type: value } };
      }
      if (section === "transport_distance") {
        return { ...prev, transportation: { ...prev.transportation, distance: Number(value) } };
      }
      return { ...prev, [section]: value };
    });
  };

  // Chat message submit handler
  const handleSendChatMessage = async (presetText?: string) => {
    const textToSend = presetText || chatInput;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!presetText) setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg].map(m => ({
            role: m.sender === "user" ? "user" : "model",
            content: m.text
          })),
          profile: userProfile,
          language
        })
      });

      const data = await response.json();
      if (data.success) {
        setChatMessages(prev => [...prev, {
          sender: "bot",
          text: data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      console.error("Chat engine failed, using recovery response:", err);
    } finally {
      setIsChatLoading(false);
    }
  };

  // What-If scenario calculation
  const handleWhatIfRun = async (scenarioSelected: string) => {
    setIsSimulating(true);
    try {
      const response = await fetch("/api/simulator/what-if", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: scenarioSelected,
          currentProfile: userProfile,
          language
        })
      });
      const data = await response.json();
      if (data.success) {
        setSimulationResult({
          carbonSavedAnnual: data.carbonSavedAnnual,
          carbonSavedMonthly: data.carbonSavedMonthly,
          costSavedMonthly: data.costSavedMonthly,
          scoreImprovement: data.scoreImprovement,
          explanation: data.explanation
        });
      }
    } catch (err) {
      console.error("Simulator engine offline:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Generate audit report tab
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setActiveTab("reports");
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentProfile: userProfile,
          challengeHistory: completedChallengeIds,
          language
        })
      });
      const data = await response.json();
      if (data.success) {
        setReportMarkdown(data.reportContent);
      }
    } catch (err) {
      console.error("Error generating report logic:", err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Challenge Complete Actions
  const handleCompleteChallenge = (challengeId: string, points: number, badgeId?: string) => {
    if (completedChallengeIds.includes(challengeId)) return;
    
    setCompletedChallengeIds(prev => [...prev, challengeId]);
    setUserPoints(prev => prev + points);
    
    // Auto-unlock corresponding badge
    if (badgeId && !unlockedBadgeIds.includes(badgeId)) {
      setUnlockedBadgeIds(prev => [...prev, badgeId]);
    }
  };

  // Calculate high-fidelity green twin calculations based on real parameters
  const currentCarbonTotal = carbonResult ? carbonResult.totalCarbon : 380;
  
  // Calculate Target Green Twin values dynamically
  const calculateTwinFootprint = () => {
    // 1. Target commuting factors
    let targetTransFactor = 0.0;
    if (twinTransitOverride === "car_electric") targetTransFactor = 0.05;
    else if (twinTransitOverride === "public_transit") targetTransFactor = 0.07;
    else if (twinTransitOverride === "bicycle" || twinTransitOverride === "walking") targetTransFactor = 0.00;
    else targetTransFactor = 0.10;
    const targetTransCO2 = (Number(userProfile.transportation.distance) || 0) * 30 * targetTransFactor;

    // 2. target energy
    // 1 AC hour is roughly 1.2 kWh. baseline is usually 5-8 hours.
    const baselineAcRatio = 120; // kWh baseline
    const targetElecKwh = Math.max(30, baselineAcRatio - ((6 - twinAcHours) * 1.2 * 30));
    const targetElecCO2 = targetElecKwh * 0.45;

    // 3. target diet
    let targetDietDaily = 2.9; // default diet style targeted (e.g. vegan)
    if (twinDietStyle === "vegetarian") targetDietDaily = 3.8;
    else if (twinDietStyle === "balanced") targetDietDaily = 5.1;
    const targetFoodCO2 = (targetDietDaily * 30);

    const targetWaterCO2 = (userProfile.water * 0.7) * 30 * 0.0015; // 30% reduction from green conservation
    const targetShoppingCO2 = 50; // minimalist standard shopping habits

    const targetTotal = Math.round((targetTransCO2 + targetElecCO2 + targetFoodCO2 + targetWaterCO2 + targetShoppingCO2) * 10) / 10;
    
    // calculate actual monthly saving
    const savedMonthlyCarbon = Math.max(10, Math.round((currentCarbonTotal - targetTotal) * 10) / 10);
    const savedMonthlyCost = Math.round(savedMonthlyCarbon * 0.45 + (6 - twinAcHours) * 30 * 0.18 + 20);

    return {
      targetTotal,
      savedMonthlyCarbon,
      savedMonthlyCost,
      savedAnnualCarbon: Math.round(savedMonthlyCarbon * 12)
    };
  };

  const twinResults = calculateTwinFootprint();

  // Helper arrays for chart preparation
  const chartData = carbonResult ? [
    { name: "Trans", value: carbonResult.breakdown.transportation, fill: "#10b981" },
    { name: "Electricity", value: carbonResult.breakdown.electricity, fill: "#3b82f6" },
    { name: "Water", value: carbonResult.breakdown.water, fill: "#06b6d4" },
    { name: "Diet", value: carbonResult.breakdown.food, fill: "#f59e0b" },
    { name: "Shopping", value: carbonResult.breakdown.shopping, fill: "#8b5cf6" }
  ] : [];

  const radarData = carbonResult ? [
    { subject: "Mobility", A: Math.round(150 - carbonResult.breakdown.transportation) },
    { subject: "Grid Energy", A: Math.round(150 - carbonResult.breakdown.electricity) },
    { subject: "Aquatic Use", A: Math.round(150 - carbonResult.breakdown.water * 4) },
    { subject: "Planetary Food", A: Math.round(150 - carbonResult.breakdown.food * 0.6) },
    { subject: "Circular Shop", A: Math.round(150 - carbonResult.breakdown.shopping * 0.8) }
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900" id="app_root">
      
      {/* HEADER / NAVIGATION METADATA BRAND */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200" id="header_navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("landing")} id="brand_logo">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-200">
              <Leaf className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                EcoMind <span className="text-emerald-600">AI</span>
              </span>
              <p className="text-xs text-slate-500 font-medium">Personal Carbon Coach</p>
            </div>
          </div>

          {/* Nav pills for large monitors */}
          {onboarded && (
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl" id="desktop_nav">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                  activeTab === "dashboard" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
                id="tab_dashboard_btn"
              >
                {t("dashboard")}
              </button>
              <button
                onClick={() => setActiveTab("coach")}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                  activeTab === "coach" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
                id="tab_coach_btn"
              >
                {t("aiCoach")}
              </button>
              <button
                onClick={() => setActiveTab("twin")}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                  activeTab === "twin" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
                id="tab_twin_btn"
              >
                {t("greenTwin")}
              </button>
              <button
                onClick={() => setActiveTab("whatif")}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                  activeTab === "whatif" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
                id="tab_whatif_btn"
              >
                {t("whatIf")}
              </button>
              <button
                onClick={() => setActiveTab("challenges")}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                  activeTab === "challenges" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
                id="tab_challenges_btn"
              >
                {t("challenges")}
              </button>
              <button
                onClick={() => setActiveTab("leaderboard")}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                  activeTab === "leaderboard" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
                id="tab_leaderboard_btn"
              >
                {t("leaderboard")}
              </button>
              <button
                onClick={() => setActiveTab("achievements")}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                  activeTab === "achievements" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
                id="tab_achievements_btn"
              >
                {t("badges")}
              </button>
            </nav>
          )}

          {/* User Score pill & info if enrolled */}
          <div className="flex items-center gap-3" id="header_badge_status">
            {onboarded ? (
              <div className="flex items-center gap-2">
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1.5 text-sm font-medium">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>{userPoints} {t("points")}</span>
                </div>
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800">{userProfile.name}</span>
                  <span className="text-[10px] text-emerald-600 font-bold">{carbonResult?.level || "Eco Explorer"}</span>
                </div>
                <button 
                  onClick={() => {
                    setIsLoggedIn(false);
                    setOnboarded(false);
                    setUserProfile({
                      name: "",
                      email: "",
                      college: "",
                      teamName: "",
                      transportation: { type: "car_petrol", distance: 15 },
                      electricity: 180,
                      water: 160,
                      foodType: "balanced",
                      deliveryCount: 3,
                      shoppingHabit: "average"
                    });
                    setActiveTab("landing");
                  }}
                  title="Log out of system"
                  className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-650 text-red-600 text-xs rounded-xl transition border border-red-200 font-semibold"
                >
                  {t("logout")}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Clean inline language selection in header */}
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none hover:bg-slate-100 transition cursor-pointer font-semibold"
                  title="Select Language"
                >
                  <option value="en">🇬🇧 English</option>
                  <option value="es">🇪🇸 Español</option>
                  <option value="fr">🇫🇷 Français</option>
                  <option value="de">🇩🇪 Deutsch</option>
                  <option value="hi">🇮🇳 हिन्दी</option>
                </select>

                <button
                  onClick={() => {
                    setAuthMode("signin");
                    setAuthFeedback("");
                    setActiveTab("login");
                  }}
                  className="text-slate-700 hover:text-slate-900 text-xs font-bold px-3 py-2 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
                  id="header_login_btn"
                >
                  {t("signIn")}
                </button>

                <button
                  onClick={() => {
                    setActiveTab("onboarding");
                    setOnboardingStep(1);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm cursor-pointer"
                  id="header_get_started_btn"
                >
                  {t("startCoaching")}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE FLOATING MENU FOR HIGH ACCESSIBILITY */}
      {onboarded && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-50 py-2.5 px-3 block lg:hidden shadow-xl" id="mobile_nav_panel">
          <div className="grid grid-cols-5 gap-1 text-center justify-center max-w-md mx-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors ${
                activeTab === "dashboard" ? "text-emerald-700 bg-emerald-50" : "text-slate-500 hover:text-slate-800"
              }`}
              id="mobile_nav_dashboard"
            >
              <Gauge className="w-5 h-5 mx-auto" />
              <span className="text-[10px] font-bold mt-1 block">Trace</span>
            </button>
            <button
              onClick={() => setActiveTab("coach")}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors ${
                activeTab === "coach" ? "text-emerald-700 bg-emerald-50" : "text-slate-500 hover:text-slate-800"
              }`}
              id="mobile_nav_coach"
            >
              <MessageSquare className="w-5 h-5 mx-auto" />
              <span className="text-[10px] font-bold mt-1 block">Coach</span>
            </button>
            <button
              onClick={() => setActiveTab("twin")}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors ${
                activeTab === "twin" ? "text-emerald-700 bg-emerald-50" : "text-slate-500 hover:text-slate-800"
              }`}
              id="mobile_nav_twin"
            >
              <Users className="w-5 h-5 mx-auto" />
              <span className="text-[10px] font-bold mt-1 block">Twin</span>
            </button>
            <button
              onClick={() => setActiveTab("whatif")}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors ${
                activeTab === "whatif" ? "text-emerald-700 bg-emerald-50" : "text-slate-500 hover:text-slate-800"
              }`}
              id="mobile_nav_whatif"
            >
              <Cpu className="w-5 h-5 mx-auto" />
              <span className="text-[10px] font-bold mt-1 block">What-If</span>
            </button>
            <button
              onClick={() => setActiveTab("challenges")}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors ${
                activeTab === "challenges" ? "text-emerald-700 bg-emerald-50" : "text-slate-500 hover:text-slate-800"
              }`}
              id="mobile_nav_challenges"
            >
              <Trophy className="w-5 h-5 mx-auto" />
              <span className="text-[10px] font-bold mt-1 block">Quests</span>
            </button>
          </div>
        </div>
      )}

      {/* CORE VIEW ROUTER GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16 lg:mb-6">
        
        {/* VIEW 1: LANDING ENVIRONMENT */}
        {activeTab === "landing" && (
          <div className="space-y-16 py-8" id="view_landing">
            
            {/* HERO BANNER SECTION */}
            <div className="relative text-center max-w-4xl mx-auto space-y-6" id="hero_section">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/80 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-800 animate-bounce">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Modern AI Personal Coach & Predictive Environment Simulator</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-none">
                Stop Calculating. Start <span className="text-emerald-600 accent-emerald-500 underline decoration-wavy decoration-emerald-300">Reducing</span>.
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium">
                EcoMind AI isn't just a carbon counter. It is an intelligent behavioral modifier that empowers college communities and green citizens to transform daily routines through conversational coaching, real-time What-If engines, and predictive twin models.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setActiveTab("onboarding");
                    setOnboardingStep(1);
                  }}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-2xl transition shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer"
                  id="landing_start_btn"
                >
                  <span>{t("startCoaching")}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setAuthMode("signin");
                    setAuthFeedback("");
                    setActiveTab("login");
                  }}
                  className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-800 font-bold px-8 py-3.5 rounded-2xl transition border border-slate-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  id="landing_login_btn"
                >
                  <span>{t("signIn")} / {t("selectLanguage")}</span>
                  <Globe className="w-5 h-5 text-emerald-600" />
                </button>
                <button
                  onClick={skipOnboardingToDefault}
                  className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold px-8 py-3.5 rounded-2xl transition border border-slate-200/80 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  id="landing_demo_btn"
                >
                  <span>{t("quickDemo")}</span>
                  <Compass className="w-5 h-5 text-slate-500 animate-spin-slow" />
                </button>
              </div>

              {/* Aesthetic Mockup Metric Summary inside Landing Page */}
              <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-3xl font-extrabold text-emerald-600 block">45%</span>
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Avg Carbon Reduction</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-3xl font-extrabold text-blue-600 block">4.2M</span>
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Liters Water Saved</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-3xl font-extrabold text-orange-600 block">$420+</span>
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Annual Cost Savings/Capita</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-3xl font-extrabold text-purple-600 block">18,400+</span>
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Active College Students</span>
                </div>
              </div>
            </div>

            {/* PROBLEM VS SOLUTION COMPONENT */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto" id="problem_solution">
              
              <div className="bg-red-50/50 p-8 rounded-3xl border border-red-100 space-y-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">The Problem with Legacy Trackers</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Most carbon footprint carbon software computes past emissions, outputs a generic static pie chart, and stops there. There is zero behavioral guidance, positive reinforcement, or customized local alternatives to support real, long-term behavior change.
                </p>
                <ul className="text-xs text-slate-500 space-y-2 list-disc list-inside">
                  <li>Generic average emission statistics</li>
                  <li>Judgmental score readouts</li>
                  <li>Lacks predictive twin models</li>
                </ul>
              </div>

              <div className="bg-emerald-50/50 p-8 rounded-3xl border border-emerald-100 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">The EcoMind AI Paradigm</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We turn analysis into action. With real-time predictive what-if simulators, a side-by-side holographic "Green Twin" modeling interface, localized challenges tailored to you, and natural language AI coaching, we facilitate progressive, gamified behavior shift.
                </p>
                <ul className="text-xs text-emerald-700 space-y-2 list-disc list-inside font-medium">
                  <li>Natural language conversation and diagnosis</li>
                  <li>Real time scenario impact calculations</li>
                  <li>Intense gamification with badges and community tables</li>
                </ul>
              </div>

            </div>

            {/* PLATFORM FEATURES DETAILS GALLERY */}
            <div className="space-y-8" id="platform_features_grid">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Unpacking the Personal Sustainability Coach</h2>
                <p className="text-slate-500 text-sm mt-1">Everything you need to guide you from Green Beginner to Planet Guardian</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:translate-y-[-4px] transition cursor-pointer" onClick={() => { setActiveTab("onboarding"); setOnboardingStep(1); }}>
                  <Compass className="w-8 h-8 text-emerald-600 mb-3" />
                  <h4 className="text-lg font-bold text-slate-950">1. Smart Onboarding</h4>
                  <p className="text-xs text-slate-500 mt-2">Provides immediate ecological segmentation for commutes, diet, and lifestyle to map your personal baseline emissions accurately.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:translate-y-[-4px] transition cursor-pointer" onClick={skipOnboardingToDefault}>
                  <MessageSquare className="w-8 h-8 text-emerald-600 mb-3" />
                  <h4 className="text-lg font-bold text-slate-950">2. Conversational Carbon Coach</h4>
                  <p className="text-xs text-slate-500 mt-2">Chat in natural language directly with an intelligent companion that parses details, gives feedback, and advises smart changes.</p>
                </div>

                <div className="bg-white p-6 rounded-1xl border border-slate-200 shadow-sm hover:translate-y-[-4px] transition cursor-pointer" onClick={() => { skipOnboardingToDefault(); setActiveTab("twin"); }}>
                  <Users className="w-8 h-8 text-emerald-600 mb-3" />
                  <h4 className="text-lg font-bold text-slate-950">3. Holographic Green Twin</h4>
                  <p className="text-xs text-slate-500 mt-2">Side-by-side virtual modeling space! Adjust slider behaviors to compare baseline costs against your optimized sustainability twin.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:translate-y-[-4px] transition cursor-pointer" onClick={() => { skipOnboardingToDefault(); setActiveTab("whatif"); }}>
                  <Cpu className="w-8 h-8 text-emerald-600 mb-3" />
                  <h4 className="text-lg font-bold text-slate-950">4. Live What-If AI Simulation</h4>
                  <p className="text-xs text-slate-500 mt-2">Ask complex climate scenarios and watch as the carbon prediction engines render cost offsets, grid savings, and tree equivalence metrics.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:translate-y-[-4px] transition cursor-pointer" onClick={() => { skipOnboardingToDefault(); setActiveTab("challenges"); }}>
                  <Trophy className="w-8 h-8 text-emerald-600 mb-3" />
                  <h4 className="text-lg font-bold text-slate-950">5. Dynamic Weekly Quests</h4>
                  <p className="text-xs text-slate-500 mt-2">Complete personalized challenges like "Eco-mobility Commutes" or "Zero-Single-Use Plastics Day" to harvest score points and awards.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:translate-y-[-4px] transition cursor-pointer" onClick={() => { skipOnboardingToDefault(); setActiveTab("leaderboard"); }}>
                  <School className="w-8 h-8 text-emerald-600 mb-3" />
                  <h4 className="text-lg font-bold text-slate-950">6. University Leaderboard</h4>
                  <p className="text-xs text-slate-500 mt-2">Spur climate action globally! Form teams, join college community cohorts, and compete for zero-emissions victory ranks.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 1.5: LOGIN / SIGNUP WITH LANGUAGE SECTION */}
        {activeTab === "login" && (
          <div className="max-w-md mx-auto py-8" id="view_login">
            <div className="text-center mb-8">
              <div className="inline-flex w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 items-center justify-center shadow-inner mb-3">
                <Shield className="w-8 h-8 font-extrabold" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t("loginTitle")}</h2>
              <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">{t("loginSub")}</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 space-y-6">
              
              {/* LANGUAGE SELECTION COMPONENT - High Visual Contrast / Capsule Choice */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 shadow-inner">
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5 justify-center sm:justify-start">
                  <Globe className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span>{t("selectLanguage")}</span>
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { code: "en", label: "English", flag: "🇬🇧" },
                    { code: "es", label: "Español", flag: "🇪🇸" },
                    { code: "fr", label: "Français", flag: "🇫🇷" },
                    { code: "de", label: "Deutsch", flag: "🇩🇪" },
                    { code: "hi", label: "हिन्दी", flag: "🇮🇳" }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setLanguage(lang.code)}
                      className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-[11px] font-bold cursor-pointer border transition-all ${
                        language === lang.code
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-102"
                          : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      <span className="text-sm leading-none">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* AUTHENTICATION FORM FIELDS */}
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!authEmail || !authPassword || (authMode === "signup" && !authName)) {
                  setAuthFeedback(t("enterValidCredentials"));
                  return;
                }
                
                setAuthFeedback("");
                // Real profile mapping
                const updatedProfile = {
                  name: authMode === "signup" ? authName : (authName || "Priya Ahirwar"),
                  email: authEmail,
                  college: authCollege || "Harvard Eco Alliance",
                  teamName: authTeam || "Energy Rangers",
                  transportation: { type: "car_hybrid", distance: 8 },
                  electricity: 110,
                  water: 120,
                  foodType: "balanced",
                  deliveryCount: 2,
                  shoppingHabit: "average"
                } as any;
                
                setUserProfile(updatedProfile);
                setIsLoggedIn(true);
                setOnboarded(true); // Sign in gets immediately onboarded and logs in
                
                const isReg = authMode === "signup";
                setAuthFeedback(isReg ? t("registerSuccess") : t("loginSuccess"));
                
                runCarbonAnalysis(updatedProfile);
                
                setTimeout(() => {
                  setActiveTab("dashboard");
                }, 1000);
              }} className="space-y-4">
                
                {authFeedback && (
                  <div className={`p-3 rounded-xl border text-xs font-bold text-center ${
                    authFeedback.includes("!") 
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 animate-pulse" 
                      : "bg-red-50 text-red-800 border-red-200"
                  }`}>
                    {authFeedback}
                  </div>
                )}

                {authMode === "signup" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("fullName")}</label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="e.g. Priya Ahirwar"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition text-sm"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("email")}</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@university.edu"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("password")}</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition text-sm"
                  />
                </div>

                {authMode === "signup" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("college")}</label>
                      <input
                        type="text"
                        value={authCollege}
                        onChange={(e) => setAuthCollege(e.target.value)}
                        placeholder="e.g. Harvard Eco Alliance"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("teamName")}</label>
                      <input
                        type="text"
                        value={authTeam}
                        onChange={(e) => setAuthTeam(e.target.value)}
                        placeholder="e.g. Energy Rangers"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition text-sm"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-200/50 hover:shadow-emerald-300/60 hover:translate-y-[-1px] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                >
                  <Lock className="w-4 h-4" />
                  <span>{authMode === "signin" ? t("signIn") : t("signUp")}</span>
                </button>
              </form>

              {/* TOGGLE STATUS */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "signin" ? "signup" : "signin");
                    setAuthFeedback("");
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline transition cursor-pointer"
                >
                  {authMode === "signin" ? t("dontHaveAccount") : t("alreadyHaveAccount")}
                </button>
              </div>

              {/* SEPARATOR */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 font-mono text-[9px] tracking-wider uppercase">OR</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // pre-load Priya
                    setUserProfile({
                      name: "Priya Ahirwar",
                      email: "priyaahirwar2805@gmail.com",
                      college: "Harvard Eco Alliance",
                      teamName: "Energy Rangers",
                      transportation: { type: "car_hybrid", distance: 8 },
                      electricity: 110,
                      water: 120,
                      foodType: "vegetarian",
                      deliveryCount: 1,
                      shoppingHabit: "minimalist"
                    });
                    setIsLoggedIn(true);
                    setOnboarded(true);
                    setActiveTab("dashboard");
                    runCarbonAnalysis({
                      name: "Priya Ahirwar",
                      email: "priyaahirwar2805@gmail.com",
                      college: "Harvard Eco Alliance",
                      teamName: "Energy Rangers",
                      transportation: { type: "car_hybrid", distance: 8 },
                      electricity: 110,
                      water: 120,
                      foodType: "vegetarian",
                      deliveryCount: 1,
                      shoppingHabit: "minimalist"
                    });
                  }}
                  className="text-xs bg-slate-100 hover:bg-slate-205 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl transition cursor-pointer text-center"
                >
                  ⚡ {t("quickDemo")}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("landing")}
                  className="text-center text-slate-400 text-[11px] hover:text-slate-600 font-semibold cursor-pointer"
                >
                  ← {t("backToLanding")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: SMART ONBOARDING PROCESS */}
        {activeTab === "onboarding" && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden" id="view_onboarding">
            
            {/* Onboarding Header */}
            <div className="bg-gradient-to-r from-emerald-750 to-teal-900 bg-emerald-800 text-white p-8">
              <div className="flex justify-between items-center text-xs opacity-80 uppercase tracking-widest font-bold">
                <span>Personal Sustainability Enrollment</span>
                <span>Step {onboardingStep} of 4</span>
              </div>
              <h2 className="text-2xl font-bold mt-2">Let's Establish Your Baseline</h2>
              <p className="text-emerald-100 text-xs mt-1">Our intelligent Carbon Coach converts these simple configurations into diagnostic lifestyle footprints.</p>
            </div>

            {/* STEP PROGRESS METER */}
            <div className="h-1.5 w-full bg-slate-100 flex">
              <div className={`h-full transition-all duration-300 bg-emerald-500 ${
                onboardingStep === 1 ? "w-1/4" : onboardingStep === 2 ? "w-2/4" : onboardingStep === 3 ? "w-3/4" : "w-full"
              }`} />
            </div>

            <div className="p-8 space-y-6">

              {/* STEP 1: IDENTITY & SOCIAL COMMUNITY */}
              {onboardingStep === 1 && (
                <div className="space-y-5 animate-fadeIn" id="onboard_step1">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-slate-900">Step 1: Your Green Identifier</h3>
                    <p className="text-slate-500 text-xs">This links you to community challenges, badges, and college rankings on the leaderboard network.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Display Name</label>
                      <input
                        type="text"
                        value={userProfile.name}
                        onChange={(e) => updateOnboardingField("name", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
                      <input
                        type="email"
                        value={userProfile.email}
                        onChange={(e) => updateOnboardingField("email", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">College / University Community</label>
                      <select
                        value={userProfile.college}
                        onChange={(e) => updateOnboardingField("college", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Harvard Eco Alliance">Harvard Eco Alliance</option>
                        <option value="MIT Energy Initiative">MIT Energy Initiative</option>
                        <option value="Stanford Climate Coalition">Stanford Climate Coalition</option>
                        <option value="UC Berkeley Green Action">UC Berkeley Green Action</option>
                        <option value="State College Sustainability">State College Sustainability</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Eco Team Selection</label>
                      <select
                        value={userProfile.teamName}
                        onChange={(e) => updateOnboardingField("teamName", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Energy Rangers">Energy Rangers</option>
                        <option value="Eco Avengers">Eco Avengers</option>
                        <option value="Micro-mobility Coalition">Micro-mobility Coalition</option>
                        <option value="Vegan Planet Cheer">Vegan Planet Cheer</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: TRANSIT MOBILITY */}
              {onboardingStep === 2 && (
                <div className="space-y-6 animate-fadeIn" id="onboard_step2">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-slate-900">Step 2: Transportation & Mobility</h3>
                    <p className="text-slate-500 text-xs">Commuting drives almost half of global personal carbon spikes. Detail your general daily travel routing.</p>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Primary Commute Vehicle</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: "car_petrol", label: "Petrol Car", icon: "🚗" },
                        { id: "car_hybrid", label: "Hybrid Sedan", icon: "🔋" },
                        { id: "car_electric", label: "Electric SUV", icon: "⚡" },
                        { id: "public_transit", label: "Public Transit", icon: "🚌" },
                        { id: "motorbike", label: "Motorbike", icon: "🏍️" },
                        { id: "bicycle", label: "Bicycle", icon: "🚲" },
                        { id: "walking", label: "Walking/Active", icon: "🚶" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => updateOnboardingField("transport_type", item.id)}
                          className={`p-4 border rounded-2xl text-center transition hover:bg-slate-50 ${
                            userProfile.transportation.type === item.id
                              ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold"
                              : "border-slate-200 text-slate-700"
                          }`}
                        >
                          <span className="text-2xl block mb-1">{item.icon}</span>
                          <span className="text-xs">{item.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-4">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                        <span>Average Daily Commute Distance</span>
                        <span className="text-emerald-600">{userProfile.transportation.distance} km</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        value={userProfile.transportation.distance}
                        onChange={(e) => updateOnboardingField("transport_distance", e.target.value)}
                        className="w-full accent-emerald-600 bg-slate-100 h-2 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mt-1">
                        <span>Minimal (0 km)</span>
                        <span>Long (80 km+)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: AMBIENT DOMESTIC POWER & GRID */}
              {onboardingStep === 3 && (
                <div className="space-y-6 animate-fadeIn" id="onboard_step3">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-slate-900">Step 3: Home Energy & Utilities</h3>
                    <p className="text-slate-500 text-xs">Our grids still burn high-emissions coal and gas. Your domestic usage pattern dictates grid loading pressure.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                        <span>Average Monthly Electrical Grid Draw</span>
                        <span className="text-emerald-600">{userProfile.electricity} kWh</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="500"
                        value={userProfile.electricity}
                        onChange={(e) => updateOnboardingField("electricity", e.target.value)}
                        className="w-full accent-emerald-600 bg-slate-100 h-2 rounded-lg cursor-pointer"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        👉 *Tip: Running high-load AC accounts for 50-70% of typical family electricity bills.*
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                        <span>Estimated Daily Water Footprint</span>
                        <span className="text-blue-600">{userProfile.water} Liters</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="350"
                        value={userProfile.water}
                        onChange={(e) => updateOnboardingField("water", e.target.value)}
                        className="w-full accent-blue-600 bg-slate-100 h-2 rounded-lg cursor-pointer"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        👉 *Includes: long warm showers, running sink taps, washing machines, and toilet flushing.*
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: DIET STYLE & RETAIL EXPENDITURE */}
              {onboardingStep === 4 && (
                <div className="space-y-6 animate-fadeIn" id="onboard_step4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-slate-900">Step 4: Food Preference & Retail Habits</h3>
                    <p className="text-slate-500 text-xs">Agricultural chains and factory logistics contribute highly to chemical and microplastic emissions.</p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Primary Dietary Choice</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: "vegan", label: "Vegan", desc: "No animal products. Clean planetary score." },
                          { id: "vegetarian", label: "Vegetarian", desc: "Dairy and eggs included. Moderate profile." },
                          { id: "balanced", label: "Balanced / Flexitarian", desc: "Average poultry and fish. Typical profile." },
                          { id: "carnivore", label: "Carnivore (Meat Heavy)", desc: "Heavy beef or pork. High emissions." }
                        ].map((diet) => (
                          <div
                            key={diet.id}
                            onClick={() => updateOnboardingField("foodType", diet.id)}
                            className={`p-4 border rounded-2xl cursor-pointer transition hover:bg-slate-50 ${
                              userProfile.foodType === diet.id
                                ? "border-emerald-500 bg-emerald-50/50"
                                : "border-slate-200"
                            }`}
                          >
                            <span className="text-sm font-bold text-slate-900 block">{diet.label}</span>
                            <span className="text-[11px] text-slate-500">{diet.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span>Weekly Delivery Food Orders</span>
                          <span className="text-emerald-600">{userProfile.deliveryCount} times</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={userProfile.deliveryCount}
                          onChange={(e) => updateOnboardingField("deliveryCount", e.target.value)}
                          className="w-full accent-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Consumer Shopping Behavior</label>
                        <select
                          value={userProfile.shoppingHabit}
                          onChange={(e) => updateOnboardingField("shoppingHabit", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                        >
                          <option value="minimalist">Minimalist (Buy second-hand / rarely buy non-essentials)</option>
                          <option value="average">Average (Buy new clothes/tech when needed)</option>
                          <option value="heavy">Heavy Shopper (Fast fashion, frequent tech swaps)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NAVIGATION BUTTONS */}
              <div className="flex justify-between gap-3 pt-6 border-t border-slate-100">
                {onboardingStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(prev => prev - 1)}
                    className="px-6 py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition"
                  >
                    Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab("landing")}
                    className="px-6 py-2.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition"
                  >
                    Cancel
                  </button>
                )}

                {onboardingStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(prev => prev + 1)}
                    className="px-6 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm ml-auto"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishOnboarding}
                    className="px-8 py-2.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-md flex items-center gap-2 ml-auto"
                    id="finish_registration_btn"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Analyzing Footprints...</span>
                      </>
                    ) : (
                      <>
                        <span>Finish & Save Profile</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ONBOARDED AND ENROLLED INTERFACES */}
        {onboarded && (
          <div className="space-y-8 animate-fadeIn" id="dashboard_interfaces">

            {/* VIEW 3: MAIN CARBON DASHBOARD */}
            {activeTab === "dashboard" && carbonResult && (
              <div className="space-y-8" id="view_dashboard">
                
                {/* TOP PROFILE BANNER */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Gauge & Score overview */}
                  <div className="lg:col-span-2 bg-gradient-to-br from-emerald-950 to-emerald-900 text-white p-8 rounded-3xl relative overflow-hidden shadow-xl" id="diagnostic_gauge_container">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
                    
                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-800 rounded-full text-[11px] font-bold tracking-wide uppercase text-emerald-300">
                          <Shield className="w-3.5 h-3.5" />
                          <span>{t("carbonAuditComplete")}</span>
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight">{t("overallScore")}: <span className="text-emerald-400">{carbonResult.sustainabilityScore}</span>/100</h2>
                        <p className="text-emerald-100/90 text-sm max-w-md font-medium">
                          {language === "hi" ? (
                            <span>आप एक **{carbonResult.level === "Eco Practitioner" ? "इको प्रैक्टिशनर" : carbonResult.level === "Eco Warrior" ? "इको वॉरियर" : "इको चैंपियन"}** के रूप में वर्गीकृत हैं। {t("scoreExplanation")}</span>
                          ) : (
                            <span>You are classified as a **{carbonResult.level}**. {t("scoreExplanation")}</span>
                          )}
                        </p>
                        
                        <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                          <button
                            onClick={() => setActiveTab("coach")}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{t("askCoachAI")}</span>
                          </button>
                          <button
                            onClick={handleGenerateReport}
                            className="bg-emerald-800 hover:bg-emerald-700 text-emerald-200 text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5 border border-emerald-700 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{t("generateFullReport")}</span>
                          </button>
                        </div>
                      </div>

                      {/* Score Arc visual wheel using standard html elements & SVG */}
                      <div className="relative w-36 h-36 flex items-center justify-center bg-emerald-850/50 rounded-full border border-emerald-800">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="52"
                            stroke="#064e3b"
                            strokeWidth="8"
                            fill="transparent"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="52"
                            stroke="#10b981"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={326.7}
                            strokeDashoffset={326.7 - (326.7 * carbonResult.sustainabilityScore) / 100}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-4xl font-extrabold text-white leading-none">{carbonResult.sustainabilityScore}</span>
                          <span className="text-[10px] uppercase font-bold text-emerald-300 mt-1">Sustainability</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick stats panel */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4" id="stats_panel">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">{t("totalFootprint")}</span>
                      <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
                        {carbonResult.totalCarbon} <span className="text-base text-slate-500 font-bold">kg CO2 / mo</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold pt-1">
                        🌍 {language === "hi" ? (
                          <span>यह सालाना लगभग **{Math.round(carbonResult.totalCarbon * 12)} किग्रा** के बराबर है। सतत लक्ष्य **&lt; 150 किग्रा** है।</span>
                        ) : (
                          <span>That corresponds to **{Math.round(carbonResult.totalCarbon * 12)} kg** annually. Sustainable standard is **&lt; 150 kg**.</span>
                        )}
                      </p>
                    </div>

                    <div className="h-px bg-slate-100" />

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">{t("dailyEmission")}</span>
                        <span className="text-sm font-extrabold text-slate-800">{Math.round(carbonResult.totalCarbon / 30 * 10) / 10} kg</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">{t("weeklyEmission")}</span>
                        <span className="text-sm font-extrabold text-slate-800">{Math.round(carbonResult.totalCarbon / 4 * 10) / 10} kg</span>
                      </div>
                      <div className="bg-emerald-50 text-emerald-950 p-2.5 rounded-xl border border-emerald-100">
                        <span className="text-[10px] text-emerald-600 font-bold block uppercase">{t("earnedBadges")}</span>
                        <span className="text-sm font-extrabold text-emerald-800">{unlockedBadgeIds.length}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* GRAPH SECTION - DETAILED VISUAL CHART ECO-ANALYTICS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Category detailed breakdown with progress meters */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-md font-bold text-slate-900">{t("breakdownByCategory")}</h4>
                      <p className="text-xs text-slate-400">{t("breakdownSubtitle")}</p>
                    </div>

                    <div className="space-y-3.5">
                      {/* Transport */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="flex items-center gap-1 text-slate-700">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" /> Commutes ({getTransportLabel(userProfile.transportation.type)})
                          </span>
                          <span className="text-slate-900">{carbonResult.breakdown.transportation} kg CO2</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, (carbonResult.breakdown.transportation / carbonResult.totalCarbon) * 100)}%` }} />
                        </div>
                      </div>

                      {/* Electricity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="flex items-center gap-1 text-slate-700">
                            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block" /> Electricity grid load
                          </span>
                          <span className="text-slate-900">{carbonResult.breakdown.electricity} kg CO2</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full" style={{ width: `${Math.min(100, (carbonResult.breakdown.electricity / carbonResult.totalCarbon) * 100)}%` }} />
                        </div>
                      </div>

                      {/* Water */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="flex items-center gap-1 text-slate-700">
                            <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full inline-block" /> Domestic Water pump/treatment
                          </span>
                          <span className="text-slate-900">{carbonResult.breakdown.water} kg CO2</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-cyan-400 h-full" style={{ width: `${Math.min(100, (carbonResult.breakdown.water / carbonResult.totalCarbon) * 100)}%` }} />
                        </div>
                      </div>

                      {/* Diet style */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="flex items-center gap-1 text-slate-700">
                            <span className="w-2.5 h-2.5 bg-amber-505 bg-amber-500 rounded-full inline-block" /> Diet Lifestyle ({userProfile.foodType.toUpperCase()})
                          </span>
                          <span className="text-slate-900">{carbonResult.breakdown.food} kg CO2</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full" style={{ width: `${Math.min(100, (carbonResult.breakdown.food / carbonResult.totalCarbon) * 100)}%` }} />
                        </div>
                      </div>

                      {/* Shopping */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="flex items-center gap-1 text-slate-700">
                            <span className="w-2.5 h-2.5 bg-purple-500 rounded-full inline-block" /> {t("shopping")}
                          </span>
                          <span className="text-slate-900">{carbonResult.breakdown.shopping} kg CO2</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full" style={{ width: `${Math.min(100, (carbonResult.breakdown.shopping / carbonResult.totalCarbon) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RECHARTS CHANNELS */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="text-md font-bold text-slate-900 text-center sm:text-left">{t("footprintSliceRatio")}</h4>
                      <p className="text-xs text-slate-400 text-center sm:text-left">{t("ratioSubtitle")}</p>
                    </div>

                    <div className="h-56 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value} kg CO2`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-bold text-slate-500">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> {t("transport")}</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> {t("electricity")}</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> {t("water")}</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> {t("diet")}</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> {t("shopping")}</span>
                    </div>
                  </div>

                  {/* RADAR ANALYTICS OF SUSTAINABILITY SUCCESS */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="text-md font-bold text-slate-900">Conservation Efficiency Rating</h4>
                      <p className="text-xs text-slate-400">Outer points represent higher conservation efficiency (less waste).</p>
                    </div>

                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }} />
                          <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fill: "#94a3b8" }} />
                          <Radar name="Efficiency Value" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

                {/* ADVISORY CARDS AND IMMEDIATE QUICK-ACTION RECOMMENDATIONS */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Personalized Coach Recommendations</h3>
                      <p className="text-xs text-slate-400">Custom tailored mitigation strategies created by our smart sustainability panel.</p>
                    </div>
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-100/50 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" /> AI Calibrated
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {carbonResult.recommendations.map((rec) => (
                      <div key={rec.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                            rec.category === "Transportation" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            rec.category === "Energy" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                            rec.category === "Diet" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                            "bg-purple-50 text-purple-700 border border-purple-100"
                          }`}>
                            {rec.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">{rec.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">{rec.description}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                          <div className="text-emerald-700 flex items-center gap-0.5">
                            <TrendingDown className="w-3.5 h-3.5" />
                            <span>-{rec.carbonReduction} kg CO2/mo</span>
                          </div>
                          <div className="text-slate-800 flex items-center">
                            <DollarSign className="w-3 h-3 text-slate-400" />
                            <span>Save ${rec.costSaving}/mo</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SNEAK PEEK FOR OTHER MAJOR INTEGRATIONS */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-200">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-slate-900">Conversational Sandbox</h4>
                      <p className="text-xs text-slate-600">Explain your unique commute style or house insulation in human language to refine estimates.</p>
                      <button onClick={() => setActiveTab("coach")} className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-0.5">
                        <span>Open chatbot chat</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-pink-50/50 rounded-2xl p-5 border border-pink-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-pink-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-slate-900">Green Twin Sim</h4>
                      <p className="text-xs text-slate-600 font-medium">Render a live predictive simulator of how shifting AC hours or diets will instantly translate into annual cost and pine-tree ratios!</p>
                      <button onClick={() => setActiveTab("twin")} className="text-xs text-pink-700 font-bold hover:underline flex items-center gap-0.5">
                        <span>Check twin target</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-slate-900">Weekly Carbon-Cut Challenge</h4>
                      <p className="text-xs text-slate-600">Complete customized tasks to increase your leaderboard position and claim the "Water Guardian" credential.</p>
                      <button onClick={() => setActiveTab("challenges")} className="text-xs text-blue-700 font-bold hover:underline flex items-center gap-0.5">
                        <span>View active challenges</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* VIEW 4: AI CARBON COACH CHATBOT */}
            {activeTab === "coach" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="view_coach">
                
                {/* Chat Column */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-hidden" id="chat_column">
                  
                  {/* Chat header */}
                  <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">EcoMind AI Assistant</h3>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                          <span className="text-[10px] text-zinc-400 font-bold">Carbon Coach • Active</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setChatMessages([
                          {
                            sender: "bot",
                            text: "Resetted active coaching session thread. Ask me anything about environmental change!",
                            timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                          }
                        ]);
                      }}
                      className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition"
                      title="Reset chat conversation"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Chat scroll area */}
                  <div className="p-5 flex-1 overflow-y-auto space-y-4 bg-slate-50/50" id="chat_scroll_area">
                    {chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                      >
                        {msg.sender === "bot" && (
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0 text-sm font-extrabold">
                            🌱
                          </div>
                        )}
                        <div className="space-y-1">
                          <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            msg.sender === "user"
                              ? "bg-slate-900 text-white rounded-tr-none"
                              : "bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm"
                          }`}>
                            <div className="whitespace-pre-line prose max-w-none text-xs sm:text-sm">
                              {msg.text}
                            </div>
                          </div>
                          <span className="text-[9px] text-slate-400 font-bold block px-1 text-right">
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}

                    {isChatLoading && (
                      <div className="flex gap-3 mr-auto items-center animate-pulse">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-sm">
                          🌱
                        </div>
                        <div className="bg-white p-3 rounded-2xl text-xs text-slate-500 border border-slate-200">
                          Coach is compiling sustainable math parameters...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat input form */}
                  <div className="p-4 border-t border-slate-200 bg-white">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendChatMessage();
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Tell EcoMind Coach: 'I drive 10 km daily, how can I save?'"
                        className="flex-1 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isChatLoading || !chatInput.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-200 text-white cursor-pointer px-4 rounded-xl transition flex items-center justify-center shrink-0 shadow-sm"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>

                </div>

                {/* Right context Column: Tips & User Profile overview */}
                <div className="space-y-6">
                  
                  {/* Immediate prompt suggestions */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">💡 Suggested Coach Queries</h4>
                      <p className="text-xs text-slate-400">Click a preset path to execute an automated AI analysis.</p>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleSendChatMessage("How does my carbon footprint compare to standard global averages?")}
                        className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 text-xs font-semibold text-slate-700 transition"
                      >
                        📊 Compare my output to world metrics
                      </button>
                      <button
                        onClick={() => handleSendChatMessage("Give me a specialized 3-day meal adjustment to lower my meat diet's carbon output.")}
                        className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 text-xs font-semibold text-slate-700 transition"
                      >
                        🥗 Create a 3-day plant recipe adjustment
                      </button>
                      <button
                        onClick={() => handleSendChatMessage("What are some cheap household tips to restrict electricity draw without sacrificing air conditioning?")}
                        className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 text-xs font-semibold text-slate-700 transition"
                      >
                        ⚡ Cheap energy efficiency techniques
                      </button>
                    </div>
                  </div>

                  {/* Diagnostic Summary */}
                  <div className="bg-emerald-950 text-emerald-100 p-6 rounded-3xl space-y-4">
                    <h4 className="text-white font-bold text-sm">🔬 Your active climate parameters</h4>
                    <div className="text-xs space-y-2 font-medium">
                      <div className="flex justify-between border-b border-emerald-900 pb-1.5">
                        <span>Calculated score:</span>
                        <span className="text-emerald-400 font-bold">{carbonResult?.sustainabilityScore}/100</span>
                      </div>
                      <div className="flex justify-between border-b border-emerald-900 pb-1.5">
                        <span>Carbon emissions:</span>
                        <span className="text-emerald-400 font-bold">{carbonResult?.totalCarbon} kg CO2/mo</span>
                      </div>
                      <div className="flex justify-between border-b border-emerald-900 pb-1.5">
                        <span>Dietary baseline:</span>
                        <span className="text-emerald-400 font-bold capitalize">{userProfile.foodType} style</span>
                      </div>
                      <div className="flex justify-between border-b border-emerald-900 pb-1.5">
                        <span>Daily commute:</span>
                        <span className="text-emerald-400 font-bold">{userProfile.transportation.distance} km by {userProfile.transportation.type.replace('_',' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Peak domestic power:</span>
                        <span className="text-emerald-400 font-bold">{userProfile.electricity} kWh/mo</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* VIEW 5: GREEN TWIN VISUAL SIMULATOR */}
            {activeTab === "twin" && (
              <div className="space-y-6" id="view_twin">
                
                {/* Intro section */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                      🌿 Interactive Hologenesis: Your <span className="text-emerald-600">Green Twin</span>
                    </h2>
                    <p className="text-slate-500 text-xs">
                      See your direct carbon offsets and financial targets in real-time. Move the targets below to construct an eco-optimized version of yourself!
                    </p>
                  </div>
                  <div className="bg-emerald-50 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 border border-emerald-100 uppercase">
                    Status: Simulated Co-projection
                  </div>
                </div>

                {/* Main simulation grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left targets Column: Twin configuration inputs */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="text-sm font-bold text-slate-900">Fine-tune Twin Behavior</h4>
                      <p className="text-xs text-slate-400">Target modifications you are willing to practice in real life.</p>
                    </div>

                    {/* target transit swap */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">Target Commute Method</label>
                      <select
                        value={twinTransitOverride}
                        onChange={(e) => setTwinTransitOverride(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="car_petrol">Baseline Petrol (No swap)</option>
                        <option value="car_electric">Electric vehicle swap</option>
                        <option value="public_transit">Public Subway/Bus commute</option>
                        <option value="bicycle">Active cycling / Micro mobility</option>
                        <option value="walking">Active walking routine</option>
                      </select>
                    </div>

                    {/* target air conditioning hourly limit */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-700 uppercase tracking-widest">Target Daily AC Run Time</span>
                        <span className="text-emerald-600 font-bold">{twinAcHours} Hours</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="12"
                        value={twinAcHours}
                        onChange={(e) => setTwinAcHours(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                        <span>OFF (0h)</span>
                        <span>Heavy use (12h)</span>
                      </div>
                    </div>

                    {/* target planetary diet shift */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">Target Planetary Diet Scale</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["balanced", "vegetarian", "vegan"].map((dietOpt) => (
                          <button
                            key={dietOpt}
                            onClick={() => setTwinDietStyle(dietOpt)}
                            className={`py-2 px-1 border text-[10px] uppercase tracking-wider font-bold rounded-xl transition ${
                              twinDietStyle === dietOpt
                                ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold"
                                : "border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {dietOpt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs leading-relaxed space-y-1 text-slate-600">
                      <span className="font-bold text-slate-800 block">💡 Estimated environmental bonus:</span>
                      By hitting these goals, you eliminate heavy chemical refrigerant wear and pesticide agricultural waste runoff immediately.
                    </div>
                  </div>

                  {/* Right twin card visualization */}
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* CARD 1: CURRENT STANCE */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Persona</span>
                        <span className="p-1.5 px-3 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full">Primary baseline</span>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-400">Baseline Carbon emissions</span>
                          <h3 className="text-3xl font-extrabold text-slate-800">{currentCarbonTotal} kg CO2/mo</h3>
                        </div>

                        <div className="space-y-2.5 pt-2 text-xs font-medium">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                            <span>Commute: {getTransportLabel(userProfile.transportation.type)} ({userProfile.transportation.distance} km)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                            <span>Electrical utilities: {userProfile.electricity} kWh/mo</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                            <span>Diet: {userProfile.foodType} style</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <span className="text-xs text-slate-400 font-bold uppercase">Estimated Annual Utility cost</span>
                        <div className="text-lg font-bold text-slate-700">
                          ${Math.round(userProfile.electricity * 0.18 * 12 + 250)} / yr
                        </div>
                      </div>
                    </div>

                    {/* CARD 2: ECO OPTIMIZED TWIN */}
                    <div className="bg-emerald-950 text-white p-6 rounded-3xl flex flex-col justify-between space-y-6 relative overflow-hidden shadow-xl">
                      {/* Ambient background light */}
                      <span className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl" />

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Holographic Green Twin</span>
                        <span className="p-1.5 px-3 bg-emerald-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                          Active Simulator Target
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-xs text-emerald-300 font-bold block">Twin footprint emissions</span>
                          <h3 className="text-3xl font-extrabold text-emerald-400">{twinResults.targetTotal} kg CO2/mo</h3>
                        </div>

                        <div className="space-y-2.5 pt-2 text-xs font-bold text-emerald-100">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            <span>Commute target: {getTransportLabel(twinTransitOverride)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            <span>Air Conditioner targeted: {twinAcHours} hours daily</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            <span>Target diet: {twinDietStyle} approach</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-emerald-900 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-emerald-300 font-bold uppercase block">Monthly Eco-Savings</span>
                          <span className="text-sm font-bold text-white">${twinResults.savedMonthlyCost} offset</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-emerald-300 font-bold uppercase block">Annual CO2 mitigation</span>
                          <span className="text-xl font-extrabold text-emerald-400">{twinResults.savedAnnualCarbon} kg saved</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Equivalence and environmental math analysis of Twin simulation */}
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                  <div className="space-y-1">
                    <span className="text-3xl block">🌲</span>
                    <h4 className="text-xs font-bold text-slate-550 uppercase tracking-widest text-slate-500">Tree Absorption Equivalents</h4>
                    <p className="text-lg font-extrabold text-emerald-900">
                      {Math.round(twinResults.savedAnnualCarbon / 21)} mature pine trees
                    </p>
                    <p className="text-[10px] text-emerald-700">absorbing carbon dynamically for a full decade.</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-3xl block">🚗</span>
                    <h4 className="text-xs font-bold text-slate-550 uppercase tracking-widest text-slate-500">Undriven Vehicle Distance</h4>
                    <p className="text-lg font-extrabold text-emerald-900">
                      {Math.round(twinResults.savedAnnualCarbon / 0.2)} km grid miles
                    </p>
                    <p className="text-[10px] text-emerald-700">of standard gasoline driving offset completely.</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-3xl block">🔌</span>
                    <h4 className="text-xs font-bold text-slate-550 uppercase tracking-widest text-slate-500">Power Grid Conservation</h4>
                    <p className="text-lg font-extrabold text-emerald-900">
                      {Math.round(twinResults.savedAnnualCarbon / 0.45)} kWh grid power
                    </p>
                    <p className="text-[10px] text-emerald-700">safeguarded from local combustion turbine pressure.</p>
                  </div>
                </div>

              </div>
            )}

            {/* VIEW 6: WHAT-IF AI SIMULATOR */}
            {activeTab === "whatif" && (
              <div className="space-y-6" id="view_whatif">
                
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">💬 The Intelligent What-If Simulator</h2>
                    <p className="text-xs text-slate-400">
                      Formulate hypothetical changes like "What if I install home solar panels?" or "What if I commute by train instead of gasoline?"
                    </p>
                  </div>

                  {/* Predefined scenario tags for easy user clicks */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase block tracking-wider">Try standard scenarios:</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "What if I switch from a petrol car to public transit?",
                        "What if I reduce air conditioning by 3 hours daily?",
                        "What if I transition my lunches to 100% vegan recipes?",
                        "What if I buy all my garments second-hand?",
                        "What if I reduce my daily shower from 12 mins to 4 mins?"
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCustomScenario(preset);
                            handleWhatIfRun(preset);
                          }}
                          className="bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-950 border border-slate-200 hover:border-emerald-200 p-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual entry form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleWhatIfRun(customScenario);
                    }}
                    className="flex gap-2 pt-2 border-t border-slate-100"
                  >
                    <input
                      type="text"
                      className="flex-1 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 px-4 py-3 text-sm rounded-xl focus:outline-none"
                      placeholder="Write your custom option, e.g. What if I pledge to reduce food deliveries to zero?"
                      value={customScenario}
                      onChange={(e) => setCustomScenario(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={isSimulating || !customScenario.trim()}
                      className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white cursor-pointer px-6 rounded-xl transition text-xs font-bold tracking-wide"
                    >
                      {isSimulating ? "Simulating..." : "Simulate Impact"}
                    </button>
                  </form>
                </div>

                {/* SIMULATION RESPONSE GRID */}
                {simulationResult && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fadeIn" id="simulation_response_view">
                    
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center space-y-1">
                      <TrendingDown className="w-8 h-8 text-emerald-600 mx-auto" />
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Monthly carbon subtraction</span>
                      <span className="text-2xl font-extrabold text-emerald-700 block">-{simulationResult.carbonSavedMonthly} kg CO2</span>
                      <span className="text-xs text-slate-500 block font-medium">withdrawn from peak emissions</span>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center space-y-1">
                      <TrendingDown className="w-8 h-8 text-emerald-600 mx-auto" />
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Annual total saved</span>
                      <span className="text-2xl font-extrabold text-emerald-700 block">-{simulationResult.carbonSavedAnnual} kg CO2</span>
                      <span className="text-xs text-slate-500 block font-medium">long term atmospheric offset</span>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center space-y-1">
                      <DollarSign className="w-8 h-8 text-emerald-600 mx-auto" />
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Estimated Monthly Offsets</span>
                      <span className="text-2xl font-extrabold text-slate-800 block">${simulationResult.costSavedMonthly} saved</span>
                      <span className="text-xs text-slate-500 block font-medium">retained cash utility</span>
                    </div>

                    <div className="bg-emerald-950 text-emerald-350 bg-emerald-900 text-white p-5 rounded-2xl text-center space-y-1 shadow-md">
                      <Sparkles className="w-8 h-8 text-emerald-400 mx-auto" />
                      <span className="text-[10px] text-emerald-300 font-bold block uppercase tracking-wide">Sustainability Score Booster</span>
                      <span className="text-2xl font-extrabold text-emerald-400 block">+{simulationResult.scoreImprovement} Points</span>
                      <span className="text-xs text-emerald-200 block font-medium">improvement on next audit</span>
                    </div>

                    {/* text breakdown */}
                    <div className="md:col-span-4 bg-emerald-50 border border-emerald-155 border-emerald-100 p-6 rounded-2xl text-xs sm:text-sm text-emerald-950 leading-relaxed space-y-2">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5 uppercase text-xs tracking-wider">
                        <Info className="w-4 h-4 text-emerald-700" /> Scientific Impact Explanation
                      </span>
                      <p className="font-medium whitespace-pre-line">{simulationResult.explanation}</p>
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* VIEW 7: WEEKLY ECO CHALLENGES / QUESTS */}
            {activeTab === "challenges" && (() => {
              const localChallengesText = {
                hi: {
                  heading: "🏆 सक्रिय साप्ताहिक इको खोज",
                  sub: "अंक पुरस्कारों को सक्रिय करने और उच्च स्तरों को अनलॉक करने के लिए पूरे सप्ताह में इन छोटे कार्यों को पूरा करने का संकल्प लें!",
                  week: "प्रारंभ सप्ताह: 9 जून, 2026",
                  finished: "पूर्ण हुआ",
                  logSuccess: "सफलता दर्ज करें",
                  aiGenTitle: "🔒 गतिशील एआई पर्यावरण चुनौती",
                  aiGenSub: "EcoMind का प्रेडिक्टिव इंजन अगले सप्ताह के लिए विशेष चुनौतियों को अनलॉक करने के लिए आपके द्वारा पूर्ण किए गए कार्यों को ट्रैक कर रहा है।",
                  updating: "5 दिनों में अपडेट होगा",
                  pts: "अंक",
                  easy: "सरल",
                  medium: "मध्यम",
                  hard: "कठिन",
                },
                es: {
                  heading: "🏆 Desafíos Ecológicos Semanales",
                  sub: "¡Comprométase a completar estas pequeñas tareas durante la semana para activar recompensas de puntos y desbloquear niveles altos!",
                  week: "Iniciando: 9 de junio, 2026",
                  finished: "Completado",
                  logSuccess: "Registrar Éxito",
                  aiGenTitle: "🔒 Generación Dinámica de Desafíos de IA",
                  aiGenSub: "El motor predictivo de EcoMind realiza un seguimiento de sus acciones completadas para desbloquear desafíos especializados para la próxima semana.",
                  updating: "Actualizando en 5 Días",
                  pts: "pts",
                  easy: "Fácil",
                  medium: "Medio",
                  hard: "Difícil",
                },
                fr: {
                  heading: "🏆 Quêtes Éco Hebdomadaires",
                  sub: "Engagez-vous à accomplir ces petites tâches durant la semaine pour déclencher des récompenses et débloquer des niveaux élevés !",
                  week: "Semaine du : 9 juin 2026",
                  finished: "Terminé",
                  logSuccess: "Enregistrer Réussite",
                  aiGenTitle: "🔒 Génération Dynamique de Défis IA",
                  aiGenSub: "Le moteur prédictif d'EcoMind suit vos actions terminées pour déverrouiller des défis spécialisés pour la semaine prochaine.",
                  updating: "Mise à jour dans 5 Jours",
                  pts: "pts",
                  easy: "Facile",
                  medium: "Moyen",
                  hard: "Difficile",
                },
                de: {
                  heading: "🏆 Aktive wöchentliche Öko-Quests",
                  sub: "Verpflichten Sie sich, diese kleinen Aufgaben im Laufe der Woche zu erledigen, um Punkte freizuschalten und höhere Stufen zu erreichen!",
                  week: "Woche ab: 9. Juni 2026",
                  finished: "Abgeschlossen",
                  logSuccess: "Erfolg buchen",
                  aiGenTitle: "🔒 Dynamische KI-Missionsgenerierung",
                  aiGenSub: "Die vorausschauende Engine von EcoMind verfolgt Ihre abgeschlossenen Aktionen, um maßgeschneiderte Missionen für die nächste Woche freizuschalten.",
                  updating: "Aktualisierung in 5 Tagen",
                  pts: "Punkte",
                  easy: "Einfach",
                  medium: "Mittel",
                  hard: "Schwer",
                },
                en: {
                  heading: "🏆 Active Weekly Eco Quests",
                  sub: "Pledge to finalize these small tasks during the week to trigger point rewards and unlock high tiers!",
                  week: "Week Commencing: June 9, 2026",
                  finished: "Finished",
                  logSuccess: "Log Success",
                  aiGenTitle: "🔒 Dynamic AI Challenge Generation",
                  aiGenSub: "EcoMind's predictive engine is tracking your completed actions to unlock specialized challenges for next week.",
                  updating: "Updating in 5 Days",
                  pts: "pts",
                  easy: "Easy",
                  medium: "Medium",
                  hard: "Hard",
                }
              }[language as "en" | "es" | "fr" | "de" | "hi"] || {
                heading: "🏆 Active Weekly Eco Quests",
                sub: "Pledge to finalize these small tasks during the week to trigger point rewards and unlock high tiers!",
                week: "Week Commencing: June 9, 2026",
                finished: "Finished",
                logSuccess: "Log Success",
                aiGenTitle: "🔒 Dynamic AI Challenge Generation",
                aiGenSub: "EcoMind's predictive engine is tracking your completed actions to unlock specialized challenges for next week.",
                updating: "Updating in 5 Days",
                pts: "pts",
                easy: "Easy",
                medium: "Medium",
                hard: "Hard",
              };

              return (
                <div className="space-y-6" id="view_challenges">
                  
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between flex-col sm:flex-row gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900">{localChallengesText.heading}</h2>
                      <p className="text-xs text-slate-400">{localChallengesText.sub}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700">
                      {localChallengesText.week}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="active_challenges_list">
                    {challenges.map((item) => {
                      const isCompleted = completedChallengeIds.includes(item.id);
                      const difficultyLabel = item.difficulty === "Easy" ? localChallengesText.easy :
                                              item.difficulty === "Medium" ? localChallengesText.medium :
                                              localChallengesText.hard;
                      return (
                        <div
                          key={item.id}
                          className={`bg-white rounded-3xl border p-6 flex flex-col justify-between space-y-5 transition shadow-sm ${
                            isCompleted ? "border-emerald-500 bg-emerald-50/10" : "border-slate-200"
                          }`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex justify-between items-center">
                              <span className="uppercase text-[9px] font-bold tracking-widest text-slate-400">
                                {item.category}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.difficulty === "Easy" ? "bg-green-50 text-green-700" :
                                item.difficulty === "Medium" ? "bg-amber-50 text-amber-700" :
                                "bg-red-50 text-red-700"
                              }`}>
                                {difficultyLabel}
                              </span>
                            </div>

                            <h3 className="text-md font-bold text-slate-950">{item.title}</h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-semibold">{item.description}</p>
                          </div>

                          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Flame className="w-4 h-4 text-orange-500" />
                              <span className="text-xs font-bold text-slate-800">+{item.points} {localChallengesText.pts}</span>
                            </div>

                            {isCompleted ? (
                              <span className="text-xs text-emerald-700 font-bold bg-emerald-100/60 border border-emerald-100 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4 text-emerald-600" /> {localChallengesText.finished}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleCompleteChallenge(item.id, item.points, item.badgeId)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm select-none"
                              >
                                {localChallengesText.logSuccess}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Locked / Upcoming Challenge alerts */}
                  <div className="bg-slate-800 text-slate-300 p-6 rounded-3xl flex items-center justify-between flex-col md:flex-row gap-4">
                    <div className="space-y-1">
                      <h4 className="text-white font-bold text-sm">{localChallengesText.aiGenTitle}</h4>
                      <p className="text-xs text-slate-400">{localChallengesText.aiGenSub}</p>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest bg-slate-700 px-3.5 py-1.5 rounded-lg text-emerald-400">
                      {localChallengesText.updating}
                    </span>
                  </div>

                </div>
              );
            })()}

            {/* VIEW 8: LEADERBOARDS & COHORT NETWORKS */}
            {activeTab === "leaderboard" && (() => {
              const localLeaderboardText = {
                hi: {
                  heading: "सामुदायिक सस्टेनेबिलिटी लीडरबोर्ड",
                  sub: "अपने कॉलेज और दोस्तों को पर्यावरण लक्ष्यों को प्राप्त करते हुए देखें।",
                  tabIndividual: "व्यक्तिगत",
                  tabColleges: "कॉलेज समुदाय",
                  tabTeams: "टीमें",
                  rank: "रैंक",
                  user: "उपयोगकर्ता",
                  ecoScore: "सस्टेनेबिलिटी स्कोर",
                  questsPoints: "कार्य अंक",
                  tierStatus: "लेवल स्तर",
                  collegeAlliance: "कॉलेज समुदाय",
                  activeMembers: "सक्रिय सदस्य",
                  cumulativePoints: "कुल संचयी अंक",
                  avgScore: "औसत स्कोर",
                  teamDesignation: "टीम का नाम",
                  focusCore: "मुख्य क्षेत्र",
                  pointsCol: "अंक",
                  you: " (आप)",
                  climbers: " पहलकर्ता",
                  members: " सदस्य",
                  pts: " अंक",
                  avgScoreVal: "/100",
                  cohortHeading: "आपका सक्रिय दस्ता",
                  collegeAllianceLabel: "आपका कॉलेज समूह:",
                  selectedTeamLabel: "आपकी चयनित टीम:",
                  localRankLabel: "वर्तमान स्थानीय रैंक:",
                  localRankValue: "#1 व्यक्तिगत कॉलेज दस्ता",
                  btnEngage: "सक्रिय चुनौतियों में भाग लें",
                  scoringHeading: "स्कोरिंग की प्रक्रिया",
                  scoringInfo: "आपका सस्टेनेबिलिटी स्कोर आपकी सापेक्षिक रैंक तय करता है, जबकि पूर्ण किए गए कार्यों के अंक संचयी संस्थागत रैंक को बढ़ाते हैं। अपने साथियों के साथ मिलकर काम करें!"
                },
                es: {
                  heading: "Tablas de Sostenibilidad Comunitaria",
                  sub: "Observa a tus rivales del campus reducir sus marcas de huella de carbono.",
                  tabIndividual: "Individual",
                  tabColleges: "Colegios",
                  tabTeams: "Equipos",
                  rank: "Rango",
                  user: "Usuario",
                  ecoScore: "Puntaje Eco",
                  questsPoints: "Puntos de Búsqueda",
                  tierStatus: "Estado del Nivel",
                  collegeAlliance: "Alianza Colegial",
                  activeMembers: "Miembros Activos",
                  cumulativePoints: "Puntos Acumulados",
                  avgScore: "Puntaje Promedio",
                  teamDesignation: "Nombre del Equipo",
                  focusCore: "Enfoque Principal",
                  pointsCol: "Puntos",
                  you: " (Tú)",
                  climbers: " participantes",
                  members: " miembros",
                  pts: " pts",
                  avgScoreVal: "/100",
                  cohortHeading: "Tu cohorte activa",
                  collegeAllianceLabel: "Tu alianza universitaria:",
                  selectedTeamLabel: "Tu equipo seleccionado:",
                  localRankLabel: "Rango local actual:",
                  localRankValue: "#1 Individual en la cohorte universitaria local",
                  btnEngage: "Participar en desafíos activos",
                  scoringHeading: "Cómo funciona la puntuación",
                  scoringInfo: "Tu Puntaje Eco se traduce en tu rango relativo, mientras que los puntos ganados aumentan las posiciones institucionales. ¡Combina fuerzas con tus compañeros!"
                },
                fr: {
                  heading: "Classements Carbone Communautaires",
                  sub: "Suivez les universités et les camarades qui s'illustrent par leur démarche éco-responsable.",
                  tabIndividual: "Individuel",
                  tabColleges: "Universités",
                  tabTeams: "Équipes",
                  rank: "Rang",
                  user: "Utilisateur",
                  ecoScore: "Score Éco",
                  questsPoints: "Points d'Éco-Quêtes",
                  tierStatus: "Statut de Niveau",
                  collegeAlliance: "Alliance Universitaire",
                  activeMembers: "Membres Actifs",
                  cumulativePoints: "Points Cumulés",
                  avgScore: "Score Moyen",
                  teamDesignation: "Nom de l'Équipe",
                  focusCore: "Axe Principal",
                  pointsCol: "Points",
                  you: " (Vous)",
                  climbers: " acteurs",
                  members: " membres",
                  pts: " pts",
                  avgScoreVal: "/100",
                  cohortHeading: "Votre cohorte active",
                  collegeAllianceLabel: "Votre alliance universitaire :",
                  selectedTeamLabel: "Vos équipes sélectionnées :",
                  localRankLabel: "Rang local actuel :",
                  localRankValue: "#1 Individuel dans la cohorte universitaire",
                  btnEngage: "Rejoindre les défis actifs",
                  scoringHeading: "Règles du système de points",
                  scoringInfo: "Votre Score Éco détermine votre rang. Les points validés lors d'actions écologiques augmentent le score cumulatif de votre école !"
                },
                de: {
                  heading: "Community-Bestenlisten",
                  sub: "Verfolgen Sie, wie andere Hochschulen und Teams ihren Fußabdruck senken.",
                  tabIndividual: "Einzeln",
                  tabColleges: "Hochschulen",
                  tabTeams: "Teams",
                  rank: "Rang",
                  user: "Benutzer",
                  ecoScore: "Öko-Score",
                  questsPoints: "Quest-Punkte",
                  tierStatus: "Stufenstatus",
                  collegeAlliance: "Hochschul-Bündnis",
                  activeMembers: "Aktive Mitglieder",
                  cumulativePoints: "Gesamtpunkte",
                  avgScore: "Ø-Score",
                  teamDesignation: "Team-Bezeichnung",
                  focusCore: "Hauptfokus",
                  pointsCol: "Punkte",
                  you: " (Du)",
                  climbers: " Aktivisten",
                  members: " Mitglieder",
                  pts: " Pkt.",
                  avgScoreVal: "/100",
                  cohortHeading: "Ihre Kohorte",
                  collegeAllianceLabel: "Ihr Hochschulbündnis:",
                  selectedTeamLabel: "Gewähltes Team:",
                  localRankLabel: "Aktueller lokaler Rang:",
                  localRankValue: "#1 Einzelteilnehmer in der lokalen Hochschulkohorte",
                  btnEngage: "An aktiven Quests teilnehmen",
                  scoringHeading: "Wie die Wertung funktioniert",
                  scoringInfo: "Ihr Öko-Score bestimmt Ihren relativen Rang, während Punkte aus abgeschlossenen Quests die Position Ihrer Institution stärken."
                },
                en: {
                  heading: "Community Carbon Leaderboards",
                  sub: "Watch friendly campus rivals reduce footprint milestones.",
                  tabIndividual: "Individual",
                  tabColleges: "Colleges",
                  tabTeams: "Teams",
                  rank: "Rank",
                  user: "User",
                  ecoScore: "Eco Score",
                  questsPoints: "Quests Points",
                  tierStatus: "Tier Status",
                  collegeAlliance: "College Alliance",
                  activeMembers: "Active Members",
                  cumulativePoints: "Cumulative Points",
                  avgScore: "Avg Score",
                  teamDesignation: "Team Designation",
                  focusCore: "Focus Core",
                  pointsCol: "Points",
                  you: " (You)",
                  climbers: " climbers",
                  members: " members",
                  pts: " pts",
                  avgScoreVal: "/100",
                  cohortHeading: "Your active cohort",
                  collegeAllianceLabel: "Your college alliance:",
                  selectedTeamLabel: "Your selected team:",
                  localRankLabel: "Current local rank:",
                  localRankValue: "#1 Individual in Local College cohort",
                  btnEngage: "Engage in active challenges",
                  scoringHeading: "How scoring operates",
                  scoringInfo: "Your Eco Score translates into your relative rank, while points completed during success logs increase cumulative institutional positions. Combine forces with roommates!"
                }
              }[language as "en" | "es" | "fr" | "de" | "hi"] || {
                heading: "Community Carbon Leaderboards",
                sub: "Watch friendly campus rivals reduce footprint milestones.",
                tabIndividual: "Individual",
                tabColleges: "Colleges",
                tabTeams: "Teams",
                rank: "Rank",
                user: "User",
                ecoScore: "Eco Score",
                questsPoints: "Quests Points",
                tierStatus: "Tier Status",
                collegeAlliance: "College Alliance",
                activeMembers: "Active Members",
                cumulativePoints: "Cumulative Points",
                avgScore: "Avg Score",
                teamDesignation: "Team Designation",
                focusCore: "Focus Core",
                pointsCol: "Points",
                you: " (You)",
                climbers: " climbers",
                members: " members",
                pts: " pts",
                avgScoreVal: "/100",
                cohortHeading: "Your active cohort",
                collegeAllianceLabel: "Your college alliance:",
                selectedTeamLabel: "Your selected team:",
                localRankLabel: "Current local rank:",
                localRankValue: "#1 Individual in Local College cohort",
                btnEngage: "Engage in active challenges",
                scoringHeading: "How scoring operates",
                scoringInfo: "Your Eco Score translates into your relative rank, while points completed during success logs increase cumulative institutional positions. Combine forces with roommates!"
              };

              const translateLevel = (lvl: string) => {
                if (language === "hi") {
                  return lvl === "Planet Guardian" ? "धरती रक्षक" :
                         lvl === "Carbon Warrior" ? "कार्बन योद्धा" :
                         lvl === "Eco Explorer" ? "इको एक्सप्लोरर" : "हरित नौसिखिया";
                }
                if (language === "es") {
                  return lvl === "Planet Guardian" ? "Guardián Planetario" :
                         lvl === "Carbon Warrior" ? "Guerrero Carbono" :
                         lvl === "Eco Explorer" ? "Eco Explorador" : "Eco Principiante";
                }
                if (language === "fr") {
                  return lvl === "Planet Guardian" ? "Gardien Planétaire" :
                         lvl === "Carbon Warrior" ? "Guerrier Carbone" :
                         lvl === "Eco Explorer" ? "Éco Explorateur" : "Débutant Vert";
                }
                if (language === "de") {
                  return lvl === "Planet Guardian" ? "Hüter der Erde" :
                         lvl === "Carbon Warrior" ? "CO2-Kämpfer" :
                         lvl === "Eco Explorer" ? "Öko-Entdecker" : "Grüner Einsteiger";
                }
                return lvl;
              };

              return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="view_leaderboard">
                  
                  {/* Main leaderboard tables */}
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden" id="leaderboard_tables">
                    
                    {/* Tab switches */}
                    <div className="bg-slate-900 p-5 text-white flex items-center justify-between flex-col sm:flex-row gap-4">
                      <div>
                        <h3 className="text-md font-bold">{localLeaderboardText.heading}</h3>
                        <p className="text-xs text-zinc-400">{localLeaderboardText.sub}</p>
                      </div>

                      <div className="flex bg-slate-800 p-1 rounded-xl">
                        <button
                          onClick={() => setActiveLeaderboardTab("individual")}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                            activeLeaderboardTab === "individual" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {localLeaderboardText.tabIndividual}
                        </button>
                        <button
                          onClick={() => setActiveLeaderboardTab("college")}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                            activeLeaderboardTab === "college" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {localLeaderboardText.tabColleges}
                        </button>
                        <button
                          onClick={() => setActiveLeaderboardTab("team")}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                            activeLeaderboardTab === "team" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {localLeaderboardText.tabTeams}
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      {/* INDIVIDUAL LEVEL */}
                      {activeLeaderboardTab === "individual" && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead>
                              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <th className="py-3 px-4">{localLeaderboardText.rank}</th>
                                <th className="py-3 px-4">{localLeaderboardText.user}</th>
                                <th className="py-3 px-4">{localLeaderboardText.ecoScore}</th>
                                <th className="py-3 px-4">{localLeaderboardText.questsPoints}</th>
                                <th className="py-3 px-4">{localLeaderboardText.tierStatus}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {INITIAL_INDIVIDUAL_LEADERBOARD.map((item, idx) => {
                                // dynamically override Priya's scores and points from active state
                                const points = item.isUser ? userPoints : item.points;
                                const score = item.isUser && carbonResult ? carbonResult.sustainabilityScore : item.score;
                                const level = item.isUser && carbonResult ? carbonResult.level : item.level;
                                
                                return (
                                  <tr
                                    key={idx}
                                    className={`border-b border-slate-100 hover:bg-slate-50 transition ${
                                      item.isUser ? "bg-emerald-50/40 font-bold" : ""
                                    }`}
                                  >
                                    <td className="py-3.5 px-4 font-extrabold text-slate-500">#{item.rank}</td>
                                    <td className="py-3.5 px-4 flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-extrabold">
                                        {item.name.charAt(0)}
                                      </div>
                                      <div>
                                        <span>{item.name} {item.isUser ? localLeaderboardText.you : ""}</span>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4 font-bold text-emerald-700">{score}/100</td>
                                    <td className="py-3.5 px-4 font-semibold text-slate-800">{points} {localLeaderboardText.pts}</td>
                                    <td className="py-3.5 px-4">
                                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border">
                                        {translateLevel(level)}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* COLLEGES */}
                      {activeLeaderboardTab === "college" && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead>
                              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 text-slate-500 uppercase">
                                <th className="py-3 px-4">{localLeaderboardText.rank}</th>
                                <th className="py-3 px-4">{localLeaderboardText.collegeAlliance}</th>
                                <th className="py-3 px-4">{localLeaderboardText.activeMembers}</th>
                                <th className="py-3 px-4">{localLeaderboardText.cumulativePoints}</th>
                                <th className="py-3 px-4">{localLeaderboardText.avgScore}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {INITIAL_COLLEGE_LEADERBOARD.map((item, idx) => (
                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                  <td className="py-3.5 px-4 font-extrabold text-slate-500">#{item.rank}</td>
                                  <td className="py-3.5 px-4 flex items-center gap-2 font-bold text-slate-900">
                                    <School className="w-4 h-4 text-emerald-600" />
                                    <span>{item.name}</span>
                                  </td>
                                  <td className="py-3.5 px-4 font-semibold text-slate-600">{item.activeMembers}{localLeaderboardText.climbers}</td>
                                  <td className="py-3.5 px-4 font-semibold text-slate-800">{item.points} {localLeaderboardText.pts}</td>
                                  <td className="py-3.5 px-4 font-bold text-emerald-700">{item.avgScore}{localLeaderboardText.avgScoreVal}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* TEAMS */}
                      {activeLeaderboardTab === "team" && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead>
                              <tr className="border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                                <th className="py-3 px-4">{localLeaderboardText.rank}</th>
                                <th className="py-3 px-4">{localLeaderboardText.teamDesignation}</th>
                                <th className="py-3 px-4">{localLeaderboardText.activeMembers}</th>
                                <th className="py-3 px-4">{localLeaderboardText.focusCore}</th>
                                <th className="py-3 px-4">{localLeaderboardText.pointsCol}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {INITIAL_TEAM_LEADERBOARD.map((item, idx) => (
                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                  <td className="py-3.5 px-4 font-extrabold text-slate-500">#{item.rank}</td>
                                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                                  <td className="py-3.5 px-4 font-semibold text-slate-600">{item.members}{localLeaderboardText.members}</td>
                                  <td className="py-3.5 px-4">
                                    <span className="text-xs bg-slate-100 text-slate-700 p-1 px-2.5 rounded-full border">
                                      {item.category}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 font-bold text-emerald-700">{item.points} {localLeaderboardText.pts}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Community encouragement sidebar */}
                  <div className="space-y-6" id="leaderboard_sidebar">
                    
                    {/* Your alliance card */}
                    <div className="bg-emerald-950 text-white p-6 rounded-3xl space-y-4">
                      <h3 className="font-extrabold text-white text-md">{localLeaderboardText.cohortHeading}</h3>
                      
                      <div className="space-y-3 font-medium text-xs text-emerald-100">
                        <div>
                          <span className="text-emerald-400 text-[10px] block font-bold uppercase tracking-wider">{localLeaderboardText.collegeAllianceLabel}</span>
                          <span className="text-sm font-bold text-white">{userProfile.college}</span>
                        </div>
                        <div>
                          <span className="text-emerald-400 text-[10px] block font-bold uppercase tracking-wider">{localLeaderboardText.selectedTeamLabel}</span>
                          <span className="text-sm font-bold text-white">{userProfile.teamName}</span>
                        </div>
                        <div className="pt-2 border-t border-emerald-900">
                          <span className="text-emerald-400 text-[10px] block font-bold uppercase tracking-wider">{localLeaderboardText.localRankLabel}</span>
                          <span className="text-sm font-bold text-white">{localLeaderboardText.localRankValue}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab("challenges")}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-xl transition mt-2 flex items-center justify-center gap-1"
                      >
                        <span>{localLeaderboardText.btnEngage}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Healthy competition tips */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                      <span className="text-xl block">🌱</span>
                      <h4 className="text-sm font-bold text-slate-900">{localLeaderboardText.scoringHeading}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        {localLeaderboardText.scoringInfo}
                      </p>
                    </div>

                  </div>

                </div>
              );
            })()}

            {/* VIEW 9: REWARDS & ACHIEVEMENTS SHOWCASE */}
            {activeTab === "achievements" && (() => {
              const localAchievementsText = {
                hi: {
                  heading: "उपलब्धियाँ एवं बैज",
                  sub: "अपने अर्जित बैज, प्रमाण पत्र और पर्यावरण के क्षेत्र में दिए गए योगदान को ट्रैक करें।",
                  totalQuestPoints: "कुल क्वेस्ट अंक",
                  unlockedBadges: "खुले हुए बैज",
                  unlockedLabel: "✓ अनलॉक",
                  requirementLabel: "आवश्यकता: ",
                  credentialTitle: "अर्जित प्रमाण पत्र",
                  certificationHeading: "जलवायु कार्रवाई प्रमाणन",
                  certificationInfo: `${userProfile.name}, आपके समर्पित हरित यातायात आंदोलन और बिजली की बचत ने आपको 'इको एक्सप्लोरर सर्टिफिकेट ऑफ सस्टेनेबिलिटी' के योग्य बनाया है। इसे अपने कॉलेज विभाग के साथ साझा करें!`,
                  downloadBtn: "प्रमाण पत्र डाउनलोड करें",
                  successDownload: "प्रमाण पत्र सफलतापूर्वक डाउनलोड किया गया!",
                  badges: {
                    badge_commuter: {
                      title: "हरित यात्री (Green Commuter)",
                      description: "पारंपरिक ईंधन वाहनों को छोड़कर साइकिल या सार्वजनिक परिवहन चुनकर कार्बन उत्सर्जन कम किया।",
                      requirement: "एक परिवहन चुनौती पूरी करें"
                    },
                    badge_saver: {
                      title: "ऊर्जा बचतकर्ता (Energy Saver)",
                      description: "बिजली और एसी के इस्तेमाल को सीमित कर ऊर्जा का संरक्षण किया।",
                      requirement: "एक ऊर्जा चुनौती पूरी करें"
                    },
                    badge_water: {
                      title: "जल रक्षक (Water Guardian)",
                      description: "कम पानी इस्तेमाल किया और जल संरक्षण तकनीकों को अपनाया।",
                      requirement: "एक जल चुनौती पूरी करें"
                    },
                    badge_guardian: {
                      title: "धरती रक्षक (Planet Guardian)",
                      description: "शून्य-प्लास्टिक जीवन शैली अपनाकर पर्यावरण को सुरक्षित करने में योगदान दिया।",
                      requirement: "एक कठिन चुनौती पूरी करें"
                    },
                    badge_champion: {
                      title: "सस्टेनेबिलिटी चैंपियन",
                      description: "स्वस्थ और टिकाऊ भोजन की आदतें अपनाईं और सस्टेनेबिलिटी स्कोर 80 से ऊपर बढ़ाया।",
                      requirement: "सस्टेनेबिलिटी स्कोर 80+ तक पहुंचाएं"
                    }
                  }
                },
                es: {
                  heading: "Repositorio de Logros",
                  sub: "Realiza un seguimiento de tus insignias ganadas, credenciales y elogios ambientales.",
                  totalQuestPoints: "Puntos de Búsqueda Totales",
                  unlockedBadges: "Insignias Desbloqueadas",
                  unlockedLabel: "✓ Desbloqueado",
                  requirementLabel: "Requisito: ",
                  credentialTitle: "Credencial Obtenida",
                  certificationHeading: "Certificación de Acción Climática",
                  certificationInfo: `${userProfile.name}, tus acciones de transporte ecológico y reducciones de electricidad te califican para el **Certificado de Sostenibilidad Eco Explorer**. ¡Compártelo con tu departamento universitario!`,
                  downloadBtn: "Descargar Certificado Virtual",
                  successDownload: "¡Se descargó la credencial de certificación de sostenibilidad de EcoMind en tu sistema!",
                  badges: {
                    badge_commuter: {
                      title: "Viajero Verde",
                      description: "Redujo la huella de combustible eligiendo transporte ecológico o ciclismo activo.",
                      requirement: "Completa un desafío de Transporte"
                    },
                    badge_saver: {
                      title: "Ahorrador de Energía",
                      description: "Redujo la carga eléctrica doméstica máxima o las horas de aire acondicionado.",
                      requirement: "Completa un desafío de Energía"
                    },
                    badge_water: {
                      title: "Guardián del Agua",
                      description: "Limitó con éxito los tiempos de ducha y participó en la conservación del agua.",
                      requirement: "Completa un desafío de Agua"
                    },
                    badge_guardian: {
                      title: "Guardián de la Tierra",
                      description: "Demostró una vida ejemplar sin plástico y un alto puntaje de sostenibilidad.",
                      requirement: "Completa un desafío difícil"
                    },
                    badge_champion: {
                      title: "Campeón de Sostenibilidad",
                      description: "Se comprometió con hábitos alimenticios saludables para el planeta y puntaje de 80+.",
                      requirement: "Alcanza un Puntaje de Sostenibilidad de 80+"
                    }
                  }
                },
                fr: {
                  heading: "Galerie des Trophées",
                  sub: "Suivez vos badges obtenus, vos certifications et vos accomplissements écologiques.",
                  totalQuestPoints: "Total des Points de Quêtes",
                  unlockedBadges: "Badges Débloqués",
                  unlockedLabel: "✓ Débloqué",
                  requirementLabel: "Condition : ",
                  credentialTitle: "Certification Obtenue",
                  certificationHeading: "Certificat d'Action pour le Climat",
                  certificationInfo: `${userProfile.name}, vos trajets d'éco-mobilité et vos économies d'énergie vous rendent éliminable au **Certificat d'Éco-Explorateur de Sostenibilité**. Partagez-le avec vos amis !`,
                  downloadBtn: "Télécharger le Certificat",
                  successDownload: "Certificat de Soutenabilité EcoMind téléchargé avec succès sur votre système !",
                  badges: {
                    badge_commuter: {
                      title: "Éco-Commuter",
                      description: "Réduction de l'empreinte de transport en choisissant des trajets bas-carbone ou le vélo.",
                      requirement: "Compléter un défi de Transport"
                    },
                    badge_saver: {
                      title: "Éco-Énergéticien",
                      description: "Réduction de la climatisation domestique et de la charge d'électricité en heures de pointe.",
                      requirement: "Compléter un défi d'Énergie"
                    },
                    badge_water: {
                      title: "Gardien de l'Eau",
                      description: "Limitation exemplaire de la consommation d'eau et douches optimisées.",
                      requirement: "Compléter un défi d'Eau"
                    },
                    badge_guardian: {
                      title: "Gardien Planétaire",
                      description: "Adoption d'un mode de vie sans plastique de référence et score de durabilité élevé.",
                      requirement: "Compléter un défi Difficile"
                    },
                    badge_champion: {
                      title: "Champion Éco-Responsable",
                      description: "Engagement vers une alimentation saine et score de durabilité supérieur à 80.",
                      requirement: "Atteindre un score de durabilité d'au moins 80"
                    }
                  }
                },
                de: {
                  heading: "Erfolge & Auszeichnungen",
                  sub: "Verfolgen Sie Ihre freigeschalteten Abzeichen, Zertifikate und Auszeichnungen.",
                  totalQuestPoints: "Gesamte Quest-Punkte",
                  unlockedBadges: "Freigeschaltete Abzeichen",
                  unlockedLabel: "✓ Freigeschaltet",
                  requirementLabel: "Voraussetzung: ",
                  credentialTitle: "Erhaltene Auszeichnung",
                  certificationHeading: "Zertifikat für Klimaschutz",
                  certificationInfo: `${userProfile.name}, Ihre Beiträge im Nahverkehr und Ihre Energieeinsparungen qualifizieren Sie für das **Eco Explorer Nachhaltigkeitszertifikat**.`,
                  downloadBtn: "Zertifikat herunterladen",
                  successDownload: "Nachhaltigkeitszertifikat erfolgreich heruntergeladen!",
                  badges: {
                    badge_commuter: {
                      title: "Grüner Pendler",
                      description: "Reduzierte Treibstoffemissionen durch die Wahl umweltfreundlicher Verkehrsmittel.",
                      requirement: "Schließen Sie eine Transport-Quest ab"
                    },
                    badge_saver: {
                      title: "Energiesparer",
                      description: "Reduzierte Stromlasten und Klimaanlagennutzung.",
                      requirement: "Schließen Sie eine Energie-Quest ab"
                    },
                    badge_water: {
                      title: "Wasserschützer",
                      description: "Erfolgreich Duschzeiten begrenzt und Brauchwasser gespart.",
                      requirement: "Schließen Sie eine Wasser-Quest ab"
                    },
                    badge_guardian: {
                      title: "Hüter der Erde",
                      description: "Vorbildliches plastikfreies Leben und hoher Nachhaltigkeitsscore.",
                      requirement: "Schließen Sie eine schwierige Quest ab"
                    },
                    badge_champion: {
                      title: "Nachhaltigkeits-Champion",
                      description: "Verpflichtung zu gesunder Ernährung und Score von über 80.",
                      requirement: "Nachhaltigkeitsscore von 80+ erreichen"
                    }
                  }
                },
                en: {
                  heading: "Achievements Repository",
                  sub: "Track earned badges, credentials, and environmental accolades.",
                  totalQuestPoints: "Total Quests Points",
                  unlockedBadges: "Unlocked Badges",
                  unlockedLabel: "✓ Unlocked",
                  requirementLabel: "Requirement: ",
                  credentialTitle: "Earned Credential",
                  certificationHeading: "Climate Action Certification",
                  certificationInfo: `${userProfile.name}, your dedicated green commuters action and electricity reductions qualify you for the **Eco Explorer Certificate of Sustainability**. Share with your college department to promote regional awareness!`,
                  downloadBtn: "Download Virtual Certification",
                  successDownload: "Downloaded EcoMind Sustainability Certification credential to your system!",
                  badges: {
                    badge_commuter: {
                      title: "Green Commuter",
                      description: "Slashed petrol footprint by choosing eco-transit or active cycling.",
                      requirement: "Complete a Transportation challenge"
                    },
                    badge_saver: {
                      title: "Energy Saver",
                      description: "Reduced peak domestic electrical load or air conditioning hours.",
                      requirement: "Complete an Energy challenge"
                    },
                    badge_water: {
                      title: "Water Guardian",
                      description: "Successfully limited shower times and engaged in greywater conservation.",
                      requirement: "Complete a Water challenge"
                    },
                    badge_guardian: {
                      title: "Planet Guardian",
                      description: "Demonstrated exemplary zero-plastic living and a high sustainability score.",
                      requirement: "Complete a Hard challenge"
                    },
                    badge_champion: {
                      title: "Sustainability Champion",
                      description: "Pledged food habit updates and integrated planetary healthy choices.",
                      requirement: "Reach a Sustainability Score of 80+"
                    }
                  }
                }
              }[language as "en" | "es" | "fr" | "de" | "hi"] || {
                heading: "Achievements Repository",
                sub: "Track earned badges, credentials, and environmental accolades.",
                totalQuestPoints: "Total Quests Points",
                unlockedBadges: "Unlocked Badges",
                unlockedLabel: "✓ Unlocked",
                requirementLabel: "Requirement: ",
                credentialTitle: "Earned Credential",
                certificationHeading: "Climate Action Certification",
                certificationInfo: `${userProfile.name}, your dedicated green commuters action and electricity reductions qualify you for the **Eco Explorer Certificate of Sustainability**. Share with your college department to promote regional awareness!`,
                downloadBtn: "Download Virtual Certification",
                successDownload: "Downloaded EcoMind Sustainability Certification credential to your system!",
                badges: {
                  badge_commuter: {
                    title: "Green Commuter",
                    description: "Slashed petrol footprint by choosing eco-transit or active cycling.",
                    requirement: "Complete a Transportation challenge"
                  },
                  badge_saver: {
                    title: "Energy Saver",
                    description: "Reduced peak domestic electrical load or air conditioning hours.",
                    requirement: "Complete an Energy challenge"
                  },
                  badge_water: {
                    title: "Water Guardian",
                    description: "Successfully limited shower times and engaged in greywater conservation.",
                    requirement: "Complete a Water challenge"
                  },
                  badge_guardian: {
                    title: "Planet Guardian",
                    description: "Demonstrated exemplary zero-plastic living and a high sustainability score.",
                    requirement: "Complete a Hard challenge"
                  },
                  badge_champion: {
                    title: "Sustainability Champion",
                    description: "Pledged food habit updates and integrated planetary healthy choices.",
                    requirement: "Reach a Sustainability Score of 80+"
                  }
                }
              };

              return (
                <div className="space-y-6" id="view_achievements">
                  
                  {/* Point total metrics card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6" id="points_overview_badge">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700 text-2xl shadow-sm">
                        🏆
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{localAchievementsText.heading}</h2>
                        <p className="text-slate-400 text-xs font-semibold">{localAchievementsText.sub}</p>
                      </div>
                    </div>

                    <div className="flex bg-slate-50 p-3 rounded-2xl items-center gap-6 border border-slate-103 font-bold text-center">
                      <div>
                        <span className="text-2xl text-slate-800 block">{userPoints}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block">{localAchievementsText.totalQuestPoints}</span>
                      </div>
                      <div className="w-px h-8 bg-slate-200" />
                      <div>
                        <span className="text-2xl text-emerald-700 block">{unlockedBadgeIds.length} / {ALL_BADGES.length}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block">{localAchievementsText.unlockedBadges}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badge layout gallery */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="badges_gallery_container">
                    {ALL_BADGES.map((badge) => {
                      const isUnlocked = unlockedBadgeIds.includes(badge.id);
                      const tBadge = (localAchievementsText.badges as any)[badge.id] || badge;
                      return (
                        <div
                          key={badge.id}
                          className={`bg-white rounded-3xl border p-6 flex items-start gap-4 transition shadow-sm relative overflow-hidden ${
                            isUnlocked ? "border-emerald-250 bg-white" : "border-slate-200 opacity-60"
                          }`}
                        >
                          {/* Lock / Unlock overlays */}
                          {!isUnlocked && (
                            <div className="absolute top-3 right-3 bg-slate-100 p-1.5 rounded-lg border text-slate-400">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                          )}

                          <div className={`p-3 rounded-2xl border shrink-0 text-2xl ${
                            isUnlocked ? badge.bgColor : "bg-slate-100 text-slate-400 border-slate-200"
                          }`}>
                            {badge.id === "badge_commuter" ? "🚲" :
                             badge.id === "badge_saver" ? "⚡" :
                             badge.id === "badge_water" ? "💧" :
                             badge.id === "badge_guardian" ? "🛡️" : "🌱"}
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{tBadge.title}</span>
                              {isUnlocked && <span className="text-emerald-600 text-xs">{localAchievementsText.unlockedLabel}</span>}
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-semibold">{tBadge.description}</p>
                            <span className="text-[10px] text-slate-400 block font-bold pt-1 uppercase">
                              {localAchievementsText.requirementLabel}{tBadge.requirement}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Virtual Carbon Warrior PDF Certification simulation card */}
                  <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                      <span className="px-3 py-1 bg-emerald-800 rounded-full font-bold text-[10px] text-emerald-300 uppercase tracking-widest block w-fit">
                        {localAchievementsText.credentialTitle}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold">{localAchievementsText.certificationHeading}</h3>
                      <p className="text-emerald-100 text-xs sm:text-sm max-w-xl font-medium">
                        {localAchievementsText.certificationInfo}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        alert(localAchievementsText.successDownload);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer disabled:bg-emerald-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition shrink-0 flex items-center gap-2 shadow-md shadow-emerald-950/40"
                    >
                      <TrendingDown className="w-4 h-4" />
                      <span>{localAchievementsText.downloadBtn}</span>
                    </button>
                  </div>

                </div>
              );
            })()}

            {/* VIEW 10: INSIGHTS & REPORTS */}
            {activeTab === "reports" && (() => {
              const localReportsText = {
                hi: {
                  heading: "सस्टेनेबिलिटी ऑडिट निदान",
                  sub: "जेमिनी एआई कार्बन कोच द्वारा गतिशील रूप से उत्पन्न।",
                  reEvaluateBtn: "ऑडिट मॉडल का पुनर्मूल्यांकन करें",
                  synthesizingTxt: "इकोमाइंड सस्टेनेबिलिटी ऑडिटिंग पैनल मापदंडों का संश्लेषण सुनिश्चित कर रहा है...",
                  loadFactorTxt: "यह स्थानीय ग्रिड लोड फैक्टर्स और पेड़ के बराबर कार्बन अवशोषण सूचकांकों को मॉडल करता है...",
                  pendingHeading: "रिपोर्ट लंबित सस्टेनेबिलिटी ऑडिट",
                  pendingSub: "12-महीने के कार्बन पूर्वानुमान, पेड़-अवशोषण विश्लेषण, और आधिकारिक वैज्ञानिक सिफ़ारिशों को उत्पन्न करने के लिए यहाँ क्लिक करें।"
                },
                es: {
                  heading: "Auditoría de Diagnóstico de Sostenibilidad",
                  sub: "Generado dinámicamente a través de Gemini AI Carbon Coach.",
                  reEvaluateBtn: "Re-evaluar modelo de auditoría",
                  synthesizingTxt: "El panel de auditoría de EcoMind está sintetizando parámetros de referencia...",
                  loadFactorTxt: "Esto modela factores de carga de red local e índices de equivalencia forestal...",
                  pendingHeading: "Informe Pendiente de Generación de Línea Base",
                  pendingSub: "Haz clic aquí para generar una proyección de tabla de 12 meses, análisis equivalente de árboles y firmas de paneles científicos."
                },
                fr: {
                  heading: "Audit de Diagnostic de Sostenibilité",
                  sub: "Généré dynamiquement par le Coach Carbone Gemini AI.",
                  reEvaluateBtn: "Réévaluer le modèle d'audit",
                  synthesizingTxt: "L'équipe d'audit d'EcoMind synthétise les paramètres...",
                  loadFactorTxt: "Cela modélise la charge locale du réseau et l'équivalent de pines absorbés...",
                  pendingHeading: "Rapport en attente de génération",
                  pendingSub: "Cliquez ici pour générer des prévisions sur 12 mois, l'équivalent en arbres plantés et les signatures scientifiques officielles."
                },
                de: {
                  heading: "Nachhaltigkeitsdiagnose-Audit",
                  sub: "Dynamisch generiert über den Gemini AI Carbon Coach.",
                  reEvaluateBtn: "Auditmodell neu bewerten",
                  synthesizingTxt: "Das EcoMind-Auditpanel bewertet Ihre Parameter...",
                  loadFactorTxt: "Dies berechnet lokale Netzlastfaktoren & Baumpflanzungsequivalente...",
                  pendingHeading: "Bericht wartet auf Generierung",
                  pendingSub: "Klicken Sie hier, um eine 12-monatige Prognose, Baumpflanzungsequivalente und wissenschaftliche Analysen zu erhalten."
                },
                en: {
                  heading: "Sustainability Diagnostics Audit",
                  sub: "Generated dynamically via Gemini AI Carbon Coach.",
                  reEvaluateBtn: "Re-evaluate audit model",
                  synthesizingTxt: "EcoMind Carbon Auditing panel is synthesizing baseline parameters...",
                  loadFactorTxt: "This models localized grid load factors & pine tree equivalent indices...",
                  pendingHeading: "Report Pending Baseline Generation",
                  pendingSub: "Click here to generate a comprehensive 12-Month predictive table projection, tree equivalent analysis, and official scientific panel signatures."
                }
              }[language as "en" | "es" | "fr" | "de" | "hi"] || {
                heading: "Sustainability Diagnostics Audit",
                sub: "Generated dynamically via Gemini AI Carbon Coach.",
                reEvaluateBtn: "Re-evaluate audit model",
                synthesizingTxt: "EcoMind Carbon Auditing panel is synthesizing baseline parameters...",
                loadFactorTxt: "This models localized grid load factors & pine tree equivalent indices...",
                pendingHeading: "Report Pending Baseline Generation",
                pendingSub: "Click here to generate a comprehensive 12-Month predictive table projection, tree equivalent analysis, and official scientific panel signatures."
              };

              return (
                <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-md p-8 space-y-6" id="view_reports">
                  
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900">📃 {localReportsText.heading}</h2>
                      <p className="text-slate-400 text-xs">{localReportsText.sub}</p>
                    </div>

                    <button
                      onClick={handleGenerateReport}
                      disabled={isGeneratingReport}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 border transition cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingReport ? "animate-spin" : ""}`} />
                      <span>{localReportsText.reEvaluateBtn}</span>
                    </button>
                  </div>

                  {isGeneratingReport ? (
                    <div className="py-20 text-center space-y-3">
                      <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
                      <p className="text-slate-600 font-bold text-sm">{localReportsText.synthesizingTxt}</p>
                      <p className="text-xs text-slate-400">{localReportsText.loadFactorTxt}</p>
                    </div>
                  ) : (
                    <div className="prose max-w-none text-slate-800 text-xs sm:text-sm whitespace-pre-line leading-relaxed space-y-4">
                      {reportMarkdown ? (
                        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl max-w-none shadow-sm">
                          {reportMarkdown}
                        </div>
                      ) : (
                        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl max-w-none cursor-pointer text-center py-12" onClick={handleGenerateReport}>
                          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                          <span className="font-extrabold text-slate-700 block">{localReportsText.pendingHeading}</span>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">{localReportsText.pendingSub}</p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })()}

          </div>
        )}

      </main>

      {/* COMPREHENSIVE FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-400 select-none" id="footer_section">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          {(() => {
            const footerText = {
              hi: {
                credits: "इकोमाइंड एआई — गूगल एआई स्टूडियो पर्सनल कार्बन कोच इंजन द्वारा विकसित।",
                disclaimer: "कार्बन कारक गुणांक मानक ग्रीनहाउस गैस प्रोटोकॉल (GHGP) और जलवायु परिवर्तन पर अंतर-सरकारी पैनल (IPCC) मूल्यांकन मॉडल के आधार पर सत्यापित हैं। वास्तविक समय की रिपोर्ट गूगल जेमिनी मॉडल द्वारा सर्ver-साइड पर उत्पन्न की जाती है।",
                home: "मुख्य पृष्ठ",
                dashboard: "इंटरैक्टिव सैंडबॉक्स डैशबोर्ड",
                reports: "जलवायु रिपोर्ट"
              },
              es: {
                credits: "EcoMind AI — Desarrollado por el motor de entrenador de carbono personal de Google AI Studio.",
                disclaimer: "Los coeficientes de factor de carbono están verificados con los modelos estándar del Protocolo de Gases de Efecto Invernadero (GHGP) y del Panel Intergubernamental sobre el Cambio Climático (IPCC). Las ideas en tiempo real se generan en el servidor utilizando de Google Gemini.",
                home: "Inicio",
                dashboard: "Tablero Interactivo de Sandbox",
                reports: "Informes Climáticos"
              },
              fr: {
                credits: "EcoMind AI — Développé par le moteur de coaching carbone personnel Google AI Studio.",
                disclaimer: "Les coefficients d'émissions de carbone sont vérifiés par rapport aux modèles du Greenhouse Gas Protocol (GHGP) et du Groupe d'experts intergouvernemental sur l'évolution du climat (GIEC). Les recommandations sont générées par Gemini.",
                home: "Accueil",
                dashboard: "Tableau de Bord Interactif",
                reports: "Rapports Climatiques"
              },
              de: {
                credits: "EcoMind AI — Entwickelt mit der Google AI Studio Personal Carbon Coach Engine.",
                disclaimer: "Die CO2-Faktor-Koeffizienten sind nach den Standardmodellen des Greenhouse Gas Protocol (GHGP) und des Weltklimarats (IPCC) verifiziert. Live-Analysen werden serverseitig mit Google Gemini-Modellen generiert.",
                home: "Startseite",
                dashboard: "Interaktives Sandbox-Dashboard",
                reports: "Klimaberichte"
              },
              en: {
                credits: "EcoMind AI — Developed by Google AI Studio Personal Carbon Coach Engine.",
                disclaimer: "Carbon factor coefficients are verified against standard Greenhouse Gas Protocol (GHGP) and Intergovernmental Panel on Climate Change (IPCC) assessment models. Real-time insights are generated server-side using Google Gemini models.",
                home: "Home",
                dashboard: "Interactive Sandbox Dashboard",
                reports: "Climate Reports"
              }
            }[language as "en" | "es" | "fr" | "de" | "hi"] || {
              credits: "EcoMind AI — Developed by Google AI Studio Personal Carbon Coach Engine.",
              disclaimer: "Carbon factor coefficients are verified against standard Greenhouse Gas Protocol (GHGP) and Intergovernmental Panel on Climate Change (IPCC) assessment models. Real-time insights are generated server-side using Google Gemini models.",
              home: "Home",
              dashboard: "Interactive Sandbox Dashboard",
              reports: "Climate Reports"
            };

            return (
              <>
                <p className="font-bold text-slate-500">
                  {footerText.credits}
                </p>
                <p className="max-w-2xl mx-auto leading-relaxed">
                  {footerText.disclaimer}
                </p>
                <div className="flex justify-center gap-4 text-emerald-600 font-bold pt-2">
                  <span className="cursor-pointer hover:underline" onClick={() => setActiveTab("landing")}>{footerText.home}</span>
                  <span>•</span>
                  <span className="cursor-pointer hover:underline" onClick={skipOnboardingToDefault}>{footerText.dashboard}</span>
                  <span>•</span>
                  <span className="cursor-pointer hover:underline" onClick={handleGenerateReport}>{footerText.reports}</span>
                </div>
              </>
            );
          })()}
        </div>
      </footer>

    </div>
  );
}
