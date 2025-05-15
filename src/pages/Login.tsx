import { useState, type FormEvent, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

export default function Login() {
  const {
    signIn,
    isLoading: authLoading,
    authError,
    clearAuthError,
    session,
  } = useAuth();
  const [email, setEmail] = useState(import.meta.env.VITE_TEST_EMAIL || "");
  const [pw, setPw] = useState(import.meta.env.VITE_TEST_PASSWORD || "");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (authError) {
      setFeedback(authError);
    }
  }, [authError]);

  useEffect(() => {
    if (session) {
      navigate("/private/dashboard", { replace: true });
    }
  }, [session, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setFeedback(null);
    await signIn(email, pw);
  };

  if (authLoading && !session) {
    return (
      <div>
        <div>⏳</div>
        <div>Checking authentication…</div>
      </div>
    );
  }

  return (
    <div>
      <h2>Login</h2>
      {feedback && (
        <div>
          {feedback}
          <button
            onClick={() => setFeedback(null)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
      <form onSubmit={onSubmit}>
        <div>
          <label>
            <div>Email</div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
          </label>
          <label>
            <div>Password</div>
            <input
              type="password"
              required
              value={pw}
              onChange={(e) => setPw(e.currentTarget.value)}
            />
          </label>
          <button
            type="submit"
            disabled={authLoading}
          >
            {authLoading ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}