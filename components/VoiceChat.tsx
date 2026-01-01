import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Loader2, Lock, Coins, Phone, PhoneOff } from 'lucide-react';
import { visualizeAudio } from '../services/audioUtils';
import { createConversation, ElevenLabsConversation } from '../services/elevenLabsService';

interface VoiceChatProps {
  credits: number;
  onInsufficientCredits: () => void;
  onCreditDeduction: (amount: number) => void;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ credits, onInsufficientCredits, onCreditDeduction }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');

  const conversationRef = useRef<ElevenLabsConversation | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<number | null>(null);
  const creditsDeductedRef = useRef(false);

  const hasCredits = credits >= 500;

  const startConversation = async () => {
    if (!hasCredits) {
      onInsufficientCredits();
      return;
    }

    if (isConnected || isConnecting) return;

    setIsConnecting(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      mediaStreamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      source.connect(analyser);
      source.connect(processor);
      processor.connect(audioContext.destination);

      analyser.fftSize = 2048;

      audioContextRef.current = audioContext;
      analyzerRef.current = analyser;
      processorRef.current = processor;

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) visualizeAudio(analyser, canvasRef.current, ctx);
      }

      const conversation = createConversation({
        onConnect: () => {
          console.log('Connected to ElevenLabs');
          setIsConnected(true);
          setIsConnecting(false);
          creditsDeductedRef.current = false;

          const startTime = Date.now();
          timerRef.current = window.setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            setDuration(elapsed);

            if (elapsed === 1 && !creditsDeductedRef.current) {
              onCreditDeduction(500);
              creditsDeductedRef.current = true;
            }
          }, 1000);
        },
        onDisconnect: () => {
          console.log('Disconnected from ElevenLabs');
          setIsConnected(false);
          setIsConnecting(false);
          cleanup();
        },
        onMessage: (message) => {
          setCurrentMessage(message);
        },
        onError: (error) => {
          console.error('ElevenLabs error:', error);
          alert('Voice connection error: ' + error);
          setIsConnecting(false);
          cleanup();
        }
      });

      await conversation.connect();
      conversationRef.current = conversation;

      processor.onaudioprocess = (e) => {
        if (!conversationRef.current) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);

        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        conversationRef.current.sendAudio(pcm16.buffer).catch(err => {
          console.error('Error sending audio:', err);
        });
      };

    } catch (err) {
      console.error("Error starting conversation:", err);
      alert("Microphone access is required for voice chat.");
      setIsConnecting(false);
      cleanup();
    }
  };

  const endConversation = () => {
    if (conversationRef.current) {
      conversationRef.current.disconnect();
      conversationRef.current = null;
    }
    cleanup();
  };

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (analyzerRef.current) {
      analyzerRef.current.disconnect();
      analyzerRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    setDuration(0);
    setCurrentMessage('');
    creditsDeductedRef.current = false;
  };

  useEffect(() => {
    return () => {
      cleanup();
      if (conversationRef.current) {
        conversationRef.current.disconnect();
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      <div className="relative w-full h-56 bg-slate-900/40 rounded-2xl border-2 border-cyan-400 shadow-[0_0_30px_-5px_rgba(34,211,238,0.3)] backdrop-blur-sm overflow-hidden mb-8">
        <canvas
          ref={canvasRef}
          width={600}
          height={224}
          className="w-full h-full opacity-80"
        />
        {!isConnected && !isConnecting && hasCredits && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-cyan-300 font-bold tracking-widest uppercase text-sm">Ready to Connect</span>
          </div>
        )}
        {!hasCredits && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-md">
            <Lock className="w-10 h-10 text-rose-500 mb-4" />
            <span className="text-white font-black uppercase tracking-widest text-base">Purchase Required</span>
          </div>
        )}
        {isConnected && currentMessage && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30 backdrop-blur-sm p-6">
            <p className="text-cyan-300 text-center text-sm">{currentMessage}</p>
          </div>
        )}
      </div>

      <div className="text-5xl font-mono font-bold text-cyan-400 mb-10 tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
        {formatTime(duration)}
      </div>

      <div className="flex flex-col items-center gap-6">
        {!isConnected && !isConnecting && (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={startConversation}
              className={`group flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 shadow-xl active:scale-95 ${
                hasCredits
                  ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105'
                  : 'bg-slate-800 cursor-not-allowed grayscale border-2 border-slate-700'
              }`}
            >
              {hasCredits ? <Phone className="w-10 h-10 text-white" /> : <Lock className="w-10 h-10 text-slate-500" />}
            </button>
            <div className="flex items-center gap-2 text-slate-100 font-black uppercase tracking-widest text-sm">
              <Coins className="w-5 h-5 text-cyan-400" />
              Cost: 500 Credits
            </div>
          </div>
        )}

        {isConnecting && (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mb-4" />
            <span className="text-cyan-400 text-lg font-black animate-pulse tracking-widest uppercase">Connecting...</span>
          </div>
        )}

        {isConnected && (
          <button
            onClick={endConversation}
            className="group flex items-center justify-center w-24 h-24 rounded-full bg-red-500 hover:bg-red-400 transition-all duration-300 shadow-xl shadow-red-500/20 hover:shadow-red-500/40 active:scale-95 hover:scale-105"
          >
            <PhoneOff className="w-10 h-10 text-white" />
          </button>
        )}
      </div>

      {isConnected && (
        <p className="mt-8 text-cyan-300 text-lg font-black uppercase tracking-widest animate-pulse">Live Voice Chat Active</p>
      )}
    </div>
  );
};

export default VoiceChat;
