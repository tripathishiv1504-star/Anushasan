import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Building2,
  Users,
  BookOpen,
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  ArrowLeftRight,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Mail,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingState from '../../components/common/LoadingState';
import './DepartmentSetup.css';

export function DepartmentSetup() {
  // State
  const [department, setDepartment] = useState(null);
  const [stats, setStats] = useState({ totalMentors: 0, totalClasses: 0, totalStudents: 0 });
  const [mentors, setMentors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Department Edit State
  const [isEditingDept, setIsEditingDept] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' });
  const [isSavingDept, setIsSavingDept] = useState(false);

  // Search Filters
  const [mentorSearch, setMentorSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');

  // Add Mentor Modal State
  const [isAddMentorOpen, setIsAddMentorOpen] = useState(false);
  const [mentorForm, setMentorForm] = useState({ fullName: '', email: '' });
  const [isAddingMentor, setIsAddingMentor] = useState(false);

  // Remove Mentor Modal State
  const [mentorToRemove, setMentorToRemove] = useState(null);
  const [reassignTargetId, setReassignTargetId] = useState('');
  const [isRemovingMentor, setIsRemovingMentor] = useState(false);

  // Reassign Class Modal State
  const [classToReassign, setClassToReassign] = useState(null);
  const [selectedNewMentorId, setSelectedNewMentorId] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);

  // Load all department data
  const loadDepartmentData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [overviewData, mentorsData, classesData] = await Promise.all([
        adminService.getDepartmentOverview('dept_cs'),
        adminService.getDepartmentMentors('dept_cs'),
        adminService.getDepartmentClasses('dept_cs'),
      ]);

      setDepartment(overviewData.department);
      setStats(overviewData.stats);
      setMentors(mentorsData);
      setClasses(classesData);

      setDeptForm({
        name: overviewData.department.name || '',
        code: overviewData.department.code || 'CSE',
        description: overviewData.department.description || '',
      });
    } catch (err) {
      console.error('Failed to load department setup:', err);
      setError(err.message || 'Unable to load department data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartmentData();

    const handleDataUpdated = () => {
      loadDepartmentData();
    };

    window.addEventListener('anushasan:mentors_updated', handleDataUpdated);
    window.addEventListener('anushasan:classes_updated', handleDataUpdated);

    return () => {
      window.removeEventListener('anushasan:mentors_updated', handleDataUpdated);
      window.removeEventListener('anushasan:classes_updated', handleDataUpdated);
    };
  }, [loadDepartmentData]);

  // Toast feedback helper
  const triggerToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Department Name / Details Update Handler
  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    if (!deptForm.name.trim() || deptForm.name.trim().length < 3) {
      setError('Department name must be at least 3 characters long.');
      return;
    }

    try {
      setIsSavingDept(true);
      setError(null);

      const updated = await adminService.updateDepartment('dept_cs', deptForm);
      setDepartment(updated);
      setIsEditingDept(false);
      triggerToast('Department details updated successfully!');
    } catch (err) {
      console.error('Failed to update department:', err);
      setError(err.message || 'Failed to update department details.');
    } finally {
      setIsSavingDept(false);
    }
  };

  // 2. Add Mentor Handler
  const handleAddMentor = async (e) => {
    e.preventDefault();
    if (!mentorForm.fullName.trim() || mentorForm.fullName.trim().length < 2) {
      setError('Mentor name must be at least 2 characters long.');
      return;
    }

    try {
      setIsAddingMentor(true);
      setError(null);

      const created = await adminService.addMentor({
        fullName: mentorForm.fullName.trim(),
        email: mentorForm.email.trim(),
        departmentId: 'dept_cs',
      });

      setIsAddMentorOpen(false);
      setMentorForm({ fullName: '', email: '' });
      await loadDepartmentData();
      triggerToast(`Faculty mentor "${created.full_name}" added successfully.`);
    } catch (err) {
      console.error('Failed to add mentor:', err);
      setError(err.message || 'Failed to add mentor.');
    } finally {
      setIsAddingMentor(false);
    }
  };

  // 3. Open Remove Mentor Modal
  const handleOpenRemoveMentor = (mentor) => {
    setMentorToRemove(mentor);
    // Default reassign target to first mentor that isn't this one
    const otherMentors = mentors.filter((m) => m.id !== mentor.id);
    setReassignTargetId(otherMentors.length > 0 ? otherMentors[0].id : '');
  };

  // 3. Confirm Remove Mentor
  const handleConfirmRemoveMentor = async () => {
    if (!mentorToRemove) return;

    try {
      setIsRemovingMentor(true);
      setError(null);

      const res = await adminService.removeMentor(mentorToRemove.id, {
        reassignToMentorId: reassignTargetId || null,
      });

      const removedName = mentorToRemove.full_name;
      setMentorToRemove(null);
      await loadDepartmentData();
      triggerToast(
        res.reassignedClassCount > 0
          ? `Mentor "${removedName}" removed. ${res.reassignedClassCount} class(es) successfully reassigned.`
          : `Mentor "${removedName}" removed from department.`
      );
    } catch (err) {
      console.error('Failed to remove mentor:', err);
      setError(err.message || 'Failed to remove mentor.');
    } finally {
      setIsRemovingMentor(false);
    }
  };

  // 4. Open Reassign Class Modal
  const handleOpenReassignClass = (cls) => {
    setClassToReassign(cls);
    // Default to another mentor if possible
    const otherMentor = mentors.find((m) => m.id !== cls.mentor_id) || mentors[0];
    setSelectedNewMentorId(otherMentor ? otherMentor.id : cls.mentor_id);
  };

  // 4. Confirm Reassign Class
  const handleConfirmReassignClass = async () => {
    if (!classToReassign || !selectedNewMentorId) return;

    try {
      setIsReassigning(true);
      setError(null);

      const updated = await adminService.reassignClassMentor(
        classToReassign.id,
        selectedNewMentorId
      );

      const targetMentor = mentors.find((m) => m.id === selectedNewMentorId);
      setClassToReassign(null);
      await loadDepartmentData();
      triggerToast(
        `Class "${updated.name}" reassigned to ${targetMentor?.full_name || 'new mentor'}!`
      );
    } catch (err) {
      console.error('Failed to reassign class:', err);
      setError(err.message || 'Failed to reassign class.');
    } finally {
      setIsReassigning(false);
    }
  };

  // Filtered lists
  const filteredMentors = useMemo(() => {
    if (!mentorSearch.trim()) return mentors;
    const q = mentorSearch.toLowerCase().trim();
    return mentors.filter(
      (m) =>
        m.full_name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [mentors, mentorSearch]);

  const filteredClasses = useMemo(() => {
    if (!classSearch.trim()) return classes;
    const q = classSearch.toLowerCase().trim();
    return classes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.join_code || '').toLowerCase().includes(q) ||
        (c.mentor_name || '').toLowerCase().includes(q) ||
        (c.subject || '').toLowerCase().includes(q)
    );
  }, [classes, classSearch]);

  if (isLoading && !department) {
    return <LoadingState message="Loading department administration & setup..." minHeight="60vh" />;
  }

  return (
    <div className="dept-setup-page">
      {/* Page Header */}
      <div className="dept-setup-header">
        <div>
          <h1 className="dept-setup-title">Department Administration & Setup</h1>
          <p className="dept-setup-subtitle">
            Configure academic department details, manage faculty mentors, and allocate course sections.
          </p>
        </div>

        {/* Global Department Badge */}
        {department && (
          <div className="dept-header-badge">
            <span className="dept-code-tag">{department.code || 'CSE'}</span>
            <span className="dept-name-tag">{department.name}</span>
          </div>
        )}
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className={`dept-toast toast-${toastMessage.type}`} role="alert">
          <CheckCircle2 className="toast-icon" />
          <span>{toastMessage.text}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss toast"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="dept-error-banner" role="alert">
          <AlertTriangle className="error-icon" />
          <span>{error}</span>
          <button
            type="button"
            className="error-close"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 1. Department Overview & Name Editor Card */}
      <Card className="dept-info-card">
        <div className="dept-info-header">
          <div className="dept-title-area">
            <div className="dept-icon-box" aria-hidden="true">
              <Building2 size={24} />
            </div>
            <div>
              <div className="dept-subtag">Academic Department</div>
              <h2 className="dept-main-name">
                {department?.name}{' '}
                <span className="dept-code-pill">[{department?.code || 'CSE'}]</span>
              </h2>
            </div>
          </div>

          <Button
            variant={isEditingDept ? 'ghost' : 'outline'}
            size="sm"
            onClick={() => setIsEditingDept(!isEditingDept)}
          >
            {isEditingDept ? <X size={16} /> : <Edit2 size={16} />}
            <span>{isEditingDept ? 'Cancel Edit' : 'Edit Details'}</span>
          </Button>
        </div>

        {/* Edit Form or Read View */}
        {isEditingDept ? (
          <form onSubmit={handleSaveDepartment} className="dept-edit-form">
            <div className="dept-form-grid">
              <div className="form-field">
                <label htmlFor="dept-name-input" className="form-label">
                  Department Name:
                </label>
                <input
                  id="dept-name-input"
                  type="text"
                  className="form-input"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="dept-code-input" className="form-label">
                  Department Code:
                </label>
                <input
                  id="dept-code-input"
                  type="text"
                  className="form-input"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. CSE"
                  maxLength={6}
                />
              </div>

              <div className="form-field form-field-full">
                <label htmlFor="dept-desc-input" className="form-label">
                  Department Scope & Description:
                </label>
                <textarea
                  id="dept-desc-input"
                  className="form-textarea"
                  rows={2}
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  placeholder="Overview of department domains, curriculum, and faculty focus..."
                />
              </div>
            </div>

            <div className="form-action-row">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditingDept(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSavingDept}
              >
                <Save size={16} />
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        ) : (
          <p className="dept-description-text">
            {department?.description ||
              'Department dedicated to student discipline, mentorship, and excellence across technical and academic programs.'}
          </p>
        )}

        {/* Department Aggregate Metrics Strip */}
        <div className="dept-stats-grid">
          <div className="dept-stat-box">
            <div className="dept-stat-icon-wrapper stat-icon-mentors">
              <Users size={20} />
            </div>
            <div>
              <div className="dept-stat-num">{stats.totalMentors}</div>
              <div className="dept-stat-label">Faculty Mentors</div>
            </div>
          </div>

          <div className="dept-stat-box">
            <div className="dept-stat-icon-wrapper stat-icon-classes">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="dept-stat-num">{stats.totalClasses}</div>
              <div className="dept-stat-label">Course Sections</div>
            </div>
          </div>

          <div className="dept-stat-box">
            <div className="dept-stat-icon-wrapper stat-icon-students">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="dept-stat-num">{stats.totalStudents}</div>
              <div className="dept-stat-label">Enrolled Students</div>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Faculty Mentors Table Section */}
      <Card className="dept-section-card">
        <div className="section-toolbar">
          <div>
            <h2 className="section-title">
              Faculty Mentors ({mentors.length})
            </h2>
            <p className="section-subtitle">
              Manage faculty mentors assigned to this academic department.
            </p>
          </div>

          <div className="section-actions-row">
            <div className="search-input-wrapper">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search mentors..."
                value={mentorSearch}
                onChange={(e) => setMentorSearch(e.target.value)}
              />
              {mentorSearch && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setMentorSearch('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddMentorOpen(true)}
            >
              <Plus size={16} />
              <span>Add Mentor</span>
            </Button>
          </div>
        </div>

        {/* Mentors Table */}
        {filteredMentors.length === 0 ? (
          <div className="section-empty-box">
            <Users size={32} className="empty-icon" />
            <p>No mentors found matching "{mentorSearch}".</p>
          </div>
        ) : (
          <div className="table-responsive-container">
            <table className="dept-table">
              <thead>
                <tr>
                  <th scope="col">Faculty Mentor</th>
                  <th scope="col">Email Address</th>
                  <th scope="col">Assigned Classes</th>
                  <th scope="col" className="th-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMentors.map((mentor) => {
                  const initials = mentor.full_name
                    ? mentor.full_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : 'FM';

                  return (
                    <tr key={mentor.id} className="dept-table-row">
                      <td className="td-name">
                        <div className="person-cell">
                          <div className="person-avatar" aria-hidden="true">
                            {initials}
                          </div>
                          <div>
                            <strong className="person-name">{mentor.full_name}</strong>
                            <span className="person-role">Faculty Mentor</span>
                          </div>
                        </div>
                      </td>

                      <td className="td-email">
                        <span className="email-text">{mentor.email}</span>
                      </td>

                      <td className="td-classes">
                        <div className="classes-count-cell">
                          <span className={`class-count-badge ${mentor.class_count > 0 ? 'badge-active' : 'badge-idle'}`}>
                            {mentor.class_count} {mentor.class_count === 1 ? 'Class' : 'Classes'}
                          </span>
                          {mentor.assigned_classes && mentor.assigned_classes.length > 0 && (
                            <span className="classes-code-snippet">
                              {mentor.assigned_classes.map((c) => c.join_code).join(', ')}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="td-action">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenRemoveMentor(mentor)}
                          className="btn-remove-mentor"
                          title={`Remove ${mentor.full_name} from department`}
                        >
                          <Trash2 size={16} />
                          <span>Remove</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 3. Department Classes & Reassignment Table Section */}
      <Card className="dept-section-card">
        <div className="section-toolbar">
          <div>
            <h2 className="section-title">
              Department Course Sections ({classes.length})
            </h2>
            <p className="section-subtitle">
              Overview of all active classes across the department with mentor reassignments.
            </p>
          </div>

          <div className="section-actions-row">
            <div className="search-input-wrapper">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search classes or mentor..."
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
              />
              {classSearch && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setClassSearch('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Classes Table */}
        {filteredClasses.length === 0 ? (
          <div className="section-empty-box">
            <BookOpen size={32} className="empty-icon" />
            <p>No classes found matching "{classSearch}".</p>
          </div>
        ) : (
          <div className="table-responsive-container">
            <table className="dept-table">
              <thead>
                <tr>
                  <th scope="col">Course Section & Code</th>
                  <th scope="col">Domain / Subject</th>
                  <th scope="col">Assigned Faculty Mentor</th>
                  <th scope="col">Enrolled Students</th>
                  <th scope="col" className="th-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.map((cls) => {
                  return (
                    <tr key={cls.id} className="dept-table-row">
                      <td className="td-course">
                        <div className="course-title-cell">
                          <strong className="course-title">{cls.name}</strong>
                          <span className="join-code-pill">Code: {cls.join_code}</span>
                        </div>
                      </td>

                      <td className="td-subject">
                        <span className="subject-text">{cls.subject}</span>
                      </td>

                      <td className="td-mentor">
                        <div className="mentor-assigned-cell">
                          <UserCheck size={16} className="mentor-icon" />
                          <span>{cls.mentor_name || 'Unassigned'}</span>
                        </div>
                      </td>

                      <td className="td-students">
                        <span className="students-badge">
                          {cls.student_count || 0} Students
                        </span>
                      </td>

                      <td className="td-action">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenReassignClass(cls)}
                          className="btn-reassign"
                          title="Reassign course section to another mentor"
                        >
                          <ArrowLeftRight size={14} />
                          <span>Reassign</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Mentor Modal */}
      {isAddMentorOpen && (
        <Modal
          isOpen={isAddMentorOpen}
          onClose={() => setIsAddMentorOpen(false)}
          title="Add Faculty Mentor"
          size="md"
        >
          <form onSubmit={handleAddMentor} className="modal-form">
            <p className="modal-form-intro">
              Enter the new faculty mentor's information. A mentor account will be created with default credentials (<code>Password123</code>).
            </p>

            <div className="form-field">
              <label htmlFor="new-mentor-name" className="form-label">
                Full Name (with Honorific):
              </label>
              <input
                id="new-mentor-name"
                type="text"
                className="form-input"
                placeholder="e.g. Dr. Kavita Raman"
                value={mentorForm.fullName}
                onChange={(e) => setMentorForm({ ...mentorForm, fullName: e.target.value })}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="new-mentor-email" className="form-label">
                Institutional Email:
              </label>
              <input
                id="new-mentor-email"
                type="email"
                className="form-input"
                placeholder="e.g. kavita.raman@campus.edu"
                value={mentorForm.email}
                onChange={(e) => setMentorForm({ ...mentorForm, email: e.target.value })}
                required
              />
            </div>

            <div className="modal-actions-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddMentorOpen(false)}
                disabled={isAddingMentor}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isAddingMentor}
              >
                <Plus size={16} />
                <span>Add Mentor</span>
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Remove Mentor Confirmation Modal */}
      {mentorToRemove && (
        <Modal
          isOpen={Boolean(mentorToRemove)}
          onClose={() => setMentorToRemove(null)}
          title="Remove Faculty Mentor"
          size="md"
        >
          <div className="remove-mentor-modal-body">
            <div className="remove-warning-callout">
              <AlertTriangle size={24} className="warning-icon" />
              <div>
                <strong>Confirm Removal of Faculty Mentor</strong>
                <p>
                  You are about to remove <strong>{mentorToRemove.full_name}</strong> ({mentorToRemove.email}) from the department.
                </p>
              </div>
            </div>

            {mentorToRemove.class_count > 0 && (
              <div className="reassign-needed-box">
                <p className="reassign-notice-text">
                  This mentor is currently assigned to <strong>{mentorToRemove.class_count} active class(es)</strong>. Please select a colleague to take over their course sections:
                </p>

                <div className="form-field">
                  <label htmlFor="reassign-target-select" className="form-label">
                    Reassign Classes To:
                  </label>
                  <select
                    id="reassign-target-select"
                    className="form-input"
                    value={reassignTargetId}
                    onChange={(e) => setReassignTargetId(e.target.value)}
                  >
                    {mentors
                      .filter((m) => m.id !== mentorToRemove.id)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.full_name} ({m.email})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}

            <div className="modal-actions-row">
              <Button
                variant="outline"
                onClick={() => setMentorToRemove(null)}
                disabled={isRemovingMentor}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmRemoveMentor}
                isLoading={isRemovingMentor}
              >
                <Trash2 size={16} />
                <span>Confirm & Remove</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reassign Class Modal */}
      {classToReassign && (
        <Modal
          isOpen={Boolean(classToReassign)}
          onClose={() => setClassToReassign(null)}
          title="Reassign Course Section Mentor"
          size="md"
        >
          <div className="reassign-modal-body">
            <div className="class-summary-box">
              <BookOpen size={20} className="class-box-icon" />
              <div>
                <strong className="class-box-name">{classToReassign.name}</strong>
                <div className="class-box-sub">
                  Code: <code>{classToReassign.join_code}</code> • Currently taught by{' '}
                  <strong>{classToReassign.mentor_name}</strong>
                </div>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="new-mentor-select" className="form-label">
                Select New Assigned Mentor:
              </label>
              <select
                id="new-mentor-select"
                className="form-input"
                value={selectedNewMentorId}
                onChange={(e) => setSelectedNewMentorId(e.target.value)}
              >
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} ({m.email}) {m.id === classToReassign.mentor_id ? '— (Current)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions-row">
              <Button
                variant="outline"
                onClick={() => setClassToReassign(null)}
                disabled={isReassigning}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmReassignClass}
                isLoading={isReassigning}
              >
                <ArrowLeftRight size={16} />
                <span>Confirm Reassignment</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default DepartmentSetup;
