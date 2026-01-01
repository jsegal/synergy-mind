const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const AGENT_ID = 'jODhEqCjkqwE4pq5wOnp';

export interface ElevenLabsConversationConfig {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: string) => void;
  onError?: (error: string) => void;
  onAudioReceived?: (audio: ArrayBuffer) => void;
}

export class ElevenLabsConversation {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private audioQueue: ArrayBuffer[] = [];
  private isPlaying = false;
  private config: ElevenLabsConversationConfig;

  constructor(config: ElevenLabsConversationConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-signed-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({ agent_id: AGENT_ID }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get signed URL');
      }

      const { signed_url } = await response.json();

      return new Promise((resolve, reject) => {
        try {
          this.ws = new WebSocket(signed_url);

          this.ws.onopen = () => {
            console.log('ElevenLabs WebSocket connected');
            this.config.onConnect?.();
            resolve();
          };

        this.ws.onmessage = async (event) => {
          try {
            const message = JSON.parse(event.data);

            if (message.type === 'audio' && message.audio_event) {
              const audioData = Uint8Array.from(atob(message.audio_event.audio_base_64), c => c.charCodeAt(0));
              await this.playAudio(audioData.buffer);
            } else if (message.type === 'interruption') {
              this.stopAudio();
            } else if (message.type === 'agent_response' && message.agent_response_event) {
              this.config.onMessage?.(message.agent_response_event.agent_response || '');
            } else if (message.type === 'ping') {
              this.ws?.send(JSON.stringify({ type: 'pong', event_id: message.ping_event?.event_id }));
            }
          } catch (error) {
            console.error('Error processing message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.config.onError?.('Connection error occurred');
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket closed');
          this.config.onDisconnect?.();
          this.cleanup();
        };
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      this.config.onError?.('Failed to connect: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    }
  }

  async sendAudio(audioData: ArrayBuffer): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const uint8Array = new Uint8Array(audioData);
    const base64 = btoa(String.fromCharCode(...uint8Array));

    const message = {
      user_audio_chunk: base64
    };

    this.ws.send(JSON.stringify(message));
  }

  private async playAudio(audioData: ArrayBuffer): Promise<void> {
    this.audioQueue.push(audioData);
    if (!this.isPlaying) {
      await this.processAudioQueue();
    }
  }

  private async processAudioQueue(): Promise<void> {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;

    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioData = this.audioQueue.shift()!;

    try {
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      source.onended = () => {
        this.processAudioQueue();
      };

      source.start();
    } catch (error) {
      console.error('Error playing audio:', error);
      this.processAudioQueue();
    }
  }

  private stopAudio(): void {
    this.audioQueue = [];
    this.isPlaying = false;
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.cleanup();
  }

  private cleanup(): void {
    this.stopAudio();
    this.audioQueue = [];
  }
}

export const createConversation = (config: ElevenLabsConversationConfig): ElevenLabsConversation => {
  return new ElevenLabsConversation(config);
};
