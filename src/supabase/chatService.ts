import { supabase } from "./client";

// Define ChatMessage Structure (consistent with Chat.tsx)
export interface ChatMessagePart {
  content: string;
  timestamp?: string;
  dynamic_ref?: any | null;
  part_kind: "system-prompt" | "user-prompt" | "text";
}

export interface ChatMessage {
  parts: Array<ChatMessagePart>;
  instructions?: any | null;
  kind: "request" | "response";
  usage?: {
    requests: number;
    request_tokens: number;
    response_tokens: number;
    total_tokens: number;
    details: Record<string, number>;
  };
  model_name?: string;
  timestamp?: string;
  vendor_details?: any | null;
  vendor_id?: string;
}

// Define ChatSession Structures
export interface ChatSessionBase {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

// For list view in ChatHistory, history field is not essential
export interface ChatSession extends ChatSessionBase {
  // No history field here by default for lighter list items
}

export interface ChatSessionWithHistory extends ChatSessionBase {
  history: ChatMessage[];
}

// --- Supabase Functions ---

export async function createChatSession(
  userId: string,
  title?: string
): Promise<string> {
  // Returns new session ID
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ user_id: userId, history: [], title: title || "New Chat" }) // created_at, updated_at have defaults or triggers
    .select("id")
    .single();
  if (error) {
    console.error("Error creating chat session:", error);
    throw error;
  }
  return data.id;
}

export async function fetchChatSessions(
  userId: string
): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, user_id, title, created_at, updated_at") // No history for list
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("Error fetching chat sessions:", error);
    throw error;
  }
  return data || [];
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId);
  if (error) {
    console.error("Error deleting chat session:", error);
    throw error;
  }
}

export async function updateChatSessionTitle(
  sessionId: string,
  newTitle: string
): Promise<void> {
  const { error } = await supabase
    .from("chat_sessions")
    .update({ title: newTitle }) // Relies on DB trigger for updated_at
    .eq("id", sessionId);
  if (error) {
    console.error("Error updating chat session title:", error);
    throw error;
  }
}

export async function fetchChatSessionById(
  sessionId: string
): Promise<ChatSessionWithHistory | null> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, user_id, title, created_at, updated_at, history")
    .eq("id", sessionId)
    .single();

  if (error) {
    console.error("Error fetching chat session by ID:", error.message);
    // PGRST116: "JSON object requested, multiple (or no) rows returned"
    // This code means no rows found or RLS prevented access.
    if (error.code === "PGRST116") return null;
    throw error;
  }
  // Ensure history is an array, default to empty if null/undefined from DB
  return data ? { ...data, history: data.history || [] } : null;
}

export async function updateChatSessionHistory(
  sessionId: string,
  newHistory: ChatMessage[]
): Promise<void> {
  const { error } = await supabase
    .from("chat_sessions")
    .update({ history: newHistory }) // Relies on DB trigger for updated_at
    .eq("id", sessionId);

  if (error) {
    console.error("Error updating chat session history:", error);
    throw error;
  }
}
