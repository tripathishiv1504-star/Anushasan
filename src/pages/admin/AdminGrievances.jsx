import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  MessageSquare,
  Send,
  User,
  BookOpen,
  Calendar,
  X,
  Shield,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingState from '../../components/common/LoadingState';
import './AdminGrievances.css';

export function AdminGrievances() {
  const [grievances, setGrievances] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, in_review: 0, resolved: 0, escalated: 0 });
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [activeTab, setActiveTab] = useState('escalated'); // Default to escalated for admin attention
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Resolution Modal State
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Load all admin grievances
  const loadGrievanceData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [grievanceList, statsData, classList] = await Promise.all([
        adminService.getAdminGrievances({
          status: 'all',
          classId: 'all',
          searchQuery: '',
        }),
        adminService.getAdminGrievanceStats(),
        adminService.getDepartmentClasses('dept_cs'),
      ]);

      setGrievances(grievanceList);
      setStats(statsData);
      setClasses(classList);
    } catch (err) {
      console.error('Failed to load admin grievances:', err);
      setError(err.message || 'Unable to load grievance tickets.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGrievanceData();

    const handleGrievanceSync = () => {
      loadGrievanceData();
    };

    window.addEventListener('anushasan:grievance_updated', handleGrievanceSync);

    return () => {
      window.removeEventListener('anushasan:grievance_updated', handleGrievanceSync);
    };
  }, [loadGrievanceData]);

  const triggerToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered grievances list
  const filteredGrievances = useMemo(() => {
    return grievances.filter((g) => {
      // Tab status match
      const statusMatches = activeTab === 'all' || g.status === activeTab;

      // Class filter match
      const classMatches =
        selectedClass === 'all' ||
        g.class_id === selectedClass ||
        (g.class_code && g.class_code === selectedClass);

      // Search match
      const q = searchQuery.toLowerCase().trim();
      const searchMatches =
        !q ||
        (g.title || '').toLowerCase().includes(q) ||
        (g.description || '').toLowerCase().includes(q) ||
        (g.student_name || '').toLowerCase().includes(q) ||
        (g.category || '').toLowerCase().includes(q) ||
        (g.class_name || '').toLowerCase().includes(q);

      return statusMatches && classMatches && searchMatches;
    });
  }, [grievances, activeTab, selectedClass, searchQuery]);

  // Handle opening modal
  const handleOpenModal = (grievance) => {
    setSelectedGrievance(grievance);
    setAdminReplyText(grievance.mentor_reply || '');
  };

  // Handle resolving grievance
  const handleResolveGrievance = async (markResolved = true) => {
    if (!selectedGrievance) return;
    if (!adminReplyText.trim()) {
      setError('Please provide an administrative response or resolution rationale.');
      return;
    }

    try {
      setIsSubmittingReply(true);
      setError(null);

      const updated = await adminService.resolveAdminGrievance(selectedGrievance.id, {
        reply: adminReplyText.trim(),
        markResolved,
        adminName: 'Dr. Sunita Rao (Campus Admin)',
      });

      setSelectedGrievance(null);
      setAdminReplyText('');
      await loadGrievanceData();
      triggerToast(
        markResolved
          ? `Grievance "${updated.title}" successfully marked as Resolved.`
          : `Administrative response recorded for "${updated.title}".`
      );
    } catch (err) {
      console.error('Failed to resolve grievance:', err);
      setError(err.message || 'Failed to submit grievance resolution.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'escalated':
        return <Badge variant="danger" size="sm">Escalated to Admin</Badge>;
      case 'in_review':
        return <Badge variant="warning" size="sm">In Review</Badge>;
      case 'resolved':
        return <Badge variant="success" size="sm">Resolved</Badge>;
      case 'open':
      default:
        return <Badge variant="info" size="sm">Open</Badge>;
    }
  };

  if (isLoading && grievances.length === 0) {
    return <LoadingState message="Loading department grievance issues..." minHeight="60vh" />;
  }

  return (
    <div className="admin-grievances-page">
      {/* Page Header */}
      <div className="admin-grievances-header">
        <div>
          <h1 className="admin-grievances-title">Department Grievances Overview</h1>
          <p className="admin-grievances-subtitle">
            Resolve escalated disputes, monitor open academic grievances, and provide administrative decisions.
          </p>
        </div>

        {/* Global Summary Badge */}
        <div className="header-status-badge">
          <Shield size={16} className="badge-shield-icon" />
          <span>Department Authority</span>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className={`grievance-toast toast-${toastMessage.type}`} role="alert">
          <CheckCircle2 size={16} />
          <span>{toastMessage.text}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => setToastMessage(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="grievance-error-banner" role="alert">
          <AlertTriangle size={16} />
          <span>{error}</span>
          <button
            type="button"
            className="error-close"
            onClick={() => setError(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Statistics Metric Strip */}
      <div className="grievance-stats-grid">
        <div
          className={`stat-pill-box ${activeTab === 'escalated' ? 'stat-active' : ''}`}
          onClick={() => setActiveTab('escalated')}
        >
          <div className="stat-pill-icon icon-escalated">
            <AlertTriangle size={18} />
          </div>
          <div>
            <div className="stat-pill-num">{stats.escalated}</div>
            <div className="stat-pill-label">Escalated to Admin</div>
          </div>
        </div>

        <div
          className={`stat-pill-box ${activeTab === 'open' ? 'stat-active' : ''}`}
          onClick={() => setActiveTab('open')}
        >
          <div className="stat-pill-icon icon-open">
            <AlertCircle size={18} />
          </div>
          <div>
            <div className="stat-pill-num">{stats.open}</div>
            <div className="stat-pill-label">Open Issues</div>
          </div>
        </div>

        <div
          className={`stat-pill-box ${activeTab === 'in_review' ? 'stat-active' : ''}`}
          onClick={() => setActiveTab('in_review')}
        >
          <div className="stat-pill-icon icon-review">
            <Clock size={18} />
          </div>
          <div>
            <div className="stat-pill-num">{stats.in_review}</div>
            <div className="stat-pill-label">In Review</div>
          </div>
        </div>

        <div
          className={`stat-pill-box ${activeTab === 'resolved' ? 'stat-active' : ''}`}
          onClick={() => setActiveTab('resolved')}
        >
          <div className="stat-pill-icon icon-resolved">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="stat-pill-num">{stats.resolved}</div>
            <div className="stat-pill-label">Resolved</div>
          </div>
        </div>

        <div
          className={`stat-pill-box ${activeTab === 'all' ? 'stat-active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <div className="stat-pill-icon icon-total">
            <Layers size={18} />
          </div>
          <div>
            <div className="stat-pill-num">{stats.total}</div>
            <div className="stat-pill-label">Total Recorded</div>
          </div>
        </div>
      </div>

      {/* Toolbar: Status Tabs & Filters */}
      <Card className="grievance-filter-card">
        <div className="grievance-tabs-bar">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'escalated' ? 'tab-btn-active tab-escalated' : ''}`}
            onClick={() => setActiveTab('escalated')}
          >
            <span>Escalated to Admin</span>
            <span className="tab-count-badge">{stats.escalated}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'open' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('open')}
          >
            <span>Open</span>
            <span className="tab-count-badge">{stats.open}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'in_review' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('in_review')}
          >
            <span>In Review</span>
            <span className="tab-count-badge">{stats.in_review}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'resolved' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('resolved')}
          >
            <span>Resolved</span>
            <span className="tab-count-badge">{stats.resolved}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'all' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <span>All Grievances</span>
            <span className="tab-count-badge">{stats.total}</span>
          </button>
        </div>

        <div className="filter-controls-row">
          {/* Search Box */}
          <div className="search-box-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by student, title, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Class Filter */}
          <div className="class-filter-wrapper">
            <Filter size={15} className="filter-icon" />
            <select
              className="class-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="all">All Course Sections</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.join_code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Grievance Tickets List */}
      {filteredGrievances.length === 0 ? (
        <Card className="empty-grievance-card">
          <AlertCircle size={36} className="empty-icon" />
          <h3>No grievances found</h3>
          <p>
            {activeTab === 'escalated'
              ? 'No grievances are currently escalated to the department administration.'
              : `No grievances match the status "${activeTab}" with current filters.`}
          </p>
        </Card>
      ) : (
        <div className="grievances-list-grid">
          {filteredGrievances.map((g) => {
            const isEscalated = g.status === 'escalated';
            return (
              <Card
                key={g.id}
                className={`grievance-ticket-card ${isEscalated ? 'card-escalated' : ''}`}
              >
                <div className="ticket-card-header">
                  <div className="ticket-meta-tags">
                    {getStatusBadge(g.status)}
                    <span className="category-pill">{g.category || 'Academic'}</span>
                    <span className="class-code-pill">
                      {g.class_code || 'CS301A'}
                    </span>
                  </div>
                  <span className="ticket-id">#{g.id.slice(-6).toUpperCase()}</span>
                </div>

                <div className="ticket-content-body">
                  <h3 className="ticket-title">{g.title}</h3>
                  <p className="ticket-desc">{g.description}</p>
                </div>

                {/* Escalation Highlight Box */}
                {isEscalated && (
                  <div className="ticket-escalation-callout">
                    <AlertTriangle size={15} className="escalate-icon" />
                    <div>
                      <strong>Escalated to Department Authority</strong>
                      <p>
                        {g.status_history?.find((h) => h.status === 'escalated')?.note ||
                          'Requires administrative review and final academic determination.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Mentor/Admin Reply Preview if exists */}
                {g.mentor_reply && (
                  <div className="ticket-reply-preview">
                    <MessageSquare size={14} className="reply-preview-icon" />
                    <div className="reply-preview-content">
                      <span className="reply-author">
                        {g.resolved_by || 'Mentor / Admin'}:
                      </span>
                      <p className="reply-text">"{g.mentor_reply}"</p>
                    </div>
                  </div>
                )}

                <div className="ticket-card-footer">
                  <div className="ticket-student-info">
                    <div className="student-avatar-mini" aria-hidden="true">
                      {(g.student_name || 'ST')[0]}
                    </div>
                    <div>
                      <span className="student-name">{g.student_name || 'Student'}</span>
                      <span className="ticket-date">
                        {new Date(g.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant={isEscalated ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleOpenModal(g)}
                  >
                    <span>{g.status === 'resolved' ? 'View Details' : 'Resolve Ticket'}</span>
                    <ArrowUpRight size={14} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Resolution Modal */}
      {selectedGrievance && (
        <Modal
          isOpen={Boolean(selectedGrievance)}
          onClose={() => setSelectedGrievance(null)}
          title={`Grievance Resolution: ${selectedGrievance.title}`}
          size="lg"
        >
          <div className="grievance-modal-body">
            {/* Metadata Bar */}
            <div className="modal-meta-strip">
              <div className="modal-meta-left">
                {getStatusBadge(selectedGrievance.status)}
                <span className="category-pill">{selectedGrievance.category}</span>
                <span className="class-pill">
                  {selectedGrievance.class_name} ({selectedGrievance.class_code})
                </span>
              </div>
              <span className="modal-ticket-id">#{selectedGrievance.id}</span>
            </div>

            {/* Student & Date */}
            <div className="modal-person-row">
              <User size={16} />
              <span>
                Submitted by <strong>{selectedGrievance.student_name}</strong> on{' '}
                {new Date(selectedGrievance.created_at).toLocaleString()}
              </span>
            </div>

            {/* Full Issue Description */}
            <div className="modal-description-box">
              <h4 className="modal-subheading">Student's Stated Issue:</h4>
              <p className="modal-description-text">{selectedGrievance.description}</p>
            </div>

            {/* Audit History Timeline */}
            <div className="modal-timeline-box">
              <h4 className="modal-subheading">Status Progression & Audit Log:</h4>
              <div className="timeline-stepper">
                {selectedGrievance.status_history?.map((step, idx) => (
                  <div key={idx} className="timeline-step-item">
                    <div className="timeline-step-dot" />
                    <div className="timeline-step-content">
                      <div className="step-content-header">
                        <strong className="step-status-tag">
                          {step.status.toUpperCase()}
                        </strong>
                        <span className="step-timestamp">
                          {new Date(step.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="step-note">{step.note}</p>
                      <span className="step-by">Action by: {step.updated_by}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Response Composer */}
            <div className="modal-composer-box">
              <h4 className="modal-subheading">Administrative Resolution / Reply:</h4>
              <p className="composer-help">
                This response is visible to the student and faculty mentor on their portals.
              </p>
              <textarea
                className="composer-textarea"
                rows={3}
                placeholder="Enter formal administrative response, corrective action taken, or official decision..."
                value={adminReplyText}
                onChange={(e) => setAdminReplyText(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="modal-action-footer">
              <Button
                variant="outline"
                onClick={() => setSelectedGrievance(null)}
                disabled={isSubmittingReply}
              >
                Cancel
              </Button>

              <div className="action-buttons-right">
                <Button
                  variant="secondary"
                  onClick={() => handleResolveGrievance(false)}
                  isLoading={isSubmittingReply}
                >
                  Save Response (Keep In Review)
                </Button>

                <Button
                  variant="primary"
                  onClick={() => handleResolveGrievance(true)}
                  isLoading={isSubmittingReply}
                >
                  <CheckCircle2 size={16} />
                  <span>Mark as Resolved</span>
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AdminGrievances;
