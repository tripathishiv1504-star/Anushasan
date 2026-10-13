import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Logo, Card, Input, Button } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../routes/routeConfig';
import { isValidEmail, isValidPassword, isRequired } from '../../utils/validators';
import './Auth.css';

/**
 * Determine portal destination based on role and study_mode
 */
export function getRoleDestination(user) {
  if (!user || !user.role) {
    return ROUTES.selectRole;
  }
  if (user.role === 'student') {
    return user.study_mode ? ROUTES.studentDashboard : ROUTES.studentMode;
  }
  if (user.role === 'mentor') {
    return ROUTES.mentorClasses;
  }
  if (user.role === 'admin') {
    return ROUTES.adminAnalytics;
  }
  return ROUTES.selectRole;
}

export function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login, signup, logout, isLoading: authLoading } = useAuth();

  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const isSignup = mode === 'signup';
  const roleParam = searchParams.get('role');

  // Don't hijack browser back navigation if user has already logged in.
  // The active session banner clearly presents "Go to Portal" and "Log out" controls.

  // Pre-fill role-specific credentials when navigating with role query parameter
  useEffect(() => {
    if (roleParam === 'mentor') {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || 'mentor@campus.edu',
        password: prev.password || 'Password123',
      }));
    } else if (roleParam === 'admin') {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || 'admin@campus.edu',
        password: prev.password || 'Password123',
      }));
    } else if (roleParam === 'solo') {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || 'solo@campus.edu',
        password: prev.password || 'Password123',
      }));
    } else if (roleParam === 'student') {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || 'student@campus.edu',
        password: prev.password || 'Password123',
      }));
    }
  }, [roleParam]);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Switch between Login and Signup modes
  const handleSwitchMode = (newMode) => {
    setServerError('');
    setErrors({});
    setTouched({});
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('mode', newMode);
      return next;
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error as user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    let error = '';

    if (field === 'fullName' && isSignup) {
      if (!isRequired(value)) {
        error = 'Please enter your full name.';
      } else if (value.trim().length < 2) {
        error = 'Name must be at least 2 characters.';
      }
    }

    if (field === 'email') {
      if (!isRequired(value)) {
        error = 'Email address is required.';
      } else if (!isValidEmail(value)) {
        error = 'Please enter a valid email address (e.g. name@campus.edu).';
      }
    }

    if (field === 'password') {
      if (!isRequired(value)) {
        error = 'Password is required.';
      } else if (isSignup && !isValidPassword(value, 8)) {
        error = 'Password must be at least 8 characters long.';
      }
    }

    if (field === 'confirmPassword' && isSignup) {
      if (!isRequired(value)) {
        error = 'Please confirm your password.';
      } else if (value !== formData.password) {
        error = 'Passwords do not match.';
      }
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error;
  };

  const validateAll = () => {
    const fieldsToValidate = isSignup
      ? ['fullName', 'email', 'password', 'confirmPassword']
      : ['email', 'password'];

    const newErrors = {};
    let isValid = true;

    fieldsToValidate.forEach((f) => {
      const err = validateField(f, formData[f]);
      if (err) {
        newErrors[f] = err;
        isValid = false;
      }
    });

    setTouched(
      fieldsToValidate.reduce((acc, f) => ({ ...acc, [f]: true }), {})
    );
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    try {
      let resultUser;
      if (isSignup) {
        resultUser = await signup({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        });
      } else {
        resultUser = await login(formData.email, formData.password);
      }

      // Navigate to designated portal or role selection
      const destination = getRoleDestination(resultUser);
      navigate(destination);
    } catch (err) {
      setServerError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill demo account credentials or instant 1-click login
  const handleQuickDemo = async (demoEmail, autoSubmit = false) => {
    handleSwitchMode('login');
    setFormData({
      fullName: '',
      email: demoEmail,
      password: 'Password123',
      confirmPassword: '',
    });
    setErrors({});
    setServerError('');

    if (autoSubmit) {
      setIsSubmitting(true);
      try {
        const resultUser = await login(demoEmail, 'Password123');
        const destination = getRoleDestination(resultUser);
        navigate(destination);
      } catch (err) {
        setServerError(err.message || 'Authentication failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__container">
        {/* Left Column: Brand Panel (Desktop only) */}
        <aside className="auth-brand" aria-label="Anushasan Brand Summary">
          <Link to={ROUTES.landing} className="auth-brand__back">
            <ArrowLeft size={16} /> Back to homepage
          </Link>

          <div className="auth-brand__header">
            <Logo size="lg" withTagline />
          </div>

          <div className="auth-brand__benefits">
            <div className="auth-brand__benefit">
              <CheckCircle2 size={20} className="auth-brand__icon" />
              <div>
                <h4 className="auth-brand__benefit-title">Measured Daily Discipline</h4>
                <p className="auth-brand__benefit-desc">
                  Quantify your daily focus hours, habit consistency, and task deadlines into a clear score.
                </p>
              </div>
            </div>

            <div className="auth-brand__benefit">
              <CheckCircle2 size={20} className="auth-brand__icon" />
              <div>
                <h4 className="auth-brand__benefit-title">Transparent Mentorship</h4>
                <p className="auth-brand__benefit-desc">
                  Connect directly with faculty courses, official notes, PYQ papers, and attendance tracking.
                </p>
              </div>
            </div>

            <div className="auth-brand__benefit">
              <CheckCircle2 size={20} className="auth-brand__icon" />
              <div>
                <h4 className="auth-brand__benefit-title">Self-Paced Solo Option</h4>
                <p className="auth-brand__benefit-desc">
                  Study independently anytime without requiring class codes or faculty administration.
                </p>
              </div>
            </div>
          </div>

          <div className="auth-brand__footer">
            <p className="auth-brand__quote">
              &ldquo;Consistency, measured. Growth, guided.&rdquo;
            </p>
          </div>
        </aside>

        {/* Right Column: Form Card */}
        <main className="auth-card-section">
          {/* Mobile Logo & Back Link */}
          <div className="auth-mobile-header">
            <Link to={ROUTES.landing} className="auth-mobile-back">
              <ArrowLeft size={16} /> Home
            </Link>
            <Logo size="sm" />
          </div>

          <Card padding="lg" className="auth-card">
            {/* Mode Switcher */}
            <div className="auth-switcher" role="tablist" aria-label="Authentication Type">
              <button
                type="button"
                role="tab"
                aria-selected={!isSignup}
                className={`auth-switcher__tab ${!isSignup ? 'auth-switcher__tab--active' : ''}`}
                onClick={() => handleSwitchMode('login')}
              >
                Log in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isSignup}
                className={`auth-switcher__tab ${isSignup ? 'auth-switcher__tab--active' : ''}`}
                onClick={() => handleSwitchMode('signup')}
              >
                Sign up
              </button>
            </div>

            {/* Active Session Info Banner if already logged in */}
            {user && (
              <div className="auth-session-banner">
                <div className="auth-session-banner__text">
                  Signed in as <strong>{user.full_name || user.email}</strong>{' '}
                  <span className="auth-session-banner__role">({user.role || 'Member'})</span>
                </div>
                <div className="auth-session-banner__actions">
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={() => navigate(getRoleDestination(user))}
                  >
                    Go to Portal
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await logout();
                      setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
                      setServerError('');
                    }}
                  >
                    Log out
                  </Button>
                </div>
              </div>
            )}

            <div className="auth-card__heading">
              <h2>
                {isSignup
                  ? 'Create your account'
                  : roleParam === 'mentor'
                  ? 'Faculty Mentor Login'
                  : roleParam === 'admin'
                  ? 'Administrator Login'
                  : roleParam === 'student' || roleParam === 'solo'
                  ? 'Student Portal Login'
                  : 'Welcome back'}
              </h2>
              <p className="text-muted">
                {isSignup
                  ? 'Enter your details to begin tracking campus consistency.'
                  : roleParam === 'mentor'
                  ? 'Sign in to access your classes, student alerts, and curriculum resources.'
                  : roleParam === 'admin'
                  ? 'Sign in to monitor campus consistency, analytics, and departmental oversight.'
                  : 'Enter your credentials to access your portal.'}
              </p>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div className="auth-error-banner" role="alert">
                <AlertTriangle size={18} className="auth-error-banner__icon" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="auth-form">
              {isSignup && (
                <Input
                  label="Full Name"
                  id="auth-fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  error={touched.fullName ? errors.fullName : ''}
                  placeholder="e.g. Aarav Sharma"
                  required
                />
              )}

              <Input
                label="Email Address"
                id="auth-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                error={touched.email ? errors.email : ''}
                placeholder="e.g. student@campus.edu"
                required
              />

              <Input
                label="Password"
                id="auth-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                error={touched.password ? errors.password : ''}
                placeholder={isSignup ? 'At least 8 characters' : 'Enter your password'}
                hint={isSignup ? 'Must be at least 8 characters' : ''}
                required
              />

              {isSignup && (
                <Input
                  label="Confirm Password"
                  id="auth-confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  error={touched.confirmPassword ? errors.confirmPassword : ''}
                  placeholder="Re-enter your password"
                  required
                />
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="auth-form__submit"
              >
                {isSignup ? 'Create account' : 'Log in'}
              </Button>
            </form>

            {/* Quick Demo Credentials Panel for testing */}
            {!isSignup && (
              <div className="auth-demo-chips">
                <span className="auth-demo-chips__label">1-Click demo test accounts:</span>
                <div className="auth-demo-chips__list">
                  <button
                    type="button"
                    className="auth-demo-chip"
                    onClick={() => handleQuickDemo('mentor@campus.edu', true)}
                    title="Log in directly as Mentor (Prof. Rajesh Verma)"
                  >
                    Mentor (Prof. Verma)
                  </button>
                  <button
                    type="button"
                    className="auth-demo-chip"
                    onClick={() => handleQuickDemo('student@campus.edu', true)}
                    title="Log in directly as Student (Class Mode)"
                  >
                    Student (Class)
                  </button>
                  <button
                    type="button"
                    className="auth-demo-chip"
                    onClick={() => handleQuickDemo('solo@campus.edu', true)}
                    title="Log in directly as Student (Solo Mode)"
                  >
                    Student (Solo)
                  </button>
                  <button
                    type="button"
                    className="auth-demo-chip"
                    onClick={() => handleQuickDemo('admin@campus.edu', true)}
                    title="Log in directly as Admin (Dean)"
                  >
                    Admin
                  </button>
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}

export default Auth;
