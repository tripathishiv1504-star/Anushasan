import React from 'react';
import {
  MessageSquare,
  Clock,
  BookOpen,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import './GrievanceCard.css';

/**
 * Helper to get badge variant and icon for grievance status
 */
export function getGrievanceStatusMeta(status) {
  switch (status) {
    case 'open':
      return {
        variant: 'info',
        label: 'Open',
        icon: AlertCircle,
      };
    case 'in_review':
      return {
        variant: 'warning',
        label: 'In Review',
        icon: Clock,
      };
    case 'resolved':
      return {
        variant: 'success',
        label: 'Resolved',
        icon: CheckCircle2,
      };
    case 'escalated':
      return {
        variant: 'danger',
        label: 'Escalated to Admin',
        icon: ArrowUpRight,
      };
    default:
      return {
        variant: 'neutral',
        label: status,
        icon: AlertCircle,
      };
  }
}

/**
 * Format relative or short date
 */
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
 * GrievanceCard
 * Clickable card summarizing a student grievance
 *
 * @param {Object} grievance
 * @param {Function} onClick
 */
export function GrievanceCard({ grievance, onClick }) {
  const statusMeta = getGrievanceStatusMeta(grievance.status);

  return (
    <Card
      className="grievance-card"
      onClick={() => onClick && onClick(grievance)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick(grievance);
        }
      }}
    >
      <div className="grievance-card-main">
        {/* Top meta row */}
        <div className="grievance-card-top">
          <div className="grievance-card-class-wrap">
            {grievance.class_code && (
              <span className="grievance-code-badge">{grievance.class_code}</span>
            )}
            <span className="grievance-class-name">
              {grievance.class_name || 'General Academic'}
            </span>
          </div>

          <div className="grievance-card-status">
            <Badge variant={statusMeta.variant} icon={statusMeta.icon} size="sm">
              {statusMeta.label}
            </Badge>
          </div>
        </div>

        {/* Title & Description preview */}
        <h3 className="grievance-card-title">{grievance.title}</h3>
        <p className="grievance-card-desc-preview">{grievance.description}</p>

        {/* Footer meta info */}
        <div className="grievance-card-footer">
          <div className="grievance-card-tags">
            <span className="grievance-category-tag">{grievance.category}</span>
            <span className="grievance-date-text">
              <Clock size={12} /> Submitted {formatDate(grievance.created_at)}
            </span>
          </div>

          <div className="grievance-card-reply-status">
            {grievance.mentor_reply ? (
              <span className="grievance-reply-indicator grievance-reply-indicator--has">
                <MessageSquare size={13} /> Mentor Replied
              </span>
            ) : (
              <span className="grievance-reply-indicator">
                <Clock size={13} /> Awaiting Mentor
              </span>
            )}
            <ChevronRight size={16} className="grievance-card-arrow" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default GrievanceCard;
