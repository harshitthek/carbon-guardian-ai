import React, { useEffect, useState } from "react";
import { Store, ArrowRight, Heart, Users, MapPin, Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "../services/api";
import { motion } from "framer-motion";

export default function Marketplace() {
  const [campaigns, setCampaigns] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.marketplace().then(setCampaigns);
  }, []);

  const communities = [
    { id: 1, name: "Green Campus Initiative", desc: "Student group focused on zero-waste campuses.", category: "student", icon: "🎓", members: 120 },
    { id: 2, name: "City Tree Planters", desc: "Weekly volunteering to plant native trees.", category: "volunteering", icon: "🌳", members: 450 },
    { id: 3, name: "Ocean Defenders", desc: "Beach cleanup and plastic recycling drive.", category: "recycling", icon: "🌊", members: 320 },
    { id: 4, name: "Climate Action Hub", desc: "Local policy advocacy and climate education.", category: "climate action", icon: "⚖️", members: 890 }
  ];

  const filteredCommunities = filter === "all" ? communities : communities.filter(c => c.category === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Store className="text-emerald-500" /> Green Marketplace & Communities
          </h1>
          <p className="text-slate-500 mt-2">Discover verified green organizations, volunteer groups, and student clubs.</p>
        </div>
        <div className="flex gap-2 relative min-w-[200px]">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
           <input type="text" placeholder="Search communities..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["all", "student", "volunteering", "recycling", "climate action"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${filter === f ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCommunities.map((community, i) => (
          <motion.div
            key={community.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full flex flex-col hover:border-emerald-300 hover:shadow-md transition-all group overflow-hidden bg-white">
              <div className="h-28 bg-emerald-50 relative flex items-center justify-center border-b border-emerald-100">
                <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{community.icon}</span>
                <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-md text-xs font-bold text-emerald-700 shadow-sm flex items-center gap-1 border border-emerald-100">
                  <Users size={12}/> {community.members}
                </div>
              </div>
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2 bg-emerald-50 inline-block px-2 py-0.5 rounded-full self-start">{community.category}</div>
                <h3 className="font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-emerald-700 transition-colors">{community.name}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">{community.desc}</p>
                <button className="w-full flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-200 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm">
                  Join Community <ArrowRight size={16} />
                </button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="pt-8 border-t border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><MapPin className="text-emerald-500" /> Local Campaigns</h2>

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
                      Participate <ArrowRight size={16} />
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
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
