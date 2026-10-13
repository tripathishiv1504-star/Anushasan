import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  CheckSquare,
  Sparkles,
  CalendarCheck,
  Lightbulb,
  Award,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import Card from '../common/Card';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import './WeeklySummary.css';

/**
 * Custom Tooltip for 8-Week Trend Line Chart
 */
function TrendTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="trend-tooltip">
        <span className="trend-tooltip-title">{data.label || data.week}</span>
        <div className="trend-tooltip-score-row">
          <span className="trend-tooltip-val">{data.score}</span>
          <span className="trend-tooltip-pts">/ 100 points</span>
        </div>
        {data.score >= 80 ? (
          <span className="trend-tooltip-badge trend-tooltip-badge--high">High Growth</span>
        ) : data.score >= 50 ? (
          <span className="trend-tooltip-badge trend-tooltip-badge--passing">Passing</span>
        ) : (
          <span className="trend-tooltip-badge trend-tooltip-badge--risk">At Risk (&lt;50)</span>
        )}
      </div>
    );
  }
  return null;
}

/**
 * WeeklySummary Component
 * Displays score comparison, weekly metrics, 3 dynamic rule-based insights,
 * and 8-week score trend line chart.
 *
 * @param {Object} reportData
 */
export function WeeklySummary({ reportData }) {
  if (!reportData) return null;

  const {
    currentScore,
    previousScore,
    scoreDelta,
    totalStudyHoursThisWeek,
    completedTasksCount,
    totalTasksCount,
    taskCompletionPercent,
    habitConsistencyPercent,
    attendanceRate,
    isSolo,
    insights = [],
    trendData = [],
  } = reportData;

  const isScoreUp = scoreDelta > 0;
  const isScoreDown = scoreDelta < 0;
  const isScoreFlat = scoreDelta === 0;

  return (
    <div className="weekly-summary">
      {/* Top Metric Cards Grid */}
      <div className="weekly-metrics-grid">
        {/* Score comparison card */}
        <Card className="weekly-metric-card weekly-metric-card--score">
          <div className="weekly-metric-top">
            <span className="weekly-metric-label">Discipline Score</span>
            <div
              className={`weekly-delta-pill ${
                isScoreUp
                  ? 'weekly-delta-pill--up'
                  : isScoreDown
                  ? 'weekly-delta-pill--down'
                  : 'weekly-delta-pill--flat'
              }`}
            >
              {isScoreUp ? (
                <TrendingUp size={13} />
              ) : isScoreDown ? (
                <TrendingDown size={13} />
              ) : (
                <Minus size={13} />
              )}
              <span>
                {isScoreUp ? `+${scoreDelta}` : scoreDelta} pts vs last week
              </span>
            </div>
          </div>

          <div className="weekly-score-display">
            <span className="weekly-score-number">{currentScore}</span>
            <span className="weekly-score-max">/ 100</span>
          </div>

          <div className="weekly-score-footer">
            <span>Last week: <strong>{previousScore} pts</strong></span>
            <span>Scale: 0-100</span>
          </div>
        </Card>

        {/* Study Hours Card */}
        <Card className="weekly-metric-card">
          <div className="weekly-metric-top">
            <span className="weekly-metric-label">Study Hours</span>
            <Clock size={16} className="weekly-metric-icon weekly-metric-icon--teal" />
          </div>
          <div className="weekly-metric-value">{totalStudyHoursThisWeek} <span className="weekly-metric-unit">hrs</span></div>
          <p className="weekly-metric-subtext">Total verified focus time this week</p>
        </Card>

        {/* Tasks Completed Card */}
        <Card className="weekly-metric-card">
          <div className="weekly-metric-top">
            <span className="weekly-metric-label">Tasks Completed</span>
            <CheckSquare size={16} className="weekly-metric-icon weekly-metric-icon--blue" />
          </div>
          <div className="weekly-metric-value">
            {completedTasksCount} <span className="weekly-metric-unit">/ {totalTasksCount}</span>
          </div>
          <ProgressBar value={taskCompletionPercent} variant="primary" size="sm" />
          <p className="weekly-metric-subtext">{taskCompletionPercent}% completion rate</p>
        </Card>

        {/* Habits Consistency Card */}
        <Card className="weekly-metric-card">
          <div className="weekly-metric-top">
            <span className="weekly-metric-label">Habit Consistency</span>
            <Sparkles size={16} className="weekly-metric-icon weekly-metric-icon--amber" />
          </div>
          <div className="weekly-metric-value">{habitConsistencyPercent}%</div>
          <ProgressBar value={habitConsistencyPercent} variant="warning" size="sm" />
          <p className="weekly-metric-subtext">Across daily tracked habits</p>
        </Card>

        {/* Attendance Card (Class Mode Only; Strictly Omitted in Solo Mode) */}
        {!isSolo && attendanceRate !== null && (
          <Card className="weekly-metric-card">
            <div className="weekly-metric-top">
              <span className="weekly-metric-label">Lecture Attendance</span>
              <CalendarCheck size={16} className="weekly-metric-icon weekly-metric-icon--green" />
            </div>
            <div className="weekly-metric-value">{attendanceRate}%</div>
            <ProgressBar
              value={attendanceRate}
              variant={attendanceRate < 75 ? 'danger' : 'success'}
              size="sm"
            />
            <p className="weekly-metric-subtext">
              {attendanceRate < 75 ? 'Below 75% threshold' : 'Meets 75% requirement'}
            </p>
          </Card>
        )}
      </div>

      {/* 3 Dynamic Insights Generated By Rules */}
      <div className="weekly-insights-section">
        <div className="weekly-insights-header">
          <Lightbulb className="weekly-insights-header-icon" size={20} />
          <div>
            <h3 className="weekly-insights-title">Weekly Growth Insights</h3>
            <p className="weekly-insights-desc">
              Plain-language performance analysis synthesized from your real study habits and academic signals.
            </p>
          </div>
        </div>

        <div className="weekly-insights-grid">
          {insights.map((item, idx) => (
            <div
              key={item.id || idx}
              className={`weekly-insight-card weekly-insight-card--${item.type}`}
            >
              <div className="weekly-insight-icon-wrap">
                {item.type === 'positive' && <Sparkles size={18} />}
                {item.type === 'info' && <Award size={18} />}
                {item.type === 'warning' && <AlertCircle size={18} />}
                {item.type === 'neutral' && <Clock size={18} />}
              </div>
              <div className="weekly-insight-content">
                <h4 className="weekly-insight-card-title">{item.title}</h4>
                <p className="weekly-insight-card-text">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8-Week Score Trend Line Chart */}
      <Card className="weekly-trend-chart-card">
        <div className="weekly-trend-header">
          <div>
            <h3 className="weekly-trend-title">8-Week Discipline Score Trend</h3>
            <p className="weekly-trend-desc">
              Historical progression of your weekly discipline score over the past two months.
            </p>
          </div>

          <div className="weekly-trend-legend">
            <div className="weekly-trend-legend-item">
              <span className="weekly-trend-legend-line" />
              <span>Weekly Score (0 - 100)</span>
            </div>
            <div className="weekly-trend-legend-item">
              <span className="weekly-trend-legend-ref" />
              <span>Passing Threshold (50 pts)</span>
            </div>
          </div>
        </div>

        <div className="weekly-trend-canvas-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={trendData}
              margin={{ top: 20, right: 20, left: 10, bottom: 25 }}
            >
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[0, 100]} />
              <Tooltip content={<TrendTooltip />} />
              <ReferenceLine y={50} label="Threshold (50)" />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#0F766E"
                strokeWidth={2.5}
                dot={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

export default WeeklySummary;
