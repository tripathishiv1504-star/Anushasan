import React, { useState, useEffect, useMemo } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mentorService } from '../../services/mentorService';
import { resourceService } from '../../services/resourceService';
import FileUpload from '../../components/common/FileUpload';
import { formatFileSize } from '../../components/common/ResourceCard';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/dates';
import './UploadResources.css';

/**
 * Generate a valid downloadable PDF blob for testing in prototype
 */
function createSamplePdfBlob(title, fileName) {
  const safeTitle = (title || 'Anushasan Document').replace(/[()]/g, '');
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 120 >>
stream
BT
/F1 16 Tf
50 720 Td
(${safeTitle}) Tj
0 -30 Td
/F1 11 Tf
(Uploaded via Anushasan Platform - Campus Resource Portal) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000117 00000 n
0000000228 00000 n
0000000399 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
468
%%EOF`;

  return new Blob([content], { type: 'application/pdf' });
}

export function UploadResources() {
  const { user } = useAuth();
  const mentorId = user?.id || 'user_mentor_1';
  const mentorName = user?.full_name || 'Prof. Rajesh Verma';

  // Classes & uploaded resources
  const [classes, setClasses] = useState([]);
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [selectedClassId, setSelectedClassId] = useState('');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('notes'); // 'notes' | 'assignment' | 'pyq'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState('');

  // Table filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [tableClassFilter, setTableClassFilter] = useState('ALL');
  const [tableTypeFilter, setTableTypeFilter] = useState('ALL');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load classes and existing resources
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [mentorClasses, mentorRes] = await Promise.all([
        mentorService.getMentorClasses(mentorId),
        resourceService.getMentorResources(mentorId),
      ]);
      setClasses(mentorClasses);
      setResources(mentorRes);

      if (mentorClasses.length > 0 && !selectedClassId) {
        setSelectedClassId(mentorClasses[0].id);
        setSubject(mentorClasses[0].subject || 'Computer Science');
      }
    } catch (err) {
      console.error('Failed to load mentor resources data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [mentorId]);

  // Handle class selection change
  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    const matched = classes.find((c) => c.id === classId);
    if (matched && matched.subject) {
      setSubject(matched.subject);
    }
  };

  // Submit Upload Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedClassId) {
      setFormError('Please select a target class section.');
      return;
    }
    if (!subject.trim()) {
      setFormError('Subject is required.');
      return;
    }
    if (!title.trim() || title.trim().length < 3) {
      setFormError('Document title must be at least 3 characters long.');
      return;
    }
    if (files.length === 0) {
      setFormError('Please select at least one PDF file to upload.');
      return;
    }

    const matchedClass = classes.find((c) => c.id === selectedClassId);

    try {
      setIsUploading(true);
      const newCreated = await resourceService.uploadClassResources({
        mentorId,
        mentorName,
        classId: selectedClassId,
        className: matchedClass ? matchedClass.name : 'Class Section',
        subject: subject.trim(),
        type,
        title: title.trim(),
        description: description.trim(),
        dueDate: type === 'assignment' ? dueDate : null,
        files,
      });

      setResources((prev) => [...newCreated, ...prev]);

      // Reset form fields
      setTitle('');
      setDescription('');
      setDueDate('');
      setFiles([]);

      showToast(
        newCreated.length === 1
          ? `Resource "${newCreated[0].title}" uploaded successfully to ${matchedClass?.name}!`
          : `${newCreated.length} resources uploaded successfully to ${matchedClass?.name}!`
      );
    } catch (err) {
      console.error('Upload failed:', err);
      setFormError(err.message || 'Failed to upload resources. Please check file format and size.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Download File
  const handleDownload = (res) => {
    try {
      const blob = createSamplePdfBlob(res.title, res.file_name);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.file_name || `${res.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  // Handle Delete Resource Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      await resourceService.deleteClassResource(deleteTarget.id, mentorId);
      setResources((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      const deletedTitle = deleteTarget.title;
      setDeleteTarget(null);
      showToast(`Resource "${deletedTitle}" deleted.`);
    } catch (err) {
      console.error('Failed to delete resource:', err);
      showToast('Failed to delete resource. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered resources for table
  const filteredResources = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return resources.filter((r) => {
      const matchesSearch =
        !q ||
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.file_name && r.file_name.toLowerCase().includes(q)) ||
        (r.subject && r.subject.toLowerCase().includes(q));

      const matchesClass =
        tableClassFilter === 'ALL' ||
        r.class_id === tableClassFilter ||
        (tableClassFilter === 'class_os_301' && r.class_id === 'class_cs301') ||
        (tableClassFilter === 'class_dsa_201' && r.class_id === 'class_ds201');

      const matchesType =
        tableTypeFilter === 'ALL' || r.type === tableTypeFilter;

      return matchesSearch && matchesClass && matchesType;
    });
  }, [resources, searchQuery, tableClassFilter, tableTypeFilter]);

  if (isLoading) {
    return <LoadingState message="Loading resource management..." />;
  }

  return (
    <div className="mentor-upload">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="mentor-classes__toast mentor-classes__toast--success" role="status">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mentor-upload__header">
        <h1>Upload Class Resources</h1>
        <p className="mentor-upload__subtitle">
          Distribute lecture notes, assignments, and past year questions to enrolled students in your classroom sections.
        </p>
      </div>

      {/* Section 1: Upload Form */}
      <div className="mentor-upload__card">
        <h2 className="mentor-upload__card-title">
          <Upload size={20} style={{ color: '#4F46E5' }} />
          <span>Upload New Class Material</span>
        </h2>

        {formError && (
          <div className="mentor-upload__error-box" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="mentor-upload__form">
          <div className="mentor-upload__grid-row">
            {/* Target Class */}
            <div className="mentor-upload__field">
              <label htmlFor="target-class-select" className="mentor-upload__label">
                Target Class Section <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <select
                id="target-class-select"
                className="mentor-upload__select"
                value={selectedClassId}
                onChange={handleClassChange}
                required
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.join_code})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="mentor-upload__field">
              <label htmlFor="resource-subject-input" className="mentor-upload__label">
                Subject / Topic Domain <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                id="resource-subject-input"
                type="text"
                className="mentor-upload__input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Operating Systems"
                required
              />
            </div>

            {/* Type */}
            <div className="mentor-upload__field">
              <label htmlFor="resource-type-select" className="mentor-upload__label">
                Resource Category <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <select
                id="resource-type-select"
                className="mentor-upload__select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="notes">Lecture Notes</option>
                <option value="assignment">Assignment / Worksheet</option>
                <option value="pyq">Previous Year Questions (PYQ)</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div className="mentor-upload__field">
            <label htmlFor="resource-title-input" className="mentor-upload__label">
              Document Title <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              id="resource-title-input"
              type="text"
              className="mentor-upload__input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unit 4 CPU Scheduling & Concurrency Control"
              required
            />
          </div>

          {/* Description & Due Date Row */}
          <div className="mentor-upload__grid-row">
            <div className="mentor-upload__field" style={{ flex: 2 }}>
              <label htmlFor="resource-desc-input" className="mentor-upload__label">
                Description / Reading Instructions (Optional)
              </label>
              <textarea
                id="resource-desc-input"
                className="mentor-upload__textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes or references for students..."
              />
            </div>

            {type === 'assignment' && (
              <div className="mentor-upload__field" style={{ flex: 1 }}>
                <label htmlFor="resource-due-date" className="mentor-upload__label">
                  Submission Due Date
                </label>
                <input
                  id="resource-due-date"
                  type="date"
                  className="mentor-upload__input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
                <span className="mentor-upload__hint">
                  Highlights deadline for enrolled students.
                </span>
              </div>
            )}
          </div>

          {/* Reusable FileUpload Dropzone (PDF only, max 10MB, multiple files) */}
          <div className="mentor-upload__field">
            <label className="mentor-upload__label">
              Upload PDF Documents <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <FileUpload
              dropzoneOnly={true}
              multiple={true}
              files={files}
              onFilesChange={setFiles}
            />
          </div>

          {/* Actions */}
          <div className="mentor-upload__actions">
            {files.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setFiles([])}
                disabled={isUploading}
              >
                Clear Files
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              icon={Upload}
              loading={isUploading}
              disabled={files.length === 0 || isUploading}
            >
              Upload to Class ({files.length} {files.length === 1 ? 'file' : 'files'})
            </Button>
          </div>
        </form>
      </div>

      {/* Section 2: Table of Mentor's Uploaded Resources */}
      <div className="mentor-upload__table-card">
        <div className="mentor-upload__table-header">
          <div className="mentor-upload__table-title-group">
            <h3>Uploaded Course Materials ({resources.length})</h3>
            <p className="mentor-upload__table-subtitle">
              Materials appear instantly for students enrolled in that class.
            </p>
          </div>

          {/* Filters */}
          <div className="mentor-upload__filters">
            <div className="mentor-upload__search">
              <Search size={14} className="mentor-upload__search-icon" />
              <input
                type="text"
                className="mentor-upload__search-input"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search uploaded resources"
              />
            </div>

            <select
              className="mentor-upload__filter-select"
              value={tableClassFilter}
              onChange={(e) => setTableClassFilter(e.target.value)}
              aria-label="Filter by class"
            >
              <option value="ALL">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="mentor-upload__filter-select"
              value={tableTypeFilter}
              onChange={(e) => setTableTypeFilter(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="ALL">All Types</option>
              <option value="notes">Notes</option>
              <option value="assignment">Assignments</option>
              <option value="pyq">PYQs</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {resources.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No resources uploaded yet"
            description="Use the upload form above to publish your first lecture notes or assignment for your students."
          />
        ) : filteredResources.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching documents found"
            description="Try adjusting your search terms or filter selections."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setTableClassFilter('ALL');
                  setTableTypeFilter('ALL');
                }}
              >
                Clear Filters
              </Button>
            }
          />
        ) : (
          <div className="mentor-upload__table-wrapper">
            <table className="mentor-upload__table">
              <thead>
                <tr>
                  <th style={{ width: '35%' }}>Document & File</th>
                  <th style={{ width: '20%' }}>Class / Subject</th>
                  <th style={{ width: '15%' }}>Category</th>
                  <th style={{ width: '15%' }}>Size & Date</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((res) => {
                  const matchedClass = classes.find(
                    (c) =>
                      c.id === res.class_id ||
                      (c.id === 'class_os_301' && res.class_id === 'class_cs301') ||
                      (c.id === 'class_dsa_201' && res.class_id === 'class_ds201')
                  );

                  return (
                    <tr key={res.id}>
                      {/* Document & File */}
                      <td>
                        <div className="mentor-upload__doc-cell">
                          <FileText size={20} className="mentor-upload__doc-icon" />
                          <div>
                            <div className="mentor-upload__doc-title">{res.title}</div>
                            <div className="mentor-upload__doc-file">{res.file_name}</div>
                            {res.due_date && (
                              <div style={{ fontSize: '11px', color: 'var(--color-warning)', marginTop: '2px' }}>
                                Due: {formatDate(res.due_date)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Class / Subject */}
                      <td>
                        <div style={{ fontWeight: 500 }}>
                          {matchedClass ? matchedClass.name : res.class_name || 'Class Section'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          {res.subject}
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td>
                        <span className={`mentor-upload__type-badge mentor-upload__type-badge--${res.type}`}>
                          {res.type === 'notes'
                            ? 'Lecture Notes'
                            : res.type === 'assignment'
                            ? 'Assignment'
                            : 'PYQ'}
                        </span>
                      </td>

                      {/* Size & Date */}
                      <td>
                        <div style={{ fontWeight: 500 }}>{formatFileSize(res.file_size_kb)}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          {formatDate(res.created_at)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="mentor-upload__table-actions">
                          <button
                            type="button"
                            className="mentor-upload__icon-btn"
                            onClick={() => handleDownload(res)}
                            title="Download PDF"
                            aria-label={`Download ${res.title}`}
                          >
                            <Download size={15} />
                          </button>

                          <button
                            type="button"
                            className="mentor-upload__icon-btn mentor-upload__icon-btn--danger"
                            onClick={() => setDeleteTarget(res)}
                            title="Delete Resource"
                            aria-label={`Delete ${res.title}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        title="Delete Resource?"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
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
              Delete Resource
            </Button>
          </div>
        }
        maxWidth="460px"
      >
        <div style={{ display: 'flex', gap: '12px', padding: 'var(--space-2)' }}>
          <AlertCircle size={24} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
          <div>
            <p style={{ margin: '0 0 var(--space-2) 0', fontWeight: 'bold' }}>
              Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;?
            </p>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              This document will be removed immediately for all students enrolled in this class.
              This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default UploadResources;
