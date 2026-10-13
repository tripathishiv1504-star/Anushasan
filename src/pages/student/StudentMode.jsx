import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Compass, ArrowLeft } from 'lucide-react';
import { OptionCard, Logo } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../routes/routeConfig';
import './StudentMode.css';

export function StudentMode() {
  const { user, selectStudyMode, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirection rules:
  // 1. Logged out -> /auth
  // 2. Not a student -> their role portal
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate(ROUTES.auth, { replace: true });
      } else if (user.role && user.role !== 'student') {
        navigate(user.role === 'mentor' ? ROUTES.mentorClasses : ROUTES.adminAnalytics, {
          replace: true,
        });
      }
    }
  }, [user, authLoading, navigate]);

  const handleSelectSolo = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await selectStudyMode('solo');
      navigate(ROUTES.studentDashboard);
    } catch (err) {
      console.error('Failed to select solo mode:', err);
      setIsSubmitting(false);
    }
  };

  const handleSelectClass = () => {
    navigate(ROUTES.studentJoinClass);
  };

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="student-mode-page">
      <div className="container student-mode-page__container">
        <header className="student-mode-header">
          <Logo size="md" />
          <h1 className="student-mode-title">Choose your study mode</h1>
          <p className="student-mode-subtitle">
            Select how you would like to organize your academic sessions on Anushasan.
          </p>
        </header>

        <main className="student-mode-grid" aria-label="Study mode options">
          {/* Card 1: Join a class */}
          <OptionCard
            title="Join a class"
            description="Connect to your mentor's class and see shared resources and attendance."
            icon={Users}
            variant="student"
            badgeText="Faculty Guided"
            disabled={isSubmitting}
            onClick={handleSelectClass}
          />

          {/* Card 2: Prepare solo */}
          <OptionCard
            title="Prepare solo"
            description="Study at your own pace with no mentor needed."
            icon={Compass}
            variant="teal"
            badgeText="Self-Paced"
            disabled={isSubmitting}
            onClick={handleSelectSolo}
          />
        </main>

        <footer className="student-mode-footer">
          <button
            type="button"
            className="student-mode-back-btn"
            onClick={() => navigate(ROUTES.selectRole)}
          >
            <ArrowLeft size={16} /> Switch role
          </button>
        </footer>
      </div>
    </div>
  );
}

export default StudentMode;
