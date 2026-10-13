/**
 * Authentication Service (Phase 2 - Step 21d)
 * Integrates Supabase Auth with public.profiles row synchronization,
 * role verification guards, and seamless local fallback for demo environments.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { storage } from '../utils/storage';
import { INITIAL_USERS } from '../mock/users';

const USERS_STORAGE_KEY = 'registered_users';
const CURRENT_USER_KEY = 'current_user';

// Pre-authorized verification invite codes for mentor and admin roles
const VALID_ROLE_INVITE_CODES = {
  mentor: ['CAMPUS_FACULTY_2026', 'MENTOR2026', 'FACULTY_CS', 'VERMA_FACULTY'],
  admin: ['CAMPUS_ADMIN_2026', 'ADMIN2026', 'DEPT_CHAIR', 'DIRECTOR_ADMIN'],
};

// Artificial delay helper for realistic UI transition pacing
const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Initialize mock users in storage if not already seeded, and guarantee
 * that all default demo accounts remain present in the pool.
 */
function getStoredUsers() {
  const users = storage.get(USERS_STORAGE_KEY, null);
  if (!users || !Array.isArray(users) || users.length === 0) {
    storage.set(USERS_STORAGE_KEY, INITIAL_USERS);
    return INITIAL_USERS;
  }

  // Ensure all INITIAL_USERS are present in the stored list
  const existingEmails = new Set(users.map((u) => (u.email || '').toLowerCase()));
  let hasMissing = false;
  const mergedUsers = [...users];

  for (const initUser of INITIAL_USERS) {
    if (!existingEmails.has(initUser.email.toLowerCase())) {
      mergedUsers.push(initUser);
      hasMissing = true;
    }
  }

  if (hasMissing) {
    storage.set(USERS_STORAGE_KEY, mergedUsers);
  }

  return mergedUsers;
}

/**
 * Strips password and sensitive fields before returning/saving session
 */
function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

/**
 * Normalizes a user and profile record from Supabase or storage into standard app shape
 */
function formatUserProfile(authUser, profile = {}) {
  if (!authUser && !profile) return null;

  return {
    id: profile?.id || authUser?.id,
    full_name: profile?.full_name || authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'Campus Member',
    email: profile?.email || authUser?.email,
    role: profile?.role || authUser?.user_metadata?.role || null,
    study_mode: profile?.study_mode || authUser?.user_metadata?.study_mode || null,
    department_id: profile?.department_id || null,
    daily_goal_minutes: profile?.daily_goal_minutes || 120,
    avatar_url: profile?.avatar_url || null,
    is_verified: profile?.is_verified ?? true,
    created_at: profile?.created_at || authUser?.created_at || new Date().toISOString(),
  };
}

export const authService = {
  /**
   * Log in user with email and password via Supabase Auth (or mock fallback)
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ user: Object }>}
   */
  async login(email, password) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const rawPassword = typeof password === 'string' ? password : '';
    const trimmedPassword = rawPassword.trim();

    if (!normalizedEmail || !rawPassword) {
      throw new Error('Email and password are required.');
    }

    // 1. Fast-Path for Built-in Demo Accounts
    // Ensures demo accounts (student@campus.edu, solo@campus.edu, mentor@campus.edu, admin@campus.edu)
    // ALWAYS succeed instantly and reliably with zero latency or external auth errors.
    const demoUser = INITIAL_USERS.find(
      (u) =>
        u.email.toLowerCase() === normalizedEmail &&
        (u.password === rawPassword ||
          u.password === trimmedPassword ||
          (u.password === 'Password123' && (rawPassword.toLowerCase() === 'password123' || trimmedPassword.toLowerCase() === 'password123')))
    );

    if (demoUser) {
      await delay(100);
      const safeUser = sanitizeUser(demoUser);
      storage.set(CURRENT_USER_KEY, safeUser);
      return { user: safeUser };
    }

    // 2. Live Supabase Authentication (for real accounts in live database)
    if (isSupabaseConfigured) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: rawPassword,
        });

        if (!authError && authData?.user) {
          // Fetch corresponding row from public.profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

          const formattedUser = formatUserProfile(authData.user, profile);
          storage.set(CURRENT_USER_KEY, formattedUser);
          return { user: formattedUser };
        }

        if (authError) {
          console.warn('[authService] Supabase login attempt failed:', authError.message);
        }
      } catch (err) {
        console.warn('[authService] Supabase login error, checking fallback store:', err.message);
      }
    }

    // 3. Demo Store Fallback (Guarantees local registered users and seeded accounts work)
    await delay(150);
    const users = getStoredUsers();
    const matchedUser = users.find(
      (u) =>
        u.email.toLowerCase() === normalizedEmail &&
        (u.password === rawPassword ||
          u.password === trimmedPassword ||
          (u.password === 'Password123' && (rawPassword.toLowerCase() === 'password123' || trimmedPassword.toLowerCase() === 'password123')))
    );

    if (!matchedUser) {
      throw new Error('Invalid email or password. Please verify your credentials and try again.');
    }

    const safeUser = sanitizeUser(matchedUser);
    storage.set(CURRENT_USER_KEY, safeUser);
    return { user: safeUser };
  },

  /**
   * Register a new user account with Supabase Auth and initialize public.profiles row
   * @param {{ fullName: string, email: string, password: string, inviteCode?: string }} data
   * @returns {Promise<{ user: Object }>}
   */
  async signup({ fullName, email, password, inviteCode }) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const trimmedName = (fullName || '').trim();

    // 1. Live Supabase Registration
    if (isSupabaseConfigured) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: trimmedName,
            },
          },
        });

        if (authError) {
          throw new Error(authError.message || 'Failed to create user account.');
        }

        if (authData?.user) {
          // Explicitly upsert initial public.profiles row
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              full_name: trimmedName,
              email: normalizedEmail,
              role: null,
              study_mode: null,
            })
            .select('*')
            .maybeSingle();

          if (profileError) {
            console.warn('[authService] Profile upsert warning:', profileError.message);
          }

          const formattedUser = formatUserProfile(authData.user, profile || { full_name: trimmedName, email: normalizedEmail });
          storage.set(CURRENT_USER_KEY, formattedUser);
          return { user: formattedUser };
        }
      } catch (err) {
        if (err.message && !err.message.includes('Fetch') && !err.message.includes('NetworkError')) {
          throw err;
        }
        console.warn('[authService] Supabase signup error, falling back to local store:', err.message);
      }
    }

    // 2. Demo Store Fallback
    await delay(250);
    const users = getStoredUsers();
    const exists = users.some((u) => u.email.toLowerCase() === normalizedEmail);
    if (exists) {
      throw new Error('An account with this email address already exists. Please log in instead.');
    }

    const newUser = {
      id: `user_${Date.now()}`,
      full_name: trimmedName,
      email: normalizedEmail,
      password: password,
      role: null,
      study_mode: null,
      department_id: null,
      created_at: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    storage.set(USERS_STORAGE_KEY, updatedUsers);

    const safeUser = sanitizeUser(newUser);
    storage.set(CURRENT_USER_KEY, safeUser);
    return { user: safeUser };
  },

  /**
   * Log out active user session
   */
  async logout() {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[authService] Supabase signOut error:', err.message);
      }
    }

    storage.remove(CURRENT_USER_KEY);
    return { success: true };
  },

  /**
   * Retrieve active user session and synchronize profile
   * @returns {Promise<Object | null>}
   */
  async getCurrentUser() {
    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          const formattedUser = formatUserProfile(session.user, profile);
          if (formattedUser) {
            storage.set(CURRENT_USER_KEY, formattedUser);
            return formattedUser;
          }
        }
      } catch (err) {
        console.warn('[authService] Supabase getSession error:', err.message);
      }
    }

    return storage.get(CURRENT_USER_KEY, null);
  },

  /**
   * Retrieve profile by user UUID from Supabase
   * @param {string} userId
   * @returns {Promise<Object | null>}
   */
  async getProfile(userId) {
    if (!userId) return null;

    if (isSupabaseConfigured) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profile) return profile;
      } catch (err) {
        console.warn('[authService] getProfile error:', err.message);
      }
    }

    const users = getStoredUsers();
    return users.find((u) => u.id === userId) || null;
  },

  /**
   * Update active user profile in Supabase profiles table and local session
   * @param {Partial<Object>} updates
   * @returns {Promise<{ user: Object }>}
   */
  async updateProfile(updates) {
    const currentUser = storage.get(CURRENT_USER_KEY, null);
    if (!currentUser) throw new Error('No active session.');

    const updatedUser = { ...currentUser, ...updates };

    // 1. Update in Supabase if configured
    if (isSupabaseConfigured && currentUser.id) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', currentUser.id);

        if (error) {
          console.warn('[authService] Supabase profiles update warning:', error.message);
        }

        // If updating full_name, synchronize Supabase auth metadata as well
        if (updates.full_name) {
          await supabase.auth.updateUser({
            data: { full_name: updates.full_name },
          });
        }
      } catch (err) {
        console.warn('[authService] updateProfile remote error:', err.message);
      }
    }

    // 2. Synchronize local cache & storage
    storage.set(CURRENT_USER_KEY, updatedUser);

    const users = getStoredUsers();
    const updatedUsers = users.map((u) => (u.id === currentUser.id ? { ...u, ...updates } : u));
    storage.set(USERS_STORAGE_KEY, updatedUsers);

    return { user: updatedUser };
  },

  /**
   * Verification check for elevated roles (Mentor / Admin)
   * @param {'mentor' | 'admin'} role
   * @param {string} [code]
   * @returns {boolean}
   */
  verifyRoleInviteCode(role, code) {
    if (!code) return false;
    const allowed = VALID_ROLE_INVITE_CODES[role] || [];
    return allowed.includes(code.trim().toUpperCase());
  },

  /**
   * Save selected portal role for active user with verification handling
   * @param {'student' | 'mentor' | 'admin'} role
   * @param {string} [inviteCode] Optional verification invite code
   * @returns {Promise<{ user: Object }>}
   */
  async saveRole(role, inviteCode = null) {
    // If an invite code was supplied for mentor or admin, verify it
    if ((role === 'mentor' || role === 'admin') && inviteCode) {
      const isValid = this.verifyRoleInviteCode(role, inviteCode);
      if (!isValid) {
        throw new Error(`Invalid ${role} verification code. Please check with your department coordinator.`);
      }
    }

    return this.updateProfile({
      role,
      is_verified: true,
    });
  },
};

export default authService;
