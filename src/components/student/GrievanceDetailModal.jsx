import React from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  User,
  ShieldCheck,
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { getGrievanceStatusMeta } from './GrievanceCard';
import './GrievanceDetailModal.css';

function formatFullDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * GrievanceDetailModal
 * Full detail view of a student grievance including description, timeline, and mentor reply
 */
export function GrievanceDetailModal({ grievance, isOpen, onClose }) {
  if (!grievance) return null;

  const statusMeta = getGrievanceStatusMeta(grievance.status);

  // Status steps for the progress tracker
  const steps = [
    { key: 'open', label: 'Submitted' },
    { key: 'in_review', label: 'In Review' },
    {
      key: grievance.status === 'escalated' ? 'escalated' : 'resolved',
      label: grievance.status === 'escalated' ? 'Escalated' : 'Resolved',
    },
  ];

  const getStepStatus = (stepKey) => {
    if (grievance.status === 'escalated' && stepKey === 'escalated') return 'active-escalated';
    if (grievance.status === 'resolved' && stepKey === 'resolved') return 'completed';
    if (grievance.status === 'resolved' && (stepKey === 'open' || stepKey === 'in_review'))
      return 'completed';
    if (grievance.status === 'in_review' && stepKey === 'open') return 'completed';
    if (grievance.status === 'in_review' && stepKey === 'in_review') return 'active';
    if (grievance.status === 'open' && stepKey === 'open') return 'active';
    return 'pending';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="grievance-detail-modal-header">
          <span>Grievance Details</span>
          <span className="grievance-id-tag">{grievance.id}</span>
        </div>
      }
      size="lg"
    >
      <div className="grievance-detail-body">
        {/* Top Badges */}
        <div className="grievance-detail-top-bar">
          <Badge variant={statusMeta.variant} icon={statusMeta.icon} size="md">
            {statusMeta.label}
          </Badge>
          <div className="grievance-detail-course-pill">
            {grievance.class_code && <strong>[{grievance.class_code}]</strong>}
            <span>{grievance.class_name || 'General Course'}</span>
          </div>
          <span className="grievance-detail-cat-badge">{grievance.category}</span>
        </div>

        {/* Progress Stepper */}
        <div className="grievance-stepper-wrap" aria-label="Grievance Status Stepper">
          <div className="grievance-stepper">
            {steps.map((s, idx) => {
              const state = getStepStatus(s.key);
              return (
                <div key={s.key} className={`grievance-step grievance-step--${state}`}>
                  <div className="grievance-step-indicator">
                    {state === 'completed' ? (
                      <CheckCircle2 size={16} />
                    ) : state === 'active-escalated' ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <span className="grievance-step-label">{s.label}</span>
                  {idx < steps.length - 1 && <div className="grievance-step-line" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Grievance Title & Full Description */}
        <div className="grievance-detail-section">
          <h3 className="grievance-detail-title">{grievance.title}</h3>
          <div className="grievance-detail-desc-box">
            <p className="grievance-detail-desc-text">{grievance.description}</p>
          </div>
          <span className="grievance-detail-timestamp">
            <Clock size={12} /> Filed on {formatFullDate(grievance.created_at)}
          </span>
        </div>

        {/* Mentor Reply Section */}
        <div className="grievance-reply-section">
          <h4 className="grievance-reply-heading">
            <MessageSquare size={16} /> Mentor & Department Response
          </h4>

          {grievance.mentor_reply ? (
            <div className="grievance-reply-card animate-fade-in">
              <div className="grievance-reply-header">
                <div className="grievance-reply-avatar">
                  <User size={16} />
                </div>
                <div>
                  <strong className="grievance-reply-author">
                    {grievance.resolved_by ? 'Prof. Rajesh Verma (Mentor)' : 'Department Mentor'}
                  </strong>
                  {grievance.replied_at && (
                    <span className="grievance-reply-time">
                      Replied on {formatFullDate(grievance.replied_at)}
                    </span>
                  )}
                </div>
              </div>
              <div className="grievance-reply-message">
                <p>{grievance.mentor_reply}</p>
              </div>
            </div>
          ) : (
            <div className="grievance-reply-pending">
              <Clock size={18} className="grievance-reply-pending-icon" />
              <div>
                <strong>Awaiting Mentor Review</strong>
                <p>
                  Your assigned mentor has received this notification and is investigating the matter.
                  Official updates and responses will appear here as soon as they reply.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="grievance-detail-footer">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default GrievanceDetailModal;
