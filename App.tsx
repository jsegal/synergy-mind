
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AudioRecorder from './components/AudioRecorder';
import AnalysisView from './components/AnalysisView';
import ChatInterface from './components/ChatInterface';
import LandingPage from './components/LandingPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import GoogleSignIn from './components/Auth/GoogleSignIn';
import { analyzeAudioRecording } from './services/geminiService';
import { useAuth } from './contexts/AuthContext';
import { loadConversations, deleteConversation } from './services/supabaseService';
import { AppState, AnalysisResult, ChatMessage, SavedSession, ActiveSession } from './types';
import {
  History, Trash2, Sparkles, Search,
  Clock, MessageSquare, Info, Settings, Plus, Zap, Coins, CreditCard, X, LogOut
} from 'lucide-react';

const STORAGE_KEY_SESSIONS = 'synergymind_sessions_v3';
const STORAGE_KEY_ACTIVE = 'synergymind_active_draft_v3';
const STORAGE_KEY_CREDITS = 'synergymind_user_credits';

const INITIAL_CREDITS = 3000;
const COST_PER_CONVERSATION = 500;
const PURCHASE_AMOUNT = 3000;

const App: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Credits State
  const [credits, setCredits] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CREDITS);
    return saved ? parseInt(saved, 10) : INITIAL_CREDITS;
  });
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CREDITS, credits.toString());
  }, [credits]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('authenticated') === 'true' && user) {
      setAppState(AppState.IDLE);
      window.history.replaceState({}, '', window.location.pathname);
    } else if (user && appState === AppState.LANDING) {
      setAppState(AppState.IDLE);
    }
  }, [user, appState]);

  useEffect(() => {
    if (user) {
      loadConversations(user.id).then(conversations => {
        const sessions = conversations.map(conv => ({
          id: conv.id,
          title: conv.title,
          analysis: null,
          date: conv.created_at,
        }));
        setSavedSessions(sessions);
      }).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (appState === AppState.ANALYSIS_COMPLETE || appState === AppState.CHAT_MODE) {
      localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify({ state: appState, analysis: analysisResult, chatHistory: chatMessages, id: currentSessionId }));
    }
  }, [appState, analysisResult, chatMessages, currentSessionId]);

  const handleRecordingComplete = async (base64Audio: string, mimeType: string) => {
    if (credits < COST_PER_CONVERSATION) {
      setShowPurchaseModal(true);
      return;
    }

    setAppState(AppState.PROCESSING);
    try {
      const result = await analyzeAudioRecording(base64Audio, mimeType);
      
      // Successfully analyzed, deduct credits
      setCredits(prev => Math.max(0, prev - COST_PER_CONVERSATION));
      
      setAnalysisResult(result);
      setChatMessages([]);
      setAppState(AppState.ANALYSIS_COMPLETE);
    } catch (err) {
      setErrorMsg("Strategic analysis failed. Please retry.");
      setAppState(AppState.ERROR);
    }
  };

  const handlePurchase = () => {
    // In a real app, this would trigger Stripe checkout
    // For now, we simulate success
    setCredits(prev => prev + PURCHASE_AMOUNT);
    setShowPurchaseModal(false);
    alert(`Success! ${PURCHASE_AMOUNT} credits have been added to your account.`);
  };

  const resetApp = () => {
    localStorage.removeItem(STORAGE_KEY_ACTIVE);
    setAppState(AppState.IDLE);
    setAnalysisResult(null);
    setCurrentSessionId(null);
    setIsSaved(false);
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800">
      <div className="p-8 space-y-6">
        <button onClick={resetApp} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl">
          <Plus /> New Session
        </button>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500 w-6 h-6" />
          <input
            type="text"
            placeholder="Search Library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-950 border border-slate-700 rounded-2xl text-lg text-white placeholder:text-slate-600 focus:border-cyan-500 outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <div className="flex items-center gap-3 px-2 mb-4">
          <History className="text-cyan-500 w-6 h-6" />
          <span className="text-sm font-black text-cyan-500 uppercase tracking-widest">Library</span>
        </div>
        {savedSessions.length === 0 ? (
          <div className="text-center py-20 text-slate-100 text-lg font-bold uppercase tracking-widest">Empty Archive</div>
        ) : (
          savedSessions.map(session => (
            <div key={session.id} className="group relative p-5 rounded-2xl border border-transparent hover:bg-slate-800 hover:border-slate-700 cursor-pointer transition-all">
              <div onClick={() => { setCurrentSessionId(session.id); }}>
                <h4 className="text-white font-black text-lg truncate">{session.title}</h4>
                <p className="text-slate-100 text-sm mt-1">{new Date(session.date).toLocaleDateString()}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(session.id).then(() => {
                    setSavedSessions(prev => prev.filter(s => s.id !== session.id));
                  });
                }}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white text-xl font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  const handleGetStarted = () => {
    if (!user) {
      setShowAuth(true);
    } else {
      setAppState(AppState.IDLE);
    }
  };

  if (!user && showAuth) {
    return <GoogleSignIn />;
  }

  return (
    <Routes>
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/" element={
    <div className={`min-h-screen bg-slate-950 text-white font-sans flex flex-col ${appState === AppState.LANDING ? 'h-auto' : 'overflow-hidden h-screen'}`}>
      
      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
          <div className="w-full max-w-xl bg-slate-900 border-2 border-cyan-500/30 rounded-[3rem] p-12 relative shadow-2xl animate-fade-in-up">
            <button onClick={() => setShowPurchaseModal(false)} className="absolute top-8 right-8 text-slate-100 hover:text-white"><X className="w-8 h-8" /></button>
            <div className="text-center space-y-8">
              <div className="w-24 h-24 bg-cyan-600/20 rounded-3xl flex items-center justify-center mx-auto border border-cyan-500/30">
                <Coins className="w-12 h-12 text-cyan-400" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Fuel Your Breakthroughs</h2>
                <p className="text-xl text-slate-100 font-medium leading-relaxed">
                  Your strategic energy is low. Each session requires <span className="text-cyan-400 font-black">500 credits</span> to process elite deep-dive insights.
                </p>
              </div>
              <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 flex justify-between items-center">
                 <div className="text-left">
                    <div className="text-white text-2xl font-black">3,000 Credits</div>
                    <div className="text-cyan-300 font-bold">~ 6 Sessions</div>
                 </div>
                 <div className="text-3xl font-black text-white">$15.00</div>
              </div>
              <button 
                onClick={handlePurchase}
                className="w-full py-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black text-2xl flex items-center justify-center gap-4 shadow-xl shadow-cyan-900/40 transition-all active:scale-95"
              >
                <CreditCard className="w-8 h-8" />
                Purchase Credits Now
              </button>
              <p className="text-slate-100 text-sm font-bold uppercase tracking-widest opacity-60">Secure Stripe Checkout</p>
            </div>
          </div>
        </div>
      )}

      {appState !== AppState.LANDING && (
        <nav className="h-24 px-10 border-b border-slate-800 flex justify-between items-center bg-slate-950/80 backdrop-blur-xl z-50">
           <div onClick={resetApp} className="flex items-center gap-4 cursor-pointer group">
              <div className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Sparkles /></div>
              <span className="font-black text-2xl tracking-tighter">SynergyMind</span>
           </div>
           
           <div className="flex items-center gap-6">
              {/* Credits Badge */}
              <div onClick={() => setShowPurchaseModal(true)} className="cursor-pointer flex items-center gap-4 bg-slate-900 hover:bg-slate-800 border-2 border-cyan-500/30 px-6 py-2.5 rounded-2xl transition-all shadow-lg group">
                  <Coins className={`w-6 h-6 ${credits < 500 ? 'text-rose-500 animate-pulse' : 'text-cyan-400'}`} />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-cyan-300 uppercase tracking-widest">Balance</span>
                    <span className="text-lg font-black text-white leading-none">{credits.toLocaleString()}</span>
                  </div>
                  <div className="ml-2 w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center group-hover:bg-cyan-500 transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
              </div>

              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-white font-bold transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>

              <div className="hidden sm:flex items-center gap-4 bg-emerald-500/10 px-5 py-2 rounded-xl border border-emerald-500/20">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                <span className="text-sm font-black text-emerald-400 uppercase tracking-widest">System Ready</span>
              </div>
           </div>
        </nav>
      )}

      <main className={`flex-1 relative ${appState === AppState.LANDING ? '' : 'overflow-hidden'}`}>
        {appState === AppState.LANDING && (
          <LandingPage
            onGetStarted={handleGetStarted}
          />
        )}
        
        {(appState === AppState.IDLE || appState === AppState.PROCESSING) && (
          <div className="flex h-full lg:flex-row flex-col">
            <aside className="hidden lg:block w-96 shrink-0"><Sidebar /></aside>
            <div className="flex-1 flex flex-col items-center justify-center p-10 overflow-y-auto">
               <div className="max-w-3xl w-full space-y-16">
                  <div className="text-center space-y-6">
                    <h1 className="text-7xl font-black tracking-tighter leading-none">Capture Magic.</h1>
                    <p className="text-2xl text-slate-100 font-medium">Your super-intelligent strategist is listening.</p>
                  </div>
                  <div className="bg-slate-900/50 p-16 rounded-[4rem] border border-slate-800 shadow-2xl backdrop-blur-sm">
                    <AudioRecorder 
                      onRecordingComplete={handleRecordingComplete} 
                      isProcessing={appState === AppState.PROCESSING} 
                      credits={credits}
                      onInsufficientCredits={() => setShowPurchaseModal(true)}
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-8">
                     {[
                       { icon: <MessageSquare />, label: "Transcript", desc: "Verbatim record." },
                       { icon: <Zap className="text-cyan-400" />, label: "Breakthrough Insights!", desc: "New connections." },
                       { icon: <Plus />, label: "Roadmap", desc: "Clear actions." }
                     ].map((item, i) => (
                       <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-3">
                          <div className="mx-auto w-10 h-10 flex items-center justify-center text-cyan-400">{item.icon}</div>
                          <h4 className="font-black text-lg uppercase tracking-tight">{item.label}</h4>
                          <p className="text-slate-100 text-base">{item.desc}</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {appState === AppState.ANALYSIS_COMPLETE && analysisResult && (
           <div className="flex h-full">
             <aside className="hidden lg:block w-96 shrink-0"><Sidebar /></aside>
             <div className="flex-1 overflow-y-auto p-12 bg-slate-950"><AnalysisView data={analysisResult} onStartChat={() => setAppState(AppState.CHAT_MODE)} onSave={() => {}} isSaved={isSaved} /></div>
           </div>
        )}

        {appState === AppState.CHAT_MODE && analysisResult && (
          <ChatInterface analysisContext={analysisResult} onBack={() => setAppState(AppState.ANALYSIS_COMPLETE)} initialMessages={chatMessages} onMessagesUpdate={setChatMessages} />
        )}

        {appState === AppState.ERROR && (
           <div className="flex flex-col items-center justify-center h-full space-y-8 p-10 text-center">
              <div className="text-rose-500 text-8xl">⚠️</div>
              <h2 className="text-5xl font-black">Strategic Error</h2>
              <p className="text-2xl text-slate-100 max-w-lg">{errorMsg}</p>
              <button onClick={resetApp} className="bg-cyan-600 px-10 py-5 rounded-2xl font-black text-xl">Return to Station</button>
           </div>
        )}
      </main>
    </div>
      } />
    </Routes>
  );
};

export default App;
