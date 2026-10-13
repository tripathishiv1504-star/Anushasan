import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { X, LogOut, User, Compass } from 'lucide-react';
import { Logo, Badge, Button } from '../common';
import { useAuth } from '../../context/AuthContext';
import { getNavItemsForUser } from '../../config/navigation';
import { ROUTES } from '../../routes/routeConfig';
import { mentorService } from '../../services/mentorService';
import './MobileNav.css';

export function MobileNav({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = getNavItemsForUser(user);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    if (user?.role === 'mentor') {
      const updateCount = () => {
        mentorService
          .getActiveAlertsCount(user.id || 'user_mentor_1')
          .then(setAlertCount)
          .catch((err) => console.warn('Failed to get alerts count:', err));
      };
      updateCount();
      window.addEventListener('anushasan:alerts_updated', updateCount);
      return () => window.removeEventListener('anushasan:alerts_updated', updateCount);
    }
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate(ROUTES.landing);
  };

  const roleLabel =
    user?.role === 'student'
      ? user?.study_mode === 'class'
        ? 'Student (Class)'
        : 'Student (Solo)'
      : user?.role === 'mentor'
      ? 'Faculty Mentor'
      : user?.role === 'admin'
      ? 'Admin Authority'
      : 'User';

  return (
    <div className="mobile-nav-backdrop" onClick={onClose} role="presentation">
      <div
        className="mobile-nav-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Drawer"
      >
        <div className="mobile-nav__header">
          <Logo size="sm" />
          <button
            type="button"
            className="mobile-nav__close"
            onClick={onClose}
            aria-label="Close navigation drawer"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mobile-nav__nav">
          <ul className="mobile-nav__list">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `mobile-nav__link ${isActive ? 'mobile-nav__link--active' : ''}`
                    }
                  >
                    <Icon size={20} className="mobile-nav__icon" />
                    <span>{item.label}</span>
                    {item.path === ROUTES.mentorAlerts && alertCount > 0 && (
                      <span className="sidebar__badge-pill" style={{ marginLeft: 'auto' }}>
                        {alertCount}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mobile-nav__footer">
          <div className="mobile-nav__user">
            <div className="mobile-nav__avatar">
              {user?.full_name
                ? user.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'U'}
            </div>
            <div className="mobile-nav__user-details">
              <span className="mobile-nav__user-name">{user?.full_name}</span>
              <span className="mobile-nav__user-role">{roleLabel}</span>
            </div>
          </div>

          <div className="mobile-nav__actions">
            {user?.role === 'student' && (
              <button
                type="button"
                className="mobile-nav__action-btn"
                onClick={() => {
                  onClose();
                  navigate(ROUTES.studentMode);
                }}
              >
                <Compass size={16} /> Switch Study Mode
              </button>
            )}

            <button
              type="button"
              className="mobile-nav__action-btn mobile-nav__action-btn--danger"
              onClick={handleLogout}
            >
              <LogOut size={16} /> Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileNav;
