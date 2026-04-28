import React, { useEffect, useState } from "react";
import { CloudSun, Wind, Droplets, ThermometerSun, Leaf, Car, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { api } from "../services/api";

function AnimatedStat({ value, label, icon: Icon, unit, trend }) {
  return (
    <Card className="overflow-hidden relative bg-white border-slate-200 shadow-sm">
      <div className="absolute -right-6 -top-6 text-slate-50 opacity-50"><Icon size={120} /></div>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-lg"><Icon size={20} /></div>
          <span className="font-semibold text-slate-600">{label}</span>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold text-slate-800">{value}</span>
          <span className="text-lg text-slate-500 mb-1">{unit}</span>
        </div>
        {trend && (
          <div className={`mt-4 text-sm font-medium ${trend > 0 ? "text-emerald-600" : "text-amber-500"}`}>
            {trend > 0 ? '↓' : '↑'} {Math.abs(trend)}% from yesterday
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function LiveImpact() {
  const [env, setEnv] = useState(null);

  useEffect(() => {
    api.liveEnvironment().then(setEnv);
    // Simulate real-time fluctuating data
    const interval = setInterval(() => {
      setEnv(prev => prev ? ({
        ...prev,
        aqi: prev.aqi + (Math.random() > 0.5 ? 1 : -1),
        co2_ppm: prev.co2_ppm + (Math.random() > 0.5 ? 0.5 : -0.5)
      }) : null);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!env) return <div className="animate-pulse h-64 bg-slate-200 rounded-xl"></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
          <CloudSun className="text-emerald-500" /> Live Impact
        </h1>
        <p className="text-slate-500 mt-2">Real-time statistics for {env.city} and your collective impact today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedStat value={env.aqi} label="Air Quality Index" icon={Wind} unit="AQI" trend={5} />
        <AnimatedStat value={env.co2_ppm.toFixed(1)} label="CO₂ Concentration" icon={CloudSun} unit="ppm" trend={1.2} />
        <AnimatedStat value={env.temperature_c} label="Temperature" icon={ThermometerSun} unit="°C" />
        <AnimatedStat value="45" label="Humidity" icon={Droplets} unit="%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="bg-emerald-900 text-white overflow-hidden relative">
          <CardContent className="p-8 relative z-10 h-full flex flex-col justify-center">
            <h3 className="text-emerald-300 font-semibold mb-2">Community Milestone</h3>
            <h2 className="text-4xl font-bold mb-4 leading-tight">Your community offset equivalent to {env.trees_equivalent} mature trees today.</h2>
            <div className="flex items-center gap-4 mt-6">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-3xl backdrop-blur-sm">🌳</div>
              <p className="text-emerald-100 max-w-xs">Trees absorb ~21kg of CO₂ per year. Keep up the good work!</p>
            </div>
          </CardContent>
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
            <Leaf size={300} />
          </div>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Live Counters (Today)</h3>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Car size={24} /></div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">Vehicle Miles Avoided</span>
                <span className="font-bold text-slate-800">1,240 mi</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full"><motion.div className="bg-blue-500 h-full rounded-full" initial={{width:0}} animate={{width:"60%"}} transition={{duration:1}} /></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Zap size={24} /></div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">Clean Energy Generated</span>
                <span className="font-bold text-slate-800">450 kWh</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full"><motion.div className="bg-amber-500 h-full rounded-full" initial={{width:0}} animate={{width:"45%"}} transition={{duration:1, delay:0.2}} /></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><Leaf size={24} /></div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">Waste Diverted</span>
                <span className="font-bold text-slate-800">120 kg</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full"><motion.div className="bg-emerald-500 h-full rounded-full" initial={{width:0}} animate={{width:"80%"}} transition={{duration:1, delay:0.4}} /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
