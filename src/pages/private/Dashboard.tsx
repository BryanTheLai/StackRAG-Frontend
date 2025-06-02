import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchDocumentsAPI, type Doc } from "@/supabase/documents";
import Sidebar from "@/components/Sidebar";
import { CheckCircle, X } from "lucide-react";

export default function Dashboard() {
  const { session, user, isLoading: authLoading, clearAuthError } = useAuth();
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
      const data = await fetchDocumentsAPI(session.access_token);
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
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        <div className="mb-4">
          Logged in as: <code className="kbd kbd-sm">{user?.email}</code>
        </div>

        {msg && (
          <div
            role="alert"
            className={`alert ${
              msg.type === "error" ? "alert-error" : "alert-success"
            } shadow-lg mb-4`}
          >
            <CheckCircle className="stroke-current shrink-0 h-6 w-6" />
            <span>{msg.text}</span>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setMsg(null)}
              aria-label="close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mb-4 space-x-2">
          <button
            onClick={fetchUserDocs}
            className="btn btn-primary"
            disabled={busy || authLoading}
          >
            {busy || authLoading ? (
              <>
                <span className="loading loading-spinner"></span>
                Loading...
              </>
            ) : (
              "Fetch My Documents"
            )}
          </button>
        </div>

        {docs.length > 0 && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Your Documents</h3>
              <ul className="list-disc pl-5">
                {docs.map((d) => (
                  <li key={d.id} className="mb-1">
                    {d.filename}{" "}
                    <span className="badge badge-ghost badge-sm">
                      (ID: {d.id})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
