import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Menu, User, LogOut, ChevronDown, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../routes/routeConfig';
import { Badge } from '../common';
import './Topbar.css';

/**
 * Map routes to descriptive page titles
 */
function getPageTitle(pathname) {
  if (pathname.includes('/student/dashboard')) return 'Student Dashboard';
  if (pathname.includes('/student/study')) return 'Study Tracker';
  if (pathname.includes('/student/habits-goals')) return 'Habits & Goals';
  if (pathname.includes('/student/library')) return 'Resource Library';
  if (pathname.includes('/student/attendance')) return 'Attendance & Timetable';
  if (pathname.includes('/student/grievances')) return 'Grievances';
  if (pathname.includes('/student/report')) return 'Weekly Growth Report';
  if (pathname.includes('/student/profile')) return 'Student Profile';
  if (pathname.includes('/mentor/classes')) return 'My Classes';
  if (pathname.includes('/mentor/alerts')) return 'Early-Risk Alerts';
  if (pathname.includes('/mentor/upload')) return 'Upload Resources';
  if (pathname.includes('/mentor/attendance')) return 'Mark Attendance';
  if (pathname.includes('/mentor/grievances')) return 'Resolve Grievances';
  if (pathname.includes('/mentor/profile')) return 'Mentor Profile';
  if (pathname.includes('/admin/setup')) return 'Department Setup';
  if (pathname.includes('/admin/analytics')) return 'Department Analytics';
  if (pathname.includes('/admin/grievances')) return 'Grievance Overview';
  if (pathname.includes('/admin/counselling')) return 'Counselling Plans';
  if (pathname.includes('/admin/profile')) return 'Admin Profile';
  return 'Dashboard';
}

export function Topbar({ onToggleMobileNav }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const pageTitle = getPageTitle(location.pathname);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate(ROUTES.landing);
  };

  const getProfileRoute = () => {
    if (user?.role === 'student') return ROUTES.studentProfile;
    if (user?.role === 'mentor') return ROUTES.mentorProfile;
    if (user?.role === 'admin') return ROUTES.adminProfile;
    return ROUTES.selectRole;
  };

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <header className="topbar">
      <div className="topbar__left">
        {/* Mobile menu trigger */}
        <button
          type="button"
          className="topbar__mobile-trigger"
          onClick={onToggleMobileNav}
          aria-label="Open mobile navigation drawer"
        >
          <Menu size={22} />
        </button>
        <h1 className="topbar__title">{pageTitle}</h1>
      </div>

      <div className="topbar__right" ref={dropdownRef}>
        <button
          type="button"
          className="topbar__avatar-btn"
          onClick={() => setDropdownOpen((prev) => !prev)}
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <div className="topbar__avatar">{initials}</div>
          <div className="topbar__user-meta">
            <span className="topbar__name">{user?.full_name || 'User'}</span>
            <span className="topbar__role-tag">
              {user?.role === 'student'
                ? user?.study_mode === 'class'
                  ? 'Class Mode'
                  : 'Solo Mode'
                : user?.role === 'mentor'
                ? 'Mentor'
                : 'Admin'}
            </span>
          </div>
          <ChevronDown size={16} className="topbar__chevron" />
        </button>

        {dropdownOpen && (
          <div className="topbar__dropdown" role="menu">
            <div className="topbar__dropdown-header">
              <span className="topbar__dropdown-name">{user?.full_name}</span>
              <span className="topbar__dropdown-email">{user?.email}</span>
            </div>

            <div className="topbar__dropdown-items">
              <Link
                to={getProfileRoute()}
                className="topbar__dropdown-item"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                <User size={16} /> Profile & Settings
              </Link>

              {user?.role === 'student' && (
                <Link
                  to={ROUTES.studentMode}
                  className="topbar__dropdown-item"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Compass size={16} /> Switch Study Mode
                </Link>
              )}

              <button
                type="button"
                className="topbar__dropdown-item topbar__dropdown-item--danger"
                role="menuitem"
                onClick={handleLogout}
              >
                <LogOut size={16} /> Log out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Topbar;
