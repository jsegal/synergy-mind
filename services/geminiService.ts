
import { GoogleGenAI, Modality } from "@google/genai";
import { AnalysisResult, ChatMessage, VoiceName } from "../types";
import { decodeAudioData } from "./audioUtils";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const analyzeAudioRecording = async (base64Audio: string, mimeType: string): Promise<AnalysisResult> => {
  try {
    const apiUrl = `${SUPABASE_URL}/functions/v1/audio-analysis`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Audio, mimeType })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `Server error: ${response.status} ${response.statusText}`;
      console.error("API error response:", errorData);
      throw new Error(errorMessage);
    }

    const result = await response.json();

    // Validate that we got the expected structure
    if (!result.transcript || !result.insights) {
      console.error("Invalid response structure:", result);
      throw new Error("Invalid analysis response from server");
    }

    return result as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing audio:", error);
    throw error;
  }
};

export class BrainstormSession {
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private session: any = null;
  private callbacks: any;
  private sources = new Set<AudioBufferSourceNode>();
  private ai: any;

  constructor(callbacks: any) {
    this.callbacks = callbacks;
    this.ai = (window as any).ai;
  }

  async connect(analysisContext: AnalysisResult, chatHistory: ChatMessage[], voiceName: VoiceName) {
    if (!this.ai?.live) {
      throw new Error("Chrome's built-in AI with Multimodal Live API is not available. Please use Chrome Canary with the experimental AI features enabled.");
    }

    this.inputAudioContext = new AudioContext({ sampleRate: 16000 });
    this.outputAudioContext = new AudioContext({ sampleRate: 24000 });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const source = this.inputAudioContext.createMediaStreamSource(stream);
    const analyser = this.inputAudioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    if (this.callbacks.onAudioVisualizerData) {
      this.callbacks.onAudioVisualizerData(analyser);
    }

    const processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
    source.connect(processor);
    processor.connect(this.inputAudioContext.destination);

    const sessionPromise = this.ai.live.connect({
      model: 'gemini-1.5-pro',
      callbacks: {
        onopen: () => this.callbacks.onStatusChange(true),
        onmessage: async (m: any) => {
          const base64 = m.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64 && this.outputAudioContext) {
            const buf = await decodeAudioData(base64, this.outputAudioContext, 24000);
            const source = this.outputAudioContext.createBufferSource();
            source.buffer = buf;
            source.connect(this.outputAudioContext.destination);
            source.start();
            this.sources.add(source);
          }
          const text = m.serverContent?.modelTurn?.parts?.find((p: any) => p.text)?.text;
          if (text) {
            this.callbacks.onMessage({
              id: Date.now().toString(),
              role: 'assistant',
              text
            });
          }
          if (m.serverContent?.turnComplete) {
            console.log("Turn complete");
          }
        },
        onclose: () => {
          this.callbacks.onStatusChange(false);
          processor.disconnect();
        },
        onerror: (e: any) => {
          console.error("Session error:", e);
          this.callbacks.onError(e);
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
        systemInstruction: `You are SynergyMind, an elite strategic consultant. The user has shared this breakthrough insight: "${analysisContext.insights.bigPicture}".

Key opportunity identified: ${analysisContext.insights.hiddenOpportunity}

Engage in a thoughtful voice conversation to help them explore this idea deeply. Ask clarifying questions, provide strategic insights, and help them develop an action plan.`
      }
    });

    this.session = await sessionPromise;

    processor.onaudioprocess = (e) => {
      if (this.session) {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }
        this.session.send({ realtimeInput: { audioData: pcm16.buffer } });
      }
    };
  }

  async disconnect() {
    if (this.session) await this.session.close();
    this.sources.forEach(s => s.stop());
    await this.inputAudioContext?.close();
    await this.outputAudioContext?.close();
  }
}

export { generateVoiceSample, generateImage, transcribeUserAudio } from "./geminiServiceOld";
