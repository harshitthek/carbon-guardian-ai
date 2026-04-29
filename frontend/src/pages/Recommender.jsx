import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Bot, Clock, CloudRain, ShieldCheck, Zap, ChevronRight, Activity, MapPin, Footprints, Bike, Train, Bus, Users, Car, CarFront } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { LocationInput } from "../components/recommendation/LocationInput";
import { locationService } from "../services/locationService";
import { recommendationEngine } from "../services/recommendationEngine";
import { api } from "../services/api";

const IconMap = {
  Footprints, Bike, Train, Bus, Users, Car, CarFront
};

export default function Recommender() {
  const { profile } = useOutletContext();
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);

  const [routeInfo, setRouteInfo] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionState, setActionState] = useState(null); // 'accepted', 'skipped', null

  // Calculate route and recommendations when source and dest are valid
  useEffect(() => {
    const calculateRoute = async () => {
      if (source && destination && source.lat && destination.lat) {
        setLoading(true);
        setActionState(null);
        try {
          // Get real distance/time from OSRM
          const route = await locationService.getRoute(source, destination);
          setRouteInfo(route);

          // Get smart recommendations based on distance, user profile, and (mock) weather
          const isBadWeather = false; // Could be connected to real weather API
          const recs = recommendationEngine.generateRecommendations(route.distanceKm, route.durationMins, isBadWeather);
          setRecommendations(recs);
        } catch (error) {
          console.error("Failed to generate route recommendations", error);
        } finally {
          setLoading(false);
        }
      }
    };
    calculateRoute();
  }, [source, destination]);

  const handleAction = async (accepted, selectedMode) => {
    setActionState(accepted ? 'accepted' : 'skipped');
    try {
      // Mock tracking API call
      await api.feedback({
        user_id: profile?.id || 1,
        recommendation_id: selectedMode?.id || "skipped",
        accepted,
        action_taken: accepted ? selectedMode?.id : "none"
      });

      // Clear after delay
      setTimeout(() => {
        setActionState(null);
        setSource(null);
        setDestination(null);
        setRecommendations([]);
      }, 3000);
    } catch (e) {
      console.error(e);
      setTimeout(() => setActionState(null), 2000);
    }
  };

  const getBestRecommendation = () => recommendations.length > 0 ? recommendations[0] : null;
  const bestRec = getBestRecommendation();

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="text-center space-y-3 max-w-2xl mx-auto mb-10">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Bot size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Smart Trip Planner</h1>
        <p className="text-slate-500 text-lg">Enter your destination to get AI-optimized transport recommendations based on emissions, time, and your habits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Input & Context */}
        <div className="space-y-6">
          <LocationInput
             onSourceChange={setSource}
             onDestinationChange={setDestination}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col gap-1 text-slate-600">
              <div className="flex items-center gap-2"><Clock size={16} className="text-indigo-500" /><span className="text-xs font-semibold text-slate-500 uppercase">Time</span></div>
              <p className="font-semibold text-lg text-slate-800">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col gap-1 text-slate-600">
              <div className="flex items-center gap-2"><CloudRain size={16} className="text-sky-500" /><span className="text-xs font-semibold text-slate-500 uppercase">Weather</span></div>
              <p className="font-semibold text-lg text-slate-800">Clear</p>
            </div>
          </div>

          {routeInfo && !loading && (
            <Card className="p-4 border-emerald-100 bg-emerald-50/50">
               <h4 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-2"><Activity size={16}/> Trip Overview</h4>
               <div className="flex justify-between items-center text-sm text-slate-700">
                 <span>Distance: <b className="text-emerald-700">{routeInfo.distanceKm.toFixed(1)} km</b></span>
                 <span>Est. Drive: <b className="text-emerald-700">{Math.round(routeInfo.durationMins)} min</b></span>
               </div>
            </Card>
          )}
        </div>

        {/* Right Column - Recommendations */}
        <div className="lg:col-span-2 relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {!source || !destination ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-slate-400"
              >
                <MapPin size={48} className="mb-4 text-slate-300" />
                <p>Enter your start and end points to see recommendations</p>
              </motion.div>
            ) : loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm"
              >
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 animate-pulse font-medium">Analyzing routes & optimizing for low carbon...</p>
              </motion.div>
            ) : actionState ? (
               <motion.div
                 key="action"
                 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                 className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm"
               >
                 {actionState === 'accepted' ? (
                   <>
                     <ShieldCheck size={64} className="text-emerald-500 mb-4" />
                     <h3 className="text-2xl font-bold text-slate-800">Great Choice!</h3>
                     <p className="text-slate-500 mt-2 text-center max-w-sm">You are saving valuable CO₂ emissions today. Journey safely!</p>
                   </>
                 ) : (
                   <>
                     <Activity size={64} className="text-slate-400 mb-4" />
                     <h3 className="text-xl font-bold text-slate-800">Route Skipped</h3>
                     <p className="text-slate-500 mt-2">Ready for your next destination.</p>
                   </>
                 )}
               </motion.div>
            ) : bestRec ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Top Recommended Mode */}
                <Card className="overflow-hidden border-2 border-emerald-500 shadow-lg bg-white relative">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                    <Zap size={12} fill="currentColor" /> BEST CHOICE
                  </div>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            {React.createElement(IconMap[bestRec.icon] || CarFront, { size: 24 })}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-slate-800">{bestRec.name}</h3>
                            <p className="text-slate-500 text-sm">AI Confidence: <b className="text-emerald-600">{bestRec.score}%</b></p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                           <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                             <span className="text-slate-400 text-xs block mb-1">Time</span>
                             <span className="font-semibold text-slate-800">{bestRec.estimatedTimeMins} min</span>
                           </div>
                           <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                             <span className="text-slate-400 text-xs block mb-1">Emissions</span>
                             <span className="font-semibold text-emerald-600">{bestRec.estimatedEmissions}g CO₂</span>
                           </div>
                           <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                             <span className="text-slate-400 text-xs block mb-1">Est. Cost</span>
                             <span className="font-semibold text-slate-800">${bestRec.estimatedCost}</span>
                           </div>
                        </div>

                        <p className="text-sm text-slate-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100 mb-6">
                          <strong className="text-emerald-800 block mb-1">Why this option?</strong>
                          Based on distance, estimated time, and zero emissions, this is the most optimal route for your current trip.
                        </p>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAction(true, bestRec)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2"
                          >
                            Accept Mode <ChevronRight size={18} />
                          </button>
                          <button
                            onClick={() => handleAction(false, null)}
                            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            Skip
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Other Options */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider ml-1">Alternative Options</h4>
                  {recommendations.slice(1, 4).map((rec, i) => (
                    <div key={rec.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between group hover:border-emerald-300 transition-colors cursor-pointer" onClick={() => handleAction(true, rec)}>
                      <div className="flex items-center gap-4">
                        <div className="text-slate-400 group-hover:text-emerald-500 transition-colors">
                          {React.createElement(IconMap[rec.icon] || CarFront, { size: 20 })}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{rec.name}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                            <span>{rec.estimatedTimeMins} min</span>
                            <span>•</span>
                            <span className={rec.estimatedEmissions > 100 ? "text-amber-600" : "text-emerald-600"}>{rec.estimatedEmissions}g CO₂</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="text-sm font-bold text-slate-800">${rec.estimatedCost}</div>
                         <div className="text-xs text-slate-400">Score: {rec.score}</div>
                      </div>
                    </div>
                  ))}
                </div>

              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
