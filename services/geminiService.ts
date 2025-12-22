
import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
import { AnalysisResult, ChatMessage, VoiceName } from "../types";
import { decodeAudioData, float32ToBase64PCM } from "./audioUtils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const ANALYSIS_MODEL = 'gemini-3-flash-preview';

export const analyzeAudioRecording = async (base64Audio: string, mimeType: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Audio } },
          {
            text: `
            Analyze this conversation as SynergyMind, an elite consultant.
            Generate a JSON report with:
            1. transcript: full transcription.
            2. summary: concise value summary.
            3. Trinity of Insight (insights object):
               - bigPicture: A wider perspective, future goals, and possible great outcomes.
               - hiddenOpportunity: How to make the best of the situation using untapped resources or hidden benefits.
               - wisePath: Philosophical suggestion. Pick the MOST relevant sage from: [Marcus Aurelius, Benjamin Franklin, Warren Buffett, Peter Drucker, Maya Angelou, Dale Carnegie, Viktor Frankl, Brené Brown, Lao Tzu, Jim Rohn].
            4. keyPoints: speaker name, their point, and emphasis.
            5. nextSteps: clear roadmap actions.
            6. participantIntention: the deep why behind the talk.
            `,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcript: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: { type: Type.STRING },
                  point: { type: Type.STRING },
                  emphasis: { type: Type.STRING }
                }
              }
            },
            nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            participantIntention: { type: Type.STRING },
            insights: {
              type: Type.OBJECT,
              properties: {
                bigPicture: { type: Type.STRING },
                hiddenOpportunity: { type: Type.STRING },
                wisePath: {
                  type: Type.OBJECT,
                  properties: {
                    content: { type: Type.STRING },
                    sageName: { type: Type.STRING }
                  },
                  required: ["content", "sageName"]
                }
              },
              required: ["bigPicture", "hiddenOpportunity", "wisePath"]
            }
          },
          required: ["transcript", "summary", "keyPoints", "nextSteps", "participantIntention", "insights"]
        }
      }
    });

    return JSON.parse(response.text) as AnalysisResult;
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
