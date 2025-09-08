import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// sign up with email & password
export async function signUp(email: string, password: string, metadata?: {
  full_name?: string;
  company_name?: string;
  role_in_company?: string;
}) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    // If supabase returned an error object, throw a normalized Error
    if (error) {
      // prefer the message property if present
      const msg = (error && (error.message || JSON.stringify(error))) || 'Sign up failed';
      const err = new Error(msg);
      // attach raw error for debugging (non-enumerable so it won't leak in logs accidentally)
      try { (err as any).raw = error; } catch {};
      throw err;
    }

    return data;
  } catch (e) {
    // rethrow Error so callers can handle it consistently
    if (e instanceof Error) throw e;
    throw new Error(typeof e === 'string' ? e : JSON.stringify(e));
  }
}

// sign in with email & password
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.session;
}

// sign out current user
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
