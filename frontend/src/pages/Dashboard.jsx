import React, { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { Car, Zap, Leaf, TrendingUp, Bot, MapPin, Wind, Thermometer, Flame, History } from "lucide-react";
import { api } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { locationService } from "../services/locationService";

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
  const [city, setCity] = useState("Detecting Location...");

  useEffect(() => {
    api.liveEnvironment().then(setEnvironment);

    // Auto-detect user's current city
    const detectCity = async () => {
      try {
        const coords = await locationService.getCurrentPosition();
        const cityName = await locationService.getCityName(coords.lat, coords.lon);
        setCity(cityName);
      } catch (error) {
        console.warn("Location detection failed:", error);
        setCity("Unknown City");
      }
    };
    detectCity();
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
      <div className="bg-emerald-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Good Morning, {profile.name}! 👋</h2>
          <p className="text-emerald-100/90 text-lg max-w-xl mb-4 md:mb-0">Together, let’s build a cooler and greener planet. Here is your impact overview for today.</p>
        </div>

        {/* Real-time Location Weather/AQI Widget inside Header */}
        <div className="relative z-10 bg-emerald-800/50 backdrop-blur-md border border-emerald-700/50 rounded-xl p-4 min-w-[250px]">
           <div className="flex items-center gap-2 text-emerald-100 mb-3 border-b border-emerald-700/50 pb-2">
             <MapPin size={16} />
             <span className="font-semibold text-sm">{city}</span>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-emerald-300 block mb-1">Air Quality</span>
                <div className="flex items-center gap-1.5"><Wind size={16} className="text-amber-400"/> <span className="font-bold">{environment.aqi}</span></div>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-emerald-300 block mb-1">Temperature</span>
                <div className="flex items-center gap-1.5"><Thermometer size={16} className="text-rose-400"/> <span className="font-bold">{environment.temperature_c}°C</span></div>
              </div>
           </div>
        </div>

        {/* Abstract shapes */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute left-1/2 bottom-0 w-40 h-40 bg-teal-400 rounded-full blur-2xl opacity-20 translate-y-1/4"></div>
      </div>

      {/* Daily Challenges & Streaks Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-100">
           <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-full"><Flame size={20} /></div>
              <div>
                <p className="text-xs text-orange-600 font-semibold uppercase tracking-wider">Current Streak</p>
                <p className="text-2xl font-bold text-slate-800">12 Days</p>
              </div>
           </CardContent>
        </Card>

        <Card className="md:col-span-3 border-slate-200">
          <CardContent className="p-4 flex flex-col justify-center h-full">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Bot size={16} className="text-emerald-500"/> Daily Eco Challenge</p>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">50 Pts</span>
            </div>
            <p className="text-slate-600 text-sm mb-3">Use zero-emission transport (walk or cycle) for a trip under 3km today.</p>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 text-right">0 / 1 Trips Completed</p>
          </CardContent>
        </Card>
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
             <h3 className="text-lg font-bold text-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2"><Bot className="text-emerald-500" size={20} /> AI Suggestion</div>
              <Link to="/recommender" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">Open Planner &rarr;</Link>
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
                <Link to="/recommender" className="block text-center w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm">
                  Plan my Route
                </Link>
                <button
                  onClick={(e) => e.target.parentElement.parentElement.parentElement.style.display = 'none'}
                  className="w-full bg-white hover:bg-slate-50 text-slate-600 font-medium py-2.5 rounded-lg transition-colors border border-slate-200"
                >
                  Dismiss
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Timeline */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700"><History size={16}/> Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "Completed Metro Trip", desc: "Saved 2.4kg CO₂", time: "2 hours ago", points: "+15" },
                  { title: "Joined Tree Plantation", desc: "Green Campus Initiative", time: "Yesterday", points: "+50" },
                  { title: "Reached Weekly Goal", desc: "Under 50kg emissions", time: "2 days ago", points: "+100" }
                ].map((act, i) => (
                  <div key={i} className="flex gap-3 items-start relative pb-4 last:pb-0">
                    {i !== 2 && <div className="absolute left-[5px] top-6 bottom-0 w-[2px] bg-slate-100 z-0"></div>}
                    <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 shrink-0 z-10 border-2 border-white shadow-sm"></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-semibold text-slate-800">{act.title}</p>
                        <span className="text-xs font-bold text-emerald-600">{act.points}</span>
                      </div>
                      <p className="text-xs text-slate-500">{act.desc}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
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
