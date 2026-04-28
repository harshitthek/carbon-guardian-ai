import React from "react";
import { useOutletContext } from "react-router-dom";
import { Trophy, Gift, Star, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Rewards() {
  const { profile } = useOutletContext();

  if (!profile) return null;

  const badges = [
    { icon: Shield, name: "Eco Starter", desc: "First action taken", earned: true },
    { icon: Zap, name: "Energy Saver", desc: "Reduced electricity by 10%", earned: true },
    { icon: Star, name: "Week Streak", desc: "7 days of green choices", earned: false },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
          <Trophy className="text-emerald-500" /> Green Points & Rewards
        </h1>
        <p className="text-slate-500 mt-2">Track your progress and redeem points for real-world impact.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Points Summary Card */}
        <Card className="bg-emerald-600 text-white shadow-lg overflow-hidden relative col-span-1 md:col-span-2">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4"></div>
          <CardContent className="p-8 relative z-10 flex flex-col justify-center h-full">
            <p className="text-emerald-100 font-medium mb-2 uppercase tracking-wide text-sm">Total Balance</p>
            <h2 className="text-6xl font-bold mb-4 flex items-center gap-4">
              {profile.green_points.toLocaleString()} <span className="text-2xl font-normal text-emerald-200">GP</span>
            </h2>
            <div className="flex gap-4 mt-4">
              <button className="bg-white text-emerald-700 px-6 py-2.5 rounded-lg font-bold shadow-sm hover:bg-emerald-50 transition-colors">
                Redeem Now
              </button>
              <button className="bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium border border-emerald-500 hover:bg-emerald-800 transition-colors">
                View History
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Next Level Info */}
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6 flex flex-col items-center text-center justify-center h-full">
            <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner">
              👑
            </div>
            <h3 className="font-bold text-lg text-slate-800">Level {profile.level}</h3>
            <p className="text-slate-500 text-sm mb-4">{profile.persona}</p>

            <div className="w-full text-left space-y-1">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>{profile.green_points} GP</span>
                <span>3000 GP</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <motion.div
                  className="bg-amber-400 h-full rounded-full"
                  initial={{width: 0}}
                  animate={{width: `${(profile.green_points / 3000) * 100}%`}}
                  transition={{duration: 1}}
                />
              </div>
              <p className="text-xs text-slate-400 text-center mt-2">Only 550 points to Level 8!</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Recent Activity List */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Recent Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.recent_rewards.map((reward, i) => (
                <div key={reward.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-700">{reward.source}</p>
                    <p className="text-xs text-slate-400">{reward.date}</p>
                  </div>
                  <div className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm">
                    +{reward.points} GP
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Your Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((badge, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${badge.earned ? 'bg-white border-emerald-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60 grayscale'}`}>
                  <div className={`p-2.5 rounded-full ${badge.earned ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                    <badge.icon size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">{badge.name}</p>
                    <p className="text-xs text-slate-500">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
