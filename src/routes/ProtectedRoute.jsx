import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from './routeConfig';
import { LoadingState } from '../components/common';

/**
 * Route protection guard enforcing role and mode boundaries.
 * @param {React.ReactNode} children
 * @param {'student' | 'mentor' | 'admin'} allowedRole
 * @param {boolean} requiresClassMode
 */
export function ProtectedRoute({
  children,
  allowedRole,
  requiresClassMode = false,
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState message="Verifying session credentials..." minHeight="100vh" />;
  }

  // Rule 1: Logged out -> redirect to /auth
  if (!user) {
    return <Navigate to={ROUTES.auth} replace />;
  }

  // Rule 2: Logged in without a role -> redirect to /select-role
  if (!user.role) {
    return <Navigate to={ROUTES.selectRole} replace />;
  }

  // Rule 3: Wrong role for the route -> redirect to user's own portal home
  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'student') {
      return (
        <Navigate
          to={user.study_mode ? ROUTES.studentDashboard : ROUTES.studentMode}
          replace
        />
      );
    }
    if (user.role === 'mentor') {
      return <Navigate to={ROUTES.mentorClasses} replace />;
    }
    if (user.role === 'admin') {
      return <Navigate to={ROUTES.adminAnalytics} replace />;
    }
    return <Navigate to={ROUTES.selectRole} replace />;
  }

  // Rule 4: Student without a mode -> redirect to /student/mode
  if (user.role === 'student' && !user.study_mode) {
    return <Navigate to={ROUTES.studentMode} replace />;
  }

  // Rule 5: Solo student opening a class-mode-only route -> redirect to /student/dashboard
  if (user.role === 'student' && requiresClassMode && user.study_mode !== 'class') {
    return <Navigate to={ROUTES.studentDashboard} replace />;
  }

  return children;
}

export default ProtectedRoute;
