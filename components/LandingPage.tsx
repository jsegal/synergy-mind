
import React, { useEffect, useRef, useState } from 'react';
import { Mic, Zap, Coffee, Car, Users, ArrowRight, Sparkles, CheckCircle2, Loader2, Image as ImageIcon, CreditCard, Coins, ShieldCheck, BatteryCharging, PlugZap, Moon, Target, Lightbulb, BookOpen, Heart, Brain, TrendingUp, HelpCircle, Square, MessageSquare, Gem, Telescope } from 'lucide-react';
import { generateImage } from '../services/geminiService';

interface LandingPageProps {
  onGetStarted: () => void;
}

// --- Helper Components ---

const FadeInSection: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setVisible(entry.isIntersecting));
    });
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const AIImage: React.FC<{ prompt: string; alt: string; className?: string }> = ({ prompt, alt, className }) => {
  const [src, setSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const cacheKey = `sm_img_v4_${btoa(prompt).slice(0, 20)}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached && cached.length > 500) {
        if (isMounted) {
          setSrc(cached);
          setIsLoading(false);
        }
        return;
      }

      try {
        const base64Data = await generateImage(prompt);
        if (!base64Data || base64Data.length < 100) {
          throw new Error("Invalid image data received");
        }

        const dataUrl = `data:image/png;base64,${base64Data}`;

        if (isMounted) {
          try {
              localStorage.setItem(cacheKey, dataUrl);
          } catch (e) {
              console.warn("Storage full or quota exceeded, clearing old images");
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('sm_img_')) {
                  localStorage.removeItem(key);
                }
              }
          }

          setSrc(dataUrl);
          setError(false);
        }
      } catch (e) {
        console.error("Failed to generate image:", e);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [prompt]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-slate-900 border border-slate-800 ${className}`}>
        <div className="flex flex-col items-center gap-3 text-cyan-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xs font-mono uppercase tracking-widest animate-pulse">Visualizing...</span>
        </div>
      </div>
    );
  }

  if (error || !src) {
     return (
        <div className={`flex items-center justify-center bg-slate-800/50 border border-slate-700/30 ${className}`}>
             <div className="flex flex-col items-center gap-2">
                <ImageIcon className="w-12 h-12 text-cyan-800 opacity-50" />
                <span className="text-[10px] text-cyan-700 font-bold uppercase tracking-widest">Visual Unavailable</span>
             </div>
        </div>
     )
  }

  return <img src={src} alt={alt} className={className} />;
};

const RecorderMockup = () => (
  <div className="relative w-full max-w-[280px] md:max-w-[320px] mx-auto aspect-[9/18.5] bg-[#0f172a] rounded-[3rem] border-4 border-slate-800 shadow-[0_0_100px_-20px_rgba(6,182,212,0.3)] overflow-visible flex flex-col p-6">
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 rounded-[2.8rem] pointer-events-none" />

    <div className="absolute -right-8 top-[22%] w-36 p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl shadow-2xl backdrop-blur-md pointer-events-none border-l-cyan-500/50 flex flex-col gap-2">
       <div className="flex items-center gap-2">
          <Gem className="w-3.5 h-3.5 text-cyan-400" />
          <div className="h-1.5 w-full bg-slate-700/50 rounded-full" />
       </div>
       <div className="h-1.5 w-2/3 bg-slate-800/50 rounded-full" />
    </div>

    <div className="relative z-10 flex flex-col h-full">
      <div className="flex items-center justify-between mb-10 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]" />
          <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">LIVE</span>
        </div>
        <div className="px-2.5 py-0.5 bg-slate-800 rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-slate-700">
          PRO
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center space-y-12">
        <div className="w-full h-28 bg-black/40 rounded-2xl border border-cyan-500/10 flex items-center justify-center overflow-hidden">
           <div className="flex items-center gap-1.5 h-12">
              {[0.3, 0.6, 0.4, 0.8, 0.5, 0.7, 0.3, 0.9, 0.6, 0.4, 0.7, 0.3, 0.5, 0.4].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-cyan-400 rounded-full animate-pulse"
                  style={{ height: `${h * 100}%`, animationDelay: `${i * 100}ms` }}
                />
              ))}
           </div>
        </div>

        <div className="text-center">
          <div className="text-[44px] font-mono font-black text-white tracking-tighter leading-none mb-2">04:12</div>
          <div className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">LISTENING...</div>
        </div>

        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center opacity-40">
            <div className="w-4 h-4 bg-slate-600 rounded-sm" />
          </div>
          <div className="w-20 h-20 rounded-full bg-[#e11d48] flex items-center justify-center shadow-[0_0_40px_-10px_rgba(225,29,72,0.6)] ring-8 ring-rose-600/10 transition-transform active:scale-90">
            <Mic className="w-9 h-9 text-white" />
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center">
            <Square className="w-5 h-5 text-rose-500 fill-current" />
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-800/30">
         <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-cyan-600/50 rounded-full" />
         </div>
      </div>
    </div>
  </div>
);

// --- Main Component ---

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="flex flex-col min-h-screen text-white pb-20 overflow-x-hidden bg-[#0f172a]">

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 md:px-12 lg:px-24 py-12 overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-[1400px] w-full grid lg:grid-cols-[1fr_2fr] gap-16 lg:gap-24 items-center">

          <div className="relative flex justify-center lg:justify-start">
             <FadeInSection delay={200} className="w-full">
                <RecorderMockup />
                <div className="mt-10 text-center lg:text-left lg:pl-12">
                   <p className="text-slate-600 font-bold uppercase tracking-[0.4em] text-[11px] opacity-40">VISUAL UNAVAILABLE</p>
                </div>
             </FadeInSection>
          </div>

          <div className="text-left space-y-12 flex flex-col items-start lg:pr-12">
            <FadeInSection>
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 text-[11px] font-black backdrop-blur-md uppercase tracking-[0.35em] shadow-lg">
                <Sparkles className="w-4 h-4" />
                <span>3,000 FREE CREDITS!</span>
              </div>
            </FadeInSection>

            <div className="space-y-6">
              <h1 className="text-[60px] md:text-[80px] lg:text-[110px] font-black tracking-tighter leading-[0.82] text-white">
                Capture Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-400">
                  Great Ideas!
                </span>
              </h1>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <h2 className="text-2xl md:text-3xl lg:text-[40px] font-black text-cyan-400 uppercase tracking-[0.15em]">
                  WITH SYNERGYMIND!
                </h2>
                <span className="text-slate-500 text-xl md:text-2xl lg:text-[32px] font-bold uppercase tracking-[0.3em] opacity-80">
                  IN-PERSON RECORDER
                </span>
              </div>
            </div>

            <p className="text-2xl md:text-3xl lg:text-[38px] text-slate-300 font-medium max-w-4xl leading-[1.2] tracking-tight">
              Don't let your best ideas evaporate.<br className="hidden md:block" />
              Capture your thoughts and conversations, and let SynergyMind<br className="hidden md:block" />
              turn them into clear breakthroughs that empower your future.
            </p>

            <div className="pt-10 flex flex-col sm:flex-row items-center gap-10 w-full lg:w-auto">
              <button
                onClick={onGetStarted}
                className="group relative inline-flex items-center gap-6 px-14 py-7 bg-[#0891b2] text-white rounded-[2.5rem] font-black text-[28px] hover:bg-cyan-500 transition-all shadow-[0_20px_50px_-15px_rgba(6,182,212,0.5)] active:scale-[0.98] w-full sm:w-auto justify-center"
              >
                Start Recording Now
                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
              </button>

              <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1.5 opacity-60">
                 <span className="text-xs font-black text-cyan-400 uppercase tracking-[0.45em]">INSTANT ACCESS</span>
                 <span className="text-xs font-black text-slate-500 uppercase tracking-[0.45em]">NO CREDIT CARD REQUIRED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scenario Preview Section */}
      <section className="py-32 bg-[#020617] border-t border-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
           <FadeInSection className="text-center max-w-4xl mx-auto space-y-8">
              <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Turn talk into strategy.</h3>
              <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed">
                Whether you're in the car, at the office, or grabbing coffee, SynergyMind captures the nuance and extracts the value from every conversation.
              </p>
           </FadeInSection>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
