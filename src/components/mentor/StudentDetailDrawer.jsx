import React, { useEffect } from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  CheckSquare,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import RiskBadge from './RiskBadge';
import './StudentDetailDrawer.css';

/**
 * Slide-over side panel displaying student academic telemetry and score trend
 * Mentors see summary telemetry only, never private student notes.
 *
 * @param {Object} props
 * @param {Object | null} props.student
 * @param {() => void} props.onClose
 */
export function StudentDetailDrawer({ student, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (student) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [student, onClose]);

  if (!student) return null;

  const initials = (student.name || 'S')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const scoreDelta = (student.current_score || 0) - (student.previous_score || 0);

  return (
    <div
      className="student-drawer-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="student-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Academic details for ${student.name}`}
      >
        {/* Header */}
        <div className="student-drawer__header">
          <div className="student-drawer__profile">
            <div className="student-drawer__avatar">{initials}</div>
            <div>
              <h3 className="student-drawer__name">{student.name}</h3>
              <p className="student-drawer__email">{student.email}</p>
              <RiskBadge
                isAtRisk={student.is_at_risk}
                reason={student.risk_reason}
                size="sm"
              />
            </div>
          </div>

          <button
            type="button"
            className="student-drawer__close-btn"
            onClick={onClose}
            aria-label="Close details panel"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="student-drawer__body">
          {/* At-Risk Alert Banner */}
          {student.is_at_risk && (
            <div className="student-drawer__alert-banner" role="alert">
              <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p>Faculty Action Recommended</p>
                <small>{student.risk_reason}</small>
              </div>
            </div>
          )}

          {/* Key Metric Tiles */}
          <div className="student-drawer__stats-grid">
            {/* Discipline Score */}
            <div className="student-drawer__stat-box">
              <span className="student-drawer__stat-label">Discipline Score</span>
              <span className="student-drawer__stat-value" style={{ color: student.current_score < 50 ? 'var(--color-danger)' : '#4F46E5' }}>
                {student.current_score} <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>/ 100</span>
              </span>
              <span className="student-drawer__stat-sub" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                {scoreDelta >= 0 ? (
                  <>
                    <TrendingUp size={13} style={{ color: 'var(--color-success)' }} />
                    <span style={{ color: 'var(--color-success)' }}>+{scoreDelta} pts vs last week</span>
                  </>
                ) : (
                  <>
                    <TrendingDown size={13} style={{ color: 'var(--color-danger)' }} />
                    <span style={{ color: 'var(--color-danger)' }}>{scoreDelta} pts vs last week</span>
                  </>
                )}
              </span>
            </div>

            {/* Streak */}
            <div className="student-drawer__stat-box">
              <span className="student-drawer__stat-label">Study Streak</span>
              <span className="student-drawer__stat-value" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={20} style={{ color: student.streak > 0 ? 'var(--color-accent)' : 'var(--color-text-muted)' }} />
                <span>{student.streak} days</span>
              </span>
              <span className="student-drawer__stat-sub">Consecutive &ge; 30m sessions</span>
            </div>

            {/* Study Hours */}
            <div className="student-drawer__stat-box">
              <span className="student-drawer__stat-label">Study Time</span>
              <span className="student-drawer__stat-value">
                {student.study_hours_week} hrs
              </span>
              <span className="student-drawer__stat-sub">Logged in last 7 days</span>
            </div>

            {/* Attendance Rate */}
            <div className="student-drawer__stat-box">
              <span className="student-drawer__stat-label">Attendance</span>
              <span
                className="student-drawer__stat-value"
                style={{ color: student.attendance_pct < 75 ? 'var(--color-danger)' : 'var(--color-text)' }}
              >
                {student.attendance_pct}%
              </span>
              <span className="student-drawer__stat-sub">
                {student.attendance_pct < 75 ? 'Below 75% threshold' : 'Good academic standing'}
              </span>
            </div>
          </div>

          {/* 8-Week Score History Chart */}
          <div className="student-drawer__chart-card">
            <h4>8-Week Discipline Score Trend</h4>
            <div style={{ width: '100%', height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={student.weekly_trend || []}
                  margin={{ top: 10, right: 12, left: 0, bottom: 5 }}
                >
                  <XAxis dataKey="week" stroke="var(--color-text-muted)" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="var(--color-text-muted)" fontSize={11} />
                  <Tooltip />
                  <ReferenceLine
                    y={50}
                    stroke="var(--color-danger)"
                    strokeDasharray="3 3"
                    label={{ value: 'Passing 50', fill: 'var(--color-danger)', fontSize: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4F46E5"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#4F46E5' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="student-drawer__privacy-notice">
            <ShieldCheck size={20} style={{ flexShrink: 0, color: 'var(--color-primary)' }} />
            <div>
              <strong>Student Privacy Guaranteed:</strong> Faculty members see aggregate academic benchmarks and attendance compliance only. Private session notes and personal habit logs remain confidential to the student.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDetailDrawer;
