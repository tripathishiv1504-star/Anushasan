import React, { useState, useEffect, useCallback } from 'react';
import {
  HeartHandshake,
  AlertTriangle,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  BookOpen,
  Filter,
  Search,
  Trash2,
  Edit2,
  X,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingState from '../../components/common/LoadingState';
import './Counselling.css';

export function Counselling() {
  // State
  const [atRiskGroups, setAtRiskGroups] = useState([]);
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState({
    totalAtRisk: 0,
    totalPlans: 0,
    plannedCount: 0,
    inProgressCount: 0,
    completedCount: 0,
  });
  const [classes, setClasses] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');

  // Create Plan Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
  const [planForm, setPlanForm] = useState({
    title: '',
    classId: '',
    studentIds: [],
    studentNames: [],
    targetDate: '',
    notes: '',
    assignedTo: '',
  });

  // Load counselling data
  const loadCounsellingData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [riskData, plansData, statsData, classList, mentorList] = await Promise.all([
        adminService.getAtRiskStudentsGroupedByClass(),
        adminService.getCounsellingPlans({ status: 'all', classId: 'all' }),
        adminService.getCounsellingStats(),
        adminService.getDepartmentClasses('dept_cs'),
        adminService.getDepartmentMentors('dept_cs'),
      ]);

      setAtRiskGroups(riskData);
      setPlans(plansData);
      setStats(statsData);
      setClasses(classList);
      setMentors(mentorList);

      // Default target date to 7 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      const formattedDate = defaultDate.toISOString().split('T')[0];

      if (classList.length > 0 && !planForm.classId) {
        setPlanForm((prev) => ({
          ...prev,
          classId: classList[0].id,
          targetDate: formattedDate,
          assignedTo: mentorList[0]?.full_name || 'Prof. Rajesh Verma',
        }));
      }
    } catch (err) {
      console.error('Failed to load counselling data:', err);
      setError(err.message || 'Unable to retrieve counselling records.');
    } finally {
      setIsLoading(false);
    }
  }, [planForm.classId]);

  useEffect(() => {
    loadCounsellingData();

    const handleSync = () => {
      loadCounsellingData();
    };

    window.addEventListener('anushasan:counselling_updated', handleSync);

    return () => {
      window.removeEventListener('anushasan:counselling_updated', handleSync);
    };
  }, [loadCounsellingData]);

  const triggerToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Open modal pre-filling for specific student and class
  const handleOpenCreateForStudent = (cls, student) => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);

    setPlanForm({
      title: `${student.name} - Academic & Attendance Recovery Plan`,
      classId: cls.class_id,
      studentIds: [student.id],
      studentNames: [student.name],
      targetDate: defaultDate.toISOString().split('T')[0],
      notes: `Focus intervention on ${student.risk_reason}. Establish daily study target and bi-weekly attendance check-ins.`,
      assignedTo: cls.mentor_name || mentors[0]?.full_name || 'Prof. Rajesh Verma',
    });
    setIsCreateModalOpen(true);
  };

  // Submit new counselling plan
  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!planForm.title.trim()) {
      setError('Please provide a title for the counselling plan.');
      return;
    }
    if (!planForm.classId) {
      setError('Please select a target class section.');
      return;
    }
    if (planForm.studentIds.length === 0) {
      setError('Please select at least one student for intervention.');
      return;
    }

    try {
      setIsSubmittingPlan(true);
      setError(null);

      const targetClass = classes.find((c) => c.id === planForm.classId);

      await adminService.createCounsellingPlan({
        title: planForm.title.trim(),
        classId: planForm.classId,
        className: targetClass?.name || 'Academic Class',
        studentIds: planForm.studentIds,
        studentNames: planForm.studentNames,
        targetDate: planForm.targetDate,
        notes: planForm.notes.trim(),
        assignedTo: planForm.assignedTo || 'Faculty Mentor',
      });

      setIsCreateModalOpen(false);
      await loadCounsellingData();
      triggerToast(`Counselling plan "${planForm.title}" created successfully!`);
    } catch (err) {
      console.error('Failed to create counselling plan:', err);
      setError(err.message || 'Failed to create plan.');
    } finally {
      setIsSubmittingPlan(false);
    }
  };

  // Toggle student selection in modal
  const handleToggleStudentSelection = (student) => {
    const isSelected = planForm.studentIds.includes(student.id);
    if (isSelected) {
      setPlanForm((prev) => ({
        ...prev,
        studentIds: prev.studentIds.filter((id) => id !== student.id),
        studentNames: prev.studentNames.filter((name) => name !== student.name),
      }));
    } else {
      setPlanForm((prev) => ({
        ...prev,
        studentIds: [...prev.studentIds, student.id],
        studentNames: [...prev.studentNames, student.name],
      }));
    }
  };

  // Update plan status (planned -> in_progress -> completed)
  const handleUpdateStatus = async (planId, newStatus) => {
    try {
      await adminService.updateCounsellingPlanStatus(planId, newStatus);
      await loadCounsellingData();
      triggerToast(`Plan status updated to "${newStatus.replace('_', ' ').toUpperCase()}".`);
    } catch (err) {
      console.error('Failed to update plan status:', err);
      setError(err.message || 'Failed to update plan status.');
    }
  };

  // Delete plan
  const handleDeletePlan = async (planId, planTitle) => {
    if (!window.confirm(`Are you sure you want to delete the plan "${planTitle}"?`)) {
      return;
    }
    try {
      await adminService.deleteCounsellingPlan(planId);
      await loadCounsellingData();
      triggerToast(`Counselling plan "${planTitle}" deleted.`);
    } catch (err) {
      console.error('Failed to delete plan:', err);
      setError(err.message || 'Failed to delete plan.');
    }
  };

  // Filtered plans
  const filteredPlans = plans.filter((p) => {
    const statusMatches = statusFilter === 'all' || p.status === statusFilter;
    const classMatches = classFilter === 'all' || p.class_id === classFilter;
    return statusMatches && classMatches;
  });

  // Students available for selected class in modal
  const availableStudentsForModal = (
    atRiskGroups.find((g) => g.class_id === planForm.classId)?.students || []
  );

  if (isLoading && plans.length === 0 && atRiskGroups.length === 0) {
    return <LoadingState message="Loading counselling plans & at-risk student records..." minHeight="60vh" />;
  }

  return (
    <div className="counselling-page">
      {/* Page Header */}
      <div className="counselling-header">
        <div>
          <h1 className="counselling-title">Academic & Discipline Counselling</h1>
          <p className="counselling-subtitle">
            Structure personalized recovery roadmaps for at-risk students and track intervention outcomes.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 7);
            const firstClass = classes[0];
            const firstGroup = atRiskGroups[0];
            const firstStudent = firstGroup?.students[0];

            setPlanForm({
              title: firstStudent ? `${firstStudent.name} - Recovery Plan` : 'Academic Counselling Plan',
              classId: firstClass?.id || 'class_os_301',
              studentIds: firstStudent ? [firstStudent.id] : [],
              studentNames: firstStudent ? [firstStudent.name] : [],
              targetDate: defaultDate.toISOString().split('T')[0],
              notes: 'Scheduled intervention session and study tracking milestones.',
              assignedTo: mentors[0]?.full_name || 'Prof. Rajesh Verma',
            });
            setIsCreateModalOpen(true);
          }}
        >
          <Plus size={16} />
          <span>Create Counselling Plan</span>
        </Button>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className={`counselling-toast toast-${toastMessage.type}`} role="alert">
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
        <div className="counselling-error-banner" role="alert">
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

      {/* Summary Metrics Strip */}
      <div className="counselling-stats-grid">
        <div className="counsel-stat-box box-risk">
          <div className="counsel-stat-icon icon-risk">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="counsel-stat-val val-risk">{stats.totalAtRisk}</div>
            <div className="counsel-stat-label">At-Risk Students</div>
          </div>
        </div>

        <div className="counsel-stat-box">
          <div className="counsel-stat-icon icon-total">
            <HeartHandshake size={20} />
          </div>
          <div>
            <div className="counsel-stat-val">{stats.totalPlans}</div>
            <div className="counsel-stat-label">Total Plans</div>
          </div>
        </div>

        <div className="counsel-stat-box">
          <div className="counsel-stat-icon icon-planned">
            <Clock size={20} />
          </div>
          <div>
            <div className="counsel-stat-val">{stats.plannedCount}</div>
            <div className="counsel-stat-label">Planned</div>
          </div>
        </div>

        <div className="counsel-stat-box">
          <div className="counsel-stat-icon icon-progress">
            <Layers size={20} />
          </div>
          <div>
            <div className="counsel-stat-val">{stats.inProgressCount}</div>
            <div className="counsel-stat-label">In Progress</div>
          </div>
        </div>

        <div className="counsel-stat-box">
          <div className="counsel-stat-icon icon-completed">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="counsel-stat-val">{stats.completedCount}</div>
            <div className="counsel-stat-label">Completed</div>
          </div>
        </div>
      </div>

      {/* Section A: At-Risk Students Grouped by Class */}
      <div className="counselling-section">
        <div className="section-title-strip">
          <AlertTriangle size={18} className="title-icon-risk" />
          <div>
            <h2 className="section-heading">
              At-Risk Students Requiring Intervention ({stats.totalAtRisk})
            </h2>
            <p className="section-desc">
              Students identified by early warning triggers (Discipline Score &lt; 50 or steep 15+ pt drops).
            </p>
          </div>
        </div>

        {atRiskGroups.length === 0 ? (
          <Card className="empty-atrisk-card">
            <CheckCircle2 size={32} className="empty-check-icon" />
            <h3>No at-risk students currently flagged</h3>
            <p>All enrolled students in the department are meeting minimum discipline benchmarks.</p>
          </Card>
        ) : (
          <div className="risk-groups-stack">
            {atRiskGroups.map((group) => (
              <Card key={group.class_id} className="risk-group-card">
                <div className="group-card-header">
                  <div className="group-header-left">
                    <BookOpen size={18} className="class-icon" />
                    <div>
                      <h3 className="group-class-name">
                        {group.class_name}{' '}
                        <span className="group-code-pill">[{group.join_code}]</span>
                      </h3>
                      <span className="group-mentor-sub">
                        Faculty Mentor: <strong>{group.mentor_name}</strong>
                      </span>
                    </div>
                  </div>

                  <span className="group-flag-badge">
                    {group.students.length} Student{group.students.length === 1 ? '' : 's'} Flagged
                  </span>
                </div>

                <div className="group-students-grid">
                  {group.students.map((student) => (
                    <div key={student.id} className="risk-student-item">
                      <div className="student-item-top">
                        <div className="student-id-row">
                          <span className="student-avatar-badge" aria-hidden="true">
                            {student.name[0]}
                          </span>
                          <div>
                            <strong className="student-name">{student.name}</strong>
                            <span className="student-email">{student.email}</span>
                          </div>
                        </div>

                        <div className="score-badge-box">
                          <span className="score-num">{student.current_score}</span>
                          <span className="score-max">/100</span>
                        </div>
                      </div>

                      <div className="risk-reason-box">
                        <span className="reason-text">{student.risk_reason}</span>
                      </div>

                      <div className="student-metrics-mini-row">
                        <span className="mini-metric">
                          Attendance: <strong>{student.attendance_pct}%</strong>
                        </span>
                        <span className="mini-metric">
                          Streak: <strong>{student.streak} days</strong>
                        </span>
                      </div>

                      <div className="student-action-row">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenCreateForStudent(group, student)}
                        >
                          <span>Plan Counselling</span>
                          <ArrowRight size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Section B: Active Counselling Plans Board */}
      <div className="counselling-section">
        <div className="section-title-strip">
          <HeartHandshake size={18} className="title-icon-heart" />
          <div>
            <h2 className="section-heading">Active Counselling & Intervention Plans</h2>
            <p className="section-desc">
              Track intervention progression, target completion dates, and faculty assignments.
            </p>
          </div>
        </div>

        {/* Toolbar: Filters */}
        <Card className="counselling-toolbar-card">
          <div className="status-tabs-row">
            <button
              type="button"
              className={`filter-tab-btn ${statusFilter === 'all' ? 'tab-active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              <span>All Plans</span>
              <span className="tab-badge">{stats.totalPlans}</span>
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${statusFilter === 'planned' ? 'tab-active' : ''}`}
              onClick={() => setStatusFilter('planned')}
            >
              <span>Planned</span>
              <span className="tab-badge">{stats.plannedCount}</span>
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${statusFilter === 'in_progress' ? 'tab-active' : ''}`}
              onClick={() => setStatusFilter('in_progress')}
            >
              <span>In Progress</span>
              <span className="tab-badge">{stats.inProgressCount}</span>
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${statusFilter === 'completed' ? 'tab-active' : ''}`}
              onClick={() => setStatusFilter('completed')}
            >
              <span>Completed</span>
              <span className="tab-badge">{stats.completedCount}</span>
            </button>
          </div>

          <div className="class-filter-select-wrapper">
            <Filter size={15} />
            <select
              className="class-select"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option value="all">All Course Sections</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Plans List */}
        {filteredPlans.length === 0 ? (
          <Card className="empty-plans-card">
            <HeartHandshake size={32} className="empty-handshake-icon" />
            <h3>No counselling plans found</h3>
            <p>
              {statusFilter === 'all'
                ? 'No counselling plans have been established yet. Click "+ Create Counselling Plan" to begin.'
                : `No plans match the filter "${statusFilter.replace('_', ' ')}".`}
            </p>
          </Card>
        ) : (
          <div className="plans-grid">
            {filteredPlans.map((plan) => {
              const isCompleted = plan.status === 'completed';
              const isInProgress = plan.status === 'in_progress';

              return (
                <Card
                  key={plan.id}
                  className={`plan-card ${
                    isCompleted
                      ? 'plan-card-completed'
                      : isInProgress
                      ? 'plan-card-progress'
                      : 'plan-card-planned'
                  }`}
                >
                  <div className="plan-card-header">
                    <div className="plan-badge-group">
                      <span className={`plan-status-pill status-${plan.status}`}>
                        {plan.status === 'in_progress'
                          ? 'In Progress'
                          : plan.status === 'planned'
                          ? 'Planned'
                          : 'Completed'}
                      </span>
                      <span className="plan-class-pill">{plan.class_name}</span>
                    </div>

                    <button
                      type="button"
                      className="plan-delete-btn"
                      onClick={() => handleDeletePlan(plan.id, plan.title)}
                      title="Delete counselling plan"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <h3 className="plan-card-title">{plan.title}</h3>

                  {/* Student Tag Pills */}
                  <div className="plan-students-row">
                    <span className="plan-sub-label">Target Students:</span>
                    <div className="student-pills-list">
                      {plan.student_names?.map((name, i) => (
                        <span key={i} className="student-name-pill">
                          <User size={12} />
                          <span>{name}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Plan Notes */}
                  {plan.notes && (
                    <div className="plan-notes-box">
                      <p className="plan-notes-text">{plan.notes}</p>
                    </div>
                  )}

                  {/* Meta: Target Date & Assigned Counsellor */}
                  <div className="plan-meta-row">
                    <span className="plan-meta-item">
                      <Calendar size={14} />
                      <span>Target Date: {plan.target_date || 'TBD'}</span>
                    </span>
                    <span className="plan-meta-item">
                      <Shield size={14} />
                      <span>Assigned to: {plan.assigned_to}</span>
                    </span>
                  </div>

                  {/* Interactive Status Switcher */}
                  <div className="plan-action-toolbar">
                    <span className="action-toolbar-label">Update Status:</span>
                    <div className="status-toggle-group">
                      <button
                        type="button"
                        className={`toggle-btn ${plan.status === 'planned' ? 'btn-active' : ''}`}
                        onClick={() => handleUpdateStatus(plan.id, 'planned')}
                      >
                        Planned
                      </button>
                      <button
                        type="button"
                        className={`toggle-btn ${plan.status === 'in_progress' ? 'btn-active' : ''}`}
                        onClick={() => handleUpdateStatus(plan.id, 'in_progress')}
                      >
                        In Progress
                      </button>
                      <button
                        type="button"
                        className={`toggle-btn ${plan.status === 'completed' ? 'btn-active' : ''}`}
                        onClick={() => handleUpdateStatus(plan.id, 'completed')}
                      >
                        <CheckCircle2 size={13} />
                        <span>Completed</span>
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Create Counselling Plan */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Student Counselling Plan"
          size="lg"
        >
          <form onSubmit={handleCreatePlan} className="counselling-form">
            <p className="modal-intro-text">
              Configure an academic recovery intervention plan. Targeted students and the assigned faculty mentor will be notified.
            </p>

            {/* Plan Title */}
            <div className="form-field">
              <label htmlFor="plan-title-input" className="form-label">
                Plan Title & Objective:
              </label>
              <input
                id="plan-title-input"
                type="text"
                className="form-input"
                placeholder="e.g. Operating Systems Attendance Recovery Plan"
                value={planForm.title}
                onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                required
              />
            </div>

            {/* Target Class Section */}
            <div className="form-field">
              <label htmlFor="plan-class-select" className="form-label">
                Course Section:
              </label>
              <select
                id="plan-class-select"
                className="form-input"
                value={planForm.classId}
                onChange={(e) => {
                  const newClassId = e.target.value;
                  const newGroup = atRiskGroups.find((g) => g.class_id === newClassId);
                  setPlanForm({
                    ...planForm,
                    classId: newClassId,
                    studentIds: newGroup?.students.map((s) => s.id) || [],
                    studentNames: newGroup?.students.map((s) => s.name) || [],
                  });
                }}
                required
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.join_code})
                  </option>
                ))}
              </select>
            </div>

            {/* Multi-student selection */}
            <div className="form-field">
              <label className="form-label">
                Targeted Students for Intervention (Select one or more):
              </label>
              {availableStudentsForModal.length === 0 ? (
                <p className="no-students-notice">
                  No flagged at-risk students in this class. You may still select other enrolled students.
                </p>
              ) : (
                <div className="student-checkbox-list">
                  {availableStudentsForModal.map((student) => {
                    const isChecked = planForm.studentIds.includes(student.id);
                    return (
                      <label
                        key={student.id}
                        className={`student-checkbox-item ${isChecked ? 'item-checked' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleStudentSelection(student)}
                        />
                        <div className="checkbox-info">
                          <strong>{student.name}</strong>
                          <span>
                            Score: {student.current_score} • {student.risk_reason}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Two Column Row: Target Date & Assigned Mentor */}
            <div className="form-row-two">
              <div className="form-field">
                <label htmlFor="plan-date-input" className="form-label">
                  Target Intervention Date:
                </label>
                <input
                  id="plan-date-input"
                  type="date"
                  className="form-input"
                  value={planForm.targetDate}
                  onChange={(e) => setPlanForm({ ...planForm, targetDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="plan-mentor-select" className="form-label">
                  Assigned Faculty or Counsellor:
                </label>
                <select
                  id="plan-mentor-select"
                  className="form-input"
                  value={planForm.assignedTo}
                  onChange={(e) => setPlanForm({ ...planForm, assignedTo: e.target.value })}
                >
                  {mentors.map((m) => (
                    <option key={m.id} value={m.full_name}>
                      {m.full_name} (Faculty Mentor)
                    </option>
                  ))}
                  <option value="Dr. Sunita Rao (Academic Dean)">
                    Dr. Sunita Rao (Academic Dean)
                  </option>
                  <option value="Campus Student Counselling Cell">
                    Campus Student Counselling Cell
                  </option>
                </select>
              </div>
            </div>

            {/* Notes / Action Strategy */}
            <div className="form-field">
              <label htmlFor="plan-notes-input" className="form-label">
                Intervention Strategy & Milestones:
              </label>
              <textarea
                id="plan-notes-input"
                className="form-textarea"
                rows={3}
                placeholder="Specific guidance, remedial sessions, daily study hour commitment, or attendance recovery milestones..."
                value={planForm.notes}
                onChange={(e) => setPlanForm({ ...planForm, notes: e.target.value })}
              />
            </div>

            {/* Actions */}
            <div className="modal-actions-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmittingPlan}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmittingPlan}
              >
                <Plus size={16} />
                <span>Save Counselling Plan</span>
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Counselling;
