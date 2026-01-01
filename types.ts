
export enum AppState {
  LANDING = 'LANDING',
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  ANALYSIS_COMPLETE = 'ANALYSIS_COMPLETE',
  CHAT_MODE = 'CHAT_MODE',
  ERROR = 'ERROR'
}

export interface AnalysisResult {
  transcript: string;
  summary: string;
  keyPoints: Array<{
    speaker: string;
    point: string;
    emphasis: 'High' | 'Medium' | 'Low';
  }>;
  nextSteps: string[];
  participantIntention: string;
  insights: {
    bigPicture: string;
    hiddenOpportunity: string;
    wisePath: {
      content: string;
    };
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  audioData?: string; 
  isAudioPlaying?: boolean;
}

export interface SavedSession {
  id: string;
  date: number;
  title: string;
  analysis: AnalysisResult;
  chatHistory: ChatMessage[];
}

export interface ActiveSession {
  state: AppState;
  analysis: AnalysisResult | null;
  chatHistory: ChatMessage[];
  id: string | null;
}

export interface SpeakerConfig {
  voiceName: string;
}

export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoede';
