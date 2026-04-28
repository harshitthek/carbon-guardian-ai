import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Zap, Coffee, Trash2, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

const iconMap = {
  Transport: <Car size={18} />,
  Electricity: <Zap size={18} />,
  Food: <Coffee size={18} />,
  Waste: <Trash2 size={18} />
};

export default function Footprint() {
  const { profile } = useOutletContext();
  const [activeTab, setActiveTab] = useState("breakdown");

  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">My Footprint</h1>
        <p className="text-slate-500 mt-1">Analyze your carbon emissions and discover areas for improvement.</p>
      </div>

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

      <Tabs defaultValue="breakdown" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="breakdown">Category Breakdown</TabsTrigger>
          <TabsTrigger value="trends">Historical Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="mt-0">
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

        <TabsContent value="trends" className="mt-0">
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Trends placeholder</CardTitle>
              <CardDescription>View historical data (Refer to dashboard for chart implementation)</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center bg-slate-50 rounded-lg m-6 border border-dashed border-slate-200">
               <span className="text-slate-400">Historical chart view</span>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
