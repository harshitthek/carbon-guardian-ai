import React, { useEffect, useState, useRef } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { Car, Zap, Leaf, TrendingUp, Bot, MapPin, Wind, Thermometer, Flame, History, ChevronRight } from "lucide-react";
import { api } from "../services/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, useInView, useAnimation } from "framer-motion";
import { locationService } from "../services/locationService";

const Counter = ({ value, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const numericValue = parseFloat(value) || 0;

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = numericValue;
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, numericValue]);

  return (
    <span ref={ref} className="stat-number">
      {count % 1 === 0 ? count : count.toFixed(1)}{suffix}
    </span>
  );
};

function StatCard({ title, value, suffix, icon: Icon, color }) {
  return (
    <div className="glass-card p-6 border-[var(--glass-border)] group hover:border-[var(--eco-neon)] transition-all duration-500">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-[var(--eco-dark)] rounded-xl border border-[var(--glass-border)] group-hover:bg-[var(--eco-surface)] transition-colors">
          <Icon className={color} size={20} />
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-bold">{title}</p>
      </div>
      <div className="text-3xl font-bold text-white mono">
        <Counter value={value} suffix={suffix} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { profile } = useOutletContext();
  const [environment, setEnvironment] = useState(null);
  const [city, setCity] = useState("Detecting...");

  useEffect(() => {
    api.liveEnvironment().then(setEnvironment);
    
    const detectCity = async () => {
      try {
        const coords = await locationService.getCurrentPosition();
        const cityName = await locationService.getCityName(coords.lat, coords.lon);
        setCity(cityName);
      } catch (error) {
        setCity("Global Citizen");
      }
    };
    detectCity();
  }, []);

  if (!profile || !environment) {
    return (
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-4 h-48 skeleton" />
        <div className="col-span-1 h-32 skeleton" />
        <div className="col-span-1 h-32 skeleton" />
        <div className="col-span-1 h-32 skeleton" />
        <div className="col-span-1 h-32 skeleton" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[var(--glass-border)] pb-8">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-[var(--eco-neon)] mono text-[10px] uppercase tracking-[0.3em] mb-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--eco-neon)] animate-pulse" />
            Active Session
          </motion.div>
          <h2 className="text-4xl md:text-5xl">Guardian <span className="text-[var(--text-muted)]">/</span> {profile.name}</h2>
        </div>

        <div className="glass-card flex items-center gap-6 px-6 py-3 border-[var(--glass-border)]">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
            <MapPin size={14} className="text-[var(--eco-mint)]" /> {city}
          </div>
          <div className="h-4 w-[1px] bg-[var(--glass-border)]" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Wind size={14} className="text-[var(--eco-electric)]" />
              <span className="text-xs font-bold mono">{environment.aqi} AQI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Thermometer size={14} className="text-[var(--eco-sun)]" />
              <span className="text-xs font-bold mono">{environment.temperature_c}°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="bento-grid">
        {/* Main Chart Card */}
        <div className="bento-card col-span-4 lg:col-span-2 row-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl flex items-center gap-2">
              <TrendingUp className="text-[var(--eco-electric)]" size={20} />
              Emissions Trend
            </h3>
            <div className="px-3 py-1 bg-[var(--eco-dark)] rounded-full text-[10px] font-bold text-[var(--eco-mint)] border border-[var(--glass-border)]">
              -12.4% vs Last Week
            </div>
          </div>
          
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profile.weekly_trend}>
                <defs>
                  <linearGradient id="ecoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--eco-neon)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--eco-neon)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(57,255,20,0.05)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Space Mono'}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Space Mono'}} 
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(26,59,29,0.95)', 
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    fontFamily: 'Space Mono',
                    fontSize: '12px',
                    color: 'white'
                  }}
                  itemStyle={{ color: 'var(--eco-neon)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="co2" 
                  stroke="var(--eco-neon)" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#ecoGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Section */}
        <div className="col-span-4 lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Travel Saved" value="12.4" suffix="kg" icon={Car} color="text-[var(--eco-electric)]" />
          <StatCard title="Energy Saved" value="3.6" suffix="kWh" icon={Zap} color="text-[var(--eco-sun)]" />
          <StatCard title="Waste Reduced" value="1.2" suffix="kg" icon={Leaf} color="text-[var(--eco-mint)]" />
        </div>

        {/* AI Action Card */}
        <div className="bento-card col-span-4 lg:col-span-2 bg-gradient-to-br from-[var(--eco-surface)] to-[var(--eco-darkest)] border-[var(--eco-electric)]/30 group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-[var(--eco-black)] rounded-2xl border border-[var(--glass-border)]">
              <Bot className="text-[var(--eco-neon)]" size={24} />
            </div>
            <div className="px-3 py-1 bg-[var(--eco-neon)] text-[var(--eco-black)] text-[10px] font-bold rounded-full">
              OPTIMIZATION AVAILABLE
            </div>
          </div>
          <h4 className="text-2xl mb-2">Switch to Metro</h4>
          <p className="text-[var(--text-secondary)] text-sm mb-6">
            Traffic on your regular route is 40% higher than usual. Taking the metro will save 2.4kg CO₂ and 15 mins.
          </p>
          <Link to="/app/recommender" className="btn-primary w-full group">
            Optimize Route <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Streak & Activity */}
        <div className="bento-card col-span-4 lg:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <Flame className="text-orange-500" size={20} />
            <h4 className="text-lg">Consistency</h4>
          </div>
          <div className="text-5xl font-bold mono mb-2">12 <span className="text-sm text-[var(--text-muted)] uppercase">Days</span></div>
          <p className="text-xs text-[var(--text-muted)]">Top 5% of Guardians this month.</p>
        </div>

        {/* Footprint Score */}
        <div className="bento-card col-span-4 lg:col-span-1 flex flex-col items-center justify-center text-center">
           <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="58" fill="none" stroke="var(--eco-dark)" strokeWidth="8" />
                <motion.circle
                  cx="64" cy="64" r="58" fill="none" stroke="var(--eco-electric)" strokeWidth="8"
                  strokeDasharray="364.4"
                  initial={{ strokeDashoffset: 364.4 }}
                  animate={{ strokeDashoffset: 364.4 * (1 - 620/1000) }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold mono text-white">620</span>
                <span className="text-[8px] text-[var(--eco-neon)] font-bold tracking-widest uppercase">Excellent</span>
              </div>
           </div>
           <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Sustainability Score</p>
        </div>

        {/* Activity Timeline */}
        <div className="bento-card col-span-4 lg:col-span-4">
           <div className="flex items-center gap-3 mb-8">
              <History className="text-[var(--eco-aurora-1)]" size={20} />
              <h4 className="text-xl">Recent Protocol Execution</h4>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Metro Shift", desc: "Saved 2.4kg CO₂", time: "2h ago", points: "+15" },
                { title: "Grid Sync", desc: "Renewable energy usage", time: "Yesterday", points: "+50" },
                { title: "Goal Met", desc: "Weekly limit maintained", time: "2d ago", points: "+100" }
              ].map((act, i) => (
                <div key={i} className="flex gap-4 items-center p-4 bg-[var(--eco-dark)] rounded-2xl border border-[var(--glass-border)]">
                   <div className="w-2 h-2 rounded-full bg-[var(--eco-neon)] shadow-[0_0_10px_rgba(57,255,20,0.5)]" />
                   <div className="flex-1">
                      <div className="flex justify-between">
                         <span className="text-sm font-bold">{act.title}</span>
                         <span className="text-xs font-bold text-[var(--eco-electric)] mono">{act.points}</span>
                      </div>
                      <div className="flex justify-between items-end mt-1">
                         <span className="text-[10px] text-[var(--text-muted)]">{act.desc}</span>
                         <span className="text-[8px] text-[var(--text-muted)] uppercase mono">{act.time}</span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
