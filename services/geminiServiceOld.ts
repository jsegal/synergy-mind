
import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName } from "../types";
import { decodeAudioData } from "./audioUtils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const transcribeUserAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { mimeType, data: base64Audio } }, { text: "Transcribe exactly." }] },
  });
  return response.text || "";
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No parts in response");

    const imagePart = parts.find(p => p.inlineData && p.inlineData.data && p.inlineData.data.length > 100);
    if (!imagePart || !imagePart.inlineData) {
      throw new Error("No valid image data found in response parts");
    }

    return imagePart.inlineData.data;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};

export const generateVoiceSample = async (voiceName: VoiceName): Promise<AudioBuffer> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: { parts: [{ text: "Hello. Synergy Mind is ready." }] },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
    }
  });
  const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!data) throw new Error("No audio");
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  return await decodeAudioData(data, ctx, 24000);
};
