import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Leaf, Bot, TrendingUp, Globe, Zap, ShieldCheck, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const particles = [];
    const particleCount = 150;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);
    resize();

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 2 + 1;
        this.speedY = Math.random() * 0.5 + 0.2;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = Math.random() > 0.5 ? "#39FF14" : "#00FF88";
      }

      update() {
        this.y -= this.speedY;
        if (this.y < -10) this.reset();
      }

      draw() {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40" />;
};

const StatItem = ({ label, value, suffix = "" }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center animate-on-scroll">
      <div className="stat-number text-6xl md:text-7xl font-bold text-[var(--eco-electric)] mb-2">
        {value}{suffix}
      </div>
      <div className="text-secondary text-sm uppercase tracking-[0.2em] font-medium">
        {label}
      </div>
    </div>
  );
};

export default function Landing() {
  const observerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[var(--eco-black)] overflow-x-hidden">
      {/* Aurora Background Blobs */}
      <div className="aurora-blob top-[-10%] left-[-10%]" />
      <div className="aurora-blob bottom-[20%] right-[-10%] opacity-50" />
      
      {/* Particle Background */}
      <ParticleBackground />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <div className="max-w-5xl w-full text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 border-[var(--glass-border)]"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--eco-neon)] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--eco-neon)] mono">
              2.4M Tons CO2 Tracked
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl leading-[1.1] mb-8 bg-gradient-to-b from-white to-[var(--text-secondary)] bg-clip-text text-transparent">
            Guarding Earth <br /> With <span className="text-[var(--eco-electric)]">AI Precision</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed">
            Carbon Guardian uses advanced neural networks to track your environmental footprint in real-time, 
            turning climate consciousness into climate action.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/app/dashboard" className="btn-primary w-full sm:w-auto">
              Start Protecting <ChevronRight size={20} />
            </Link>
            <Link to="/app/simulation" className="px-8 py-[14px] rounded-full border border-[var(--glass-border)] text-white font-bold hover:bg-white/5 transition-all w-full sm:w-auto">
              Try Simulation
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <ChevronRight size={24} className="rotate-90" />
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-32 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl mb-4">Intelligent Ecosystem</h2>
          <p className="text-[var(--text-secondary)]">Powered by proprietary AI models trained on global climate data.</p>
        </div>

        <div className="bento-grid">
          <div className="bento-card col-span-4 md:col-span-2 row-span-2 group">
            <div className="p-3 bg-[var(--eco-dark)] rounded-2xl w-fit mb-6 border border-[var(--glass-border)]">
              <Bot className="text-[var(--eco-neon)]" size={32} />
            </div>
            <h3 className="text-3xl mb-4">Autonomous Recommendations</h3>
            <p className="text-[var(--text-secondary)] text-lg mb-8">
              Our AI engine analyzes your daily habits and commute patterns to suggest high-impact carbon reductions without compromising your lifestyle.
            </p>
            <div className="relative h-40 bg-[var(--eco-darkest)] rounded-xl border border-[var(--glass-border)] overflow-hidden">
               <div className="absolute inset-0 bg-grid-white/[0.02]" />
               <div className="absolute bottom-0 left-0 right-0 p-4 font-mono text-[10px] text-[var(--eco-neon)]">
                  {">"} analyzing_commute_data... [OK]<br/>
                  {">"} identifying_savings_potential... [2.4kg]<br/>
                  {">"} generating_route_optimizations... [READY]
               </div>
            </div>
          </div>

          <div className="bento-card col-span-4 md:col-span-2 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-[var(--eco-dark)] rounded-lg border border-[var(--glass-border)]">
                <TrendingUp className="text-[var(--eco-electric)]" size={20} />
              </div>
              <h3 className="text-xl">Real-time Impact</h3>
            </div>
            <p className="text-[var(--text-secondary)]">Watch your carbon footprint shrink in real-time as you complete eco-friendly actions.</p>
          </div>

          <div className="bento-card col-span-4 md:col-span-1 group">
            <div className="p-2 bg-[var(--eco-dark)] rounded-lg border border-[var(--glass-border)] w-fit mb-4">
              <Globe className="text-[var(--eco-aurora-2)]" size={20} />
            </div>
            <h3 className="text-lg mb-2">Global Leaderboard</h3>
            <p className="text-[var(--text-muted)] text-sm">Compete with users worldwide to top the sustainability charts.</p>
          </div>

          <div className="bento-card col-span-4 md:col-span-1 group">
            <div className="p-2 bg-[var(--eco-dark)] rounded-lg border border-[var(--glass-border)] w-fit mb-4">
              <Zap className="text-[var(--eco-sun)]" size={20} />
            </div>
            <h3 className="text-lg mb-2">Smart Rewards</h3>
            <p className="text-[var(--text-muted)] text-sm">Earn carbon credits redeemable at eco-friendly marketplaces.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 relative bg-[var(--eco-black)] border-y border-[var(--glass-border)] overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(var(--eco-neon) 1px, transparent 1px), linear-gradient(90deg, var(--eco-neon) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <StatItem label="Active Guardians" value="12" suffix="k" />
          <StatItem label="CO2 Reduced" value="840" suffix="t" />
          <StatItem label="Cities Covered" value="150" suffix="+" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="text-8xl md:text-[12rem] font-black text-[var(--eco-surface)] absolute bottom-[-20%] left-1/2 -translate-x-1/2 pointer-events-none select-none">
            GUARDIAN
          </div>
          
          <div className="z-10">
            <div className="flex items-center gap-2 mb-6">
              <Leaf className="text-[var(--eco-neon)]" size={32} />
              <span className="text-2xl font-bold font-syne">CARBON GUARDIAN</span>
            </div>
            <p className="mono text-[var(--text-muted)] text-sm mb-8">BUILT FOR THE PLANET • 2026</p>
            <div className="flex gap-6 text-[var(--text-secondary)]">
              <a href="#" className="hover:text-[var(--eco-neon)] transition-colors">GitHub</a>
              <a href="#" className="hover:text-[var(--eco-neon)] transition-colors">Twitter</a>
              <a href="#" className="hover:text-[var(--eco-neon)] transition-colors">Documentation</a>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 right-0 h-[1px]" 
             style={{ background: 'linear-gradient(90deg, transparent, var(--eco-electric), transparent)' }} />
      </footer>
    </div>
  );
}
