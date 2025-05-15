<Date> May 15, 2025 12:27</Date>

```App.tsx
import Home from "@/pages/Home";
import ErrorPage from "@/pages/Error";
import { Link, Route, Switch } from "wouter";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";

// New Imports
import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import Section from "@/pages/private/Section";

export default function App() {
  return (
    <AuthProvider>
      <MantineProvider>
        <nav style={{ padding: "10px 20px", marginBottom: "20px", borderBottom: "1px solid #ccc", background: "#f9f9f9", display: "flex", gap: "15px", alignItems: "center" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            Home / Login
          </Link>
          <Link href="/private/profile/ec2-525-61" style={{ textDecoration: "none" }}>
            Link to Citation for 'ec2-525-61' (Private)
          </Link>
          <Link href="/non-existent-page" style={{ textDecoration: "none" }}>
            Test 404
          </Link>
        </nav>

        <div style={{ padding: "0 20px" }}>
          <Switch>
            <Route path="/" component={Home} />
            
            <Route path="/private/profile/:id">
              {(_params) => (
                <PrivateRoute>
                  <Section />
                </PrivateRoute>
              )}
            </Route>

            <Route>
              <ErrorPage
                title="404: Page Not Found"
                message="Sorry, the page you are looking for does not exist."
              />
            </Route>
          </Switch>
        </div>
      </MantineProvider>
    </AuthProvider>
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

```components/PrivateRoute.tsx
import { type ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect, useLocation } from 'wouter';
import { Loader } from '@mantine/core'; // Using Mantine Loader

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { session, isLoading } = useAuth();
  const [, navigate] = useLocation(); // For programmatic navigation if needed

  useEffect(() => {
    // This effect can handle scenarios where session might become null
    // after initial load, though onAuthStateChange in AuthContext should manage redirects.
    if (!isLoading && !session) {
      navigate('/', { replace: true });
    }
  }, [isLoading, session, navigate]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader />
      </div>
    );
  }

  if (!session) {
    // Redirect component is preferred for declarative routing
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}
```

```contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, signIn as supabaseSignIn, signOut as supabaseSignOut } from '@/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import { useLocation } from 'wouter';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        if (event === "SIGNED_IN") {
          // Optional: Redirect to a specific page after sign-in
          // navigate('/private/profile/me', { replace: true }); // Example
        } else if (event === "SIGNED_OUT") {
          // Optional: Redirect to home/login page after sign-out
          navigate('/', { replace: true });
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, pass: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      // onAuthStateChange will handle setting session and user
      await supabaseSignIn(email, pass);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'An unknown error occurred during sign in.');
      setIsLoading(false); // Ensure loading is false on error
    }
    // setIsLoading(false) will be handled by onAuthStateChange or the catch block
  };

  const signOut = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await supabaseSignOut();
      // onAuthStateChange will handle setting session and user to null and navigation
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'An unknown error occurred during sign out.');
      setIsLoading(false); // Ensure loading is false on error
    }
    // setIsLoading(false) will be handled by onAuthStateChange or the catch block
  };
  
  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider value={{ session, user, isLoading, signIn, signOut, authError, clearAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
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
import { useAuth } from "@/contexts/AuthContext";
import { fetchDocuments, type Doc } from "@/supabase/documents";
import { Button, TextInput, Paper, Title, Text, Alert, Group, Code, Stack, Loader } from "@mantine/core"; // Using Mantine components

export default function Home() {
  const { session, user, signIn, signOut: authSignOut, isLoading: authIsLoading, authError, clearAuthError } = useAuth();
  
  const [docs, setDocs] = useState<Doc[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [fetchBusy, setFetchBusy] = useState(false);
  
  const [email, setEmail] = useState<string>(import.meta.env.VITE_TEST_EMAIL || "");
  const [pw, setPw] = useState<string>(import.meta.env.VITE_TEST_PASSWORD || "");

  useEffect(() => {
    if (authError) {
      setFeedbackMsg({ text: authError, type: 'error' });
    }
  }, [authError]);

  const fetchUserDocs = async () => {
    if (!session) {
      setFeedbackMsg({ text: "Authentication required to fetch documents.", type: 'error' });
      return;
    }
    setFetchBusy(true);
    setFeedbackMsg(null); 
    clearAuthError();
    try {
      const data: Doc[] = await fetchDocuments(session.access_token);
      setDocs(data);
      setFeedbackMsg({
        text: data.length ? `Found ${data.length} document(s).` : "No documents found for your account.",
        type: 'success',
      });
    } catch (e: unknown) {
      setFeedbackMsg({
        text: `Document fetch error: ${e instanceof Error ? e.message : String(e)}`,
        type: 'error',
      });
    }
    setFetchBusy(false);
  };

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearAuthError();
    setFeedbackMsg(null);
    await signIn(email, pw);
  };

  const handleLogout = async () => {
    clearAuthError();
    setFeedbackMsg(null);
    await authSignOut();
    setDocs([]);
  };
  
  if (authIsLoading && !session) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <Loader size="xl" />
        <Text mt="md">Loading authentication status...</Text>
      </div>
    );
  }

  return (
    <Paper shadow="xs" p="xl" style={{ maxWidth: 600, margin: "auto" }}>
      <Title order={2} ta="center" mb="lg">
        {session ? "Welcome Back!" : "AI CFO Assistant"}
      </Title>

      {feedbackMsg && (
        <Alert 
          title={feedbackMsg.type === 'error' ? "Error" : "Notification"} 
          color={feedbackMsg.type === 'error' ? 'red' : 'blue'} 
          mb="md"
          onClose={() => setFeedbackMsg(null)}
          withCloseButton
        >
          {feedbackMsg.text}
        </Alert>
      )}
      
      {!session ? (
        <form onSubmit={handleLoginSubmit}>
          <Stack>
            <TextInput
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
            />
            <TextInput
              label="Password"
              type="password"
              placeholder="Your password"
              value={pw}
              onChange={(e) => setPw(e.currentTarget.value)}
              required
            />
            <Button type="submit" loading={authIsLoading} fullWidth>
              Login
            </Button>
          </Stack>
        </form>
      ) : (
        <Stack>
          <Text>Logged in as: <Code>{user?.email}</Code></Text>
          
          <Group>
            <Button onClick={fetchUserDocs} loading={fetchBusy || authIsLoading}>
              Fetch My Documents
            </Button>
            <Button variant="outline" onClick={handleLogout} loading={authIsLoading}>
              Logout
            </Button>
          </Group>

          {docs.length > 0 && (
            <>
              <Title order={4} mt="lg">Your Documents:</Title>
              <Stack gap="xs" mt="xs">
                {docs.map((d) => (
                  <Paper key={d.id} p="sm" withBorder>
                    <Text>{d.filename} (ID: {d.id})</Text>
                  </Paper>
                ))}
              </Stack>
            </>
          )}
        </Stack>
      )}
    </Paper>
  );
}
```

```pages/private/Section.tsx
import { useParams } from "wouter";

export default function Section() {
  const params = useParams();
  const sectionId = params.id; 

  return (
    <div>
      <h2>Section Page</h2>
      {sectionId ? (
        <p>Displaying Section for Section ID: <strong>{sectionId}</strong></p>
      ) : (
        <p>Section ID not found in URL.</p>
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

