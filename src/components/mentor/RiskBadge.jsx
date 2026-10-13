import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import './RiskBadge.css';

/**
 * RiskBadge component displaying at-risk vs on-track status
 * Follows spec section 11 risk rule: score < 50 or drop >= 15 pts
 *
 * @param {Object} props
 * @param {boolean} props.isAtRisk
 * @param {string} [props.reason]
 * @param {'sm' | 'md'} [props.size='sm']
 * @param {boolean} [props.showReason=false]
 */
export function RiskBadge({
  isAtRisk,
  reason,
  size = 'sm',
  showReason = false,
}) {
  const iconSize = size === 'sm' ? 12 : 14;

  if (isAtRisk) {
    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
        <span
          className={`risk-badge risk-badge--${size} risk-badge--risk`}
          title={reason || 'Student meets at-risk intervention criteria'}
        >
          <AlertTriangle size={iconSize} />
          <span>At Risk</span>
        </span>
        {showReason && reason && (
          <span className="risk-badge__reason">
            {reason}
          </span>
        )}
      </div>
    );
  }

  return (
    <span
      className={`risk-badge risk-badge--${size} risk-badge--good`}
      title="Student is meeting academic discipline benchmarks"
    >
      <CheckCircle2 size={iconSize} />
      <span>On Track</span>
    </span>
  );
}

export default RiskBadge;
