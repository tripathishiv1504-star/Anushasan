import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Logo, Badge } from '../common';
import { useAuth } from '../../context/AuthContext';
import { getNavItemsForUser } from '../../config/navigation';
import { ROUTES } from '../../routes/routeConfig';
import { mentorService } from '../../services/mentorService';
import './Sidebar.css';

export function Sidebar({ className = '' }) {
  const { user } = useAuth();
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

  const roleLabel =
    user?.role === 'student'
      ? user?.study_mode === 'class'
        ? 'Student (Class)'
        : 'Student (Solo)'
      : user?.role === 'mentor'
      ? 'Faculty Mentor'
      : user?.role === 'admin'
      ? 'Admin Authority'
      : 'Campus User';

  const badgeVariant =
    user?.role === 'student'
      ? 'success'
      : user?.role === 'mentor'
      ? 'info'
      : user?.role === 'admin'
      ? 'danger'
      : 'neutral';

  return (
    <aside className={`sidebar ${className}`} aria-label="Portal Sidebar Navigation">
      <div className="sidebar__top">
        <Link to={user?.role === 'student' ? ROUTES.studentDashboard : user?.role === 'mentor' ? ROUTES.mentorClasses : ROUTES.adminAnalytics} className="sidebar__logo-link">
          <Logo size="md" />
        </Link>
      </div>

      <nav className="sidebar__nav">
        <span className="sidebar__section-title">Navigation</span>
        <ul className="sidebar__menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path} className="sidebar__menu-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                >
                  <Icon size={20} className="sidebar__icon" />
                  <span className="sidebar__label">{item.label}</span>
                  {item.path === ROUTES.mentorAlerts && alertCount > 0 && (
                    <span className="sidebar__badge-pill" aria-label={`${alertCount} active alerts`}>
                      {alertCount}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar__bottom">
        <div className="sidebar__user-card">
          <div className="sidebar__user-avatar">
            {user?.full_name
              ? user.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : 'U'}
          </div>
          <div className="sidebar__user-info">
            <span className="sidebar__user-name" title={user?.full_name}>
              {user?.full_name || 'Campus User'}
            </span>
            <Badge variant={badgeVariant} size="sm">
              {roleLabel}
            </Badge>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
