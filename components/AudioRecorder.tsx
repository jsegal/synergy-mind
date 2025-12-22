
import React, { useEffect, useRef, useState } from 'react';
import { visualizeAudio, blobToBase64 } from '../services/audioUtils';
import { Mic, Square, Loader2, Lock, Coins } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (base64: string, mimeType: string) => void;
  isProcessing: boolean;
  credits: number;
  onInsufficientCredits: () => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, isProcessing, credits, onInsufficientCredits }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<number | null>(null);

  const hasCredits = credits >= 500;

  const startRecording = async () => {
    if (!hasCredits) {
      onInsufficientCredits();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 2048;
      
      audioContextRef.current = audioContext;
      analyzerRef.current = analyser;
      sourceRef.current = source;
      
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) visualizeAudio(analyser, canvasRef.current, ctx);
      }

      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const base64 = await blobToBase64(blob);
        
        source.disconnect();
        audioContext.close();
        stream.getTracks().forEach(track => track.stop());
        
        onRecordingComplete(base64, 'audio/webm');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required to record.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      
      <div className="relative w-full h-56 bg-slate-900/40 rounded-2xl border-2 border-cyan-400 shadow-[0_0_30px_-5px_rgba(34,211,238,0.3)] backdrop-blur-sm overflow-hidden mb-8">
        <canvas 
          ref={canvasRef} 
          width={600} 
          height={224} 
          className="w-full h-full opacity-80"
        />
        {!isRecording && !isProcessing && hasCredits && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-cyan-300 font-bold tracking-widest uppercase text-sm">Station Ready</span>
          </div>
        )}
        {!hasCredits && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-md">
            <Lock className="w-10 h-10 text-rose-500 mb-4" />
            <span className="text-white font-black uppercase tracking-widest text-base">Purchase Required</span>
          </div>
        )}
      </div>

      <div className="text-5xl font-mono font-bold text-cyan-400 mb-10 tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
        {formatTime(duration)}
      </div>

      <div className="flex flex-col items-center gap-6">
        {!isRecording && !isProcessing && (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={startRecording}
              className={`group flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 shadow-xl active:scale-95 ${
                hasCredits 
                  ? 'bg-red-500 hover:bg-red-400 shadow-red-500/20 hover:shadow-red-500/40 hover:scale-105' 
                  : 'bg-slate-800 cursor-not-allowed grayscale border-2 border-slate-700'
              }`}
            >
              {hasCredits ? <Mic className="w-10 h-10 text-white" /> : <Lock className="w-10 h-10 text-slate-500" />}
            </button>
            <div className="flex items-center gap-2 text-slate-100 font-black uppercase tracking-widest text-sm">
              <Coins className="w-5 h-5 text-cyan-400" />
              Cost: 500 Credits
            </div>
          </div>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="group flex items-center justify-center w-24 h-24 rounded-full bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-slate-500 transition-all duration-300 shadow-xl active:scale-95"
          >
            <Square className="w-10 h-10 text-red-500 fill-current" />
          </button>
        )}

        {isProcessing && (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mb-4" />
            <span className="text-cyan-400 text-lg font-black animate-pulse tracking-widest uppercase">Analyzing...</span>
          </div>
        )}
      </div>
      
      {isRecording && (
        <p className="mt-8 text-cyan-300 text-lg font-black uppercase tracking-widest animate-pulse">Capturing Synergy...</p>
      )}
    </div>
  );
};

export default AudioRecorder;
