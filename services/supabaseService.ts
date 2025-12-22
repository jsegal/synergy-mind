import { supabase } from '../lib/supabase';
import { AnalysisResult, ChatMessage } from '../types';

export const geminiChat = async (messages: ChatMessage[], context?: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('gemini-chat', {
    body: { messages, context },
  });

  if (error) throw error;
  return data.response;
};

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  const formData = new FormData();
  formData.append('audio', audioBlob);

  const { data, error } = await supabase.functions.invoke('audio-transcription', {
    body: formData,
  });

  if (error) throw error;
  return data.transcription;
};

export const saveConversation = async (
  userId: string,
  title: string,
  context: string | null
): Promise<string> => {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, title, context })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
};

export const saveMessage = async (
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  audioUrl?: string
) => {
  const { error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, role, content, audio_url: audioUrl });

  if (error) throw error;
};

export const loadConversations = async (userId: string) => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const loadMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

export const updateConversation = async (conversationId: string, updates: any) => {
  const { error } = await supabase
    .from('conversations')
    .update(updates)
    .eq('id', conversationId);

  if (error) throw error;
};

export const deleteConversation = async (conversationId: string) => {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);

  if (error) throw error;
};
