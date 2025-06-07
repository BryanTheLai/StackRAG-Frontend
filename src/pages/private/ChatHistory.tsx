import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import { Link, useLocation } from "wouter";
import { PlusCircle, Trash2, Edit3, MoreVertical, Check, X } from "lucide-react"; 
import type { ChatSession } from "@/supabase/chatService"; // Type-only import
import { 
  createChatSession, 
  fetchChatSessions, 
  deleteChatSession, 
  updateChatSessionTitle 
} from "@/supabase/chatService";

export default function ChatHistoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [, navigate] = useLocation(); // For navigation

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      fetchChatSessions(user.id)
        .then(setChatSessions)
        .catch((err) =>
          setError(
            err instanceof Error ? err.message : "Failed to load sessions"
          )
        )
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleCreateNewChat = async () => {
    if (!user?.id) return;
    try {
      // Create the new session
      const newSessionId = await createChatSession(user.id, "New Chat"); 
      // Refresh the list to show the new chat
      const sessions = await fetchChatSessions(user.id);
      setChatSessions(sessions);
      // Navigate to the new chat session
      navigate(`/private/chat/${newSessionId}`); 
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create new chat"
      );
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this chat session?")) return;
    try {
      await deleteChatSession(sessionId);
      setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete session"
      );
    }
  };

  const handleStartEdit = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setNewTitle(session.title || "");
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setNewTitle("");
  };

  const handleSaveTitle = async (sessionId: string) => {
    if (!newTitle.trim()) {
      alert("Title cannot be empty.");
      return;
    }
    try {
      await updateChatSessionTitle(sessionId, newTitle.trim());
      // Fetch the updated list to get the correct updated_at timestamp from the DB
      if (user?.id) {
        const sessions = await fetchChatSessions(user.id);
        setChatSessions(sessions);
      }
      setEditingSessionId(null);
      setNewTitle("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update title"
      );
    }
  };
  
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} s ago`; // Shorter format
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`; // Shorter format
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr ago`; // Shorter format
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return `Yesterday`;
    if (diffInDays < 30) return `${diffInDays} days ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths === 1) return `1 month ago`;
    return `${diffInMonths} months ago`;
  };


  if (authLoading || loading) {
    return (
      <div className="flex h-screen bg-base-200">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-base-200">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-base-200 text-base-content">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">My files</h1>
          <button
            onClick={handleCreateNewChat}
            className="btn btn-primary"
          >
            <PlusCircle size={20} className="mr-2" />
            New Chat
          </button>
        </div>

        {chatSessions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xl text-gray-500">No chat sessions yet.</p>
            <p className="text-gray-400">Click "New Chat" to start a conversation.</p>
          </div>
        ) : (
          <div className="bg-base-100 shadow-xl rounded-lg">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left hidden md:table-cell">Type</th>
                  <th className="p-4 text-left">Updated</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {chatSessions.map((session) => (
                  <tr key={session.id} className="border-b border-base-300 hover:bg-base-200/50">
                    <td className="p-4">
                      {editingSessionId === session.id ? (
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveTitle(session.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="input input-sm input-bordered w-full max-w-xs"
                          autoFocus
                          onBlur={() => handleSaveTitle(session.id)} // Save on blur
                        />
                      ) : (
                        <Link href={`/private/chat/${session.id}`} className="link link-hover font-medium">
                          {session.title || "Untitled Chat"}
                        </Link>
                      )}
                    </td>
                    <td className="p-4 hidden md:table-cell">Chat prompt</td>
                    <td className="p-4 text-sm text-base-content/70">{formatRelativeTime(session.updated_at)}</td>
                    <td className="p-4 text-right">
                      {editingSessionId === session.id ? (
                        <>
                          <button 
                            onClick={() => handleSaveTitle(session.id)} 
                            className="btn btn-xs btn-ghost text-success mr-1"
                            title="Save title"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            onClick={handleCancelEdit} 
                            className="btn btn-xs btn-ghost text-error"
                            title="Cancel edit"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <div className="dropdown dropdown-end">
                          <label tabIndex={0} className="btn btn-ghost btn-xs">
                            <MoreVertical size={18} />
                          </label>
                          <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-36 z-10">
                            <li>
                              <button onClick={() => handleStartEdit(session)} className="flex items-center w-full text-left px-3 py-2 hover:bg-base-200 rounded">
                                <Edit3 size={16} className="mr-2" /> Rename
                              </button>
                            </li>
                            <li>
                              <button onClick={() => handleDelete(session.id)} className="flex items-center w-full text-left text-error px-3 py-2 hover:bg-base-200 rounded">
                                <Trash2 size={16} className="mr-2" /> Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}