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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <div className="mt-4 text-lg">Checking authentication…</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-base-200">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-base-100">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {feedback && (
          <div className="alert alert-error mb-4 flex justify-between items-center">
            <span>{feedback}</span>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={() => setFeedback(null)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              className="input input-bordered w-full"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              autoComplete="username"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              className="input input-bordered w-full"
              type="password"
              required
              value={pw}
              onChange={(e) => setPw(e.currentTarget.value)}
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full mt-2"
            disabled={authLoading}
          >
            {authLoading ? (
              <span className="loading loading-spinner loading-xs mr-2"></span>
            ) : null}
            {authLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}