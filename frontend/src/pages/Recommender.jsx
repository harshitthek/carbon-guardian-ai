import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Bot, MapPin, Clock, CloudRain, CheckCircle2, XCircle, ChevronRight, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

export default function Recommender() {
  const { profile } = useOutletContext();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState(null); // 'accepted', 'skipped', null

  const fetchRecommendation = async () => {
    setLoading(true);
    setActionState(null);
    try {
      const rec = await api.recommend({
        user_id: profile?.id || 1,
        time_of_day: new Date().getHours(),
        location_aqi: 118,
        weather_temp: 32
      });
      setRecommendation(rec);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendation();
  }, []);

  const handleAction = async (accepted) => {
    setActionState(accepted ? 'accepted' : 'skipped');
    try {
      await api.feedback({
        user_id: profile?.id || 1,
        recommendation_id: recommendation.id,
        accepted,
        action_taken: accepted ? recommendation.type : "none"
      });

      // Fetch new recommendation after short delay to show success state
      setTimeout(fetchRecommendation, 2000);
    } catch (e) {
      console.error(e);
      setTimeout(fetchRecommendation, 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="text-center space-y-3 max-w-2xl mx-auto mb-10">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Bot size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">AI Recommender</h1>
        <p className="text-slate-500 text-lg">Smart suggestions tailored to your habits, current weather, and local environment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3 text-slate-600">
          <Clock className="text-indigo-500" />
          <div><p className="text-xs text-slate-400">Time</p><p className="font-semibold">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p></div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3 text-slate-600">
          <MapPin className="text-rose-500" />
          <div><p className="text-xs text-slate-400">Location Status</p><p className="font-semibold">Delhi (AQI 118)</p></div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3 text-slate-600">
          <CloudRain className="text-sky-500" />
          <div><p className="text-xs text-slate-400">Weather</p><p className="font-semibold">32°C, Clear</p></div>
        </div>
      </div>

      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 animate-pulse">Analyzing context & generating suggestion...</p>
            </motion.div>
          ) : actionState ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm"
            >
              {actionState === 'accepted' ? (
                <>
                  <CheckCircle2 size={64} className="text-emerald-500 mb-4" />
                  <h3 className="text-xl font-bold text-slate-800">Challenge Accepted!</h3>
                  <p className="text-slate-500 mt-2">+50 Green Points added</p>
                </>
              ) : (
                <>
                  <XCircle size={64} className="text-slate-400 mb-4" />
                  <h3 className="text-xl font-bold text-slate-800">Suggestion Skipped</h3>
                  <p className="text-slate-500 mt-2">We'll find something better next time.</p>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="card"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}
              className="w-full"
            >
              <Card className="overflow-hidden border-0 shadow-xl bg-white">
                <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-5">

                    <div className="p-8 md:col-span-3">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full mb-6 uppercase tracking-wider">
                        <Zap size={14} fill="currentColor" /> AI Prediction
                      </div>

                      <h2 className="text-slate-500 text-lg mb-2">{recommendation.prediction}</h2>
                      <h3 className="text-3xl font-bold text-slate-800 mb-6 leading-tight">{recommendation.recommendation}</h3>

                      <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mb-8">
                        <p className="font-semibold text-slate-700 mb-2 text-sm">Why this recommendation?</p>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          Based on your previous travel patterns, you usually take a cab at this hour. Switching to the metro reduces local congestion and drastically cuts your daily footprint. Traffic is currently heavy.
                        </p>
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={() => handleAction(true)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          Accept Action <ChevronRight size={18} />
                        </button>
                        <button
                          onClick={() => handleAction(false)}
                          className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        >
                          Skip
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-8 md:col-span-2 flex flex-col justify-center items-center text-center border-l border-slate-100">
                      <div className="relative w-32 h-32 mb-6">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="56" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                          <circle
                            cx="64" cy="64" r="56" fill="none" stroke="#10b981" strokeWidth="12"
                            strokeDasharray="351.858" strokeDashoffset={351.858 * (1 - recommendation.impact_percent/100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-emerald-600">{recommendation.impact_percent}%</span>
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-800 mb-1">Impact Score</h4>
                      <p className="text-sm text-slate-500 mb-6">High reduction in daily emissions</p>

                      <div className="w-full bg-white rounded-lg p-3 border border-slate-200 text-sm text-slate-600 flex justify-between">
                        <span>AI Confidence</span>
                        <span className="font-bold text-slate-800">{(recommendation.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
