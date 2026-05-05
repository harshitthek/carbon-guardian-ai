import React, { useEffect, useState } from "react";
import { Users, TrendingUp, Medal, Globe, ChevronRight, Activity } from "lucide-react";
import { api } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

export default function Community() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    api.leaderboard().then(setLeaderboard);
  }, []);

  return (
    <div className="space-y-12 pb-20">
      <div>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-[var(--eco-neon)] mono text-[10px] uppercase tracking-[0.3em] mb-2"
        >
          <Users size={14} />
          Global Neural Network
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold">Guardian <span className="text-[var(--text-muted)]">Collective</span></h1>
        <p className="text-[var(--text-secondary)] mt-4">Syncing efforts with climate-conscious cells worldwide.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bento-card bg-gradient-to-br from-[var(--eco-surface)] to-[var(--eco-black)] border-[var(--eco-electric)]/20 p-8 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Users size={120} />
            </div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-[var(--eco-dark)] rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto mb-6 border border-[var(--glass-border)] shadow-[0_0_30px_rgba(57,255,20,0.1)]">
                🏛️
              </div>
              <h3 className="text-2xl font-bold mb-1">Your Node</h3>
              <p className="text-[var(--eco-electric)] mono text-[10px] uppercase tracking-widest mb-8">DU_CAMPUS_ID_042</p>

              <div className="bg-[var(--eco-black)]/40 border border-[var(--glass-border)] rounded-2xl p-6 backdrop-blur-md">
                <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Global Rank</p>
                <div className="text-5xl font-black text-white mono">#03</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-[var(--glass-border)] space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em]">Node Vitals</h3>
              <Activity size={14} className="text-[var(--eco-neon)]" />
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] mono uppercase tracking-widest">
                  <span className="text-[var(--text-secondary)]">CO₂ Recovery</span>
                  <span className="text-[var(--eco-neon)] font-bold">120 KG</span>
                </div>
                <div className="w-full bg-[var(--eco-darkest)] h-1.5 rounded-full overflow-hidden border border-[var(--glass-border)]">
                  <motion.div className="bg-[var(--eco-neon)] h-full" initial={{width:0}} animate={{width: '75%'}} transition={{duration:1}} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] mono uppercase tracking-widest">
                  <span className="text-[var(--text-secondary)]">Active Links</span>
                  <span className="text-[var(--eco-electric)] font-bold">452</span>
                </div>
                <div className="w-full bg-[var(--eco-darkest)] h-1.5 rounded-full overflow-hidden border border-[var(--glass-border)]">
                  <motion.div className="bg-[var(--eco-electric)] h-full" initial={{width:0}} animate={{width: '60%'}} transition={{duration:1, delay:0.2}} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Panel */}
        <div className="lg:col-span-2">
          <div className="glass-card border-[var(--glass-border)] h-full flex flex-col overflow-hidden">
            <div className="bg-white/5 border-b border-[var(--glass-border)] px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Medal className="text-[var(--eco-sun)]" size={20} />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-secondary)]">Global Rankings</h3>
              </div>
              <select className="bg-[var(--eco-dark)] border border-[var(--glass-border)] text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest rounded-xl px-4 py-2 outline-none focus:border-[var(--eco-neon)] transition-all">
                <option>Week_Cycle_42</option>
                <option>Month_Cycle_05</option>
                <option>All_Time_Log</option>
              </select>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <AnimatePresence>
                {leaderboard.length === 0 ? (
                  <div className="p-20 text-center text-[var(--text-muted)] mono text-xs uppercase tracking-widest animate-pulse">Synchronizing rankings...</div>
                ) : (
                  <div className="divide-y divide-[var(--glass-border)]">
                    {leaderboard.map((team, index) => (
                      <motion.div
                        key={team.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center p-6 group transition-all cursor-pointer ${
                          team.name === "Your Community" ? "bg-[var(--eco-neon)]/5" : "hover:bg-white/[0.02]"
                        }`}
                      >
                        <div className="w-12 text-center font-bold text-lg mono text-[var(--text-muted)] group-hover:text-[var(--eco-neon)] transition-colors">
                          {index === 0 ? "01" : index === 1 ? "02" : index === 2 ? "03" : (index + 1).toString().padStart(2, '0')}
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-[var(--eco-dark)] flex items-center justify-center text-2xl mr-6 border border-[var(--glass-border)] shadow-inner group-hover:scale-110 transition-transform">
                          {team.avatar}
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold tracking-tight text-lg ${team.name === "Your Community" ? "text-[var(--eco-neon)]" : "text-white"}`}>
                            {team.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-[var(--eco-neon)]/30 group-hover:bg-[var(--eco-neon)] transition-colors" />
                             <span className="text-[10px] text-[var(--text-muted)] mono uppercase tracking-widest">Active_Uplink</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-white mono">
                            {team.score.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] mono uppercase tracking-widest">GP_CREDITS</div>
                        </div>
                        <ChevronRight className="ml-6 text-[var(--glass-border)] group-hover:text-[var(--eco-neon)] transition-colors" size={18} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
