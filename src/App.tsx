import "./App.css";
import { useState, type FormEvent, useEffect } from "react";
import { supabase, signIn, signOut } from "@/supabase/client";
import { fetchDocuments, type Doc } from "@/supabase/documents";
import type { Session } from "@supabase/supabase-js";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(
    null
  );
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [pw, setPw] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    })();

    const sub = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setMsg({ text: _e === "SIGNED_IN" ? "Logged out" : "Logged in" });
      if (_e === "SIGNED_OUT") setDocs([]);
    }).data.subscription;

    return () => sub.unsubscribe();
  }, [supabase]);

  const fetchDocs = async () => {
    if (!session) return setMsg({ text: "Not authenticated", error: true });
    setBusy(true);
    setMsg(null);
    try {
      const data = await fetchDocuments(session.access_token);
      setDocs(data);
      setMsg({
        text: data.length ? `Found ${data.length} docs` : "No docs found",
      });
    } catch (e: unknown) {
      setMsg({
        text: `Fetch error: ${e instanceof Error ? e.message : String(e)}`,
        error: true,
      });
    }
    setBusy(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const session: Session = await signIn(email, pw);
      setSession(session);
      console.log("logged in:", session);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "Arial, sans-serif",
        maxWidth: 600,
        margin: "auto",
      }}
    >
      <h2>Supabase + FastAPI Demo</h2>
      {msg && <p style={{ color: msg.error ? "red" : "green" }}>{msg.text}</p>}

      {!session ? (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: "block", width: "100%", marginBottom: 8 }}
          />
          <input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
            style={{ display: "block", width: "100%", marginBottom: 8 }}
          />
          <button disabled={busy} style={{ padding: "8px 12px" }}>
            {busy ? "Logging in…" : "Login"}
          </button>
        </form>
      ) : (
        <>
          <p>Welcome, {session.user.email}</p>
          <pre
            style={{
              fontSize: "0.8em",
              wordBreak: "break-all",
              maxHeight: 60,
              overflowY: "auto",
              border: "1px solid #ccc",
              padding: 5,
            }}
          >
            {session.access_token}
          </pre>
          <button
            onClick={fetchDocs}
            disabled={busy}
            style={{ marginRight: 8, padding: "8px 12px" }}
          >
            {busy ? "Fetching…" : "Fetch Docs"}
          </button>
          <button
            onClick={signOut}
            disabled={busy}
            style={{ padding: "8px 12px" }}
          >
            Logout
          </button>
        </>
      )}

      {docs.length > 0 && (
        <ul style={{ marginTop: 16, padding: 0, listStyle: "none" }}>
          {docs.map((d) => (
            <li
              key={d.id}
              style={{ border: "1px solid #eee", padding: 8, marginBottom: 4 }}
            >
              {d.filename} (ID: {d.id})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
