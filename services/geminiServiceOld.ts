
import { VoiceName } from "../types";
import { decodeAudioData } from "./audioUtils";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const transcribeUserAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
  const apiUrl = `${SUPABASE_URL}/functions/v1/audio-transcription`;

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
    throw new Error(errorData.error || 'Failed to transcribe audio');
  }

  const result = await response.json();
  return result.transcription || "";
};

export const generateImage = async (prompt: string): Promise<string> => {
  throw new Error("Image generation is not yet implemented via edge functions");
};

export const generateVoiceSample = async (voiceName: VoiceName): Promise<AudioBuffer> => {
  throw new Error("Voice sample generation is not yet implemented");
};
