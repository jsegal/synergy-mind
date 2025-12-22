
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
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze audio');
    }

    const result = await response.json();
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

  constructor(callbacks: any) { this.callbacks = callbacks; }

  async connect(analysisContext: AnalysisResult, chatHistory: ChatMessage[], voiceName: VoiceName) {
    throw new Error("Live audio sessions temporarily disabled for security. Please use the audio analysis feature instead.");

    this.inputAudioContext = new AudioContext({ sampleRate: 16000 });
    this.outputAudioContext = new AudioContext({ sampleRate: 24000 });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => this.callbacks.onStatusChange(true),
        onmessage: async (m) => {
          const base64 = m.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64 && this.outputAudioContext) {
            const buf = await decodeAudioData(base64, this.outputAudioContext, 24000);
            const source = this.outputAudioContext.createBufferSource();
            source.buffer = buf;
            source.connect(this.outputAudioContext.destination);
            source.start();
            this.sources.add(source);
          }
          if (m.serverContent?.turnComplete) {
            this.callbacks.onMessage({ id: Date.now().toString(), role: 'model', text: "Response received." });
          }
        },
        onclose: () => this.callbacks.onStatusChange(false),
        onerror: (e) => this.callbacks.onError(e)
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
        systemInstruction: `Discuss: ${analysisContext.insights.bigPicture}.`
      }
    });
    this.session = await sessionPromise;
  }

  async disconnect() {
    if (this.session) await this.session.close();
    this.sources.forEach(s => s.stop());
    await this.inputAudioContext?.close();
    await this.outputAudioContext?.close();
  }
}

export { generateVoiceSample, generateImage, transcribeUserAudio } from "./geminiServiceOld";
