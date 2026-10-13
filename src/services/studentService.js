/**
 * Student Service (Phase 2 - Step 21f)
 * Connects to Supabase public.classes, public.class_members, and auth/profiles,
 * with full fallback to local cache and mock stores for demo accounts.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { storage } from '../utils/storage';
import { INITIAL_CLASSES, INITIAL_CLASS_MEMBERS } from '../mock/classes';
import { authService } from './authService';

const CLASSES_STORAGE_KEY = 'campus_classes';
const MEMBERS_STORAGE_KEY = 'class_members';
const USERS_STORAGE_KEY = 'registered_users';
const SESSIONS_STORAGE_KEY = 'study_sessions';
const TASKS_STORAGE_KEY = 'student_tasks';
const HABITS_STORAGE_KEY = 'student_habits';
const GOALS_STORAGE_KEY = 'student_goals';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

function getStoredClasses() {
  const classes = storage.get(CLASSES_STORAGE_KEY, null);
  if (!classes || !Array.isArray(classes) || classes.length === 0) {
    storage.set(CLASSES_STORAGE_KEY, INITIAL_CLASSES);
    return INITIAL_CLASSES;
  }
  return classes;
}

function getStoredMembers() {
  const members = storage.get(MEMBERS_STORAGE_KEY, null);
  if (!members || !Array.isArray(members)) {
    storage.set(MEMBERS_STORAGE_KEY, INITIAL_CLASS_MEMBERS);
    return INITIAL_CLASS_MEMBERS;
  }
  return members;
}

export const studentService = {
  /**
   * Search for a class using a 6-character uppercase join code
   * @param {string} code
   * @returns {Promise<Object>}
   */
  async findClassByCode(code) {
    const cleanCode = (code || '').trim().toUpperCase();

    if (isSupabaseConfigured && cleanCode) {
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('join_code', cleanCode)
          .maybeSingle();

        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.warn('[studentService] Supabase findClassByCode error, using cache:', err.message);
      }
    }

    await delay(180);
    const classes = getStoredClasses();
    const matched = classes.find((c) => (c.join_code || '').toUpperCase() === cleanCode);

    if (!matched) {
      throw new Error(
        `No class found with join code "${cleanCode}". Please verify the 6-character code with your mentor.`
      );
    }

    return matched;
  },

  /**
   * Join a class by classId, add membership record, and set study_mode to class
   * @param {string} classId
   * @param {string} studentId
   * @returns {Promise<{ user: Object, classMember: Object }>}
   */
  async joinClass(classId, studentId) {
    let memberRecord = null;

    if (isSupabaseConfigured && classId && studentId) {
      try {
        // Upsert into class_members
        const { data, error } = await supabase
          .from('class_members')
          .upsert(
            { class_id: classId, student_id: studentId },
            { onConflict: 'class_id,student_id' }
          )
          .select('*')
          .single();

        if (!error && data) {
          memberRecord = data;
        }
      } catch (err) {
        console.warn('[studentService] Supabase joinClass error, using cache:', err.message);
      }
    }

    await delay(180);
    const members = getStoredMembers();

    const alreadyMember = members.find(
      (m) => m.class_id === classId && m.student_id === studentId
    );

    if (!memberRecord) {
      if (alreadyMember) {
        memberRecord = alreadyMember;
      } else {
        memberRecord = {
          id: `member_${Date.now()}`,
          class_id: classId,
          student_id: studentId,
          joined_at: new Date().toISOString(),
        };
        storage.set(MEMBERS_STORAGE_KEY, [...members, memberRecord]);
      }
    }

    // Update student's study mode to 'class'
    const { user: updatedUser } = await authService.updateProfile({
      study_mode: 'class',
    });

    return { user: updatedUser, classMember: memberRecord };
  },

  /**
   * Switch or select solo study mode
   * @param {string} studentId
   * @returns {Promise<{ user: Object }>}
   */
  async selectSoloMode(studentId) {
    await delay(150);
    const { user: updatedUser } = await authService.updateProfile({
      study_mode: 'solo',
    });
    return { user: updatedUser };
  },

  /**
   * Leave class and switch to solo mode (Step 12)
   * Preserves personal study data, sessions, tasks, and habits.
   *
   * @param {string} studentId
   * @returns {Promise<{ user: Object }>}
   */
  async leaveClassAndSwitchToSolo(studentId) {
    if (isSupabaseConfigured && studentId) {
      try {
        await supabase
          .from('class_members')
          .delete()
          .eq('student_id', studentId);
      } catch (err) {
        console.warn('[studentService] Supabase leaveClass error, using cache:', err.message);
      }
    }

    await delay(180);
    const members = getStoredMembers();
    const updatedMembers = members.filter((m) => m.student_id !== studentId);
    storage.set(MEMBERS_STORAGE_KEY, updatedMembers);

    const { user: updatedUser } = await authService.updateProfile({
      study_mode: 'solo',
    });

    return { user: updatedUser };
  },

  /**
   * Update student profile information (Full name, daily goal minutes)
   *
   * @param {Object} params
   * @param {string} params.studentId
   * @param {string} params.fullName
   * @param {number} [params.dailyGoalMinutes=60]
   * @returns {Promise<{ user: Object }>}
   */
  async updateStudentProfile({ studentId, fullName, dailyGoalMinutes = 60 }) {
    if (!fullName || fullName.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters long.');
    }

    const goalNum = Number(dailyGoalMinutes);
    if (isNaN(goalNum) || goalNum < 15 || goalNum > 360) {
      throw new Error('Daily study goal must be between 15 and 360 minutes.');
    }

    const { user: updatedUser } = await authService.updateProfile({
      full_name: fullName.trim(),
      daily_goal_minutes: goalNum,
    });

    return { user: updatedUser };
  },

  /**
   * Change student password
   *
   * @param {string} studentId
   * @param {Object} params
   * @param {string} params.currentPassword
   * @param {string} params.newPassword
   * @returns {Promise<{ success: boolean }>}
   */
  async changePassword(studentId, { currentPassword, newPassword }) {
    if (!currentPassword) {
      throw new Error('Current password is required.');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (!error) {
          return { success: true };
        }
      } catch (err) {
        console.warn('[studentService] Supabase changePassword error, fallback to cache:', err.message);
      }
    }

    await delay(180);
    const users = storage.get(USERS_STORAGE_KEY, []);
    const userIndex = users.findIndex((u) => u.id === studentId);

    if (userIndex >= 0) {
      const user = users[userIndex];
      if (user.password && user.password !== currentPassword) {
        throw new Error('Current password does not match.');
      }
      users[userIndex] = { ...user, password: newPassword };
      storage.set(USERS_STORAGE_KEY, users);
    }

    return { success: true };
  },

  /**
   * Delete student account and associated data (Step 12)
   *
   * @param {string} studentId
   * @returns {Promise<{ success: boolean }>}
   */
  async deleteStudentAccount(studentId) {
    if (isSupabaseConfigured && studentId) {
      try {
        // Deleting the profile row cascades foreign keys in public schema
        await supabase.from('profiles').delete().eq('id', studentId);
      } catch (err) {
        console.warn('[studentService] Supabase deleteStudentAccount error:', err.message);
      }
    }

    await delay(250);

    const users = storage.get(USERS_STORAGE_KEY, []);
    storage.set(
      USERS_STORAGE_KEY,
      users.filter((u) => u.id !== studentId)
    );

    const members = getStoredMembers();
    storage.set(
      MEMBERS_STORAGE_KEY,
      members.filter((m) => m.student_id !== studentId)
    );

    const tasks = storage.get(TASKS_STORAGE_KEY, []);
    storage.set(
      TASKS_STORAGE_KEY,
      tasks.filter((t) => t.student_id !== studentId)
    );

    const sessions = storage.get(SESSIONS_STORAGE_KEY, []);
    storage.set(
      SESSIONS_STORAGE_KEY,
      sessions.filter((s) => s.student_id !== studentId)
    );

    const habits = storage.get(HABITS_STORAGE_KEY, []);
    storage.set(
      HABITS_STORAGE_KEY,
      habits.filter((h) => h.student_id !== studentId)
    );

    const goals = storage.get(GOALS_STORAGE_KEY, []);
    storage.set(
      GOALS_STORAGE_KEY,
      goals.filter((g) => g.student_id !== studentId)
    );

    await authService.logout();

    return { success: true };
  },

  /**
   * Get all classes a student is enrolled in
   * @param {string} studentId
   * @returns {Promise<Array<Object>>}
   */
  async getEnrolledClasses(studentId) {
    if (isSupabaseConfigured && studentId) {
      try {
        const { data: memberRows, error: mErr } = await supabase
          .from('class_members')
          .select('class_id')
          .eq('student_id', studentId);

        if (!mErr && memberRows && memberRows.length > 0) {
          const classIds = memberRows.map((m) => m.class_id);
          const { data: classRows, error: cErr } = await supabase
            .from('classes')
            .select('*')
            .in('id', classIds);

          if (!cErr && classRows) {
            return classRows;
          }
        }
      } catch (err) {
        console.warn('[studentService] Supabase getEnrolledClasses error, using cache:', err.message);
      }
    }

    await delay(150);
    const members = getStoredMembers();
    const classes = getStoredClasses();

    const enrolledIds = members
      .filter((m) => m.student_id === studentId)
      .map((m) => m.class_id);

    return classes.filter((c) => enrolledIds.includes(c.id));
  },
};

export default studentService;
