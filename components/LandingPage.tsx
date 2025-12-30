
import React, { useEffect, useRef, useState } from 'react';
import { Mic, Zap, Coffee, Car, Users, ArrowRight, Sparkles, CircleCheck as CheckCircle2, Loader as Loader2, Image as ImageIcon, CreditCard, Coins, ShieldCheck, BatteryCharging, PlugZap, Moon, Target, Lightbulb, BookOpen, Heart, Brain, TrendingUp, Circle as HelpCircle, Square, MessageSquare, Gem, Telescope, Quote } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onShowPrivacy: () => void;
  onShowTerms: () => void;
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
  return (
    <div className={`flex items-center justify-center bg-slate-800/50 border border-slate-700/30 ${className}`}>
      <div className="flex flex-col items-center gap-2">
        <ImageIcon className="w-12 h-12 text-cyan-800 opacity-50" />
        <span className="text-[10px] text-cyan-700 font-bold uppercase tracking-widest">Visual Unavailable</span>
      </div>
    </div>
  );
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
          <div className="text-[44px] font-mono font-black text-white tracking-tighter leading-none mb-2">04:17</div>
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

const SagesData = [
  { name: "Marcus Aurelius", title: "Stoic Emperor", desc: "Practical wisdom on leadership, adversity, and self-discipline." },
  { name: "Benjamin Franklin", title: "Founding Father", desc: "Business acumen, human relationships, and productivity." },
  { name: "Warren Buffett", title: "Oracle of Omaha", desc: "Strategic decision-making, long-term thinking, and business principles." },
  { name: "Peter Drucker", title: "Management Legend", desc: "Business strategy, personal effectiveness, and leadership." },
  { name: "Maya Angelou", title: "Poet & Author", desc: "Resilience, human relationships, and profound personal growth." },
  { name: "Dale Carnegie", title: "Influence Expert", desc: "Persuasion, communication, and building lasting relationships." },
  { name: "Viktor Frankl", title: "Psychiatrist", desc: "Finding meaning and maintaining perspective in adversity." },
  { name: "Brené Brown", title: "Researcher", desc: "Vulnerability, leadership, and courage in relationships." },
  { name: "Lao Tzu", title: "Ancient Philosopher", desc: "Balance, quiet leadership, and the power of simplicity." },
  { name: "Jim Rohn", title: "Business Philosopher", desc: "Personal development, goal-setting, and success principles." },
];

const InteractiveBrainTrust: React.FC = () => {
  const [hoveredSage, setHoveredSage] = useState<number | null>(null);

  const hotspots = [
    { id: 0, name: "Marcus Aurelius", top: "55%", left: "10%" },
    { id: 1, name: "Benjamin Franklin", top: "60%", left: "30%" },
    { id: 2, name: "Warren Buffett", top: "58%", left: "48%" },
    { id: 3, name: "Peter Drucker", top: "62%", left: "62%" },
    { id: 4, name: "Maya Angelou", top: "60%", left: "80%" },
    { id: 5, name: "Dale Carnegie", top: "20%", left: "20%" },
    { id: 6, name: "Viktor Frankl", top: "28%", left: "38%" },
    { id: 7, name: "Brené Brown", top: "25%", left: "56%" },
    { id: 8, name: "Lao Tzu", top: "25%", left: "70%" },
    { id: 9, name: "Jim Rohn", top: "35%", left: "92%" },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {hotspots.map((spot) => {
        const sage = SagesData[spot.id];
        const isHovered = hoveredSage === spot.id;
        const leftPercent = parseFloat(spot.left);

        let tooltipPosition = 'left-1/2 -translate-x-1/2';
        if (leftPercent < 25) {
          tooltipPosition = 'left-0';
        } else if (leftPercent > 75) {
          tooltipPosition = 'right-0';
        }

        return (
          <div
            key={spot.id}
            className="absolute pointer-events-auto"
            style={{ top: spot.top, left: spot.left, transform: 'translate(-50%, -50%)' }}
            onMouseEnter={() => setHoveredSage(spot.id)}
            onMouseLeave={() => setHoveredSage(null)}
          >
            <div className="relative">
              <div className={`w-16 h-16 rounded-full border-4 cursor-pointer transition-all ${
                isHovered
                  ? 'border-cyan-400 bg-cyan-400/20 scale-110 shadow-[0_0_30px_rgba(6,182,212,0.6)]'
                  : 'border-transparent bg-transparent hover:border-cyan-500/50'
              }`} />

              {isHovered && (
                <div className={`absolute ${tooltipPosition} top-full mt-4 w-72 bg-slate-900 border-2 border-cyan-400 rounded-2xl p-5 shadow-2xl z-50 pointer-events-none`}>
                  <div className={`absolute -top-2 w-4 h-4 bg-slate-900 border-l-2 border-t-2 border-cyan-400 rotate-45 ${
                    leftPercent < 25 ? 'left-8' : leftPercent > 75 ? 'right-8' : 'left-1/2 -translate-x-1/2'
                  }`} />
                  <div className="text-cyan-400 font-black text-xl mb-2">{sage.name}</div>
                  <div className="text-cyan-500/60 font-black uppercase text-[10px] tracking-widest mb-3">{sage.title}</div>
                  <p className="text-slate-300 text-xs font-medium leading-relaxed">{sage.desc}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- Main Component ---

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onShowPrivacy, onShowTerms }) => {
  return (
    <div className="flex flex-col w-full text-white pb-20 overflow-x-hidden bg-[#0f172a]">

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 md:px-12 lg:px-24 py-12 overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-[1400px] w-full grid lg:grid-cols-[1fr_2fr] gap-16 lg:gap-24 items-center">

          <div className="relative flex justify-center lg:justify-start">
             <FadeInSection delay={200} className="w-full">
                <RecorderMockup />
             </FadeInSection>
          </div>

          <div className="text-left space-y-3 flex flex-col items-start lg:pr-12">
            <FadeInSection>
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 text-[11px] font-black backdrop-blur-md uppercase tracking-[0.35em] shadow-lg">
                <Sparkles className="w-4 h-4" />
                <span>3,000 FREE CREDITS!</span>
              </div>
            </FadeInSection>

            <div className="space-y-2">
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
                <span className="text-yellow-500 text-lg md:text-xl lg:text-2xl font-normal leading-[1.4]">
                  Recording Your Great Ideas and Making Them Even Greater! Take Your AI Advisory Team that Represents 1000 Years of Accumulated Wisdom With You To Guide You Wherever You Go.
                </span>
                <div className="text-red-500 text-[28px] font-black uppercase tracking-wider mt-2 pt-2 pb-1 border-t-[2px] border-b-[2px] border-cyan-400">
                  YOUR IN-PERSON RECORDER & ADVISOR
                </div>
              </div>
            </div>

            <p className="text-lg md:text-xl lg:text-2xl text-slate-300 font-normal max-w-4xl leading-[1.4]">
              Don't let your best ideas evaporate.<br className="hidden md:block" />
              Capture your thoughts and conversations, and let SynergyMind<br className="hidden md:block" />
              turn them into clear breakthroughs that empower your future.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-10 w-full lg:w-auto">
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

      {/* Scenarios / Scenarios Section */}
      <section className="py-32 bg-[#020617] relative overflow-hidden border-t border-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 space-y-40">

          <div className="text-center space-y-6 max-w-5xl mx-auto">
             <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">Your Synergy Scenarios</h2>
             <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed">
               Where were you the last time a truly great idea came to you? Wherever you are, whatever you're doing, SynergyMind is your always-on wise, caring, and intelligent companion.
             </p>
          </div>

          {/* Scenario 1: Driving */}
          <FadeInSection className="grid md:grid-cols-2 gap-20 items-center">
             <div className="space-y-8">
                <div className="w-16 h-16 bg-cyan-600/20 rounded-3xl flex items-center justify-center border border-cyan-500/30">
                  <Car className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-5xl font-black leading-none">The Commute <br/><span className="text-cyan-400">Breakthrough</span></h3>
                <div className="space-y-6">
                  <p className="text-2xl text-slate-100 font-medium leading-relaxed">
                    You're having an incredible conversation while on a long drive. Everyone is coming up with important points and great ideas. The SynergyMind app uses programming from some of the greatest minds from today and from history to take those ideas to another level, delivering brilliant insights and solutions to help you succeed.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-cyan-500 font-black uppercase tracking-widest text-sm">
                   <Target className="w-5 h-5" /> Goal: Capture Every Great Insight
                </div>
             </div>
             <div className="rounded-[3rem] overflow-hidden border-2 border-slate-800 shadow-2xl group hover:border-cyan-500/30 transition-all bg-slate-900">
                <img
                  src="https://josephsegal.com/wp-content/uploads/2025/12/the-commute-scenario-image.png"
                  alt="Recording while driving"
                  className="w-full aspect-square object-cover"
                />
             </div>
          </FadeInSection>

          {/* Scenario 2: Coffee Shop */}
          <FadeInSection className="grid md:grid-cols-2 gap-20 items-center">
             <div className="md:order-2 space-y-8">
                <div className="w-16 h-16 bg-purple-600/20 rounded-3xl flex items-center justify-center border border-purple-500/30">
                  <Coffee className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-5xl font-black leading-none">The Coffee <br/><span className="text-purple-400">Connection</span></h3>
                <p className="text-2xl text-slate-100 font-medium leading-relaxed">
                  Brainstorming with a partner in a busy café? SynergyMind allows you to be 100% present with someone, without having to worry about taking notes or dealing with a laptop. It captures the whole conversation. SynergyMind identifies what's important to each of you and generates a thought provoking breakthrough insight to help you!
                </p>
                <div className="flex items-center gap-4 text-purple-500 font-black uppercase tracking-widest text-sm">
                   <Users className="w-5 h-5" /> Goal: Deep Collaboration
                </div>
             </div>
             <div className="md:order-1 rounded-[3rem] overflow-hidden border-2 border-slate-800 shadow-2xl group hover:border-purple-500/30 transition-all bg-slate-900">
                <img
                  src="https://josephsegal.com/wp-content/uploads/2025/12/coffee-shop-conversation.png"
                  alt="Recording a collaboration"
                  className="w-full aspect-square object-cover"
                />
             </div>
          </FadeInSection>
        </div>
      </section>

      {/* The Wisdom Engine Section */}
      <section className="py-32 bg-[#0f172a] border-y border-slate-800/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center space-y-6 mb-8">
             <p className="text-xl md:text-2xl text-slate-300 mb-8 font-medium leading-relaxed">
                It's said you become like the 5 people you spend the most time with. <br />
                Imagine spending your time with these great minds!
             </p>
             <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-sm font-black uppercase tracking-widest">
                <Brain className="w-4 h-4" /> The Wisdom Engine
             </div>
             <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">A Pantheon of Perspective</h2>
             <p className="text-xl md:text-2xl text-slate-400 max-w-4xl mx-auto font-medium leading-relaxed">
                Transform your ideas with wisdom from the greatest thinkers <br />
                in history and our contemporary world. <br />
                You'll love the new insights and suggestions <br />
                you will receive when you use SynergyMind!
             </p>
          </div>

          <div className="text-center mb-8">
             <p className="text-yellow-500 text-lg md:text-xl font-medium leading-relaxed">
                Marcus Aurelius • Benjamin Franklin • Warren Buffett • Peter Drucker <br />
                Maya Angelou • Dale Carnegie • Viktor Frankl <br />
                Brené Brown • Lao Tzu • Jim Rohn
             </p>
          </div>

          <div className="mb-16 rounded-[3rem] overflow-hidden border-2 border-slate-800 shadow-2xl mx-auto max-w-5xl relative group/image">
            <img
              src="https://josephsegal.com/wp-content/uploads/2025/12/breakthrough-brain-trust.png"
              alt="Breakthrough Brain Trust"
              className="w-full h-auto"
            />
            {/* Interactive Hotspots - positioned over each person */}
            <InteractiveBrainTrust />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
             {SagesData.map((sage, i) => (
               <div key={i} className="bg-slate-950 border border-slate-800/50 p-8 rounded-3xl group hover:border-cyan-500/30 transition-all flex flex-col space-y-4">
                  <div className="text-cyan-400 font-black text-xl leading-tight group-hover:text-white transition-colors">{sage.name}</div>
                  <div className="text-cyan-500/60 font-black uppercase text-[10px] tracking-widest">{sage.title}</div>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed pt-2 border-t border-slate-900 group-hover:text-slate-200">{sage.desc}</p>
               </div>
             ))}
          </div>

          <div className="mt-12 text-center">
             <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-4xl mx-auto">
                We have made an effort to encapsulate some of the wisdom and styles of approaching problem solving of these great people in this personal recorder and advisor app. They are not in any way associated with or endorsing this app.
             </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-[#020617] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">Frequently Asked Questions</h2>
            <p className="text-xl md:text-2xl text-cyan-400 max-w-2xl mx-auto font-medium">
              Everything you need to know about SynergyMind
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Mic className="w-8 h-8 text-cyan-400" />,
                question: "What gets recorded?",
                answer: "SynergyMind focuses exclusively on audio. We capture the nuance, tone, and spoken logic of your thoughts or conversations. No video is recorded, keeping the experience lightweight and focused on intelligence."
              },
              {
                icon: <Zap className="w-8 h-8 text-cyan-400" />,
                question: "How fast are the insights?",
                answer: "Our Gemini-driven engine delivers your full 'Trinity of Insight' report in under 10 seconds. You receive a verbatim transcript, a value-summary, and a customized execution roadmap immediately after you stop recording."
              },
              {
                icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
                question: "Is my data private?",
                answer: "Completely. SynergyMind uses zero-knowledge local storage. Your recordings and insights live in your browser's secure vault, not on our servers. Your brilliance stays between you and the AI."
              },
              {
                icon: <Moon className="w-8 h-8 text-blue-400" />,
                question: "Does it work on mobile?",
                answer: "Yes. SynergyMind is a high-performance PWA. You can 'Add to Home Screen' on any iPhone or Android device for a full-screen, native-app experience without visiting an app store."
              },
              {
                icon: <Users className="w-8 h-8 text-yellow-400" />,
                question: "Who benefits most?",
                answer: "Entrepreneurs mapping out new ventures, creatives brainstorming collaboration, and professionals who want to turn high-stakes meetings into actionable strategy without taking manual notes."
              },
              {
                icon: <Coins className="w-8 h-8 text-rose-400" />,
                question: "How does pricing work?",
                answer: "New users start with 3,000 free credits. Each recording session costs 500 credits. Recharges are simple: $15.00 for an additional 3,000 credits. No monthly subscriptions, just pay for the value you use."
              }
            ].map((faq, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800/50 p-8 rounded-3xl space-y-6 hover:border-cyan-500/30 transition-all group">
                <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800/50 group-hover:border-cyan-500/30 transition-all">
                  {faq.icon}
                </div>
                <h3 className="text-2xl font-black text-white">{faq.question}</h3>
                <p className="text-slate-400 font-medium leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center bg-[#020617]">
        <FadeInSection>
          <div className="max-w-5xl mx-auto bg-gradient-to-b from-slate-900 to-[#020617] p-16 rounded-[3rem] border border-slate-800/50 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500" />

            <h2 className="text-4xl md:text-5xl font-black mb-8 text-white uppercase tracking-tighter">Your Future Starts with a Recording.</h2>
            <p className="text-cyan-100 mb-10 text-xl max-w-3xl mx-auto font-medium leading-relaxed">
              Join the thinkers, the doers, and the dreamers using SynergyMind to map their journey and achieve more.
            </p>

            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-4 px-12 py-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-black text-2xl transition-all shadow-lg shadow-cyan-900/40 hover:scale-105 active:scale-95"
            >
              <Mic className="w-8 h-8" />
              Claim Your 3,000 Free Credits
            </button>
            <div className="mt-6 text-[10px] font-bold text-cyan-500/60 uppercase tracking-[0.3em]">No Credit Card Required • Instant Access</div>
          </div>
        </FadeInSection>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#020617] border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-black text-xl tracking-tighter">SynergyMind</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
              <button
                onClick={onShowPrivacy}
                className="text-slate-400 hover:text-cyan-400 font-bold transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={onShowTerms}
                className="text-slate-400 hover:text-cyan-400 font-bold transition-colors"
              >
                Terms of Service
              </button>
            </div>

            <div className="text-slate-500 text-sm font-medium">
              © 2025 SynergyMind. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
