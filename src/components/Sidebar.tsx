import { useState, type ChangeEvent, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import {
  Menu,
  X,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { processDocument, verifyFileNames } from "@/supabase/documents";
import { fetchChatSessions, type ChatSession } from "@/supabase/chatService";

interface SidebarProps {
  onFilesImported?: (files: File[]) => void;
}
type FileStatus = "processing" | "success" | "error";
interface FileResult {
  file: File;
  status: FileStatus;
  error?: string;
}

const links = [
  { link: "/private/dashboard", label: "Dashboard" },
  { link: "/private/documents", label: "Documents" },
  { link: "/private/chathistory", label: "Chat History" },
];

// Helper for active route and common classes
const getNavClass = (active: boolean) =>
  active
    ? "bg-primary text-primary-content"
    : "text-base-content hover:bg-base-200";

export default function Sidebar({ onFilesImported }: SidebarProps) {
  const { user, session, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [results, setResults] = useState<FileResult[]>([]);
  const [location] = useLocation();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [showChatHistoryDropdown, setShowChatHistoryDropdown] = useState(false);
  const [chatHistoryError, setChatHistoryError] = useState<string | null>(null);

  const isProcessing = results.some((r) => r.status === "processing");

  // Fetch chat sessions for the dropdown
  useEffect(() => {
    if (user?.id && !collapsed) {
      setChatHistoryError(null);
      fetchChatSessions(user.id)
        .then(setChatSessions)
        .catch((err) => {
          console.error("Error fetching chat sessions for sidebar:", err);
          setChatHistoryError(
            err instanceof Error ? err.message : "Failed to load chat history"
          );
        });
    } else {
      setChatSessions([]); // Clear sessions if no user or sidebar is collapsed
      if (collapsed) {
        setShowChatHistoryDropdown(false); // Hide dropdown if sidebar collapses
      }
    }
  }, [user, collapsed, location]); // Added location to dependencies to refetch on navigation for active link update

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const fileList = input.files;
    if (!fileList || !session) return;
    const files = Array.from(fileList);

    // verify filenames on server
    const filenames = files.map((f) => f.name);
    try {
      const existing = await verifyFileNames(user!.id, filenames);
      if (existing.length) {
        alert(
          `File "${existing[0]}" already exists. Please delete or rename before importing.`
        );
        input.value = "";
        return;
      }
    } catch (err) {
      console.error("Error checking documents:", err);
      alert("Server check failed. Try again later.");
      input.value = "";
      return;
    }

    // start processing
    setResults(files.map((f) => ({ file: f, status: "processing" })));

    const settled = await Promise.allSettled(
      files.map((f) => processDocument(f, session.access_token))
    );

    const newResults: FileResult[] = settled.map<FileResult>((r, i) =>
      r.status === "fulfilled"
        ? { file: files[i], status: "success" }
        : {
            file: files[i],
            status: "error",
            error: (r.reason as Error).message,
          }
    );

    setResults(newResults);
    input.value = "";

    onFilesImported?.(files);
  };

  // local component for Chat History dropdown trigger
  const ToggleIcon = collapsed ? Menu : X;

  return (
    <div
      className={`h-screen bg-base-100 flex flex-col justify-between border-r border-base-300 transition-width duration-200 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Top section: toggle and nav */}
      <div>
        <div className="p-2 flex justify-end">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="btn btn-square btn-ghost"
            aria-label="Toggle sidebar"
          >
            <ToggleIcon className="h-6 w-6" />
          </button>
        </div>
        {!collapsed && (
          <nav className="flex flex-col p-4 space-y-1">
            {links.map(({ link, label }) =>
              label === "Chat History" ? (
                <div key={label} className="relative">
                  <button
                    onClick={() => setShowChatHistoryDropdown((v) => !v)}
                    className={`px-3 py-2 rounded font-medium transition w-full flex justify-between items-center text-left ${getNavClass(
                      location === link || showChatHistoryDropdown
                    )}`}
                  >
                    {label}
                    {showChatHistoryDropdown ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                  {showChatHistoryDropdown && (
                    <div className="pl-4 mt-1 space-y-1">
                      {chatHistoryError && (
                        <p className="px-3 py-1 text-sm text-error/80">
                          Error loading chats.
                        </p>
                      )}
                      {!chatHistoryError && chatSessions.length === 0 && (
                        <p className="px-3 py-1 text-sm text-base-content/60">
                          No recent chats.
                        </p>
                      )}
                      {!chatHistoryError &&
                        chatSessions.slice(0, 3).map((session) => (
                          <Link
                            key={session.id}
                            href={`/private/chat/${session.id}`}
                            className={`block px-3 py-1 rounded text-sm transition ${
                              location === `/private/chat/${session.id}`
                                ? "bg-primary/20 text-primary font-semibold"
                                : "text-base-content/80 hover:bg-base-200 hover:text-base-content"
                            }`}
                            title={session.title || "Untitled Chat"}
                            onClick={() => setShowChatHistoryDropdown(false)} // Close dropdown on link click
                          >
                            <span className="truncate block">
                              {session.title || "Untitled Chat"}
                            </span>
                          </Link>
                        ))}
                      {!chatHistoryError && (
                        <Link
                          href="/private/chathistory"
                          className="block px-3 py-1 rounded text-sm text-base-content/70 hover:bg-base-200 hover:text-base-content font-medium"
                          onClick={() => setShowChatHistoryDropdown(false)} // Close dropdown on link click
                        >
                          View all...
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={label}
                  href={link}
                  className={`px-3 py-2 rounded font-medium transition w-full text-left ${getNavClass(
                    location === link
                  )}`}
                >
                  {label}
                </Link>
              )
            )}
          </nav>
        )}
      </div>

      {/* Bottom section: import and user info */}
      {!collapsed && (
        <div className="p-4 space-y-4">
          <div>
            {/* File import button always visible; disable and show spinner when processing */}
            <input
              id="file-upload"
              type="file"
              multiple
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            <label
              htmlFor="file-upload"
              className={`btn btn-primary w-full ${
                isProcessing ? "cursor-not-allowed opacity-70" : ""
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2 inline-block" />
                  Processing...
                </>
              ) : (
                "Import PDF"
              )}
            </label>

            {results.length > 0 && (
              <ul className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {results.map(({ file, status, error }, i) => (
                  <li key={i} className="flex items-center min-w-0">
                    <span
                      title={file.name}
                      className="flex-1 text-sm truncate mr-2"
                    >
                      {file.name}
                    </span>
                    <div className="w-5 flex justify-center">
                      {status === "success" && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {status === "error" && (
                        <div title={error} className="w-5 flex justify-center">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-4">
            <p className="text-sm text-neutral-content mb-1">Signed in as</p>
            <p className="font-medium mb-3">{user?.email}</p>
            <button
              onClick={() => void signOut()}
              className="btn btn-secondary w-full"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
