import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  console.log("Gemini API client initialized successfully with User-Agent.");
} else {
  console.warn("GEMINI_API_KEY environment variable is not defined. Using high-fidelity local calculations.");
}

// -----------------------------------------------------
// Core Calculation Utilities (Deterministic Carbon Math)
// Based on international averages & sustainability reports
// -----------------------------------------------------
function calculateFootprint(profile: any) {
  const trans = profile.transportation || { type: "car_petrol", distance: 10 };
  const elec = Number(profile.electricity) || 120; // kWh/month
  const water = Number(profile.water) || 150; // liters/day
  const diet = profile.foodType || "balanced"; // balanced, vegan, vegetarian, carnivore
  const delivery = Number(profile.deliveryCount) || 0; // times per week
  const shopping = profile.shoppingHabit || "average"; // minimalist, average, heavy-shopper

  // 1. Transportation footprint (monthly in kg CO2)
  // Distance is daily, so multiply by 30
  let transFactor = 0.20; // kg CO2 per km for petrol car (default)
  if (trans.type === "car_electric") transFactor = 0.05;
  else if (trans.type === "car_hybrid") transFactor = 0.10;
  else if (trans.type === "public_transit") transFactor = 0.07;
  else if (trans.type === "motorbike") transFactor = 0.12;
  else if (trans.type === "bicycle" || trans.type === "walking") transFactor = 0.00;
  const transCO2 = (Number(trans.distance) || 0) * 30 * transFactor;

  // 2. Electricity footprint (monthly in kg CO2)
  // 1 kWh Grid average CO2 is about 0.45 kg
  const elecCO2 = elec * 0.45;

  // 3. Water footprint (monthly in kg CO2)
  // 1 liter standard water treat/pump is ~0.0003 kg CO2.
  // Although small in carbon directly, heavy usage strains purification grids.
  const waterCO2 = water * 30 * 0.0015; 

  // 4. Food footprint (monthly in kg CO2)
  // Daily food emission estimates:
  // Vegan: 2.9, Vegetarian: 3.8, Balanced: 5.1, Carnivore (meat-heavy): 7.2
  let dietDaily = 5.1;
  if (diet === "vegan") dietDaily = 2.9;
  else if (diet === "vegetarian") dietDaily = 3.8;
  else if (diet === "carnivore") dietDaily = 7.2;
  const foodCO2 = (dietDaily * 30) + (delivery * 4 * 0.4); // 0.4 kg packaging/transport per order

  // 5. Shopping/lifestyle footprint (monthly in kg CO2)
  // Minimalist: ~60 kg/month, Average: ~150 kg/month, Heavy shopper: ~350 kg/month
  let shoppingCO2 = 150;
  if (shopping === "minimalist") shoppingCO2 = 60;
  else if (shopping === "heavy") shoppingCO2 = 350;

  const breakdown = {
    transportation: Math.round(transCO2 * 10) / 10,
    electricity: Math.round(elecCO2 * 10) / 10,
    water: Math.round(waterCO2 * 10) / 10,
    food: Math.round(foodCO2 * 10) / 10,
    shopping: Math.round(shoppingCO2 * 10) / 10,
  };

  const totalCarbon = Math.round((transCO2 + elecCO2 + waterCO2 + foodCO2 + shoppingCO2) * 10) / 10;

  // Sustainability score calculation (0 - 100)
  // Lower footprint = higher score. Global sustainable target is under 180 kg CO2 / month per capita.
  // Max score is 100.
  let baseScore = 100 - (totalCarbon / 12); // scaled roughly
  if (baseScore < 0) baseScore = 5;
  if (baseScore > 100) baseScore = 100;
  const sustainabilityScore = Math.round(baseScore);

  let level = "Eco Explorer";
  if (sustainabilityScore >= 85) {
    level = "Planet Guardian";
  } else if (sustainabilityScore >= 65) {
    level = "Carbon Warrior";
  } else if (sustainabilityScore >= 45) {
    level = "Eco Explorer";
  } else {
    level = "Green Beginner";
  }

  return {
    breakdown,
    totalCarbon,
    sustainabilityScore,
    level,
  };
}

// -----------------------------------------------------
// Server-Side API Handler 1: Smart Onboarding / Analysis
// -----------------------------------------------------
app.post("/api/analyze-lifestyle", async (req, res) => {
  try {
    const profile = req.body;
    const language = profile?.language || "en";
    const stats = calculateFootprint(profile);

    const langNames: Record<string, string> = {
      en: "English",
      es: "Spanish (Español)",
      fr: "French (Français)",
      de: "German (Deutsch)",
      hi: "Hindi (हिन्दी)"
    };
    const targetLang = langNames[language] || "English";

    let insightsPrompt = `
      You are the EcoMind AI Personal Carbon Coach.
      A user has submitted their onboarding details:
      - Daily commute: ${profile.transportation?.distance || 10} km by ${profile.transportation?.type || 'car_petrol'}
      - Electricity: ${profile.electricity || 120} kWh/month
      - Water consumption: ${profile.water || 150} liters/day
      - Diet style: ${profile.foodType || 'balanced'}
      - Online food orders: ${profile.deliveryCount || 0} times/week
      - Shopping/lifestyle habits: ${profile.shoppingHabit || 'average'}

      Based on mathematical calculations, their monthly emissions are:
      - Transportation: ${stats.breakdown.transportation} kg CO2
      - Electricity: ${stats.breakdown.electricity} kg CO2
      - Water filtration & heating: ${stats.breakdown.water} kg CO2
      - Food & deliveries: ${stats.breakdown.food} kg CO2
      - Shopping & consumer goods: ${stats.breakdown.shopping} kg CO2
      - Total Carbon Footprint: ${stats.totalCarbon} kg CO2 / month
      - Sustainability Score: ${stats.sustainabilityScore}/100 (Level: ${stats.level})

      Write a short, professional, and encouraging AI analysis in Markdown.
      
      CRITICAL REQUIREMENT: You MUST speak and write this entire Markdown analysis in the language: ${targetLang}. All markdown headers, lists, recommendations, and conversational explanations must be natively formulated in ${targetLang}.
      
      Structure it into:
      1. **Overall Footprint Interpretation** (1 scannable paragraph on how they compare to the global goal of ~150 kg/month)
      2. **Major Outliers/Emission Sources** (Identify which area is their highest and why)
      3. **Weekly Quick Improvement Plan** (Provide 3 highly practical bullet points for their profile to start saving carbon today)
    `;

    let insights = "";
    let recommendations: any[] = [];

    if (ai) {
      try {
        const aiResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: insightsPrompt,
          config: {
            temperature: 0.7,
          },
        });
        insights = aiResponse.text || "";
      } catch (err) {
        console.error("Gemini context generation error:", err);
      }
    }

    if (!insights) {
      // High-quality local markdown fallback if Gemini fails or details are missing
      insights = `### Your Carbon Profile Overview
Your estimated monthly carbon emissions are **${stats.totalCarbon} kg CO2**, giving you a Sustainability Score of **${stats.sustainabilityScore}/100** (**${stats.level}**). Let's work together to decrease your footprint!

#### 💡 Key Highlights & Insights
- **Standard Benchmark**: The average carbon output in developing nations is around 350 kg CO2/month, while the target for sustainable living is below **150 kg/ month**. 
- **Major Driver**: Your primary source of emissions is **${Object.entries(stats.breakdown).reduce((a, b) => a[1] > b[1] ? a : b)[0].toUpperCase()}**, accounting for **${Math.max(...Object.values(stats.breakdown))} kg CO2**. Focusing edits here will yield the largest sustainable gains!

#### 🚀 Immediate Action Ideas
1. **Optimize Your Commutes**: Consider combining errands, ridesharing, or swapping one vehicle trip daily for biking or using public mass transit.
2. **Eco-Diet Adjustments**: Incorporating clean, organic plant-focused meals twice a week reduces food-chain transport emissions significantly.
3. **Smart Power Audits**: Keep multi-plugs switched off when idle, clean AC air filters to increase efficiency, and rely on cooling times strictly needed.`;
    }

    // Prepare standard structured recommendations
    recommendations = [
      {
        id: "rec_trans",
        title: "Ditch the Petrol Commute",
        category: "Transportation",
        description: `Optimize your regular transport habit. Shifting 3 days of commuting to public transit or biking clears massive amounts of carbon.`,
        carbonReduction: Math.round(stats.breakdown.transportation * 0.4),
        costSaving: Math.round(stats.breakdown.transportation * 0.4 * 0.5 * 10), // savings factor
      },
      {
        id: "rec_elec",
        title: "AC Eco Mode Activation",
        category: "Energy",
        description: "Set your AC to 24°C or use scheduled shut-offs to decrease daily compressor load.",
        carbonReduction: Math.round(stats.breakdown.electricity * 0.25),
        costSaving: Math.round(stats.breakdown.electricity * 0.25 * 0.15 * 30),
      },
      {
        id: "rec_food",
        title: "Introduce Meatless Mondays",
        category: "Diet",
        description: "Substitute animal protein with plant alternatives just once or twice per week.",
        carbonReduction: Math.round(stats.breakdown.food * 0.15),
        costSaving: Math.round(stats.breakdown.food * 0.15 * 1.5),
      },
      {
        id: "rec_shop",
        title: "Opt for Circular Fashion & Tech",
        category: "Lifestyle",
        description: "Buy second-hand or extend the life of electronics rather than buying new high-emissions manufactured goods.",
        carbonReduction: Math.round(stats.breakdown.shopping * 0.3),
        costSaving: Math.round(stats.breakdown.shopping * 0.3 * 2.5),
      }
    ];

    res.json({
      success: true,
      breakdown: stats.breakdown,
      totalCarbon: stats.totalCarbon,
      sustainabilityScore: stats.sustainabilityScore,
      level: stats.level,
      insights,
      recommendations,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------
// Server-Side API Handler 2: AI Coach Conversational Bot
// -----------------------------------------------------
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, profile, language } = req.body;
    const currentLang = language || "en";
    
    // Fallback/Safety state
    const currentStats = calculateFootprint(profile || {});
    
    const langNames: Record<string, string> = {
      en: "English",
      es: "Spanish (Español)",
      fr: "French (Français)",
      de: "German (Deutsch)",
      hi: "Hindi (हिन्दी)"
    };
    const targetLang = langNames[currentLang] || "English";

    const systemPrompt = `
      You are the EcoMind AI Coach, a friendly, encouraging, and highly knowledgeable carbon coach and environmental enthusiast.
      The user is chatting with you to lower their carbon footprint.
      
      CRITICAL REQUIREMENT: You MUST speak, reply, and answer the user entirely in the language: ${targetLang}. Your output markdown, responses, greetings, and labels must be native ${targetLang}.
      
      Here is the user's sustainability context to customize your replies:
      - Current Sustainability Score: ${currentStats.sustainabilityScore}/100
      - Current Level: ${currentStats.level}
      - Total Monthly Footprint: ${currentStats.totalCarbon} kg CO2
      - Footprint breakdown: Transportation (${currentStats.breakdown.transportation} kg), Electricity (${currentStats.breakdown.electricity} kg), Food (${currentStats.breakdown.food} kg), Shop/Lifestyle (${currentStats.breakdown.shopping} kg), Water (${currentStats.breakdown.water} kg).
      
      Your goals:
      - Analyze user lifestyle, encourage positive behavioral change, and offer practical, highly tailored advice.
      - Never be preachy or judgmental; maintain a warm, conversational, inspiring tone.
      - If the user describes a particular lifestyle modification, you can validate how much carbon and money they can save!
      - Answer questions about carbon footprint math, recycling, eco-friendly swaps, and daily habit improvements.
      - Keep responses cohesive and well-structured in markdown.
    `;

    if (ai) {
      try {
        // Map messages to format expected by Chat
        const chat = ai.chats.create({
          model: "gemini-3.5-flash",
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          }
        });

        // Seed with prior messages
        let responseText = "";
        // Send the latest user message
        const lastUserMsg = messages[messages.length - 1]?.content || "Help me live more sustainably!";
        const chatResponse = await chat.sendMessage({ message: lastUserMsg });
        responseText = chatResponse.text || "";

        res.json({
          success: true,
          content: responseText,
        });
        return;
      } catch (err) {
        console.error("Gemini Chat Error:", err);
      }
    }

    // High fidelity deterministic chatbot fallback in case Gemini API is offline/waiting for key setup
    const userQuery = messages[messages.length - 1]?.content?.toLowerCase() || "";
    let mockReply = "";
    
    if (userQuery.includes("hello") || userQuery.includes("hi") || userQuery.includes("hey")) {
      mockReply = `Hello! I'm your **EcoMind Personal Coach**. I see your sustainability score is **${currentStats.sustainabilityScore}/100** (${currentStats.level}).

What area of your daily lifestyle would you like to debug today? We can chat about:
- 🚗 Transportation swaps (electric vehicles, transit, or active travel)
- ⚡ Energy optimizations (reducing heating/cooling emissions)
- 🥗 Planetary diet changes (meat-reduction, organic crops)
- 👜 Circular shopper strategies (restraining fast fashion)`;
    } else if (userQuery.includes("transport") || userQuery.includes("car") || userQuery.includes("bike") || userQuery.includes("travel")) {
      mockReply = `Transportation represents about **${currentStats.breakdown.transportation} kg CO2/month** for you. 

Here is what I recommend to slash transportation emissions:
1. **Swap 1 distance trip weekly**: If you map 10 km from driving to electric transit, you'll save about **24 kg CO2 each month**!
2. **Car-pooling**: Sharing your daily commute with a classmate or coworker cuts your personal footprint in half instantly.
3. **Active micro-mobility**: Biking or walking is 100% emission-free and keeps you physically active!`;
    } else if (userQuery.includes("diet") || userQuery.includes("food") || userQuery.includes("meat") || userQuery.includes("vegan")) {
      mockReply = `Your diet footprint contributes around **${currentStats.breakdown.food} kg CO2/month**. Excellent opportunity for behavioral change!

- **Did you know?** Beef has a carbon footprint 10x higher than chicken, and nearly 30x higher than beans or lentils.
- **Micro-Action**: Swapping beef/pork for chicken or legumes for just 3 dinners per week will lower your food footprint by nearly **22%**!`;
    } else if (userQuery.includes("electricity") || userQuery.includes("ac") || userQuery.includes("energy") || userQuery.includes("water")) {
      mockReply = `Your home utilities combine for **${currentStats.breakdown.electricity + currentStats.breakdown.water} kg CO2/month**. 

Let's optimize this with three smart actions:
- **Set smart timers**: Lowering your air conditioning time by just **1.5 hours daily** saves around **18-25 kWh of electricity/month** (reducing ~10 kg CO2).
- **Cold washes**: Running laundry on cold settings reduces electric washer heating energy by **75%** per load.
- **Tap safety**: Standard running taps release massive quantities of treated water. Shorter showers keep direct supply water treatment emissions minimal!`;
    } else {
      mockReply = `That is an excellent point! As your personal coach, I recommend focusing on small, actionable micro-changes. 

Your profile shows that **${Object.entries(currentStats.breakdown).sort((a,b) => b[1]-a[1])[0][0]}** is one of your top carbon-heavy domains, contributing **${Math.max(...Object.values(currentStats.breakdown))} kg CO2/month**. 

Try making a specific mini-pledge today:
- "I will turn off the AC 1 hour early"
- "I will cook a plant-based lunch today"
- "I will cycle to the bookstore instead of taking a taxi"

How does this sound to you? Let's take step-by-step gains!`;
    }

    res.json({
      success: true,
      content: mockReply,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------
// Server-Side API Handler 3: What-If Simulator
// -----------------------------------------------------
app.post("/api/simulator/what-if", async (req, res) => {
  try {
    const { scenario, currentProfile, language } = req.body;
    const currentStats = calculateFootprint(currentProfile || {});
    const currentLang = language || "en";

    const langNames: Record<string, string> = {
      en: "English",
      es: "Spanish (Español)",
      fr: "French (Français)",
      de: "German (Deutsch)",
      hi: "Hindi (हिन्दी)"
    };
    const targetLang = langNames[currentLang] || "English";

    let prompt = `
      You are the EcoMind Carbon Calculator Engine.
      The user's current estimated footprint is:
      - Transportation: ${currentStats.breakdown.transportation} kg CO2/month
      - Electricity: ${currentStats.breakdown.electricity} kg CO2/month
      - Diet/Food: ${currentStats.breakdown.food} kg CO2/month
      - Shopping: ${currentStats.breakdown.shopping} kg CO2/month
      - Total: ${currentStats.totalCarbon} kg CO2/month
      - Sustainability Score: ${currentStats.sustainabilityScore}/100

      The user asks: "What if ${scenario}?"

      Analyze this scenario and simulate the change. Estimate:
      1. Annual Carbon Reduction (in kg CO2 saved per year)
      2. Monthly Carbon Reduction (in kg CO2 saved per month)
      3. Approximate Estimated Monthly Monitary/Cost Savings (in dollars, e.g., $15/month electricity, $40/month petrol savings)
      4. Sustainability Score Improvement (+X points)
      
      CRITICAL REQUIREMENT FOR EXPLANATION FIELD: Write the text value of the "explanation" key entirely in the language: ${targetLang}. 

      Return a response in JSON format exactly matching this structure:
      {
        "carbonSavedAnnual": number,
        "carbonSavedMonthly": number,
        "costSavedMonthly": number,
        "scoreImprovement": number,
        "explanation": "A very scannable 2-3 sentence visual breakdown of the chemical/environmental impact written strictly in ${targetLang} (e.g. tree equivalents)."
      }
    `;

    if (ai) {
      try {
        const aiResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                carbonSavedAnnual: { type: Type.NUMBER },
                carbonSavedMonthly: { type: Type.NUMBER },
                costSavedMonthly: { type: Type.NUMBER },
                scoreImprovement: { type: Type.NUMBER },
                explanation: { type: Type.STRING }
              },
              required: ["carbonSavedAnnual", "carbonSavedMonthly", "costSavedMonthly", "scoreImprovement", "explanation"]
            }
          }
        });

        const data = JSON.parse(aiResponse.text || "{}");
        res.json({ success: true, ...data });
        return;
      } catch (err) {
        console.error("Gemini What-If Simulation failed, using mathematical estimation:", err);
      }
    }

    // Mathematical What-If Estimation Engine (fallback)
    let carbonSavedMonthly = 15;
    let costSavedMonthly = 12;
    let scoreImprovement = 3;
    let explanation = "";

    const cleanScenario = scenario.toLowerCase();
    if (cleanScenario.includes("bike") || cleanScenario.includes("cycling") || cleanScenario.includes("public transport") || cleanScenario.includes("bus") || cleanScenario.includes("train")) {
      carbonSavedMonthly = Math.round(currentStats.breakdown.transportation * 0.45);
      costSavedMonthly = Math.round(carbonSavedMonthly * 0.9); // fuel/fares savings
      scoreImprovement = Math.min(15, Math.round(carbonSavedMonthly / 6));
      explanation = `By shifting your routine commutes to active cycles or public transits, you save approximately **${carbonSavedMonthly} kg CO2** monthly. This is equivalent to planting **${Math.round(carbonSavedMonthly * 12 / 21)} trees** annually and eliminates massive local ozone contributions!`;
    } else if (cleanScenario.includes("ac") || cleanScenario.includes("air conditioner") || cleanScenario.includes("temp") || cleanScenario.includes("thermostat")) {
      carbonSavedMonthly = Math.round(currentStats.breakdown.electricity * 0.20);
      costSavedMonthly = Math.round(currentStats.breakdown.electricity * 0.15); // high savings
      scoreImprovement = Math.min(8, Math.round(carbonSavedMonthly / 5));
      explanation = `Reducing AC draw or matching climate thermostat goals saves roughly **${carbonSavedMonthly} kg CO2** monthly. That represents around **${Math.round(carbonSavedMonthly * 2.2)} kWh** of reduced grid pressure, directly lowering coal or gas turbine burn schedules!`;
    } else if (cleanScenario.includes("meat") || cleanScenario.includes("vegan") || cleanScenario.includes("vegetarian") || cleanScenario.includes("diet")) {
      carbonSavedMonthly = Math.round(currentStats.breakdown.food * 0.25);
      costSavedMonthly = Math.round(carbonSavedMonthly * 0.4);
      scoreImprovement = Math.min(10, Math.round(carbonSavedMonthly / 5));
      explanation = `Transitioning meals to fresh organic vegetarian options reduces daily food-chain packaging and farming emissions. You save **${carbonSavedMonthly} kg CO2** monthly, rescuing up to **${Math.round(carbonSavedMonthly * 10)} square meters** of sensitive rainforest land from ranching clearing!`;
    } else {
      // General guess
      carbonSavedMonthly = Math.round(currentStats.totalCarbon * 0.1);
      costSavedMonthly = Math.round(carbonSavedMonthly * 0.6 + 5);
      scoreImprovement = Math.max(2, Math.round(carbonSavedMonthly / 8));
      explanation = `This mindful sustainability choice decreases your footprint by about **${carbonSavedMonthly} kg CO2** monthly. Cultivating these eco-habits helps nudge your global footprint closer to the target threshold!`;
    }

    res.json({
      success: true,
      carbonSavedAnnual: carbonSavedMonthly * 12,
      carbonSavedMonthly,
      costSavedMonthly,
      scoreImprovement,
      explanation
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------
// Server-Side API Handler 4: Dynamic Challenge Generator
// -----------------------------------------------------
app.post("/api/challenges/generate", async (req, res) => {
  try {
    const { currentProfile, language } = req.body;
    const currentStats = calculateFootprint(currentProfile || {});
    const currentLang = language || "en";

    // Standard list of customized actionable eco-challenges
    const challengeTranslations: Record<string, any[]> = {
      hi: [
        {
          id: "ch_active_commute",
          title: "माइक्रो-मोबिलिटी कम्यूटर",
          category: "परिवहन/यातायात",
          difficulty: "मध्यम",
          description: "इस सप्ताह 5 किमी से कम की 3 कार यात्राओं के बदले साइकिल चलाने, चलने या इलेक्ट्रिक स्कूटर से यात्रा करने का विकल्प चुनें।",
          points: 150,
          badgeId: "badge_commuter"
        },
        {
          id: "ch_meatless_diet",
          title: "ग्रीन प्रोटीन स्वैप",
          category: "आहार शैली",
          difficulty: "सरल",
          description: "लगातार 3 दिनों तक पूरी तरह से लंच और डिनर में शाकाहारी भोजन करने का संकल्प लें।",
          points: 100,
          badgeId: "badge_saver"
        },
        {
          id: "ch_ac_off",
          title: "प्राकृतिक वायु-संचार मूल निवासी",
          category: "बिजली उपयोग",
          difficulty: "सरल",
          description: "सप्ताहांत के एक पूरे दिन अपने एयर कंडीशनर को पूरी तरह से बंद रखें और प्राकृतिक प्रवाह का उपयोग करें।",
          points: 80,
          badgeId: "badge_saver"
        },
        {
          id: "ch_plastics",
          title: "शून्य एकल-उपयोग प्लास्टिक दिवस",
          category: "जीवन शैली",
          difficulty: "कठिन",
          description: "अपना व्यक्तिगत पानी का फ्लास्क, टिकाऊ स्टील स्ट्रॉ और कपड़े का थैला साथ रखें। पूरी तरह से ज़ीरो एकल-उपयोग प्लास्टिक अपनाएं।",
          points: 200,
          badgeId: "badge_guardian"
        },
        {
          id: "ch_bucket_wash",
          title: "जल संरक्षण रक्षक",
          category: "पानी का उपयोग",
          difficulty: "मध्यम",
          description: "स्नान करने का समय 4 मिनट से कम रखें, और सब्जी धोने के बाद बचे पानी का उपयोग पौधों में करें।",
          points: 120,
          badgeId: "badge_water"
        }
      ],
      es: [
        {
          id: "ch_active_commute",
          title: "Viajero de Micromovilidad",
          category: "Transporte",
          difficulty: "Medio",
          description: "Cambie 3 viajes en automóvil de menos de 5 km por andar en bicicleta, caminar o viajar en scooter eléctrico esta semana.",
          points: 150,
          badgeId: "badge_commuter"
        },
        {
          id: "ch_meatless_diet",
          title: "Proteína Verde",
          category: "Dieta",
          difficulty: "Fácil",
          description: "Comprométase a almuerzos y cenas completamente libres de carne durante 3 días consecutivos.",
          points: 100,
          badgeId: "badge_saver"
        },
        {
          id: "ch_ac_off",
          title: "Nativo de Ventilación Natural",
          category: "Energía",
          difficulty: "Fácil",
          description: "Mantenga su aire acondicionado apagado por completo durante un día de fin de semana.",
          points: 80,
          badgeId: "badge_saver"
        },
        {
          id: "ch_plastics",
          title: "Día Cero Plásticos",
          category: "Estilo de vida",
          difficulty: "Difícil",
          description: "Lleve una botella de agua personal, bombilla de acero y bolsa de tela. Consuma absolutamente cero plásticos de un solo uso.",
          points: 200,
          badgeId: "badge_guardian"
        },
        {
          id: "ch_bucket_wash",
          title: "Guardián del Agua",
          category: "Agua",
          difficulty: "Medio",
          description: "Limite las duchas a menos de 4 minutos y reutilice el agua de enjuague de verduras para regar las plantas.",
          points: 120,
          badgeId: "badge_water"
        }
      ],
      fr: [
        {
          id: "ch_active_commute",
          title: "Adepte des micro-déplacements",
          category: "Transport",
          difficulty: "Moyen",
          description: "Remplacez 3 trajets en voiture de moins de 5 km par le vélo, la marche ou la trottinette électrique cette semaine.",
          points: 150,
          badgeId: "badge_commuter"
        },
        {
          id: "ch_meatless_diet",
          title: "Protéine Verte",
          category: "Alimentation",
          difficulty: "Facile",
          description: "Engagez-vous à prendre des déjeuners et dîners entièrement sans viande pendant 3 jours consécutifs.",
          points: 100,
          badgeId: "badge_saver"
        },
        {
          id: "ch_ac_off",
          title: "Ventilation Naturelle",
          category: "Énergie",
          difficulty: "Facile",
          description: "Gardez votre climatiseur éteint toute la journée d'un week-end.",
          points: 80,
          badgeId: "badge_saver"
        },
        {
          id: "ch_plastics",
          title: "Zéro plastique à usage unique",
          category: "Style de vie",
          difficulty: "Difficile",
          description: "Portez une gourde personnelle, une paille réutilisable et un sac en tissu. Zéro plastique à usage unique.",
          points: 200,
          badgeId: "badge_guardian"
        },
        {
          id: "ch_bucket_wash",
          title: "Gardien de l'eau",
          category: "Eau",
          difficulty: "Moyen",
          description: "Limitez les douches à moins de 4 minutes et réutilisez l'eau de lavage des légumes pour les plantes.",
          points: 120,
          badgeId: "badge_water"
        }
      ],
      de: [
        {
          id: "ch_active_commute",
          title: "Mikromobilitäts-Pendler",
          category: "Transport",
          difficulty: "Mittel",
          description: "Ersetzen Sie diese Woche 3 Autofahrten unter 5 km durch Radfahren, Gehen oder E-Scooter.",
          points: 150,
          badgeId: "badge_commuter"
        },
        {
          id: "ch_meatless_diet",
          title: "Grüner Proteintausch",
          category: "Ernährung",
          difficulty: "Einfach",
          description: "Verpflichten Sie sich an 3 aufeinanderfolgenden Tagen zu völlig fleischfreien Mittag- und Abendessen.",
          points: 100,
          badgeId: "badge_saver"
        },
        {
          id: "ch_ac_off",
          title: "Natürliche Belüftung",
          category: "Energie",
          difficulty: "Einfach",
          description: "Lassen Sie Ihre Klimaanlage an einem Wochenendtag komplett ausgeschaltet.",
          points: 80,
          badgeId: "badge_saver"
        },
        {
          id: "ch_plastics",
          title: "Kein Einwegplastik-Tag",
          category: "Lebensstil",
          difficulty: "Schwer",
          description: "Tragen Sie eine persönliche Trinkflasche, einen wiederverwendbaren Strohhalm und eine Tragetasche.",
          points: 200,
          badgeId: "badge_guardian"
        },
        {
          id: "ch_bucket_wash",
          title: "Wasserschutz-Hüter",
          category: "Wasser",
          difficulty: "Mittel",
          description: "Duschen unter 4 Minuten halten und Gemüsewaschwasser für Zimmerpflanzen nutzen.",
          points: 120,
          badgeId: "badge_water"
        }
      ],
      en: [
        {
          id: "ch_active_commute",
          title: "Micro-mobility Commuter",
          category: "Transportation",
          difficulty: "Medium",
          description: "Swap 3 car trips of under 5 km for biking, walking, or electric scooter travel this week.",
          points: 150,
          badgeId: "badge_commuter"
        },
        {
          id: "ch_meatless_diet",
          title: "Green Protein Swap",
          category: "Diet",
          difficulty: "Easy",
          description: "Commit to completely meat-free lunches and dinners for 3 consecutive days.",
          points: 100,
          badgeId: "badge_saver"
        },
        {
          id: "ch_ac_off",
          title: "Natural Ventilation Native",
          category: "Energy",
          difficulty: "Easy",
          description: "Keep your air conditioner switched OFF for a full weekend day, active with natural airflow.",
          points: 80,
          badgeId: "badge_saver"
        },
        {
          id: "ch_plastics",
          title: "Zero-Single-Use Day",
          category: "Lifestyle",
          difficulty: "Hard",
          description: "Carry a personal water flask, reusable steel straw, and tote bag. Consume absolutely zero single-use plastics.",
          points: 200,
          badgeId: "badge_guardian"
        },
        {
          id: "ch_bucket_wash",
          title: "Water Conservation Guardian",
          category: "Water",
          difficulty: "Medium",
          description: "Limit showers to under 4 minutes, and reuse vegetable rinse water to feed house plants.",
          points: 120,
          badgeId: "badge_water"
        }
      ]
    };

    const initialChallenges = challengeTranslations[currentLang] || challengeTranslations["en"];

    res.json({
      success: true,
      challenges: initialChallenges
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------
// Server-Side API Handler 5: Custom Sustainability Report Card
// -----------------------------------------------------
app.post("/api/reports/generate", async (req, res) => {
  try {
    const { currentProfile, challengeHistory, language } = req.body;
    const stats = calculateFootprint(currentProfile || {});
    const currentLang = language || "en";

    const langNames: Record<string, string> = {
      en: "English",
      es: "Spanish (Español)",
      fr: "French (Français)",
      de: "German (Deutsch)",
      hi: "Hindi (हिन्दी)"
    };
    const targetLang = langNames[currentLang] || "English";

    let reportPrompt = `
      You are the Chief Scientist of the EcoMind Sustainability Board.
      Write an official EcoMind Sustainability Audit Report based on these metrics:
      - Total Monthly Footprint: ${stats.totalCarbon} kg CO2
      - Sustainability Score: ${stats.sustainabilityScore}/100 
      - Level: ${stats.level}
      - Energy: ${stats.breakdown.electricity} kg CO2/month
      - Commutes: ${stats.breakdown.transportation} kg CO2/month
      - Diet: ${stats.breakdown.food} kg CO2/month
      - Shopping Lifestyle: ${stats.breakdown.shopping} kg CO2/month
      - Water: ${stats.breakdown.water} kg CO2/month
      - Completed challenges count: ${challengeHistory ? challengeHistory.length : 0}

      Format the response in structured markdown. Keep it engaging and professional.
      
      CRITICAL REQUIREMENT: You MUST formulate and write the entire Report in the language: ${targetLang}. All sections, headers, predictive tables, and advisors' credentials must be in native ${targetLang}.

      Ensure you include:
      1. An Executive Summary (Formal carbon audit evaluation)
      2. 12-Month Predictive Trends (Write a table of estimated monthly CO2 footprint if they stick to their baseline, compared to if they implement immediate weekly challenges)
      3. Global Impact Equivalents (e.g., matching the overall footprint reduction to flights saved, smartphone charges, or bags of coal kept in the ground)
      4. Signature of the EcoMind Science Advisory Committee.
    `;

    let reportContent = "";

    if (ai) {
      try {
        const aiResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: reportPrompt,
          config: {
            temperature: 0.6,
          },
        });
        reportContent = aiResponse.text || "";
      } catch (err) {
        console.error("Gemini Board Report Generation failed:", err);
      }
    }

    if (!reportContent) {
      reportContent = `
# 📃 EcoMind Personal Carbon Audit
*Prepared by the EcoMind Climate Advisory Panel*
*Issued on: June 9, 2026*

---

## 1. Executive Summary
After verifying your onboarding questionnaire parameters, we evaluated your monthly climate emissions at **${stats.totalCarbon} kg CO2** with a relative lifestyle optimization score of **${stats.sustainabilityScore}/100** (**${stats.level}**). This demonstrates notable ecological focus, but points to several opportunities for further decarbonization.

## 2. 12-Month Emissions & Projections

| Month | Baseline Projection (kg CO2) | Decarbonized Target (kg CO2) | MoM Carbon Saved (kg CO2) |
|:---|:---:|:---:|:---:|
| Month 1 (June) | ${stats.totalCarbon} | ${Math.round(stats.totalCarbon * 0.85)} | ${Math.round(stats.totalCarbon * 0.15)} |
| Month 3 (August) | ${stats.totalCarbon} | ${Math.round(stats.totalCarbon * 0.78)} | ${Math.round(stats.totalCarbon * 0.22)} |
| Month 6 (November) | ${stats.totalCarbon} | ${Math.round(stats.totalCarbon * 0.70)} | ${Math.round(stats.totalCarbon * 0.30)} |
| Month 12 (May) | ${stats.totalCarbon} | ${Math.round(stats.totalCarbon * 0.65)} | ${Math.round(stats.totalCarbon * 0.35)} |

## 3. Annualized Planetary Savings
By shifting to the Carbon Decarbonized Target, you are projected to withdraw **${Math.round(stats.totalCarbon * 0.35 * 12)} kg CO2** of heat-trapping gas from the atmosphere annually. This corresponds directly to:
* **${Math.round(stats.totalCarbon * 0.35 * 12 / 0.2)} kilometers** of gas-fueled driving completely eliminated.
* **${Math.round(stats.totalCarbon * 0.35 * 12 / 21)} mature pine trees** absorbing emissions in their trunks for a decade.
* **${Math.round(stats.totalCarbon * 0.35 * 12 / 0.008)} smartphone batteries** spared from lithium-grid recharge load.

---
*Signed,*
**The EcoMind Scientific Advisory Board**
`;
    }

    res.json({
      success: true,
      reportContent
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------
// Vite Dev Middleware & Catch-all SPA Routing
// -----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind exclusively to 0.0.0.0 and port 3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EcoMind AI Server running at http://0.0.0.0:${PORT}/`);
  });
}

startServer();
