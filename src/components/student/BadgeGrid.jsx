import React, { useState } from 'react';
import {
  Award,
  Zap,
  Flame,
  Crown,
  Sparkles,
  Clock,
  Target,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Unlock,
  Check,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import './BadgeGrid.css';

/**
 * Resolve icon component by icon_name string
 */
function getBadgeIcon(iconName) {
  switch (iconName) {
    case 'Zap':
      return Zap;
    case 'Flame':
      return Flame;
    case 'Crown':
      return Crown;
    case 'Sparkles':
      return Sparkles;
    case 'Clock':
      return Clock;
    case 'Target':
      return Target;
    case 'CheckCircle2':
      return CheckCircle2;
    case 'ShieldCheck':
      return ShieldCheck;
    default:
      return Award;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * BadgeGrid Component
 * Grid of earned (vibrant) and locked (gray with condition) student achievement badges
 *
 * @param {Object} badgesSummary - { earnedCount, totalCount, badges: Array }
 */
export function BadgeGrid({ badgesSummary }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'earned' | 'locked'

  if (!badgesSummary || !badgesSummary.badges) return null;

  const { earnedCount = 0, totalCount = 0, badges = [] } = badgesSummary;
  const completionPercent = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  const filteredBadges = badges.filter((b) => {
    if (filter === 'earned') return b.is_earned;
    if (filter === 'locked') return !b.is_earned;
    return true;
  });

  return (
    <Card className="badge-grid-card">
      {/* Header with unlocked counter and progress bar */}
      <div className="badge-grid-header">
        <div className="badge-grid-title-wrap">
          <Award className="badge-grid-header-icon" size={22} />
          <div>
            <h3 className="badge-grid-title">Academic Growth Badges</h3>
            <p className="badge-grid-subtitle">
              Milestone achievements earned through consistent study, streaks, and discipline.
            </p>
          </div>
        </div>

        <div className="badge-grid-progress-wrap">
          <div className="badge-grid-progress-top">
            <span className="badge-grid-progress-label">Milestones Unlocked</span>
            <span className="badge-grid-progress-count">
              <strong>{earnedCount}</strong> of {totalCount} ({completionPercent}%)
            </span>
          </div>
          <ProgressBar value={completionPercent} variant="primary" size="sm" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="badge-grid-filter-row">
        <div className="badge-grid-tabs" role="tablist" aria-label="Filter badges">
          <button
            role="tab"
            aria-selected={filter === 'all'}
            className={`badge-tab-btn ${filter === 'all' ? 'badge-tab-btn--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Badges ({totalCount})
          </button>
          <button
            role="tab"
            aria-selected={filter === 'earned'}
            className={`badge-tab-btn ${filter === 'earned' ? 'badge-tab-btn--active' : ''}`}
            onClick={() => setFilter('earned')}
          >
            Unlocked ({earnedCount})
          </button>
          <button
            role="tab"
            aria-selected={filter === 'locked'}
            className={`badge-tab-btn ${filter === 'locked' ? 'badge-tab-btn--active' : ''}`}
            onClick={() => setFilter('locked')}
          >
            Locked ({totalCount - earnedCount})
          </button>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="badge-grid-items">
        {filteredBadges.map((badge) => {
          const IconComponent = getBadgeIcon(badge.icon_name);
          const isEarned = badge.is_earned;

          return (
            <div
              key={badge.id}
              className={`badge-item-card ${
                isEarned ? 'badge-item-card--earned' : 'badge-item-card--locked'
              }`}
            >
              {/* Badge Icon Medallion */}
              <div className="badge-medallion-wrap">
                <div className="badge-medallion">
                  <IconComponent size={24} />
                </div>
                {isEarned ? (
                  <span className="badge-earned-check" title="Achievement Unlocked">
                    <Check size={12} />
                  </span>
                ) : (
                  <span className="badge-locked-padlock" title="Locked Badge">
                    <Lock size={12} />
                  </span>
                )}
              </div>

              {/* Badge Details */}
              <div className="badge-details">
                <div className="badge-top-row">
                  <span className="badge-category-tag">{badge.category}</span>
                  {isEarned ? (
                    <Badge variant="success" size="sm">
                      Unlocked
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      Locked
                    </Badge>
                  )}
                </div>

                <h4 className="badge-name">{badge.name}</h4>
                <p className="badge-desc">{badge.description}</p>

                {/* Condition / Unlock Meta Footer */}
                <div className="badge-footer">
                  {isEarned ? (
                    <span className="badge-earned-date">
                      <Unlock size={12} /> Unlocked on {formatDate(badge.earned_at)}
                    </span>
                  ) : (
                    <div className="badge-condition-box">
                      <Lock size={12} className="badge-condition-lock" />
                      <span>{badge.condition_description}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default BadgeGrid;
