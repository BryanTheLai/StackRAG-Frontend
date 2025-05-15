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
      await supabaseSignIn(email, pass);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'An unknown error occurred during sign in.');
      setIsLoading(false); 
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await supabaseSignOut();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'An unknown error occurred during sign out.');
      setIsLoading(false); 
    }
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