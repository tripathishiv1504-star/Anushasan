import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Clock,
  Building,
  Shield,
  Key,
  Users,
  Compass,
  AlertTriangle,
  LogOut,
  Trash2,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../routes/routeConfig';
import { studentService } from '../../services/studentService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import './Profile.css';

export function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const studentId = user?.id || 'user_student_1';
  const studyMode = user?.study_mode || 'class';
  const isClassMode = studyMode === 'class';

  // Profile Form States
  const [fullName, setFullName] = useState(user?.full_name || 'Aarav Sharma');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(user?.daily_goal_minutes || 60);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Enrolled Classes State
  const [enrolledClasses, setEnrolledClasses] = useState([]);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Modal States
  const [isSwitchSoloModalOpen, setIsSwitchSoloModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Synchronize inputs when user auth context updates
  useEffect(() => {
    if (user?.full_name) setFullName(user.full_name);
    if (user?.daily_goal_minutes) setDailyGoalMinutes(user.daily_goal_minutes);
  }, [user]);

  // Load enrolled classes
  useEffect(() => {
    async function loadClasses() {
      try {
        const classes = await studentService.getEnrolledClasses(studentId);
        setEnrolledClasses(classes);
      } catch (err) {
        console.error('Failed to load student classes:', err);
      }
    }
    loadClasses();
  }, [studentId, studyMode]);

  // 1. Save Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      setProfileErrorMsg('Full name must be at least 2 characters long.');
      return;
    }

    try {
      setIsSavingProfile(true);
      const updatedUser = await updateProfile({
        full_name: fullName.trim(),
        daily_goal_minutes: Number(dailyGoalMinutes),
      });

      setProfileSuccessMsg('Profile updated successfully! Greeting and settings have been refreshed.');
      setTimeout(() => setProfileSuccessMsg(''), 4500);
    } catch (err) {
      setProfileErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 2. Switch to Solo Mode with Confirmation
  const handleConfirmSwitchToSolo = async () => {
    try {
      setIsActionLoading(true);
      await studentService.leaveClassAndSwitchToSolo(studentId);
      await updateProfile({ study_mode: 'solo' });
      setIsSwitchSoloModalOpen(false);
      setProfileSuccessMsg('Successfully switched to Solo Mode. Personal study data and tasks have been preserved.');
      setTimeout(() => setProfileSuccessMsg(''), 4500);
    } catch (err) {
      console.error('Failed to switch to solo mode:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  // 3. Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccessMsg('');
    setPasswordErrorMsg('');

    if (!currentPassword) {
      setPasswordErrorMsg('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('New passwords do not match. Please verify.');
      return;
    }

    try {
      setIsChangingPassword(true);
      await studentService.changePassword(studentId, {
        currentPassword,
        newPassword,
      });

      setPasswordSuccessMsg('Your password has been changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccessMsg(''), 4500);
    } catch (err) {
      setPasswordErrorMsg(err.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // 4. Log out
  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.auth);
  };

  // 5. Delete Account
  const handleConfirmDeleteAccount = async () => {
    try {
      setIsActionLoading(true);
      await studentService.deleteStudentAccount(studentId);
      setIsDeleteModalOpen(false);
      navigate(ROUTES.auth);
    } catch (err) {
      console.error('Failed to delete account:', err);
      setIsActionLoading(false);
    }
  };

  return (
    <div className="profile-page animate-fade-in">
      {/* Page Header */}
      <div className="profile-header">
        <div>
          <h1 className="profile-title">Account & Settings</h1>
          <p className="profile-desc">
            Manage your personal credentials, study mode preferences, and academic security.
          </p>
        </div>
      </div>

      {/* Profile Overview Banner */}
      <Card className="profile-hero-card">
        <div className="profile-hero-content">
          <div className="profile-avatar-medallion">
            <span className="profile-avatar-initials">
              {fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase() || 'ST'}
            </span>
          </div>

          <div className="profile-hero-details">
            <div className="profile-hero-name-row">
              <h2 className="profile-hero-name">{fullName}</h2>
              <Badge variant="primary" size="sm">Student</Badge>
              <Badge variant={isClassMode ? 'success' : 'neutral'} size="sm">
                {isClassMode ? 'Class Mode' : 'Solo Mode'}
              </Badge>
            </div>
            <p className="profile-hero-email">{user?.email || 'student@campus.edu'}</p>
            <div className="profile-hero-meta">
              <span className="profile-hero-meta-item">
                <Building size={13} /> Department of Computer Science & Engineering
              </span>
              <span className="profile-hero-meta-item">
                <Clock size={13} /> Daily Goal: {dailyGoalMinutes} mins
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="profile-grid">
        {/* Left Column: Personal Information & Study Mode */}
        <div className="profile-column">
          {/* 1. Personal Information */}
          <Card className="profile-section-card">
            <div className="profile-card-header">
              <User size={18} className="profile-card-header-icon" />
              <div>
                <h3 className="profile-card-title">Personal Information</h3>
                <p className="profile-card-desc">Edit your display name and daily target study duration.</p>
              </div>
            </div>

            {profileSuccessMsg && (
              <div className="profile-feedback-alert profile-feedback-alert--success" role="alert">
                <CheckCircle2 size={16} />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {profileErrorMsg && (
              <div className="profile-feedback-alert profile-feedback-alert--error" role="alert">
                <AlertTriangle size={16} />
                <span>{profileErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="profile-form">
              <Input
                id="profile-fullname"
                label="Full Name *"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />

              <div className="profile-form-group">
                <label htmlFor="profile-email" className="profile-form-label">
                  Email Address (Read-only)
                </label>
                <div className="profile-readonly-wrap">
                  <Input
                    id="profile-email"
                    value={user?.email || 'student@campus.edu'}
                    disabled
                    readOnly
                  />
                  <Lock size={14} className="profile-readonly-icon" />
                </div>
                <span className="profile-form-hint">
                  College institutional email address cannot be changed.
                </span>
              </div>

              <div className="profile-form-group">
                <label htmlFor="profile-daily-goal" className="profile-form-label">
                  Daily Study Goal (Minutes) *
                </label>
                <Select
                  id="profile-daily-goal"
                  value={dailyGoalMinutes}
                  onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
                >
                  <option value={30}>30 Minutes / day (Consistency baseline)</option>
                  <option value={45}>45 Minutes / day</option>
                  <option value={60}>60 Minutes / day (1 Hour - Recommended)</option>
                  <option value={90}>90 Minutes / day (1.5 Hours)</option>
                  <option value={120}>120 Minutes / day (2 Hours - Intensive)</option>
                  <option value={180}>180 Minutes / day (3 Hours)</option>
                </Select>
                <span className="profile-form-hint">
                  Used on your dashboard and study tracker to evaluate daily consistency.
                </span>
              </div>

              <div className="profile-form-actions">
                <Button type="submit" variant="primary" disabled={isSavingProfile}>
                  {isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </Button>
              </div>
            </form>
          </Card>

          {/* 2. Study Mode & Class Management */}
          <Card className="profile-section-card">
            <div className="profile-card-header">
              {isClassMode ? (
                <Users size={18} className="profile-card-header-icon" />
              ) : (
                <Compass size={18} className="profile-card-header-icon" />
              )}
              <div>
                <h3 className="profile-card-title">Study Mode & Class Enrollment</h3>
                <p className="profile-card-desc">Switch between mentored class mode and independent solo preparation.</p>
              </div>
            </div>

            <div className="profile-mode-content">
              {isClassMode ? (
                <div className="profile-mode-box profile-mode-box--class">
                  <div className="profile-mode-box-header">
                    <span className="profile-mode-pill profile-mode-pill--class">
                      Class Mode Active
                    </span>
                    <span className="profile-mode-count">
                      Enrolled in {enrolledClasses.length || 1} course(s)
                    </span>
                  </div>

                  <p className="profile-mode-text">
                    You are currently part of faculty-supervised courses. Your mentor tracks attendance,
                    uploads resource materials, and reviews academic grievances.
                  </p>

                  <div className="profile-enrolled-list">
                    {enrolledClasses.map((cls) => (
                      <div key={cls.id} className="profile-enrolled-item">
                        <div>
                          <strong>{cls.name}</strong>
                          <span className="profile-enrolled-mentor">
                            [{cls.join_code}] • Mentor: {cls.mentor_name || 'Prof. Rajesh Verma'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {enrolledClasses.length === 0 && (
                      <div className="profile-enrolled-item">
                        <div>
                          <strong>Operating Systems & Architecture</strong>
                          <span className="profile-enrolled-mentor">
                            [CS301A] • Mentor: Prof. Rajesh Verma
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="profile-mode-action-row">
                    <Button
                      variant="outline"
                      onClick={() => setIsSwitchSoloModalOpen(true)}
                      className="profile-btn-switch"
                    >
                      Switch to Solo Mode
                    </Button>
                    <span className="profile-mode-action-hint">
                      Personal study logs and tasks will remain preserved.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="profile-mode-box profile-mode-box--solo">
                  <div className="profile-mode-box-header">
                    <span className="profile-mode-pill profile-mode-pill--solo">
                      Solo Mode Active
                    </span>
                  </div>

                  <p className="profile-mode-text">
                    You are preparing independently without mentor supervision. Your discipline score is
                    computed 100% from your personal study consistency, tasks, and habits.
                  </p>

                  <div className="profile-mode-action-row">
                    <Button
                      variant="primary"
                      icon={ArrowRight}
                      onClick={() => navigate(ROUTES.studentJoinClass)}
                    >
                      Join a Class
                    </Button>
                    <span className="profile-mode-action-hint">
                      Enter a 6-character class code from your mentor.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Password & Danger Zone */}
        <div className="profile-column">
          {/* 3. Password Security */}
          <Card className="profile-section-card">
            <div className="profile-card-header">
              <Key size={18} className="profile-card-header-icon" />
              <div>
                <h3 className="profile-card-title">Change Password</h3>
                <p className="profile-card-desc">Update your credentials to keep your student account secure.</p>
              </div>
            </div>

            {passwordSuccessMsg && (
              <div className="profile-feedback-alert profile-feedback-alert--success" role="alert">
                <CheckCircle2 size={16} />
                <span>{passwordSuccessMsg}</span>
              </div>
            )}

            {passwordErrorMsg && (
              <div className="profile-feedback-alert profile-feedback-alert--error" role="alert">
                <AlertTriangle size={16} />
                <span>{passwordErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="profile-form">
              <Input
                id="current-password"
                type="password"
                label="Current Password *"
                placeholder="Enter current password (demo: Password123)"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <Input
                id="new-password"
                type="password"
                label="New Password *"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Input
                id="confirm-password"
                type="password"
                label="Confirm New Password *"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <div className="profile-form-actions">
                <Button type="submit" variant="outline" disabled={isChangingPassword}>
                  {isChangingPassword ? 'Updating Password...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </Card>

          {/* 4. Danger Zone & Account Termination */}
          <Card className="profile-section-card profile-section-card--danger">
            <div className="profile-card-header">
              <AlertTriangle size={18} className="profile-card-header-icon profile-card-header-icon--danger" />
              <div>
                <h3 className="profile-card-title text-danger">Account Actions</h3>
                <p className="profile-card-desc">Sign out or terminate your student account and wipe local records.</p>
              </div>
            </div>

            <div className="profile-danger-actions">
              <div className="profile-danger-row">
                <div>
                  <strong className="profile-danger-action-title">Log Out</strong>
                  <p className="profile-danger-action-desc">
                    Terminate the active session on this device. You can log back in at any time.
                  </p>
                </div>
                <Button variant="outline" icon={LogOut} onClick={handleLogout}>
                  Log Out
                </Button>
              </div>

              <div className="profile-danger-divider" />

              <div className="profile-danger-row">
                <div>
                  <strong className="profile-danger-action-title text-danger">Delete Account</strong>
                  <p className="profile-danger-action-desc">
                    Permanently delete your profile, study sessions, streak, tasks, and achievements.
                  </p>
                </div>
                <Button
                  variant="danger"
                  icon={Trash2}
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal: Switch to Solo Mode */}
      <Modal
        isOpen={isSwitchSoloModalOpen}
        onClose={() => !isActionLoading && setIsSwitchSoloModalOpen(false)}
        title="Switch to Solo Mode?"
        size="md"
      >
        <div className="profile-modal-body">
          <div className="profile-modal-alert">
            <AlertTriangle size={20} className="profile-modal-alert-icon" />
            <div>
              <strong>Academic Notice</strong>
              <p>
                You are about to leave class-supervised mode. Attendance records and grievances will
                be hidden from your portal.
              </p>
            </div>
          </div>

          <p className="profile-modal-text">
            All your personal study sessions, stopwatch logs, tasks, habits, goals, and personal
            resource uploads will be <strong>fully preserved</strong>.
          </p>
          <p className="profile-modal-text">
            You can rejoin a class at any time by entering a class join code from your mentor.
          </p>

          <div className="profile-modal-actions">
            <Button
              variant="ghost"
              onClick={() => setIsSwitchSoloModalOpen(false)}
              disabled={isActionLoading}
            >
              Keep Class Mode
            </Button>
            <Button
              variant="warning"
              onClick={handleConfirmSwitchToSolo}
              disabled={isActionLoading}
            >
              {isActionLoading ? 'Switching Mode...' : 'Confirm & Switch to Solo'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal: Delete Account */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isActionLoading && setIsDeleteModalOpen(false)}
        title="Permanently Delete Account?"
        size="md"
      >
        <div className="profile-modal-body">
          <div className="profile-modal-alert profile-modal-alert--danger">
            <Trash2 size={20} className="profile-modal-alert-icon text-danger" />
            <div>
              <strong className="text-danger">Irreversible Action</strong>
              <p>
                This will immediately purge your account profile, all recorded study sessions, streak history,
                tasks, habits, and unlocked milestone badges from this device.
              </p>
            </div>
          </div>

          <p className="profile-modal-text">
            Are you sure you want to permanently delete your Anushasan account?
          </p>

          <div className="profile-modal-actions">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDeleteAccount}
              disabled={isActionLoading}
            >
              {isActionLoading ? 'Deleting Account...' : 'Yes, Delete My Account'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Profile;
