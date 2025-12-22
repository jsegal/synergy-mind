
import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { CheckCircle, AlertCircle, FileText, List, Share2, Copy, Check, Save, Sparkles, Zap, Mic, Quote, Gem, Telescope, Compass } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AnalysisViewProps {
  data: AnalysisResult;
  onStartChat: () => void;
  onSave: () => void;
  isSaved: boolean;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ data, onStartChat, onSave, isSaved }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(data.transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-16 pb-32">
      
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl backdrop-blur-xl sticky top-4 z-30">
        <div>
          <h2 className="text-4xl font-black text-white flex items-center gap-4 tracking-tighter">
            Synergy Strategy Report
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
          </h2>
          <p className="text-cyan-300 text-lg font-black uppercase tracking-[0.2em] mt-1">Elite Deep-Dive Analysis</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <button
            onClick={onSave}
            disabled={isSaved}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-lg transition-all ${
              isSaved ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-white border border-slate-600 hover:bg-slate-700'
            }`}
          >
            {isSaved ? <Check className="w-6 h-6" /> : <Save className="w-6 h-6" />}
            <span>{isSaved ? 'Saved' : 'Save Session'}</span>
          </button>

          <button
            onClick={onStartChat}
            className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-cyan-900/40 border border-cyan-400/30 transition-transform active:scale-95"
          >
            <Mic className="w-6 h-6" />
            <span>Consult with SynergyMind</span>
          </button>
        </div>
      </div>

      {/* Breakthrough Section Header */}
      <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 text-cyan-300 font-black uppercase tracking-[0.4em] text-base mb-2">
            <Zap className="w-6 h-6 fill-current" />
            Three Insights & Opportunities!
          </div>
          <p className="text-3xl md:text-5xl text-white font-black leading-tight max-w-4xl mx-auto">
            "We found the bridge between your growth and your peace."
          </p>
      </div>

      {/* THE TRINITY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. The Big Picture */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-[3rem] p-10 flex flex-col space-y-6 hover:border-cyan-500/50 transition-colors">
          <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-500/40">
            <Telescope className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">The Big Picture</h3>
          <div className="text-slate-100 text-xl font-medium leading-relaxed prose prose-invert">
            <ReactMarkdown>{data.insights.bigPicture}</ReactMarkdown>
          </div>
        </div>

        {/* 2. The Hidden Opportunity -> YOUR OPPORTUNITY! */}
        <div className="relative bg-slate-900 border-2 border-emerald-500/40 rounded-[3rem] p-10 flex flex-col space-y-6 hover:bg-emerald-500/5 transition-colors">
          <div className="absolute -top-4 right-8 bg-emerald-500 text-white px-6 py-2 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl">
             Your Opportunity!
          </div>
          <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/40">
            <Gem className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">Hidden Opportunity</h3>
          <div className="text-slate-100 text-xl font-medium leading-relaxed prose prose-invert">
            <ReactMarkdown>{data.insights.hiddenOpportunity}</ReactMarkdown>
          </div>
        </div>

        {/* 3. The Wise Path */}
        <div className="bg-gradient-to-br from-slate-900 to-purple-900/30 border-2 border-purple-500/30 rounded-[3rem] p-10 flex flex-col space-y-6">
          <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/40">
            <Quote className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">The Wise Path</h3>
          <div className="text-purple-300 text-sm font-black uppercase tracking-widest">Guidance from {data.insights.wisePath.sageName}</div>
          <div className="text-slate-100 text-xl italic font-medium leading-relaxed prose prose-invert">
            <ReactMarkdown>{data.insights.wisePath.content}</ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Execution Roadmap & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-slate-900/60 p-10 rounded-[3rem] border border-slate-800 space-y-8">
           <div className="flex items-center gap-4 text-emerald-400 border-b border-slate-800 pb-6">
              <CheckCircle className="w-8 h-8" />
              <h3 className="text-3xl font-black tracking-tighter uppercase">Execution Roadmap</h3>
           </div>
           <ul className="space-y-6">
              {data.nextSteps.map((step, i) => (
                <li key={i} className="flex gap-6 items-start bg-slate-950 p-6 rounded-2xl border border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black shrink-0 text-xl">
                    {i+1}
                  </div>
                  <span className="text-white text-xl font-bold">{step}</span>
                </li>
              ))}
           </ul>
        </div>

        <div className="bg-slate-900/60 p-10 rounded-[3rem] border border-slate-800 space-y-8">
           <div className="flex items-center gap-4 text-cyan-300 border-b border-slate-800 pb-6">
              <FileText className="w-8 h-8" />
              <h3 className="text-3xl font-black tracking-tighter uppercase">Strategic Summary</h3>
           </div>
           <div className="text-slate-100 text-xl leading-relaxed font-medium prose prose-invert max-w-none">
              <ReactMarkdown>{data.summary}</ReactMarkdown>
           </div>
        </div>
      </div>

      {/* Transcript */}
      <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4 text-purple-400">
            <List className="w-8 h-8" />
            <h3 className="text-3xl font-black tracking-tighter uppercase">Session Archive</h3>
          </div>
          <button onClick={handleCopyTranscript} className="flex items-center gap-3 px-8 py-3 bg-slate-800 text-white rounded-xl font-black text-lg border border-slate-600 hover:bg-slate-700 transition-colors">
            {copied ? <Check className="text-emerald-400" /> : <Copy />}
            <span>{copied ? "Copied" : "Copy Transcript"}</span>
          </button>
        </div>
        <div className="bg-slate-950 p-8 rounded-2xl border border-slate-900 text-xl text-cyan-100 font-mono leading-relaxed max-h-[40rem] overflow-y-auto">
          {data.transcript}
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
