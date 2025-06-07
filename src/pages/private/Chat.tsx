import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import { Send, MessageSquare, ArrowLeft } from "lucide-react";
import { ENDPOINTS } from "@/config/api";
import { useRoute, Link } from "wouter";
import type { ChatMessage } from "@/supabase/chatService"; // Import type
import {
  fetchChatSessionById,
  updateChatSessionHistory,
} from "@/supabase/chatService";

export default function Chat() {
  const { user, session, isLoading: authLoading } = useAuth();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(true); 
  const [chatTitle, setChatTitle] = useState<string | null>("Chat");
  const [error, setError] = useState<string | null>(null);
  const chatDisplayRef = useRef<HTMLDivElement>(null);

  // Get chat ID from URL
  const [, params] = useRoute("/private/chat/:id");
  const chatId = params?.id;

  // Fetch existing chat session or initialize for a new one
  useEffect(() => {
    if (!user || !chatId) {
      setIsLoadingChat(false);
      // If no chatId, it could be a new chat started from a different flow (e.g. direct navigation)
      // For now, we assume ChatHistoryPage handles creation and navigation with an ID.
      // If a user lands here directly without an ID, they might see an empty state or be redirected.
      setChatTitle("New Chat"); // Default title if no ID
      setChatHistory([]); // Start with empty history
      return;
    }

    setIsLoadingChat(true);
    setError(null);

    fetchChatSessionById(chatId)
      .then((sessionData) => {
        if (sessionData) {
          setChatHistory(sessionData.history || []);
          setChatTitle(sessionData.title || "Chat");
        } else {
          // Handle case where session is not found or user doesn't have access
          setError(`Chat session not found or access denied.`);
          setChatHistory([]);
          setChatTitle("Error");
        }
      })
      .catch((err) => {
        console.error("Failed to load chat session:", err);
        setError(err instanceof Error ? err.message : "Failed to load chat.");
        setChatTitle("Error");
      })
      .finally(() => setIsLoadingChat(false));
  }, [chatId, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatDisplayRef.current?.scrollTo({
      top: chatDisplayRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isStreaming || !session) return;
    const content = inputMessage.trim();
    const userMessage: ChatMessage = {
      kind: "request",
      parts: [
        {
          content,
          timestamp: new Date().toISOString(),
          dynamic_ref: null,
          part_kind: "user-prompt",
        },
      ],
    };
    const placeholder: ChatMessage = { kind: "response", parts: [{ content: "", part_kind: "text" }] };
    
    const currentHistory = [...chatHistory, userMessage];
    setChatHistory((prev) => [...prev, userMessage, placeholder]);
    setInputMessage("");
    setIsStreaming(true);
    setError(null); // Clear previous errors

    try {
      const response = await fetch(ENDPOINTS.CHAT + "/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ history: currentHistory }), // Send current history
      });

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || "Failed to stream"}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let finalHistoryUpdate: ChatMessage[] = []; // Renamed to avoid conflict

      // Update the placeholder with the streaming response
      const updateStreamingResponse = (textChunk: string) => {
        accumulatedText += textChunk;
        setChatHistory((prev) => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage?.kind === "response") {
            lastMessage.parts[0].content = accumulatedText;
          }
          return updated;
        });
      };

      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf("\n\n")) >= 0) {
          const chunk = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          if (chunk.startsWith("event: stream_end")) {
            // Stream ended, the accumulatedText is the final response part
            const finalResponseMessage: ChatMessage = {
              kind: "response",
              parts: [{ content: accumulatedText, part_kind: "text", timestamp: new Date().toISOString() }],
              // Potentially add model_name, usage etc. if provided by stream_end event data
            };
            finalHistoryUpdate = [...currentHistory, finalResponseMessage];
            setChatHistory(finalHistoryUpdate); // Set the final state with the complete response
            if (chatId) {
              await updateChatSessionHistory(chatId, finalHistoryUpdate);
            }
            setIsStreaming(false);
            return; // Exit the loop and function
          }

          if (chunk.startsWith("data: ")) {
            try {
              const jsonData = JSON.parse(chunk.slice(6)); // Remove "data: " prefix
              if (jsonData.text_chunk) {
                updateStreamingResponse(jsonData.text_chunk);
              }
              // Handle other potential data fields from the stream if necessary
            } catch (e) {
              console.warn("Failed to parse stream data chunk:", chunk, e);
            }
          }
        }
      }
      // If loop finishes without stream_end, it might be an abrupt close
      // We ensure the last accumulated text is set and history updated
      const finalResponseMessageAbrupt: ChatMessage = {
        kind: "response",
        parts: [{ content: accumulatedText, part_kind: "text", timestamp: new Date().toISOString() }],
      };
      finalHistoryUpdate = [...currentHistory, finalResponseMessageAbrupt];
      setChatHistory(finalHistoryUpdate);
      if (chatId) {
        await updateChatSessionHistory(chatId, finalHistoryUpdate);
      }

    } catch (error) {
      console.error("Streaming error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during streaming.";
      setChatHistory((prev) => {
        const updated = [...prev];
        // Remove placeholder if it exists, or update the last response part with error
        if (updated.length > 0 && updated[updated.length - 1].parts[0].content === "") {
          updated.pop(); // Remove placeholder
        }
        return [
          ...updated,
          {
            kind: "response",
            parts: [{ content: `Error: ${errorMessage}`, part_kind: "text" }],
          },
        ];
      });
      setError(errorMessage);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen bg-base-200">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-base-200 text-base-content">
      <Sidebar />
      <main className="flex-1 flex flex-col max-h-screen">
        {/* Header */} 
        <div className="bg-base-100 shadow-sm p-3 px-4 border-b border-base-300 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/private/chathistory" className="btn btn-ghost btn-sm mr-2">
              <ArrowLeft size={20} />
            </Link>
            <h2 className="text-xl font-semibold truncate" title={chatTitle || "Chat"}>
              {chatTitle || "Chat"}
            </h2>
          </div>
          {/* Placeholder for potential future actions like rename chat from here */} 
        </div>

        {/* Chat Display Area */} 
        <div ref={chatDisplayRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-200/50">
          {isLoadingChat ? (
            <div className="flex justify-center items-center h-full">
              <span className="loading loading-dots loading-lg"></span>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4">
              <p>Error loading chat: {error}</p>
              <Link href="/private/chathistory" className="link link-primary mt-2">
                Back to Chat History
              </Link>
            </div>
          ) : chatHistory.length === 0 && !chatId ? (
            // This state is less likely if navigation always comes from ChatHistory with an ID
            <div className="text-center text-gray-500 pt-10">
              <MessageSquare size={48} className="mx-auto mb-4" />
              <p className="text-xl">Start a new conversation</p>
              <p className="text-sm">Type your message below to begin.</p>
            </div>
          ) : chatHistory.length === 0 && chatId ? (
             // Existing chat session is empty
            <div className="text-center text-gray-500 pt-10">
              <MessageSquare size={48} className="mx-auto mb-4" />
              <p className="text-xl">This chat is empty.</p>
              <p className="text-sm">Send a message to start the conversation.</p>
            </div>
          ) : (
            chatHistory.map((msg, index) => (
              <div
                key={index} // Consider more stable keys if messages can be reordered/deleted independently
                className={`chat ${msg.kind === "request" ? "chat-end" : "chat-start"}`}
              >
                <div className={`chat-bubble prose prose-sm max-w-prose-sm 
                                ${msg.kind === "request" ? "chat-bubble-primary" 
                                : msg.parts[0].content.startsWith("Error:") ? "chat-bubble-error" 
                                : "chat-bubble-neutral"}`}
                >
                  {/* Render multiple parts if a message ever has them */}
                  {msg.parts.map((part, partIndex) => (
                    <p key={partIndex}>{part.content}</p>
                  ))}
                </div>
                {msg.timestamp && (
                  <div className="chat-footer opacity-50 text-xs">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Input Area */} 
        {!isLoadingChat && !error && (
          <div className="p-4 border-t border-base-300 bg-base-100">
            <div className="flex items-center gap-2">
              <textarea
                className="textarea textarea-bordered flex-1 resize-none"
                rows={1} // Start with 1 row, can expand via CSS or JS if needed
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
              />
              <button
                className={`btn btn-primary ${isStreaming ? "loading" : ""}`}
                onClick={sendMessage}
                disabled={isStreaming || !inputMessage.trim()}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
