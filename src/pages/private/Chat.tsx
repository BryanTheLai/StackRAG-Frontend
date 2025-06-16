import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import { Send, MessageSquare, ArrowLeft } from "lucide-react";
import { ENDPOINTS } from "@/config/api";
import { useRoute, Link } from "wouter";
import type { ChatMessage } from "@/supabase/chatService";
import {
  fetchChatSessionById,
  updateChatSessionHistory,
} from "@/supabase/chatService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { ChartComponent } from "@/components/ChartComponent";
import type { ChartData } from "@/types/chart";

// Constants for chart processing
const CHART_OPEN_TAG = '<ChartData>';
const CHART_CLOSE_TAG = '</ChartData>';

// Define special tag structure
interface SpecialTagConfig {
  OPEN_TAG: string;
  CLOSE_TAG: string;
}

// Special tags whose content should be buffered until fully received
const SPECIAL_TAG_CONFIGS: SpecialTagConfig[] = [
  { OPEN_TAG: CHART_OPEN_TAG, CLOSE_TAG: CHART_CLOSE_TAG },
];

// Utility to parse chart data from string
const parseChartDataFromString = (potentialChartString: string): ChartData | null => {
  const trimmedString = potentialChartString.trim();
  if (trimmedString.startsWith(CHART_OPEN_TAG) && trimmedString.endsWith(CHART_CLOSE_TAG)) {
    try {
      // Extract JSON string from between the tags
      const jsonString = trimmedString.slice(CHART_OPEN_TAG.length, -CHART_CLOSE_TAG.length);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Failed to parse chart JSON:', error, '\\nOriginal string part:', potentialChartString);
      return null;
    }
  }
  return null;
};

// Helper to decode HTML entities (Added)
const decodeHtmlEntities = (html: string): string => {
  if (typeof window !== 'undefined') {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }
  return html; // Fallback for non-browser environments
};

export default function Chat() {
  // Authentication and routing
  const { user, session, isLoading: authLoading } = useAuth();
  const [, params] = useRoute("/private/chat/:id");
  const chatId = params?.id;

  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(true);
  const [chatTitle, setChatTitle] = useState<string | null>("Chat");
  const [error, setError] = useState<string | null>(null);

  // UI refs
  const chatDisplayRef = useRef<HTMLDivElement>(null);
  // Load chat session on mount or when chatId/user changes
  useEffect(() => {
    const loadChatSession = async () => {
      if (!user || !chatId) {
        setIsLoadingChat(false);
        setChatTitle("New Chat");
        setChatHistory([]);
        return;
      }

      setIsLoadingChat(true);
      setError(null);

      try {
        const sessionData = await fetchChatSessionById(chatId);
        if (sessionData) {
          setChatHistory(sessionData.history || []);
          setChatTitle(sessionData.title || "Chat");
        } else {
          setError("Chat session not found or access denied.");
          setChatHistory([]);
          setChatTitle("Error");
        }
      } catch (err) {
        console.error("Failed to load chat session:", err);
        setError(err instanceof Error ? err.message : "Failed to load chat.");
        setChatTitle("Error");
      } finally {
        setIsLoadingChat(false);
      }
    };

    loadChatSession();
  }, [chatId, user]);
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTo({
        top: chatDisplayRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory]);

  // Create user message object
  const createUserMessage = (content: string): ChatMessage => ({
    kind: "request",
    parts: [
      {
        content,
        timestamp: new Date().toISOString(),
        dynamic_ref: null,
        part_kind: "user-prompt",
      },
    ],
  });

  // Create placeholder response message
  const createPlaceholderMessage = (): ChatMessage => ({
    kind: "response",
    parts: [{ content: "", part_kind: "text" }],
  });

  // Process incoming text chunks, buffering special-tag blocks
  const processTextChunk = (
    chunk: string,
    accText: string,
    tagBuffer: string,
    inTag: boolean,
    tagCfg: SpecialTagConfig | null,
    updateUI: () => void
  ): {
    nextAccText: string;
    nextTagBuffer: string;
    nextInTag: boolean;
    nextTagCfg: SpecialTagConfig | null;
  } => {
    let text = accText;
    let buffer = tagBuffer;
    let inside = inTag;
    let cfg = tagCfg;
    let rest = chunk;

    while (rest) {
      if (inside && cfg) {
        buffer += rest;
        const closeIdx = buffer.indexOf(cfg.CLOSE_TAG);
        if (closeIdx !== -1) {
          const end = closeIdx + cfg.CLOSE_TAG.length;
          const block = buffer.slice(0, end);
          text += block;
          updateUI();
          rest = buffer.slice(end);
          buffer = "";
          inside = false;
          cfg = null;
        } else {
          rest = "";
        }
      } else {
        let nextOpen = -1;
        let found: SpecialTagConfig | null = null;
        for (const c of SPECIAL_TAG_CONFIGS) {
          const pos = rest.indexOf(c.OPEN_TAG);
          if (pos >= 0 && (nextOpen < 0 || pos < nextOpen)) {
            nextOpen = pos;
            found = c;
          }
        }
        if (found && nextOpen >= 0) {
          const before = rest.slice(0, nextOpen);
          if (before) {
            text += before;
            updateUI();
          }
          inside = true;
          cfg = found;
          buffer = rest.slice(nextOpen);
          rest = "";
          const closeIdx = buffer.indexOf(cfg.CLOSE_TAG);
          if (closeIdx !== -1) {
            const end = closeIdx + cfg.CLOSE_TAG.length;
            const block = buffer.slice(0, end);
            text += block;
            updateUI();
            rest = buffer.slice(end);
            buffer = "";
            inside = false;
            cfg = null;
          }
        } else {
          text += rest;
          updateUI();
          rest = "";
        }
      }
    }

    return { nextAccText: text, nextTagBuffer: buffer, nextInTag: inside, nextTagCfg: cfg };
  };

  // Handle streaming response, buffering special tags until closed
  const handleStreamingResponse = async (
    response: Response,
    initialHistory: ChatMessage[]
  ) => {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";
    let tagBuffer = "";
    let inTag = false;
    let tagCfg: SpecialTagConfig | null = null;
    const updateUI = () => {
      setChatHistory((prev) => {
        const h = [...prev];
        const last = h[h.length - 1];
        if (last?.kind === "response") last.parts[0].content = text;
        return h;
      });
    };
    
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n\n")) >= 0) {
          const chunk = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          if (chunk.startsWith("event: stream_end")) {
            if (inTag) text += tagBuffer;
            break;
          }
          if (chunk.startsWith("data: ")) {
            try {
              const d = JSON.parse(chunk.slice(6));
              if (d.text_chunk) {
                const result = processTextChunk(
                  d.text_chunk,
                  text,
                  tagBuffer,
                  inTag,
                  tagCfg,
                  updateUI
                );
                text = result.nextAccText;
                tagBuffer = result.nextTagBuffer;
                inTag = result.nextInTag;
                tagCfg = result.nextTagCfg;
              }
            } catch {}
          }
        }
        if (buffer.includes("event: stream_end")) break;
      }
      if (inTag) text += tagBuffer;
      const final: ChatMessage = { kind: "response", parts: [{ content: text, part_kind: "text", timestamp: new Date().toISOString() }] };
      const newHistory = [...initialHistory, final];

      setChatHistory(newHistory);
      if (chatId) await updateChatSessionHistory(chatId, newHistory);
    } catch (e) {
      setChatHistory((prev) => prev.length > initialHistory.length && prev[prev.length - 1].parts[0].content === "" ? initialHistory : prev);
      throw e;
    }
  };

  // Handle errors in chat
  const handleChatError = (error: unknown) => {
    console.error("Streaming error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred during streaming.";

    setChatHistory((prev) => {
      const updated = [...prev];
      // Remove placeholder if it exists
      if (
        updated.length > 0 &&
        updated[updated.length - 1].parts[0].content === ""
      ) {
        updated.pop();
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
  };
  const sendMessage = async () => {
    if (!inputMessage.trim() || isStreaming || !session) return;

    const content = inputMessage.trim();
    const userMessage = createUserMessage(content);
    const placeholder = createPlaceholderMessage();
    const currentHistory = [...chatHistory, userMessage];

    // Update UI immediately
    setChatHistory((prev) => [...prev, userMessage, placeholder]);
    setInputMessage("");
    setIsStreaming(true);
    setError(null);

    try {
      const response = await fetch(ENDPOINTS.CHAT + "/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ history: currentHistory }),
      });

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${errorText || "Failed to stream"}`
        );
      }

      await handleStreamingResponse(response, currentHistory);
    } catch (error) {
      handleChatError(error);
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

  // Render loading state for authentication
  const renderAuthLoading = () => (
    <div className="flex h-screen bg-base-200">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    </div>
  );

  // Render chat loading state
  const renderChatLoading = () => (
    <div className="flex justify-center items-center h-full">
      <span className="loading loading-dots loading-lg"></span>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="text-center text-red-500 p-4">
      <p>Error loading chat: {error}</p>
      <Link href="/private/chathistory" className="link link-primary mt-2">
        Back to Chat History
      </Link>
    </div>
  );

  // Render empty state for new chat
  const renderNewChatEmpty = () => (
    <div className="text-center text-gray-500 pt-10">
      <MessageSquare size={48} className="mx-auto mb-4" />
      <p className="text-xl">Start a new conversation</p>
      <p className="text-sm">Type your message below to begin.</p>
    </div>
  );

  // Render empty state for existing chat
  const renderExistingChatEmpty = () => (
    <div className="text-center text-gray-500 pt-10">
      <MessageSquare size={48} className="mx-auto mb-4" />
      <p className="text-xl">This chat is empty.</p>
      <p className="text-sm">Send a message to start the conversation.</p>
    </div>
  );

  // Render a single chat message
  const renderMessage = (msg: ChatMessage, index: number) => {
    const isUser = msg.kind === "request";
    // Determine bubble class based on user, error, or normal AI response
    const bubbleClass = isUser
      ? "chat-bubble-primary"
      : msg.parts.some((part) => part.content.startsWith("Error:"))
      ? "chat-bubble-error"
      : "chat-bubble-neutral";

    // Determine chat alignment based on user or AI
    const chatAlignment = isUser ? "chat-end" : "chat-start";

    return (
      <div key={index} className={`chat ${chatAlignment}`}>
        <div className={`chat-bubble ${bubbleClass} max-w-full`}> {/* Removed 'prose' class */}
          {msg.parts.map((part, partIndex) => {
            const decodedContent = decodeHtmlEntities(part.content); // Decode content
            // Split content by chart tags
            const contentParts = decodedContent.split(new RegExp(`(${CHART_OPEN_TAG}[\\s\\S]*?${CHART_CLOSE_TAG})`, 'g')).filter(Boolean);

            return contentParts.map((contentPart, contentPartIndex) => {
              const chartData = parseChartDataFromString(contentPart); // Try to parse the content part as chart data

              if (chartData) {
                // If chartData is not null, it's a valid chart block
                return <ChartComponent key={`${partIndex}-${contentPartIndex}`} data={chartData} />;
              } else {
                // Otherwise, render as Markdown
                // Wrap ReactMarkdown with a div having the 'prose' class
                return (
                  <div className="prose" key={`${partIndex}-${contentPartIndex}-prose-wrapper`}>                    <ReactMarkdown
                      key={`${partIndex}-${contentPartIndex}`}
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      components={{
                        a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-500" />,
                        table: ({node, ...props}) => <table {...props} className="table-auto border-collapse border border-slate-400 w-full my-4" />,
                        thead: ({node, ...props}) => <thead {...props} className="bg-slate-100 dark:bg-slate-700" />,
                        th: ({node, ...props}) => <th {...props} className="border border-slate-300 dark:border-slate-600 font-semibold p-2 text-slate-900 dark:text-slate-200 text-left" />,
                        td: ({node, ...props}) => <td {...props} className="border border-slate-300 dark:border-slate-700 p-2 text-slate-500 dark:text-slate-400" />,
                        tr: ({node, ...props}) => <tr {...props} className="even:bg-slate-50 dark:even:bg-slate-800" />
                      }}
                    >
                      {contentPart}
                    </ReactMarkdown>
                  </div>
                );
              }
            });
          })}
        </div>
      </div>
    );
  };

  // Render chat display area content
  const renderChatContent = () => {
    if (isLoadingChat) return renderChatLoading();
    if (error) return renderError();
    if (chatHistory.length === 0 && !chatId) return renderNewChatEmpty();
    if (chatHistory.length === 0 && chatId) return renderExistingChatEmpty();
    return chatHistory.map(renderMessage);
  };

  // Render input area
  const renderInputArea = () => {
    if (isLoadingChat || error) return null;

    return (
      <div className="p-4 border-t border-base-300 bg-base-100">
        <div className="flex items-center gap-2">
          <textarea
            className="textarea textarea-bordered flex-1 resize-none"
            rows={1}
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
    );
  };
  if (authLoading) {
    return renderAuthLoading();
  }

  return (
    <div className="flex h-screen bg-base-200 text-base-content">
      <Sidebar />
      <main className="flex-1 flex flex-col max-h-screen">
        {/* Header */}
        <div className="bg-base-100 shadow-sm p-3 px-4 border-b border-base-300 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/private/chathistory"
              className="btn btn-ghost btn-sm mr-2"
            >
              <ArrowLeft size={20} />
            </Link>
            <h2
              className="text-xl font-semibold truncate"
              title={chatTitle || "Chat"}
            >
              {chatTitle || "Chat"}
            </h2>
          </div>
        </div>

        {/* Chat Display Area */}
        <div
          ref={chatDisplayRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-200/50"
        >
          {renderChatContent()}
        </div>

        {/* Input Area */}
        {renderInputArea()}
      </main>
    </div>
  );
}
