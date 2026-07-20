import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import {
  Bell,
  Bot,
  CheckSquare,
  CloudSun,
  Home,
  Leaf,
  Menu,
  Search,
  Settings,
  Store,
  Trophy,
  Users,
  ChevronDown,
  LogOut,
  ShieldAlert,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { icon: Home, label: "Dashboard", path: "/app/dashboard" },
  { icon: Leaf, label: "Profile", path: "/app/profile" },
  { icon: Bot, label: "Planner", path: "/app/recommender" },
  { icon: CloudSun, label: "Impact", path: "/app/live-impact" },
  { icon: Trophy, label: "Rewards", path: "/app/rewards" },
  { icon: Users, label: "Community", path: "/app/community" },
  { icon: Store, label: "Market", path: "/app/marketplace" },
  { icon: CheckSquare, label: "Lab", path: "/app/simulation" },
];

export default function AppLayout() {
  const [profile, setProfile] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const profileApi = useApi(api.profile);

  useEffect(() => {
    profileApi.execute();
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--eco-black)] text-[var(--text-primary)] font-sans selection:bg-[var(--eco-neon)] selection:text-[var(--eco-black)]">
      {/* Floating Navbar */}
      <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-[1000] transition-all duration-500 w-[90%] max-w-fit`}>
        <div className={`glass-card flex items-center gap-2 px-6 py-3 rounded-full border-[var(--glass-border)] ${isScrolled ? 'bg-[rgba(10,15,10,0.8)] shadow-[0_0_40px_rgba(0,255,136,0.1)]' : ''}`}>
          <Link to="/" className="flex items-center gap-2 mr-6 group">
            <motion.div whileHover={{ rotate: 20 }}>
              <Leaf className="text-[var(--eco-electric)]" size={24} />
            </motion.div>
            <span className="text-sm font-bold tracking-tight hidden sm:block font-syne uppercase">Carbon Guardian</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? "bg-[var(--eco-surface)] text-[var(--eco-neon)] border border-[var(--glass-border)] shadow-[0_0_15px_rgba(57,255,20,0.1)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
                  }`
                }
              >
                <item.icon size={14} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-[var(--glass-border)]">
             <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--eco-neon)] transition-colors">
                <Search size={18} />
             </button>
             
             {user && (
               <div className="relative">
                 <button
                   onClick={() => setShowDropdown(!showDropdown)}
                   className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--eco-electric)] to-[var(--eco-mint)] flex items-center justify-center text-[var(--eco-black)] font-bold text-xs shadow-lg overflow-hidden border border-[var(--glass-border)]"
                 >
                   {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user.name[0]}
                 </button>
                 
                 <AnimatePresence>
                   {showDropdown && (
                     <motion.div
                       initial={{ opacity: 0, y: 10, scale: 0.95 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, y: 10, scale: 0.95 }}
                       className="absolute right-0 mt-4 w-48 glass-card border-[var(--glass-border)] p-2 shadow-2xl overflow-hidden"
                     >
                       <div className="px-4 py-3 border-b border-[var(--glass-border)] mb-2">
                         <p className="text-xs font-bold text-[var(--text-primary)]">{user.name}</p>
                         <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{user.role}</p>
                       </div>
                       {isAdmin && (
                         <NavLink to="/app/admin" className="flex items-center gap-3 px-4 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--eco-neon)] hover:bg-white/5 rounded-lg transition-colors">
                           <ShieldAlert size={14} /> Admin Panel
                         </NavLink>
                       )}
                       <button
                         onClick={handleLogout}
                         className="flex w-full items-center gap-3 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                       >
                         <LogOut size={14} /> Sign out
                       </button>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
             )}

             <button 
               className="lg:hidden p-2 text-[var(--text-secondary)]"
               onClick={() => setIsMobileMenuOpen(true)}
             >
                <Menu size={20} />
             </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[2000] bg-[rgba(10,15,10,0.95)] backdrop-blur-xl p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-2">
                <Leaf className="text-[var(--eco-neon)]" size={32} />
                <span className="text-xl font-bold font-syne uppercase">Guardian</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/5 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {navLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 p-4 rounded-2xl text-lg font-bold transition-all ${
                      isActive ? "bg-[var(--eco-surface)] text-[var(--eco-neon)]" : "text-[var(--text-secondary)]"
                    }`
                  }
                >
                  <item.icon size={24} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
        <AnimatePresence mode="wait">
          {profileApi.loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-64"
            >
              <div className="flex flex-col items-center gap-4">
                <Leaf className="text-[var(--eco-neon)] animate-pulse" size={32} />
                <p className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-widest">Synchronizing Guardian Data...</p>
              </div>
            </motion.div>
          )}
          
          {profileApi.error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-64"
            >
              <div className="flex flex-col items-center gap-4 text-center max-w-md p-8 glass-card border-[var(--eco-danger)]/30">
                <ShieldAlert className="text-[var(--eco-danger)]" size={32} />
                <h3 className="text-xl font-bold">Connection Terminated</h3>
                <p className="text-sm text-[var(--text-secondary)]">{profileApi.error}</p>
                <button 
                  onClick={() => profileApi.execute()} 
                  className="mt-4 px-6 py-2 bg-[var(--eco-danger)]/20 text-[var(--eco-danger)] hover:bg-[var(--eco-danger)] hover:text-white rounded-full font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  Re-Establish Uplink
                </button>
              </div>
            </motion.div>
          )}

          {profileApi.data && (
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet context={{ profile: profileApi.data }} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Subtle Footer for App Pages */}
      <footer className="py-10 border-t border-[var(--glass-border)] text-center text-[var(--text-muted)] text-[10px] mono uppercase tracking-[0.2em]">
        Built for the Planet • Carbon Guardian AI • 2026
      </footer>
    </div>
  );
}

