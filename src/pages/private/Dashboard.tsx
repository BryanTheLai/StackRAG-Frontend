import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchDocuments, type Doc } from "@/supabase/documents";

export default function Dashboard() {
  const {
    session,
    user,
    signOut,
    isLoading: authLoading,
    clearAuthError,
  } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const fetchUserDocs = async () => {
    if (!session) {
      setMsg({ text: "Sign in required.", type: "error" });
      return;
    }
    setBusy(true);
    setMsg(null);
    clearAuthError();
    try {
      const data = await fetchDocuments(session.access_token);
      setDocs(data);
      setMsg({
        text: data.length ? `Found ${data.length} documents.` : "No documents.",
        type: "success",
      });
    } catch (e) {
      setMsg({
        text: `Fetch error: ${e instanceof Error ? e.message : String(e)}`,
        type: "error",
      });
    }
    setBusy(false);
  };

  const onLogout = async () => {
    clearAuthError();
    setMsg(null);
    await signOut();
    setDocs([]);
  };

  if (authLoading) {
    return (
      <div>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <div>
        Logged in as: <code>{user?.email}</code>
      </div>

      {msg && (
        <div>
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} aria-label="close">
            ×
          </button>
        </div>
      )}

      <div>
        <button
          onClick={fetchUserDocs}
          disabled={busy || authLoading}
        >
          {busy || authLoading ? "Loading..." : "Fetch My Documents"}
        </button>
        <button
          onClick={onLogout}
          disabled={authLoading}
        >
          Logout
        </button>
      </div>

      {docs.length > 0 && (
        <div>
          <h3>Your Documents</h3>
          <ul>
            {docs.map((d) => (
              <li key={d.id}>
                {d.filename}{" "}
                <span>(ID: {d.id})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}