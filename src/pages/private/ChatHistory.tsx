// React hooks
import { useEffect, useState } from "react";

// Auth and routing
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";

// Components
import Sidebar from "@/components/Sidebar";

// Icons
import {
  PlusCircle,
  Trash2,
  Edit3,
  MoreVertical,
  Check,
  X,
} from "lucide-react";

// Types and services
import type { ChatSession } from "@/supabase/chatService";
import {
  createChatSession,
  fetchChatSessions,
  deleteChatSession,
  updateChatSessionTitle,
} from "@/supabase/chatService";

export default function ChatHistoryPage() {
  // Authentication and routing
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  // Chat sessions state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  // Load chat sessions when user is available
  useEffect(() => {
    const loadChatSessions = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const sessions = await fetchChatSessions(user.id);
        setChatSessions(sessions);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load sessions";
        setError(errorMessage);
        console.error("Failed to load chat sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadChatSessions();
  }, [user]);
  // Helper function to refresh chat sessions list
  const refreshChatSessions = async () => {
    if (!user?.id) return;

    try {
      const sessions = await fetchChatSessions(user.id);
      setChatSessions(sessions);
    } catch (err) {
      console.error("Failed to refresh chat sessions:", err);
    }
  };

  // Helper function to handle errors consistently
  const handleError = (error: unknown, operation: string) => {
    const errorMessage =
      error instanceof Error ? error.message : `Failed to ${operation}`;
    setError(errorMessage);
    console.error(`${operation} error:`, error);
  };

  // Create new chat session and navigate to it
  const handleCreateNewChat = async () => {
    if (!user?.id) return;

    try {
      const newSessionId = await createChatSession(user.id, "New Chat");
      await refreshChatSessions();
      navigate(`/private/chat/${newSessionId}`);
    } catch (err) {
      handleError(err, "create new chat");
    }
  };

  // Delete a chat session with confirmation
  const handleDelete = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this chat session?")) return;

    try {
      await deleteChatSession(sessionId);
      setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      handleError(err, "delete session");
    }
  };

  // Start editing a session title
  const handleStartEdit = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setNewTitle(session.title || "");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setNewTitle("");
  };

  // Save the edited title
  const handleSaveTitle = async (sessionId: string) => {
    if (!newTitle.trim()) {
      alert("Title cannot be empty.");
      return;
    }

    try {
      await updateChatSessionTitle(sessionId, newTitle.trim());
      await refreshChatSessions();
      setEditingSessionId(null);
      setNewTitle("");
    } catch (err) {
      handleError(err, "update title");
    }
  };
  // Format date as relative time (e.g., "2 hours ago", "Yesterday")
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Less than a minute
    if (diffInSeconds < 60) {
      return `${diffInSeconds} s ago`;
    }

    // Less than an hour
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    }

    // Less than a day
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hr ago`;
    }

    // Handle days and months
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 30) return `${diffInDays} days ago`;

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths === 1) return "1 month ago";
    return `${diffInMonths} months ago`;
  };

  // Render loading state
  const renderLoadingState = () => (
    <div className="flex h-screen bg-base-200 text-base-content">
      {" "}
      {/* Use the same flex container as the final layout */}
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        {" "}
        {/* Centering the spinner within the flex-1 area */}
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    </div>
  );

  // Render error state
  const renderErrorState = () => (
    <div className="hero min-h-screen bg-base-200">
      <Sidebar />
      <div className="hero-content p-4">
        <div className="alert alert-error shadow-lg">Error: {error}</div>
      </div>
    </div>
  );

  // Render empty state when no chat sessions exist
  const renderEmptyState = () => (
    <div className="text-center py-10">
      <p className="text-xl text-gray-500">No chat sessions yet.</p>
      <p className="text-gray-400">Click "New Chat" to start a conversation.</p>
    </div>
  );

  // Render title input for editing
  const renderTitleInput = (sessionId: string) => (
    <input
      type="text"
      value={newTitle}
      onChange={(e) => setNewTitle(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleSaveTitle(sessionId);
        if (e.key === "Escape") handleCancelEdit();
      }}
      className="input input-sm input-bordered w-full max-w-xs"
      autoFocus
      onBlur={() => handleSaveTitle(sessionId)}
    />
  );

  // Render edit actions (save/cancel buttons)
  const renderEditActions = (sessionId: string) => (
    <>
      <button
        onClick={() => handleSaveTitle(sessionId)}
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
  );

  // Render dropdown menu for session actions
  const renderSessionActions = (session: ChatSession) => (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-xs">
        <MoreVertical size={18} />
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-36 z-10"
      >
        <li>
          <button
            onClick={() => handleStartEdit(session)}
            className="flex items-center w-full text-left px-3 py-2 hover:bg-base-200 rounded"
          >
            <Edit3 size={16} className="mr-2" /> Rename
          </button>
        </li>
        <li>
          <button
            onClick={() => handleDelete(session.id)}
            className="flex items-center w-full text-left text-error px-3 py-2 hover:bg-base-200 rounded"
          >
            <Trash2 size={16} className="mr-2" /> Delete
          </button>
        </li>
      </ul>
    </div>
  );

  // Render a single session row
  const renderSessionRow = (session: ChatSession) => (
    <tr
      key={session.id}
      className="border-b border-base-300 hover:bg-base-200/50"
    >
      <td className="p-4">
        {editingSessionId === session.id ? (
          renderTitleInput(session.id)
        ) : (
          <Link
            href={`/private/chat/${session.id}`}
            className="link link-hover font-medium"
          >
            {session.title || "Untitled Chat"}
          </Link>
        )}
      </td>
      <td className="p-4 hidden md:table-cell">Chat prompt</td>
      <td className="p-4 text-sm text-base-content/70">
        {formatRelativeTime(session.updated_at)}
      </td>
      <td className="p-4 text-right">
        {editingSessionId === session.id
          ? renderEditActions(session.id)
          : renderSessionActions(session)}
      </td>
    </tr>
  );

  // Early returns for loading and error states
  if (authLoading || loading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }
  return (
    <div className="flex h-screen bg-base-200 text-base-content">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">My files</h1>
          <button onClick={handleCreateNewChat} className="btn btn-primary">
            <PlusCircle size={20} className="mr-2" />
            New Chat
          </button>
        </div>

        {/* Content */}
        {chatSessions.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="card shadow-xl">
            <table className="table">
              <thead>
                <tr>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left hidden md:table-cell">Type</th>
                  <th className="p-4 text-left">Updated</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>{chatSessions.map(renderSessionRow)}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
