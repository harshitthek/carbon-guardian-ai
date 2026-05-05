import React, { useState, useEffect } from "react";
import { CheckSquare, Play, RefreshCw, BarChart3, FlaskConical, Zap, Car, Recycle, Info } from "lucide-react";
import { api } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

export default function Simulation() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [sliders, setSliders] = useState({
    ev: 30,
    solar: 20,
    plastic: 50
  });

  const runSimulation = async () => {
    setLoading(true);
    setResult(null);
    try {
      let sid = "ev_adoption_30";
      if (sliders.solar > 40) sid = "solar_grid_50";
      if (sliders.plastic > 80) sid = "zero_plastic_week";

      const res = await api.simulation(sid);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  const ControlGroup = ({ label, value, onChange, icon: Icon, color, desc }) => (
    <div className="space-y-4 glass-card p-6 border-[var(--glass-border)]">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center gap-2">
          <Icon size={14} className={color} /> {label}
        </label>
        <span className={`mono font-bold text-sm ${color}`}>{value}%</span>
      </div>
      <input 
        type="range"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-[var(--eco-dark)] rounded-lg appearance-none cursor-pointer accent-[var(--eco-neon)]"
      />
      <p className="text-[10px] text-[var(--text-muted)] mono leading-relaxed uppercase tracking-widest">{desc}</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-[var(--eco-neon)] mono text-[10px] uppercase tracking-[0.3em] mb-2"
          >
            <FlaskConical size={14} />
            Environmental R&D Lab
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold">Impact <span className="text-[var(--text-muted)]">Simulator</span></h1>
          <p className="text-[var(--text-secondary)] mt-4 max-w-xl">Model potential futures by adjusting key environmental parameters. AI-driven projections.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            <ControlGroup 
              label="EV Transition" 
              value={sliders.ev} 
              onChange={(v) => setSliders(s => ({...s, ev: v}))}
              icon={Car}
              color="text-[var(--eco-electric)]"
              desc="Community shift to electric transport protocols."
            />
            <ControlGroup 
              label="Solar Integration" 
              value={sliders.solar} 
              onChange={(v) => setSliders(s => ({...s, solar: v}))}
              icon={Zap}
              color="text-[var(--eco-sun)]"
              desc="Renewable energy contribution to the local grid."
            />
            <ControlGroup 
              label="Waste Recovery" 
              value={sliders.plastic} 
              onChange={(v) => setSliders(s => ({...s, plastic: v}))}
              icon={Recycle}
              color="text-[var(--eco-mint)]"
              desc="Efficiency of waste management and recycling systems."
            />
          </div>

          <button
            onClick={runSimulation}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-3 py-5"
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Play size={20} />}
            Execute Model Projection
          </button>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7">
          <div className="h-full glass-card border-[var(--glass-border)] min-h-[500px] flex flex-col relative overflow-hidden">
            <div className="bg-white/5 border-b border-[var(--glass-border)] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-[var(--text-muted)]" size={18} />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-secondary)]">Simulation Output v4.6</h3>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[var(--eco-neon)] animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-[var(--eco-electric)] animate-pulse delay-75" />
              </div>
            </div>

            <div className="flex-1 p-8 flex flex-col justify-center relative">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--eco-black)]/40 backdrop-blur-md z-10"
                  >
                    <RefreshCw size={48} className="text-[var(--eco-neon)] animate-spin mb-6" />
                    <p className="text-[var(--eco-neon)] mono text-xs uppercase tracking-[0.2em] animate-pulse">Running Neural Projections...</p>
                  </motion.div>
                ) : result ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="space-y-10"
                  >
                    <div className="text-center">
                      <p className="text-[var(--eco-neon)] mono text-[10px] uppercase tracking-[0.3em] mb-4">Focus Scenario</p>
                      <h2 className="text-3xl font-bold text-white tracking-tight">{result.description}</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="glass-card bg-[var(--eco-dark)]/30 p-6 text-center border-[var(--glass-border)] hover:border-[var(--eco-neon)]/20 transition-all">
                        <div className="w-12 h-12 bg-[var(--eco-dark)] rounded-xl flex items-center justify-center text-[var(--eco-neon)] mx-auto mb-4 border border-[var(--glass-border)] text-xl">☁️</div>
                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mb-2">CO₂ Offset</p>
                        <p className="text-3xl font-bold text-white mono">{(result.co2_reduced_kg / 1000).toFixed(1)}k<span className="text-xs text-[var(--text-muted)] ml-1">KG</span></p>
                      </div>

                      <div className="glass-card bg-[var(--eco-dark)]/30 p-6 text-center border-[var(--glass-border)] hover:border-[var(--eco-electric)]/20 transition-all">
                        <div className="w-12 h-12 bg-[var(--eco-dark)] rounded-xl flex items-center justify-center text-[var(--eco-electric)] mx-auto mb-4 border border-[var(--glass-border)] text-xl">🌬️</div>
                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mb-2">AQI Boost</p>
                        <p className="text-3xl font-bold text-white mono">{result.aqi_improvement_percent}<span className="text-xs text-[var(--text-muted)] ml-1">%</span></p>
                      </div>

                      <div className="glass-card bg-[var(--eco-dark)]/30 p-6 text-center border-[var(--glass-border)] hover:border-[var(--eco-sun)]/20 transition-all">
                        <div className="w-12 h-12 bg-[var(--eco-dark)] rounded-xl flex items-center justify-center text-[var(--eco-sun)] mx-auto mb-4 border border-[var(--glass-border)] text-xl">🌡️</div>
                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mb-2">Thermal Drop</p>
                        <p className="text-3xl font-bold text-white mono">-{result.temp_reduction_c}<span className="text-xs text-[var(--text-muted)] ml-1">°C</span></p>
                      </div>
                    </div>

                    <div className="p-6 bg-[var(--eco-darkest)] border border-[var(--glass-border)] rounded-2xl flex items-start gap-4 shadow-inner">
                      <Info className="text-[var(--eco-neon)] shrink-0 mt-1" size={18} />
                      <p className="text-[var(--text-secondary)] text-xs leading-relaxed mono">
                        [INSIGHT] This projection suggests that systemic adoption of these parameters would lead to a significant stabilization of local atmospheric carbon density within 12 months.
                      </p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
