import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { ROUTES } from './routeConfig';
import { Button, Card } from '../components/common';
import Landing from '../pages/public/Landing';
import Auth from '../pages/public/Auth';
import SelectRole from '../pages/public/SelectRole';
import StudentMode from '../pages/student/StudentMode';
import JoinClass from '../pages/student/JoinClass';
import Dashboard from '../pages/student/Dashboard';
import StudyTracker from '../pages/student/StudyTracker';
import HabitsGoals from '../pages/student/HabitsGoals';
import Library from '../pages/student/Library';
import Attendance from '../pages/student/Attendance';
import Grievances from '../pages/student/Grievances';
import Report from '../pages/student/Report';
import Profile from '../pages/student/Profile';
import Classes from '../pages/mentor/Classes';
import ClassDashboard from '../pages/mentor/ClassDashboard';
import Alerts from '../pages/mentor/Alerts';
import UploadResources from '../pages/mentor/UploadResources';
import MarkAttendance from '../pages/mentor/MarkAttendance';
import MentorGrievances from '../pages/mentor/Grievances';
import MentorProfile from '../pages/mentor/MentorProfile';
import DepartmentSetup from '../pages/admin/DepartmentSetup';
import AdminProfile from '../pages/admin/AdminProfile';
import Analytics from '../pages/admin/Analytics';
import AdminGrievances from '../pages/admin/AdminGrievances';
import Counselling from '../pages/admin/Counselling';
import ProtectedRoute from './ProtectedRoute';
import AppShell from '../components/layout/AppShell';

/**
 * Not Found page component
 */
function NotFoundPage() {
  return (
    <div className="container" style={{ paddingTop: 'var(--space-9)', textAlign: 'center' }}>
      <Card padding="lg" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: 'var(--space-2)' }}>404 - Page Not Found</h1>
        <p className="text-muted" style={{ marginBottom: 'var(--space-5)' }}>
          The requested route does not exist.
        </p>
        <Link to={ROUTES.landing}>
          <Button variant="primary">Return Home</Button>
        </Link>
      </Card>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path={ROUTES.landing} element={<Landing />} />
      <Route path={ROUTES.auth} element={<Auth />} />

      {/* Role Selection & Onboarding (No Shell) */}
      <Route path={ROUTES.selectRole} element={<SelectRole />} />
      <Route path={ROUTES.studentMode} element={<StudentMode />} />
      <Route path={ROUTES.studentJoinClass} element={<JoinClass />} />

      {/* Student Portal (Protected in AppShell) */}
      <Route
        path={ROUTES.studentDashboard}
        element={
          <ProtectedRoute allowedRole="student">
            <AppShell>
              <Dashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.studentStudy}
        element={
          <ProtectedRoute allowedRole="student">
            <AppShell>
              <StudyTracker />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.studentHabitsGoals}
        element={
          <ProtectedRoute allowedRole="student">
            <AppShell>
              <HabitsGoals />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.studentLibrary}
        element={
          <ProtectedRoute allowedRole="student">
            <AppShell>
              <Library />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.studentAttendance}
        element={
          <ProtectedRoute allowedRole="student" requiresClassMode>
            <AppShell>
              <Attendance />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.studentGrievances}
        element={
          <ProtectedRoute allowedRole="student" requiresClassMode>
            <AppShell>
              <Grievances />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.studentReport}
        element={
          <ProtectedRoute allowedRole="student">
            <AppShell>
              <Report />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.studentProfile}
        element={
          <ProtectedRoute allowedRole="student">
            <AppShell>
              <Profile />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Mentor Portal (Protected in AppShell) */}
      <Route
        path={ROUTES.mentorClasses}
        element={
          <ProtectedRoute allowedRole="mentor">
            <AppShell>
              <Classes />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.mentorClassDashboard}
        element={
          <ProtectedRoute allowedRole="mentor">
            <AppShell>
              <ClassDashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.mentorAlerts}
        element={
          <ProtectedRoute allowedRole="mentor">
            <AppShell>
              <Alerts />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.mentorUpload}
        element={
          <ProtectedRoute allowedRole="mentor">
            <AppShell>
              <UploadResources />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.mentorAttendance}
        element={
          <ProtectedRoute allowedRole="mentor">
            <AppShell>
              <MarkAttendance />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.mentorGrievances}
        element={
          <ProtectedRoute allowedRole="mentor">
            <AppShell>
              <MentorGrievances />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.mentorProfile}
        element={
          <ProtectedRoute allowedRole="mentor">
            <AppShell>
              <MentorProfile />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Admin Portal (Protected in AppShell) */}
      <Route
        path={ROUTES.adminSetup}
        element={
          <ProtectedRoute allowedRole="admin">
            <AppShell>
              <DepartmentSetup />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.adminAnalytics}
        element={
          <ProtectedRoute allowedRole="admin">
            <AppShell>
              <Analytics />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.adminGrievances}
        element={
          <ProtectedRoute allowedRole="admin">
            <AppShell>
              <AdminGrievances />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.adminCounselling}
        element={
          <ProtectedRoute allowedRole="admin">
            <AppShell>
              <Counselling />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.adminProfile}
        element={
          <ProtectedRoute allowedRole="admin">
            <AppShell>
              <AdminProfile />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Catch-all 404 */}
      <Route path={ROUTES.notFound} element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;

