import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Layers,
  BookOpen,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import AttendanceCalendar from '../../components/student/AttendanceCalendar';
import TimetableGrid from '../../components/student/TimetableGrid';
import './Attendance.css';

export function Attendance() {
  const { user } = useAuth();
  const studentId = user?.id || 'user_student_1';

  // Data states
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters for recent sessions table
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Interactive toggle for testing low attendance alert (<75%)
  const [simulateLowAttendance, setSimulateLowAttendance] = useState(false);

  // Load all attendance data
  const loadAttendanceData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [statsData, recordsData, timetableData] = await Promise.all([
        attendanceService.getAttendanceStats(studentId),
        attendanceService.getAttendanceRecords(studentId, classFilter),
        attendanceService.getTimetable(studentId),
      ]);

      setStats(statsData);
      setRecords(recordsData);
      setTimetable(timetableData);
    } catch (err) {
      console.error('Failed to load attendance data:', err);
      setError(err.message || 'Unable to load attendance records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [studentId, classFilter]);

  useEffect(() => {
    loadAttendanceData();

    const handleAttendanceUpdated = () => {
      loadAttendanceData();
    };

    window.addEventListener('anushasan:attendance_updated', handleAttendanceUpdated);
    return () => {
      window.removeEventListener('anushasan:attendance_updated', handleAttendanceUpdated);
    };
  }, [loadAttendanceData]);

  // Filter records by status locally
  const filteredRecords = records.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  if (isLoading && !stats) {
    return <LoadingState message="Loading your attendance records and timetable..." minHeight="60vh" />;
  }

  if (error && !stats) {
    return (
      <ErrorState
        title="Failed to Load Attendance"
        message={error}
        onRetry={loadAttendanceData}
      />
    );
  }

  // Determine current display attendance rate (or simulated)
  const displayPercentage = simulateLowAttendance ? 68 : (stats?.overallPercentage ?? 100);
  const isAlertActive = simulateLowAttendance || (stats?.isBelowThreshold ?? false);
  const sessionsNeeded = simulateLowAttendance ? 4 : (stats?.sessionsNeeded ?? 0);

  return (
    <div className="attendance-page animate-fade-in">
      {/* Page Title & Controls */}
      <div className="attendance-page-header">
        <div>
          <h1 className="attendance-page-title">Attendance & Timetable</h1>
          <p className="attendance-page-desc">
            Monitor your lecture attendance rate, session records, and weekly class schedule.
          </p>
        </div>

        <div className="attendance-header-actions">
          <Button
            variant={simulateLowAttendance ? 'warning' : 'outline'}
            size="sm"
            onClick={() => setSimulateLowAttendance((prev) => !prev)}
            icon={AlertTriangle}
            title="Preview low attendance (<75%) warning alert"
          >
            {simulateLowAttendance ? 'Reset Demo (<75% Active)' : 'Preview <75% Warning'}
          </Button>
          <Button variant="ghost" size="sm" onClick={loadAttendanceData} icon={RotateCcw}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Threshold Warning Banner (Spec: Warn visibly if attendance is below 75%) */}
      {isAlertActive ? (
        <div className="attendance-warning-banner attendance-warning-banner--alert animate-slide-up" role="alert">
          <div className="attendance-warning-icon-wrap">
            <AlertTriangle className="attendance-warning-icon" size={24} />
          </div>
          <div className="attendance-warning-content">
            <h3 className="attendance-warning-title">
              Attention: Attendance Below 75% Academic Requirement ({displayPercentage}%)
            </h3>
            <p className="attendance-warning-text">
              Your overall attendance is currently below the mandatory <strong>75% minimum threshold</strong>.
              {sessionsNeeded > 0 && (
                <span>
                  {' '}You need to attend the next <strong>{sessionsNeeded} consecutive class sessions</strong> on time without absence to restore your standing above 75%.
                </span>
              )}
            </p>
          </div>
          <Badge variant="danger" size="md">
            Academic Warning
          </Badge>
        </div>
      ) : (
        <div className="attendance-warning-banner attendance-warning-banner--good animate-slide-up">
          <div className="attendance-warning-icon-wrap attendance-warning-icon-wrap--good">
            <CheckCircle className="attendance-warning-icon--good" size={24} />
          </div>
          <div className="attendance-warning-content">
            <h3 className="attendance-warning-title">
              Good Academic Standing ({displayPercentage}%)
            </h3>
            <p className="attendance-warning-text">
              Your lecture attendance comfortably exceeds the college minimum 75% threshold. Keep up the consistency!
            </p>
          </div>
          <Badge variant="success" size="md">
            In Good Standing
          </Badge>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="attendance-stats-grid">
        <Card className="attendance-stat-card">
          <div className="attendance-stat-top">
            <span className="attendance-stat-label">Overall Rate</span>
            <div className={`attendance-rate-badge ${displayPercentage < 75 ? 'attendance-rate-badge--low' : ''}`}>
              <TrendingUp size={14} />
              <span>{displayPercentage}%</span>
            </div>
          </div>
          <div className="attendance-stat-value">{displayPercentage}%</div>
          <ProgressBar
            value={displayPercentage}
            variant={displayPercentage < 75 ? 'danger' : displayPercentage < 85 ? 'warning' : 'primary'}
            size="md"
          />
          <span className="attendance-stat-hint">
            Minimum required: 75% • {stats?.attendedCount || 0} of {stats?.totalSessions || 0} sessions attended
          </span>
        </Card>

        <Card className="attendance-stat-card">
          <div className="attendance-stat-top">
            <span className="attendance-stat-label">Present</span>
            <CheckCircle className="attendance-stat-icon attendance-stat-icon--present" size={18} />
          </div>
          <div className="attendance-stat-value">{stats?.presentCount || 0}</div>
          <span className="attendance-stat-hint">Full on-time attendance recorded</span>
        </Card>

        <Card className="attendance-stat-card">
          <div className="attendance-stat-top">
            <span className="attendance-stat-label">Late Arrivals</span>
            <Clock className="attendance-stat-icon attendance-stat-icon--late" size={18} />
          </div>
          <div className="attendance-stat-value">{stats?.lateCount || 0}</div>
          <span className="attendance-stat-hint">Attended, marked after commencement</span>
        </Card>

        <Card className="attendance-stat-card">
          <div className="attendance-stat-top">
            <span className="attendance-stat-label">Absences</span>
            <XCircle className="attendance-stat-icon attendance-stat-icon--absent" size={18} />
          </div>
          <div className="attendance-stat-value">{stats?.absentCount || 0}</div>
          <span className="attendance-stat-hint">Missed sessions this semester</span>
        </Card>
      </div>

      {/* Class-wise Breakdown Cards */}
      <div className="attendance-section">
        <h2 className="attendance-section-title">Course Attendance Breakdown</h2>
        <div className="attendance-classes-grid">
          {stats?.classBreakdown?.map((cls) => (
            <Card key={cls.classId} className="attendance-class-card">
              <div className="attendance-class-header">
                <div>
                  <h3 className="attendance-class-name">{cls.className}</h3>
                  <span className="attendance-class-meta">
                    {cls.classCode} • {cls.mentorName}
                  </span>
                </div>
                <Badge
                  variant={cls.percentage < 75 ? 'danger' : 'success'}
                  size="sm"
                >
                  {cls.percentage}%
                </Badge>
              </div>

              <ProgressBar
                value={cls.percentage}
                variant={cls.percentage < 75 ? 'danger' : 'primary'}
                size="sm"
              />

              <div className="attendance-class-counts">
                <span>Present: <strong>{cls.present}</strong></span>
                <span>Late: <strong>{cls.late}</strong></span>
                <span>Absent: <strong>{cls.absent}</strong></span>
                <span>Total: <strong>{cls.total}</strong></span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Calendar & Timetable 2-Column Grid */}
      <div className="attendance-main-grid">
        {/* Month Calendar */}
        <div className="attendance-grid-col">
          <AttendanceCalendar records={records} />
        </div>

        {/* Weekly Timetable */}
        <div className="attendance-grid-col">
          <TimetableGrid timetable={timetable} />
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div className="attendance-section">
        <div className="attendance-table-header-row">
          <div>
            <h2 className="attendance-section-title">Session Attendance Log</h2>
            <p className="attendance-section-desc">
              Detailed chronological record of every marked lecture and practical session.
            </p>
          </div>

          <div className="attendance-table-filters">
            <Select
              id="attendance-class-filter"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="attendance-filter-select"
            >
              <option value="all">All Courses</option>
              {stats?.classBreakdown?.map((c) => (
                <option key={c.classId} value={c.classId}>
                  {c.classCode} - {c.className}
                </option>
              ))}
            </Select>

            <Select
              id="attendance-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="attendance-filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present Only</option>
              <option value="late">Late Only</option>
              <option value="absent">Absent Only</option>
            </Select>
          </div>
        </div>

        <Card className="attendance-table-card">
          <div className="attendance-table-container">
            <table className="attendance-table" aria-label="Attendance Records Table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Course / Subject</th>
                  <th scope="col">Session Time</th>
                  <th scope="col">Mentor</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="attendance-table-empty">
                      No attendance records match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => (
                    <tr key={r.id}>
                      <td className="attendance-cell-date">
                        <strong>{r.session_date}</strong>
                      </td>
                      <td className="attendance-cell-subject">
                        <span className="attendance-table-sub-title">
                          {r.class_name || r.subject}
                        </span>
                        {r.class_code && (
                          <span className="attendance-table-code-badge">{r.class_code}</span>
                        )}
                      </td>
                      <td className="attendance-cell-time">
                        {r.period || 'Scheduled Hour'}
                      </td>
                      <td className="attendance-cell-mentor">
                        {r.mentor_name || 'Prof. Rajesh Verma'}
                      </td>
                      <td className="attendance-cell-status">
                        <Badge
                          variant={
                            r.status === 'present'
                              ? 'success'
                              : r.status === 'late'
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {r.status === 'present' ? 'Present' : r.status === 'late' ? 'Late' : 'Absent'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Attendance;
