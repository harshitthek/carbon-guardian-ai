import React, { useState, useEffect } from "react";
import { CheckSquare, Play, RefreshCw, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { api } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

export default function Simulation() {
  const [scenarioId, setScenarioId] = useState("ev_adoption_30");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Custom interactive sliders for the "What if" tool
  const [sliders, setSliders] = useState({
    ev: 30,
    solar: 20,
    plastic: 50
  });

  const runSimulation = async () => {
    setLoading(true);
    setResult(null);
    try {
      // In a real app we'd send the slider values, here we just pick a scenario based on the highest slider to simulate dynamic behavior with mock data
      let sid = "ev_adoption_30";
      if (sliders.solar > 40) sid = "solar_grid_50";
      if (sliders.plastic > 80) sid = "zero_plastic_week";

      const res = await api.simulation(sid);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  // Run initial simulation
  useEffect(() => {
    runSimulation();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <CheckSquare className="text-emerald-500" /> Simulation Lab
          </h1>
          <p className="text-slate-500 mt-2">Adjust the parameters below to see projected environmental impacts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Controls Panel */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6 space-y-8">

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-700 flex items-center gap-2">🚗 EV Adoption Rate</label>
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md text-sm">{sliders.ev}%</span>
                </div>
                <Slider
                  value={[sliders.ev]}
                  onValueChange={(v) => setSliders(s => ({...s, ev: v[0]}))}
                  max={100} step={5}
                  className="py-4"
                />
                <p className="text-xs text-slate-500">Percentage of community switching to electric vehicles.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-700 flex items-center gap-2">☀️ Solar Grid Power</label>
                  <span className="text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-md text-sm">{sliders.solar}%</span>
                </div>
                <Slider
                  value={[sliders.solar]}
                  onValueChange={(v) => setSliders(s => ({...s, solar: v[0]}))}
                  max={100} step={10}
                  className="py-4"
                />
                <p className="text-xs text-slate-500">Percentage of campus power coming from solar.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-700 flex items-center gap-2">♻️ Plastic Reduction</label>
                  <span className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-md text-sm">{sliders.plastic}%</span>
                </div>
                <Slider
                  value={[sliders.plastic]}
                  onValueChange={(v) => setSliders(s => ({...s, plastic: v[0]}))}
                  max={100} step={10}
                  className="py-4"
                />
                <p className="text-xs text-slate-500">Reduction in single-use plastic consumption.</p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={runSimulation}
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                  Run Simulation
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7">
          <Card className="h-full shadow-sm border-slate-200 overflow-hidden relative min-h-[400px] flex flex-col">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-2">
              <BarChart3 className="text-slate-500" size={20} />
              <h3 className="font-semibold text-slate-700">Projected Outcomes (1 Year)</h3>
            </div>

            <CardContent className="flex-1 p-8 flex flex-col justify-center relative">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10"
                  >
                    <RefreshCw size={40} className="text-emerald-500 animate-spin mb-4" />
                    <p className="text-slate-500 font-medium animate-pulse">Calculating complex environmental models...</p>
                  </motion.div>
                ) : result ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8"
                  >
                    <div className="text-center mb-8">
                      <p className="text-slate-500 uppercase tracking-widest text-xs font-bold mb-2">Scenario Focus</p>
                      <h2 className="text-2xl font-bold text-slate-800">{result.description}</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="bg-emerald-50 rounded-2xl p-6 text-center border border-emerald-100 shadow-sm">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-3 shadow-sm text-xl">☁️</div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">CO₂ Reduced</p>
                        <p className="text-2xl font-black text-emerald-700">{(result.co2_reduced_kg / 1000).toFixed(1)}k <span className="text-sm font-normal">kg</span></p>
                      </div>

                      <div className="bg-sky-50 rounded-2xl p-6 text-center border border-sky-100 shadow-sm">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-sky-600 mx-auto mb-3 shadow-sm text-xl">🌬️</div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">AQI Improved</p>
                        <p className="text-2xl font-black text-sky-700">{result.aqi_improvement_percent}%</p>
                      </div>

                      <div className="bg-amber-50 rounded-2xl p-6 text-center border border-amber-100 shadow-sm">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-amber-600 mx-auto mb-3 shadow-sm text-xl">🌡️</div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Temp Dropped</p>
                        <p className="text-2xl font-black text-amber-700">-{result.temp_reduction_c}°C</p>
                      </div>
                    </div>

                    <div className="bg-slate-900 text-white p-6 rounded-2xl flex items-center gap-4 mt-8">
                      <div className="text-4xl">💡</div>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        This projection shows that even small behavioral shifts at scale can create measurable drops in local temperature and air pollution.
                      </p>
                    </div>

                  </motion.div>
                ) : null}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
