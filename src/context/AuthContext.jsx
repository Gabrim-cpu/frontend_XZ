import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { loginUser, registerUser, signOutUser, syncSession } from '../services/authService';

const AuthContext = createContext(null);

// Sync with the backend, retrying briefly. Flaky DNS/network on the client
// (e.g. mobile hotspots failing to resolve the API domain) otherwise strands
// an authenticated user with no profile and a broken dashboard.
async function syncSessionWithRetry(idToken, payload, attempts = 3) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await syncSession(idToken, payload);
    } catch (err) {
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw lastError;
}

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [appUser, setAppUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        // Keep `loading` true while we resolve the backend appUser so route
        // guards don't make redirect decisions on a half-loaded state (which
        // would bounce a just-registered user past the profile form).
        setLoading(true);
        try {
          const idToken = await user.getIdToken();
          const session = await syncSessionWithRetry(idToken, { picture: user.photoURL });
          setAppUser(session.user);
          setIsNewUser(session.isNewUser || false);
        } catch {
          setAppUser(null);
          setIsNewUser(false);
        } finally {
          setLoading(false);
        }
      } else {
        setAppUser(null);
        setIsNewUser(false);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email, password, { identity, language } = {}) => {
    const { user } = await loginUser(email, password);
    const idToken = await user.getIdToken();
    const session = await syncSession(idToken, { identity, language });
    setAppUser(session.user);
    setIsNewUser(session.isNewUser || false);
    return session;
  }, []);

  const signUp = useCallback(async ({ email, password, name, role, language, profilePicture, age, learnInterests, shareInterests }) => {
    const user = await registerUser({ email, password, name, role, language, profilePicture });
    const idToken = await user.getIdToken();
    const session = await syncSession(idToken, {
      name, // the token was minted before displayName was set — send explicitly
      identity: role,
      language,
      picture: profilePicture || user.photoURL,
      age,
      learn_interests: learnInterests,
      share_interests: shareInterests,
    });
    setAppUser(session.user);
    setIsNewUser(session.isNewUser || false);
    return session;
  }, []);


  const signOut = useCallback(async () => {
    await signOutUser();
    setAppUser(null);
  }, []);

  // Re-sync the current user's profile from the backend (name, avatar, points, etc.)
  const refreshUser = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return null;
    try {
      const idToken = await user.getIdToken();
      const session = await syncSessionWithRetry(idToken, { picture: user.photoURL });
      setAppUser(session.user);
      return session.user;
    } catch (err) {
      console.error('Failed to refresh user:', err);
      return null;
    }
  }, []);

  const value = {
    firebaseUser,
    appUser,
    isNewUser,
    loading,
    signIn,
    signUp,
    signOut,
    logout: signOut,
    refreshUser,
    isAuthenticated: !!firebaseUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
