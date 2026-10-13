/**
 * Mock Data Registry
 * Note: This file is append-only as per 02_RULES.md
 * Pages and components must NEVER import from this directory directly (Rule 5.5).
 * Only services in src/services/ access mock data.
 */

export const mockData = {};

export { INITIAL_USERS } from './users';
export { INITIAL_CLASSES, INITIAL_CLASS_MEMBERS } from './classes';
export { INITIAL_STUDY_SESSIONS, generateSeedStudySessions } from './studySessions';
export { INITIAL_TASKS, generateSeedTasks } from './tasks';
export { INITIAL_ATTENDANCE_RECORDS, generateSeedAttendance } from './attendance';
export { INITIAL_HABITS, INITIAL_HABIT_LOGS, INITIAL_GOALS, generateSeedHabits, generateSeedHabitLogs, generateSeedGoals } from './habits';
export { INITIAL_RESOURCES } from './resources';
export { INITIAL_TIMETABLE } from './attendance';
export { INITIAL_GRIEVANCES } from './grievances';
export { INITIAL_BADGES, INITIAL_STUDENT_BADGES } from './badges';
export { INITIAL_CLASS_STUDENTS } from './classStudents';
export { INITIAL_DEPARTMENTS, INITIAL_DEPARTMENT_MENTORS } from './departments';

export default mockData;


