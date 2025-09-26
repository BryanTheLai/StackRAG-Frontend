import { type FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { AlertCircle, CheckCircle, Briefcase, Mail, Lock, User } from "lucide-react";

export default function Signup() {
  const {
    signUp,
    isLoading: authLoading,
    authError,
    clearAuthError,
    session,
  } = useAuth();
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleInCompany, setRoleInCompany] = useState("");
  
  // UI state
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (authError) {
      setFeedback(authError);
      setSuccess(false);
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
    setSuccess(false);

    // Validation
    if (password !== confirmPassword) {
      setFeedback("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setFeedback("Password must be at least 6 characters long");
      return;
    }

    if (!fullName.trim()) {
      setFeedback("Full name is required");
      return;
    }

    // basic client-side email format validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setFeedback('Please enter a valid email address');
      return;
    }

    try {
      const res = await signUp(email, password, {
        full_name: fullName.trim(),
        company_name: companyName.trim() || undefined,
        role_in_company: roleInCompany.trim() || undefined,
      });

      // If Supabase auto-creates a session (email confirmation disabled), go to dashboard
      if (res && (res as any).session) {
        navigate("/private/dashboard", { replace: true });
        return;
      }

      // Otherwise, show success and guide to verify email, then redirect to Login
      setSuccess(true);
      setFeedback("Account created successfully! Please check your email to verify your account.");

      // After a brief moment to show the success message, redirect to Login
      // Include a query param so the Login page can show a friendly banner
      setTimeout(() => {
        navigate("/login?signup=success", { replace: true });
      }, 1200);
    } catch (error) {
      // log raw error in dev console
      // eslint-disable-next-line no-console
      console.error('Signup error (client):', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred during sign up.';
      setFeedback(message);
      setSuccess(false);
    }
  };

  if (authLoading && !session) {
    return (
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col">
          <span className="loading loading-lg loading-spinner text-primary"></span>
          <p className="mt-4 text-lg text-base-content">Creating your account…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col items-center px-4">
        <div className="text-center mb-6">
          <h1 className="text-4xl lg:text-5xl font-bold text-primary">Join Stackifier Today</h1>
          <p className="mt-2 text-lg text-base-content/70">
            Sign up to access powerful financial AI tools.
          </p>
        </div>

        <div className="card bg-base-100 shadow-lg w-full max-w-md">
          <div className="card-body p-8 space-y-6">
            {feedback && (
              <div role="alert" className={`alert ${success ? 'alert-success' : 'alert-error'}`}> 
                {success ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                <span>{feedback}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Grid for Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Full Name</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                    <input
                      type="text" placeholder="Full Name" required
                      className="input input-bordered pl-10"
                      value={fullName} onChange={e => setFullName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Email Address</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                    <input
                      type="email" placeholder="Email Address" required
                      className="input input-bordered pl-10"
                      value={email} onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {/* Grid for Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Password</span></label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                    <input
                      type="password" placeholder="Password" required
                      className="input input-bordered pl-10"
                      minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Confirm Password</span></label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                    <input
                      type="password" placeholder="Confirm Password" required
                      className="input input-bordered pl-10"
                      value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {/* Grid for Company and Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Company (Optional)</span></label>
                  <input
                    type="text" placeholder="Company Name"
                    className="input input-bordered"
                    value={companyName} onChange={e => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Role</span></label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                    <input
                      type="text" placeholder="Your Role"
                      className="input input-bordered pl-10"
                      value={roleInCompany} onChange={e => setRoleInCompany(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {/* Terms Checkbox */}
              <div className="form-control">
                <label className="label cursor-pointer">
                  <input type="checkbox" className="checkbox" required />
                  <span className="label-text ml-2">I agree to the <Link href="#" className="link">Terms and Conditions</Link></span>
                </label>
              </div>
              {/* Submit Button */}
              <div className="form-control">
                <button type="submit" className="btn btn-primary btn-block">
                  {authLoading ? 'Signing Up...' : 'Sign Up'}
                </button>
              </div>
              <div className="text-center text-sm">
                <span>Already have an account? </span><Link href="/login" className="link">Sign In</Link>
              </div>
            </form>
          </div>
        </div>
        <p className="text-center mt-6 text-sm text-base-content/60 w-full max-w-md">
          By creating an account, you agree to our{' '}
          <a href="#" className="link link-primary">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="link link-primary">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
