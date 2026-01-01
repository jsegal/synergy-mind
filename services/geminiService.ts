
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
  private scriptProcessorNode: ScriptProcessorNode | null = null;
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
    console.log('[BrainstormSession] Starting connection...');
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('[BrainstormSession] API Key present:', !!apiKey);
    if (!apiKey) {
      throw new Error("VITE_GEMINI_API_KEY not configured. Please add your Gemini API key.");
    }

    console.log('[BrainstormSession] Creating audio contexts (input: 16kHz, output: 24kHz)');
    this.inputAudioContext = new AudioContext({ sampleRate: 16000 });
    this.outputAudioContext = new AudioContext({ sampleRate: 24000 });
    console.log('[BrainstormSession] Input AudioContext state:', this.inputAudioContext.state);
    console.log('[BrainstormSession] Output AudioContext state:', this.outputAudioContext.state);

    console.log('[BrainstormSession] Requesting microphone access...');
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    console.log('[BrainstormSession] Microphone access granted, stream tracks:', this.stream.getTracks().length);

    console.log('[BrainstormSession] Setting up audio processing chain...');
    const source = this.inputAudioContext.createMediaStreamSource(this.stream);
    const analyser = this.inputAudioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    console.log('[BrainstormSession] Analyser connected for visualization');

    if (this.callbacks.onAudioVisualizerData) {
      this.callbacks.onAudioVisualizerData(analyser);
      console.log('[BrainstormSession] Audio visualizer callback registered');
    }

    console.log('[BrainstormSession] Creating ScriptProcessorNode (buffer size: 4096)');
    this.scriptProcessorNode = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
    source.connect(this.scriptProcessorNode);
    this.scriptProcessorNode.connect(this.inputAudioContext.destination);
    console.log('[BrainstormSession] ScriptProcessorNode connected to audio graph');

    console.log('[BrainstormSession] Establishing WebSocket connection to Gemini API...');
    const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('[BrainstormSession] ✅ WebSocket connected successfully');
      this.resetReconnectAttempts();
      this.setupComplete = false;

      console.log('[BrainstormSession] Sending setup message with voice:', voiceName);
      const setupMessage = {
        setup: {
          model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
          generation_config: {
            response_modalities: ["AUDIO"],
            speech_config: {
              voice_config: {
                prebuilt_voice_config: {
                  voice_name: voiceName
                }
              }
            }
          },
          system_instruction: {
            parts: [{
              text: `You are SynergyMind, an elite strategic consultant. The user has shared this breakthrough insight: "${analysisContext.insights.bigPicture}".

Key opportunity identified: ${analysisContext.insights.hiddenOpportunity}

Engage in a thoughtful voice conversation to help them explore this idea deeply. Ask clarifying questions, provide strategic insights, and help them develop an action plan.`
            }]
          }
        }
      };

      this.ws?.send(JSON.stringify(setupMessage));
      console.log('[BrainstormSession] Setup message sent');
      this.callbacks.onStatusChange(true);
    };

    this.ws.onmessage = async (event) => {
      try {
        const response = JSON.parse(event.data);
        console.log('[BrainstormSession] 📨 WebSocket message received:', Object.keys(response));

        if (response.serverContent) {
          const parts = response.serverContent.modelTurn?.parts || [];
          console.log('[BrainstormSession] Server content parts count:', parts.length);

          for (const part of parts) {
            if (part.inlineData?.data && this.outputAudioContext) {
              console.log('[BrainstormSession] 🔊 Received audio data, length:', part.inlineData.data.length);
              const base64Audio = part.inlineData.data;
              const buf = await decodeAudioData(base64Audio, this.outputAudioContext, 24000);
              console.log('[BrainstormSession] Audio decoded, duration:', buf.duration.toFixed(2), 'seconds');
              const audioSource = this.outputAudioContext.createBufferSource();
              audioSource.buffer = buf;
              audioSource.connect(this.outputAudioContext.destination);
              audioSource.start();
              this.sources.add(audioSource);
              console.log('[BrainstormSession] Audio playback started');
            }

            if (part.text) {
              console.log('[BrainstormSession] 💬 Received text response:', part.text.substring(0, 50) + '...');
              this.callbacks.onMessage({
                id: Date.now().toString(),
                role: 'assistant',
                text: part.text
              });
            }
          }

          if (response.serverContent.turnComplete) {
            console.log('[BrainstormSession] ✅ Turn complete');
          }
        }

        if (response.setupComplete) {
          console.log('[BrainstormSession] ✅ Setup complete - ready to send audio');
          this.setupComplete = true;
        }
      } catch (error) {
        console.error('[BrainstormSession] ❌ Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('[BrainstormSession] ❌ WebSocket error:', error);
      this.callbacks.onError(new Error("Connection error occurred"));
    };

    this.ws.onclose = (event) => {
      console.log('[BrainstormSession] WebSocket closed');
      console.log('[BrainstormSession] Close Code:', event.code);
      console.log('[BrainstormSession] Close Reason:', event.reason);
      console.log('[BrainstormSession] Was Clean:', event.wasClean);
      this.callbacks.onStatusChange(false);
      if (this.scriptProcessorNode) {
        console.log('[BrainstormSession] Disconnecting ScriptProcessorNode');
        this.scriptProcessorNode.disconnect();
      }
      if (!this.isClosing && this.callbacks.onUnexpectedDisconnect) {
        console.log('[BrainstormSession] Unexpected disconnect - triggering reconnect');
        this.callbacks.onUnexpectedDisconnect();
      }
    };

    let audioChunkCount = 0;
    this.scriptProcessorNode.onaudioprocess = (event) => {
      const inputBuffer = event.inputBuffer;
      const channelData = inputBuffer.getChannelData(0);

      audioChunkCount++;
      if (audioChunkCount % 100 === 0) {
        console.log('[BrainstormSession] 🎤 Audio chunks processed:', audioChunkCount, 'Buffer size:', channelData.length);
      }

      if (this.ws && this.ws.readyState === WebSocket.OPEN && this.setupComplete) {
        const pcm16 = new Int16Array(channelData.length);
        for (let i = 0; i < channelData.length; i++) {
          const clampedValue = Math.max(-1, Math.min(1, channelData[i]));
          pcm16[i] = Math.floor(clampedValue * 32767);
        }

        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));

        const audioMessage = {
          realtimeInput: {
            mediaChunks: [{
              mimeType: "audio/pcm;rate=16000",
              data: base64Audio
            }]
          }
        };

        this.ws.send(JSON.stringify(audioMessage));

        if (audioChunkCount % 100 === 0) {
          console.log('[BrainstormSession] 📤 Audio chunk sent to Gemini API');
        }
      } else if (audioChunkCount % 100 === 0) {
        console.log('[BrainstormSession] ⏸️ Not sending audio - WebSocket state:', this.ws?.readyState, 'Setup complete:', this.setupComplete);
      }
    };

    console.log('[BrainstormSession] ScriptProcessorNode audio handler registered');
  }

  async disconnect() {
    console.log('[BrainstormSession] Starting disconnect...');
    this.isClosing = true;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[BrainstormSession] Closing WebSocket connection');
      this.ws.close();
    }

    console.log('[BrainstormSession] Stopping', this.sources.size, 'audio sources');
    this.sources.forEach(s => {
      try {
        s.stop();
      } catch (e) {
        console.log('[BrainstormSession] Source already stopped');
      }
    });

    if (this.scriptProcessorNode) {
      console.log('[BrainstormSession] Disconnecting ScriptProcessorNode');
      this.scriptProcessorNode.disconnect();
      this.scriptProcessorNode = null;
    }

    if (this.stream) {
      console.log('[BrainstormSession] Stopping microphone stream');
      this.stream.getTracks().forEach(track => track.stop());
    }

    console.log('[BrainstormSession] Closing audio contexts');
    await this.inputAudioContext?.close();
    await this.outputAudioContext?.close();
    console.log('[BrainstormSession] ✅ Disconnect complete');
  }
}

export { generateVoiceSample, generateImage, transcribeUserAudio } from "./geminiServiceOld";
