/**
 * Score Service (Phase 2 - Step 21f)
 * Connects to Supabase public.score_snapshots, public.student_badges, public.badges,
 * and aggregates telemetry across study_sessions, tasks, habits, and attendance tables,
 * with full fallback to local cache and mock stores for demo accounts.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { storage } from '../utils/storage';
import { INITIAL_STUDY_SESSIONS } from '../mock/studySessions';
import { INITIAL_TASKS } from '../mock/tasks';
import { INITIAL_ATTENDANCE_RECORDS } from '../mock/attendance';
import { INITIAL_HABIT_LOGS, INITIAL_GOALS } from '../mock/habits';
import { INITIAL_BADGES, INITIAL_STUDENT_BADGES } from '../mock/badges';
import {
  calculateDisciplineScore,
  calculateStudyStreak,
  getTodayStudyMinutes,
  getWeeklyStudyMinutes,
  toDateKey,
} from '../utils/scoring';

const SESSIONS_STORAGE_KEY = 'study_sessions';
const TASKS_STORAGE_KEY = 'student_tasks';
const ATTENDANCE_STORAGE_KEY = 'attendance_records';
const HABIT_LOGS_STORAGE_KEY = 'habit_logs';
const SCORE_SNAPSHOTS_KEY = 'score_snapshots';
const STUDENT_BADGES_STORAGE_KEY = 'student_badges';
const GOALS_STORAGE_KEY = 'student_goals';

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

function getStoredAttendance() {
  const records = storage.get(ATTENDANCE_STORAGE_KEY, null);
  if (!records || !Array.isArray(records) || records.length === 0) {
    storage.set(ATTENDANCE_STORAGE_KEY, INITIAL_ATTENDANCE_RECORDS);
    return INITIAL_ATTENDANCE_RECORDS;
  }
  return records;
}

function getStoredHabitLogs() {
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

function getStoredStudentBadges() {
  const badges = storage.get(STUDENT_BADGES_STORAGE_KEY, null);
  if (!badges || !Array.isArray(badges) || badges.length === 0) {
    storage.set(STUDENT_BADGES_STORAGE_KEY, INITIAL_STUDENT_BADGES);
    return INITIAL_STUDENT_BADGES;
  }
  return badges;
}

function getStoredSnapshots() {
  const snapshots = storage.get(SCORE_SNAPSHOTS_KEY, null);
  if (!snapshots || !Array.isArray(snapshots) || snapshots.length === 0) {
    const initialSnapshots = [
      { id: 'snap_s1_w1', student_id: 'user_student_1', week_start: '2026-08-24', week_label: 'Week 1', score: 68 },
      { id: 'snap_s1_w2', student_id: 'user_student_1', week_start: '2026-08-31', week_label: 'Week 2', score: 72 },
      { id: 'snap_s1_w3', student_id: 'user_student_1', week_start: '2026-09-07', week_label: 'Week 3', score: 75 },
      { id: 'snap_s1_w4', student_id: 'user_student_1', week_start: '2026-09-14', week_label: 'Week 4', score: 78 },
      { id: 'snap_s1_w5', student_id: 'user_student_1', week_start: '2026-09-21', week_label: 'Week 5', score: 82 },
      { id: 'snap_s1_w6', student_id: 'user_student_1', week_start: '2026-09-28', week_label: 'Week 6', score: 80 },
      { id: 'snap_s1_w7', student_id: 'user_student_1', week_start: '2026-10-05', week_label: 'Week 7', score: 85 },
      { id: 'snap_s2_w1', student_id: 'user_student_solo', week_start: '2026-08-24', week_label: 'Week 1', score: 62 },
      { id: 'snap_s2_w2', student_id: 'user_student_solo', week_start: '2026-08-31', week_label: 'Week 2', score: 65 },
      { id: 'snap_s2_w3', student_id: 'user_student_solo', week_start: '2026-09-07', week_label: 'Week 3', score: 68 },
      { id: 'snap_s2_w4', student_id: 'user_student_solo', week_start: '2026-09-14', week_label: 'Week 4', score: 70 },
      { id: 'snap_s2_w5', student_id: 'user_student_solo', week_start: '2026-09-21', week_label: 'Week 5', score: 72 },
      { id: 'snap_s2_w6', student_id: 'user_student_solo', week_start: '2026-09-28', week_label: 'Week 6', score: 74 },
      { id: 'snap_s2_w7', student_id: 'user_student_solo', week_start: '2026-10-05', week_label: 'Week 7', score: 78 },
    ];
    storage.set(SCORE_SNAPSHOTS_KEY, initialSnapshots);
    return initialSnapshots;
  }
  return snapshots;
}

export const scoreService = {
  /**
   * Fetch all dashboard data for a student
   * @param {string} studentId
   * @param {'class' | 'solo'} studyMode
   * @returns {Promise<Object>}
   */
  async getStudentDashboardData(studentId, studyMode = 'class') {
    let studentSessions = [];
    let studentTasks = [];
    let studentAttendance = [];
    let studentHabitLogs = [];
    let studentSnapshots = [];

    // Attempt Supabase fetch if configured
    if (isSupabaseConfigured && studentId) {
      try {
        const [
          { data: dbSessions },
          { data: dbTasks },
          { data: dbAttendance },
          { data: dbSnapshots },
        ] = await Promise.all([
          supabase.from('study_sessions').select('*').eq('student_id', studentId).order('started_at', { ascending: false }),
          supabase.from('tasks').select('*').eq('student_id', studentId).order('due_date', { ascending: true }),
          supabase.from('attendance_records').select('*').eq('student_id', studentId),
          supabase.from('score_snapshots').select('*').eq('student_id', studentId).order('week_start', { ascending: true }),
        ]);

        if (dbSessions && dbSessions.length > 0) studentSessions = dbSessions;
        if (dbTasks && dbTasks.length > 0) studentTasks = dbTasks;
        if (dbAttendance && dbAttendance.length > 0) studentAttendance = dbAttendance;
        if (dbSnapshots && dbSnapshots.length > 0) studentSnapshots = dbSnapshots;
      } catch (err) {
        console.warn('[scoreService] Supabase dashboard fetch error, using cache:', err.message);
      }
    }

    // Fallbacks from storage if empty
    if (studentSessions.length === 0) {
      const allSessions = getStoredSessions();
      studentSessions = allSessions.filter((s) => s.student_id === studentId);
      if (studentSessions.length === 0) {
        studentSessions = allSessions.filter(
          (s) => s.student_id === (studyMode === 'solo' ? 'user_student_solo' : 'user_student_1')
        );
      }
    }

    if (studentTasks.length === 0) {
      const allTasks = getStoredTasks();
      studentTasks = allTasks.filter((t) => t.student_id === studentId);
      if (studentTasks.length === 0) {
        studentTasks = allTasks.filter(
          (t) => t.student_id === (studyMode === 'solo' ? 'user_student_solo' : 'user_student_1')
        );
      }
    }

    if (studyMode === 'class' && studentAttendance.length === 0) {
      const allAttendance = getStoredAttendance();
      studentAttendance = allAttendance.filter((a) => a.student_id === studentId);
      if (studentAttendance.length === 0) {
        studentAttendance = allAttendance.filter((a) => a.student_id === 'user_student_1');
      }
    }

    if (studentHabitLogs.length === 0) {
      const allHabitLogs = getStoredHabitLogs();
      studentHabitLogs = allHabitLogs.filter((h) => h.student_id === studentId);
      if (studentHabitLogs.length === 0) {
        studentHabitLogs = allHabitLogs.filter(
          (h) => h.student_id === (studyMode === 'solo' ? 'user_student_solo' : 'user_student_1')
        );
      }
    }

    if (studentSnapshots.length === 0) {
      const allSnapshots = getStoredSnapshots();
      studentSnapshots = allSnapshots.filter(
        (snap) =>
          snap.student_id === studentId ||
          snap.student_id === (studyMode === 'solo' ? 'user_student_solo' : 'user_student_1')
      );
    }

    // Get previous score snapshot for delta & risk rule
    const lastSnapshot = studentSnapshots[studentSnapshots.length - 1];
    const previousScore = lastSnapshot ? lastSnapshot.score : 80;

    // Calculations
    const todayKey = toDateKey(new Date());
    const todayMinutes = getTodayStudyMinutes(studentSessions);
    const streak = calculateStudyStreak(studentSessions);
    const weeklyMinutes = getWeeklyStudyMinutes(studentSessions);

    // Compute Discipline Score
    const scoreResult = calculateDisciplineScore({
      studySessions: studentSessions,
      tasks: studentTasks,
      habitLogs: studentHabitLogs,
      attendanceRecords: studentAttendance,
      studyMode,
      previousScore,
      refDate: new Date(),
    });

    return {
      studentId,
      studyMode,
      todayKey,
      todayMinutes,
      streak,
      weeklyMinutes,
      score: scoreResult.score,
      previousScore: scoreResult.previousScore,
      scoreDelta: scoreResult.delta,
      isAtRisk: scoreResult.isAtRisk,
      breakdown: scoreResult.breakdown,
      weeklyChartData: weeklyMinutes,
      tasks: studentTasks.slice(0, 10),
      recentSessions: studentSessions.slice(0, 5),
    };
  },

  /**
   * Fetch Weekly Report & Achievements Data (Step 11)
   * @param {string} studentId
   * @param {'class' | 'solo'} [studyMode='class']
   * @returns {Promise<Object>}
   */
  async getStudentReportData(studentId, studyMode = 'class') {
    const isSolo = studyMode === 'solo';
    const effectiveId = studentId || (isSolo ? 'user_student_solo' : 'user_student_1');

    let sessions = [];
    let tasks = [];
    let attendance = [];
    let habitLogs = [];
    let goals = [];
    let studentSnapshots = [];
    let allStudentBadges = [];

    if (isSupabaseConfigured && studentId) {
      try {
        const [
          { data: dbSessions },
          { data: dbTasks },
          { data: dbAttendance },
          { data: dbGoals },
          { data: dbSnapshots },
          { data: dbBadges },
        ] = await Promise.all([
          supabase.from('study_sessions').select('*').eq('student_id', studentId),
          supabase.from('tasks').select('*').eq('student_id', studentId),
          supabase.from('attendance_records').select('*').eq('student_id', studentId),
          supabase.from('goals').select('*').eq('student_id', studentId),
          supabase.from('score_snapshots').select('*').eq('student_id', studentId).order('week_start', { ascending: true }),
          supabase.from('student_badges').select('*').eq('student_id', studentId),
        ]);

        if (dbSessions && dbSessions.length > 0) sessions = dbSessions;
        if (dbTasks && dbTasks.length > 0) tasks = dbTasks;
        if (dbAttendance && dbAttendance.length > 0) attendance = dbAttendance;
        if (dbGoals && dbGoals.length > 0) goals = dbGoals;
        if (dbSnapshots && dbSnapshots.length > 0) studentSnapshots = dbSnapshots;
        if (dbBadges && dbBadges.length > 0) allStudentBadges = dbBadges;
      } catch (err) {
        console.warn('[scoreService] Supabase report fetch error, using cache:', err.message);
      }
    }

    // Fallbacks
    const allSessions = getStoredSessions();
    const allTasks = getStoredTasks();
    const allAttendance = getStoredAttendance();
    const allHabitLogs = getStoredHabitLogs();
    const allGoals = getStoredGoals();
    const allSnapshots = getStoredSnapshots();
    if (allStudentBadges.length === 0) allStudentBadges = getStoredStudentBadges();

    if (sessions.length === 0) {
      sessions = allSessions.filter((s) => s.student_id === effectiveId);
      if (sessions.length === 0) {
        sessions = allSessions.filter((s) => s.student_id === (isSolo ? 'user_student_solo' : 'user_student_1'));
      }
    }
    if (tasks.length === 0) {
      tasks = allTasks.filter((t) => t.student_id === effectiveId);
      if (tasks.length === 0) {
        tasks = allTasks.filter((t) => t.student_id === (isSolo ? 'user_student_solo' : 'user_student_1'));
      }
    }
    if (!isSolo && attendance.length === 0) {
      attendance = allAttendance.filter((a) => a.student_id === effectiveId);
      if (attendance.length === 0) {
        attendance = allAttendance.filter((a) => a.student_id === 'user_student_1');
      }
    }
    if (habitLogs.length === 0) {
      habitLogs = allHabitLogs.filter((h) => h.student_id === effectiveId);
      if (habitLogs.length === 0) {
        habitLogs = allHabitLogs.filter((h) => h.student_id === (isSolo ? 'user_student_solo' : 'user_student_1'));
      }
    }
    if (goals.length === 0) {
      goals = allGoals.filter((g) => g.student_id === effectiveId);
      if (goals.length === 0) {
        goals = allGoals.filter((g) => g.student_id === (isSolo ? 'user_student_solo' : 'user_student_1'));
      }
    }
    if (studentSnapshots.length === 0) {
      studentSnapshots = allSnapshots.filter(
        (s) => s.student_id === effectiveId || s.student_id === (isSolo ? 'user_student_solo' : 'user_student_1')
      );
    }

    const lastSnapshot = studentSnapshots[studentSnapshots.length - 1];
    const previousScore = lastSnapshot ? lastSnapshot.score : (isSolo ? 74 : 85);

    // Current weekly score calculation
    const currentScoreResult = calculateDisciplineScore({
      studySessions: sessions,
      tasks,
      habitLogs,
      attendanceRecords: attendance,
      studyMode,
      previousScore,
      refDate: new Date(),
    });

    const currentScore = currentScoreResult.score;
    const scoreDelta = currentScore - previousScore;

    // Study Hours this week
    const weeklyChartData = getWeeklyStudyMinutes(sessions);
    const totalWeeklyMinutes = weeklyChartData.reduce((sum, d) => sum + (d.minutes || 0), 0);
    const totalStudyHoursThisWeek = Math.round((totalWeeklyMinutes / 60) * 10) / 10;

    // Total All-Time Study Hours
    const totalAllTimeMinutes = sessions.reduce((sum, s) => sum + (Number(s.duration_minutes) || 0), 0);
    const totalAllTimeHours = Math.round((totalAllTimeMinutes / 60) * 10) / 10;

    // Days studied this week with >= 30m
    const daysStudiedWithGoal = weeklyChartData.filter((d) => d.reachedGoal).length;

    // Best / Most Productive Day of the week
    let bestDayObj = weeklyChartData[0] || { day: 'Wednesday', minutes: 0 };
    for (const d of weeklyChartData) {
      if ((d.minutes || 0) > (bestDayObj.minutes || 0)) {
        bestDayObj = d;
      }
    }
    const bestDayName = bestDayObj.day || 'Wednesday';
    const bestDayHours = Math.round(((bestDayObj.minutes || 180) / 60) * 10) / 10;

    // Tasks Completed
    const completedTasksCount = tasks.filter((t) => t.is_done).length;
    const totalTasksCount = tasks.length;
    const taskCompletionPercent =
      totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 100;

    // Habit Consistency
    const habitCompletedCount = habitLogs.filter((h) => h.is_done).length;
    const habitTotalCount = habitLogs.length;
    const habitConsistencyPercent =
      habitTotalCount > 0 ? Math.round((habitCompletedCount / habitTotalCount) * 100) : 85;

    // Attendance (Class mode only; strictly null in solo mode)
    let attendanceRate = null;
    let isAttendanceLow = false;
    if (!isSolo) {
      const totalAttSessions = attendance.length;
      if (totalAttSessions > 0) {
        const attended = attendance.filter((a) => a.status === 'present' || a.status === 'late').length;
        attendanceRate = Math.round((attended / totalAttSessions) * 100);
        isAttendanceLow = attendanceRate < 75;
      } else {
        attendanceRate = 100;
      }
    }

    // 3 Plain-Language Insights generated by simple rules (Step 11 spec)
    const insights = [];

    // Insight 1: Study Frequency & Regularity
    if (daysStudiedWithGoal >= 5) {
      insights.push({
        id: 'ins_1',
        type: 'positive',
        title: 'Outstanding Study Consistency',
        text: `You studied on ${daysStudiedWithGoal} of 7 days this week, surpassing the consistency baseline.`,
      });
    } else if (daysStudiedWithGoal >= 3) {
      insights.push({
        id: 'ins_1',
        type: 'neutral',
        title: 'Steady Weekly Effort',
        text: `You studied on ${daysStudiedWithGoal} of 7 days. Adding one more 30-minute block will elevate your discipline score.`,
      });
    } else {
      insights.push({
        id: 'ins_1',
        type: 'warning',
        title: 'Consistency Opportunity',
        text: `You logged study on ${daysStudiedWithGoal} of 7 days this week. Consistency compounds with daily 30-minute sessions.`,
      });
    }

    // Insight 2: Peak Productivity Day
    insights.push({
      id: 'ins_2',
      type: 'info',
      title: 'Peak Productivity Day',
      text: `Your best day was ${bestDayName} with ${bestDayHours} hours of deep focused work.`,
    });

    // Insight 3: Academic / Mode-Specific Pillar Highlight
    if (!isSolo) {
      if (isAttendanceLow) {
        insights.push({
          id: 'ins_3',
          type: 'warning',
          title: 'Attendance Alert',
          text: `Attendance was below 75% this week (${attendanceRate}%). Prioritize attending upcoming lectures to recover standing.`,
        });
      } else {
        insights.push({
          id: 'ins_3',
          type: 'positive',
          title: 'Class Attendance on Track',
          text: `Attendance remained strong at ${attendanceRate}%, securing full class participation discipline points.`,
        });
      }
    } else {
      if (habitConsistencyPercent >= 80) {
        insights.push({
          id: 'ins_3',
          type: 'positive',
          title: 'High Habit Discipline',
          text: `Maintained a strong ${habitConsistencyPercent}% habit consistency across your daily self-study routines.`,
        });
      } else {
        insights.push({
          id: 'ins_3',
          type: 'positive',
          title: 'Task Execution Progress',
          text: `Completed ${completedTasksCount} of ${totalTasksCount} scheduled study tasks, keeping milestone goals moving forward.`,
        });
      }
    }

    // 8-Week Score Trend Data
    const trendData = [];
    const baseSnapshots = studentSnapshots.slice(-7);
    baseSnapshots.forEach((snap, idx) => {
      trendData.push({
        week: `W${idx + 1}`,
        label: snap.week_label || `Week ${idx + 1}`,
        score: snap.score,
        date: snap.week_start,
      });
    });

    trendData.push({
      week: 'W8',
      label: 'Week 8 (This Week)',
      score: currentScore,
      date: toDateKey(new Date()),
      isCurrent: true,
    });

    const streak = calculateStudyStreak(sessions);

    // Evaluate Achievements & Badges Grid
    const earnedBadgeIds = new Set(
      allStudentBadges.filter((b) => b.student_id === effectiveId).map((b) => b.badge_id)
    );

    const evaluatedBadges = INITIAL_BADGES.map((badge) => {
      let isEarned = earnedBadgeIds.has(badge.id);
      let earnedAt = null;

      if (badge.code === 'FIRST_SESSION' && sessions.length >= 1) isEarned = true;
      if (badge.code === 'STREAK_7' && streak >= 7) isEarned = true;
      if (badge.code === 'STREAK_30' && streak >= 30) isEarned = true;
      if (badge.code === 'PERFECT_WEEK' && daysStudiedWithGoal === 7) isEarned = true;
      if (badge.code === 'HOURS_100' && totalAllTimeMinutes >= 6000) isEarned = true;
      if (badge.code === 'GOAL_ACHIEVED' && goals.some((g) => (g.progress_percent || 0) >= 100)) isEarned = true;
      if (badge.code === 'TASK_MASTER' && completedTasksCount >= 10) isEarned = true;
      if (badge.code === 'DISCIPLINE_PRO' && currentScore >= 85) isEarned = true;

      if (isEarned) {
        const foundRecord = allStudentBadges.find((b) => b.badge_id === badge.id && b.student_id === effectiveId);
        earnedAt = foundRecord ? foundRecord.earned_at : '2026-09-28T12:00:00.000Z';
      }

      return {
        ...badge,
        is_earned: isEarned,
        earned_at: earnedAt,
      };
    });

    const earnedCount = evaluatedBadges.filter((b) => b.is_earned).length;

    return {
      currentScore,
      previousScore,
      scoreDelta,
      totalStudyHoursThisWeek,
      totalAllTimeHours,
      completedTasksCount,
      totalTasksCount,
      taskCompletionPercent,
      habitConsistencyPercent,
      attendanceRate,
      isSolo,
      insights,
      trendData,
      streak,
      badgesSummary: {
        earnedCount,
        totalCount: evaluatedBadges.length,
        badges: evaluatedBadges,
      },
    };
  },

  /**
   * Toggle completion state of a task
   * Immediately updates Supabase table and local cache, then recomputes dashboard state
   * @param {string} taskId
   * @param {string} studentId
   * @param {'class' | 'solo'} studyMode
   * @returns {Promise<{ updatedTask: Object, dashboardData: Object }>}
   */
  async toggleTask(taskId, studentId, studyMode = 'class') {
    const tasks = getStoredTasks();
    const existingTask = tasks.find((t) => t.id === taskId);
    const newDoneState = existingTask ? !existingTask.is_done : true;

    if (isSupabaseConfigured && taskId) {
      try {
        await supabase
          .from('tasks')
          .update({ is_done: newDoneState })
          .eq('id', taskId);
      } catch (err) {
        console.warn('[scoreService] Supabase toggleTask error, using cache:', err.message);
      }
    }

    let updatedTask = null;
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        updatedTask = { ...task, is_done: newDoneState };
        return updatedTask;
      }
      return task;
    });

    if (!updatedTask) {
      updatedTask = { id: taskId, title: 'Study Task', is_done: newDoneState };
    }

    storage.set(TASKS_STORAGE_KEY, updatedTasks);

    // Recompute dashboard state with updated tasks
    const dashboardData = await this.getStudentDashboardData(studentId, studyMode);

    return {
      updatedTask,
      dashboardData,
    };
  },

  /**
   * Get 8-week historical score snapshots
   * @param {string} studentId
   * @returns {Promise<Array<Object>>}
   */
  async getScoreSnapshots(studentId) {
    if (isSupabaseConfigured && studentId) {
      try {
        const { data, error } = await supabase
          .from('score_snapshots')
          .select('*')
          .eq('student_id', studentId)
          .order('week_start', { ascending: true });

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('[scoreService] Supabase getScoreSnapshots error, using cache:', err.message);
      }
    }

    await delay(150);
    const snapshots = getStoredSnapshots();
    return snapshots.filter((s) => s.student_id === studentId || s.student_id === 'user_student_1');
  },
};

export default scoreService;
