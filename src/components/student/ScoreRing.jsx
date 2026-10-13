import React from 'react';
import './ScoreRing.css';

/**
 * ScoreRing Component
 * Visual circular SVG progress ring for the 0-100 discipline score
 *
 * @param {number} score - Score value between 0 and 100
 * @param {number} [size=110] - Diameter in pixels
 * @param {number} [strokeWidth=9] - Border width in pixels
 * @param {boolean} [isAtRisk=false] - Whether student is flagged as at-risk
 * @param {string} [label='Discipline Score']
 */
export function ScoreRing({
  score = 0,
  size = 110,
  strokeWidth = 9,
  isAtRisk = false,
  label = 'Discipline Score',
}) {
  const safeScore = Math.min(100, Math.max(0, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  let colorClass = 'score-ring--good';
  let statusText = 'Excellent';

  if (isAtRisk || safeScore < 50) {
    colorClass = 'score-ring--risk';
    statusText = 'At Risk';
  } else if (safeScore < 75) {
    colorClass = 'score-ring--medium';
    statusText = 'On Track';
  }

  return (
    <div className={`score-ring ${colorClass}`} style={{ width: size, height: size }}>
      <svg
        className="score-ring__svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background track circle */}
        <circle
          className="score-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Animated indicator circle */}
        <circle
          className="score-ring__indicator"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      <div className="score-ring__content">
        <span className="score-ring__value">{safeScore}</span>
        <span className="score-ring__scale">/100</span>
      </div>
    </div>
  );
}

export default ScoreRing;
