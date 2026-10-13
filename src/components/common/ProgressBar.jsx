import React from 'react';
import './ProgressBar.css';

/**
 * Common ProgressBar component
 * @param {number} value
 * @param {number} max
 * @param {'primary' | 'accent' | 'success' | 'warning' | 'danger'} variant
 */
export function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = false,
  variant = 'primary',
  className = '',
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={`progress-wrapper ${className}`}>
      {(label || showValue) && (
        <div className="progress-header">
          {label && <span className="progress-label">{label}</span>}
          {showValue && <span className="progress-value">{percentage}%</span>}
        </div>
      )}
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
      >
        <div
          className={`progress-fill progress-fill--${variant}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
