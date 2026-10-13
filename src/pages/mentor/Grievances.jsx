import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  MessageSquare,
  Send,
  Search,
  X,
  Filter,
  BookOpen,
  User,
  ShieldAlert,
  RotateCcw,
  Check,
  AlertTriangle,
  FileText,
  Calendar,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mentorService } from '../../services/mentorService';
import { grievanceService } from '../../services/grievanceService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingState from '../../components/common/LoadingState';
import './Grievances.css';

// Status badge metadata helper
export function getGrievanceStatusMeta(status) {
  switch (status) {
    case 'open':
      return { label: 'Open', variant: 'warning', icon: AlertCircle, color: '#D97706' };
    case 'in_review':
      return { label: 'In Review', variant: 'info', icon: Clock, color: '#2563EB' };
    case 'resolved':
      return { label: 'Resolved', variant: 'success', icon: CheckCircle2, color: '#16A34A' };
    case 'escalated':
      return { label: 'Escalated to Admin', variant: 'danger', icon: ArrowUpRight, color: '#DC2626' };
    default:
      return { label: 'Submitted', variant: 'default', icon: AlertCircle, color: '#6B7280' };
  }
}

// Date formatter helper
function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDisplayDateTime(dateStr) {
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

export function MentorGrievances() {
  const { user } = useAuth();
  const mentorId = user?.id || 'user_mentor_1';
  const mentorName = user?.full_name || 'Prof. Rajesh Verma';

  // State
  const [grievances, setGrievances] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, in_review: 0, resolved: 0, escalated: 0 });
  const [mentorClasses, setMentorClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'open' | 'in_review' | 'resolved' | 'escalated'
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected grievance for detail & resolution modal
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Escalation prompt modal state
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');

  // Load mentor classes and grievances
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [classesData, listData, statsData] = await Promise.all([
        mentorService.getMentorClasses(mentorId),
        grievanceService.getMentorGrievances(mentorId, {
          status: activeTab,
          classId: selectedClassId,
          searchQuery,
        }),
        grievanceService.getMentorGrievanceStats(mentorId),
      ]);

      setMentorClasses(classesData);
      setGrievances(listData);
      setStats(statsData);

      // Keep selected grievance in sync if modal is open
      if (selectedGrievance) {
        const refreshed = listData.find((g) => g.id === selectedGrievance.id);
        if (refreshed) {
          setSelectedGrievance(refreshed);
        }
      }
    } catch (err) {
      console.error('Failed to load mentor grievances:', err);
      setError(err.message || 'Unable to load student grievances. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [mentorId, activeTab, selectedClassId, searchQuery, selectedGrievance?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open detail modal
  const handleOpenDetail = (grievance) => {
    setSelectedGrievance(grievance);
    setReplyText(grievance.mentor_reply || '');
  };

  // Close detail modal
  const handleCloseDetail = () => {
    setSelectedGrievance(null);
    setReplyText('');
    setIsEscalateModalOpen(false);
    setEscalateReason('');
  };

  // Show toast notification
  const triggerToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Action 1: Move to in review
  const handleMoveToInReview = async () => {
    if (!selectedGrievance) return;
    try {
      setIsSubmittingAction(true);
      const updated = await grievanceService.updateGrievanceStatus(
        selectedGrievance.id,
        'in_review',
        { resolvedBy: mentorName, note: 'Moved to In Review by mentor' }
      );
      setSelectedGrievance(updated);
      await loadData();
      triggerToast(`Grievance ${selectedGrievance.id} moved to In Review.`);
    } catch (err) {
      console.error('Failed to move grievance to in review:', err);
      setError(err.message || 'Action failed.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Action 2: Post Reply (optionally marks resolved)
  const handlePostReply = async (markResolved = false) => {
    if (!selectedGrievance) return;
    if (!replyText.trim()) {
      setError('Please enter a response message for the student.');
      return;
    }

    try {
      setIsSubmittingAction(true);
      const updated = await grievanceService.addReply(
        selectedGrievance.id,
        replyText.trim(),
        mentorName,
        markResolved
      );
      setSelectedGrievance(updated);
      await loadData();
      triggerToast(
        markResolved
          ? 'Reply sent and grievance marked as Resolved!'
          : 'Reply sent successfully to student!'
      );
    } catch (err) {
      console.error('Failed to post reply:', err);
      setError(err.message || 'Failed to send reply.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Action 3: Mark resolved directly
  const handleMarkResolved = async () => {
    if (!selectedGrievance) return;
    try {
      setIsSubmittingAction(true);
      const currentReply = replyText.trim() || selectedGrievance.mentor_reply || 'Issue reviewed and resolved by mentor.';
      const updated = await grievanceService.updateGrievanceStatus(
        selectedGrievance.id,
        'resolved',
        {
          reply: currentReply,
          resolvedBy: mentorName,
          note: 'Marked as Resolved by faculty mentor',
        }
      );
      setSelectedGrievance(updated);
      await loadData();
      triggerToast(`Grievance ${selectedGrievance.id} marked as Resolved.`);
    } catch (err) {
      console.error('Failed to mark resolved:', err);
      setError(err.message || 'Failed to resolve grievance.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Action 4: Open Escalate Confirmation
  const handleOpenEscalate = () => {
    setEscalateReason('');
    setIsEscalateModalOpen(true);
  };

  // Action 4: Confirm Escalate to Admin
  const handleConfirmEscalate = async () => {
    if (!selectedGrievance) return;
    try {
      setIsSubmittingAction(true);
      const updated = await grievanceService.escalateGrievance(
        selectedGrievance.id,
        escalateReason.trim() || 'Escalated by mentor for administrative intervention',
        mentorName
      );
      setSelectedGrievance(updated);
      setIsEscalateModalOpen(false);
      setEscalateReason('');
      await loadData();
      triggerToast(`Grievance ${selectedGrievance.id} escalated to Department Administration.`, 'warning');
    } catch (err) {
      console.error('Failed to escalate grievance:', err);
      setError(err.message || 'Failed to escalate grievance.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Filter tabs definition
  const filterTabs = [
    { key: 'all', label: 'All Issues', count: stats.total },
    { key: 'open', label: 'Open', count: stats.open },
    { key: 'in_review', label: 'In Review', count: stats.in_review },
    { key: 'resolved', label: 'Resolved', count: stats.resolved },
    { key: 'escalated', label: 'Escalated', count: stats.escalated },
  ];

  return (
    <div className="mentor-grievances-page">
      {/* Page Header */}
      <div className="mentor-grievances-header">
        <div>
          <h1 className="mentor-grievances-title">Resolve Student Grievances</h1>
          <p className="mentor-grievances-subtitle">
            Manage academic, attendance, and infrastructural issues submitted by students in your classes.
          </p>
        </div>

        {/* Overview Stats Badges */}
        <div className="header-stats-strip">
          <div className="stat-pill stat-pill-total">
            <span className="stat-pill-label">Total</span>
            <span className="stat-pill-val">{stats.total}</span>
          </div>
          <div className="stat-pill stat-pill-open">
            <span className="stat-pill-label">Open</span>
            <span className="stat-pill-val">{stats.open}</span>
          </div>
          <div className="stat-pill stat-pill-review">
            <span className="stat-pill-label">In Review</span>
            <span className="stat-pill-val">{stats.in_review}</span>
          </div>
          <div className="stat-pill stat-pill-resolved">
            <span className="stat-pill-label">Resolved</span>
            <span className="stat-pill-val">{stats.resolved}</span>
          </div>
          {stats.escalated > 0 && (
            <div className="stat-pill stat-pill-escalated">
              <span className="stat-pill-label">Escalated</span>
              <span className="stat-pill-val">{stats.escalated}</span>
            </div>
          )}
        </div>
      </div>

      {/* Toast Banner */}
      {toastMessage && (
        <div className={`grievance-toast toast-${toastMessage.type}`} role="alert">
          <CheckCircle2 className="toast-icon" />
          <span>{toastMessage.text}</span>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss toast"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="grievance-error-banner" role="alert">
          <AlertTriangle className="error-icon" />
          <span>{error}</span>
          <button
            type="button"
            className="error-close-btn"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="mentor-grievances-filters-card">
        {/* Status Tabs */}
        <div className="filter-tabs" role="tablist">
          {filterTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`filter-tab-btn ${isActive ? 'filter-tab-btn--active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span>{tab.label}</span>
                <span className={`filter-tab-count ${isActive ? 'count-active' : ''}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filters: Class & Search */}
        <div className="secondary-filters-row">
          {/* Class Filter */}
          <div className="class-filter-wrapper">
            <label htmlFor="filter-class" className="filter-label">
              Course Section:
            </label>
            <select
              id="filter-class"
              className="class-filter-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              <option value="all">All My Classes</option>
              {mentorClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.join_code})
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="search-box-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by student, title, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Grievance List Section */}
      {isLoading && grievances.length === 0 ? (
        <LoadingState message="Loading student grievances..." minHeight="40vh" />
      ) : grievances.length === 0 ? (
        <Card className="grievances-empty-card">
          <CheckCircle2 size={40} className="empty-icon" />
          <h2 className="empty-title">
            {activeTab === 'all'
              ? 'No grievances submitted yet'
              : `No ${activeTab.replace('_', ' ')} grievances`}
          </h2>
          <p className="empty-desc">
            {searchQuery || selectedClassId !== 'all'
              ? 'No student issues match your active search filters. Try clearing filters.'
              : 'Students in your classes have not raised any concerns under this status category.'}
          </p>
          {(searchQuery || selectedClassId !== 'all' || activeTab !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab('all');
                setSelectedClassId('all');
                setSearchQuery('');
              }}
            >
              Clear All Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="grievance-grid">
          {grievances.map((grievance) => {
            const statusMeta = getGrievanceStatusMeta(grievance.status);
            const initials = grievance.student_name
              ? grievance.student_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : 'ST';

            return (
              <Card key={grievance.id} className="grievance-item-card">
                <div className="card-top-row">
                  <div className="card-badges">
                    <Badge variant={statusMeta.variant} icon={statusMeta.icon} size="sm">
                      {statusMeta.label}
                    </Badge>
                    <span className="card-course-tag">
                      {grievance.class_code ? `[${grievance.class_code}] ` : ''}
                      {grievance.class_name}
                    </span>
                    <span className="card-category-tag">{grievance.category}</span>
                  </div>

                  <span className="card-date">{formatDisplayDate(grievance.created_at)}</span>
                </div>

                {/* Student Info */}
                <div className="card-student-row">
                  <div className="card-student-avatar" aria-hidden="true">
                    {initials}
                  </div>
                  <div>
                    <strong className="card-student-name">{grievance.student_name}</strong>
                    <span className="card-id-text">Ticket: {grievance.id}</span>
                  </div>
                </div>

                {/* Grievance Title & Snippet */}
                <h3 className="card-title">{grievance.title}</h3>
                <p className="card-desc-snippet">{grievance.description}</p>

                {/* Response Status Snippet */}
                <div className="card-response-status">
                  {grievance.mentor_reply ? (
                    <div className="response-status-replied">
                      <MessageSquare size={14} className="response-icon" />
                      <span>
                        <strong>Replied:</strong> {grievance.mentor_reply}
                      </span>
                    </div>
                  ) : (
                    <div className="response-status-pending">
                      <Clock size={14} className="pending-icon" />
                      <span>Awaiting mentor reply</span>
                    </div>
                  )}
                </div>

                {/* Action Row */}
                <div className="card-action-row">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenDetail(grievance)}
                    className="card-review-btn"
                  >
                    <span>Review Issue</span>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Grievance Detail & Resolution Modal */}
      {selectedGrievance && (
        <Modal
          isOpen={Boolean(selectedGrievance)}
          onClose={handleCloseDetail}
          title={
            <div className="detail-modal-header">
              <span>Grievance Investigation & Resolution</span>
              <span className="detail-modal-id">#{selectedGrievance.id}</span>
            </div>
          }
          size="lg"
        >
          <div className="detail-modal-body">
            {/* Top Status & Course Row */}
            <div className="detail-meta-row">
              <Badge
                variant={getGrievanceStatusMeta(selectedGrievance.status).variant}
                icon={getGrievanceStatusMeta(selectedGrievance.status).icon}
                size="md"
              >
                {getGrievanceStatusMeta(selectedGrievance.status).label}
              </Badge>
              <div className="detail-course-pill">
                <strong>[{selectedGrievance.class_code || 'GEN'}]</strong>
                <span>{selectedGrievance.class_name}</span>
              </div>
              <span className="detail-category-badge">{selectedGrievance.category}</span>
            </div>

            {/* Student Info Card */}
            <div className="detail-student-card">
              <div className="detail-avatar" aria-hidden="true">
                <User size={18} />
              </div>
              <div className="detail-student-info">
                <strong className="detail-student-name">{selectedGrievance.student_name}</strong>
                <span className="detail-student-meta">
                  Filed on {formatDisplayDateTime(selectedGrievance.created_at)}
                </span>
              </div>
            </div>

            {/* Full Issue Description Box */}
            <div className="detail-section">
              <h3 className="detail-section-title">{selectedGrievance.title}</h3>
              <div className="detail-desc-box">
                <p className="detail-desc-text">{selectedGrievance.description}</p>
              </div>
            </div>

            {/* Status History Timeline Stepper */}
            <div className="detail-section">
              <h4 className="detail-section-subtitle">
                <Clock size={16} /> Status Progression & Audit History
              </h4>
              <div className="status-history-timeline">
                {(selectedGrievance.status_history || []).map((step, idx) => {
                  const stepMeta = getGrievanceStatusMeta(step.status);
                  return (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-dot-wrapper">
                        <div
                          className="timeline-dot"
                          style={{ borderColor: stepMeta.color, background: stepMeta.color }}
                        />
                        {idx < selectedGrievance.status_history.length - 1 && (
                          <div className="timeline-line" />
                        )}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <strong className="timeline-status-name">{stepMeta.label}</strong>
                          <span className="timeline-time">{formatDisplayDateTime(step.timestamp)}</span>
                        </div>
                        <p className="timeline-note">{step.note || `Status updated to ${step.status}`}</p>
                        {step.updated_by && (
                          <span className="timeline-actor">By: {step.updated_by}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Faculty Response Composer Section */}
            <div className="detail-section faculty-response-box">
              <h4 className="detail-section-subtitle">
                <MessageSquare size={16} /> Faculty Mentor Response
              </h4>

              {selectedGrievance.mentor_reply && (
                <div className="existing-reply-banner">
                  <div className="existing-reply-header">
                    <strong>Current Saved Response:</strong>
                    {selectedGrievance.replied_at && (
                      <span className="existing-reply-time">
                        {formatDisplayDateTime(selectedGrievance.replied_at)}
                      </span>
                    )}
                  </div>
                  <p className="existing-reply-text">{selectedGrievance.mentor_reply}</p>
                </div>
              )}

              <div className="reply-input-wrapper">
                <label htmlFor="mentor-reply-textarea" className="reply-label">
                  {selectedGrievance.mentor_reply ? 'Update or Append Response:' : 'Write Official Response for Student:'}
                </label>
                <textarea
                  id="mentor-reply-textarea"
                  className="reply-textarea"
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Explain resolution steps, attendance correction, or instructional guidance for the student..."
                />
              </div>
            </div>

            {/* Action Bar (Spec Step 17: Move to in review, Reply, Mark resolved, Escalate to admin) */}
            <div className="detail-modal-actions">
              <div className="actions-left">
                {selectedGrievance.status !== 'escalated' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenEscalate}
                    disabled={isSubmittingAction}
                    className="action-escalate-btn"
                    title="Escalate issue to College Administration"
                  >
                    <ArrowUpRight size={16} />
                    <span>Escalate to Admin</span>
                  </Button>
                )}

                {selectedGrievance.status === 'open' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMoveToInReview}
                    disabled={isSubmittingAction}
                    title="Move status to In Review"
                  >
                    <Clock size={16} />
                    <span>Move to In Review</span>
                  </Button>
                )}
              </div>

              <div className="actions-right">
                <Button
                  variant="outline"
                  onClick={() => handlePostReply(false)}
                  disabled={isSubmittingAction || !replyText.trim()}
                  title="Send reply to student while keeping in review"
                >
                  <Send size={16} />
                  <span>Send Reply</span>
                </Button>

                {selectedGrievance.status !== 'resolved' && (
                  <Button
                    variant="primary"
                    onClick={() => handlePostReply(true)}
                    disabled={isSubmittingAction}
                    className="action-resolve-btn"
                    title="Mark grievance as completely resolved"
                  >
                    <CheckCircle2 size={16} />
                    <span>Mark Resolved</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Escalation Confirmation Modal */}
      {isEscalateModalOpen && selectedGrievance && (
        <Modal
          isOpen={isEscalateModalOpen}
          onClose={() => setIsEscalateModalOpen(false)}
          title="Escalate Grievance to Administration"
          size="md"
        >
          <div className="escalate-modal-body">
            <div className="escalate-warning-callout">
              <ShieldAlert size={24} className="escalate-warning-icon" />
              <div>
                <strong>Administrative Intervention Required</strong>
                <p>
                  Escalating will transfer this issue directly to the College Department Administration
                  overview dashboard (Step 19).
                </p>
              </div>
            </div>

            <div className="escalate-field">
              <label htmlFor="escalate-reason-input" className="escalate-label">
                Reason for Escalation (optional):
              </label>
              <textarea
                id="escalate-reason-input"
                className="escalate-textarea"
                rows={3}
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                placeholder="e.g. Lab hardware failure requires IT infrastructure department intervention..."
              />
            </div>

            <div className="escalate-actions">
              <Button
                variant="outline"
                onClick={() => setIsEscalateModalOpen(false)}
                disabled={isSubmittingAction}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmEscalate}
                isLoading={isSubmittingAction}
              >
                <ArrowUpRight size={16} />
                <span>Confirm Escalation</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default MentorGrievances;
