import React, { useEffect, useState } from "react";
import { CloudSun, Wind, Droplets, ThermometerSun, Leaf, Car, Zap, Globe, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";
import { useApi } from "../hooks/useApi";

function AnimatedStat({ value, label, icon: Icon, unit, trend, color }) {
  return (
    <div className="glass-card p-6 border-[var(--glass-border)] group relative overflow-hidden">
       <div className="absolute -right-4 -top-4 text-[var(--eco-dark)] opacity-20 group-hover:scale-110 transition-transform duration-700">
          <Icon size={100} />
       </div>
       <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2.5 bg-[var(--eco-dark)] rounded-xl border border-[var(--glass-border)] ${color}`}>
              <Icon size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">{label}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white mono">{value}</span>
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase mono">{unit}</span>
          </div>
          {trend && (
            <div className={`mt-4 text-[10px] font-bold uppercase mono tracking-widest ${trend > 0 ? "text-[var(--eco-neon)]" : "text-[var(--eco-danger)]"}`}>
              {trend > 0 ? '↓' : '↑'} {Math.abs(trend)}% vs Previous
            </div>
          )}
       </div>
    </div>
  );
}

export default function LiveImpact() {
  const envApi = useApi(api.liveEnvironment);

  useEffect(() => {
    envApi.execute();
  }, []);

  if (envApi.loading) return <div className="h-64 bg-[var(--eco-dark)] animate-pulse rounded-3xl border border-[var(--glass-border)]"></div>;
  if (envApi.error) return (
    <div className="glass-card p-8 border-red-500/30 text-center flex flex-col items-center justify-center h-64">
      <h3 className="text-red-400 font-bold mb-2 uppercase tracking-widest">Sensor Uplink Failed</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">{envApi.error.message || 'Failed to sync environmental data.'}</p>
      <button onClick={() => envApi.execute()} className="btn-primary">Retry Uplink</button>
    </div>
  );
  if (!envApi.data) return null;
  const env = envApi.data;

  return (
    <div className="space-y-12 pb-20">
      <div>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-[var(--eco-neon)] mono text-[10px] uppercase tracking-[0.3em] mb-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--eco-neon)] animate-pulse" />
          Planet Health Uplink
        </motion.div>
        <h1 className="text-4xl md:text-5xl">Live <span className="text-[var(--text-muted)]">Impact</span></h1>
        <p className="text-[var(--text-secondary)] mt-4 max-w-2xl">Real-time planetary metrics and your community's collective offset data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedStat value={env.aqi} label="Air Quality" icon={Wind} unit="AQI" trend={5} color="text-[var(--eco-electric)]" />
        <AnimatedStat value={env.co2_ppm.toFixed(1)} label="CO₂ Density" icon={CloudSun} unit="ppm" trend={-1.2} color="text-[var(--eco-aurora-2)]" />
        <AnimatedStat value={env.temperature_c} label="Local Temp" icon={ThermometerSun} unit="°C" color="text-[var(--eco-sun)]" />
        <AnimatedStat value="45" label="Humidity" icon={Droplets} unit="%" color="text-[var(--eco-mint)]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bento-card bg-gradient-to-br from-[var(--eco-surface)] to-[var(--eco-darkest)] border-[var(--eco-electric)]/30 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
             <Leaf size={400} />
          </div>
          <div className="relative z-10 p-4">
            <h3 className="text-[var(--eco-mint)] font-bold uppercase tracking-[0.3em] text-[10px] mb-4">Milestone Detected</h3>
            <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">Your community offset <span className="text-[var(--eco-neon)]">{env.trees_equivalent}</span> mature trees today.</h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-20 h-20 bg-[var(--eco-black)] rounded-3xl flex items-center justify-center text-4xl border border-[var(--glass-border)] shadow-[0_0_30px_rgba(57,255,20,0.2)]">🌳</div>
              <p className="text-[var(--text-secondary)] text-sm max-w-md">
                This collective effort has prevented approximately {env.trees_equivalent * 0.05} tons of CO₂ from entering the atmosphere. Every action scales.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em] ml-2">Protocol Metrics</h3>
          
          <div className="glass-card p-6 border-[var(--glass-border)] hover:border-[var(--eco-neon)]/30 transition-all">
            <div className="flex justify-between items-end mb-4">
               <div>
                  <Car className="text-[var(--eco-electric)] mb-2" size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Transport Offset</span>
               </div>
               <span className="text-xl font-bold mono">1,240 <span className="text-[10px] text-[var(--text-muted)]">MI</span></span>
            </div>
            <div className="w-full bg-[var(--eco-dark)] h-1.5 rounded-full overflow-hidden">
               <motion.div className="bg-[var(--eco-electric)] h-full" initial={{width:0}} animate={{width:"60%"}} transition={{duration:1.5}} />
            </div>
          </div>

          <div className="glass-card p-6 border-[var(--glass-border)] hover:border-[var(--eco-neon)]/30 transition-all">
            <div className="flex justify-between items-end mb-4">
               <div>
                  <Zap className="text-[var(--eco-sun)] mb-2" size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Energy Grid Sync</span>
               </div>
               <span className="text-xl font-bold mono">450 <span className="text-[10px] text-[var(--text-muted)]">KWH</span></span>
            </div>
            <div className="w-full bg-[var(--eco-dark)] h-1.5 rounded-full overflow-hidden">
               <motion.div className="bg-[var(--eco-sun)] h-full" initial={{width:0}} animate={{width:"45%"}} transition={{duration:1.5, delay:0.2}} />
            </div>
          </div>

          <div className="glass-card p-6 border-[var(--glass-border)] hover:border-[var(--eco-neon)]/30 transition-all">
            <div className="flex justify-between items-end mb-4">
               <div>
                  <Leaf className="text-[var(--eco-mint)] mb-2" size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Waste Recovery</span>
               </div>
               <span className="text-xl font-bold mono">120 <span className="text-[10px] text-[var(--text-muted)]">KG</span></span>
            </div>
            <div className="w-full bg-[var(--eco-dark)] h-1.5 rounded-full overflow-hidden">
               <motion.div className="bg-[var(--eco-mint)] h-full" initial={{width:0}} animate={{width:"80%"}} transition={{duration:1.5, delay:0.4}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
