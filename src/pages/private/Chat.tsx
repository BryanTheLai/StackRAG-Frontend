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
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(
    [
      // {
      //   parts: [
      //     {
      //       content: "Be a helpful assistant.",
      //       timestamp: "2025-06-06T09:29:30.374958Z",
      //       dynamic_ref: null,
      //       part_kind: "system-prompt",
      //     },
      //     {
      //       content: "Tell me a joke.",
      //       timestamp: "2025-06-06T09:29:30.374958Z",
      //       part_kind: "user-prompt",
      //     },
      //   ],
      //   instructions: null,
      //   kind: "request",
      // },
      // {
      //   parts: [
      //     {
      //       content:
      //         "Why did the scarecrow win an award? \n\nBecause he was outstanding in his field!",
      //       part_kind: "text",
      //     },
      //   ],
      //   usage: {
      //     requests: 1,
      //     request_tokens: 21,
      //     response_tokens: 18,
      //     total_tokens: 39,
      //     details: {
      //       accepted_prediction_tokens: 0,
      //       audio_tokens: 0,
      //       reasoning_tokens: 0,
      //       rejected_prediction_tokens: 0,
      //       cached_tokens: 0,
      //     },
      //   },
      //   model_name: "gpt-4o-mini-2024-07-18",
      //   timestamp: "2025-06-06T09:29:31Z",
      //   kind: "response",
      //   vendor_details: null,
      //   vendor_id: "chatcmpl-BfNgBLF8hwbIZPDjpaxpwYuKJAAGb",
      // },
    ]
  );
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

  const getMessageContent = (message: ChatMessage): string => {
    const part = message.parts[0];
    return part?.content ?? "(No content)";
  };

  const getMessageLabel = (message: ChatMessage): string => {
    const part = message.parts[0];
    if (message.kind === "request") {
      if (part.part_kind === "system-prompt") return "System";
      if (part.part_kind === "user-prompt") return "You";
    }
    if (message.kind === "response") return "Model";
    return "";
  };

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

    // Add user request
    const userMessage: ChatMessage = {
      kind: "request",
      parts: [
        {
          content: inputMessage.trim(),
          timestamp: new Date().toISOString(),
          dynamic_ref: null,
          part_kind: "user-prompt",
        },
      ],
      instructions: null,
    };

    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setInputMessage("");
    setIsStreaming(true);

    // Add placeholder for model response
    const modelPlaceholder: ChatMessage = {
      kind: "response",
      parts: [
        {
          content: "",
          part_kind: "text",
        },
      ],
      vendor_details: null,
      instructions: null,
    };
    setChatHistory([...newHistory, modelPlaceholder]);

    try {
      const payload = { history: newHistory };

      const response = await fetch(ENDPOINTS.CHAT + "/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let eventSourceBuffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        eventSourceBuffer += decoder.decode(value, { stream: true });

        let eolIndex;
        while ((eolIndex = eventSourceBuffer.indexOf("\n\n")) >= 0) {
          const message = eventSourceBuffer.substring(0, eolIndex);
          eventSourceBuffer = eventSourceBuffer.substring(eolIndex + 2);
          if (message.startsWith("event: stream_end")) {
            if (accumulatedText === "") {
              updateLastMessage("(Model stream ended without text)");
            }
            return;
          } else if (message.startsWith("event: stream_error")) {
            try {
              const errorData = JSON.parse(
                message.substring(message.indexOf("data: ") + "data: ".length)
              );
              updateLastMessage(
                `Stream Error: ${errorData.error || "Unknown error"}`
              );
            } catch {
              updateLastMessage("Stream Error: Could not parse error details.");
            }
          } else if (message.startsWith("data: ")) {
            try {
              const jsonData = JSON.parse(message.substring("data: ".length));
              if (jsonData.text_chunk) {
                if (
                  accumulatedText === "" ||
                  modelPlaceholder.parts[0].content === "Streaming model reply..."
                ) {
                  accumulatedText = "";
                }
                accumulatedText += jsonData.text_chunk;
                updateLastMessage(accumulatedText);
              }
            } catch (e) {
              console.error("Error parsing JSON data from stream:", e);
            }
          }
        }
      }
    } catch (error) {
      updateLastMessage(
        `Network or stream error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
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
              {" "}
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`message p-3 rounded-lg max-w-[80%] ${
                    message.parts[0].part_kind === "user-prompt"
                      ? "bg-primary text-primary-content ml-auto"
                      : "bg-base-200 text-base-content mr-auto"
                  }`}
                >
                  <div className="text-xs opacity-70 mb-1">
                    {getMessageLabel(message)}
                  </div>
                  <div className="whitespace-pre-wrap text-sm">
                    {getMessageContent(message)}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="mt-4 flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
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
