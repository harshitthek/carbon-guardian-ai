import React, { useEffect, useState } from "react";
import { Store, ArrowRight, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "../services/api";
import { motion } from "framer-motion";

export default function Marketplace() {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    api.marketplace().then(setCampaigns);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Store className="text-emerald-500" /> Action Marketplace
          </h1>
          <p className="text-slate-500 mt-2">Join local campaigns, volunteer, and make a real-world impact.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-emerald-700 transition-colors">All Actions</button>
          <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">My Participations</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {campaigns.length === 0 ? (
          [1,2,3,4].map(i => <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse"></div>)
        ) : (
          campaigns.map((camp, i) => (
            <motion.div
              key={camp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full flex flex-col hover:border-emerald-300 hover:shadow-md transition-all group overflow-hidden">
                <div className="h-32 bg-slate-100 relative flex items-center justify-center border-b border-slate-100">
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{camp.icon}</span>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-emerald-700 shadow-sm flex items-center gap-1">
                    +{camp.points} pts
                  </div>
                </div>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{camp.category}</div>
                  <h3 className="font-bold text-slate-800 mb-4 line-clamp-2 flex-1 group-hover:text-emerald-700 transition-colors">{camp.title}</h3>
                  <button className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 py-2.5 rounded-lg text-sm font-semibold transition-all">
                    Join Now <ArrowRight size={16} />
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Featured Campaign Banner */}
      <Card className="bg-slate-900 text-white overflow-hidden relative mt-10 border-none">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-emerald-600/40 to-transparent"></div>
        <CardContent className="p-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-bold rounded-full mb-4 uppercase tracking-wider border border-rose-500/30">
              <Heart size={14} fill="currentColor" /> Urgent Campaign
            </div>
            <h2 className="text-3xl font-bold mb-3">Save the Local Wetlands</h2>
            <p className="text-slate-300 text-lg mb-6 leading-relaxed">Join 500+ community members this weekend to clean up the city wetlands and plant native saplings.</p>
            <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-emerald-500/20">
              Register to Volunteer
            </button>
          </div>
          <div className="w-48 h-48 bg-slate-800 rounded-2xl flex items-center justify-center text-8xl shadow-2xl rotate-3 border border-slate-700">
            🦆
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
