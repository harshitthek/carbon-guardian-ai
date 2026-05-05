import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, User, ArrowRight, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, name);
      navigate(from, { replace: true });
    } catch (err) {
      setError('System failure: Authentication protocol offline.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setEmail('user@gmail.com');
    setName('Eco Guardian');
  };

  return (
    <div className="min-h-screen bg-[var(--eco-black)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="aurora-blob top-[-20%] left-[-10%] opacity-40" />
      <div className="aurora-blob bottom-[-20%] right-[-10%] opacity-20" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-card p-10 border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[0_0_50px_rgba(0,255,136,0.05)]">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-[var(--eco-dark)] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[var(--glass-border)] shadow-[0_0_15px_rgba(57,255,20,0.2)]">
              <Leaf className="text-[var(--eco-neon)]" size={32} />
            </div>
            <h2 className="text-3xl font-bold mb-2">Initialize <span className="text-[var(--eco-neon)]">Guardian</span></h2>
            <p className="text-[var(--text-muted)] text-sm uppercase tracking-widest mono font-bold">Secure Access Uplink</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs mono">
                [ERR] {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--eco-neon)] transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Guardian Email"
                  className="w-full bg-[var(--eco-darkest)] border border-[var(--glass-border)] rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--eco-neon)] transition-all mono text-sm text-[var(--text-primary)]"
                  required
                />
              </div>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--eco-neon)] transition-colors" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Guardian Name (Optional)"
                  className="w-full bg-[var(--eco-darkest)] border border-[var(--glass-border)] rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--eco-neon)] transition-all mono text-sm text-[var(--text-primary)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full group"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--eco-black)] border-t-transparent" />
              ) : (
                <>Establish Link <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="mt-10">
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute w-full h-[1px] bg-[var(--glass-border)]" />
              <span className="relative px-4 bg-[#0d1a0f] text-[10px] mono text-[var(--text-muted)] uppercase tracking-widest font-bold">Alternative Uplinks</span>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl border border-[var(--glass-border)] hover:bg-white/5 transition-all text-sm font-bold text-[var(--text-secondary)]"
            >
              <Globe size={18} className="text-[var(--eco-mint)]" />
              Authenticate with Google (Mock)
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-[var(--text-muted)] mono uppercase tracking-[0.2em]">
          Uplink Security: Grade A // Verified by Eco-Core
        </p>
      </motion.div>
    </div>
  );
}
