import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Zap, Coffee, Trash2, ArrowDown, Target, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const iconMap = {
  Transport: <Car size={18} />,
  Electricity: <Zap size={18} />,
  Food: <Coffee size={18} />,
  Waste: <Trash2 size={18} />
};

export default function ProfilePage() {
  const { profile } = useOutletContext();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (!profile || !user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Profile & Progress</h1>
          <p className="text-slate-500 mt-1">Analyze your long-term stats, eco goals, and footprint history.</p>
        </div>
      </div>

      {/* User Header Card */}
      <Card className="border-none shadow-md bg-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-emerald-600 to-teal-500"></div>
        <CardContent className="p-6 pt-16 relative flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
           <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-lg z-10 shrink-0">
             {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-4xl text-slate-400">{user.name[0]}</span>}
           </div>
           <div className="flex-1 mb-2">
             <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
             <p className="text-slate-500">{user.email}</p>
           </div>
           <div className="flex gap-4 mb-2">
              <div className="text-center md:text-right">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Joined</p>
                <p className="font-semibold text-slate-700">Oct 2023</p>
              </div>
              <div className="w-[1px] bg-slate-200"></div>
              <div className="text-center md:text-right">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Rank</p>
                <p className="font-semibold text-emerald-600">Level {profile.level}</p>
              </div>
           </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-emerald-600 text-white border-none shadow-md md:col-span-1">
          <CardContent className="p-6">
            <p className="text-emerald-100 text-sm font-medium">Daily Average</p>
            <h2 className="text-4xl font-bold mt-2 mb-1">{profile.daily_footprint_kg} <span className="text-xl font-normal">kg</span></h2>
            <div className="flex items-center gap-1 text-emerald-200 text-sm mt-4">
              <ArrowDown size={14} /> 12% vs last week
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center justify-between h-full">
            <div>
              <h3 className="text-lg font-bold text-slate-800">You're doing great!</h3>
              <p className="text-slate-600 mt-1 max-w-md text-sm leading-relaxed">
                Your transport emissions dropped significantly this week. Consider switching to LED bulbs to tackle your electricity footprint next.
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">🌱</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-[400px] grid-cols-3 mb-6 bg-slate-100/50 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
          <TabsTrigger value="goals" className="rounded-lg">Goals</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Emission Sources</CardTitle>
                <CardDescription>Where your carbon footprint comes from.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-8">
                <div className="h-[300px] w-full max-w-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={profile.footprint_breakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1500}
                        animationBegin={200}
                      >
                        {profile.footprint_breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`${value}%`, 'Share']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {profile.footprint_breakdown.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="shadow-sm border-slate-100 hover:border-emerald-200 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-3 rounded-xl" style={{ backgroundColor: `${item.fill}20`, color: item.fill }}>
                        {iconMap[item.name]}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-semibold text-slate-800">{item.name}</h4>
                          <span className="font-bold text-slate-700">{item.value}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: item.fill }}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ duration: 1, delay: i * 0.1 + 0.5 }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="mt-0 space-y-6">
          <Card className="shadow-sm border-slate-200">
             <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Target size={20} className="text-emerald-500" /> Long-term Goals</CardTitle>
                <CardDescription>Your personalized eco-targets</CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
                {[
                  { title: "Reduce Transport Emissions by 30%", target: 30, current: 18, desc: "Use public transport or cycle twice a week." },
                  { title: "Zero Food Waste Month", target: 30, current: 12, desc: "Log 30 days without throwing away edible food." },
                  { title: "Earn 10,000 Green Points", target: 10000, current: profile.green_points, desc: "Participate in campaigns and optimize travel." }
                ].map((goal, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                         <h4 className="font-bold text-slate-800">{goal.title}</h4>
                         <p className="text-sm text-slate-500">{goal.desc}</p>
                       </div>
                       <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{Math.round((goal.current/goal.target)*100)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-3">
                       <div className="bg-emerald-500 h-full rounded-full" style={{width: `${(goal.current/goal.target)*100}%`}}></div>
                    </div>
                  </div>
                ))}
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-0 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Monthly Footprint History</CardTitle>
              <CardDescription>Your progress over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { month: 'Jul', val: 420 }, { month: 'Aug', val: 390 }, { month: 'Sep', val: 450 },
                      { month: 'Oct', val: 380 }, { month: 'Nov', val: 340 }, { month: 'Dec', val: profile.daily_footprint_kg * 30 }
                    ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="val" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
