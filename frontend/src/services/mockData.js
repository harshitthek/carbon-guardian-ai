export const mockData = {
  profile: {
    id: 1,
    name: "Aarav (ex)",
    level: 7,
    persona: "Eco Warrior (ex)",
    green_points: 2450,
    daily_footprint_kg: 12.4,
    recent_rewards: [
      { id: 1, source: "Used Metro (ex)", points: 50, date: "2023-10-25" },
      { id: 2, source: "Switched to LED (ex)", points: 30, date: "2023-10-24" },
      { id: 3, source: "Avoided Plastic (ex)", points: 40, date: "2023-10-23" },
      { id: 4, source: "Cycling (ex)", points: 60, date: "2023-10-22" },
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
    city: "Delhi (ex)",
    trees_equivalent: 14
  },
  recommendation: {
    id: 101,
    prediction: "You will likely take a cab around 17:00. (ex)",
    recommendation: "Take the metro instead to save 2.4kg of CO₂. (ex)",
    impact_percent: 63,
    confidence: 0.88,
    type: "transport",
    model: "mock-fallback",
    fallback_reason: "Backend offline or mock mode enabled",
    latency_ms: 15
  },
  leaderboard: [
    { rank: 1, name: "Eco Innovators (ex)", score: 14500, avatar: "🌍" },
    { rank: 2, name: "Green Tech Club (ex)", score: 13200, avatar: "⚡" },
    { rank: 3, name: "Your Community (ex)", score: 12800, avatar: "🌳" },
    { rank: 4, name: "Earth Saviors (ex)", score: 11050, avatar: "🛡️" },
    { rank: 5, name: "Zero Waste Squad (ex)", score: 9800, avatar: "♻️" },
  ],
  scenarios: {
    "ev_adoption_30": {
      scenario_id: "ev_adoption_30",
      co2_reduced_kg: 2800000,
      aqi_improvement_percent: 18,
      temp_reduction_c: 0.6,
      description: "30% of users switch to Electric Vehicles (ex)"
    },
    "solar_grid_50": {
      scenario_id: "solar_grid_50",
      co2_reduced_kg: 5400000,
      aqi_improvement_percent: 25,
      temp_reduction_c: 1.2,
      description: "50% of community grid powered by Solar (ex)"
    },
    "zero_plastic_week": {
      scenario_id: "zero_plastic_week",
      co2_reduced_kg: 850000,
      aqi_improvement_percent: 5,
      temp_reduction_c: 0.1,
      description: "Community-wide ban on single-use plastics for 1 week (ex)"
    }
  },
  marketplace: [
    { id: 1, title: "Tree Plantation Drive (ex)", category: "Volunteer", points: 200, icon: "🌳" },
    { id: 2, title: "Solar Fund Donation (ex)", category: "Donate", points: 500, icon: "☀️" },
    { id: 3, title: "Weekend Beach Cleanup (ex)", category: "Action", points: 300, icon: "🏖️" },
    { id: 4, title: "Composting Workshop (ex)", category: "Learn", points: 100, icon: "🍂" },
  ]
};
