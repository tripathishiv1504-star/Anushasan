import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Users,
  BookOpen,
  KeyRound,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mentorService } from '../../services/mentorService';
import ClassCard from '../../components/mentor/ClassCard';
import CreateClassModal from '../../components/mentor/CreateClassModal';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import './Classes.css';

export function Classes() {
  const { user } = useAuth();
  const mentorId = user?.id || 'user_mentor_1';
  const mentorName = user?.full_name || 'Prof. Rajesh Verma';

  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Rename modal state
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameName, setRenameName] = useState('');
  const [renameSubject, setRenameSubject] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameError, setRenameError] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch mentor classes on mount
  const loadClasses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await mentorService.getMentorClasses(mentorId);
      setClasses(data);
    } catch (err) {
      console.error('Failed to load mentor classes:', err);
      setError('Could not load classes. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [mentorId]);

  // Derived statistics
  const stats = useMemo(() => {
    const totalClasses = classes.length;
    const totalStudents = classes.reduce(
      (sum, c) => sum + (c.student_count || 0),
      0
    );
    const activeCodes = classes.filter((c) => Boolean(c.join_code)).length;
    return { totalClasses, totalStudents, activeCodes };
  }, [classes]);

  // Unique subjects for filter dropdown
  const subjectList = useMemo(() => {
    const set = new Set(classes.map((c) => c.subject).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [classes]);

  // Filtered classes
  const filteredClasses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return classes.filter((c) => {
      const matchesSearch =
        !q ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.subject && c.subject.toLowerCase().includes(q)) ||
        (c.join_code && c.join_code.toLowerCase().includes(q));

      const matchesSubject =
        selectedSubject === 'ALL' || c.subject === selectedSubject;

      return matchesSearch && matchesSubject;
    });
  }, [classes, searchQuery, selectedSubject]);

  // Class created callback
  const handleClassCreated = (newClass) => {
    setClasses((prev) => [newClass, ...prev]);
    showToast(
      `Class "${newClass.name}" created with join code ${newClass.join_code}!`,
      'success'
    );
  };

  // Open Rename modal
  const handleOpenRename = (classItem) => {
    setRenameTarget(classItem);
    setRenameName(classItem.name);
    setRenameSubject(classItem.subject || 'Computer Science');
    setRenameError('');
  };

  // Submit Rename
  const handleConfirmRename = async (e) => {
    e.preventDefault();
    if (!renameTarget) return;

    if (!renameName.trim() || renameName.trim().length < 3) {
      setRenameError('Class name must be at least 3 characters long.');
      return;
    }

    try {
      setIsRenaming(true);
      const updated = await mentorService.updateClass(renameTarget.id, {
        name: renameName.trim(),
        subject: renameSubject.trim(),
      });

      setClasses((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
      );
      setRenameTarget(null);
      showToast(`Class updated to "${updated.name}" successfully!`, 'success');
    } catch (err) {
      setRenameError(err.message || 'Failed to rename class.');
    } finally {
      setIsRenaming(false);
    }
  };

  // Open Delete confirmation modal
  const handleOpenDelete = (classItem) => {
    setDeleteTarget(classItem);
  };

  // Submit Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      await mentorService.deleteClass(deleteTarget.id);
      setClasses((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      const deletedName = deleteTarget.name;
      setDeleteTarget(null);
      showToast(`Class "${deletedName}" has been deleted.`, 'info');
    } catch (err) {
      console.error('Failed to delete class:', err);
      showToast('Failed to delete class. Please try again.', 'danger');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mentor-classes">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`mentor-classes__toast mentor-classes__toast--${toastMessage.type}`}
          role="status"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="mentor-classes__header">
        <div className="mentor-classes__title-group">
          <h1>My Classes</h1>
          <p className="mentor-classes__subtitle">
            Manage your course sections, share join codes with students, and track classroom engagement.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsCreateOpen(true)}
        >
          Create Class
        </Button>
      </div>

      {/* Top Stat Cards */}
      <div className="mentor-classes__stats">
        <div className="mentor-classes__stat-card">
          <div className="mentor-classes__stat-icon mentor-classes__stat-icon--primary">
            <BookOpen size={22} />
          </div>
          <div className="mentor-classes__stat-info">
            <span className="mentor-classes__stat-value">{stats.totalClasses}</span>
            <span className="mentor-classes__stat-label">Total Classes</span>
          </div>
        </div>

        <div className="mentor-classes__stat-card">
          <div className="mentor-classes__stat-icon mentor-classes__stat-icon--accent">
            <Users size={22} />
          </div>
          <div className="mentor-classes__stat-info">
            <span className="mentor-classes__stat-value">{stats.totalStudents}</span>
            <span className="mentor-classes__stat-label">Enrolled Students</span>
          </div>
        </div>

        <div className="mentor-classes__stat-card">
          <div className="mentor-classes__stat-icon mentor-classes__stat-icon--success">
            <KeyRound size={22} />
          </div>
          <div className="mentor-classes__stat-info">
            <span className="mentor-classes__stat-value">{stats.activeCodes}</span>
            <span className="mentor-classes__stat-label">Active Join Codes</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Toolbar */}
      {classes.length > 0 && (
        <div className="mentor-classes__toolbar">
          <div className="mentor-classes__search-wrapper">
            <Search size={16} className="mentor-classes__search-icon" />
            <input
              type="text"
              className="mentor-classes__search-input"
              placeholder="Search by class name, subject, or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search classes"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} style={{ color: 'var(--color-text-muted)' }} />
            <select
              className="mentor-classes__filter-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              aria-label="Filter by subject"
            >
              {subjectList.map((sub) => (
                <option key={sub} value={sub}>
                  {sub === 'ALL' ? 'All Subjects' : sub}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content State: Loading, Error, Empty, or Grid */}
      {isLoading ? (
        <LoadingState message="Loading your classes..." />
      ) : error ? (
        <div className="card card--padding-lg" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-danger)' }}>{error}</p>
          <Button variant="secondary" onClick={loadClasses}>
            Retry
          </Button>
        </div>
      ) : classes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No classes created yet"
          description="Create your first class to generate a unique 6-character code and invite students to your section."
          action={
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsCreateOpen(true)}
            >
              Create Your First Class
            </Button>
          }
        />
      ) : filteredClasses.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching classes found"
          description={`No classes matched your filter "${searchQuery}". Clear your search query to see all classes.`}
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('ALL');
              }}
            >
              Clear Filters
            </Button>
          }
        />
      ) : (
        <div className="mentor-classes__grid">
          {filteredClasses.map((item) => (
            <ClassCard
              key={item.id}
              classItem={item}
              onRename={handleOpenRename}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* Modal 1: Create Class */}
      <CreateClassModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleClassCreated}
        mentorId={mentorId}
        mentorName={mentorName}
      />

      {/* Modal 2: Rename Class */}
      <Modal
        isOpen={Boolean(renameTarget)}
        onClose={() => {
          if (!isRenaming) setRenameTarget(null);
        }}
        title="Rename Class"
        footer={
          <div className="mentor-modal-footer">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setRenameTarget(null)}
              disabled={isRenaming}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmRename}
              loading={isRenaming}
            >
              Save Changes
            </Button>
          </div>
        }
        maxWidth="460px"
      >
        <form onSubmit={handleConfirmRename} className="mentor-modal-form">
          {renameError && (
            <div style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>
              {renameError}
            </div>
          )}

          <div className="mentor-modal-field">
            <label htmlFor="rename-input" className="mentor-modal-label">
              Class Name
            </label>
            <input
              id="rename-input"
              type="text"
              className="mentor-modal-input"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="mentor-modal-field">
            <label htmlFor="rename-subject" className="mentor-modal-label">
              Subject
            </label>
            <input
              id="rename-subject"
              type="text"
              className="mentor-modal-input"
              value={renameSubject}
              onChange={(e) => setRenameSubject(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Modal 3: Delete Class Confirmation */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        title="Delete Class?"
        footer={
          <div className="mentor-modal-footer">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmDelete}
              loading={isDeleting}
            >
              Delete Class
            </Button>
          </div>
        }
        maxWidth="460px"
      >
        <div className="mentor-modal-danger-box">
          <AlertTriangle size={24} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
          <div>
            <p style={{ margin: '0 0 var(--space-2) 0', fontWeight: 'bold' }}>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;?
            </p>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              This will remove the class and all enrolled student associations.
              Students will no longer have access to this classroom section.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Classes;
