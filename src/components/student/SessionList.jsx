import React, { useState } from 'react';
import {
  Clock,
  Edit2,
  Trash2,
  BookOpen,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Modal from '../common/Modal';
import EmptyState from '../common/EmptyState';
import { formatDuration } from '../../utils/dates';
import './SessionList.css';

/**
 * Format date for group headers (e.g. "Today - Oct 13, 2026" or "Oct 12, 2026")
 */
function formatGroupHeader(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.toDateString() === yesterday.toDateString();

  const formatted = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  if (isToday) return `Today — ${formatted}`;
  if (isYesterday) return `Yesterday — ${formatted}`;
  return formatted;
}

/**
 * Format session start time (e.g. "09:30 AM")
 */
function formatSessionTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/**
 * SessionList Component
 * Displays recent study sessions grouped by day with edit and delete capabilities
 *
 * @param {Array<Object>} sessions - List of sessions
 * @param {Array<string>} subjects - List of available subjects
 * @param {Function} onUpdateSession - Callback to update session
 * @param {Function} onDeleteSession - Callback to delete session
 */
export function SessionList({
  sessions = [],
  subjects = [],
  onUpdateSession,
  onDeleteSession,
}) {
  const [editingSession, setEditingSession] = useState(null);
  const [editForm, setEditForm] = useState({ subject: '', duration_minutes: '', notes: '' });
  const [editErrors, setEditErrors] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  // Group sessions by local date (YYYY-MM-DD)
  const grouped = sessions.reduce((acc, session) => {
    const key = session.started_at ? session.started_at.split('T')[0] : 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(session);
    return acc;
  }, {});

  const dateKeys = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  const handleOpenEdit = (session) => {
    setEditingSession(session);
    setEditForm({
      subject: session.subject || '',
      duration_minutes: String(session.duration_minutes || ''),
      notes: session.notes || '',
    });
    setEditErrors({});
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!editForm.subject) errs.subject = 'Subject is required';
    const mins = Number(editForm.duration_minutes);
    if (!mins || mins <= 0) errs.duration_minutes = 'Enter a valid positive number';

    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }

    await onUpdateSession(editingSession.id, {
      subject: editForm.subject,
      duration_minutes: mins,
      notes: editForm.notes,
    });
    setEditingSession(null);
  };

  const handleDelete = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this study session? This will recalculate your weekly score.')) {
      setDeletingId(sessionId);
      await onDeleteSession(sessionId);
      setDeletingId(null);
    }
  };

  const subjectOptions = subjects.map((s) => ({ value: s, label: s }));

  return (
    <div className="session-list">
      <div className="session-list__header">
        <div className="session-list__title-row">
          <Clock size={20} className="session-list__icon" />
          <h3 className="session-list__title">Recent Study Sessions</h3>
        </div>
        <span className="session-list__count-badge">
          {sessions.length} total logged
        </span>
      </div>

      {sessions.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            icon={BookOpen}
            title="No study sessions recorded yet"
            description="Use the timer above or add a past study session manually to begin logging your discipline."
          />
        </Card>
      ) : (
        <div className="session-list__groups">
          {dateKeys.map((dateKey) => {
            const daySessions = grouped[dateKey];
            const dayTotalMinutes = daySessions.reduce(
              (sum, s) => sum + (Number(s.duration_minutes) || 0),
              0
            );

            return (
              <div key={dateKey} className="session-group">
                <div className="session-group__header">
                  <div className="session-group__date">
                    <Calendar size={14} />
                    <span>{formatGroupHeader(dateKey)}</span>
                  </div>
                  <span className="session-group__total">
                    Day Total: <strong>{formatDuration(dayTotalMinutes)}</strong>
                  </span>
                </div>

                <div className="session-group__items">
                  {daySessions.map((session) => (
                    <div key={session.id} className="session-item">
                      <div className="session-item__main">
                        <div className="session-item__subject-row">
                          <span className="session-item__subject">{session.subject}</span>
                          <span className="session-item__duration">
                            {formatDuration(session.duration_minutes)}
                          </span>
                        </div>

                        {session.notes && (
                          <p className="session-item__notes">{session.notes}</p>
                        )}

                        <span className="session-item__time">
                          Started at {formatSessionTime(session.started_at)}
                        </span>
                      </div>

                      <div className="session-item__actions">
                        <button
                          type="button"
                          className="session-item__action-btn"
                          onClick={() => handleOpenEdit(session)}
                          aria-label={`Edit ${session.subject} session`}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="session-item__action-btn session-item__action-btn--delete"
                          onClick={() => handleDelete(session.id)}
                          disabled={deletingId === session.id}
                          aria-label={`Delete ${session.subject} session`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Session Modal */}
      <Modal
        isOpen={Boolean(editingSession)}
        onClose={() => setEditingSession(null)}
        title="Edit Study Session"
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setEditingSession(null)}>
              Cancel
            </Button>
            <Button variant="primary" icon={CheckCircle} onClick={handleSaveEdit}>
              Update Session
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveEdit} className="session-list__modal-form">
          <Select
            label="Subject"
            value={editForm.subject}
            onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
            options={subjectOptions}
            error={editErrors.subject}
            required
          />

          <Input
            type="number"
            label="Duration (minutes)"
            min="1"
            value={editForm.duration_minutes}
            onChange={(e) =>
              setEditForm({ ...editForm, duration_minutes: e.target.value })
            }
            error={editErrors.duration_minutes}
            required
          />

          <Input
            label="Notes"
            value={editForm.notes}
            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
            placeholder="Key concepts or tasks revised"
          />
        </form>
      </Modal>
    </div>
  );
}

export default SessionList;
