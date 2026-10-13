import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, ShieldAlert, LogOut } from 'lucide-react';
import { OptionCard, Logo } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../routes/routeConfig';
import { getRoleDestination } from './Auth';
import './SelectRole.css';

export function SelectRole() {
  const { user, selectRole, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Redirect rules (point 6):
  // 1. Logged out -> /auth
  // 2. Logged in and already has role -> portal home
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate(ROUTES.auth, { replace: true });
      } else if (user.role) {
        navigate(getRoleDestination(user), { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  const handleSelectRole = async (role) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSelectedRole(role);

    try {
      await selectRole(role);

      if (role === 'student') {
        navigate(ROUTES.studentMode);
      } else if (role === 'mentor') {
        navigate(ROUTES.mentorClasses);
      } else if (role === 'admin') {
        navigate(ROUTES.adminAnalytics);
      }
    } catch (err) {
      console.error('Failed to save role:', err);
      setIsSubmitting(false);
      setSelectedRole(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.landing);
  };

  if (authLoading || (user && user.role)) {
    return null;
  }

  const userName = user?.full_name ? user.full_name.split(' ')[0] : 'there';

  return (
    <div className="select-role-page">
      <div className="container select-role-page__container">
        <header className="select-role-header">
          <Logo size="md" />
          <span className="select-role-greeting">Welcome, {userName}!</span>
          <h1 className="select-role-title">Who are you?</h1>
          <p className="select-role-subtitle">
            Choose your portal to set up your tailored workspace.
          </p>
        </header>

        <main className="select-role-grid" aria-label="Role selection options">
          {/* Card 1: Student Portal */}
          <OptionCard
            title="Student portal"
            description="Track study, build habits, use a class or go solo."
            icon={GraduationCap}
            variant="student"
            badgeText="Learner"
            disabled={isSubmitting}
            onClick={() => handleSelectRole('student')}
          />

          {/* Card 2: Mentor Portal */}
          <OptionCard
            title="Mentor portal"
            description="Guide classes, share resources, spot students who need help."
            icon={Users}
            variant="mentor"
            badgeText="Faculty"
            disabled={isSubmitting}
            onClick={() => handleSelectRole('mentor')}
          />

          {/* Card 3: Admin Authority Portal */}
          <OptionCard
            title="Admin authority portal"
            description="Department view, analytics, support planning."
            icon={ShieldAlert}
            variant="admin"
            badgeText="Administration"
            disabled={isSubmitting}
            onClick={() => handleSelectRole('admin')}
          />
        </main>

        <footer className="select-role-footer">
          <button
            type="button"
            className="select-role-logout-btn"
            onClick={handleLogout}
            aria-label="Log out and return to home"
          >
            <LogOut size={16} /> Log out
          </button>
        </footer>
      </div>
    </div>
  );
}

export default SelectRole;
