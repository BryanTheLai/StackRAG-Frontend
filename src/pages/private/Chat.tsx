import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import { Send } from "lucide-react";
import { ENDPOINTS } from "@/config/api";

interface ChatMessage {
  parts: Array<{
    content: string;
    timestamp?: string;
    dynamic_ref?: any | null;
    part_kind: "system-prompt" | "user-prompt" | "text";
  }>;
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

export default function Chat() {
  const { user, session, isLoading: authLoading } = useAuth();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const chatDisplayRef = useRef<HTMLDivElement>(null);
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatDisplayRef.current?.scrollTo({
      top: chatDisplayRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);

  const updateLastMessage = (text: string) => {
    setChatHistory((prev) => {
      const updated = [...prev];
      const lastMessage = updated[updated.length - 1];
      if (lastMessage?.kind === "response") {
        lastMessage.parts[0].content = text;
      }
      return updated;
    });
  };

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
    const historyForBody = [...chatHistory, userMessage];
    setChatHistory((prev) => [...prev, userMessage, placeholder]);
    setInputMessage("");
    setIsStreaming(true);

    try {
      const response = await fetch(ENDPOINTS.CHAT + "/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ history: historyForBody }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
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
            if (!accumulatedText) {
              updateLastMessage("(Model stream ended without text)");
            }
            return;
          }

          if (chunk.startsWith("data: ")) {
            try {
              const { text_chunk } = JSON.parse(chunk.slice(6));
              if (text_chunk) {
                accumulatedText += text_chunk;
                updateLastMessage(accumulatedText);
              }
            } catch {}
          }
        }
      }
    } catch (error) {
      updateLastMessage(
        `Network or stream error: ${
          error instanceof Error ? error.message : error
        }`
      );
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
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-base-200">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-base-100 shadow-sm p-4 border-b">
          <h2 className="text-2xl font-bold">Simple Chat Test</h2>
          <p className="text-sm text-base-content/70">
            Logged in as: <code className="kbd kbd-sm">{user?.email}</code>
          </p>
        </div>

        {/* Chat Display */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 flex flex-col">
            <div
              ref={chatDisplayRef}
              className="flex-1 bg-base-100 rounded-lg p-4 overflow-y-auto space-y-3 shadow-sm"
            >
              {chatHistory.map((message, index) => {
                const part = message.parts[0];
                const label =
                  message.kind === "request"
                    ? part.part_kind === "system-prompt"
                      ? "System"
                      : "You"
                    : "Model";
                return (
                  <div
                    key={index}
                    className={`message p-3 rounded-lg max-w-[80%] ${
                      part.part_kind === "user-prompt"
                        ? "bg-primary text-primary-content ml-auto"
                        : "bg-base-200 text-base-content mr-auto"
                    }`}
                  >
                    <div className="text-xs opacity-70 mb-1">{label}</div>
                    <div className="whitespace-pre-wrap text-sm">
                      {part?.content ?? "(No content)"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <div className="mt-4 flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="textarea textarea-bordered flex-1 resize-none"
                rows={2}
                disabled={isStreaming || !session}
              />
              <button
                onClick={sendMessage}
                disabled={isStreaming || !inputMessage.trim() || !session}
                className="btn btn-primary"
              >
                {isStreaming ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* JSON View */}
          <div className="lg:w-1/3 flex flex-col">
            <h3 className="text-lg font-semibold mb-2">Chat History (JSON)</h3>
            <div className="flex-1 bg-base-100 rounded-lg p-4 overflow-y-auto shadow-sm">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(chatHistory, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
