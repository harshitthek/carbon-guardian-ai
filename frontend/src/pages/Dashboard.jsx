import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Car, Zap, Leaf, TrendingUp, Bot } from "lucide-react";
import { api } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

function StatCard({ title, value, icon: Icon, colorClass }) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-4 rounded-full ${colorClass} bg-opacity-10`}>
          <Icon className={colorClass.replace("bg-", "text-")} size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { profile } = useOutletContext();
  const [environment, setEnvironment] = useState(null);

  useEffect(() => {
    api.liveEnvironment().then(setEnvironment);
  }, []);

  if (!profile || !environment) {
    return <div className="animate-pulse space-y-4">
      <div className="h-32 bg-slate-200 rounded-xl"></div>
      <div className="grid grid-cols-3 gap-4"><div className="h-24 bg-slate-200 rounded-xl"></div><div className="h-24 bg-slate-200 rounded-xl"></div><div className="h-24 bg-slate-200 rounded-xl"></div></div>
    </div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Hero Welcome */}
      <div className="bg-emerald-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Good Morning, {profile.name}! 👋</h2>
          <p className="text-emerald-100/90 text-lg max-w-xl">Together, let’s build a cooler and greener planet. Here is your impact overview for today.</p>
        </div>

        {/* Abstract shapes */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute right-10 bottom-0 w-40 h-40 bg-teal-400 rounded-full blur-2xl opacity-20 translate-y-1/4"></div>
      </div>

      {/* Live Environment Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <span className="text-slate-500 font-medium">City AQI</span>
          <span className="text-xl font-bold text-amber-500">{environment.aqi} <span className="text-sm font-normal text-slate-400">Moderate</span></span>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <span className="text-slate-500 font-medium">CO₂ in Air</span>
          <span className="text-xl font-bold text-slate-700">{environment.co2_ppm} <span className="text-sm font-normal text-slate-400">ppm</span></span>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <span className="text-slate-500 font-medium">Temperature</span>
          <span className="text-xl font-bold text-slate-700">{environment.temperature_c}°C</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Today's Impact */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="text-emerald-500" size={20} />
            Today's Impact
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Travel Saved" value="12.4 kg" icon={Car} colorClass="bg-emerald-500 text-emerald-600" />
            <StatCard title="Energy Saved" value="3.6 kWh" icon={Zap} colorClass="bg-amber-500 text-amber-600" />
            <StatCard title="Waste Reduced" value="1.2 kg" icon={Leaf} colorClass="bg-teal-500 text-teal-600" />
          </div>

          {/* Chart */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800 text-base">Weekly CO₂ Emissions (kg)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={profile.weekly_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCo2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendation Sidebar */}
        <div className="space-y-6">
           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Bot className="text-emerald-500" size={20} />
            AI Suggestion
          </h3>
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Bot size={100} />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="inline-block px-3 py-1 bg-white text-emerald-700 text-xs font-bold rounded-full mb-4 shadow-sm">
                High Impact Action
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2 leading-tight">Switch to Metro today</h4>
              <p className="text-slate-600 text-sm mb-6">Traffic is heavy and AQI is moderate. Taking the metro will save 2.4kg of CO₂.</p>

              <div className="space-y-3">
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm">
                  Accept Challenge (+50 Pts)
                </button>
                <button className="w-full bg-white hover:bg-slate-50 text-slate-600 font-medium py-2.5 rounded-lg transition-colors border border-slate-200">
                  Maybe Later
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Gauge placeholder */}
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="text-sm font-medium text-slate-500 mb-4">Current Footprint Score</div>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                  <motion.circle
                    cx="64" cy="64" r="56" fill="none" stroke="#10b981" strokeWidth="12"
                    strokeDasharray="351.858"
                    initial={{ strokeDashoffset: 351.858 }}
                    animate={{ strokeDashoffset: 351.858 * (1 - 620/1000) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-800">620</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide">Excellent</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
