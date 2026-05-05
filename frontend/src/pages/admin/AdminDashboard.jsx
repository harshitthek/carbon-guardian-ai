import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Settings, Database, Activity, Map, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { user } = useAuth();

  const stats = [
    { title: "Total Users", value: "1,248", change: "+12%", icon: Users },
    { title: "Active Recommendations", value: "843", change: "+5%", icon: Map },
    { title: "System Health", value: "99.9%", change: "Stable", icon: Activity },
    { title: "Dataset Updates", value: "24", change: "This week", icon: Database },
  ];

  return (
    <div className="space-y-12 pb-20">
      <div>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-[var(--eco-danger)] mono text-[10px] uppercase tracking-[0.3em] mb-2"
        >
          <ShieldAlert size={14} />
          Restricted Access
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold">Admin <span className="text-[var(--text-muted)]">Control</span></h1>
        <p className="text-[var(--text-secondary)] mt-4">
          Welcome back, {user?.name}. Platform management & monitoring.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 border-[var(--glass-border)] group hover:border-[var(--eco-neon)]/30 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-bold">{stat.title}</p>
              <stat.icon className="text-[var(--eco-electric)]" size={16} />
            </div>
            <div className="text-3xl font-bold text-white mono">{stat.value}</div>
            <p className="text-xs text-[var(--eco-neon)] mt-2 mono">{stat.change}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="glass-card p-8 border-[var(--glass-border)]">
          <div className="flex items-center gap-3 mb-8">
            <Settings size={18} className="text-[var(--eco-neon)]" />
            <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em]">System Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-[var(--eco-dark)] rounded-2xl border border-[var(--glass-border)]">
               <div>
                 <p className="font-bold text-white text-sm">AI Recommendation Engine</p>
                 <p className="text-[10px] text-[var(--text-muted)] mono uppercase tracking-widest mt-1">Using local datasets</p>
               </div>
               <button className="text-xs text-[var(--eco-neon)] font-bold hover:underline">Configure</button>
            </div>
            <div className="flex items-center justify-between p-5 bg-[var(--eco-dark)] rounded-2xl border border-[var(--glass-border)]">
               <div>
                 <p className="font-bold text-white text-sm">Marketplace Verification</p>
                 <p className="text-[10px] text-[var(--text-muted)] mono uppercase tracking-widest mt-1">3 pending requests</p>
               </div>
               <button className="text-xs text-[var(--eco-sun)] font-bold hover:underline">Review</button>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 border-[var(--glass-border)]">
          <div className="flex items-center gap-3 mb-8">
            <Activity size={18} className="text-[var(--eco-electric)]" />
            <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em]">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {[
              { action: "Updated recommendation weights", time: "2 hours ago" },
              { action: "Approved 'Green Campus Initiative'", time: "5 hours ago" },
              { action: "System health check passed", time: "1 day ago" }
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-[var(--glass-border)] last:border-0">
                 <p className="text-sm text-[var(--text-primary)]">{log.action}</p>
                 <span className="text-[10px] text-[var(--text-muted)] mono uppercase tracking-widest">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

