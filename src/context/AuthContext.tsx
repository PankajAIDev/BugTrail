import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, ProfileRecord } from '../lib/supabase';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileRecord | null;
  isLoading: boolean;
  isConfigured: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signUp: (email: string, pass: string, fullName: string) => Promise<{ error: Error | null; needConfirmation?: boolean; user?: User | null }>;
  signIn: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: Error | null }>;
  loginAsGuest: (email?: string, fullName?: string, userId?: string) => void;
  activateInstantSession: (email: string, fullName?: string, userId?: string) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_STORAGE_KEY = 'bugtrail_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  const clearAuthError = () => {
    setAuthError(null);
  };

  // Load user profile from Supabase PostgreSQL profiles table
  const loadProfile = async (userId: string) => {
    if (!configured || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as ProfileRecord);
      } else {
        // Fallback profile if trigger is still executing
        const defaultProfile: ProfileRecord = {
          id: userId,
          display_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Developer',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(defaultProfile);
      }
    } catch (err) {
      console.warn('Error loading Supabase profile:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (!configured || !supabase) {
      // Restore Local Demo user if saved in localStorage
      try {
        const savedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
        if (savedDemo) {
          const parsed = JSON.parse(savedDemo);
          if (isMounted) {
            setUser(parsed.user);
            setProfile(parsed.profile);
          }
        }
      } catch (e) {
        console.warn('Failed to parse saved demo user:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
      return;
    }

    // Real Supabase Session initialization
    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session: initSession }, error }) => {
      if (!isMounted) return;
      if (error) {
        console.error('Failed getting Supabase session:', error);
        setAuthError(error.message);
      } else {
        setSession(initSession);
        setUser(initSession?.user ?? null);
        if (initSession?.user) {
          loadProfile(initSession.user.id);
        }
      }
      setIsLoading(false);
    }).catch((err) => {
      if (!isMounted) return;
      console.error('Exception restoring Supabase session:', err);
      setAuthError(err.message || 'Failed to restore auth session');
      setIsLoading(false);
    });

    // Real Supabase Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setAuthError(null);
        } else if (currentSession?.user) {
          await loadProfile(currentSession.user.id);
          setAuthError(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [configured]);

  const signUp = async (email: string, pass: string, fullName: string) => {
    setAuthError(null);

    if (!configured || !supabase) {
      // Local Demo Mode fallback when Supabase keys are not yet configured in .env
      const demoUser: User = {
        id: 'demo-local-user-id',
        app_metadata: { provider: 'email' },
        user_metadata: { full_name: fullName || 'Demo Student' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: email || 'student@bugtrail.ai',
        phone: '',
        role: 'authenticated',
        updated_at: new Date().toISOString()
      };
      const demoProfile: ProfileRecord = {
        id: 'demo-local-user-id',
        display_name: fullName || 'Demo Student',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setUser(demoUser);
      setProfile(demoProfile);

      try {
        localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify({ user: demoUser, profile: demoProfile }));
      } catch (e) {
        console.warn('Failed to persist demo user session:', e);
      }

      return { error: null, needConfirmation: false };
    }

    const redirectUrl = `${window.location.origin}/signin`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
      setAuthError(error.message);
      return { error };
    }

    // Email confirmation pending flag
    const needConfirmation = Boolean(data.user && !data.session);
    return { error: null, needConfirmation, user: data.user };
  };

  const signIn = async (email: string, pass: string) => {
    setAuthError(null);

    if (!configured || !supabase) {
      // Local Demo Mode fallback
      const demoUser: User = {
        id: 'demo-local-user-id',
        app_metadata: { provider: 'email' },
        user_metadata: { full_name: 'Demo Student' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: email || 'student@bugtrail.ai',
        phone: '',
        role: 'authenticated',
        updated_at: new Date().toISOString()
      };
      const demoProfile: ProfileRecord = {
        id: 'demo-local-user-id',
        display_name: 'Demo Student',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setUser(demoUser);
      setProfile(demoProfile);

      try {
        localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify({ user: demoUser, profile: demoProfile }));
      } catch (e) {
        console.warn('Failed to persist demo user session:', e);
      }

      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass
    });

    if (error) {
      setAuthError(error.message);
      return { error };
    }

    return { error: null };
  };

  const signOut = async () => {
    setAuthError(null);
    if (configured && supabase) {
      await supabase.auth.signOut();
    } else {
      try {
        localStorage.removeItem(DEMO_USER_STORAGE_KEY);
      } catch (e) {
        console.warn('Failed to clear demo user session:', e);
      }
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    if (!configured || !supabase) {
      const err = new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
      setAuthError(err.message);
      return { error: err };
    }

    const redirectUrl = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });

    if (error) {
      setAuthError(error.message);
      return { error };
    }

    return { error: null };
  };

  const updatePassword = async (newPassword: string) => {
    setAuthError(null);
    if (!configured || !supabase) {
      const err = new Error('Supabase is not configured.');
      setAuthError(err.message);
      return { error: err };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setAuthError(error.message);
      return { error };
    }

    return { error: null };
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    if (!configured || !supabase) {
      const demoUser: User = {
        id: 'demo-google-user-id',
        app_metadata: { provider: 'google' },
        user_metadata: { full_name: 'Demo Student' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: 'student@bugtrail.ai',
        phone: '',
        role: 'authenticated',
        updated_at: new Date().toISOString()
      };
      const demoProfile: ProfileRecord = {
        id: 'demo-google-user-id',
        display_name: 'Demo Student',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setUser(demoUser);
      setProfile(demoProfile);
      try {
        localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify({ user: demoUser, profile: demoProfile }));
      } catch (e) {}
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) {
      setAuthError(error.message);
      return { error };
    }

    return { error: null };
  };

  const resendConfirmationEmail = async (targetEmail: string) => {
    setAuthError(null);
    if (!configured || !supabase) {
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: targetEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/signin`
        }
      });
      if (error) {
        setAuthError(error.message);
        return { error };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const loginAsGuest = (guestEmail?: string, fullName?: string, userId?: string) => {
    const emailToUse = guestEmail || 'student@bugtrail.ai';
    const nameToUse = fullName || emailToUse.split('@')[0] || 'Developer';
    const idToUse = userId || (guestEmail ? `user-${emailToUse.replace(/[^a-zA-Z0-9]/g, '_')}` : 'demo-local-user-id');
    const guestUser: User = {
      id: idToUse,
      app_metadata: { provider: 'guest' },
      user_metadata: { full_name: nameToUse },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: emailToUse,
      phone: '',
      role: 'authenticated',
      updated_at: new Date().toISOString()
    };
    const guestProfile: ProfileRecord = {
      id: idToUse,
      display_name: nameToUse,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setUser(guestUser);
    setProfile(guestProfile);
    setAuthError(null);
    try {
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify({ user: guestUser, profile: guestProfile }));
    } catch (e) {
      console.warn('Failed to persist user session:', e);
    }
  };

  const activateInstantSession = (instantEmail: string, fullName?: string, userId?: string) => {
    loginAsGuest(instantEmail, fullName, userId);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isConfigured: configured,
        authError,
        clearAuthError,
        signInWithGoogle,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        resendConfirmationEmail,
        loginAsGuest,
        activateInstantSession,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
