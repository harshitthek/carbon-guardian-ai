import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
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
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Leaf, label: "My Profile", path: "/profile" },
  { icon: Bot, label: "Plan Route", path: "/recommender" },
  { icon: CloudSun, label: "Live Impact", path: "/live-impact" },
  { icon: Trophy, label: "Rewards", path: "/rewards" },
  { icon: Users, label: "Community", path: "/community", badge: "New" },
  { icon: Store, label: "Marketplace", path: "/marketplace" },
  { icon: CheckSquare, label: "Simulation Lab", path: "/simulation" },
];

export default function AppLayout() {
  const [profile, setProfile] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    api.profile().then(setProfile);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-emerald-900 text-emerald-50 flex flex-col shadow-xl z-20 shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="text-3xl">🌍</div>
          <h1 className="text-xl font-bold leading-tight">
            Carbon<br />Guardian AI
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4 scrollbar-hide">
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-800 text-white shadow-inner font-medium"
                    : "text-emerald-100/70 hover:bg-emerald-800/50 hover:text-white"
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
          {isAdmin && (
             <NavLink
               to="/admin"
               className={({ isActive }) =>
                 `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mt-4 ${
                   isActive
                     ? "bg-amber-600 text-white shadow-inner font-medium"
                     : "text-emerald-100/70 hover:bg-emerald-800/50 hover:text-white"
                 }`
               }
             >
               <ShieldAlert size={20} className={location.pathname.startsWith('/admin') ? "text-white" : "text-amber-400"} />
               <span className={location.pathname.startsWith('/admin') ? "text-white" : "text-amber-400 font-medium"}>Admin Panel</span>
             </NavLink>
          )}
        </nav>

        <div className="p-4 mx-4 mb-6 bg-emerald-800/40 rounded-xl border border-emerald-700/50 backdrop-blur-sm">
          <strong className="text-sm font-semibold text-emerald-300 block mb-1">Today’s Tip</strong>
          <p className="text-xs text-emerald-100/90 leading-relaxed mb-3">
            Using metro instead of car today can save <b className="text-white">2.4 kg CO₂</b>
          </p>
          <button className="w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg transition-colors">
            Know More
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-50">

        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-6 flex-1">
            <button className="text-slate-500 hover:text-emerald-600 transition-colors hidden md:block">
              <Menu size={24} />
            </button>
            <div className="relative max-w-md w-full">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full bg-slate-100 text-sm rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 ml-auto">
            <button className="relative text-slate-500 hover:text-emerald-600 transition-colors">
              <Bell size={22} />
              <span className="absolute 1 top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {profile && (
              <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
                <Bot size={18} className="text-emerald-500" />
                <span className="text-xs font-medium">
                  Points <b className="text-emerald-700 text-sm ml-1">{profile.green_points.toLocaleString()}</b>
                </span>
              </div>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold shadow-sm overflow-hidden">
                    {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user.name[0]}
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-sm font-semibold text-slate-700 leading-tight">Hi, {user.name}</div>
                    <div className="text-xs text-slate-500 capitalize">{user.role}</div>
                  </div>
                  <ChevronDown size={16} className="text-slate-400 hidden md:block" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        <LogOut className="mr-3 h-4 w-4 text-gray-400" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
            )}
          </div>
        </header>

        {/* Page Content with Transitions */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              <Outlet context={{ profile }} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
