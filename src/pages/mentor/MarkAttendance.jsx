import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  Calendar,
  Users,
  CheckCheck,
  Check,
  Clock,
  X,
  XCircle,
  AlertTriangle,
  Search,
  Save,
  Edit2,
  RotateCcw,
  BookOpen,
  TrendingUp,
  Info,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mentorService } from '../../services/mentorService';
import { attendanceService } from '../../services/attendanceService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import './MarkAttendance.css';

export function MarkAttendance() {
  const { user } = useAuth();
  const mentorId = user?.id || 'user_mentor_1';
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Selected class and date
  const paramClassId = searchParams.get('classId');
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  
  // Format today's date YYYY-MM-DD
  const getTodayDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [sessionDate, setSessionDate] = useState(getTodayDateStr);
  const [sessionSubject, setSessionSubject] = useState('');

  // Enrolled students for selected class
  const [students, setStudents] = useState([]);
  
  // Attendance state per student: { [studentId]: 'present' | 'absent' | 'late' }
  const [statuses, setStatuses] = useState({});
  const [initialStatuses, setInitialStatuses] = useState({});

  // History list of past sessions for selected class
  const [history, setHistory] = useState([]);
  
  // Session edit status
  const [hasExistingSession, setHasExistingSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Roster search filter
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Load mentor classes on mount
  useEffect(() => {
    async function loadMentorClasses() {
      try {
        setIsLoading(true);
        setError(null);
        const mentorClasses = await mentorService.getMentorClasses(mentorId);
        setClasses(mentorClasses);

        if (mentorClasses.length > 0) {
          // If query param specifies a valid class, select it; otherwise default to first class
          const targetClass = mentorClasses.find((c) => c.id === paramClassId) || mentorClasses[0];
          setSelectedClassId(targetClass.id);
          setSessionSubject(targetClass.subject || targetClass.name);
        }
      } catch (err) {
        console.error('Failed to load mentor classes:', err);
        setError(err.message || 'Unable to load your classes.');
      } finally {
        setIsLoading(false);
      }
    }

    loadMentorClasses();
  }, [mentorId, paramClassId]);

  // Selected class metadata
  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || null;
  }, [classes, selectedClassId]);

  // 2. Load class roster, session attendance records, and history when class or date changes
  const loadClassSessionAndHistory = useCallback(async (classId, date) => {
    if (!classId) return;

    try {
      setError(null);
      
      const [classStudents, sessionData, historyData] = await Promise.all([
        mentorService.getClassStudents(classId),
        attendanceService.getClassSessionAttendance(classId, date),
        attendanceService.getClassAttendanceHistory(classId),
      ]);

      setStudents(classStudents);
      setHistory(historyData);
      setHasExistingSession(sessionData.hasExisting);

      // Populate status map
      const initialMap = {};
      classStudents.forEach((student) => {
        // If an existing record was saved for this student on this date, load it
        if (sessionData.recordsMap && sessionData.recordsMap[student.id]) {
          initialMap[student.id] = sessionData.recordsMap[student.id];
        } else {
          // Default to 'present' for new sessions
          initialMap[student.id] = 'present';
        }
      });

      setStatuses(initialMap);
      setInitialStatuses(initialMap);
    } catch (err) {
      console.error('Failed to load class session data:', err);
      setError(err.message || 'Error loading attendance details.');
    }
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadClassSessionAndHistory(selectedClassId, sessionDate);
    }
  }, [selectedClassId, sessionDate, loadClassSessionAndHistory]);

  // Handle Class Switcher
  const handleClassChange = (e) => {
    const newClassId = e.target.value;
    setSelectedClassId(newClassId);
    setSearchParams({ classId: newClassId });
    const found = classes.find((c) => c.id === newClassId);
    if (found) {
      setSessionSubject(found.subject || found.name);
    }
    setSearchQuery('');
  };

  // Three-way toggle handler for a single student
  const handleStatusChange = (studentId, newStatus) => {
    setStatuses((prev) => ({
      ...prev,
      [studentId]: newStatus,
    }));
  };

  // Bulk action: Mark All Present
  const handleMarkAllPresent = () => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = 'present';
    });
    setStatuses(updated);
  };

  // Bulk action: Mark All Absent
  const handleMarkAllAbsent = () => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = 'absent';
    });
    setStatuses(updated);
  };

  // Reset to initial loaded state
  const handleReset = () => {
    setStatuses({ ...initialStatuses });
  };

  // Save Attendance Action
  const handleSaveAttendance = async () => {
    if (!selectedClassId || !sessionDate) {
      setError('Please select a class and date.');
      return;
    }

    if (students.length === 0) {
      setError('No students enrolled in this class to mark attendance.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const studentStatuses = students.map((s) => ({
        studentId: s.id,
        status: statuses[s.id] || 'present',
      }));

      await attendanceService.saveClassSessionAttendance({
        classId: selectedClassId,
        sessionDate,
        subject: sessionSubject || currentClass?.name,
        studentStatuses,
      });

      // Update local state to reflect that session is now saved (editing mode)
      setHasExistingSession(true);
      setInitialStatuses({ ...statuses });

      // Refresh history list
      const updatedHistory = await attendanceService.getClassAttendanceHistory(selectedClassId);
      setHistory(updatedHistory);

      // Toast feedback
      setToastMessage({
        type: 'success',
        text: `Attendance saved successfully for ${currentClass?.name || 'Class'} on ${sessionDate}! (${studentStatuses.length} students recorded)`,
      });

      // Auto dismiss toast after 4s
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
    } catch (err) {
      console.error('Failed to save attendance:', err);
      setError(err.message || 'Failed to save attendance records. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Edit past session from history list
  const handleEditPastSession = (dateStr) => {
    setSessionDate(dateStr);
    // Smooth scroll up to attendance marking card
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format date helper
  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  // Current session live statistics
  const currentTally = useMemo(() => {
    let present = 0;
    let late = 0;
    let absent = 0;

    students.forEach((s) => {
      const st = statuses[s.id];
      if (st === 'present') present++;
      else if (st === 'late') late++;
      else if (st === 'absent') absent++;
    });

    const total = students.length;
    const attended = present + late;
    const rate = total > 0 ? Math.round((attended / total) * 100) : 100;

    return { total, present, late, absent, attended, rate };
  }, [students, statuses]);

  // Filter students by search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase().trim();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  if (isLoading && classes.length === 0) {
    return <LoadingState message="Loading class attendance management..." minHeight="60vh" />;
  }

  if (classes.length === 0) {
    return (
      <div className="mark-attendance-page">
        <div className="mark-attendance-header">
          <div>
            <h1 className="mark-attendance-title">Mark Class Attendance</h1>
            <p className="mark-attendance-subtitle">
              Record daily session attendance and track student presence.
            </p>
          </div>
        </div>

        <Card className="attendance-empty-state-card">
          <CalendarCheck className="empty-state-icon" />
          <h2 className="empty-state-title">No Classes Available</h2>
          <p className="empty-state-text">
            You don't have any classes created yet. Create your first class section to begin marking attendance.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/mentor/classes')}
          >
            Go to Classes
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mark-attendance-page">
      {/* Page Header */}
      <div className="mark-attendance-header">
        <div>
          <h1 className="mark-attendance-title">Mark Class Attendance</h1>
          <p className="mark-attendance-subtitle">
            Record session presence, update student scores in real-time, and view historical session records.
          </p>
        </div>

        {/* Live session quick tally badge */}
        {students.length > 0 && (
          <div className="header-rate-badge">
            <span className="header-rate-label">Session Presence</span>
            <span className={`header-rate-value ${currentTally.rate >= 75 ? 'rate-good' : 'rate-warning'}`}>
              {currentTally.rate}%
            </span>
          </div>
        )}
      </div>

      {/* Toast Banner */}
      {toastMessage && (
        <div className={`attendance-toast toast-${toastMessage.type}`} role="alert">
          <CheckCircle className="toast-icon" />
          <span>{toastMessage.text}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="attendance-error-banner" role="alert">
          <AlertTriangle className="error-icon" />
          <span>{error}</span>
          <button
            type="button"
            className="error-close"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Session Configuration Card */}
      <Card className="attendance-config-card">
        <div className="config-grid">
          {/* Class Selector */}
          <div className="config-field">
            <label htmlFor="class-select" className="config-label">
              Select Class
            </label>
            <select
              id="class-select"
              className="config-select"
              value={selectedClassId}
              onChange={handleClassChange}
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.join_code || cls.subject})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="config-field">
            <label htmlFor="session-date" className="config-label">
              Session Date
            </label>
            <div className="date-input-wrapper">
              <input
                id="session-date"
                type="date"
                className="config-date-input"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                max={getTodayDateStr()}
              />
              <button
                type="button"
                className="date-today-btn"
                onClick={() => setSessionDate(getTodayDateStr())}
                title="Set to today's date"
              >
                Today
              </button>
            </div>
          </div>

          {/* Subject / Topic Field */}
          <div className="config-field config-field-wide">
            <label htmlFor="session-subject" className="config-label">
              Lecture Topic / Subject
            </label>
            <input
              id="session-subject"
              type="text"
              className="config-text-input"
              value={sessionSubject}
              onChange={(e) => setSessionSubject(e.target.value)}
              placeholder="e.g. Memory Management & Paging"
            />
          </div>
        </div>

        {/* Status Callout Banner */}
        <div className={`session-status-banner ${hasExistingSession ? 'banner-editing' : 'banner-new'}`}>
          <div className="banner-content">
            {hasExistingSession ? (
              <>
                <Edit2 size={18} className="banner-icon-editing" />
                <div>
                  <strong className="banner-title">Editing Past Attendance Session</strong>
                  <p className="banner-desc">
                    Attendance records already exist for <strong>{formatDateDisplay(sessionDate)}</strong>. Saving will update these records with zero duplicate entries.
                  </p>
                </div>
              </>
            ) : (
              <>
                <Calendar size={18} className="banner-icon-new" />
                <div>
                  <strong className="banner-title">New Attendance Session</strong>
                  <p className="banner-desc">
                    Marking attendance for <strong>{formatDateDisplay(sessionDate)}</strong>. All students start marked present by default.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="banner-date-badge">
            {sessionDate === getTodayDateStr() ? 'Today’s Class' : formatDateDisplay(sessionDate)}
          </div>
        </div>
      </Card>

      {/* Student Roster Card */}
      <Card className="attendance-roster-card">
        {/* Roster Toolbar */}
        <div className="roster-toolbar">
          <div className="roster-meta">
            <h2 className="roster-title">
              Enrolled Students ({students.length})
            </h2>
            <div className="roster-stats-pill">
              <span className="pill-stat stat-present">
                <span className="dot dot-present"></span> {currentTally.present} Present
              </span>
              <span className="pill-stat stat-late">
                <span className="dot dot-late"></span> {currentTally.late} Late
              </span>
              <span className="pill-stat stat-absent">
                <span className="dot dot-absent"></span> {currentTally.absent} Absent
              </span>
            </div>
          </div>

          {/* Shortcuts & Search */}
          <div className="roster-actions">
            <div className="roster-search-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="roster-search-input"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllPresent}
              className="shortcut-btn shortcut-present"
              title="Set all students to Present"
            >
              <CheckCheck size={16} />
              <span>Mark all present</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAbsent}
              className="shortcut-btn shortcut-absent"
              title="Set all students to Absent"
            >
              <XCircle size={16} />
              <span>Mark all absent</span>
            </Button>
          </div>
        </div>

        {/* Roster Table */}
        {students.length === 0 ? (
          <div className="roster-empty-notice">
            <Users size={36} className="roster-empty-icon" />
            <p className="roster-empty-text">
              No students are currently enrolled in <strong>{currentClass?.name}</strong>.
            </p>
            <p className="roster-empty-subtext">
              Share the class join code <code>{currentClass?.join_code}</code> with your students to get started.
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="roster-no-match">
            <p>No students match "{searchQuery}".</p>
            <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
              Clear filter
            </Button>
          </div>
        ) : (
          <div className="roster-table-container">
            <table className="roster-table">
              <thead>
                <tr>
                  <th scope="col" className="th-student">Student</th>
                  <th scope="col" className="th-standing">Overall Attendance</th>
                  <th scope="col" className="th-toggle">Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const currentStatus = statuses[student.id] || 'present';
                  const initials = student.name
                    ? student.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : 'ST';

                  const attendanceStanding = student.attendance_pct ?? 85;
                  const isLowStanding = attendanceStanding < 75;

                  return (
                    <tr key={student.id} className="roster-row">
                      {/* Student Info */}
                      <td className="td-student">
                        <div className="student-info-cell">
                          <div className="student-avatar" aria-hidden="true">
                            {initials}
                          </div>
                          <div>
                            <div className="student-name">{student.name}</div>
                            <div className="student-email">{student.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Overall Standing */}
                      <td className="td-standing">
                        <div className="standing-cell">
                          <span className={`standing-badge ${isLowStanding ? 'standing-low' : 'standing-good'}`}>
                            {attendanceStanding}%
                          </span>
                          {isLowStanding && (
                            <span className="low-standing-alert" title="Attendance is below the required 75% threshold">
                              <AlertTriangle size={14} /> Below 75%
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Three-way Toggle */}
                      <td className="td-toggle">
                        <div className="three-way-toggle" role="group" aria-label={`Attendance status for ${student.name}`}>
                          <button
                            type="button"
                            className={`toggle-option toggle-present ${currentStatus === 'present' ? 'active' : ''}`}
                            onClick={() => handleStatusChange(student.id, 'present')}
                            aria-pressed={currentStatus === 'present'}
                          >
                            <Check size={16} />
                            <span>Present</span>
                          </button>

                          <button
                            type="button"
                            className={`toggle-option toggle-late ${currentStatus === 'late' ? 'active' : ''}`}
                            onClick={() => handleStatusChange(student.id, 'late')}
                            aria-pressed={currentStatus === 'late'}
                          >
                            <Clock size={16} />
                            <span>Late</span>
                          </button>

                          <button
                            type="button"
                            className={`toggle-option toggle-absent ${currentStatus === 'absent' ? 'active' : ''}`}
                            onClick={() => handleStatusChange(student.id, 'absent')}
                            aria-pressed={currentStatus === 'absent'}
                          >
                            <X size={16} />
                            <span>Absent</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Actions */}
        {students.length > 0 && (
          <div className="roster-footer">
            <div className="footer-summary">
              Marking <strong>{currentTally.attended}</strong> out of <strong>{currentTally.total}</strong> students present/late ({currentTally.rate}% rate).
            </div>

            <div className="footer-button-group">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isSaving}
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </Button>

              <Button
                variant="primary"
                onClick={handleSaveAttendance}
                isLoading={isSaving}
                className="save-attendance-btn"
              >
                <Save size={16} />
                <span>{hasExistingSession ? 'Update Attendance' : 'Save Attendance'}</span>
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Past Sessions History Card */}
      <Card className="attendance-history-card">
        <div className="history-header">
          <div>
            <h2 className="history-title">
              Session History for {currentClass?.name || 'Class'}
            </h2>
            <p className="history-subtitle">
              Past marked sessions and class attendance percentages. Click "Edit" to review or update records.
            </p>
          </div>
          <span className="history-count-badge">
            {history.length} {history.length === 1 ? 'Session' : 'Sessions'} Recorded
          </span>
        </div>

        {history.length === 0 ? (
          <div className="history-empty-state">
            <CalendarCheck size={32} className="history-empty-icon" />
            <p className="history-empty-title">No past sessions recorded yet</p>
            <p className="history-empty-text">
              When you record attendance for this class section, each date's records and attendance rate will appear here.
            </p>
          </div>
        ) : (
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th scope="col">Session Date</th>
                  <th scope="col">Topic / Subject</th>
                  <th scope="col">Attendance Rate</th>
                  <th scope="col">Status Breakdown</th>
                  <th scope="col" className="th-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((session) => {
                  const isCurrent = session.date === sessionDate;
                  const isGoodRate = session.percentage >= 75;

                  return (
                    <tr
                      key={session.date}
                      className={`history-row ${isCurrent ? 'history-row-current' : ''}`}
                    >
                      <td className="td-history-date">
                        <div className="history-date-cell">
                          <span className="history-date-text">
                            {formatDateDisplay(session.date)}
                          </span>
                          {isCurrent && (
                            <span className="current-editing-pill">
                              Currently Loaded
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="td-history-subject">
                        <span className="history-subject-text">
                          {session.subject || currentClass?.name}
                        </span>
                      </td>

                      <td className="td-history-rate">
                        <div className="history-rate-cell">
                          <span className={`history-rate-pill ${isGoodRate ? 'rate-pill-good' : 'rate-pill-low'}`}>
                            {session.percentage}%
                          </span>
                          <span className="history-standing-text">
                            {isGoodRate ? 'Good Standing' : 'Below 75%'}
                          </span>
                        </div>
                      </td>

                      <td className="td-history-breakdown">
                        <div className="history-breakdown-cell">
                          <span className="breakdown-tag tag-present">
                            {session.present} Present
                          </span>
                          {session.late > 0 && (
                            <span className="breakdown-tag tag-late">
                              {session.late} Late
                            </span>
                          )}
                          <span className="breakdown-tag tag-absent">
                            {session.absent} Absent
                          </span>
                          <span className="breakdown-total">
                            ({session.total} total)
                          </span>
                        </div>
                      </td>

                      <td className="td-history-action">
                        <Button
                          variant={isCurrent ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => handleEditPastSession(session.date)}
                          className="history-edit-btn"
                          title={`Load records for ${session.date} into editor`}
                        >
                          <Edit2 size={14} />
                          <span>{isCurrent ? 'Loaded' : 'Edit'}</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default MarkAttendance;
