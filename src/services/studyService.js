/**
 * Study Service (Phase 2 - Step 21f)
 * Connects to Supabase public.study_sessions and public.tasks tables,
 * with full fallback to local cache and mock stores for demo accounts.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { storage } from '../utils/storage';
import { INITIAL_STUDY_SESSIONS } from '../mock/studySessions';
import { INITIAL_TASKS } from '../mock/tasks';

const SESSIONS_STORAGE_KEY = 'study_sessions';
const TASKS_STORAGE_KEY = 'student_tasks';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

function getStoredSessions() {
  const sessions = storage.get(SESSIONS_STORAGE_KEY, null);
  if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
    storage.set(SESSIONS_STORAGE_KEY, INITIAL_STUDY_SESSIONS);
    return INITIAL_STUDY_SESSIONS;
  }
  return sessions;
}

function getStoredTasks() {
  const tasks = storage.get(TASKS_STORAGE_KEY, null);
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    storage.set(TASKS_STORAGE_KEY, INITIAL_TASKS);
    return INITIAL_TASKS;
  }
  return tasks;
}

export const studyService = {
  // ==========================================
  // Study Sessions
  // ==========================================

  /**
   * Get all study sessions for a student, sorted newest first
   */
  async getStudySessions(studentId) {
    if (isSupabaseConfigured && studentId) {
      try {
        const { data, error } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('student_id', studentId)
          .order('started_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('[studyService] Supabase getStudySessions error, using cache:', err.message);
      }
    }

    await delay(150);
    const all = getStoredSessions();
    let studentSessions = all.filter((s) => s.student_id === studentId);

    if (studentSessions.length === 0) {
      studentSessions = all.filter((s) => s.student_id === 'user_student_1');
    }

    return [...studentSessions].sort(
      (a, b) => new Date(b.started_at) - new Date(a.started_at)
    );
  },

  /**
   * Save a completed study session
   */
  async addStudySession({ studentId, subject, durationMinutes, notes = '', startedAt }) {
    const duration = Math.max(1, Math.round(Number(durationMinutes) || 1));
    const timestamp = startedAt || new Date().toISOString();

    const newSession = {
      id: `session_${Date.now()}`,
      student_id: studentId,
      subject: (subject || '').trim(),
      duration_minutes: duration,
      notes: (notes || '').trim(),
      started_at: timestamp,
    };

    if (isSupabaseConfigured && studentId) {
      try {
        const { data, error } = await supabase
          .from('study_sessions')
          .insert({
            student_id: studentId,
            subject: newSession.subject,
            duration_minutes: newSession.duration_minutes,
            notes: newSession.notes,
            started_at: newSession.started_at,
          })
          .select('*')
          .maybeSingle();

        if (data) {
          newSession.id = data.id;
        }
      } catch (err) {
        console.warn('[studyService] Supabase addStudySession error:', err.message);
      }
    }

    const all = getStoredSessions();
    const updated = [newSession, ...all];
    storage.set(SESSIONS_STORAGE_KEY, updated);
    return newSession;
  },

  /**
   * Update an existing study session
   */
  async updateStudySession(sessionId, updates) {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('study_sessions')
          .update(updates)
          .eq('id', sessionId);
      } catch (err) {
        console.warn('[studyService] Supabase updateStudySession warning:', err.message);
      }
    }

    const all = getStoredSessions();
    let updatedSession = null;

    const updated = all.map((session) => {
      if (session.id === sessionId) {
        updatedSession = {
          ...session,
          ...updates,
          duration_minutes: updates.duration_minutes
            ? Math.max(1, Math.round(Number(updates.duration_minutes)))
            : session.duration_minutes,
        };
        return updatedSession;
      }
      return session;
    });

    if (!updatedSession) {
      throw new Error(`Session with id "${sessionId}" not found.`);
    }

    storage.set(SESSIONS_STORAGE_KEY, updated);
    return updatedSession;
  },

  /**
   * Delete a study session
   */
  async deleteStudySession(sessionId) {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('study_sessions').delete().eq('id', sessionId);
      } catch (err) {
        console.warn('[studyService] Supabase deleteStudySession warning:', err.message);
      }
    }

    const all = getStoredSessions();
    const filtered = all.filter((s) => s.id !== sessionId);
    storage.set(SESSIONS_STORAGE_KEY, filtered);
    return { success: true };
  },

  // ==========================================
  // Tasks
  // ==========================================

  /**
   * Get all tasks for a student, sorted by due date
   */
  async getTasks(studentId) {
    if (isSupabaseConfigured && studentId) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('student_id', studentId)
          .order('is_done', { ascending: true })
          .order('due_date', { ascending: true });

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('[studyService] Supabase getTasks error, using cache:', err.message);
      }
    }

    await delay(150);
    const all = getStoredTasks();
    let studentTasks = all.filter((t) => t.student_id === studentId);

    if (studentTasks.length === 0) {
      studentTasks = all.filter((t) => t.student_id === 'user_student_1');
    }

    return [...studentTasks].sort((a, b) => {
      if (a.is_done !== b.is_done) {
        return a.is_done ? 1 : -1;
      }
      return new Date(a.due_date) - new Date(b.due_date);
    });
  },

  /**
   * Add a new task
   */
  async addTask({ studentId, title, subject, dueDate }) {
    const newTask = {
      id: `task_${Date.now()}`,
      student_id: studentId,
      title: (title || '').trim(),
      subject: (subject || '').trim(),
      due_date: dueDate,
      is_done: false,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && studentId) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            student_id: studentId,
            title: newTask.title,
            subject: newTask.subject,
            due_date: newTask.due_date,
            is_done: false,
          })
          .select('*')
          .maybeSingle();

        if (data) {
          newTask.id = data.id;
        }
      } catch (err) {
        console.warn('[studyService] Supabase addTask error:', err.message);
      }
    }

    const all = getStoredTasks();
    const updated = [newTask, ...all];
    storage.set(TASKS_STORAGE_KEY, updated);
    return newTask;
  },

  /**
   * Update an existing task
   */
  async updateTask(taskId, updates) {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('tasks').update(updates).eq('id', taskId);
      } catch (err) {
        console.warn('[studyService] Supabase updateTask warning:', err.message);
      }
    }

    const all = getStoredTasks();
    let updatedTask = null;

    const updated = all.map((t) => {
      if (t.id === taskId) {
        updatedTask = { ...t, ...updates };
        return updatedTask;
      }
      return t;
    });

    if (!updatedTask) {
      throw new Error(`Task with id "${taskId}" not found.`);
    }

    storage.set(TASKS_STORAGE_KEY, updated);
    return updatedTask;
  },

  /**
   * Toggle task completion
   */
  async toggleTaskDone(taskId) {
    const all = getStoredTasks();
    const target = all.find((t) => t.id === taskId);
    const nextDone = target ? !target.is_done : true;

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('tasks')
          .update({ is_done: nextDone })
          .eq('id', taskId);
      } catch (err) {
        console.warn('[studyService] Supabase toggleTaskDone warning:', err.message);
      }
    }

    let updatedTask = null;
    const updated = all.map((t) => {
      if (t.id === taskId) {
        updatedTask = { ...t, is_done: !t.is_done };
        return updatedTask;
      }
      return t;
    });

    if (!updatedTask) {
      throw new Error(`Task with id "${taskId}" not found.`);
    }

    storage.set(TASKS_STORAGE_KEY, updated);
    return updatedTask;
  },

  /**
   * Delete a task
   */
  async deleteTask(taskId) {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('tasks').delete().eq('id', taskId);
      } catch (err) {
        console.warn('[studyService] Supabase deleteTask warning:', err.message);
      }
    }

    const all = getStoredTasks();
    const filtered = all.filter((t) => t.id !== taskId);
    storage.set(TASKS_STORAGE_KEY, filtered);
    return { success: true };
  },

  /**
   * Available subjects list based on study mode and student records
   */
  getAvailableSubjects(studyMode = 'class') {
    if (studyMode === 'solo') {
      return [
        'Web Development',
        'Python',
        'Algorithms',
        'System Design',
        'Database Systems',
        'General Self-Study',
      ];
    }
    return [
      'Operating Systems',
      'Data Structures',
      'Computer Networks',
      'Database Management',
      'Machine Learning',
      'Mathematics',
      'General Campus',
    ];
  },
};

export default studyService;
