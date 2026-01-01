
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AnalysisResult } from '../types';
import { geminiChat } from '../services/supabaseService';
import { User, Bot, Send, Loader2, LogOut, MessageSquare } from 'lucide-react';

interface ChatInterfaceProps {
  analysisContext: AnalysisResult;
  onBack: () => void;
  initialMessages: ChatMessage[];
  onMessagesUpdate: (messages: ChatMessage[]) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  analysisContext,
  onBack,
  initialMessages,
  onMessagesUpdate
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { onMessagesUpdate(messages); }, [messages, onMessagesUpdate]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      const context = `Analysis Context: ${analysisContext.summary}\nKey Insights: ${analysisContext.insights.bigPicture}`;
      const response = await geminiChat([...messages, userMessage], context);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden relative">
      <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700 z-10 shadow-sm">
        <button onClick={onBack} className="text-white hover:text-rose-400 font-bold transition-all px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center gap-2 border border-slate-600">
          <LogOut className="w-4 h-4" /><span>End & Return</span>
        </button>
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            Strategy Consultation
          </h3>
          <span className="text-xs font-black uppercase tracking-widest text-cyan-300">
            Text-Based Chat
          </span>
        </div>
        <div className="hidden md:block w-32"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-950 relative scroll-smooth">
        {messages.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-cyan-500 p-8 text-center pointer-events-none">
            <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
              <MessageSquare className="w-12 h-12 text-cyan-400 opacity-80" />
            </div>
            <p className="text-3xl font-black mb-4 text-white">Consult with SynergyMind</p>
            <p className="text-xl text-cyan-100 max-w-lg">Ask questions about your analysis and get strategic guidance.</p>
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
        {isLoading && (
          <div className="flex items-end gap-4 animate-fade-in-up">
            <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 bg-cyan-700 border-cyan-500">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div className="px-6 py-5 rounded-2xl bg-slate-800 border border-slate-700 rounded-tl-none">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="px-6 py-3 bg-rose-500/10 border-t border-rose-500/30 text-rose-400 text-center font-bold">
          {error}
        </div>
      )}

      <div className="p-6 bg-slate-900 border-t border-slate-700">
        <div className="flex gap-4 items-end">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your analysis..."
            disabled={isLoading}
            rows={1}
            className="flex-1 px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white text-lg placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputText.trim()}
            className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-2xl font-black text-lg flex items-center gap-3 transition-all shadow-xl"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
