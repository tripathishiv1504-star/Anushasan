import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  PlusCircle,
  Clock,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Select from '../common/Select';
import Input from '../common/Input';
import Modal from '../common/Modal';
import './StudyTimer.css';

/**
 * Format seconds into HH:MM:SS string
 * @param {number} totalSeconds
 * @returns {string}
 */
function formatHHMMSS(totalSeconds = 0) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * StudyTimer Component
 * Live stopwatch timer and manual session logging
 *
 * @param {Array<string>} subjects - Available subjects
 * @param {Function} onSaveSession - Callback with session data
 * @param {boolean} isSaving - Loading state
 */
export function StudyTimer({ subjects = [], onSaveSession, isSaving = false }) {
  // Timer state
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'paused'
  const [seconds, setSeconds] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0] || '');
  const [subjectError, setSubjectError] = useState('');

  // Save Modal state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  // Manual Session Modal state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    subject: subjects[0] || '',
    date: new Date().toISOString().split('T')[0],
    minutes: '45',
    notes: '',
  });
  const [manualErrors, setManualErrors] = useState({});

  const timerRef = useRef(null);

  // Update selected subject if subjects list loads
  useEffect(() => {
    if (!selectedSubject && subjects.length > 0) {
      setSelectedSubject(subjects[0]);
      setManualForm((prev) => ({ ...prev, subject: subjects[0] }));
    }
  }, [subjects, selectedSubject]);

  // Interval timer tick
  useEffect(() => {
    if (status === 'running') {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  // Warn before closing/refreshing while timer is active
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (status === 'running' || (status === 'paused' && seconds > 0)) {
        e.preventDefault();
        e.returnValue = 'You have a study session running. Leaving now will discard your time.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [status, seconds]);

  // Handlers for Timer Controls
  const handleStart = () => {
    if (!selectedSubject) {
      setSubjectError('Please select a subject to begin tracking');
      return;
    }
    setSubjectError('');
    setStatus('running');
  };

  const handlePause = () => {
    setStatus('paused');
  };

  const handleResume = () => {
    setStatus('running');
  };

  const handleReset = () => {
    if (window.confirm('Reset timer? Current elapsed time will be discarded.')) {
      setStatus('idle');
      setSeconds(0);
    }
  };

  const handleStopAndSave = () => {
    setStatus('paused');
    setIsSaveModalOpen(true);
  };

  const handleConfirmSave = async () => {
    const durationMinutes = Math.max(1, Math.round(seconds / 60));
    await onSaveSession({
      subject: selectedSubject,
      durationMinutes,
      notes: sessionNotes,
      startedAt: new Date(Date.now() - seconds * 1000).toISOString(),
    });

    setIsSaveModalOpen(false);
    setStatus('idle');
    setSeconds(0);
    setSessionNotes('');
  };

  // Manual Session Validation and Submit
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!manualForm.subject) errs.subject = 'Subject is required';
    const mins = Number(manualForm.minutes);
    if (!mins || mins <= 0) errs.minutes = 'Please enter a positive duration in minutes';
    if (!manualForm.date) errs.date = 'Date is required';

    if (Object.keys(errs).length > 0) {
      setManualErrors(errs);
      return;
    }

    setManualErrors({});
    const startDateTime = new Date(`${manualForm.date}T10:00:00`).toISOString();

    await onSaveSession({
      subject: manualForm.subject,
      durationMinutes: mins,
      notes: manualForm.notes,
      startedAt: startDateTime,
    });

    setIsManualModalOpen(false);
    setManualForm({
      subject: subjects[0] || '',
      date: new Date().toISOString().split('T')[0],
      minutes: '45',
      notes: '',
    });
  };

  const subjectOptions = subjects.map((s) => ({ value: s, label: s }));

  return (
    <Card className="study-timer" padding="lg">
      <div className="study-timer__top">
        <div className="study-timer__title-row">
          <div className="study-timer__icon-wrap">
            <Clock size={20} className="study-timer__icon" />
          </div>
          <div>
            <h3 className="study-timer__title">Focus Timer</h3>
            <p className="study-timer__subtitle">
              Study 30+ minutes daily to build your streak and discipline score.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={PlusCircle}
          onClick={() => setIsManualModalOpen(true)}
        >
          Add Manually
        </Button>
      </div>

      {/* Subject Picker */}
      <div className="study-timer__subject-picker">
        <Select
          label="Select Subject"
          value={selectedSubject}
          onChange={(e) => {
            setSelectedSubject(e.target.value);
            if (e.target.value) setSubjectError('');
          }}
          options={subjectOptions}
          disabled={status !== 'idle'}
          error={subjectError}
          required
        />
      </div>

      {/* Clock Display */}
      <div className={`study-timer__display ${status === 'running' ? 'study-timer__display--active' : ''}`}>
        <div className="study-timer__time-text">{formatHHMMSS(seconds)}</div>
        <div className="study-timer__status-tag">
          {status === 'idle' && 'Ready to study'}
          {status === 'running' && 'Session in progress...'}
          {status === 'paused' && 'Session paused'}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="study-timer__controls">
        {status === 'idle' && (
          <Button
            variant="primary"
            size="lg"
            icon={Play}
            onClick={handleStart}
            className="study-timer__btn--start"
          >
            Start Session
          </Button>
        )}

        {status === 'running' && (
          <>
            <Button
              variant="outline"
              size="lg"
              icon={Pause}
              onClick={handlePause}
            >
              Pause
            </Button>
            <Button
              variant="primary"
              size="lg"
              icon={Square}
              onClick={handleStopAndSave}
            >
              Stop & Save
            </Button>
          </>
        )}

        {status === 'paused' && (
          <>
            <Button
              variant="primary"
              size="lg"
              icon={Play}
              onClick={handleResume}
            >
              Resume
            </Button>
            <Button
              variant="outline"
              size="lg"
              icon={Square}
              onClick={handleStopAndSave}
            >
              Save Session
            </Button>
            <Button
              variant="ghost"
              size="md"
              icon={RotateCcw}
              onClick={handleReset}
              aria-label="Reset timer"
            >
              Reset
            </Button>
          </>
        )}
      </div>

      {/* Save Session Confirmation Modal */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Save Study Session"
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setIsSaveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={CheckCircle}
              onClick={handleConfirmSave}
              isLoading={isSaving}
            >
              Save to Dashboard
            </Button>
          </div>
        }
      >
        <div className="study-timer__modal-content">
          <div className="study-timer__modal-summary">
            <div className="modal-stat">
              <span className="modal-stat__label">Subject</span>
              <span className="modal-stat__value">{selectedSubject}</span>
            </div>
            <div className="modal-stat">
              <span className="modal-stat__label">Recorded Time</span>
              <span className="modal-stat__value">
                {Math.max(1, Math.round(seconds / 60))} minutes ({formatHHMMSS(seconds)})
              </span>
            </div>
          </div>

          <Input
            label="Session Notes (Optional)"
            placeholder="e.g. Solved memory allocation exercises, completed lecture slides."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            hint="Brief notes help track your revision milestones."
          />
        </div>
      </Modal>

      {/* Manual Entry Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Add Session Manually"
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setIsManualModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={CheckCircle}
              onClick={handleManualSubmit}
              isLoading={isSaving}
            >
              Log Session
            </Button>
          </div>
        }
      >
        <form onSubmit={handleManualSubmit} className="study-timer__modal-content">
          <Select
            label="Subject"
            value={manualForm.subject}
            onChange={(e) => setManualForm({ ...manualForm, subject: e.target.value })}
            options={subjectOptions}
            error={manualErrors.subject}
            required
          />

          <div className="study-timer__form-row">
            <Input
              type="date"
              label="Session Date"
              value={manualForm.date}
              onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
              error={manualErrors.date}
              required
            />
            <Input
              type="number"
              label="Duration (minutes)"
              placeholder="e.g. 45"
              min="1"
              value={manualForm.minutes}
              onChange={(e) => setManualForm({ ...manualForm, minutes: e.target.value })}
              error={manualErrors.minutes}
              required
            />
          </div>

          <Input
            label="Notes (Optional)"
            placeholder="e.g. Practiced dynamic programming problems."
            value={manualForm.notes}
            onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
          />
        </form>
      </Modal>
    </Card>
  );
}

export default StudyTimer;
