import { useState, type ChangeEvent, useEffect, useRef } from "react";
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
import { processDocument, verifyFileNames, getProcessingStatus } from "@/supabase/documents";
import { fetchChatSessions, type ChatSession } from "@/supabase/chatService";

interface SidebarProps {
  onFilesImported?: (files: File[]) => void;
}
type FileStatus = "processing" | "success" | "error";
interface FileResult {
  file: File;
  status: FileStatus;
  error?: string;
  jobId?: string;
  progress?: number;
  currentStep?: string;
}

const links = [
  { link: "/private/dashboard", label: "Dashboard" },
  { link: "/private/documents", label: "Documents" },
  { link: "/private/profile", label: "Profile" },
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
  const pollingIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map());

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

  // Poll job status for a specific file
  const pollJobStatus = async (jobId: string, fileIndex: number) => {
    if (!session) return;

    try {
      const status = await getProcessingStatus(jobId, session.access_token);
      
      setResults((prev) => {
        const updated = [...prev];
        if (updated[fileIndex]) {
          updated[fileIndex] = {
            ...updated[fileIndex],
            progress: status.progress_percentage,
            currentStep: status.current_step,
          };

          // Handle completion states
          if (status.status === 'completed') {
            updated[fileIndex].status = 'success';
            const interval = pollingIntervals.current.get(jobId);
            if (interval) {
              clearInterval(interval);
              pollingIntervals.current.delete(jobId);
            }
            // Notify parent to refresh documents list
            onFilesImported?.([updated[fileIndex].file]);
          } else if (status.status === 'failed') {
            updated[fileIndex].status = 'error';
            updated[fileIndex].error = status.error_message || 'Processing failed';
            const interval = pollingIntervals.current.get(jobId);
            if (interval) {
              clearInterval(interval);
              pollingIntervals.current.delete(jobId);
            }
          }
        }
        return updated;
      });
    } catch (err) {
      console.error(`Error polling job ${jobId}:`, err);
      // Don't mark as error immediately - could be temporary network issue
    }
  };

  // Retry failed upload
  const handleRetry = async (fileIndex: number) => {
    if (!session) return;
    
    const result = results[fileIndex];
    if (!result || result.status !== 'error') return;

    // Reset to processing state
    setResults((prev) => {
      const updated = [...prev];
      updated[fileIndex] = {
        ...updated[fileIndex],
        status: 'processing',
        progress: 0,
        currentStep: 'Retrying upload...',
        error: undefined,
      };
      return updated;
    });

    try {
      const response = await processDocument(result.file, session.access_token);
      
      // Update with new job ID and start polling
      setResults((prev) => {
        const updated = [...prev];
        if (updated[fileIndex]) {
          updated[fileIndex].jobId = response.job_id;
          updated[fileIndex].currentStep = 'Queued for processing...';
        }
        return updated;
      });

      // Start polling this job
      const interval = setInterval(() => {
        pollJobStatus(response.job_id, fileIndex);
      }, 2000);
      
      pollingIntervals.current.set(response.job_id, interval);

    } catch (err) {
      setResults((prev) => {
        const updated = [...prev];
        if (updated[fileIndex]) {
          updated[fileIndex].status = 'error';
          updated[fileIndex].error = (err as Error).message;
        }
        return updated;
      });
    }
  };

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

    // Initialize results with processing status
    setResults(files.map((f) => ({ 
      file: f, 
      status: "processing",
      progress: 0,
      currentStep: "Uploading..."
    })));

    // Start uploads and get job IDs
    const uploadPromises = files.map(async (file, index) => {
      try {
        const response = await processDocument(file, session.access_token);
        
        // Update with job ID and start polling
        setResults((prev) => {
          const updated = [...prev];
          if (updated[index]) {
            updated[index].jobId = response.job_id;
            updated[index].currentStep = "Queued for processing...";
          }
          return updated;
        });

        // Start polling this job every 2 seconds
        const interval = setInterval(() => {
          pollJobStatus(response.job_id, index);
        }, 2000);
        
        pollingIntervals.current.set(response.job_id, interval);

        return { success: true, index, jobId: response.job_id };
      } catch (err) {
        setResults((prev) => {
          const updated = [...prev];
          if (updated[index]) {
            updated[index].status = 'error';
            updated[index].error = (err as Error).message;
          }
          return updated;
        });
        return { success: false, index, error: err };
      }
    });

    await Promise.allSettled(uploadPromises);
    input.value = "";
  };

  // Cleanup polling intervals on unmount
  useEffect(() => {
    return () => {
      pollingIntervals.current.forEach((interval) => clearInterval(interval));
      pollingIntervals.current.clear();
    };
  }, []);

  // local component for Chat History dropdown trigger
  const ToggleIcon = collapsed ? Menu : X;

  return (
    <div
      className={`h-screen flex flex-col justify-between border-r border-base-300 transition-width duration-200 ${
        collapsed ? "w-16" : "w-60"
      } bg-base-100 text-base-content`}
    >
      {/* Top section: toggle and nav */}
      <div>
        <div className="p-2 flex justify-end">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="btn btn-square btn-ghost text-base-content"
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
                    className={`px-3 py-2 rounded-box font-medium transition w-full flex justify-between items-center text-left ${getNavClass(
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
                            className={`block px-3 py-1 rounded-box text-sm transition ${
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
                          className="block px-3 py-1 rounded-box text-sm text-base-content/70 hover:bg-base-200 hover:text-base-content font-medium"
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
                  className={`px-3 py-2 rounded-box font-medium transition w-full text-left ${getNavClass(
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
              className={`btn btn-outline btn-primary w-full ${
                isProcessing ? "cursor-not-allowed opacity-70" : ""
              } bg-base-100 text-base-content border-base-300`}
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
                {results.map(({ file, status, error, progress }, i) => (
                  <li
                    key={i}
                    className="flex flex-col min-w-0 bg-base-100 text-base-content p-2 rounded-md border border-base-300"
                  >
                    <div className="flex items-center min-w-0 gap-2">
                      <span
                        title={file.name}
                        className="flex-1 text-xs truncate font-medium"
                      >
                        {file.name}
                      </span>
                      {status === "processing" && progress !== undefined && (
                        <span className="text-xs font-semibold text-primary whitespace-nowrap">
                          {progress}%
                        </span>
                      )}
                      <div className="w-4 flex justify-center flex-shrink-0">
                        {status === "processing" && (
                          <Loader2 className="h-4 w-4 text-primary animate-spin" />
                        )}
                        {status === "success" && (
                          <CheckCircle className="h-4 w-4 text-success" />
                        )}
                        {status === "error" && (
                          <div title={error}>
                            <AlertTriangle className="h-4 w-4 text-error" />
                          </div>
                        )}
                      </div>
                    </div>
                    {status === "processing" && (
                      <div className="mt-1.5">
                        <progress 
                          className="progress progress-primary w-full h-1" 
                          value={progress || 0} 
                          max="100"
                        />
                      </div>
                    )}
                    {status === "error" && error && (
                      <div className="mt-1 flex items-start justify-between gap-2">
                        <div className="text-xs text-error flex-1 leading-tight">{error}</div>
                        <button
                          onClick={() => handleRetry(i)}
                          className="btn btn-xs btn-error btn-outline"
                          disabled={isProcessing}
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-4">
            <p className="signed-in-as text-base-content/70">Signed in as</p>
            <p className="font-medium mb-3 text-base-content">{user?.email}</p>
            <button
              onClick={() => void signOut()}
              className="btn btn-outline btn-error w-full border-base-300 bg-base-100 text-error"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
