import React from "react";
import { useOutletContext } from "react-router-dom";
import { Trophy, Gift, Star, Shield, Zap, TrendingUp, ChevronRight, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Rewards() {
  const { profile } = useOutletContext();

  if (!profile) return <div className="h-64 skeleton rounded-3xl" />;

  const badges = [
    { icon: Shield, name: "Eco Starter", desc: "First action taken", earned: true, color: "text-[var(--eco-electric)]" },
    { icon: Zap, name: "Energy Saver", desc: "Reduced electricity by 10%", earned: true, color: "text-[var(--eco-sun)]" },
    { icon: Star, name: "Week Streak", desc: "7 days of green choices", earned: false, color: "text-[var(--text-muted)]" },
  ];

  return (
    <div className="space-y-12 pb-20">
      <div>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-[var(--eco-neon)] mono text-[10px] uppercase tracking-[0.3em] mb-2"
        >
          <Trophy size={14} />
          Guardian Achievements
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold">Rewards <span className="text-[var(--text-muted)]">& Points</span></h1>
        <p className="text-[var(--text-secondary)] mt-4">Convert your climate contributions into digital and real-world assets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Balance Card */}
        <div className="lg:col-span-2 bento-card bg-gradient-to-br from-[var(--eco-surface)] to-[var(--eco-black)] border-[var(--eco-neon)]/20 p-10 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute right-[-5%] top-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-2000">
             <Trophy size={400} />
          </div>
          
          <div className="relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--eco-neon)] mb-6 block">Current Uplink Balance</span>
            <div className="flex items-baseline gap-4 mb-10">
              <h2 className="text-7xl md:text-8xl font-bold text-white mono leading-none tracking-tighter">
                {profile.green_points.toLocaleString()}
              </h2>
              <span className="text-2xl font-bold text-[var(--eco-neon)] mono uppercase">GP</span>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary flex items-center gap-2">
                Redeem Assets <ChevronRight size={18} />
              </button>
              <button className="px-8 py-4 rounded-xl border border-[var(--glass-border)] text-white font-bold hover:bg-white/5 transition-all flex items-center gap-2">
                <History size={18} /> Audit History
              </button>
            </div>
          </div>
        </div>

        {/* Level Progression */}
        <div className="glass-card p-8 border-[var(--glass-border)] flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="aurora-blob w-32 h-32 blur-3xl opacity-20" />
          <div className="relative z-10 w-full">
            <div className="w-24 h-24 bg-[var(--eco-dark)] rounded-[2.5rem] flex items-center justify-center text-4xl mb-6 mx-auto border border-[var(--glass-border)] shadow-[0_0_30px_rgba(255,189,46,0.1)]">
              👑
            </div>
            <h3 className="text-2xl font-bold mb-1">Rank: {profile.persona}</h3>
            <p className="text-[var(--eco-neon)] mono text-xs uppercase tracking-widest mb-8">Level {profile.level}</p>
            
            <div className="w-full space-y-3">
              <div className="flex justify-between text-[10px] mono font-bold uppercase tracking-widest text-[var(--text-muted)]">
                <span>Progress</span>
                <span>{profile.green_points} / 3000 GP</span>
              </div>
              <div className="w-full bg-[var(--eco-darkest)] h-2 rounded-full overflow-hidden border border-[var(--glass-border)]">
                <motion.div
                  className="bg-gradient-to-r from-[var(--eco-neon)] to-[var(--eco-electric)] h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(profile.green_points / 3000) * 100}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mono mt-4">
                {3000 - profile.green_points} GP to Next Protocol Level
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {/* Earnings List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em]">Neural Uplink Feed</h3>
            <TrendingUp size={14} className="text-[var(--eco-neon)]" />
          </div>
          <div className="space-y-3">
            {profile.recent_rewards.map((reward, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={reward.id} 
                className="flex items-center justify-between p-5 glass-card border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] transition-all group"
              >
                <div>
                  <p className="font-bold text-[var(--text-primary)] group-hover:text-[var(--eco-neon)] transition-colors">{reward.source}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mono uppercase tracking-widest mt-1">{reward.date}</p>
                </div>
                <div className="font-bold text-[var(--eco-neon)] mono bg-[var(--eco-neon)]/5 px-4 py-2 rounded-xl border border-[var(--eco-neon)]/10 group-hover:scale-105 transition-transform">
                  +{reward.points} GP
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Badges Redesign */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em]">Guardian Signets</h3>
            <Star size={14} className="text-[var(--eco-sun)]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map((badge, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                key={i} 
                className={`p-6 rounded-3xl border transition-all flex flex-col items-center text-center group ${
                  badge.earned 
                  ? 'glass-card border-[var(--glass-border)] hover:border-[var(--eco-neon)]/30' 
                  : 'bg-[var(--eco-darkest)] border-[var(--glass-border)] opacity-40 grayscale'
                }`}
              >
                <div className={`p-4 rounded-2xl bg-[var(--eco-dark)] mb-4 border border-[var(--glass-border)] group-hover:scale-110 transition-transform ${badge.color}`}>
                  <badge.icon size={28} />
                </div>
                <h4 className="font-bold text-sm mb-1">{badge.name}</h4>
                <p className="text-[10px] text-[var(--text-muted)] mono uppercase tracking-widest leading-relaxed">
                  {badge.earned ? badge.desc : "Locked"}
                </p>
                {badge.earned && (
                  <div className="mt-4 px-2 py-1 bg-[var(--eco-neon)]/10 rounded-full text-[8px] font-bold text-[var(--eco-neon)] uppercase tracking-widest">
                    Verified
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
