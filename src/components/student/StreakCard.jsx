import React from 'react';
import { Flame } from 'lucide-react';
import Card from '../common/Card';
import './StreakCard.css';

/**
 * StreakCard Component
 * Displays the student's study streak with saffron flame icon and encouraging feedback
 *
 * @param {number} streak - Consecutive days studied >= 30m
 * @param {number} todayMinutes - Minutes studied today
 */
export function StreakCard({ streak = 0, todayMinutes = 0 }) {
  const goalReachedToday = todayMinutes >= 30;

  return (
    <Card className="streak-card" padding="md">
      <div className="streak-card__header">
        <span className="streak-card__label">Active Streak</span>
        <div className={`streak-card__icon-wrap ${streak > 0 ? 'streak-card__icon-wrap--active' : ''}`}>
          <Flame size={20} className="streak-card__icon" />
        </div>
      </div>

      <div className="streak-card__body">
        <div className="streak-card__count-row">
          <span className="streak-card__count">{streak}</span>
          <span className="streak-card__unit">{streak === 1 ? 'day' : 'days'}</span>
        </div>
        <div className={`streak-card__badge ${goalReachedToday ? 'streak-card__badge--safe' : 'streak-card__badge--pending'}`}>
          {goalReachedToday ? 'Flame lit for today' : 'Study 30m to keep alive'}
        </div>
      </div>

      <p className="streak-card__caption">
        {streak === 0
          ? 'Log 30+ minutes of study today to ignite your streak!'
          : goalReachedToday
          ? 'Great discipline! Today’s 30-min consistency goal is accomplished.'
          : `${30 - todayMinutes} more mins needed today to preserve your ${streak}-day run.`}
      </p>
    </Card>
  );
}

export default StreakCard;
