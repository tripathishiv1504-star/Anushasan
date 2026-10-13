import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Building,
  Key,
  Shield,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../routes/routeConfig';
import { adminService } from '../../services/adminService';
import Button from '../../components/common/Button';
import './AdminProfile.css';

export function AdminProfile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const adminId = user?.id || 'user_admin_1';

  // Profile fields state
  const [fullName, setFullName] = useState(user?.full_name || 'Dr. Sunita Rao');
  const [designation, setDesignation] = useState('Head of Department (CSE)');
  const [departmentName, setDepartmentName] = useState('Computer Science & Engineering');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user?.full_name) {
      setFullName(user.full_name);
    }
  }, [user]);

  // Compute initials
  const initials = (fullName || 'Admin')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');

  // 1. Handle Save Profile Name
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      setProfileError('Full name must be at least 2 characters long.');
      return;
    }

    try {
      setIsSavingProfile(true);
      await adminService.updateAdminProfile({
        adminId,
        fullName: fullName.trim(),
        departmentId: 'dept_cs',
      });

      // Update auth context session
      await updateProfile({
        full_name: fullName.trim(),
      });

      setProfileSuccess('Administrator profile updated successfully! Changes saved across the portal.');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to update admin profile:', err);
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 2. Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match. Please re-enter.');
      return;
    }

    try {
      setIsSavingPassword(true);
      await adminService.changeAdminPassword(adminId, {
        currentPassword,
        newPassword,
      });

      setPasswordSuccess('Password updated successfully! Your administrative account remains secure.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 4500);
    } catch (err) {
      console.error('Failed to change password:', err);
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // 3. Handle Log Out
  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="admin-profile">
      {/* Header */}
      <div className="admin-profile__header">
        <div>
          <h1 className="admin-profile__title">Administrator Profile</h1>
          <p className="admin-profile__subtitle">
            Manage your departmental administrative identity, credentials, and institutional access.
          </p>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="admin-profile__hero-card">
        <div className="admin-profile__avatar">{initials}</div>
        <div className="admin-profile__hero-info">
          <h2 className="admin-profile__hero-name">{user?.full_name || fullName}</h2>
          <div className="admin-profile__hero-meta">
            <span className="admin-profile__meta-item">
              <Mail size={14} />
              <span>{user?.email || 'admin@campus.edu'}</span>
            </span>
            <span>•</span>
            <span className="admin-profile__badge">
              <Shield size={12} />
              <span>Campus Administrator</span>
            </span>
            <span>•</span>
            <span className="admin-profile__meta-item">
              <Building size={14} />
              <span>Dept. of CS&E</span>
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Edit Profile Name */}
      <div className="admin-profile__section-card">
        <div className="admin-profile__section-header">
          <div className="admin-profile__section-icon">
            <User size={18} />
          </div>
          <div>
            <h3 className="admin-profile__section-title">Administrator Details</h3>
            <p className="admin-profile__section-desc">
              Your name and departmental role are displayed on administrative audit logs and official grievance resolutions.
            </p>
          </div>
        </div>

        {profileSuccess && (
          <div className="admin-profile__banner admin-profile__banner--success" role="alert">
            <CheckCircle2 size={16} />
            <span>{profileSuccess}</span>
          </div>
        )}
        {profileError && (
          <div className="admin-profile__banner admin-profile__banner--error" role="alert">
            <AlertTriangle size={16} />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="admin-profile__form">
          <div className="admin-profile__field">
            <label htmlFor="admin-name" className="admin-profile__label">
              Full Name (with Title)
            </label>
            <input
              id="admin-name"
              type="text"
              className="admin-profile__input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="admin-profile__field">
            <label htmlFor="admin-email" className="admin-profile__label">
              Official Campus Email
            </label>
            <input
              id="admin-email"
              type="email"
              className="admin-profile__input"
              value={user?.email || 'admin@campus.edu'}
              disabled
            />
            <span className="admin-profile__hint">
              Institutional administrator address configured during campus provisioning.
            </span>
          </div>

          <div className="admin-profile__row-fields">
            <div className="admin-profile__field">
              <label htmlFor="admin-designation" className="admin-profile__label">
                Academic Designation
              </label>
              <input
                id="admin-designation"
                type="text"
                className="admin-profile__input"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>

            <div className="admin-profile__field">
              <label htmlFor="admin-dept" className="admin-profile__label">
                Department Jurisdiction
              </label>
              <input
                id="admin-dept"
                type="text"
                className="admin-profile__input"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-profile__actions">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSavingProfile}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Section 2: Change Password */}
      <div className="admin-profile__section-card">
        <div className="admin-profile__section-header">
          <div className="admin-profile__section-icon">
            <Key size={18} />
          </div>
          <div>
            <h3 className="admin-profile__section-title">Change Password</h3>
            <p className="admin-profile__section-desc">
              Update your administrative credentials to maintain institution-wide governance security.
            </p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="admin-profile__banner admin-profile__banner--success" role="alert">
            <CheckCircle2 size={16} />
            <span>{passwordSuccess}</span>
          </div>
        )}
        {passwordError && (
          <div className="admin-profile__banner admin-profile__banner--error" role="alert">
            <AlertTriangle size={16} />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="admin-profile__form">
          <div className="admin-profile__field">
            <label htmlFor="admin-curr-pwd" className="admin-profile__label">
              Current Password
            </label>
            <input
              id="admin-curr-pwd"
              type="password"
              className="admin-profile__input"
              placeholder="Enter current password (demo: Password123)"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="admin-profile__field">
            <label htmlFor="admin-new-pwd" className="admin-profile__label">
              New Password
            </label>
            <input
              id="admin-new-pwd"
              type="password"
              className="admin-profile__input"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="admin-profile__field">
            <label htmlFor="admin-confirm-pwd" className="admin-profile__label">
              Confirm New Password
            </label>
            <input
              id="admin-confirm-pwd"
              type="password"
              className="admin-profile__input"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="admin-profile__actions">
            <Button
              type="submit"
              variant="secondary"
              isLoading={isSavingPassword}
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* Section 3: Session Actions */}
      <div className="admin-profile__section-card">
        <div className="admin-profile__logout-row">
          <div className="admin-profile__logout-info">
            <h4 className="admin-profile__logout-title">Active Administrator Session</h4>
            <p className="admin-profile__logout-desc">
              Sign out of Anushasan when you have finished department management and configuration.
            </p>
          </div>

          <Button
            variant="ghost"
            icon={LogOut}
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
