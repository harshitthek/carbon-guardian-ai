import React, { useEffect, useState } from "react";
import { Store, ArrowRight, Heart, Users, MapPin, Search, Filter, Globe, Sparkles } from "lucide-react";
import { api } from "../services/api";
import { useApi } from "../hooks/useApi";
import { motion, AnimatePresence } from "framer-motion";

export default function Marketplace() {
  const marketApi = useApi(api.marketplace);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    marketApi.execute().catch(() => {});
  }, []);

  const communities = [
    { id: 1, name: "Green Campus Initiative", desc: "Student group focused on zero-waste campuses.", category: "student", icon: "🎓", members: 120 },
    { id: 2, name: "City Tree Planters", desc: "Weekly volunteering to plant native trees.", category: "volunteering", icon: "🌳", members: 450 },
    { id: 3, name: "Ocean Defenders", desc: "Beach cleanup and plastic recycling drive.", category: "recycling", icon: "🌊", members: 320 },
    { id: 4, name: "Climate Action Hub", desc: "Local policy advocacy and climate education.", category: "climate action", icon: "⚖️", members: 890 }
  ];

  const filteredCommunities = filter === "all" ? communities : communities.filter(c => c.category === filter);
  const campaigns = marketApi.data || [];

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-[var(--eco-neon)] mono text-[10px] uppercase tracking-[0.3em] mb-2"
          >
            <Globe size={14} />
            Global Trade & Outreach
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold">Green <span className="text-[var(--text-muted)]">Nexus</span></h1>
          <p className="text-[var(--text-secondary)] mt-4">Verified eco-organizations and verified community hubs.</p>
        </div>
        <div className="relative group min-w-[300px]">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--eco-neon)] transition-colors" size={18} />
           <input 
             type="text" 
             placeholder="Search Nexus Hubs..." 
             className="w-full bg-[var(--eco-dark)] border border-[var(--glass-border)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--eco-neon)] transition-all mono text-sm text-[var(--text-primary)]" 
           />
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {["all", "student", "volunteering", "recycling", "climate action"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
              filter === f 
              ? 'bg-[var(--eco-neon)] text-[var(--eco-black)] border-[var(--eco-neon)]' 
              : 'bg-transparent text-[var(--text-muted)] border-[var(--glass-border)] hover:border-[var(--text-secondary)]'
            }`}
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
            className="glass-card border-[var(--glass-border)] hover:border-[var(--eco-neon)]/30 transition-all group overflow-hidden flex flex-col"
          >
            <div className="h-32 bg-[var(--eco-dark)] relative flex items-center justify-center border-b border-[var(--glass-border)]">
              <span className="text-5xl group-hover:scale-110 transition-transform duration-500">{community.icon}</span>
              <div className="absolute top-4 right-4 bg-[var(--eco-black)]/60 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-bold text-[var(--eco-neon)] shadow-sm flex items-center gap-2 border border-[var(--eco-neon)]/20">
                <Users size={12}/> {community.members}
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="text-[8px] font-black text-[var(--eco-electric)] uppercase tracking-[0.2em] mb-3 bg-[var(--eco-electric)]/10 inline-block px-2 py-1 rounded-md self-start border border-[var(--eco-electric)]/20">
                {community.category}
              </div>
              <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[var(--eco-neon)] transition-colors">{community.name}</h3>
              <p className="text-xs text-[var(--text-secondary)] mb-6 line-clamp-2 leading-relaxed">{community.desc}</p>
              <button className="mt-auto w-full flex items-center justify-center gap-2 bg-[var(--eco-darkest)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--eco-neon)] py-3 rounded-xl text-xs font-bold transition-all">
                Access Uplink <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="pt-12 border-t border-[var(--glass-border)]">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-2xl font-bold text-white flex items-center gap-3">
             <MapPin className="text-[var(--eco-neon)]" /> Verified Campaigns
           </h2>
           <span className="text-[10px] mono text-[var(--text-muted)] uppercase tracking-widest">Active_Protocols</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {marketApi.loading ? (
            [1,2,3,4].map(i => <div key={i} className="h-64 skeleton bg-[var(--eco-dark)] rounded-2xl animate-pulse"></div>)
          ) : marketApi.error ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-4 glass-card p-8 border-red-500/30 text-center flex flex-col items-center justify-center">
              <h3 className="text-red-400 font-bold mb-2 uppercase tracking-widest">Marketplace Uplink Failed</h3>
              <p className="text-sm text-[var(--text-muted)] mb-6">{marketApi.error || 'Failed to sync marketplace data.'}</p>
              <button onClick={() => marketApi.execute().catch(() => {})} className="btn-primary">Retry Uplink</button>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-4 text-center text-[var(--text-muted)] p-8">No campaigns found</div>
          ) : (
            campaigns.map((camp, i) => (
              <motion.div
                key={camp.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 + 0.4 }}
                className="glass-card border-[var(--glass-border)] group overflow-hidden flex flex-col"
              >
                <div className="h-40 bg-[var(--eco-darkest)] relative flex items-center justify-center border-b border-[var(--glass-border)]">
                  <span className="text-6xl group-hover:rotate-12 transition-transform duration-500">{camp.icon}</span>
                  <div className="absolute top-4 right-4 bg-[var(--eco-neon)] text-[var(--eco-black)] px-3 py-1 rounded-xl text-[10px] font-bold shadow-[0_0_15px_rgba(57,255,20,0.3)]">
                    +{camp.points} GP
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">{camp.category}</div>
                  <h3 className="font-bold text-white mb-6 line-clamp-2 leading-tight group-hover:text-[var(--eco-neon)] transition-colors">{camp.title}</h3>
                  <button className="mt-auto btn-primary w-full flex items-center justify-center gap-2 py-3 text-xs">
                    Participate <Sparkles size={14} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Featured Campaign Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bento-card bg-gradient-to-br from-[var(--eco-surface)] to-[var(--eco-darkest)] border-[var(--eco-danger)]/20 overflow-hidden relative mt-16 p-0"
      >
        <div className="absolute right-0 top-0 w-full h-full bg-gradient-to-l from-[var(--eco-danger)]/5 to-transparent pointer-events-none"></div>
        <div className="p-10 md:p-16 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--eco-danger)]/10 text-[var(--eco-danger)] text-[10px] font-black rounded-full mb-6 uppercase tracking-[0.2em] border border-[var(--eco-danger)]/30">
              <Heart size={14} fill="currentColor" className="animate-pulse" /> Critical Deployment
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Save the Local <span className="text-[var(--eco-danger)]">Wetlands</span></h2>
            <p className="text-[var(--text-secondary)] text-lg mb-10 leading-relaxed">Join 500+ Guardians this weekend to clean up the city wetlands and plant native saplings. Impact score: +500GP.</p>
            <button className="px-10 py-5 bg-[var(--eco-danger)] text-white font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(255,95,86,0.2)] hover:scale-105 active:scale-95 uppercase tracking-widest text-xs">
              Commit to Protocol
            </button>
          </div>
          <div className="w-56 h-56 bg-[var(--eco-dark)] rounded-[3rem] flex items-center justify-center text-8xl shadow-2xl rotate-3 border border-[var(--glass-border)] relative">
            <div className="absolute inset-0 bg-[var(--eco-danger)]/5 blur-3xl rounded-full" />
            🦆
          </div>
        </div>
      </motion.div>
    </div>
  );
}
