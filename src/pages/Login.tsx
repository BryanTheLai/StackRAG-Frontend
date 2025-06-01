import { type FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { AlertCircle } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
        <span className="loading loading-lg loading-spinner text-primary"></span>
        <div className="mt-4 text-lg text-base-content">
          Checking authentication…
        </div>
      </div>
    );
  }

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left lg:pl-10">
          <h1 className="text-5xl font-bold">Login now!</h1>
          <p className="py-6">
            Access your AI CFO Assistant dashboard to manage your finances
            effectively.
          </p>
        </div>
        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <form className="card-body" onSubmit={onSubmit}>
            {feedback && (
              <div role="alert" className="alert alert-error mb-4">
                <AlertCircle className="stroke-current shrink-0 h-6 w-6" />
                <span>{feedback}</span>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => setFeedback(null)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="email"
                className="input input-bordered"
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
                type="password"
                placeholder="password"
                className="input input-bordered"
                required
                value={pw}
                onChange={(e) => setPw(e.currentTarget.value)}
                autoComplete="current-password"
              />
              {/* <label className="label">
                <a href="#" className="label-text-alt link link-hover">Forgot password?</a>
              </label> */}
            </div>
            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={authLoading}
              >
                {authLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : null}
                {authLoading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
