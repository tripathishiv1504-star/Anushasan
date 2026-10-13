/**
 * Navigation Configuration for role sidebars
 * Note: This file is append-only as per 02_RULES.md
 * Populated in Step 5 for student, mentor, and admin layouts.
 */

import {
  LayoutDashboard,
  Timer,
  CheckSquare,
  FolderArchive,
  CalendarCheck,
  AlertCircle,
  TrendingUp,
  User,
  Users,
  Upload,
  Settings,
  HeartHandshake,
} from 'lucide-react';
import { ROUTES } from '../routes/routeConfig';

export const NAV_ITEMS = {
  student: [
    { label: 'Dashboard', path: ROUTES.studentDashboard, icon: LayoutDashboard },
    { label: 'Study Tracker', path: ROUTES.studentStudy, icon: Timer },
    { label: 'Habits & Goals', path: ROUTES.studentHabitsGoals, icon: CheckSquare },
    { label: 'Resource Library', path: ROUTES.studentLibrary, icon: FolderArchive },
    { label: 'Attendance', path: ROUTES.studentAttendance, icon: CalendarCheck, classModeOnly: true },
    { label: 'Grievances', path: ROUTES.studentGrievances, icon: AlertCircle, classModeOnly: true },
    { label: 'Weekly Report', path: ROUTES.studentReport, icon: TrendingUp },
    { label: 'Profile', path: ROUTES.studentProfile, icon: User },
  ],
  mentor: [
    { label: 'My Classes', path: ROUTES.mentorClasses, icon: Users },
    { label: 'Risk Alerts', path: ROUTES.mentorAlerts, icon: AlertCircle },
    { label: 'Upload Resources', path: ROUTES.mentorUpload, icon: Upload },
    { label: 'Mark Attendance', path: ROUTES.mentorAttendance, icon: CalendarCheck },
    { label: 'Resolve Grievances', path: ROUTES.mentorGrievances, icon: AlertCircle },
    { label: 'Profile', path: ROUTES.mentorProfile, icon: User },
  ],
  admin: [
    { label: 'Department Analytics', path: ROUTES.adminAnalytics, icon: TrendingUp },
    { label: 'Department Setup', path: ROUTES.adminSetup, icon: Settings },
    { label: 'Grievance Overview', path: ROUTES.adminGrievances, icon: AlertCircle },
    { label: 'Counselling Plans', path: ROUTES.adminCounselling, icon: HeartHandshake },
    { label: 'Profile', path: ROUTES.adminProfile, icon: User },
  ],
};

/**
 * Filter nav items for active student mode (solo mode hides classModeOnly items)
 * @param {Object} user
 * @returns {Array<Object>}
 */
export function getNavItemsForUser(user) {
  if (!user || !user.role) return [];
  const items = NAV_ITEMS[user.role] || [];
  if (user.role === 'student' && user.study_mode === 'solo') {
    return items.filter((item) => !item.classModeOnly);
  }
  return items;
}

export default NAV_ITEMS;
