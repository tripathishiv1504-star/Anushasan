import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Users,
  Award,
  AlertTriangle,
  CalendarCheck,
  Filter,
  BarChart2,
  Activity,
  Layers,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import DeptChart from '../../components/admin/DeptChart';
import './Analytics.css';

export function Analytics() {
  const [classFilter, setClassFilter] = useState('all');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.getDepartmentAnalytics({
        classId: classFilter,
        departmentId: 'dept_cs',
      });
      setAnalyticsData(data);
    } catch (err) {
      console.error('Failed to load department analytics:', err);
      setError(err.message || 'Unable to retrieve department analytics.');
    } finally {
      setIsLoading(false);
    }
  }, [classFilter]);

  useEffect(() => {
    loadAnalytics();

    const handleSync = () => {
      loadAnalytics();
    };

    window.addEventListener('anushasan:classes_updated', handleSync);
    window.addEventListener('anushasan:attendance_updated', handleSync);

    return () => {
      window.removeEventListener('anushasan:classes_updated', handleSync);
      window.removeEventListener('anushasan:attendance_updated', handleSync);
    };
  }, [loadAnalytics]);

  if (isLoading && !analyticsData) {
    return (
      <LoadingState
        message="Aggregating department analytics & score telemetry..."
        minHeight="60vh"
      />
    );
  }

  const summary = analyticsData?.summary || {
    totalStudents: 0,
    averageDisciplineScore: 0,
    atRiskCount: 0,
    averageAttendance: 0,
  };

  const getScoreBand = (score) => {
    if (score >= 85) return { label: 'Excellent Tier', variant: 'success' };
    if (score >= 70) return { label: 'Consistent & Good', variant: 'primary' };
    if (score >= 50) return { label: 'Needs Guidance', variant: 'warning' };
    return { label: 'Critical Intervention', variant: 'danger' };
  };

  const scoreBand = getScoreBand(summary.averageDisciplineScore);

  return (
    <div className="dept-analytics-page">
      {/* Page Header with Filter Controls */}
      <div className="analytics-header">
        <div>
          <h1 className="analytics-title">Department Analytics & Insights</h1>
          <p className="analytics-subtitle">
            Holistic cross-classroom discipline scores, attendance health, and academic risk metrics.
          </p>
        </div>

        {/* Class Filter Dropdown */}
        <div className="analytics-filter-box">
          <Filter size={16} className="filter-icon" />
          <label htmlFor="analytics-class-filter" className="filter-label">
            Class Filter:
          </label>
          <select
            id="analytics-class-filter"
            className="filter-select"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="all">All Classes (Department-wide)</option>
            {analyticsData?.classes?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="analytics-error-banner" role="alert">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <div className="analytics-metrics-grid">
        {/* Card 1: Total Enrolled Students */}
        <Card className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Total Enrolled Students</span>
            <div className="metric-icon-box icon-students">
              <Users size={20} />
            </div>
          </div>
          <div className="metric-val">{summary.totalStudents}</div>
          <div className="metric-caption">
            <span>Across active department sections</span>
          </div>
        </Card>

        {/* Card 2: Average Discipline Score */}
        <Card className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Avg. Discipline Score</span>
            <div className="metric-icon-box icon-score">
              <Award size={20} />
            </div>
          </div>
          <div className="metric-val">
            {summary.averageDisciplineScore}
            <span className="metric-unit">/100</span>
          </div>
          <div className="metric-badge-row">
            <span className={`status-pill pill-${scoreBand.variant}`}>
              {scoreBand.label}
            </span>
          </div>
        </Card>

        {/* Card 3: At-Risk Students */}
        <Card className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Students at Risk</span>
            <div className="metric-icon-box icon-risk">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="metric-val val-risk">
            {summary.atRiskCount}
            <span className="metric-unit">
              {summary.totalStudents > 0
                ? ` (${Math.round((summary.atRiskCount / summary.totalStudents) * 100)}%)`
                : ''}
            </span>
          </div>
          <div className="metric-caption">
            <span className="text-risk">
              {summary.atRiskCount === 0
                ? 'No immediate flags'
                : 'Score < 50 or drop >= 15 pts'}
            </span>
          </div>
        </Card>

        {/* Card 4: Average Attendance */}
        <Card className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Average Attendance</span>
            <div className="metric-icon-box icon-attendance">
              <CalendarCheck size={20} />
            </div>
          </div>
          <div className="metric-val">
            {summary.averageAttendance}
            <span className="metric-unit">%</span>
          </div>
          <div className="metric-caption">
            <span>
              {summary.averageAttendance >= 75
                ? 'Above campus 75% threshold'
                : 'Below minimum attendance policy'}
            </span>
          </div>
        </Card>
      </div>

      {/* Dual Charts Grid: Class Comparison + 8-Week Score Trend */}
      <div className="analytics-charts-grid">
        {/* Chart 1: Class Comparison Bar Chart */}
        <Card className="chart-card">
          <DeptChart
            type="comparison"
            data={analyticsData?.classComparison || []}
            title="Class Performance Comparison"
            subtitle="Comparing Discipline Scores and Attendance % across course sections"
            height={270}
          />
        </Card>

        {/* Chart 2: 8-Week Department Score Trend */}
        <Card className="chart-card">
          <DeptChart
            type="trend"
            data={analyticsData?.weeklyTrend || []}
            title="8-Week Score Trajectory"
            subtitle={
              classFilter === 'all'
                ? 'Department-wide historical discipline trajectory over past 8 weeks'
                : 'Section historical score trajectory over past 8 weeks'
            }
            height={270}
          />
        </Card>
      </div>

      {/* Score Distribution Breakdown Strip */}
      <Card className="distribution-card">
        <div className="distribution-header">
          <div className="dist-title-box">
            <Activity size={18} className="dist-icon" />
            <div>
              <h3 className="dist-title">Discipline Score Distribution</h3>
              <p className="dist-subtitle">
                Student dispersion across academic discipline categories
              </p>
            </div>
          </div>
        </div>

        <div className="distribution-bands-grid">
          <div className="dist-band-box band-critical">
            <div className="dist-band-top">
              <span className="band-name">Critical Tier (&lt; 50)</span>
              <span className="band-count">
                {analyticsData?.scoreDistribution?.critical || 0} Students
              </span>
            </div>
            <div className="band-bar-track">
              <div
                className="band-bar-fill fill-critical"
                style={{
                  width: `${
                    summary.totalStudents > 0
                      ? ((analyticsData?.scoreDistribution?.critical || 0) /
                          summary.totalStudents) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="dist-band-box band-attention">
            <div className="dist-band-top">
              <span className="band-name">Needs Attention (50-69)</span>
              <span className="band-count">
                {analyticsData?.scoreDistribution?.attention || 0} Students
              </span>
            </div>
            <div className="band-bar-track">
              <div
                className="band-bar-fill fill-attention"
                style={{
                  width: `${
                    summary.totalStudents > 0
                      ? ((analyticsData?.scoreDistribution?.attention || 0) /
                          summary.totalStudents) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="dist-band-box band-good">
            <div className="dist-band-top">
              <span className="band-name">Consistent & Good (70-84)</span>
              <span className="band-count">
                {analyticsData?.scoreDistribution?.good || 0} Students
              </span>
            </div>
            <div className="band-bar-track">
              <div
                className="band-bar-fill fill-good"
                style={{
                  width: `${
                    summary.totalStudents > 0
                      ? ((analyticsData?.scoreDistribution?.good || 0) /
                          summary.totalStudents) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="dist-band-box band-excellent">
            <div className="dist-band-top">
              <span className="band-name">Exemplary Tier (85-100)</span>
              <span className="band-count">
                {analyticsData?.scoreDistribution?.excellent || 0} Students
              </span>
            </div>
            <div className="band-bar-track">
              <div
                className="band-bar-fill fill-excellent"
                style={{
                  width: `${
                    summary.totalStudents > 0
                      ? ((analyticsData?.scoreDistribution?.excellent || 0) /
                          summary.totalStudents) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Class Telemetry Breakdown Table */}
      <Card className="telemetry-table-card">
        <div className="table-header-row">
          <div>
            <h3 className="table-header-title">Course Sections Overview</h3>
            <p className="table-header-subtitle">
              Detailed breakdown of discipline score, attendance, and risk flags per class
            </p>
          </div>
        </div>

        <div className="table-responsive-container">
          <table className="telemetry-table">
            <thead>
              <tr>
                <th scope="col">Course Section & Code</th>
                <th scope="col">Assigned Faculty Mentor</th>
                <th scope="col">Students Enrolled</th>
                <th scope="col">Avg. Discipline Score</th>
                <th scope="col">Attendance Rate</th>
                <th scope="col">At-Risk Count</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData?.classComparison?.map((cls) => (
                <tr key={cls.id} className="telemetry-row">
                  <td className="td-course-info">
                    <strong className="course-name">{cls.name}</strong>
                    <span className="join-code-tag">Code: {cls.join_code}</span>
                  </td>

                  <td className="td-mentor">
                    <span>{cls.mentor_name || 'Faculty Mentor'}</span>
                  </td>

                  <td className="td-enrollment">
                    <span>{cls.student_count} Students</span>
                  </td>

                  <td className="td-score">
                    <div className="score-cell-box">
                      <strong className="score-number">{cls.avg_score}</strong>
                      <div className="score-mini-track">
                        <div
                          className="score-mini-fill"
                          style={{
                            width: `${cls.avg_score}%`,
                            backgroundColor:
                              cls.avg_score >= 70
                                ? 'var(--color-primary)'
                                : cls.avg_score >= 50
                                ? '#f59e0b'
                                : '#ef4444',
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="td-attendance">
                    <span
                      className={`attendance-pill ${
                        cls.avg_attendance >= 75
                          ? 'attendance-healthy'
                          : 'attendance-low'
                      }`}
                    >
                      {cls.avg_attendance}%
                    </span>
                  </td>

                  <td className="td-risk">
                    {cls.at_risk_count > 0 ? (
                      <span className="risk-indicator-pill">
                        <AlertTriangle size={13} />
                        <span>{cls.at_risk_count} At-Risk</span>
                      </span>
                    ) : (
                      <span className="clean-indicator-pill">All On Track</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default Analytics;
