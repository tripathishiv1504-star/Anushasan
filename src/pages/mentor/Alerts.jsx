import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  XCircle,
  Eye,
  Filter,
  Check,
  TrendingDown,
  Clock,
  CalendarCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mentorService } from '../../services/mentorService';
import RiskBadge from '../../components/mentor/RiskBadge';
import StudentDetailDrawer from '../../components/mentor/StudentDetailDrawer';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import './Alerts.css';

export function Alerts() {
  const { user } = useAuth();
  const mentorId = user?.id || 'user_mentor_1';

  const [alerts, setAlerts] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('active'); // 'active' | 'contacted' | 'dismissed' | 'all'
  const [selectedClassId, setSelectedClassId] = useState('ALL');

  // Slide-over side panel state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [alertsData, classesData] = await Promise.all([
        mentorService.getMentorAlerts(mentorId),
        mentorService.getMentorClasses(mentorId),
      ]);
      setAlerts(alertsData);
      setClasses(classesData);
    } catch (err) {
      console.error('Failed to load risk alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for custom alerts update event
    const handleAlertsUpdated = () => {
      mentorService.getMentorAlerts(mentorId).then(setAlerts);
    };

    window.addEventListener('anushasan:alerts_updated', handleAlertsUpdated);
    return () => {
      window.removeEventListener('anushasan:alerts_updated', handleAlertsUpdated);
    };
  }, [mentorId]);

  // Tab counts
  const counts = useMemo(() => {
    const active = alerts.filter((a) => a.status === 'active').length;
    const contacted = alerts.filter((a) => a.status === 'contacted').length;
    const dismissed = alerts.filter((a) => a.status === 'dismissed').length;
    return { active, contacted, dismissed, all: alerts.length };
  }, [alerts]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchesTab = selectedTab === 'all' || a.status === selectedTab;
      const matchesClass =
        selectedClassId === 'ALL' || a.class_id === selectedClassId;
      return matchesTab && matchesClass;
    });
  }, [alerts, selectedTab, selectedClassId]);

  // Mark alert as contacted
  const handleMarkContacted = async (alertId, studentName) => {
    try {
      await mentorService.markAlertContacted(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'contacted' } : a))
      );
      showToast(`Marked ${studentName} as contacted.`);
    } catch (err) {
      console.error('Failed to mark contacted:', err);
    }
  };

  // Dismiss alert
  const handleDismiss = async (alertId, studentName) => {
    try {
      await mentorService.dismissAlert(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'dismissed' } : a))
      );
      showToast(`Dismissed alert for ${studentName}.`);
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  // Inspect student record in side drawer
  const handleInspectStudent = async (studentId) => {
    try {
      const student = await mentorService.getStudentDetail(studentId);
      setSelectedStudent(student);
    } catch (err) {
      console.error('Failed to load student detail:', err);
    }
  };

  return (
    <div className="mentor-alerts">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className="mentor-classes__toast mentor-classes__toast--success"
          role="status"
          style={{ marginBottom: 'var(--space-4)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mentor-alerts__header">
        <h1>Risk Alerts</h1>
        <p className="mentor-alerts__subtitle">
          Immediate intervention feed for students experiencing score drops of &ge;15 points or falling below 50.
        </p>
      </div>

      {/* Toolbar & Tabs */}
      <div className="mentor-alerts__toolbar">
        <div className="mentor-alerts__tabs" role="tablist">
          <button
            type="button"
            className={`mentor-alerts__tab ${selectedTab === 'active' ? 'mentor-alerts__tab--active' : ''}`}
            onClick={() => setSelectedTab('active')}
            role="tab"
            aria-selected={selectedTab === 'active'}
          >
            <span>Active Alerts</span>
            <span className="mentor-alerts__tab-badge mentor-alerts__tab-badge--danger">
              {counts.active}
            </span>
          </button>

          <button
            type="button"
            className={`mentor-alerts__tab ${selectedTab === 'contacted' ? 'mentor-alerts__tab--active' : ''}`}
            onClick={() => setSelectedTab('contacted')}
            role="tab"
            aria-selected={selectedTab === 'contacted'}
          >
            <span>Contacted</span>
            <span className="mentor-alerts__tab-badge">{counts.contacted}</span>
          </button>

          <button
            type="button"
            className={`mentor-alerts__tab ${selectedTab === 'dismissed' ? 'mentor-alerts__tab--active' : ''}`}
            onClick={() => setSelectedTab('dismissed')}
            role="tab"
            aria-selected={selectedTab === 'dismissed'}
          >
            <span>Dismissed</span>
            <span className="mentor-alerts__tab-badge">{counts.dismissed}</span>
          </button>

          <button
            type="button"
            className={`mentor-alerts__tab ${selectedTab === 'all' ? 'mentor-alerts__tab--active' : ''}`}
            onClick={() => setSelectedTab('all')}
            role="tab"
            aria-selected={selectedTab === 'all'}
          >
            <span>All</span>
            <span className="mentor-alerts__tab-badge">{counts.all}</span>
          </button>
        </div>

        {/* Filter by class */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} style={{ color: 'var(--color-text-muted)' }} />
          <select
            className="mentor-alerts__class-select"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            aria-label="Filter alerts by class"
          >
            <option value="ALL">All Course Sections</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState message="Checking student risk telemetry..." />
      ) : filteredAlerts.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={selectedTab === 'active' ? 'No active risk alerts' : 'No alerts in this view'}
          description={
            selectedTab === 'active'
              ? 'Great news! All students across your course sections are currently meeting passing scores and steady study consistency.'
              : 'There are no students matching this filter selection.'
          }
        />
      ) : (
        <div className="mentor-alerts__list">
          {filteredAlerts.map((alert) => {
            const initials = (alert.student_name || 'S')
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <div
                key={alert.id}
                className={`mentor-alert-card mentor-alert-card--${alert.status}`}
              >
                {/* Top Row: Student Profile and Risk Badge */}
                <div className="mentor-alert-card__top">
                  <div className="mentor-alert-card__student-info">
                    <div className="mentor-alert-card__avatar">{initials}</div>
                    <div>
                      <h3 className="mentor-alert-card__student-name">
                        {alert.student_name}
                      </h3>
                      <div className="mentor-alert-card__student-meta">
                        <span>{alert.student_email}</span>
                        <span>•</span>
                        <strong>{alert.class_name}</strong>
                      </div>
                    </div>
                  </div>

                  <RiskBadge isAtRisk={true} size="md" />
                </div>

                {/* Reason Callout Box */}
                <div className="mentor-alert-card__reason-box">
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <span className="mentor-alert-card__reason-text">
                    Flagged Condition: {alert.reason}
                  </span>
                </div>

                {/* Quick Telemetry Row */}
                <div className="mentor-alert-card__metrics">
                  <div className="mentor-alert-card__metric-item">
                    <span>Current Score:</span>
                    <span className="mentor-alert-card__metric-val" style={{ color: 'var(--color-danger)' }}>
                      {alert.current_score} / 100
                    </span>
                  </div>

                  {alert.score_drop > 0 && (
                    <div className="mentor-alert-card__metric-item">
                      <TrendingDown size={14} style={{ color: 'var(--color-danger)' }} />
                      <span>Dropped {alert.score_drop} pts vs prior week</span>
                    </div>
                  )}

                  <div className="mentor-alert-card__metric-item">
                    <CalendarCheck size={14} />
                    <span>Attendance:</span>
                    <span className="mentor-alert-card__metric-val">
                      {alert.attendance_pct}%
                    </span>
                  </div>

                  <div className="mentor-alert-card__metric-item">
                    <Clock size={14} />
                    <span>Weekly Study:</span>
                    <span className="mentor-alert-card__metric-val">
                      {alert.study_hours_week} hrs
                    </span>
                  </div>
                </div>

                {/* Footer with Status Tag & Actions */}
                <div className="mentor-alert-card__footer">
                  <div>
                    {alert.status === 'active' ? (
                      <span className="mentor-alert-card__status-tag mentor-alert-card__status-tag--active">
                        Requires Action
                      </span>
                    ) : alert.status === 'contacted' ? (
                      <span className="mentor-alert-card__status-tag mentor-alert-card__status-tag--contacted">
                        Student Contacted
                      </span>
                    ) : (
                      <span className="mentor-alert-card__status-tag mentor-alert-card__status-tag--dismissed">
                        Alert Dismissed
                      </span>
                    )}
                  </div>

                  <div className="mentor-alert-card__action-buttons">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      onClick={() => handleInspectStudent(alert.student_id)}
                    >
                      Inspect Record
                    </Button>

                    {alert.status !== 'contacted' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={PhoneCall}
                        onClick={() => handleMarkContacted(alert.id, alert.student_name)}
                      >
                        Mark as contacted
                      </Button>
                    )}

                    {alert.status !== 'dismissed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={XCircle}
                        onClick={() => handleDismiss(alert.id, alert.student_name)}
                      >
                        Dismiss
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-over Side Panel */}
      <StudentDetailDrawer
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}

export default Alerts;
