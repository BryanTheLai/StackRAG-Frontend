import { useState, type ChangeEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { Menu, X, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { processDocument, verifyFileNames } from "@/supabase/documents";

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
  { link: "/private/chat", label: "Chat" },
];

export default function Sidebar({ onFilesImported }: SidebarProps) {
  const { user, session, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [results, setResults] = useState<FileResult[]>([]);
  const [location] = useLocation();

  const isProcessing = results.some((r) => r.status === "processing");

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
        alert(`File "${existing[0]}" already exists. Please delete or rename before importing.`);
        input.value = "";
        return;
      }
    } catch (err) {
      console.error('Error checking documents:', err);
      alert('Server check failed. Try again later.');
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
        : { file: files[i], status: "error", error: (r.reason as Error).message }
    );

    setResults(newResults);
    input.value = "";

    onFilesImported?.(files);
  };

  return (
    <>
      <div
        className={`h-screen bg-base-100 flex flex-col justify-between border-r border-base-300 transition-width duration-200 ${
          collapsed ? "w-16" : "w-50"
        }`}
      >
        <div className="p-2">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="btn btn-square btn-ghost"
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <Menu className="h-6 w-6" />
            ) : (
              <X className="h-6 w-6" />
            )}
          </button>
        </div>
        {!collapsed && (
          <>
            <nav className="flex flex-col p-4 space-y-2">
              {links.map(({ link, label }) => (
                <Link
                  key={label}
                  href={link}
                  className={`px-3 py-1 rounded font-medium transition ${
                    location === link
                      ? "bg-primary text-primary-content"
                      : "text-base-content hover:bg-base-200"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="p-4">
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
          </>
        )}
      </div>
    </>
  );
}

