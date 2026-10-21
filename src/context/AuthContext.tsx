import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { ProfileRecord } from '../lib/supabase';

export interface AuthContextType {
  user: any | null;
  firebaseUser: FirebaseUser | null;
  session: any | null;
  profile: ProfileRecord | null;
  isLoading: boolean;
  isConfigured: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signUp: (email: string, pass: string, fullName: string) => Promise<{ error: Error | null; needConfirmation?: boolean }>;
  signIn: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_STORAGE_KEY = 'bugtrail_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = () => {
    setAuthError(null);
  };

  // Ensure or sync user profile in Firestore
  const syncFirestoreProfile = async (fbUser: FirebaseUser, displayNameOverride?: string) => {
    const userDocRef = doc(db, 'users', fbUser.uid);
    const path = `users/${fbUser.uid}`;

    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          id: fbUser.uid,
          display_name: data.displayName || fbUser.displayName || 'Developer',
          avatar_url: data.photoURL || fbUser.photoURL || null,
          created_at: data.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        const newProfileData = {
          id: fbUser.uid,
          displayName: displayNameOverride || fbUser.displayName || fbUser.email?.split('@')[0] || 'Developer',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || '',
          totalXp: 0,
          streakDays: 1,
          completedChallenges: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await setDoc(userDocRef, newProfileData);
        setProfile({
          id: fbUser.uid,
          display_name: newProfileData.displayName,
          avatar_url: newProfileData.photoURL || null,
          created_at: newProfileData.createdAt,
          updated_at: newProfileData.updatedAt
        });
      }
    } catch (err) {
      console.warn('Firestore profile sync error:', err);
      // Fallback local profile if Firestore write is blocked
      setProfile({
        id: fbUser.uid,
        display_name: displayNameOverride || fbUser.displayName || fbUser.email?.split('@')[0] || 'Developer',
        avatar_url: fbUser.photoURL || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);
      if (currentUser) {
        setUser({
          id: currentUser.uid,
          email: currentUser.email,
          user_metadata: {
            full_name: currentUser.displayName || currentUser.email?.split('@')[0]
          }
        });
        await syncFirestoreProfile(currentUser);
        setAuthError(null);
      } else {
        // Fallback check for demo user in localStorage
        try {
          const savedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
          if (savedDemo) {
            const parsed = JSON.parse(savedDemo);
            setUser(parsed.user);
            setProfile(parsed.profile);
          } else {
            setUser(null);
            setProfile(null);
          }
        } catch (e) {
          setUser(null);
          setProfile(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncFirestoreProfile(result.user);
      }
      return { error: null };
    } catch (err: any) {
      const errorMsg = err.message || 'Google sign-in failed.';
      setAuthError(errorMsg);
      return { error: new Error(errorMsg) };
    }
  };

  const signUp = async (email: string, pass: string, fullName: string) => {
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        await syncFirestoreProfile(userCredential.user, fullName);
      }
      return { error: null, needConfirmation: false };
    } catch (err: any) {
      // Demo mode fallback if network or config fails
      if (err.code === 'auth/network-request-failed' || err.code === 'auth/invalid-api-key') {
        const demoUser = {
          id: 'demo-local-user-id',
          email: email || 'student@bugtrail.ai',
          user_metadata: { full_name: fullName || 'Demo Student' }
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
        } catch (e) {}
        return { error: null, needConfirmation: false };
      }

      setAuthError(err.message);
      return { error: err };
    }
  };

  const signIn = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        await syncFirestoreProfile(userCredential.user);
      }
      return { error: null };
    } catch (err: any) {
      // Demo mode fallback
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/network-request-failed') {
        const demoUser = {
          id: 'demo-local-user-id',
          email: email || 'student@bugtrail.ai',
          user_metadata: { full_name: 'Demo Student' }
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
        } catch (e) {}
        return { error: null };
      }

      setAuthError(err.message);
      return { error: err };
    }
  };

  const signOut = async () => {
    setAuthError(null);
    try {
      await firebaseSignOut(auth);
    } catch (e) {}
    try {
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    } catch (e) {}
    setUser(null);
    setFirebaseUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (err: any) {
      setAuthError(err.message);
      return { error: err };
    }
  };

  const updatePassword = async (newPassword: string) => {
    setAuthError(null);
    if (!auth.currentUser) {
      const err = new Error('No user currently signed in.');
      setAuthError(err.message);
      return { error: err };
    }

    try {
      await firebaseUpdatePassword(auth.currentUser, newPassword);
      return { error: null };
    } catch (err: any) {
      setAuthError(err.message);
      return { error: err };
    }
  };

  const refreshProfile = async () => {
    if (auth.currentUser) {
      await syncFirestoreProfile(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        session: firebaseUser,
        profile,
        isLoading,
        isConfigured: true,
        authError,
        clearAuthError,
        signInWithGoogle,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
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
