
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, AnalysisResult, VoiceName } from '../types';
import { BrainstormSession } from '../services/geminiService';
import { visualizeAudio } from '../services/audioUtils';
import { Mic, PhoneOff, User, Bot, Radio, WifiOff, Volume2, LogOut, Plus } from 'lucide-react';

interface ChatInterfaceProps {
  analysisContext: AnalysisResult;
  onBack: () => void;
  onNewSession?: () => void;
  initialMessages: ChatMessage[];
  onMessagesUpdate: (messages: ChatMessage[]) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  analysisContext,
  onBack,
  onNewSession,
  initialMessages,
  onMessagesUpdate
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isActive, setIsActive] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(() => {
    const saved = localStorage.getItem('synergyMind_voice');
    return saved === 'Kore' ? 'Kore' : 'Zephyr';
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<BrainstormSession | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  useEffect(() => { onMessagesUpdate(messages); }, [messages, onMessagesUpdate]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const startSession = useCallback(async (currentMessages: ChatMessage[]) => {
    setError(null);
    const session = new BrainstormSession({
      onMessage: (msg: ChatMessage) => setMessages(prev => [...prev, msg]),
      onStatusChange: (active: boolean) => {
        setIsActive(active);
        if (active) setIsReconnecting(false);
      },
      onError: (err: any) => {
        console.error(err);
        setError(err.message || "Connection issue. Try restarting.");
      },
      onAudioVisualizerData: (analyser: AnalyserNode) => {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) visualizeAudio(analyser, canvasRef.current, ctx);
        }
      },
      onUnexpectedDisconnect: () => {
        setIsReconnecting(true);
        const delay = sessionRef.current?.getReconnectDelay() || 1000;
        console.log(`Reconnecting in ${delay}ms...`);
        reconnectTimeoutRef.current = window.setTimeout(() => startSession(messagesRef.current), delay);
      }
    });
    sessionRef.current = session;
    try {
      await session.connect(analysisContext, currentMessages, selectedVoice);
    } catch (err: any) {
      setError(err.message);
      sessionRef.current = null;
    }
  }, [analysisContext, selectedVoice]);

  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const toggleSession = async () => {
    if (isActive || isReconnecting) {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      setIsReconnecting(false);
      await sessionRef.current?.disconnect();
      sessionRef.current = null;
      setIsActive(false);
    } else {
      await startSession(messages);
    }
  };

  const handleEndAndReturn = async () => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    if (sessionRef.current) {
      await sessionRef.current.disconnect();
      sessionRef.current = null;
    }
    onBack();
  };

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      sessionRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden relative">
      <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700 z-10 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={handleEndAndReturn} className="text-white hover:text-rose-400 font-bold transition-all px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center gap-2 border border-slate-600">
            <LogOut className="w-4 h-4" /><span>End & Return</span>
          </button>
          {onNewSession && (
            <button
              onClick={async () => {
                if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
                if (sessionRef.current) {
                  await sessionRef.current.disconnect();
                  sessionRef.current = null;
                }
                onNewSession();
              }}
              className="text-white hover:text-cyan-400 font-bold transition-all px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl flex items-center gap-2 border border-cyan-500"
            >
              <Plus className="w-4 h-4" /><span>New Session</span>
            </button>
          )}
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            {isActive && !isReconnecting && <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>}
            {isReconnecting && <WifiOff className="w-5 h-5 text-amber-500 animate-pulse" />}
            Voice Thinking Session
          </h3>
          <span className={`text-xs font-black uppercase tracking-widest ${isReconnecting ? 'text-amber-400' : 'text-cyan-300'}`}>
            {isReconnecting ? 'Reconnecting...' : isActive ? 'Live audio active' : 'Session Paused'}
          </span>
        </div>
        <div className="hidden md:block w-32"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-950 relative scroll-smooth min-h-0">
        {messages.length === 0 && !isActive && !isReconnecting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-cyan-500 p-8 text-center pointer-events-none">
            <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
              <Radio className="w-12 h-12 text-cyan-400 opacity-80" />
            </div>
            <p className="text-3xl font-black mb-4 text-white">Live Voice Chat with SynergyMind</p>
            <p className="text-xl text-cyan-100 max-w-lg">Click the microphone to start a real-time voice conversation.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}>
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 ${msg.role === 'user' ? 'bg-blue-600 border-blue-400' : 'bg-cyan-700 border-cyan-500'}`}>
              {msg.role === 'user' ? <User className="w-7 h-7 text-white" /> : <Bot className="w-7 h-7 text-white" />}
            </div>
            <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-6 py-5 rounded-2xl text-xl font-medium leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-white border border-slate-700 rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="px-6 py-3 bg-rose-500/10 border-t border-rose-500/30 text-rose-400 text-center font-bold">
          {error}
        </div>
      )}

      <div className="p-6 bg-slate-900 border-t border-slate-700 flex flex-col items-center gap-6 flex-shrink-0">
        {!isActive && !isReconnecting && (
          <div className="flex items-center gap-6 bg-slate-800 p-3 rounded-2xl border border-slate-700 shadow-lg">
            <div className="flex items-center gap-3 px-4 text-cyan-300 text-xs font-black uppercase tracking-widest border-r border-slate-600">
              <Volume2 className="w-6 h-6 text-cyan-400" />Voice Selection
            </div>
            <div className="flex gap-4 pr-2">
              <button
                onClick={() => {
                  setSelectedVoice('Zephyr');
                  localStorage.setItem('synergyMind_voice', 'Zephyr');
                }}
                className={`px-5 py-2.5 rounded-xl text-base font-bold transition-all ${selectedVoice === 'Zephyr' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-cyan-100'}`}
              >
                Zephyr
              </button>
              <button
                onClick={() => {
                  setSelectedVoice('Kore');
                  localStorage.setItem('synergyMind_voice', 'Kore');
                }}
                className={`px-5 py-2.5 rounded-xl text-base font-bold transition-all ${selectedVoice === 'Kore' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-cyan-100'}`}
              >
                Kore
              </button>
            </div>
          </div>
        )}
        <div className="w-full h-24 bg-black rounded-2xl overflow-hidden border border-slate-700 relative shadow-inner">
          <canvas ref={canvasRef} width={600} height={96} className="w-full h-full opacity-90" />
        </div>
        <button
          onClick={toggleSession}
          className={`group relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 shadow-2xl ${isActive || isReconnecting ? 'bg-red-500 ring-4 ring-red-500/30' : 'bg-cyan-500 ring-4 ring-cyan-500/30'}`}
        >
          {(isActive || isReconnecting) ? <PhoneOff className="w-10 h-10 text-white fill-current" /> : <Mic className="w-10 h-10 text-white" />}
        </button>
        <p className="text-lg text-white font-black uppercase tracking-widest">
          {(isActive || isReconnecting) ? "End Dialogue" : "Start Voice Chat"}
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
