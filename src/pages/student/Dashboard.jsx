import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  CalendarCheck,
  Play,
  AlertTriangle,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../routes/routeConfig';
import { scoreService } from '../../services/scoreService';
import { formatDuration } from '../../utils/dates';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import ScoreRing from '../../components/student/ScoreRing';
import StreakCard from '../../components/student/StreakCard';
import TodayTasks from '../../components/student/TodayTasks';
import WeekChart from '../../components/student/WeekChart';
import './Dashboard.css';

/**
 * Format today's date in full localized string (e.g. "Monday, October 13, 2026")
 */
function getFormattedToday() {
  const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
}

/**
 * Get greeting based on time of day
 */
function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingTaskId, setTogglingTaskId] = useState(null);

  const studentId = user?.id || 'user_student_1';
  const studyMode = user?.study_mode || 'class';
  const isSolo = studyMode === 'solo';

  // Load dashboard data via service
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await scoreService.getStudentDashboardData(studentId, studyMode);
      setDashboardData(data);
    } catch (err) {
      console.error('[Dashboard] Error loading dashboard data:', err);
      setError(err.message || 'Failed to load student dashboard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [studentId, studyMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle interactive task toggle
  const handleToggleTask = async (taskId) => {
    try {
      setTogglingTaskId(taskId);
      const { dashboardData: updatedData } = await scoreService.toggleTask(
        taskId,
        studentId,
        studyMode
      );
      setDashboardData(updatedData);
    } catch (err) {
      console.error('[Dashboard] Error toggling task:', err);
    } finally {
      setTogglingTaskId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="student-dashboard__loading">
        <LoadingState message="Loading your academic progress and score..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-dashboard__error">
        <ErrorState
          title="Could not load dashboard"
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  const {
    disciplineScore,
    streak,
    todayMinutes,
    todayTasks,
    tasksDoneTodayCount,
    totalTasksTodayCount,
    weeklyMinutes,
    attendanceSummary,
  } = dashboardData || {};

  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'Student';
  const greeting = `${getTimeGreeting()}, ${firstName}!`;
  const isAtRisk = disciplineScore?.isAtRisk;
  const totalScore = disciplineScore?.totalScore || 0;
  const breakdown = disciplineScore?.breakdown || {};

  return (
    <div className="student-dashboard">
      {/* 1. Header greeting with student first name, date & mode badge */}
      <div className="student-dashboard__header">
        <div className="student-dashboard__welcome">
          <div className="student-dashboard__greeting-row">
            <h1 className="student-dashboard__greeting">{greeting}</h1>
            <Badge
              variant={isSolo ? 'accent' : 'primary'}
              size="md"
              className="student-dashboard__mode-badge"
            >
              {isSolo ? 'Solo Growth Mode' : 'Class Mode'}
            </Badge>
          </div>
          <p className="student-dashboard__date">{getFormattedToday()}</p>
        </div>

        <div className="student-dashboard__actions">
          <Link to={ROUTES.studentStudy}>
            <Button variant="primary" icon={Play} size="md">
              Start Study Session
            </Button>
          </Link>
        </div>
      </div>

      {/* Risk Rule Alert Banner */}
      {isAtRisk && (
        <div className="student-dashboard__risk-alert" role="alert">
          <div className="student-dashboard__risk-alert-icon">
            <AlertTriangle size={20} />
          </div>
          <div className="student-dashboard__risk-alert-content">
            <h4 className="student-dashboard__risk-alert-title">Discipline Recovery Needed</h4>
            <p className="student-dashboard__risk-alert-text">
              Your weekly discipline score is below 50 or dropped significantly. Complete your pending
              tasks and log 30+ minutes of study today to get back on track!
            </p>
          </div>
          <Link to={ROUTES.studentStudy}>
            <Button variant="outline" size="sm" className="student-dashboard__risk-alert-btn">
              Study Now
            </Button>
          </Link>
        </div>
      )}

      {/* 2. StatCards Row */}
      <div
        className={`student-dashboard__stats-grid ${
          isSolo ? 'student-dashboard__stats-grid--solo' : 'student-dashboard__stats-grid--class'
        }`}
      >
        {/* Discipline Score with ScoreRing */}
        <Card className="student-dashboard__score-card" padding="md">
          <div className="student-dashboard__score-card-inner">
            <ScoreRing
              score={totalScore}
              isAtRisk={isAtRisk}
              size={100}
              strokeWidth={8}
            />
            <div className="student-dashboard__score-details">
              <span className="student-dashboard__stat-label">Discipline Score</span>
              <span className="student-dashboard__score-status">
                {isAtRisk
                  ? 'At Risk'
                  : totalScore >= 75
                  ? 'Excellent'
                  : 'On Track'}
              </span>
              <span className="student-dashboard__score-caption">
                {disciplineScore?.delta !== undefined && disciplineScore.delta !== 0 ? (
                  <span
                    className={
                      disciplineScore.delta > 0
                        ? 'student-dashboard__trend--up'
                        : 'student-dashboard__trend--down'
                    }
                  >
                    {disciplineScore.delta > 0 ? `+${disciplineScore.delta}` : disciplineScore.delta}{' '}
                    pts vs last week
                  </span>
                ) : (
                  'Stable weekly standing'
                )}
              </span>
            </div>
          </div>
        </Card>

        {/* Current Streak */}
        <StreakCard streak={streak} todayMinutes={todayMinutes} />

        {/* Today's Study Time */}
        <StatCard
          title="Today’s Study Time"
          value={formatDuration(todayMinutes)}
          icon={Clock}
          color="primary"
          caption={
            todayMinutes >= 30
              ? 'Daily 30m goal achieved!'
              : `${30 - todayMinutes}m remaining to reach goal`
          }
        />

        {/* Tasks Done Today */}
        <StatCard
          title="Tasks Done Today"
          value={`${tasksDoneTodayCount} / ${totalTasksTodayCount}`}
          icon={CheckCircle2}
          color="accent"
          caption={
            totalTasksTodayCount > 0 && tasksDoneTodayCount === totalTasksTodayCount
              ? 'All tasks completed!'
              : `${totalTasksTodayCount - tasksDoneTodayCount} pending tasks today`
          }
        />

        {/* Attendance (Class mode only — strictly omitted in Solo mode) */}
        {!isSolo && attendanceSummary && (
          <StatCard
            title="Class Attendance"
            value={`${attendanceSummary.rate}%`}
            icon={CalendarCheck}
            color="success"
            caption={`${attendanceSummary.attended} of ${attendanceSummary.total} sessions attended`}
          />
        )}
      </div>

      {/* Main Content Layout (2 columns on desktop) */}
      <div className="student-dashboard__main-grid">
        {/* Left Column: Consistency Chart & Discipline Breakdown */}
        <div className="student-dashboard__main-col">
          {/* This Week Study Consistency Bar Chart */}
          <WeekChart data={weeklyMinutes} />

          {/* Discipline Breakdown Card */}
          <Card className="score-breakdown-card" padding="lg">
            <div className="score-breakdown-card__header">
              <div className="score-breakdown-card__title-row">
                <Award size={20} className="score-breakdown-card__icon" />
                <h3 className="score-breakdown-card__title">Score Components</h3>
              </div>
              <span className="score-breakdown-card__total-tag">
                {totalScore} / 100 Points
              </span>
            </div>
            <p className="score-breakdown-card__desc">
              Your weekly growth score is computed from 7-day consistency metrics per spec section 11:
            </p>

            <div className="score-breakdown-card__items">
              {/* 1. Study Consistency */}
              <div className="score-component">
                <div className="score-component__header">
                  <span className="score-component__name">Study Consistency (≥ 30m/day)</span>
                  <span className="score-component__points">
                    {breakdown.studyConsistency?.score} / {breakdown.studyConsistency?.max} pts
                  </span>
                </div>
                <div className="score-component__bar-track">
                  <div
                    className="score-component__bar-fill"
                    style={{
                      width: `${(breakdown.studyConsistency?.score / breakdown.studyConsistency?.max) * 100}%`,
                    }}
                  />
                </div>
                <span className="score-component__meta">
                  {breakdown.studyConsistency?.daysStudied} of 7 days met the 30-min threshold
                </span>
              </div>

              {/* 2. Task Completion */}
              <div className="score-component">
                <div className="score-component__header">
                  <span className="score-component__name">Task Completion</span>
                  <span className="score-component__points">
                    {breakdown.taskCompletion?.score} / {breakdown.taskCompletion?.max} pts
                  </span>
                </div>
                <div className="score-component__bar-track">
                  <div
                    className="score-component__bar-fill score-component__bar-fill--accent"
                    style={{
                      width: `${(breakdown.taskCompletion?.score / breakdown.taskCompletion?.max) * 100}%`,
                    }}
                  />
                </div>
                <span className="score-component__meta">
                  {breakdown.taskCompletion?.doneTasks} of {breakdown.taskCompletion?.totalTasks} tasks completed
                </span>
              </div>

              {/* 3. Habit Completion */}
              <div className="score-component">
                <div className="score-component__header">
                  <span className="score-component__name">Habit Log Consistency</span>
                  <span className="score-component__points">
                    {breakdown.habitCompletion?.score} / {breakdown.habitCompletion?.max} pts
                  </span>
                </div>
                <div className="score-component__bar-track">
                  <div
                    className="score-component__bar-fill score-component__bar-fill--info"
                    style={{
                      width: `${(breakdown.habitCompletion?.score / breakdown.habitCompletion?.max) * 100}%`,
                    }}
                  />
                </div>
                <span className="score-component__meta">
                  Daily streak habits & focus routines
                </span>
              </div>

              {/* 4. Attendance (Class mode only) */}
              {!isSolo && breakdown.attendance && (
                <div className="score-component">
                  <div className="score-component__header">
                    <span className="score-component__name">Classroom Attendance</span>
                    <span className="score-component__points">
                      {breakdown.attendance.score} / {breakdown.attendance.max} pts
                    </span>
                  </div>
                  <div className="score-component__bar-track">
                    <div
                      className="score-component__bar-fill score-component__bar-fill--success"
                      style={{
                        width: `${(breakdown.attendance.score / breakdown.attendance.max) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="score-component__meta">
                    {breakdown.attendance.ratePercent}% presence across enrolled lectures
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Today's Tasks & Quick Shortcuts */}
        <div className="student-dashboard__main-col">
          {/* Today's Tasks checklist */}
          <TodayTasks
            tasks={todayTasks}
            onToggle={handleToggleTask}
            togglingId={togglingTaskId}
          />

          {/* Quick Shortcuts */}
          <Card className="shortcuts-card" padding="lg">
            <h4 className="shortcuts-card__title">Quick Resources</h4>
            <div className="shortcuts-card__list">
              <Link to={ROUTES.studentLibrary} className="shortcut-item">
                <div className="shortcut-item__icon shortcut-item__icon--primary">
                  <BookOpen size={18} />
                </div>
                <div className="shortcut-item__info">
                  <span className="shortcut-item__label">Resource Library</span>
                  <span className="shortcut-item__desc">Access lecture notes and PYQs</span>
                </div>
              </Link>

              <Link to={ROUTES.studentHabitsGoals} className="shortcut-item">
                <div className="shortcut-item__icon shortcut-item__icon--accent">
                  <TrendingUp size={18} />
                </div>
                <div className="shortcut-item__info">
                  <span className="shortcut-item__label">Habits & Goals</span>
                  <span className="shortcut-item__desc">Track routines and earn badges</span>
                </div>
              </Link>

              {!isSolo && (
                <Link to={ROUTES.studentGrievances} className="shortcut-item">
                  <div className="shortcut-item__icon shortcut-item__icon--neutral">
                    <HelpCircle size={18} />
                  </div>
                  <div className="shortcut-item__info">
                    <span className="shortcut-item__label">Student Grievances</span>
                    <span className="shortcut-item__desc">Submit concerns to mentors</span>
                  </div>
                </Link>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
