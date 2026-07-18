// Mock Data Layer
// Used when the backend is offline or for purely frontend development.

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const mockData = {
  profile: {
    id: 1,
    name: "Aarav",
    level: 7,
    persona: "Eco Warrior",
    green_points: 2450,
    daily_footprint_kg: 12.4,
    recent_rewards: [
      { id: 1, source: "Used Metro", points: 50, date: "2023-10-25" },
      { id: 2, source: "Switched to LED", points: 30, date: "2023-10-24" },
      { id: 3, source: "Avoided Plastic", points: 40, date: "2023-10-23" },
      { id: 4, source: "Cycling", points: 60, date: "2023-10-22" },
    ],
    footprint_breakdown: [
      { name: "Transport", value: 45, fill: "#10b981" },
      { name: "Electricity", value: 30, fill: "#3b82f6" },
      { name: "Food", value: 15, fill: "#f59e0b" },
      { name: "Waste", value: 10, fill: "#ef4444" },
    ],
    weekly_trend: [
      { day: "Mon", co2: 14.2 },
      { day: "Tue", co2: 12.8 },
      { day: "Wed", co2: 15.1 },
      { day: "Thu", co2: 11.4 },
      { day: "Fri", co2: 10.9 },
      { day: "Sat", co2: 9.5 },
      { day: "Sun", co2: 8.2 },
    ]
  },
  environment: {
    aqi: 118,
    co2_ppm: 412,
    temperature_c: 32,
    city: "Delhi",
    trees_equivalent: 14
  },
  recommendation: {
    id: 101,
    prediction: "You will likely take a cab around 17:00.",
    recommendation: "Take the metro instead to save 2.4kg of CO₂.",
    impact_percent: 63,
    confidence: 0.88,
    type: "transport"
  },
  leaderboard: [
    { rank: 1, name: "Eco Innovators", score: 14500, avatar: "🌍" },
    { rank: 2, name: "Green Tech Club", score: 13200, avatar: "⚡" },
    { rank: 3, name: "Your Community", score: 12800, avatar: "🌳" },
    { rank: 4, name: "Earth Saviors", score: 11050, avatar: "🛡️" },
    { rank: 5, name: "Zero Waste Squad", score: 9800, avatar: "♻️" },
  ],
  scenarios: {
    "ev_adoption_30": {
      scenario_id: "ev_adoption_30",
      co2_reduced_kg: 2800000,
      aqi_improvement_percent: 18,
      temp_reduction_c: 0.6,
      description: "30% of users switch to Electric Vehicles"
    },
    "solar_grid_50": {
      scenario_id: "solar_grid_50",
      co2_reduced_kg: 5400000,
      aqi_improvement_percent: 25,
      temp_reduction_c: 1.2,
      description: "50% of community grid powered by Solar"
    },
    "zero_plastic_week": {
      scenario_id: "zero_plastic_week",
      co2_reduced_kg: 850000,
      aqi_improvement_percent: 5,
      temp_reduction_c: 0.1,
      description: "Community-wide ban on single-use plastics for 1 week"
    }
  },
  marketplace: [
    { id: 1, title: "Tree Plantation Drive", category: "Volunteer", points: 200, icon: "🌳" },
    { id: 2, title: "Solar Fund Donation", category: "Donate", points: 500, icon: "☀️" },
    { id: 3, title: "Weekend Beach Cleanup", category: "Action", points: 300, icon: "🏖️" },
    { id: 4, title: "Composting Workshop", category: "Learn", points: 100, icon: "🍂" },
  ]
};

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'; // Set to false to hit the real backend

async function request(path, options = {}) {
  if (USE_MOCKS) {
    await delay(600); // Simulate network latency

    // Simple mock router
    if (path.includes("/user/profile")) return mockData.profile;
    if (path.includes("/environment/live")) return mockData.environment;
    if (path.includes("/community/leaderboard")) return mockData.leaderboard;
    if (path.includes("/ai/recommend")) return mockData.recommendation;
    if (path.includes("/marketplace")) return mockData.marketplace;
    if (path.includes("/simulation/run")) {
      const p = JSON.parse(options.body || "{}");
      return {
        scenario_id: "mock_scenario",
        description: `Mock Projection: ${p.ev||30}% EV, ${p.solar||20}% Solar, ${p.plastic||50}% Plastic`,
        co2_reduced_kg: 2500000,
        aqi_improvement_percent: 15,
        temp_reduction_c: 0.5
      };
    }

    // Simulate successful post
    if (options.method === "POST") return { success: true };

    throw new Error(`Mock endpoint not found: ${path}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

/**
 * @typedef {Object} Reward
 * @property {string} source
 * @property {number} points
 * @property {string} created_at
 * 
 * @typedef {Object} FootprintBreakdown
 * @property {string} name
 * @property {number} value
 * @property {string} fill
 * 
 * @typedef {Object} WeeklyTrend
 * @property {string} day
 * @property {number} co2
 *
 * @typedef {Object} UserProfile
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {number} level
 * @property {string} persona
 * @property {number} green_points
 * @property {string} location
 * @property {Reward[]} recent_rewards
 * @property {FootprintBreakdown[]} footprint_breakdown
 * @property {WeeklyTrend[]} weekly_trend
 * 
 * @typedef {Object} Environment
 * @property {number} aqi
 * @property {number} co2_ppm
 * @property {number} temperature_c
 * @property {string} city
 * @property {number} trees_equivalent
 * 
 * @typedef {Object} CommunityGroup
 * @property {number} id
 * @property {string} name
 * @property {string} location
 * @property {number} rank
 * @property {number} total_points
 * 
 * @typedef {Object} Recommendation
 * @property {number} id
 * @property {string} prediction
 * @property {string} recommendation
 * @property {number} impact_percent
 * @property {number} confidence
 * @property {string} type
 * 
 * @typedef {Object} Scenario
 * @property {string} scenario_id
 * @property {number} co2_reduced_kg
 * @property {number} aqi_improvement_percent
 * @property {number} temp_reduction_c
 * @property {string} description
 * 
 * @typedef {Object} MarketplaceItem
 * @property {number} id
 * @property {string} title
 * @property {string} category
 * @property {number} points
 * @property {string} icon
 */

export const api = {
  /** @returns {Promise<UserProfile>} */
  profile: () => request("/user/profile"),
  
  /** @returns {Promise<Environment>} */
  liveEnvironment: () => request("/environment/live?location=Delhi"),
  
  /** @returns {Promise<CommunityGroup[]>} */
  leaderboard: () => request("/community/leaderboard").then(res => res.groups || res),
  
  /** @returns {Promise<MarketplaceItem[]>} */
  marketplace: () => request("/marketplace"),
  
  /** 
   * @param {Object} payload 
   * @returns {Promise<Recommendation>} 
   */
  recommend: (payload) =>
    request("/ai/recommend", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    
  /** @param {Object} payload */
  feedback: (payload) =>
    request("/ai/feedback", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    
  /** 
   * @param {Object} payload 
   * @returns {Promise<Scenario>} 
   */
  simulation: (payload) =>
    request("/simulation/run", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
