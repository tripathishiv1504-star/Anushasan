import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  AlertTriangle,
  CalendarCheck,
  Target,
  Copy,
  Check,
  TrendingUp,
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { ROUTES } from '../../routes/routeConfig';
import { mentorService } from '../../services/mentorService';
import StudentTable from '../../components/mentor/StudentTable';
import StudentDetailDrawer from '../../components/mentor/StudentDetailDrawer';
import LoadingState from '../../components/common/LoadingState';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import './ClassDashboard.css';

export function ClassDashboard() {
  const { classId } = useParams();

  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected student for slide-over side panel
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Join code copy state
  const [isCopied, setIsCopied] = useState(false);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await mentorService.getClassOverview(classId);
      setOverview(data);
    } catch (err) {
      console.error('Failed to load class overview:', err);
      setError(err.message || 'Could not load class dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [classId]);

  const handleCopyCode = async () => {
    const code = overview?.classInfo?.join_code;
    if (!code) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading class performance analytics..." />;
  }

  if (error || !overview) {
    return (
      <div className="card card--padding-lg" style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
        <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-4)' }}>
          {error || 'Class not found.'}
        </p>
        <Link to={ROUTES.mentorClasses}>
          <Button variant="secondary">Back to My Classes</Button>
        </Link>
      </div>
    );
  }

  const { classInfo, students, stats, scoreDistribution } = overview;

  return (
    <div className="class-dashboard">
      {/* Back Link */}
      <Link to={ROUTES.mentorClasses} className="class-dashboard__back-link">
        <ArrowLeft size={16} />
        <span>Back to My Classes</span>
      </Link>

      {/* Header */}
      <div className="class-dashboard__header">
        <div className="class-dashboard__title-group">
          <h1>{classInfo.name}</h1>
          <div className="class-dashboard__meta-row">
            <Badge variant="primary">{classInfo.subject || 'Computer Science'}</Badge>

            <div className="class-dashboard__code-pill">
              <span style={{ color: 'var(--color-text-muted)' }}>Join Code:</span>
              <span className="class-dashboard__code-value">{classInfo.join_code}</span>
              <button
                type="button"
                className="class-dashboard__copy-mini-btn"
                onClick={handleCopyCode}
                title="Copy join code"
                aria-label="Copy join code"
              >
                {isCopied ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 Summary Stat Cards */}
      <div className="class-dashboard__stats">
        {/* Average Score */}
        <div className="class-dashboard__stat-card">
          <div className="class-dashboard__stat-icon class-dashboard__stat-icon--primary">
            <TrendingUp size={22} />
          </div>
          <div className="class-dashboard__stat-info">
            <span className="class-dashboard__stat-value">{stats.averageScore} / 100</span>
            <span className="class-dashboard__stat-label">Average Discipline Score</span>
          </div>
        </div>

        {/* Students At Risk */}
        <div className="class-dashboard__stat-card">
          <div
            className={`class-dashboard__stat-icon ${
              stats.studentsAtRisk > 0
                ? 'class-dashboard__stat-icon--danger'
                : 'class-dashboard__stat-icon--success'
            }`}
          >
            <AlertTriangle size={22} />
          </div>
          <div className="class-dashboard__stat-info">
            <span
              className="class-dashboard__stat-value"
              style={{ color: stats.studentsAtRisk > 0 ? 'var(--color-danger)' : 'var(--color-text)' }}
            >
              {stats.studentsAtRisk}
            </span>
            <span className="class-dashboard__stat-label">
              {stats.studentsAtRisk === 1 ? 'Student at Risk' : 'Students at Risk'}
            </span>
          </div>
        </div>

        {/* Average Attendance */}
        <div className="class-dashboard__stat-card">
          <div className="class-dashboard__stat-icon class-dashboard__stat-icon--success">
            <CalendarCheck size={22} />
          </div>
          <div className="class-dashboard__stat-info">
            <span className="class-dashboard__stat-value">{stats.averageAttendance}%</span>
            <span className="class-dashboard__stat-label">Average Attendance</span>
          </div>
        </div>

        {/* Goals on Track */}
        <div className="class-dashboard__stat-card">
          <div className="class-dashboard__stat-icon class-dashboard__stat-icon--accent">
            <Target size={22} />
          </div>
          <div className="class-dashboard__stat-info">
            <span className="class-dashboard__stat-value">{stats.goalsOnTrackPct}%</span>
            <span className="class-dashboard__stat-label">
              Goals on Track ({stats.goalsOnTrackCount}/{stats.totalStudents})
            </span>
          </div>
        </div>
      </div>

      {/* Class Score Distribution Chart */}
      <div className="class-dashboard__chart-card">
        <div className="class-dashboard__chart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={18} style={{ color: '#4F46E5' }} />
            <h3 className="class-dashboard__chart-title">Class Score Distribution</h3>
          </div>

          <div className="class-dashboard__chart-legend">
            <span className="class-dashboard__legend-item">
              <span className="class-dashboard__legend-dot" style={{ background: '#DC2626' }} />
              <span>At Risk (&lt; 50)</span>
            </span>
            <span className="class-dashboard__legend-item">
              <span className="class-dashboard__legend-dot" style={{ background: '#F59E0B' }} />
              <span>Passing (50-69)</span>
            </span>
            <span className="class-dashboard__legend-item">
              <span className="class-dashboard__legend-dot" style={{ background: '#0F766E' }} />
              <span>Good (70-84)</span>
            </span>
            <span className="class-dashboard__legend-item">
              <span className="class-dashboard__legend-dot" style={{ background: '#16A34A' }} />
              <span>Excellent (85-100)</span>
            </span>
          </div>
        </div>

        <div style={{ width: '100%', height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={scoreDistribution}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis dataKey="range" stroke="var(--color-text-muted)" fontSize={12} />
              <YAxis allowDecimals={false} stroke="var(--color-text-muted)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {scoreDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sortable & Searchable Student Table */}
      <StudentTable
        students={students}
        onSelectStudent={(student) => setSelectedStudent(student)}
      />

      {/* Slide-over Side Panel for Student Details */}
      <StudentDetailDrawer
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}

export default ClassDashboard;
