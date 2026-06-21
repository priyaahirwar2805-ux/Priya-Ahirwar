import { Badge } from "../types";

export const ALL_BADGES: Badge[] = [
  {
    id: "badge_commuter",
    title: "Green Commuter",
    category: "Transportation",
    description: "Slashed petrol footprint by choosing eco-transit or active cycling.",
    icon: "Bike",
    bgColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    requirement: "Complete a Transportation challenge"
  },
  {
    id: "badge_saver",
    title: "Energy Saver",
    category: "Energy",
    description: "Reduced peak domestic electrical load or air conditioning hours.",
    icon: "Zap",
    bgColor: "bg-amber-100 text-amber-800 border-amber-300",
    requirement: "Complete an Energy challenge"
  },
  {
    id: "badge_water",
    title: "Water Guardian",
    category: "Water",
    description: "Successfully limited shower times and engaged in greywater conservation.",
    icon: "Droplets",
    bgColor: "bg-blue-100 text-blue-800 border-blue-300",
    requirement: "Complete a Water challenge"
  },
  {
    id: "badge_guardian",
    title: "Planet Guardian",
    category: "General",
    description: "Demonstrated exemplary zero-plastic living and a high sustainability score.",
    icon: "ShieldAlert",
    bgColor: "bg-purple-100 text-purple-800 border-purple-300",
    requirement: "Complete a Hard challenge"
  },
  {
    id: "badge_champion",
    title: "Sustainability Champion",
    category: "Diet",
    description: "Pledged food habit updates and integrated planetary healthy choices.",
    icon: "Leaf",
    bgColor: "bg-teal-100 text-teal-800 border-teal-300",
    requirement: "Reach a Sustainability Score of 80+"
  }
];

export const INITIAL_INDIVIDUAL_LEADERBOARD = [
  { rank: 1, name: "Priya Ahirwar", score: 92, points: 2450, level: "Planet Guardian", isUser: true },
  { rank: 2, name: "Sarah Jenkins", score: 88, points: 2100, level: "Planet Guardian", isUser: false },
  { rank: 3, name: "Aarav Sharma", score: 85, points: 1950, level: "Carbon Warrior", isUser: false },
  { rank: 4, name: "Marcus Chen", score: 81, points: 1800, level: "Carbon Warrior", isUser: false },
  { rank: 5, name: "Emma Watson", score: 76, points: 1550, level: "Eco Explorer", isUser: false },
  { rank: 6, name: "Raj Patel", score: 72, points: 1320, level: "Eco Explorer", isUser: false },
  { rank: 7, name: "Carlos Mendez", score: 64, points: 980, level: "Green Beginner", isUser: false },
];

export const INITIAL_COLLEGE_LEADERBOARD = [
  { rank: 1, name: "Harvard Eco Alliance", activeMembers: 142, points: 41200, avgScore: 84 },
  { rank: 2, name: "MIT Energy Initiative", activeMembers: 118, points: 38900, avgScore: 81 },
  { rank: 3, name: "Stanford Climate Coalition", activeMembers: 95, points: 29500, avgScore: 80 },
  { rank: 4, name: "UC Berkeley Green Action", activeMembers: 84, points: 22100, avgScore: 78 },
  { rank: 5, name: "State College Sustainability", activeMembers: 60, points: 14400, avgScore: 71 },
];

export const INITIAL_TEAM_LEADERBOARD = [
  { rank: 1, name: "Energy Rangers", members: 6, points: 4200, category: "Energy Savings" },
  { rank: 2, name: "Eco Avengers", members: 4, points: 3950, category: "Zero Plastics" },
  { rank: 3, name: "Micro-mobility Coalition", members: 5, points: 3100, category: "Green Commutes" },
  { rank: 4, name: "Vegan Planet Cheer", members: 3, points: 2400, category: "Plant Diets" },
];
