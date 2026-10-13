/**
 * Habit and Goal Service (Phase 2 - Step 21f)
 * Connects to Supabase public.habits, public.habit_logs, and public.goals tables,
 * with full fallback to local cache and mock stores for demo accounts.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { storage } from '../utils/storage';
import {
  INITIAL_HABITS,
  INITIAL_HABIT_LOGS,
  INITIAL_GOALS,
} from '../mock/habits';

const HABITS_STORAGE_KEY = 'student_habits';
const HABIT_LOGS_STORAGE_KEY = 'habit_logs';
const GOALS_STORAGE_KEY = 'student_goals';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

function getStoredHabits() {
  const habits = storage.get(HABITS_STORAGE_KEY, null);
  if (!habits || !Array.isArray(habits) || habits.length === 0) {
    storage.set(HABITS_STORAGE_KEY, INITIAL_HABITS);
    return INITIAL_HABITS;
  }
  return habits;
}

function getStoredLogs() {
  const logs = storage.get(HABIT_LOGS_STORAGE_KEY, null);
  if (!logs || !Array.isArray(logs) || logs.length === 0) {
    storage.set(HABIT_LOGS_STORAGE_KEY, INITIAL_HABIT_LOGS);
    return INITIAL_HABIT_LOGS;
  }
  return logs;
}

function getStoredGoals() {
  const goals = storage.get(GOALS_STORAGE_KEY, null);
  if (!goals || !Array.isArray(goals) || goals.length === 0) {
    storage.set(GOALS_STORAGE_KEY, INITIAL_GOALS);
    return INITIAL_GOALS;
  }
  return goals;
}

/**
 * Generate Monday to Sunday dates for the current calendar week
 */
export function getCurrentWeekDays(refDate = new Date()) {
  const curr = new Date(refDate);
  const dayOfWeek = curr.getDay(); // 0 is Sunday, 1 is Monday
  const distToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(curr);
  monday.setDate(curr.getDate() + distToMonday);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayKey = new Date().toISOString().split('T')[0];
  const weekDays = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    weekDays.push({
      dayName: dayNames[i],
      dateKey,
      dayNumber: d.getDate(),
      isToday: dateKey === todayKey,
    });
  }

  return weekDays;
}

export const habitService = {
  // ==========================================
  // Habits & Weekly Grid
  // ==========================================

  /**
   * Get habits and current week grid data for a student
   * @param {string} studentId
   * @returns {Promise<Object>}
   */
  async getWeeklyHabitsData(studentId) {
    const weekDays = getCurrentWeekDays();

    if (isSupabaseConfigured && studentId) {
      try {
        const { data: dbHabits, error: habitErr } = await supabase
          .from('habits')
          .select('*')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false });

        if (!habitErr && dbHabits && dbHabits.length > 0) {
          const habitIds = dbHabits.map((h) => h.id);
          const { data: dbLogs } = await supabase
            .from('habit_logs')
            .select('*')
            .in('habit_id', habitIds);

          const logMap = {};
          (dbLogs || []).forEach((log) => {
            logMap[`${log.habit_id}_${log.log_date}`] = Boolean(log.is_done);
          });

          const habitsWithGrid = dbHabits.map((habit) => {
            let daysCompletedThisWeek = 0;
            const days = weekDays.map((day) => {
              const isDone = Boolean(logMap[`${habit.id}_${day.dateKey}`]);
              if (isDone) daysCompletedThisWeek += 1;
              return {
                ...day,
                isDone,
              };
            });

            const weeklyPercent = Math.round((daysCompletedThisWeek / 7) * 100);

            return {
              ...habit,
              days,
              daysCompletedThisWeek,
              weeklyPercent,
            };
          });

          return {
            habits: habitsWithGrid,
            weekDays,
          };
        }
      } catch (err) {
        console.warn('[habitService] Supabase getWeeklyHabitsData error, using cache:', err.message);
      }
    }

    await delay(150);
    const allHabits = getStoredHabits();
    const allLogs = getStoredLogs();

    let studentHabits = allHabits.filter((h) => h.student_id === studentId);
    if (studentHabits.length === 0) {
      studentHabits = allHabits.filter((h) => h.student_id === 'user_student_1');
    }

    const logMap = {}; // `${habitId}_${dateKey}` -> boolean
    allLogs.forEach((log) => {
      logMap[`${log.habit_id}_${log.log_date}`] = Boolean(log.is_done);
    });

    const habitsWithGrid = studentHabits.map((habit) => {
      let daysCompletedThisWeek = 0;
      const days = weekDays.map((day) => {
        const isDone = Boolean(logMap[`${habit.id}_${day.dateKey}`]);
        if (isDone) daysCompletedThisWeek += 1;
        return {
          ...day,
          isDone,
        };
      });

      const weeklyPercent = Math.round((daysCompletedThisWeek / 7) * 100);

      return {
        ...habit,
        days,
        daysCompletedThisWeek,
        weeklyPercent,
      };
    });

    return {
      habits: habitsWithGrid,
      weekDays,
    };
  },

  /**
   * Add a new habit
   * @param {Object} habitData
   * @param {string} habitData.studentId
   * @param {string} habitData.name
   * @param {string} habitData.icon - 'study' | 'exercise' | 'reading' | 'water' | 'sleep'
   * @returns {Promise<Object>}
   */
  async addHabit({ studentId, name, icon }) {
    const cleanName = (name || '').trim();
    const cleanIcon = icon || 'study';

    if (isSupabaseConfigured && studentId) {
      try {
        const { data, error } = await supabase
          .from('habits')
          .insert({
            student_id: studentId,
            name: cleanName,
            icon: cleanIcon,
          })
          .select('*')
          .single();

        if (!error && data) {
          const allHabits = getStoredHabits();
          storage.set(HABITS_STORAGE_KEY, [data, ...allHabits]);
          return data;
        }
      } catch (err) {
        console.warn('[habitService] Supabase addHabit error, using cache:', err.message);
      }
    }

    await delay(150);
    const allHabits = getStoredHabits();

    const newHabit = {
      id: `habit_${Date.now()}`,
      student_id: studentId,
      name: cleanName,
      icon: cleanIcon,
      created_at: new Date().toISOString(),
    };

    const updated = [newHabit, ...allHabits];
    storage.set(HABITS_STORAGE_KEY, updated);
    return newHabit;
  },

  /**
   * Delete a habit and its associated logs
   * @param {string} habitId
   * @returns {Promise<{ success: boolean }>}
   */
  async deleteHabit(habitId) {
    if (isSupabaseConfigured && habitId) {
      try {
        const { error } = await supabase
          .from('habits')
          .delete()
          .eq('id', habitId);

        if (!error) {
          const allHabits = getStoredHabits();
          const allLogs = getStoredLogs();
          storage.set(HABITS_STORAGE_KEY, allHabits.filter((h) => h.id !== habitId));
          storage.set(HABIT_LOGS_STORAGE_KEY, allLogs.filter((l) => l.habit_id !== habitId));
          return { success: true };
        }
      } catch (err) {
        console.warn('[habitService] Supabase deleteHabit error, using cache:', err.message);
      }
    }

    await delay(150);
    const allHabits = getStoredHabits();
    const allLogs = getStoredLogs();

    const filteredHabits = allHabits.filter((h) => h.id !== habitId);
    const filteredLogs = allLogs.filter((l) => l.habit_id !== habitId);

    storage.set(HABITS_STORAGE_KEY, filteredHabits);
    storage.set(HABIT_LOGS_STORAGE_KEY, filteredLogs);

    return { success: true };
  },

  /**
   * Toggle completion of a habit on a specific date
   * @param {string} habitId
   * @param {string} dateKey - YYYY-MM-DD
   * @returns {Promise<Object>}
   */
  async toggleHabitLog(habitId, dateKey) {
    if (isSupabaseConfigured && habitId && dateKey) {
      try {
        // Check existing log
        const { data: existing } = await supabase
          .from('habit_logs')
          .select('*')
          .eq('habit_id', habitId)
          .eq('log_date', dateKey)
          .maybeSingle();

        const newDone = existing ? !existing.is_done : true;

        const { error } = await supabase
          .from('habit_logs')
          .upsert(
            {
              habit_id: habitId,
              log_date: dateKey,
              is_done: newDone,
            },
            { onConflict: 'habit_id,log_date' }
          );

        if (!error) {
          const allLogs = getStoredLogs();
          const existingIdx = allLogs.findIndex(
            (l) => l.habit_id === habitId && l.log_date === dateKey
          );
          if (existingIdx >= 0) {
            allLogs[existingIdx].is_done = newDone;
          } else {
            allLogs.push({ id: `log_${habitId}_${dateKey}`, habit_id: habitId, log_date: dateKey, is_done: newDone });
          }
          storage.set(HABIT_LOGS_STORAGE_KEY, allLogs);
          return { habitId, dateKey, isDone: newDone };
        }
      } catch (err) {
        console.warn('[habitService] Supabase toggleHabitLog error, using cache:', err.message);
      }
    }

    await delay(100);
    const allLogs = getStoredLogs();

    const existingIndex = allLogs.findIndex(
      (l) => l.habit_id === habitId && l.log_date === dateKey
    );

    let updatedLogs;
    let isDone;

    if (existingIndex >= 0) {
      isDone = !allLogs[existingIndex].is_done;
      updatedLogs = allLogs.map((log, idx) =>
        idx === existingIndex ? { ...log, is_done: isDone } : log
      );
    } else {
      isDone = true;
      const newLog = {
        id: `log_${habitId}_${dateKey}`,
        habit_id: habitId,
        log_date: dateKey,
        is_done: true,
      };
      updatedLogs = [...allLogs, newLog];
    }

    storage.set(HABIT_LOGS_STORAGE_KEY, updatedLogs);
    return { habitId, dateKey, isDone };
  },

  // ==========================================
  // Goals
  // ==========================================

  /**
   * Get all goals for a student
   * @param {string} studentId
   * @returns {Promise<Array<Object>>}
   */
  async getGoals(studentId) {
    if (isSupabaseConfigured && studentId) {
      try {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('student_id', studentId)
          .order('target_date', { ascending: true });

        if (!error && data && data.length > 0) {
          return [...data].sort((a, b) => {
            if (a.progress_percent === 100 && b.progress_percent < 100) return 1;
            if (b.progress_percent === 100 && a.progress_percent < 100) return -1;
            return new Date(a.target_date) - new Date(b.target_date);
          });
        }
      } catch (err) {
        console.warn('[habitService] Supabase getGoals error, using cache:', err.message);
      }
    }

    await delay(150);
    const allGoals = getStoredGoals();
    let studentGoals = allGoals.filter((g) => g.student_id === studentId);

    if (studentGoals.length === 0) {
      studentGoals = allGoals.filter((g) => g.student_id === 'user_student_1');
    }

    return [...studentGoals].sort((a, b) => {
      if (a.progress_percent === 100 && b.progress_percent < 100) return 1;
      if (b.progress_percent === 100 && a.progress_percent < 100) return -1;
      return new Date(a.target_date) - new Date(b.target_date);
    });
  },

  /**
   * Add a new goal
   * @param {Object} goalData
   * @param {string} goalData.studentId
   * @param {string} goalData.title
   * @param {string} goalData.targetDate
   * @param {number} [goalData.progressPercent=0]
   * @returns {Promise<Object>}
   */
  async addGoal({ studentId, title, targetDate, progressPercent = 0 }) {
    const cleanTitle = (title || '').trim();
    const safePercent = Math.min(100, Math.max(0, Number(progressPercent) || 0));

    if (isSupabaseConfigured && studentId) {
      try {
        const { data, error } = await supabase
          .from('goals')
          .insert({
            student_id: studentId,
            title: cleanTitle,
            target_date: targetDate,
            progress_percent: safePercent,
          })
          .select('*')
          .single();

        if (!error && data) {
          const allGoals = getStoredGoals();
          storage.set(GOALS_STORAGE_KEY, [data, ...allGoals]);
          return data;
        }
      } catch (err) {
        console.warn('[habitService] Supabase addGoal error, using cache:', err.message);
      }
    }

    await delay(150);
    const allGoals = getStoredGoals();

    const newGoal = {
      id: `goal_${Date.now()}`,
      student_id: studentId,
      title: cleanTitle,
      target_date: targetDate,
      progress_percent: safePercent,
      created_at: new Date().toISOString(),
    };

    const updated = [newGoal, ...allGoals];
    storage.set(GOALS_STORAGE_KEY, updated);
    return newGoal;
  },

  /**
   * Update goal progress percentage
   * @param {string} goalId
   * @param {number} progressPercent
   * @returns {Promise<Object>}
   */
  async updateGoalProgress(goalId, progressPercent) {
    const safePercent = Math.min(100, Math.max(0, Math.round(Number(progressPercent) || 0)));

    if (isSupabaseConfigured && goalId) {
      try {
        const { data, error } = await supabase
          .from('goals')
          .update({ progress_percent: safePercent })
          .eq('id', goalId)
          .select('*')
          .single();

        if (!error && data) {
          const allGoals = getStoredGoals();
          storage.set(
            GOALS_STORAGE_KEY,
            allGoals.map((g) => (g.id === goalId ? data : g))
          );
          return data;
        }
      } catch (err) {
        console.warn('[habitService] Supabase updateGoalProgress error, using cache:', err.message);
      }
    }

    await delay(120);
    const allGoals = getStoredGoals();
    let updatedGoal = null;

    const updated = allGoals.map((g) => {
      if (g.id === goalId) {
        updatedGoal = { ...g, progress_percent: safePercent };
        return updatedGoal;
      }
      return g;
    });

    if (!updatedGoal) {
      throw new Error(`Goal with id "${goalId}" not found.`);
    }

    storage.set(GOALS_STORAGE_KEY, updated);
    return updatedGoal;
  },

  /**
   * Mark goal as 100% achieved
   * @param {string} goalId
   * @returns {Promise<Object>}
   */
  async markGoalAchieved(goalId) {
    return this.updateGoalProgress(goalId, 100);
  },

  /**
   * Delete a goal
   * @param {string} goalId
   * @returns {Promise<{ success: boolean }>}
   */
  async deleteGoal(goalId) {
    if (isSupabaseConfigured && goalId) {
      try {
        const { error } = await supabase
          .from('goals')
          .delete()
          .eq('id', goalId);

        if (!error) {
          const allGoals = getStoredGoals();
          storage.set(GOALS_STORAGE_KEY, allGoals.filter((g) => g.id !== goalId));
          return { success: true };
        }
      } catch (err) {
        console.warn('[habitService] Supabase deleteGoal error, using cache:', err.message);
      }
    }

    await delay(120);
    const allGoals = getStoredGoals();
    const filtered = allGoals.filter((g) => g.id !== goalId);
    storage.set(GOALS_STORAGE_KEY, filtered);
    return { success: true };
  },

  /**
   * Fixed list of available habit icons per spec
   */
  getAvailableIcons() {
    return [
      { id: 'study', label: 'Study & Focus' },
      { id: 'exercise', label: 'Exercise & Fitness' },
      { id: 'reading', label: 'Reading & Research' },
      { id: 'water', label: 'Hydration' },
      { id: 'sleep', label: 'Healthy Sleep' },
    ];
  },
};

export default habitService;
