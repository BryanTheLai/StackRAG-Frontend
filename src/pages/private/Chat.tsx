import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import { Send, MessageSquare, ArrowLeft, X } from "lucide-react";
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
import { PDFViewerEmbedded } from "@/components/PDFViewerEmbedded";
import type { PDFNavData } from "@/types/pdfnav";
import { TypingDots } from "@/components/TypingDots";

// Constants for chart processing
const CHART_OPEN_TAG = '<ChartData>';
const CHART_CLOSE_TAG = '</ChartData>';

// Constants for PDF navigation processing
const PDF_NAV_OPEN_TAG = '<PDFNav>';
const PDF_NAV_CLOSE_TAG = '</PDFNav>';

// Define special tag structure
interface SpecialTagConfig {
  OPEN_TAG: string;
  CLOSE_TAG: string;
}

// Special tags whose content should be buffered until fully received
const SPECIAL_TAG_CONFIGS: SpecialTagConfig[] = [
  { OPEN_TAG: CHART_OPEN_TAG, CLOSE_TAG: CHART_CLOSE_TAG },
  { OPEN_TAG: PDF_NAV_OPEN_TAG, CLOSE_TAG: PDF_NAV_CLOSE_TAG },
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
      console.error('Failed to parse chart JSON:', error, '\nOriginal string part:', potentialChartString);
      return null;
    }
  }
  return null;
};

// Utility to parse PDF navigation data from string
const parsePDFNavDataFromString = (potentialPDFNavString: string): PDFNavData | null => {
  const trimmedString = potentialPDFNavString.trim();
  if (trimmedString.startsWith(PDF_NAV_OPEN_TAG) && trimmedString.endsWith(PDF_NAV_CLOSE_TAG)) {
    try {
      // Extract JSON string from between the tags
      const jsonString = trimmedString.slice(PDF_NAV_OPEN_TAG.length, -PDF_NAV_CLOSE_TAG.length);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Failed to parse PDF navigation JSON:', error, '\nOriginal string part:', potentialPDFNavString);
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
  const [lastQuery, setLastQuery] = useState<string>("");

  // PDF viewer state
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [selectedPDFData, setSelectedPDFData] = useState<PDFNavData | null>(null);

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
    setLastQuery(content);
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
    const isPlaceholder = !isUser && msg.parts[0].content === "" && isStreaming && index === chatHistory.length - 1;
    // Minimalistic bubble classes using DaisyUI variables for consistency
    const bubbleClass = isUser
      ? "bg-base-200 text-base-content border border-base-300"
      : msg.parts.some((part) => part.content.startsWith("Error:"))
      ? "bg-error/10 text-error border border-error"
      : "bg-base-100 text-base-content border border-base-200";

    const chatAlignment = isUser ? "justify-end" : "justify-start";

    if (isPlaceholder) {
      return (
        <div key={index} className={`flex ${chatAlignment}`}>
          <div className={`rounded-box px-4 py-2 w-full max-w-3xl shadow-none break-words ${bubbleClass}`}>            
            <div className="flex items-center gap-2 mb-2 min-w-0">
              <span
                className="badge badge-outline capitalize truncate max-w-[70%]"
                title={lastQuery}
              >
                {lastQuery}
              </span>
              <span className="text-sm text-base-content/60">Searching...</span>
            </div>
            <TypingDots />
          </div>
        </div>
      );
    }

    return (
      <div key={index} className={`flex ${chatAlignment}`}>
        <div
          className={`rounded-box px-4 py-2 w-full max-w-3xl shadow-none break-words ${bubbleClass}`}
          style={{ fontSize: "1rem", lineHeight: "1.5" }}
        >
          {msg.parts.map((part, partIndex) => {
            const decodedContent = decodeHtmlEntities(part.content); // Decode content
            // Split content by both chart and PDF nav tags
            const contentParts = decodedContent.split(new RegExp(`(${CHART_OPEN_TAG}[\\s\\S]*?${CHART_CLOSE_TAG}|${PDF_NAV_OPEN_TAG}[\\s\\S]*?${PDF_NAV_CLOSE_TAG})`, 'g')).filter(Boolean);

            return contentParts.map((contentPart, contentPartIndex) => {
              const chartData = parseChartDataFromString(contentPart); // Try to parse as chart data
              const pdfNavData = parsePDFNavDataFromString(contentPart); // Try to parse as PDF nav data

              if (chartData) {
                // If chartData is not null, it's a valid chart block
                return (
                  <div key={`${partIndex}-${contentPartIndex}-chart`} className="w-full">
                    <ChartComponent data={chartData} />
                  </div>
                );
              } else if (pdfNavData) {
                // If pdfNavData is not null, it's a valid PDF navigation block
                return (
                  <div key={`${partIndex}-${contentPartIndex}-pdfnav`} className="my-3">
                    <button
                      onClick={() => {
                        setSelectedPDFData(pdfNavData);
                        setShowPDFViewer(true);
                      }}
                      className="btn btn-outline btn-sm gap-2 hover:btn-primary"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                      {pdfNavData.filename} - Page {pdfNavData.page}
                    </button>
                    {pdfNavData.context && (
                      <p className="text-sm text-base-content/70 mt-2 italic">
                        {pdfNavData.context}
                      </p>
                    )}
                  </div>
                );
              } else {
                // Otherwise, render as Markdown
                return (
                  <div className="prose prose-neutral" key={`${partIndex}-${contentPartIndex}-prose-wrapper`}>
                    <ReactMarkdown
                      key={`${partIndex}-${contentPartIndex}`}
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      components={{
                        a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-focus" />,
                        table: ({node, ...props}) => <table {...props} className="w-full border border-base-300 my-4 bg-base-100 text-sm" />,
                        thead: ({node, ...props}) => <thead {...props} className="" />,
                        th: ({node, ...props}) => <th {...props} className="border border-base-300 font-semibold p-2 text-left bg-base-100 text-base-content" />,
                        td: ({node, ...props}) => <td {...props} className="border border-base-200 p-2 text-base-content/80" />,
                        tr: ({node, ...props}) => <tr {...props} className="" />
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
      <div className="p-4 border-t border-base-200 bg-base-100">
        <div className="flex items-center gap-2">
          <textarea
            className="textarea textarea-bordered flex-1 resize-none bg-base-100 text-base-content border-base-300"
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
    <div className="flex h-screen bg-base-100 text-base-content">
      <Sidebar />
      <main className={`flex-1 flex flex-col max-h-screen ${showPDFViewer ? 'w-1/2' : ''}`}>
        {/* Header */}
        <div className="bg-base-100 p-3 px-4 border-b border-base-200 flex items-center justify-between">
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
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100"
        >
          {renderChatContent()}
        </div>

        {/* Input Area */}
        {renderInputArea()}
      </main>

      {/* PDF Viewer Side Panel */}
      {showPDFViewer && selectedPDFData && (
        <div className="w-1/2 max-w-3xl bg-base-100 border-l border-base-300 shadow-lg flex flex-col">
          {/* PDF Header */}
          <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-200">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-base-content truncate">
                {selectedPDFData.filename}
              </h3>
              {selectedPDFData.context && (
                <p className="text-sm text-base-content/70 mt-1">{selectedPDFData.context}</p>
              )}
              {selectedPDFData.page > 1 && (
                <p className="text-sm text-primary mt-1">Page {selectedPDFData.page}</p>
              )}
              {selectedPDFData.highlight?.text && (
                <div className="mt-2 p-2 bg-warning/10 border border-warning/20 rounded text-sm">
                  <span className="text-warning font-medium">Highlighted: </span>
                  <span className="text-base-content/80">"{selectedPDFData.highlight.text}"</span>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setShowPDFViewer(false);
                setSelectedPDFData(null);
              }}
              className="btn btn-ghost btn-sm btn-circle ml-4"
              aria-label="Close PDF viewer"
            >
              <X size={20} />
            </button>
          </div>

          {/* PDF Content */}
          <PDFViewerEmbedded
            documentId={selectedPDFData.documentId}
            filename={selectedPDFData.filename}
            initialPage={selectedPDFData.page}
          />
        </div>
      )}
    </div>
  );
}
