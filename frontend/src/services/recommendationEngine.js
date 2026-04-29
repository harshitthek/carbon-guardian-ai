import transportEmissions from '../data/transport_emissions.json';
import userBehavior from '../data/user_behavior.json';
import recommendationWeights from '../data/recommendation_weights.json';

export const recommendationEngine = {
  /**
   * Scores and ranks transport modes based on distance, time, and datasets.
   * @param {number} distanceKm - Distance in kilometers
   * @param {number} baseDurationMins - Duration in minutes (e.g., from car routing)
   * @param {boolean} isBadWeather - True if raining/snowing/extreme heat
   * @returns {Array} Sorted array of transport modes with scores and stats
   */
  generateRecommendations: (distanceKm, baseDurationMins, isBadWeather = false) => {
    const modes = transportEmissions.modes;
    const { weights, penalties } = recommendationWeights;
    const prefs = userBehavior.user_preferences;

    // Normalize max values for scoring
    const maxEmissions = modes.find(m => m.id === 'personal_vehicle').emissions_per_km * distanceKm;
    const maxTime = distanceKm / modes.find(m => m.id === 'walking').base_speed_kmh * 60;
    const maxCost = modes.find(m => m.id === 'cab').cost_per_km * distanceKm;

    const scoredModes = modes.map(mode => {
      // Calculate specific stats for this mode based on distance
      const emissions = mode.emissions_per_km * distanceKm;
      // Estimate time: distance / speed, convert to mins.
      // If baseDurationMins is provided, use it to adjust driving-related modes.
      let timeMins = (distanceKm / mode.base_speed_kmh) * 60;
      if (['cab', 'personal_vehicle', 'carpool'].includes(mode.id) && baseDurationMins) {
        timeMins = baseDurationMins;
      }
      const cost = mode.cost_per_km * distanceKm;

      // Scoring base components (0 to 1 scale, higher is better)
      const scoreEmissions = maxEmissions > 0 ? (1 - (emissions / maxEmissions)) : 1;
      const scoreTime = maxTime > 0 ? (1 - (timeMins / maxTime)) : 1;
      const scoreCost = maxCost > 0 ? (1 - (cost / maxCost)) : 1;
      const scoreHistory = prefs.frequent_modes.includes(mode.id) ? 1 : 0;

      // Initial weighted score (0 to 100)
      let score = (
        (scoreEmissions * weights.emissions) +
        (scoreTime * weights.time) +
        (scoreCost * weights.cost) +
        (scoreHistory * weights.user_history)
      ) * 100;

      // Apply penalities based on distance comfort
      if (mode.id === 'walking' && distanceKm > prefs.max_walking_distance_km) {
        score += penalties.distance_exceeds_comfort;
      }
      if (mode.id === 'cycling' && distanceKm > prefs.max_cycling_distance_km) {
        score += penalties.distance_exceeds_comfort;
      }

      // Apply weather penalties
      if (isBadWeather && mode.weather_penalty) {
        score += penalties.bad_weather_unshielded;
      }

      return {
        ...mode,
        estimatedTimeMins: Math.round(timeMins),
        estimatedEmissions: Math.round(emissions),
        estimatedCost: Number(cost.toFixed(2)),
        score: Math.max(0, Math.round(score)) // Ensure score isn't negative
      };
    });

    // Sort by score descending
    const ranked = scoredModes.sort((a, b) => b.score - a.score);

    // Filter out logically impossible/highly penalized options unless there's no choice
    const validRecommendations = ranked.filter(m => m.score > 20);

    return validRecommendations.length > 0 ? validRecommendations : ranked;
  }
};
