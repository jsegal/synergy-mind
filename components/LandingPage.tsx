
import React, { useEffect, useRef, useState } from 'react';
import { Mic, Zap, Coffee, Car, Users, ArrowRight, Sparkles, CheckCircle2, Loader2, Image as ImageIcon, MonitorOff, UserRoundCheck, BrainCircuit, Lightbulb, Compass } from 'lucide-react';
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
      const cacheKey = `sm_img_v2_${btoa(prompt).slice(0, 20)}`;
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
          <span className="text-xs font-mono uppercase tracking-widest animate-pulse">Generating AI Visuals...</span>
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

// --- Main Component ---

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="flex flex-col min-h-screen text-white pb-20 overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-start text-center px-6 pt-16 pb-16 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 bg-slate-900">
          <AIImage 
            prompt="Cinematic shot of two creative professionals driving in a luxury car on a coastal highway, golden hour, interior view, depth of field, 4k"
            alt="Two people driving and talking" 
            className="w-full h-full object-cover opacity-60 object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-slate-950" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-6">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm font-black mb-4 backdrop-blur-md shadow-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span>100% Free • No Login Required</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight animate-fade-in-up delay-100 drop-shadow-2xl">
            Capture Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-300">
              Best Ideas.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-cyan-100 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-lg animate-fade-in-up delay-200 bg-black/20 backdrop-blur-sm p-4 rounded-xl">
            Don't let your best ideas evaporate on the drive home. 
            SynergyMind listens to the energy of your conversation and turns it into breakthrough strategy.
          </p>

          <div className="pt-8 animate-fade-in-up delay-300">
            <button 
              onClick={onGetStarted}
              className="group relative inline-flex items-center gap-4 px-10 py-5 bg-white text-slate-950 rounded-full font-bold text-xl hover:bg-cyan-50 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] hover:shadow-[0_0_60px_-10px_rgba(6,182,212,0.6)] active:scale-95"
            >
              Start Recording
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center group-hover:bg-cyan-600 transition-colors">
                 <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* The Consultant Feature (Difference) - MOVED TO TOP */}
      <section className="py-24 relative overflow-hidden bg-slate-950 border-y border-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-slate-900 z-0" />
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center space-y-12">
          
          <FadeInSection>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              More than a transcript. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                A Super-Intelligent Consultant.
              </span>
            </h2>
            <p className="text-xl text-cyan-100 font-medium max-w-2xl mx-auto">
              Other apps give you minutes. We give you breakthroughs. SynergyMind finds the hidden connections you missed.
            </p>
          </FadeInSection>

          <FadeInSection delay={200}>
            <div className="bg-slate-950/80 border border-slate-700 p-8 rounded-3xl shadow-2xl text-left max-w-3xl mx-auto backdrop-blur-md relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform">
                 <Sparkles className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex items-center gap-4 mb-6 pt-2">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                   <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                   <div className="text-xs text-purple-300 font-bold uppercase tracking-widest">Synergy Insight detected</div>
                   <div className="text-white font-bold text-lg uppercase tracking-tight">The Consultant Says:</div>
                </div>
              </div>
              <p className="text-white text-xl leading-relaxed italic border-l-4 border-cyan-500 pl-6 py-2">
                "You and your brother kept circling the idea of a subscription model, but your tone shifted excitedly when discussing the 'one-time workshop'. <strong className="text-cyan-400 not-italic">Breakthrough:</strong> The market wants a high-ticket intensive, not another monthly fee. Pivot to the workshop model first."
              </p>
            </div>
          </FadeInSection>

        </div>
      </section>

      {/* Differentiation Section - Refactored to match feature style */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
             {/* Image Side */}
            <FadeInSection>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 group h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 opacity-40" />
                <AIImage 
                  prompt="Cinematic portrait of a person with a thoughtful expression, eyes closed slightly, hand to chin, trying to recall a brilliant thought, soft foggy atmosphere in the background, ethereal lighting, high quality, photorealistic"
                  alt="A person thinking and trying to remember" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-8 left-8 z-20">
                  <div className="flex items-center gap-2 text-white font-bold text-lg bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Lightbulb className="w-6 h-6 text-yellow-400" />
                    The Fog of Time
                  </div>
                </div>
              </div>
            </FadeInSection>

            {/* Text Side */}
            <FadeInSection delay={200}>
              <div className="space-y-8">
                <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                  Have you ever lost a <br />
                  <span className="text-rose-500">life-changing idea?</span>
                </h2>
                
                <p className="text-xl text-cyan-100 leading-relaxed font-medium">
                  Have you ever lost a great, maybe life-changing idea you had in a conversation with someone to the fog of time?
                </p>
                
                <p className="text-lg text-cyan-300 leading-relaxed font-bold">
                  SynergyMind is your personal conversation recording, great-idea-catching, and breakthrough insight-generating AI solution.
                </p>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                   <p className="text-white text-xl font-black italic">
                    "With SYNERGYMIND You Never Have To Lose Another Great Idea From A Conversation Again!"
                   </p>
                </div>

                <div className="pt-4">
                  <h4 className="text-sm font-black text-rose-500 uppercase tracking-[0.2em] leading-relaxed">
                    This is not yet another <br />
                    in-meeting Zoom/Meets <br />
                    AI note taker app!
                  </h4>
                </div>
              </div>
            </FadeInSection>

          </div>
        </div>
      </section>

      {/* Feature Showcase: Being Present (The Coffee Shop) */}
      <section className="py-24 bg-slate-950 relative overflow-hidden border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image Side */}
            <FadeInSection>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 group h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 opacity-40" />
                <AIImage 
                  prompt="Group of creative coworkers talking enthusiastically around a wooden coffee shop table, coffee mugs, warm afternoon sunlight, soft focus background, photorealistic, cinematic"
                  alt="Friends talking in a coffee shop" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-8 left-8 z-20">
                  <div className="flex items-center gap-2 text-white font-bold text-lg bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Coffee className="w-6 h-6 text-purple-400" />
                    The Coffee Shop Scenario
                  </div>
                </div>
              </div>
            </FadeInSection>

            {/* Text Side */}
            <FadeInSection delay={200}>
              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  Be Present. <br />
                  <span className="text-purple-400">Put the laptop away.</span>
                </h2>
                <p className="text-xl text-cyan-100 leading-relaxed font-medium">
                  Don't be the person hiding behind a screen, typing furiously to capture every word. That kills the vibe.
                </p>
                <p className="text-lg text-cyan-300 leading-relaxed">
                  With SynergyMind, you can look your partner in the eye. Listen to the noise, the laughter, and the passion. We capture the gems, so you can focus on the connection.
                </p>

                <div className="space-y-4 pt-4">
                  {[
                    "No more interrupting flow to take notes",
                    "Capture tone, emphasis, and energy",
                    "Walk away with a strategy, not just a memory"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-purple-400 flex-shrink-0" />
                      <span className="text-white font-medium text-lg">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Use Case 2: The Drive */}
      <section className="py-24 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Text Side (Left on Desktop) */}
            <FadeInSection className="order-2 lg:order-1">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider">
                  <Car className="w-6 h-6" />
                  Windshield Time
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  The best ideas happen <br />
                  <span className="text-cyan-400">at 60 MPH.</span>
                </h2>
                <p className="text-xl text-cyan-100 leading-relaxed font-medium">
                  Long drives with a co-founder or friend are legendary for generating ideas. But usually, those ideas evaporate by the time you park.
                </p>
                <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
                  <p className="text-cyan-200 italic text-lg">
                    "We mapped out our entire business model on the drive to Austin. SynergyMind organized 3 hours of rambling into a 1-page execution plan."
                  </p>
                </div>
              </div>
            </FadeInSection>

            {/* Image Side */}
            <FadeInSection delay={200} className="order-1 lg:order-2">
               <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 group h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 opacity-60" />
                <AIImage 
                  prompt="Inside of a modern vehicle driving through a beautiful landscape, sunset lighting hitting the dashboard, cinematic depth of field, high quality"
                  alt="Driving perspective" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </FadeInSection>

          </div>
        </div>
      </section>

      {/* Use Case 3: Networking */}
      <section className="py-24 bg-slate-950">
         <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
             {/* Image Side */}
            <FadeInSection>
               <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 group h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 opacity-60" />
                <AIImage 
                  prompt="Close up of two people in business casual attire engaging in a serious but friendly conversation in a modern bright glass building atrium"
                  alt="Networking meeting" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </FadeInSection>

             {/* Text Side */}
            <FadeInSection delay={200}>
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider">
                  <Users className="w-6 h-6" />
                  Instant Follow-up
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  The Networker's <br />
                  <span className="text-emerald-400">Secret Weapon.</span>
                </h2>
                <p className="text-xl text-cyan-100 leading-relaxed font-medium">
                  You meet someone interesting. You talk for 20 minutes. Don't lose the momentum.
                </p>
                <p className="text-lg text-cyan-300 leading-relaxed">
                  Record the conversation (with permission), and SynergyMind will instantly identify the common ground and draft the perfect follow-up email before you even leave the venue.
                </p>
              </div>
            </FadeInSection>

          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center bg-slate-950">
        <FadeInSection>
          <div className="max-w-5xl mx-auto bg-gradient-to-b from-slate-900 to-slate-950 p-16 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-500/30 transition-all duration-1000" />
            
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">Ready to capture the magic?</h2>
            <p className="text-cyan-100 mb-10 text-xl max-w-2xl mx-auto font-medium">
              Start 100% Free. No login required. Just tap record and let the synergy begin.
            </p>
            
            <button 
              onClick={onGetStarted}
              className="inline-flex items-center gap-3 px-10 py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-bold text-xl transition-all shadow-lg shadow-cyan-900/40 hover:scale-105 active:scale-95"
            >
              <Mic className="w-6 h-6" />
              Start Recording Now
            </button>
          </div>
        </FadeInSection>
      </section>

    </div>
  );
};

export default LandingPage;
