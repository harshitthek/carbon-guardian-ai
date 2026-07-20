// Mock Data Layer
// Used when the backend is offline or for purely frontend development.

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

import { mockData } from './mockData';

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

export const getMockMode = () => {
  const local = localStorage.getItem("USE_MOCKS");
  if (local !== null) return local === "true";
  return import.meta.env.VITE_USE_MOCKS === 'true';
};

export const setMockMode = (enabled) => {
  localStorage.setItem("USE_MOCKS", enabled ? "true" : "false");
};

async function request(path, options = {}) {
  options.credentials = 'include';
  
  const getMockFallback = () => {
    if (path.includes("/user/profile")) return mockData.profile;
    if (path.includes("/environment/live")) return mockData.environment;
    if (path.includes("/community/leaderboard")) return mockData.leaderboard;
    if (path.includes("/ai/recommend")) return mockData.recommendation;
    if (path.includes("/marketplace")) return mockData.marketplace;
    if (path.includes("/simulation/run")) {
      const p = JSON.parse(options.body || "{}");
      return {
        scenario_id: "mock_scenario",
        description: `Mock Projection: ${p.ev||30}% EV, ${p.solar||20}% Solar, ${p.plastic||50}% Plastic (ex)`,
        co2_reduced_kg: 2500000,
        aqi_improvement_percent: 15,
        temp_reduction_c: 0.5
      };
    }
    return null;
  };
  
  if (getMockMode()) {
    await delay(300);
    const mock = getMockFallback();
    if (mock) return mock;
    throw new Error(`Request failed (MOCK MODE): No mock defined for ${path}`);
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    if (response.status === 401) {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }
    
    if (response.status === 403) {
      if (window.location.pathname.includes('/admin')) {
        window.location.href = '/app/dashboard';
      }
      throw new Error('Forbidden');
    }

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') throw error;
    
    console.warn(`[API Fallback] Backend fetch failed for ${path}. Using mock data... Error:`, error);
    
    const mock = getMockFallback();
    if (mock) {
      await delay(300); // Simulate brief network delay before fallback
      return mock;
    }
    
    throw error;
  }
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
 * @property {number} weekly_reduction_kg
 * @property {number} rank
 * @property {number} members
 * @property {number} score
 * @property {string} avatar
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
  leaderboard: () => request("/community/leaderboard").then(res => {
    const groups = res.groups || res;
    return groups.map(g => ({
      ...g,
      score: g.score ?? g.weekly_reduction_kg ?? g.total_points ?? 0,
      avatar: g.avatar || "🌱"
    }));
  }),

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
    
  admin: {
    stats: () => request("/admin/stats"),
    users: (page = 1, limit = 50, search = "") => request(`/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
    updateUser: (id, data) => request(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    groups: () => request("/admin/groups"),
    updateGroup: (id, data) => request(`/admin/groups/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    auditLogs: () => request("/admin/audit-logs"),
    gamificationSettings: () => request("/admin/settings/gamification"),
    updateGamificationSetting: (id, points) => request(`/admin/settings/gamification/${id}`, { method: "PUT", body: JSON.stringify({ points }) }),
    purgeLogs: () => request("/admin/logs/purge", { method: "DELETE" }),
    seedDatabase: () => request("/admin/system/seed", { method: "POST" }),
    retrainAi: () => request("/ai/retrain", { method: "POST" }),
    exportEmissions: async () => {
      const res = await fetch(`${API_BASE}/admin/export/emissions`, { credentials: 'include' });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'emissions.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }
  }
};
