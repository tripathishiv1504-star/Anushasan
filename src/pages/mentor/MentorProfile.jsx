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
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../routes/routeConfig';
import { mentorService } from '../../services/mentorService';
import Button from '../../components/common/Button';
import './MentorProfile.css';

export function MentorProfile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const mentorId = user?.id || 'user_mentor_1';

  // Profile fields state
  const [fullName, setFullName] = useState(user?.full_name || 'Prof. Rajesh Verma');
  const [department, setDepartment] = useState('Department of Computer Science & Engineering');
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
  const initials = (fullName || 'Mentor')
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
      await mentorService.updateMentorProfile({
        mentorId,
        fullName: fullName.trim(),
        departmentId: 'dept_cs',
      });

      // Update context session
      await updateProfile({
        full_name: fullName.trim(),
      });

      setProfileSuccess('Profile updated successfully! Class cards now reflect your updated name.');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to update mentor profile:', err);
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
      await mentorService.changePassword(mentorId, {
        currentPassword,
        newPassword,
      });

      setPasswordSuccess('Password changed successfully! Keep your new credentials secure.');
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
    <div className="mentor-profile">
      {/* Header */}
      <div className="mentor-profile__header">
        <h1>Mentor Profile</h1>
        <p className="mentor-profile__subtitle">
          Manage your faculty identity, departmental information, and account security.
        </p>
      </div>

      {/* Hero Overview Card */}
      <div className="mentor-profile__hero-card">
        <div className="mentor-profile__avatar">{initials}</div>
        <div className="mentor-profile__hero-info">
          <h2 className="mentor-profile__hero-name">{user?.full_name || fullName}</h2>
          <div className="mentor-profile__hero-meta">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Mail size={14} />
              <span>{user?.email || 'mentor@campus.edu'}</span>
            </span>
            <span>•</span>
            <span className="mentor-profile__badge">
              <Shield size={12} />
              <span>Faculty Mentor</span>
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Building size={14} />
              <span>Dept. of CS&E</span>
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Edit Profile Name */}
      <div className="mentor-profile__section-card">
        <div className="mentor-profile__section-header">
          <div className="mentor-profile__section-icon">
            <User size={18} />
          </div>
          <div>
            <h3 className="mentor-profile__section-title">Faculty Details</h3>
            <p className="mentor-profile__section-desc">
              Your name is shown to students on class cards and course resources.
            </p>
          </div>
        </div>

        {profileSuccess && (
          <div className="mentor-profile__banner mentor-profile__banner--success" role="alert">
            <CheckCircle2 size={16} />
            <span>{profileSuccess}</span>
          </div>
        )}
        {profileError && (
          <div className="mentor-profile__banner mentor-profile__banner--error" role="alert">
            <AlertTriangle size={16} />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="mentor-profile__form">
          <div className="mentor-profile__field">
            <label htmlFor="mentor-name" className="mentor-profile__label">
              Full Name
            </label>
            <input
              id="mentor-name"
              type="text"
              className="mentor-profile__input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="mentor-profile__field">
            <label htmlFor="mentor-email" className="mentor-profile__label">
              Official Campus Email
            </label>
            <input
              id="mentor-email"
              type="email"
              className="mentor-profile__input"
              value={user?.email || 'mentor@campus.edu'}
              disabled
            />
            <span className="mentor-profile__hint">
              Campus email is linked to institutional SSO and cannot be modified directly.
            </span>
          </div>

          <div className="mentor-profile__field">
            <label htmlFor="mentor-dept" className="mentor-profile__label">
              Department
            </label>
            <input
              id="mentor-dept"
              type="text"
              className="mentor-profile__input"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          <div className="mentor-profile__actions">
            <Button
              type="submit"
              variant="primary"
              loading={isSavingProfile}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Section 2: Change Password */}
      <div className="mentor-profile__section-card">
        <div className="mentor-profile__section-header">
          <div className="mentor-profile__section-icon">
            <Key size={18} />
          </div>
          <div>
            <h3 className="mentor-profile__section-title">Change Password</h3>
            <p className="mentor-profile__section-desc">
              Update your account credentials to keep your classroom records secure.
            </p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="mentor-profile__banner mentor-profile__banner--success" role="alert">
            <CheckCircle2 size={16} />
            <span>{passwordSuccess}</span>
          </div>
        )}
        {passwordError && (
          <div className="mentor-profile__banner mentor-profile__banner--error" role="alert">
            <AlertTriangle size={16} />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="mentor-profile__form">
          <div className="mentor-profile__field">
            <label htmlFor="curr-pwd" className="mentor-profile__label">
              Current Password
            </label>
            <input
              id="curr-pwd"
              type="password"
              className="mentor-profile__input"
              placeholder="Enter current password (demo: Password123)"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="mentor-profile__field">
            <label htmlFor="new-pwd" className="mentor-profile__label">
              New Password
            </label>
            <input
              id="new-pwd"
              type="password"
              className="mentor-profile__input"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="mentor-profile__field">
            <label htmlFor="confirm-pwd" className="mentor-profile__label">
              Confirm New Password
            </label>
            <input
              id="confirm-pwd"
              type="password"
              className="mentor-profile__input"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="mentor-profile__actions">
            <Button
              type="submit"
              variant="secondary"
              loading={isSavingPassword}
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* Section 3: Session Actions */}
      <div className="mentor-profile__section-card">
        <div className="mentor-profile__logout-row">
          <div className="mentor-profile__logout-info">
            <h4>Active Faculty Session</h4>
            <p>Sign out of Anushasan on this device when you finish grading or lecturing.</p>
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

export default MentorProfile;
