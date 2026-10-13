import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import Card from '../common/Card';
import { formatDuration } from '../../utils/dates';
import './WeekChart.css';

/**
 * Custom Tooltip for Recharts
 */
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="week-chart__tooltip">
        <span className="week-chart__tooltip-date">{data.label}</span>
        <div className="week-chart__tooltip-value-row">
          <span className="week-chart__tooltip-value">{formatDuration(data.minutes)}</span>
          {data.reachedGoal ? (
            <span className="week-chart__tooltip-tag week-chart__tooltip-tag--goal">Goal Met</span>
          ) : (
            <span className="week-chart__tooltip-tag">Under 30m</span>
          )}
        </div>
      </div>
    );
  }
  return null;
}

/**
 * WeekChart Component
 * Recharts Bar Chart showing daily study minutes for the current week
 *
 * @param {Array<{ day: string, date: string, label: string, minutes: number, reachedGoal: boolean, isToday: boolean }>} data
 */
export function WeekChart({ data = [] }) {
  const totalMinutes = data.reduce((sum, item) => sum + (item.minutes || 0), 0);
  const daysWithGoal = data.filter((item) => item.reachedGoal).length;

  return (
    <Card className="week-chart-card" padding="lg">
      <div className="week-chart-card__header">
        <div>
          <h3 className="week-chart-card__title">Study Consistency</h3>
          <p className="week-chart-card__subtitle">
            Daily study time this week. 30+ minutes per day earns maximum discipline points.
          </p>
        </div>

        <div className="week-chart-card__summary">
          <div className="week-chart-card__summary-stat">
            <span className="week-chart-card__summary-label">Total Time</span>
            <span className="week-chart-card__summary-value">{formatDuration(totalMinutes)}</span>
          </div>
          <div className="week-chart-card__summary-stat">
            <span className="week-chart-card__summary-label">Goal Met</span>
            <span className="week-chart-card__summary-value">{daysWithGoal} of 7 days</span>
          </div>
        </div>
      </div>

      <div className="week-chart-card__canvas-wrap">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data}
            margin={{ top: 16, right: 12, left: 0, bottom: 4 }}
          >
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 13, fontWeight: 500 }}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickFormatter={(val) => `${val}m`}
              domain={[0, 'auto']}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(15, 118, 110, 0.06)' }} />
            <ReferenceLine
              y={30}
              stroke="#D97706"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: '30m Goal',
                fill: '#B45309',
                fontSize: 11,
                position: 'insideTopRight',
                offset: 4,
              }}
            />
            <Bar dataKey="minutes" radius={[6, 6, 0, 0]} maxBarSize={42}>
              {data.map((entry, index) => {
                let barColor = '#94A3B8'; // muted grey for under goal
                if (entry.reachedGoal) {
                  barColor = entry.isToday ? '#0D9488' : '#0F766E'; // primary teal
                } else if (entry.isToday) {
                  barColor = '#F59E0B'; // accent saffron if today is in progress
                }
                return <Cell key={`cell-${index}`} fill={barColor} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="week-chart-card__legend">
        <div className="week-chart-card__legend-item">
          <span className="week-chart-card__legend-dot week-chart-card__legend-dot--primary" />
          <span>Goal met (≥ 30 mins)</span>
        </div>
        <div className="week-chart-card__legend-item">
          <span className="week-chart-card__legend-dot week-chart-card__legend-dot--muted" />
          <span>Below 30 mins</span>
        </div>
        <div className="week-chart-card__legend-item">
          <span className="week-chart-card__legend-line" />
          <span>Daily 30-min threshold</span>
        </div>
      </div>
    </Card>
  );
}

export default WeekChart;
