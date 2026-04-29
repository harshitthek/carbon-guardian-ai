/**
 * Service for interacting with Geolocation and Routing APIs.
 */

export const locationService = {
  /**
   * Gets the user's current location via Browser Geolocation API
   * @returns {Promise<{lat: number, lon: number}>}
   */
  getCurrentPosition: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
          },
          (error) => {
            reject(error);
          }
        );
      }
    });
  },

  /**
   * Reverse geocodes coords to a city name using Nominatim API
   * @param {number} lat
   * @param {number} lon
   * @returns {Promise<string>}
   */
  getCityName: async (lat, lon) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`, {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'CarbonGuardianAI/1.0'
        }
      });
      if (!response.ok) throw new Error("Failed to fetch city name");
      const data = await response.json();
      return data.address.city || data.address.town || data.address.village || data.address.county || "Unknown City";
    } catch (error) {
      console.warn("Geocoding failed, using fallback.", error);
      return "Unknown Location"; // Fallback
    }
  },

  /**
   * Searches for places matching the query string using Nominatim API
   * @param {string} query
   * @returns {Promise<Array<{name: string, lat: number, lon: number}>>}
   */
  searchPlaces: async (query) => {
    if (!query || query.length < 3) return [];
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`, {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'CarbonGuardianAI/1.0'
        }
      });
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      return data.map(item => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      }));
    } catch (error) {
      console.error("Place search failed:", error);
      return []; // Fallback empty
    }
  },

  /**
   * Gets route distance and time between two points using OSRM API (Car routing)
   * @param {{lat: number, lon: number}} start
   * @param {{lat: number, lon: number}} end
   * @returns {Promise<{distanceKm: number, durationMins: number}>}
   */
  getRoute: async (start, end) => {
    try {
      // OSRM requires format: lon,lat;lon,lat
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=false`);
      if (!response.ok) throw new Error("Routing failed");
      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
         throw new Error("No route found");
      }

      const route = data.routes[0];
      return {
        distanceKm: route.distance / 1000, // OSRM returns meters
        durationMins: route.duration / 60  // OSRM returns seconds
      };
    } catch (error) {
      console.warn("OSRM routing failed, using fallback haversine calculation.", error);
      // Fallback: Haversine formula for straight-line distance
      const distanceKm = haversineDistance(start, end);
      return {
        distanceKm: distanceKm,
        durationMins: (distanceKm / 40) * 60 // Assuming 40km/h average speed fallback
      };
    }
  }
};

/**
 * Calculates straight line distance between two lat/lon points.
 */
function haversineDistance(coords1, coords2) {
  function toRad(x) {
    return x * Math.PI / 180;
  }

  var lon1 = coords1.lon;
  var lat1 = coords1.lat;

  var lon2 = coords2.lon;
  var lat2 = coords2.lat;

  var R = 6371; // km

  var x1 = lat2 - lat1;
  var dLat = toRad(x1);
  var x2 = lon2 - lon1;
  var dLon = toRad(x2)
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;

  return d;
}
