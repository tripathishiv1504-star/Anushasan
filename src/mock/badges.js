/**
 * Seed Badges & Achievements for Prototype Mock Data
 * Strictly follows spec section 10 & 11:
 * id, code, name, description, category, icon_name, condition_description
 */

export const INITIAL_BADGES = [
  {
    id: 'badge_first_session',
    code: 'FIRST_SESSION',
    name: 'First Step',
    description: 'Completed your very first study tracking session on Anushasan.',
    condition_description: 'Log at least 1 study session',
    icon_name: 'Zap',
    category: 'Milestone',
    points: 10,
  },
  {
    id: 'badge_streak_7',
    code: 'STREAK_7',
    name: '7-Day Streak',
    description: 'Maintained an unbroken study streak of 7 consecutive days.',
    condition_description: 'Study for at least 30 minutes 7 days in a row',
    icon_name: 'Flame',
    category: 'Consistency',
    points: 25,
  },
  {
    id: 'badge_streak_30',
    code: 'STREAK_30',
    name: '30-Day Master',
    description: 'Achieved a legendary month-long study streak of 30 consecutive days.',
    condition_description: 'Study for at least 30 minutes 30 days in a row',
    icon_name: 'Crown',
    category: 'Consistency',
    points: 100,
  },
  {
    id: 'badge_perfect_week',
    code: 'PERFECT_WEEK',
    name: 'Perfect Week',
    description: 'Studied for at least 30 minutes every single day from Monday to Sunday.',
    condition_description: 'Log 30+ minutes on all 7 days of the current week',
    icon_name: 'Sparkles',
    category: 'Weekly',
    points: 35,
  },
  {
    id: 'badge_hours_100',
    code: 'HOURS_100',
    name: 'Century Scholar',
    description: 'Logged over 100 hours of focused, verified study time.',
    condition_description: 'Reach 100 hours of total logged study time',
    icon_name: 'Clock',
    category: 'Dedication',
    points: 75,
  },
  {
    id: 'badge_goal_achieved',
    code: 'GOAL_ACHIEVED',
    name: 'Goal Crusher',
    description: 'Successfully reached 100% on a personal academic growth goal.',
    condition_description: 'Mark at least 1 goal as completed or achieved',
    icon_name: 'Target',
    category: 'Milestone',
    points: 30,
  },
  {
    id: 'badge_task_master',
    code: 'TASK_MASTER',
    name: 'Task Master',
    description: 'Completed 10 academic revision and coursework tasks.',
    condition_description: 'Complete at least 10 tasks in the task manager',
    icon_name: 'CheckCircle2',
    category: 'Productivity',
    points: 20,
  },
  {
    id: 'badge_discipline_pro',
    code: 'DISCIPLINE_PRO',
    name: 'Discipline Prodigy',
    description: 'Attained a weekly Discipline Score of 85 or higher.',
    condition_description: 'Reach a weekly Discipline Score ≥ 85',
    icon_name: 'ShieldCheck',
    category: 'Excellence',
    points: 50,
  },
];

export const INITIAL_STUDENT_BADGES = [
  {
    id: 'sb_1',
    student_id: 'user_student_1',
    badge_id: 'badge_first_session',
    earned_at: '2026-09-02T10:00:00.000Z',
  },
  {
    id: 'sb_2',
    student_id: 'user_student_1',
    badge_id: 'badge_streak_7',
    earned_at: '2026-09-12T19:30:00.000Z',
  },
  {
    id: 'sb_3',
    student_id: 'user_student_1',
    badge_id: 'badge_task_master',
    earned_at: '2026-09-24T16:00:00.000Z',
  },
  {
    id: 'sb_4',
    student_id: 'user_student_1',
    badge_id: 'badge_discipline_pro',
    earned_at: '2026-10-05T20:00:00.000Z',
  },
  {
    id: 'sb_5',
    student_id: 'user_student_solo',
    badge_id: 'badge_first_session',
    earned_at: '2026-09-06T11:00:00.000Z',
  },
  {
    id: 'sb_6',
    student_id: 'user_student_solo',
    badge_id: 'badge_streak_7',
    earned_at: '2026-09-15T18:00:00.000Z',
  },
];

export default INITIAL_BADGES;
