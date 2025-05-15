<Date> May 15, 2025 11:48</Date>

```App.tsx
import Home from "@/pages/Home";
import ProfilePage from "@/pages/ProfilePage";
import ErrorPage from "@/pages/Error";
import { Link, Route, Switch } from "wouter";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";

export default function App() {
  return (
    <MantineProvider>
      <nav style={{ padding: "10px 20px", marginBottom: "20px", borderBottom: "1px solid #ccc", background: "#f9f9f9" }}>
        <Link href="/" style={{ marginRight: "15px", textDecoration: "none" }}>
          Home
        </Link>
        <Link href="/users/1" style={{ marginRight: "15px", textDecoration: "none" }}>
          Profile (User 1)
        </Link>
        <Link href="/users/alex" style={{ marginRight: "15px", textDecoration: "none" }}>
          Profile (User Alex)
        </Link>
        <Link href="/non-existent-page" style={{ textDecoration: "none" }}>
          Test 404
        </Link>
      </nav>

      <div style={{ padding: "0 20px" }}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/users/:id" component={ProfilePage} />

          {/* 2. Use the ErrorPage component for the 404 route */}
          <Route>
            <ErrorPage
              title="404: Page Not Found"
              message="Sorry, the page you are looking for does not exist."
            />
          </Route>
        </Switch>
      </div>
    </MantineProvider>
  );
}
```

```index.css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

```main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

```vite-env.d.ts
/// <reference types="vite/client" />
```

```lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

```pages/Error.tsx
import { Link } from "wouter";

interface ErrorPageProps {
  title?: string;
  message?: string;
  showGoHomeLink?: boolean;
}

export default function ErrorPage({
  title = "Oops! Something went wrong.",
  message = "We're sorry, but an unexpected error occurred.",
  showGoHomeLink = true,
}: ErrorPageProps) {
    
  return (
    <div>
      <h1>{title}</h1>
      <p>{message}</p>
      {showGoHomeLink && <Link href="/">Go to Homepage</Link>}
    </div>
  );
}
```

```pages/Home.tsx
import { useState, type FormEvent, useEffect } from "react";
import { supabase, signIn, signOut } from "@/supabase/client";
import { fetchDocuments, type Doc } from "@/supabase/documents";
import type { Session } from "@supabase/supabase-js";

export default function Home() {
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
```

```pages/ProfilePage.tsx
import { useParams } from "wouter";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id; 

  return (
    <div style={{ padding: "20px", border: "1px solid #eee", marginTop: "20px" }}>
      <h2>User Profile Page</h2>
      {userId ? (
        <p>Displaying profile for User ID: <strong>{userId}</strong></p>
      ) : (
        <p>User ID not found in URL.</p>
      )}
      <p>This page demonstrates how wouter uses route parameters.</p>
    </div>
  );
}
```

```supabase/client.ts
import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// sign in with email & password
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.session
}

// sign out current user
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
```

```supabase/documents.ts
export interface Doc {
  id: string;
  filename: string;
  user_id: string;
}

export async function fetchDocuments(accessToken: string): Promise<Doc[]> {
  const res = await fetch("http://localhost:8000/documents", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

