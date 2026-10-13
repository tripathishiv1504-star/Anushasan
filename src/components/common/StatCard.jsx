import React from 'react';
import Card from './Card';
import './StatCard.css';

/**
 * Common StatCard component
 * @param {string} title
 * @param {string | number} value
 * @param {React.ElementType} icon
 * @param {string} change
 * @param {'up' | 'down' | 'neutral'} trend
 * @param {string} caption
 * @param {'primary' | 'accent' | 'success' | 'warning' | 'danger'} color
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  trend = 'neutral',
  caption,
  color = 'primary',
  className = '',
}) {
  return (
    <Card className={`stat-card stat-card--${color} ${className}`} padding="md">
      <div className="stat-card__header">
        <span className="stat-card__title">{title}</span>
        {Icon && (
          <div className="stat-card__icon-wrap">
            {React.isValidElement(Icon) ? (
              Icon
            ) : typeof Icon === 'function' || typeof Icon === 'object' ? (
              <Icon size={20} className="stat-card__icon" />
            ) : null}
          </div>
        )}
      </div>

      <div className="stat-card__body">
        <span className="stat-card__value">{value}</span>
        {change && (
          <span className={`stat-card__trend stat-card__trend--${trend}`}>
            {change}
          </span>
        )}
      </div>

      {caption && <p className="stat-card__caption">{caption}</p>}
    </Card>
  );
}

export default StatCard;
