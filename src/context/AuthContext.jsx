import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session and subscribe to Supabase Auth state changes
  useEffect(() => {
    let authSubscription = null;

    async function initAuth() {
      try {
        const storedUser = await authService.getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (err) {
        console.warn('Failed to restore session:', err);
      } finally {
        setIsLoading(false);
      }

      // Listen to live Supabase Auth state events when configured
      if (isSupabaseConfigured) {
        try {
          const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const activeProfile = await authService.getCurrentUser();
              if (activeProfile) {
                setUser(activeProfile);
              }
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
            }
          });
          authSubscription = data?.subscription;
        } catch (subErr) {
          console.warn('[AuthContext] Auth subscription error:', subErr.message);
        }
      }
    }

    initAuth();

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const role = user?.role || null;
  const studyMode = user?.study_mode || null;

  const login = async (email, password) => {
    const { user: loggedInUser } = await authService.login(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const signup = async (data) => {
    const { user: registeredUser } = await authService.signup(data);
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const selectRole = async (selectedRole, inviteCode = null) => {
    const { user: updatedUser } = await authService.saveRole(selectedRole, inviteCode);
    setUser(updatedUser);
    return updatedUser;
  };

  const selectStudyMode = async (selectedMode) => {
    const { user: updatedUser } = await authService.updateProfile({ study_mode: selectedMode });
    setUser(updatedUser);
    return updatedUser;
  };

  const updateProfile = async (updates) => {
    const { user: updatedUser } = await authService.updateProfile(updates);
    setUser(updatedUser);
    return updatedUser;
  };

  const value = {
    user,
    role,
    studyMode,
    isLoading,
    isSupabaseConfigured,
    login,
    signup,
    logout,
    selectRole,
    selectStudyMode,
    updateProfile,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
