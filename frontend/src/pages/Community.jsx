import React, { useEffect, useState } from "react";
import { Users, TrendingUp, Medal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../services/api";
import { motion } from "framer-motion";

export default function Community() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    api.leaderboard().then(setLeaderboard);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
          <Users className="text-emerald-500" /> Community
        </h1>
        <p className="text-slate-500 mt-2">See how your community ranks and participate in group challenges.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Your Community Stats */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-gradient-to-b from-emerald-600 to-teal-700 text-white shadow-md border-none relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
              <Users size={100} />
            </div>
            <CardContent className="p-6 text-center relative z-10 pt-10">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 backdrop-blur-sm border border-white/30">
                🌳
              </div>
              <h3 className="text-2xl font-bold mb-1">Your Community</h3>
              <p className="text-emerald-100 text-sm mb-6">Delhi University Campus</p>

              <div className="bg-black/10 rounded-xl p-4 backdrop-blur-md">
                <p className="text-emerald-100 text-sm uppercase tracking-wider font-bold mb-1">Current Rank</p>
                <div className="text-4xl font-black text-white">#3</div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-slate-700"><TrendingUp size={18} className="text-emerald-500" /> Weekly Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">CO₂ Reduced</span>
                    <span className="font-bold text-slate-800">120 kg</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full"><div className="bg-emerald-500 h-full rounded-full" style={{width: '75%'}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Active Members</span>
                    <span className="font-bold text-slate-800">452</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full"><div className="bg-blue-500 h-full rounded-full" style={{width: '60%'}}></div></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border-slate-200 h-full">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Medal size={20} className="text-amber-500"/> Global Leaderboard</CardTitle>
                <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500/20">
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>All Time</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {leaderboard.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 animate-pulse">Loading rankings...</div>
                ) : (
                  leaderboard.map((team, index) => (
                    <motion.div
                      key={team.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center p-4 hover:bg-slate-50 transition-colors ${team.name === "Your Community" ? "bg-emerald-50/50" : ""}`}
                    >
                      <div className="w-8 text-center font-bold text-slate-400 mr-4">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${team.rank}`}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl mr-4 shadow-sm border border-slate-200">
                        {team.avatar}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${team.name === "Your Community" ? "text-emerald-700" : "text-slate-800"}`}>
                          {team.name}
                        </p>
                      </div>
                      <div className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg text-sm">
                        {team.score.toLocaleString()} pts
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
