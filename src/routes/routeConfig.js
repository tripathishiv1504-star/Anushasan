/**
 * Centralized Route Configuration for Anushasan
 * Note: This file is append-only as per 02_RULES.md
 */
export const ROUTES = {
  // Public
  landing: '/',
  auth: '/auth',
  notFound: '*',

  // Onboarding & Role Selection
  selectRole: '/select-role',
  studentMode: '/student/mode',
  studentJoinClass: '/student/join-class',

  // Student Portal
  studentDashboard: '/student/dashboard',
  studentStudy: '/student/study',
  studentHabitsGoals: '/student/habits-goals',
  studentLibrary: '/student/library',
  studentAttendance: '/student/attendance',
  studentGrievances: '/student/grievances',
  studentReport: '/student/report',
  studentProfile: '/student/profile',

  // Mentor Portal
  mentorClasses: '/mentor/classes',
  mentorClassDashboard: '/mentor/classes/:classId',
  mentorAlerts: '/mentor/alerts',
  mentorUpload: '/mentor/upload',
  mentorAttendance: '/mentor/attendance',
  mentorGrievances: '/mentor/grievances',
  mentorProfile: '/mentor/profile',

  // Admin Portal
  adminSetup: '/admin/setup',
  adminAnalytics: '/admin/analytics',
  adminGrievances: '/admin/grievances',
  adminCounselling: '/admin/counselling',
  adminProfile: '/admin/profile',
};

export default ROUTES;
