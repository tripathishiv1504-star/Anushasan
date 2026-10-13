import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle2, ArrowLeft, BookOpen, User, AlertTriangle } from 'lucide-react';
import { Logo, Card, Input, Button, Badge } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { ROUTES } from '../../routes/routeConfig';
import './JoinClass.css';

export function JoinClass() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [foundClass, setFoundClass] = useState(null);

  const handleCodeChange = (e) => {
    // Auto-uppercase, alphanumeric characters only, max 6 characters
    const sanitized = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6);
    setCode(sanitized);
    if (error) setError('');
    if (foundClass) setFoundClass(null);
  };

  const handleFindClass = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter a complete 6-character class code.');
      return;
    }

    setIsSearching(true);
    setError('');
    setFoundClass(null);

    try {
      const classItem = await studentService.findClassByCode(code);
      setFoundClass(classItem);
    } catch (err) {
      setError(err.message || 'Class code not found. Please verify with your mentor.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleJoinClass = async () => {
    if (!foundClass || !user) return;
    setIsJoining(true);
    try {
      const { user: updatedUser } = await studentService.joinClass(foundClass.id, user.id);
      if (setUser) {
        setUser(updatedUser);
      }
      navigate(ROUTES.studentDashboard);
    } catch (err) {
      setError(err.message || 'Failed to join class. Please try again.');
      setIsJoining(false);
    }
  };

  return (
    <div className="join-class-page">
      <div className="container join-class-page__container">
        <header className="join-class-header">
          <Logo size="md" />
          <h1 className="join-class-title">Join a Class</h1>
          <p className="join-class-subtitle">
            Enter the 6-character code provided by your faculty mentor.
          </p>
        </header>

        <Card padding="lg" className="join-class-card">
          <button
            type="button"
            className="join-class-back-link"
            onClick={() => navigate(ROUTES.studentMode)}
          >
            <ArrowLeft size={16} /> Back to study modes
          </button>

          {!foundClass ? (
            <form onSubmit={handleFindClass} className="join-class-form">
              <div className="join-class-input-wrapper">
                <Input
                  label="Class Join Code"
                  id="class-join-code"
                  name="code"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="e.g. CS301A"
                  error={error}
                  hint="6 uppercase alphanumeric characters (e.g. CS301A, DS201B, AI401C)"
                  required
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={Search}
                isLoading={isSearching}
                disabled={code.length !== 6}
                className="join-class-submit-btn"
              >
                Find class
              </Button>
            </form>
          ) : (
            /* Confirmation Card */
            <div className="join-class-preview" role="region" aria-label="Class confirmation">
              <div className="join-class-preview__badge-row">
                <Badge variant="success" icon={CheckCircle2}>
                  Class Found
                </Badge>
                <span className="join-class-preview__code">Code: {foundClass.join_code}</span>
              </div>

              <h2 className="join-class-preview__title">{foundClass.name}</h2>

              <div className="join-class-preview__meta">
                <div className="join-class-preview__meta-item">
                  <BookOpen size={16} className="join-class-preview__icon" />
                  <span>Subject: <strong>{foundClass.subject}</strong></span>
                </div>
                <div className="join-class-preview__meta-item">
                  <User size={16} className="join-class-preview__icon" />
                  <span>Mentor: <strong>{foundClass.mentor_name}</strong></span>
                </div>
              </div>

              <div className="join-class-preview__actions">
                <Button
                  variant="primary"
                  size="lg"
                  isLoading={isJoining}
                  onClick={handleJoinClass}
                  className="join-class-confirm-btn"
                >
                  Join this class
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setFoundClass(null)}
                >
                  Enter different code
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default JoinClass;
