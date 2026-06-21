export interface TransportationProfile {
  type: string; // e.g. 'car_petrol', 'car_electric', 'car_hybrid', 'public_transit', 'motorbike', 'bicycle', 'walking'
  distance: number; // daily km
}

export interface UserProfile {
  email?: string;
  name?: string;
  college?: string;
  teamName?: string;
  transportation: TransportationProfile;
  electricity: number; // kWh/month
  water: number; // liters/day
  foodType: string; // 'balanced' | 'vegetarian' | 'vegan' | 'carnivore'
  deliveryCount: number; // food orders per week
  shoppingHabit: string; // 'minimalist' | 'average' | 'heavy'
}

export interface FootprintBreakdown {
  transportation: number;
  electricity: number;
  water: number;
  food: number;
  shopping: number;
}

export interface Recommendation {
  id: string;
  title: string;
  category: string;
  description: string;
  carbonReduction: number;
  costSaving: number;
}

export interface CarbonResult {
  breakdown: FootprintBreakdown;
  totalCarbon: number;
  sustainabilityScore: number;
  level: string;
  insights: string;
  recommendations: Recommendation[];
}

export interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export interface Challenge {
  id: string;
  title: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  points: number;
  badgeId: string;
}

export interface UserChallengeStatus {
  challengeId: string;
  completed: boolean;
  completedAt?: string;
}

export interface Badge {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string; // Lucide icon name
  bgColor: string; // Tailwind bg color class
  requirement: string;
}
