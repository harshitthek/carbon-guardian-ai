import React, { useState, useEffect, useRef } from "react";
import { Bot, MapPin, Navigation, Send, Loader2, Sparkles, AlertCircle, History, ChevronRight, X, Terminal } from "lucide-react";
import { api } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

const TypewriterText = ({ text, delay = 15 }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText((prev) => text.substring(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, delay);
    return () => clearInterval(timer);
  }, [text, delay]);

  return (
    <span>
      {displayedText}
      <span className="cursor-blink" />
    </span>
  );
};

export default function Recommender() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const terminalEndRef = useRef(null);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [response, loading, history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userPrompt = prompt;
    setPrompt("");
    setLoading(true);
    setHistory(prev => [...prev, { type: 'user', content: userPrompt }]);
    
    try {
      const data = await api.recommend(userPrompt);
      setHistory(prev => [...prev, { type: 'ai', content: data.recommendation }]);
    } catch (error) {
      setHistory(prev => [...prev, { type: 'error', content: "CRITICALERR: FAILED TO RETRIEVE CLIMATE DATA. RETRYING_PROTOCOL..." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[var(--glass-border)] pb-8">
        <div>
          <h2 className="text-4xl mb-2">Protocol <span className="text-[var(--eco-neon)]">AI</span></h2>
          <p className="text-[var(--text-secondary)] text-sm uppercase tracking-widest mono">Autonomous Recommendation Kernel</p>
        </div>
        <div className="p-4 bg-[var(--eco-dark)] rounded-3xl border border-[var(--glass-border)] shadow-[0_0_20px_rgba(57,255,20,0.05)]">
          <Terminal className="text-[var(--eco-neon)]" size={32} />
        </div>
      </div>

      <div className="ai-terminal h-[600px] flex flex-col shadow-2xl relative overflow-hidden group">
        {/* Terminal Header */}
        <div className="bg-[#0a0f0a] px-5 py-3 flex items-center justify-between border-b border-[var(--glass-border)] z-10">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <div className="text-[10px] font-bold mono uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--eco-neon)] animate-pulse" />
            LIVE_UPLINK_ESTABLISHED // CG-OS 4.6
          </div>
        </div>

        {/* Scanline Texture Layer */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-0" 
             style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #39FF14 2px, #39FF14 4px)' }} />

        {/* Terminal Body */}
        <div className="flex-1 p-8 overflow-y-auto font-mono text-sm space-y-6 scrollbar-hide relative z-10">
          <div className="text-[var(--text-muted)] animate-pulse">
            [SYS] Booting Carbon Guardian AI Recommendation Kernel...<br/>
            [SYS] Analyzing atmospheric carbon density... [OK]<br/>
            [SYS] Synchronizing with local transport grids... [OK]<br/>
            [SYS] System ready. Enter parameters for optimization.
          </div>

          <div className="space-y-6">
            {history.map((item, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                key={idx} 
                className="space-y-2"
              >
                {item.type === 'user' ? (
                  <div className="flex gap-3 text-[var(--eco-electric)]">
                    <span className="text-[var(--text-muted)] font-bold">{">"}</span>
                    <span className="font-bold uppercase tracking-wider">{item.content}</span>
                  </div>
                ) : item.type === 'ai' ? (
                  <div className="bg-[var(--eco-dark)]/20 p-5 rounded-2xl border border-[var(--glass-border)] text-[var(--eco-neon)] leading-relaxed relative">
                    <div className="absolute -left-2 top-4 w-4 h-4 bg-[var(--eco-dark)] rotate-45 border-l border-b border-[var(--glass-border)]" />
                    <TypewriterText text={item.content} />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[var(--eco-danger)] bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <AlertCircle size={14} />
                    <span>{item.content}</span>
                  </div>
                )}
              </motion.div>
            ))}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-[var(--eco-neon)] mono animate-pulse"
              >
                <Loader2 className="animate-spin" size={16} />
                <span>COMPUTING_FOOTPRINT_VECTORS...</span>
              </motion.div>
            )}
          </div>
          <div ref={terminalEndRef} />
        </div>

        {/* Terminal Input */}
        <div className="p-6 bg-[#050a05] border-t border-[var(--glass-border)] relative z-10">
          <form onSubmit={handleSubmit} className="relative group">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--eco-neon)] font-bold mono group-focus-within:animate-ping transition-all">
              {">"}
            </span>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Command: optimize route / analyze footprint / suggest impact..."
              className="w-full bg-[#081108] border border-[var(--glass-border)] rounded-2xl py-4 pl-12 pr-16 focus:outline-none focus:border-[var(--eco-neon)] focus:ring-4 focus:ring-[var(--eco-neon)]/5 transition-all mono text-sm text-[var(--eco-electric)] placeholder:text-[var(--text-muted)]"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-[var(--eco-neon)] text-[var(--eco-black)] rounded-xl disabled:opacity-30 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(57,255,20,0.3)]"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Suggested Protocols */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-[0.3em] ml-2">Available Protocols</h3>
        <div className="flex flex-wrap gap-3">
          {[
            "Plan green route from Borivali to Colaba",
            "Suggest reduction for daily electricity usage",
            "Analyze carbon impact of red meat consumption",
            "List carbon credit marketplace partners"
          ].map((suggest, i) => (
            <button
              key={i}
              onClick={() => setPrompt(suggest)}
              className="px-5 py-2.5 rounded-2xl glass-card border-[var(--glass-border)] text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] hover:border-[var(--eco-neon)] hover:text-[var(--eco-neon)] hover:bg-[var(--eco-neon)]/5 transition-all"
            >
              EXEC: {suggest.substring(0, 20)}...
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
