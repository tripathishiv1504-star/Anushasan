/**
 * Seed Habits, Habit Logs, and Goals for Prototype Mock Data
 * Field names strictly follow spec section 10:
 * habits: id, student_id, name, icon
 * habit_logs: id, habit_id, log_date, is_done
 * goals: id, student_id, title, target_date, progress_percent
 */

/**
 * Helper to compute date key (YYYY-MM-DD) relative to today
 * @param {number} dayOffset - 0 is today, -1 is yesterday, 1 is tomorrow
 * @returns {string} YYYY-MM-DD
 */
function getRelativeDateKey(dayOffset) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate Monday-Sunday date keys for the current week
 */
function getCurrentWeekDates() {
  const curr = new Date();
  const dayOfWeek = curr.getDay(); // 0 is Sunday, 1 is Monday
  const distToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(curr);
  monday.setDate(curr.getDate() + distToMonday);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
}

export function generateSeedHabits() {
  const habits = [
    // Student 1 (Class Mode): Aarav Sharma
    {
      id: 'habit_s1_1',
      student_id: 'user_student_1',
      name: 'Daily 30m Deep Study',
      icon: 'study',
      created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    },
    {
      id: 'habit_s1_2',
      student_id: 'user_student_1',
      name: 'Morning Workout & Jog',
      icon: 'exercise',
      created_at: new Date(Date.now() - 86400000 * 18).toISOString(),
    },
    {
      id: 'habit_s1_3',
      student_id: 'user_student_1',
      name: 'Read Tech Documentation',
      icon: 'reading',
      created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
    {
      id: 'habit_s1_4',
      student_id: 'user_student_1',
      name: 'Drink 3 Litres Water',
      icon: 'water',
      created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
    {
      id: 'habit_s1_5',
      student_id: 'user_student_1',
      name: 'Sleep by 11:30 PM (7+ hrs)',
      icon: 'sleep',
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    },

    // Student 2 (Solo Mode): Priya Patel
    {
      id: 'habit_s2_1',
      student_id: 'user_student_solo',
      name: 'Focused Coding Session',
      icon: 'study',
      created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    },
    {
      id: 'habit_s2_2',
      student_id: 'user_student_solo',
      name: 'System Design Reading',
      icon: 'reading',
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      id: 'habit_s2_3',
      student_id: 'user_student_solo',
      name: 'Stay Hydrated (3L)',
      icon: 'water',
      created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
  ];

  return habits;
}

export function generateSeedHabitLogs() {
  const weekDates = getCurrentWeekDates();
  const logs = [];

  // Seed completions for Student 1 habits across current week days
  // Pattern: Mon(0), Tue(1), Wed(2), Thu(3), Fri(4), Sat(5), Sun(6)
  const completions = {
    habit_s1_1: [true, true, true, true, true, false, false], // 5/7 = 71%
    habit_s1_2: [true, false, true, true, false, true, false], // 4/7 = 57%
    habit_s1_3: [true, true, true, false, true, true, false], // 5/7 = 71%
    habit_s1_4: [true, true, true, true, true, true, false], // 6/7 = 86%
    habit_s1_5: [false, true, true, true, false, true, false], // 4/7 = 57%

    habit_s2_1: [true, true, true, true, false, false, false],
    habit_s2_2: [true, true, false, true, true, false, false],
    habit_s2_3: [true, true, true, true, true, false, false],
  };

  Object.entries(completions).forEach(([habitId, daysDone]) => {
    weekDates.forEach((dateKey, index) => {
      logs.push({
        id: `log_${habitId}_${dateKey}`,
        habit_id: habitId,
        log_date: dateKey,
        is_done: Boolean(daysDone[index]),
      });
    });
  });

  return logs;
}

export function generateSeedGoals() {
  const goals = [
    // Student 1 (Class Mode): Aarav Sharma
    {
      id: 'goal_s1_1',
      student_id: 'user_student_1',
      title: 'Master Dynamic Programming Patterns & Top 50 Problems',
      target_date: getRelativeDateKey(14),
      progress_percent: 65,
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      id: 'goal_s1_2',
      student_id: 'user_student_1',
      title: 'Build Virtual Memory Paging Simulator in C++',
      target_date: getRelativeDateKey(21),
      progress_percent: 35,
      created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
    {
      id: 'goal_s1_3',
      student_id: 'user_student_1',
      title: 'Maintain 30-Day Daily Study Consistency',
      target_date: getRelativeDateKey(7),
      progress_percent: 85,
      created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    },
    {
      id: 'goal_s1_4',
      student_id: 'user_student_1',
      title: 'Complete SQL Relational Algebra & Indexing Assignments',
      target_date: getRelativeDateKey(-3),
      progress_percent: 100, // Achieved
      created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    },

    // Student 2 (Solo Mode): Priya Patel
    {
      id: 'goal_s2_1',
      student_id: 'user_student_solo',
      title: 'Deploy Full-Stack Portfolio on Cloud',
      target_date: getRelativeDateKey(12),
      progress_percent: 75,
      created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
    {
      id: 'goal_s2_2',
      student_id: 'user_student_solo',
      title: 'Solve 100 LeetCode Medium Questions',
      target_date: getRelativeDateKey(28),
      progress_percent: 40,
      created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
    {
      id: 'goal_s2_3',
      student_id: 'user_student_solo',
      title: 'Read High-Performance Browser Networking Chapters 1-8',
      target_date: getRelativeDateKey(-4),
      progress_percent: 100, // Achieved
      created_at: new Date(Date.now() - 86400000 * 16).toISOString(),
    },
  ];

  return goals;
}

export const INITIAL_HABITS = generateSeedHabits();
export const INITIAL_HABIT_LOGS = generateSeedHabitLogs();
export const INITIAL_GOALS = generateSeedGoals();

export default {
  INITIAL_HABITS,
  INITIAL_HABIT_LOGS,
  INITIAL_GOALS,
};
