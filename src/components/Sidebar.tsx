import { useState, type ChangeEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";

interface SidebarProps {
  onFilesImported?: (files: File[]) => void;
}

const links = [
  { link: "/private/dashboard", label: "Dashboard" },
  { link: "/private/documents", label: "Documents" },
  { link: "/private/chat", label: "Chat" },
];

export default function Sidebar({ onFilesImported }: SidebarProps) {
  const { user, signOut } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setFiles(fileArray);
      setShowModal(true);
      onFilesImported?.(fileArray);
    }
  };

  return (
    <>
      <div
        className={`h-screen bg-base-100 flex flex-col justify-between border-r border-base-300 transition-width duration-100 ${
          collapsed ? "w-16" : "w-50"
        }`}
      >
        <div className="p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
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
            <div>
              <nav className="flex flex-col p-4 space-y-2">
                {links.map(({ link, label }) => (
                  <Link
                    key={label}
                    href={link}
                    className={`px-3 py-2 rounded transition-colors text-base font-medium ${
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
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="btn btn-primary w-full">
                  Import Files
                </label>
              </div>
            </div>

            <div className="p-4">
              <p className="mb-2 text-sm text-neutral-content">Signed in as</p>
              <p className="font-medium mb-4 text-base-content">
                {user?.email}
              </p>
              <button
                className="btn btn-secondary w-full"
                onClick={() => void signOut()}
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-base-content">
              File Upload Info
            </h3>
            <ul className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {files.map((file, idx) => (
                <li key={idx} className="text-sm text-base-content">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-neutral-content">
                    Size: {file.size} bytes
                  </p>
                  <p className="text-xs text-neutral-content">
                    Last Modified:{" "}
                    {new Date(file.lastModified).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
