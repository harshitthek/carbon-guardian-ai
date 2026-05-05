import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Car, Zap, Coffee, Trash2, ArrowDown, Target, CheckCircle2, User, Calendar, Shield, TrendingDown, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const iconMap = {
  Transport: <Car size={18} />,
  Electricity: <Zap size={18} />,
  Food: <Coffee size={18} />,
  Waste: <Trash2 size={18} />
};

const colorMap = {
  Transport: "var(--eco-electric)",
  Electricity: "var(--eco-sun)",
  Food: "var(--eco-aurora-2)",
  Waste: "var(--eco-mint)"
};

export default function ProfilePage() {
  const { profile } = useOutletContext();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (!profile || !user) return <div className="h-64 skeleton rounded-3xl" />;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "goals", label: "Goals" },
    { id: "history", label: "History" }
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Page Header */}
      <div>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-[var(--eco-neon)] mono text-[10px] uppercase tracking-[0.3em] mb-2"
        >
          <User size={14} />
          Identity Profile
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold">Guardian <span className="text-[var(--text-muted)]">Profile</span></h1>
      </div>

      {/* User Header Card */}
      <div className="bento-card bg-gradient-to-br from-[var(--eco-surface)] to-[var(--eco-black)] border-[var(--eco-electric)]/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[var(--eco-electric)]/10 to-[var(--eco-mint)]/5" />
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-8 pt-8">
          <div className="w-28 h-28 rounded-[2rem] border-2 border-[var(--glass-border)] bg-[var(--eco-dark)] flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(0,255,136,0.1)] shrink-0">
            {user.avatar 
              ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> 
              : <span className="text-4xl font-bold text-[var(--eco-neon)]">{user.name[0]}</span>
            }
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold mb-1">{user.name}</h2>
            <p className="text-[var(--text-muted)] mono text-xs uppercase tracking-widest">{user.email}</p>
          </div>
          <div className="flex gap-8 pb-2">
            <div className="text-center">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold mb-1">Joined</p>
              <p className="font-bold text-white mono">Oct 2023</p>
            </div>
            <div className="w-[1px] bg-[var(--glass-border)]" />
            <div className="text-center">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold mb-1">Rank</p>
              <p className="font-bold text-[var(--eco-neon)] mono">Level {profile.level}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-[var(--eco-neon)]/20 md:col-span-1">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold mb-4">Daily Average</p>
          <h2 className="text-4xl font-bold text-white mono">{profile.daily_footprint_kg} <span className="text-sm text-[var(--text-muted)]">KG</span></h2>
          <div className="flex items-center gap-1 text-[var(--eco-neon)] text-xs font-bold mt-4 mono">
            <ArrowDown size={14} /> 12% vs Previous
          </div>
        </div>

        <div className="glass-card p-6 border-[var(--glass-border)] md:col-span-3 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">You're outpacing 87% of Guardians</h3>
            <p className="text-[var(--text-secondary)] text-sm max-w-md leading-relaxed">
              Transport emissions dropped this week. Consider LED bulbs to tackle your electricity footprint next.
            </p>
          </div>
          <div className="hidden sm:flex w-20 h-20 bg-[var(--eco-dark)] rounded-3xl items-center justify-center border border-[var(--glass-border)] text-4xl">
            🌱
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
              activeTab === tab.id
              ? 'bg-[var(--eco-neon)] text-[var(--eco-black)] border-[var(--eco-neon)]'
              : 'bg-transparent text-[var(--text-muted)] border-[var(--glass-border)] hover:border-[var(--text-secondary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Pie Chart */}
          <div className="glass-card p-8 border-[var(--glass-border)]">
            <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em] mb-6">Emission Sources</h3>
            <div className="h-[300px] w-full">
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
                  >
                    {profile.footprint_breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colorMap[entry.name] || entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ 
                      backgroundColor: 'rgba(26,59,29,0.95)', 
                      border: '1px solid var(--glass-border)',
                      borderRadius: '12px',
                      fontFamily: 'Space Mono',
                      fontSize: '12px',
                      color: 'white'
                    }}
                    formatter={(value) => [`${value}%`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown Cards */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em] mb-2 ml-2">Breakdown by Category</h3>
            {profile.footprint_breakdown.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-[var(--eco-dark)] border border-[var(--glass-border)] group-hover:scale-110 transition-transform" style={{ color: colorMap[item.name] || item.fill }}>
                    {iconMap[item.name]}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-white">{item.name}</h4>
                      <span className="font-bold text-[var(--eco-neon)] mono text-sm">{item.value}%</span>
                    </div>
                    <div className="w-full bg-[var(--eco-darkest)] h-1.5 rounded-full overflow-hidden border border-[var(--glass-border)]">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: colorMap[item.name] || item.fill }}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === "goals" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass-card p-8 border-[var(--glass-border)]">
            <div className="flex items-center gap-3 mb-8">
              <Target size={20} className="text-[var(--eco-neon)]" />
              <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em]">Long-Term Objectives</h3>
            </div>
            <div className="space-y-6">
              {[
                { title: "Reduce Transport Emissions by 30%", target: 30, current: 18, desc: "Use public transport or cycle twice a week." },
                { title: "Zero Food Waste Month", target: 30, current: 12, desc: "Log 30 days without throwing away edible food." },
                { title: "Earn 10,000 Green Points", target: 10000, current: profile.green_points, desc: "Participate in campaigns and optimize travel." }
              ].map((goal, i) => (
                <div key={i} className="p-6 bg-[var(--eco-dark)] rounded-2xl border border-[var(--glass-border)]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-white text-lg mb-1">{goal.title}</h4>
                      <p className="text-xs text-[var(--text-secondary)]">{goal.desc}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-[var(--eco-neon)]/10 text-[var(--eco-neon)] px-3 py-1 rounded-full border border-[var(--eco-neon)]/20 mono">
                      {Math.round((goal.current/goal.target)*100)}%
                    </span>
                  </div>
                  <div className="w-full bg-[var(--eco-darkest)] h-2 rounded-full overflow-hidden border border-[var(--glass-border)]">
                    <motion.div 
                      className="bg-gradient-to-r from-[var(--eco-neon)] to-[var(--eco-electric)] h-full rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((goal.current/goal.target)*100, 100)}%` }}
                      transition={{ duration: 1.5, delay: i * 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "history" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass-card p-8 border-[var(--glass-border)]">
            <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em] mb-8">Monthly Footprint History</h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { month: 'Jul', val: 420 }, { month: 'Aug', val: 390 }, { month: 'Sep', val: 450 },
                  { month: 'Oct', val: 380 }, { month: 'Nov', val: 340 }, { month: 'Dec', val: profile.daily_footprint_kg * 30 }
                ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(57,255,20,0.05)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Space Mono'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Space Mono'}} />
                  <RechartsTooltip
                    contentStyle={{ 
                      backgroundColor: 'rgba(26,59,29,0.95)', 
                      border: '1px solid var(--glass-border)',
                      borderRadius: '12px',
                      fontFamily: 'Space Mono',
                      fontSize: '12px',
                      color: 'white'
                    }}
                  />
                  <Line type="monotone" dataKey="val" stroke="var(--eco-electric)" strokeWidth={3} dot={{ fill: 'var(--eco-electric)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

