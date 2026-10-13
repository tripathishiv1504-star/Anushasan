import React from 'react';
import {
  Target,
  Calendar,
  CheckCircle2,
  Trash2,
  Award,
  Clock,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';
import { formatDate } from '../../utils/dates';
import './GoalCard.css';

/**
 * Calculate days remaining until target date
 * @param {string} targetDateStr - YYYY-MM-DD
 * @returns {{ days: number, label: string, status: 'upcoming' | 'today' | 'overdue' }}
 */
function getDaysRemaining(targetDateStr) {
  if (!targetDateStr) return { days: 0, label: '', status: 'upcoming' };
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 1) {
    return { days: diffDays, label: `${diffDays} days left`, status: 'upcoming' };
  }
  if (diffDays === 1) {
    return { days: 1, label: '1 day left', status: 'upcoming' };
  }
  if (diffDays === 0) {
    return { days: 0, label: 'Due today', status: 'today' };
  }
  return {
    days: Math.abs(diffDays),
    label: `${Math.abs(diffDays)}d overdue`,
    status: 'overdue',
  };
}

/**
 * GoalCard Component
 * Displays a student goal with target date, days remaining, progress slider, and achieve trigger
 *
 * @param {Object} goal - Goal record { id, title, target_date, progress_percent }
 * @param {Function} onUpdateProgress - Callback (goalId, newPercent)
 * @param {Function} onMarkAchieved - Callback (goalId)
 * @param {Function} onDelete - Callback (goalId)
 */
export function GoalCard({ goal, onUpdateProgress, onMarkAchieved, onDelete }) {
  const percent = Math.min(100, Math.max(0, Number(goal.progress_percent) || 0));
  const isAchieved = percent === 100;
  const { label: daysLeftLabel, status: daysLeftStatus } = getDaysRemaining(goal.target_date);

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    onUpdateProgress(goal.id, val);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete goal "${goal.title}"?`)) {
      onDelete(goal.id);
    }
  };

  return (
    <Card
      className={`goal-card ${isAchieved ? 'goal-card--achieved' : ''}`}
      padding="md"
    >
      <div className="goal-card__header">
        <div className="goal-card__title-row">
          <div className={`goal-card__icon ${isAchieved ? 'goal-card__icon--achieved' : ''}`}>
            {isAchieved ? <Award size={18} /> : <Target size={18} />}
          </div>
          <h4 className="goal-card__title">{goal.title}</h4>
        </div>

        <button
          type="button"
          className="goal-card__delete-btn"
          onClick={handleDelete}
          aria-label={`Delete goal ${goal.title}`}
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="goal-card__meta">
        <span className="goal-card__target-date">
          <Calendar size={13} />
          Target: {formatDate(goal.target_date)}
        </span>

        {isAchieved ? (
          <Badge variant="success" size="sm" icon={CheckCircle2}>
            Goal Achieved
          </Badge>
        ) : daysLeftStatus === 'overdue' ? (
          <Badge variant="danger" size="sm" icon={Clock}>
            {daysLeftLabel}
          </Badge>
        ) : daysLeftStatus === 'today' ? (
          <Badge variant="warning" size="sm" icon={Clock}>
            {daysLeftLabel}
          </Badge>
        ) : (
          <Badge variant="neutral" size="sm">
            {daysLeftLabel}
          </Badge>
        )}
      </div>

      {/* Progress Presentation */}
      <div className="goal-card__progress-section">
        <div className="goal-card__progress-label-row">
          <span className="goal-card__progress-label">Milestone Progress</span>
          <span className="goal-card__progress-val">{percent}%</span>
        </div>

        <ProgressBar
          value={percent}
          color={isAchieved ? 'success' : percent >= 70 ? 'primary' : 'accent'}
          size="md"
        />

        {/* Interactive Progress Slider (if not completed) */}
        {!isAchieved && (
          <div className="goal-card__slider-wrap">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={percent}
              onChange={handleSliderChange}
              className="goal-card__slider"
              aria-label={`Adjust progress for ${goal.title}`}
            />
            <div className="goal-card__slider-ticks">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      {!isAchieved && (
        <div className="goal-card__footer">
          <Button
            variant="outline"
            size="sm"
            icon={CheckCircle2}
            onClick={() => onMarkAchieved(goal.id)}
            className="goal-card__achieve-btn"
          >
            Mark Achieved
          </Button>
        </div>
      )}
    </Card>
  );
}

export default GoalCard;
