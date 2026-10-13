/**
 * Discipline Scoring Logic (0 - 100)
 * Strictly follows 03_PROJECT_SPEC.md section 11 and 04_BUILD_STEPS.md Step 6.
 *
 * Class mode weights:
 * - Study consistency (days studied >= 30m out of 7): 35 points
 * - Task completion (done / due): 25 points
 * - Habit completion (done / expected): 20 points
 * - Attendance (present or late / total): 20 points
 * Total: 100 points
 *
 * Solo mode weights (No attendance):
 * - Study consistency: 40 points
 * - Task completion: 30 points
 * - Habit completion: 30 points
 * Total: 100 points
 *
 * Risk rule:
 * - At risk if score < 50 OR score dropped >= 15 points vs previous week.
 *
 * Streak:
 * - Consecutive calendar days with at least 30 minutes of study counted back from today.
 */

/**
 * Format Date to local YYYY-MM-DD
 * @param {Date | string} dateInput
 * @returns {string} YYYY-MM-DD
 */
export function toDateKey(dateInput) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Sum minutes grouped by YYYY-MM-DD
 * @param {Array<Object>} studySessions
 * @returns {Record<string, number>}
 */
export function getDailyMinutesMap(studySessions = []) {
  const map = {};
  for (const session of studySessions) {
    if (!session || !session.started_at) continue;
    const key = toDateKey(session.started_at);
    const mins = Number(session.duration_minutes) || 0;
    map[key] = (map[key] || 0) + mins;
  }
  return map;
}

/**
 * Compute today's study minutes
 * @param {Array<Object>} studySessions
 * @param {Date} [refDate=new Date()]
 * @returns {number}
 */
export function getTodayStudyMinutes(studySessions = [], refDate = new Date()) {
  const map = getDailyMinutesMap(studySessions);
  const todayKey = toDateKey(refDate);
  return map[todayKey] || 0;
}

/**
 * Calculate study streak (consecutive days with >= 30m)
 * Counted back from today. Includes grace period if today is ongoing (<30m)
 * but yesterday had >= 30m.
 * @param {Array<Object>} studySessions
 * @param {Date} [refDate=new Date()]
 * @returns {number} streak count
 */
export function calculateStudyStreak(studySessions = [], refDate = new Date()) {
  const map = getDailyMinutesMap(studySessions);
  const todayKey = toDateKey(refDate);
  const todayMinutes = map[todayKey] || 0;

  let streak = 0;
  const checkDate = new Date(refDate);

  if (todayMinutes >= 30) {
    streak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
    while (true) {
      const key = toDateKey(checkDate);
      const mins = map[key] || 0;
      if (mins >= 30) {
        streak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  } else {
    // Today is ongoing and under 30m. Check if streak was active up to yesterday.
    checkDate.setDate(checkDate.getDate() - 1);
    while (true) {
      const key = toDateKey(checkDate);
      const mins = map[key] || 0;
      if (mins >= 30) {
        streak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return streak;
}

/**
 * Get daily study minutes for the current week (Monday to Sunday) for Recharts
 * @param {Array<Object>} studySessions
 * @param {Date} [refDate=new Date()]
 * @returns {Array<{ day: string, date: string, label: string, minutes: number, reachedGoal: boolean, isToday: boolean }>}
 */
export function getWeeklyStudyMinutes(studySessions = [], refDate = new Date()) {
  const map = getDailyMinutesMap(studySessions);
  const todayKey = toDateKey(refDate);

  // Find Monday of the current week
  const curr = new Date(refDate);
  const dayOfWeek = curr.getDay(); // 0 is Sunday, 1 is Monday
  const distToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(curr);
  monday.setDate(curr.getDate() + distToMonday);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekData = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = toDateKey(d);
    const minutes = map[key] || 0;
    const isToday = key === todayKey;

    weekData.push({
      day: dayNames[i],
      date: key,
      label: `${dayNames[i]} ${d.getDate()}`,
      minutes: minutes,
      reachedGoal: minutes >= 30,
      isToday,
    });
  }

  return weekData;
}

/**
 * Calculate full weekly discipline score (0 - 100)
 *
 * @param {Object} params
 * @param {Array<Object>} params.studySessions
 * @param {Array<Object>} params.tasks
 * @param {Array<Object>} [params.habitLogs=[]]
 * @param {Array<Object>} [params.attendanceRecords=[]]
 * @param {'class' | 'solo'} [params.studyMode='class']
 * @param {number | null} [params.previousScore=null]
 * @param {Date} [params.refDate=new Date()]
 * @returns {Object} Score details, breakdown, risk status, delta
 */
export function calculateDisciplineScore({
  studySessions = [],
  tasks = [],
  habitLogs = [],
  attendanceRecords = [],
  studyMode = 'class',
  previousScore = null,
  refDate = new Date(),
}) {
  const isSolo = studyMode === 'solo';
  const dailyMap = getDailyMinutesMap(studySessions);

  // 1. Study consistency (last 7 calendar days including today)
  let daysStudiedWith30Mins = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    if ((dailyMap[key] || 0) >= 30) {
      daysStudiedWith30Mins += 1;
    }
  }

  const maxConsistency = isSolo ? 40 : 35;
  const consistencyScore = Math.round((Math.min(daysStudiedWith30Mins, 7) / 7) * maxConsistency);

  // 2. Task completion (tasks active or due in recent 7-day window)
  const maxTask = isSolo ? 30 : 25;
  // Consider tasks for this student: if tasks are present, calculate done / total
  let taskCompletionScore = maxTask;
  let doneTasks = 0;
  let totalTasks = 0;

  if (tasks.length > 0) {
    // Active tasks or tasks due today/recently
    totalTasks = tasks.length;
    doneTasks = tasks.filter((t) => t.is_done).length;
    taskCompletionScore = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * maxTask) : maxTask;
  }

  // 3. Habit completion
  const maxHabit = isSolo ? 30 : 20;
  let habitScore = maxHabit;
  if (habitLogs && habitLogs.length > 0) {
    const doneHabits = habitLogs.filter((h) => h.is_done).length;
    habitScore = Math.round((doneHabits / habitLogs.length) * maxHabit);
  }

  // 4. Attendance (Class mode only)
  let attendanceScore = 0;
  let attendedCount = 0;
  let totalAttendanceCount = 0;

  if (!isSolo) {
    totalAttendanceCount = attendanceRecords.length;
    if (totalAttendanceCount > 0) {
      attendedCount = attendanceRecords.filter(
        (r) => r.status === 'present' || r.status === 'late'
      ).length;
      attendanceScore = Math.round((attendedCount / totalAttendanceCount) * 20);
    } else {
      attendanceScore = 20; // Default full points if no attendance sessions scheduled
    }
  }

  // Total calculated score (0 - 100)
  const totalScore = Math.min(
    100,
    Math.max(0, consistencyScore + taskCompletionScore + habitScore + attendanceScore)
  );

  // Risk Rule: Score < 50 OR dropped >= 15 points vs previous week
  const dropFromPrevious = previousScore !== null ? previousScore - totalScore : 0;
  const isAtRisk = totalScore < 50 || dropFromPrevious >= 15;
  const delta = previousScore !== null ? totalScore - previousScore : 0;

  return {
    totalScore,
    isAtRisk,
    previousScore,
    delta,
    dropFromPrevious,
    studyMode,
    breakdown: {
      studyConsistency: {
        score: consistencyScore,
        max: maxConsistency,
        daysStudied: daysStudiedWith30Mins,
        totalDays: 7,
      },
      taskCompletion: {
        score: taskCompletionScore,
        max: maxTask,
        doneTasks,
        totalTasks,
      },
      habitCompletion: {
        score: habitScore,
        max: maxHabit,
      },
      attendance: isSolo
        ? null
        : {
            score: attendanceScore,
            max: 20,
            attendedCount,
            totalAttendanceCount,
            ratePercent:
              totalAttendanceCount > 0
                ? Math.round((attendedCount / totalAttendanceCount) * 100)
                : 100,
          },
    },
  };
}

export default {
  calculateDisciplineScore,
  calculateStudyStreak,
  getTodayStudyMinutes,
  getWeeklyStudyMinutes,
  getDailyMinutesMap,
  toDateKey,
};
