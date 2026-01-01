
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
  private ws: WebSocket | null = null;
  private callbacks: any;
  private sources = new Set<AudioBufferSourceNode>();
  private stream: MediaStream | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private isClosing = false;
  private reconnectAttempts = 0;
  private maxReconnectDelay = 30000;
  private setupComplete = false;

  constructor(callbacks: any) {
    this.callbacks = callbacks;
  }

  getReconnectDelay(): number {
    const baseDelay = 1000;
    const delay = Math.min(baseDelay * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);
    this.reconnectAttempts++;
    return delay;
  }

  resetReconnectAttempts() {
    this.reconnectAttempts = 0;
  }

  async connect(analysisContext: AnalysisResult, chatHistory: ChatMessage[], voiceName: VoiceName) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("VITE_GEMINI_API_KEY not configured. Please add your Gemini API key.");
    }

    this.inputAudioContext = new AudioContext({ sampleRate: 16000 });
    this.outputAudioContext = new AudioContext({ sampleRate: 24000 });

    await this.inputAudioContext.audioWorklet.addModule('/audio-processor.js');

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    const source = this.inputAudioContext.createMediaStreamSource(this.stream);
    const analyser = this.inputAudioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    if (this.callbacks.onAudioVisualizerData) {
      this.callbacks.onAudioVisualizerData(analyser);
    }

    this.workletNode = new AudioWorkletNode(this.inputAudioContext, 'audio-stream-processor');
    source.connect(this.workletNode);
    this.workletNode.connect(this.inputAudioContext.destination);

    const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.resetReconnectAttempts();
      this.setupComplete = false;

      const setupMessage = {
        setup: {
          model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
          generationConfig: {
            responseModalities: ["AUDIO"],
            responseAudio: {
              mimeType: "audio/pcm;rate=24000"
            },
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voiceName
                }
              }
            }
          },
          systemInstruction: {
            parts: [{
              text: `You are SynergyMind, an elite strategic consultant. The user has shared this breakthrough insight: "${analysisContext.insights.bigPicture}".

Key opportunity identified: ${analysisContext.insights.hiddenOpportunity}

Engage in a thoughtful voice conversation to help them explore this idea deeply. Ask clarifying questions, provide strategic insights, and help them develop an action plan.`
            }]
          }
        }
      };

      this.ws?.send(JSON.stringify(setupMessage));
      this.callbacks.onStatusChange(true);
    };

    this.ws.onmessage = async (event) => {
      try {
        const response = JSON.parse(event.data);

        if (response.serverContent) {
          const parts = response.serverContent.modelTurn?.parts || [];

          for (const part of parts) {
            if (part.inlineData?.data && this.outputAudioContext) {
              const base64Audio = part.inlineData.data;
              const buf = await decodeAudioData(base64Audio, this.outputAudioContext, 24000);
              const audioSource = this.outputAudioContext.createBufferSource();
              audioSource.buffer = buf;
              audioSource.connect(this.outputAudioContext.destination);
              audioSource.start();
              this.sources.add(audioSource);
            }

            if (part.text) {
              this.callbacks.onMessage({
                id: Date.now().toString(),
                role: 'assistant',
                text: part.text
              });
            }
          }

          if (response.serverContent.turnComplete) {
            console.log("Turn complete");
          }
        }

        if (response.setupComplete) {
          console.log("Setup complete");
          this.setupComplete = true;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.callbacks.onError(new Error("Connection error occurred"));
    };

    this.ws.onclose = (event) => {
      console.log("WebSocket closed");
      console.log("Close Code:", event.code);
      console.log("Close Reason:", event.reason);
      console.log("Was Clean:", event.wasClean);
      this.callbacks.onStatusChange(false);
      if (this.workletNode) {
        this.workletNode.disconnect();
      }
      if (!this.isClosing && this.callbacks.onUnexpectedDisconnect) {
        this.callbacks.onUnexpectedDisconnect();
      }
    };

    this.workletNode.port.onmessage = (event) => {
      if (event.data.type === 'audio') {
        if (this.ws && this.ws.readyState === WebSocket.OPEN && this.setupComplete) {
          const pcm16Buffer = event.data.data;
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcm16Buffer)));

          const audioMessage = {
            realtimeInput: {
              mediaChunks: [{
                mimeType: "audio/pcm;rate=16000",
                data: base64Audio
              }]
            }
          };

          this.ws.send(JSON.stringify(audioMessage));
        }
      }
    };
  }

  async disconnect() {
    this.isClosing = true;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }

    this.sources.forEach(s => {
      try {
        s.stop();
      } catch (e) {
        console.log("Source already stopped");
      }
    });

    if (this.workletNode) {
      this.workletNode.disconnect();
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    await this.inputAudioContext?.close();
    await this.outputAudioContext?.close();
  }
}

export { generateVoiceSample, generateImage, transcribeUserAudio } from "./geminiServiceOld";
