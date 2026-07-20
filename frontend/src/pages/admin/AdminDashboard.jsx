import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, getMockMode, setMockMode } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import {
  Users, Settings, Database, Activity, ShieldAlert, Cpu, Download,
  RefreshCw, Trash2, Edit2, Play, ScrollText, X, Check, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Reusable Empty State ────────────────────────────────────────
function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon size={40} className="text-[var(--text-muted)] mb-4 opacity-40" />
      <p className="text-sm text-[var(--text-muted)]">{message}</p>
    </div>
  );
}

// ─── Reusable Error Banner ───────────────────────────────────────
function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-red-950/30 border border-[var(--eco-danger)]/30 rounded-xl">
      <AlertTriangle size={18} className="text-[var(--eco-danger)] shrink-0" />
      <p className="text-sm text-[var(--eco-danger)] flex-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-xs text-white font-bold underline">Retry</button>
      )}
    </div>
  );
}

// ─── User Edit Modal ─────────────────────────────────────────────
function EditUserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    role: user.role,
    level: user.level,
    persona: user.persona,
    green_points: user.green_points,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.admin.updateUser(user.id, form);
      onSave();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card p-8 border-[var(--glass-border)] w-full max-w-md space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Edit User #{user.id}</h3>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold mb-1 block">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full bg-[var(--eco-dark)] border border-[var(--glass-border)] rounded-lg p-3 text-white text-sm"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold mb-1 block">Level</label>
            <input type="number" value={form.level} onChange={(e) => setForm({ ...form, level: parseInt(e.target.value) || 0 })}
              className="w-full bg-[var(--eco-dark)] border border-[var(--glass-border)] rounded-lg p-3 text-white text-sm" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold mb-1 block">Persona</label>
            <input type="text" value={form.persona} onChange={(e) => setForm({ ...form, persona: e.target.value })}
              className="w-full bg-[var(--eco-dark)] border border-[var(--glass-border)] rounded-lg p-3 text-white text-sm" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold mb-1 block">Green Points</label>
            <input type="number" value={form.green_points} onChange={(e) => setForm({ ...form, green_points: parseInt(e.target.value) || 0 })}
              className="w-full bg-[var(--eco-dark)] border border-[var(--glass-border)] rounded-lg p-3 text-white text-sm" />
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full bg-[var(--eco-neon)] text-black px-6 py-3 rounded-xl font-bold hover:brightness-110 disabled:opacity-50"
        >
          <Check size={16} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </motion.div>
    </div>
  );
}

// ─── Main Admin Dashboard ────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // ── useApi hooks for standardized data fetching ──
  const statsApi = useApi(api.admin.stats);
  const usersApi = useApi(api.admin.users);
  const groupsApi = useApi(api.admin.groups);
  const auditApi = useApi(api.admin.auditLogs);
  const gamificationApi = useApi(api.admin.gamificationSettings);

  // ── Additional local state ──
  const [mockMode, setMockModeState] = useState(getMockMode());
  const [retrainLogs, setRetrainLogs] = useState(null);
  const [isRetraining, setIsRetraining] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Simulation State
  const [simParams, setSimParams] = useState({ ev: 30, solar: 20, plastic: 50 });
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  // ── Load stats on mount ──
  useEffect(() => {
    statsApi.execute();
  }, []);

  // ── Load tab-specific data ──
  useEffect(() => {
    if (activeTab === 'users') {
      usersApi.execute();
      groupsApi.execute();
    } else if (activeTab === 'audit') {
      auditApi.execute();
    } else if (activeTab === 'config') {
      gamificationApi.execute();
    }
  }, [activeTab]);

  const handleRetrain = async () => {
    setIsRetraining(true);
    try {
      const res = await api.admin.retrainAi();
      setRetrainLogs(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRetraining(false);
    }
  };

  const handleSimulate = async () => {
    setSimLoading(true);
    try {
      const res = await api.simulation(simParams);
      setSimResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSimLoading(false);
    }
  };

  const toggleMockMode = () => {
    const newVal = !mockMode;
    setMockMode(newVal);
    setMockModeState(newVal);
    window.location.reload();
  };

  const handlePurge = async () => {
    if (window.confirm("Are you sure you want to purge logs older than 30 days?")) {
      await api.admin.purgeLogs();
      statsApi.execute();
    }
  };

  const handleSeed = async () => {
    if (window.confirm("Are you sure you want to run the database seeder?")) {
      await api.admin.seedDatabase();
      statsApi.execute();
    }
  };

  const handleUserSaved = () => {
    setEditingUser(null);
    usersApi.execute();
  };

  const stats = statsApi.data;
  const users = usersApi.data?.items || [];
  const groups = groupsApi.data || [];
  const auditLogs = auditApi.data || [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Data Management', icon: Users },
    { id: 'ops', label: 'AI & Ops', icon: Cpu },
    { id: 'audit', label: 'Audit Logs', icon: ScrollText },
    { id: 'config', label: 'Configuration', icon: Settings },
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
          Enterprise Admin Suite
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold">Platform <span className="text-[var(--text-muted)]">Control</span></h1>
        <p className="text-[var(--text-secondary)] mt-4">
          Welcome back, {user?.name}. Total visibility and absolute control.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-[var(--glass-border)] pb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[var(--eco-neon)] text-black'
                : 'text-[var(--text-muted)] hover:text-white glass-card border-[var(--glass-border)]'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* ═══════ OVERVIEW TAB ═══════ */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {statsApi.error && <ErrorBanner message={statsApi.error} onRetry={() => statsApi.execute()} />}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: "Total Users", value: stats?.total_users ?? 0, icon: Users },
                  { title: "Total Activities", value: stats?.total_activities ?? 0, icon: Activity },
                  { title: "Recommendations", value: stats?.total_recommendations ?? 0, icon: Cpu },
                  { title: "Green Points", value: stats?.total_green_points ?? 0, icon: Database },
                ].map((stat, i) => (
                  <div key={i} className="glass-card p-6 border-[var(--glass-border)] group hover:border-[var(--eco-neon)]/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-bold">{stat.title}</p>
                      <stat.icon className="text-[var(--eco-electric)]" size={16} />
                    </div>
                    <div className="text-3xl font-bold text-white mono">
                      {statsApi.loading ? '...' : stat.value.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="glass-card p-8 border-[var(--glass-border)] flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">Export Emissions Data</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Download a CSV of all carbon footprint logs.</p>
                </div>
                <button onClick={() => api.admin.exportEmissions()} className="flex items-center gap-2 bg-[var(--eco-electric)] text-black px-6 py-3 rounded-full font-bold text-sm hover:brightness-110">
                  <Download size={16} /> Export CSV
                </button>
              </div>
            </div>
          )}

          {/* ═══════ DATA MANAGEMENT TAB ═══════ */}
          {activeTab === 'users' && (
            <div className="space-y-8">
              {usersApi.error && <ErrorBanner message={usersApi.error} onRetry={() => usersApi.execute()} />}

              <div className="glass-card p-8 border-[var(--glass-border)] overflow-x-auto">
                <h3 className="text-lg font-bold mb-6">User Accounts</h3>
                {users.length === 0 && !usersApi.loading ? (
                  <EmptyState icon={Users} message="No users found in the database." />
                ) : (
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-[var(--glass-border)]">
                        <th className="py-3 text-[10px] uppercase tracking-widest text-[var(--text-muted)]">ID</th>
                        <th className="py-3 text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Name</th>
                        <th className="py-3 text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Email</th>
                        <th className="py-3 text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Role</th>
                        <th className="py-3 text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Points</th>
                        <th className="py-3 text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-[var(--glass-border)]/50 last:border-0 hover:bg-white/5 transition-colors">
                          <td className="py-4 text-sm mono text-[var(--text-muted)]">#{u.id}</td>
                          <td className="py-4 text-sm font-bold text-white">{u.name}</td>
                          <td className="py-4 text-sm text-[var(--text-secondary)]">{u.email}</td>
                          <td className="py-4 text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-[var(--eco-danger)]/20 text-[var(--eco-danger)]' : 'bg-[var(--eco-electric)]/20 text-[var(--eco-electric)]'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 text-sm text-[var(--eco-neon)] mono">{u.green_points}</td>
                          <td className="py-4">
                            <button onClick={() => setEditingUser(u)} className="text-[var(--text-muted)] hover:text-white transition-colors">
                              <Edit2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="glass-card p-8 border-[var(--glass-border)] overflow-x-auto">
                <h3 className="text-lg font-bold mb-6">Community Leaderboard</h3>
                {groups.length === 0 && !groupsApi.loading ? (
                  <EmptyState icon={Users} message="No community groups found. Run the seeder." />
                ) : (
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-[var(--glass-border)]">
                        <th className="py-3 text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Rank</th>
                        <th className="py-3 text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Group Name</th>
                        <th className="py-3 text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Reduction (kg)</th>
                        <th className="py-3 text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Members</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map(g => (
                        <tr key={g.id} className="border-b border-[var(--glass-border)]/50 last:border-0 hover:bg-white/5 transition-colors">
                          <td className="py-4 text-sm text-[var(--eco-sun)] font-bold">#{g.rank}</td>
                          <td className="py-4 text-sm text-white font-bold">{g.name}</td>
                          <td className="py-4 text-sm text-[var(--eco-neon)] mono">{g.weekly_reduction_kg}</td>
                          <td className="py-4 text-sm text-[var(--text-secondary)] mono">{g.members}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ═══════ AI & OPS TAB ═══════ */}
          {activeTab === 'ops' && (
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="glass-card p-8 border-[var(--glass-border)]">
                <div className="flex items-center gap-3 mb-6">
                  <Cpu size={24} className="text-[var(--eco-neon)]" />
                  <h3 className="text-xl font-bold">AI Retraining Engine</h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-8">
                  Manually trigger the background ranking model to ingest new feedback loops and activities from ALL users.
                </p>
                <button
                  onClick={handleRetrain}
                  disabled={isRetraining}
                  className="flex items-center justify-center gap-2 w-full bg-[var(--eco-neon)] text-black px-6 py-4 rounded-xl font-bold hover:brightness-110 disabled:opacity-50"
                >
                  <RefreshCw size={18} className={isRetraining ? "animate-spin" : ""} />
                  {isRetraining ? 'Ingesting Data...' : 'Trigger Retraining Cycle'}
                </button>

                {retrainLogs && (
                  <div className="mt-8 p-4 bg-black/50 border border-[var(--glass-border)] rounded-xl font-mono text-xs space-y-2">
                    <p className="text-[var(--eco-electric)]">&gt; Retraining executed successfully.</p>
                    <p className="text-[var(--text-secondary)]">Status: <span className="text-white">{retrainLogs.status}</span></p>
                    <p className="text-[var(--text-secondary)]">Examples Processed: <span className="text-white">{retrainLogs.training_examples}</span></p>
                    <p className="text-[var(--text-secondary)]">Positive Feedback: <span className="text-white">{retrainLogs.positive_feedback_examples}</span></p>
                  </div>
                )}
              </div>

              <div className="glass-card p-8 border-[var(--glass-border)]">
                <div className="flex items-center gap-3 mb-6">
                  <Activity size={24} className="text-[var(--eco-electric)]" />
                  <h3 className="text-xl font-bold">Global Simulation Lab</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold mb-2 block">EV Adoption (%)</label>
                    <input type="range" min="0" max="100" value={simParams.ev} onChange={(e) => setSimParams({...simParams, ev: parseInt(e.target.value)})} className="w-full accent-[var(--eco-electric)]" />
                    <div className="text-right mono text-sm text-[var(--eco-electric)]">{simParams.ev}%</div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold mb-2 block">Solar Grid (%)</label>
                    <input type="range" min="0" max="100" value={simParams.solar} onChange={(e) => setSimParams({...simParams, solar: parseInt(e.target.value)})} className="w-full accent-[var(--eco-sun)]" />
                    <div className="text-right mono text-sm text-[var(--eco-sun)]">{simParams.solar}%</div>
                  </div>
                  <button onClick={handleSimulate} disabled={simLoading} className="flex items-center justify-center gap-2 w-full bg-[var(--glass-border)] hover:bg-white/10 text-white border border-[var(--glass-border)] px-6 py-4 rounded-xl font-bold transition-colors">
                    <Play size={18} /> {simLoading ? 'Running...' : 'Run Projection'}
                  </button>

                  {simResult && (
                    <div className="mt-6 p-4 bg-[var(--eco-dark)] border border-[var(--glass-border)] rounded-xl">
                      <p className="text-sm font-bold text-white mb-2">{simResult.description}</p>
                      <div className="flex justify-between text-xs text-[var(--text-secondary)] mono">
                        <span>CO2 Saved: <span className="text-[var(--eco-neon)]">{simResult.co2_reduced_kg.toLocaleString()} kg</span></span>
                        <span>AQI Drop: <span className="text-[var(--eco-electric)]">{simResult.aqi_improvement_percent}%</span></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════ AUDIT LOGS TAB ═══════ */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="glass-card p-8 border-[var(--glass-border)]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Admin Activity Feed</h3>
                  <button onClick={() => auditApi.execute()} className="text-[var(--text-muted)] hover:text-white transition-colors">
                    <RefreshCw size={16} />
                  </button>
                </div>
                {auditApi.error && <ErrorBanner message={auditApi.error} onRetry={() => auditApi.execute()} />}
                {auditLogs.length === 0 && !auditApi.loading ? (
                  <EmptyState icon={ScrollText} message="No audit logs recorded yet." />
                ) : (
                  <div className="space-y-3">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-4 bg-[var(--eco-dark)] rounded-xl border border-[var(--glass-border)]">
                        <div className="mt-0.5">
                          <ScrollText size={16} className="text-[var(--eco-electric)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              log.action === 'delete' ? 'bg-[var(--eco-danger)]/20 text-[var(--eco-danger)]'
                              : log.action === 'export' ? 'bg-[var(--eco-sun)]/20 text-[var(--eco-sun)]'
                              : 'bg-[var(--eco-electric)]/20 text-[var(--eco-electric)]'
                            }`}>
                              {log.action}
                            </span>
                            <span className="text-sm text-white font-bold">{log.target_resource}</span>
                            {log.target_id && <span className="text-xs text-[var(--text-muted)] mono">#{log.target_id}</span>}
                          </div>
                          {log.details && <p className="text-xs text-[var(--text-secondary)] mt-1">{log.details}</p>}
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] mono whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════ CONFIG TAB ═══════ */}
          {activeTab === 'config' && (
            <div className="space-y-6 max-w-3xl">
              <div className="glass-card p-6 border-[var(--glass-border)]">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Database size={18} className="text-[var(--eco-neon)]" />
                    Gamification Rewards
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Configure the green points awarded for specific eco-friendly activities.</p>
                </div>
                {gamificationApi.error && <ErrorBanner message={gamificationApi.error} onRetry={() => gamificationApi.execute()} />}
                {gamificationApi.loading ? (
                  <p className="text-sm text-[var(--text-muted)]">Loading settings...</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(gamificationApi.data || []).map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between p-3 bg-[var(--eco-dark)] rounded-lg border border-[var(--glass-border)]">
                        <span className="text-sm font-bold capitalize">{setting.action_name.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            defaultValue={setting.points} 
                            onBlur={async (e) => {
                              const newVal = parseInt(e.target.value);
                              if (newVal !== setting.points && !isNaN(newVal)) {
                                try {
                                  await api.admin.updateGamificationSetting(setting.id, newVal);
                                  gamificationApi.execute();
                                } catch (err) {
                                  console.error("Failed to update points", err);
                                }
                              }
                            }}
                            className="w-20 bg-black border border-[var(--glass-border)] rounded px-2 py-1 text-sm text-[var(--eco-neon)] text-center mono font-bold"
                          />
                          <span className="text-xs text-[var(--text-muted)]">pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass-card p-6 border-[var(--glass-border)] flex items-center justify-between mt-8">
                <div>
                  <h3 className="text-lg font-bold text-white">Offline Mock Engine</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Disconnects frontend from live backend and serves fallback data.</p>
                </div>
                <button onClick={toggleMockMode} className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${mockMode ? 'bg-[var(--eco-neon)] text-black' : 'bg-[var(--glass-border)] text-white'}`}>
                  {mockMode ? 'Online (Mocks)' : 'Live Data'}
                </button>
              </div>

              <div className="glass-card p-6 border-[var(--eco-danger)]/50 bg-red-950/20 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--eco-danger)]">Purge Log Data</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Permanently deletes activity and emission logs older than 30 days.</p>
                </div>
                <button onClick={handlePurge} className="bg-[var(--eco-danger)]/20 text-[var(--eco-danger)] hover:bg-[var(--eco-danger)] hover:text-white transition-colors px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                  <Trash2 size={16} /> Purge Logs
                </button>
              </div>

              <div className="glass-card p-6 border-[var(--glass-border)] flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Seed Database</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Populate the database with initial dummy data for testing.</p>
                </div>
                <button onClick={handleSeed} className="bg-[var(--glass-border)] hover:bg-white/10 transition-colors text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 border border-[var(--glass-border)]">
                  <Database size={16} /> Run Seeder
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleUserSaved} />
        )}
      </AnimatePresence>
    </div>
  );
}
