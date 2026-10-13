import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import { formatFileSize } from './ResourceCard';
import './FileUpload.css';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit per spec

/**
 * FileUpload Component
 * Drag & drop and file picker accepting PDF files up to 10 MB, with metadata form
 * Supports both standalone single-upload modal mode (for students) and dropzoneOnly multi-file mode (for mentors).
 *
 * @param {Object} props
 * @param {Function} [props.onUpload] - Callback ({ title, subject, type, fileName, fileSizeKb, file })
 * @param {Array<string>} [props.subjects] - List of available subjects
 * @param {boolean} [props.isUploading=false]
 * @param {Function} [props.onCancel]
 * @param {boolean} [props.multiple=false]
 * @param {boolean} [props.dropzoneOnly=false]
 * @param {Array<File>} [props.files=[]]
 * @param {Function} [props.onFilesChange]
 */
export function FileUpload({
  onUpload,
  subjects = [],
  isUploading = false,
  onCancel,
  multiple = false,
  dropzoneOnly = false,
  files = [],
  onFilesChange,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const [form, setForm] = useState({
    title: '',
    subject: subjects[0] || 'General',
    type: 'notes',
  });
  const [formErrors, setFormErrors] = useState({});

  const fileInputRef = useRef(null);

  // Validate an individual file
  const validateFile = (file) => {
    if (!file) return 'No file selected';
    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return `"${file.name}" is not a PDF. Only PDF documents (.pdf) are allowed.`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `"${file.name}" exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`;
    }
    return null;
  };

  // Drag handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (incomingFiles) => {
    setFileError('');

    if (dropzoneOnly && multiple) {
      const valid = [];
      let err = '';
      for (const f of incomingFiles) {
        const error = validateFile(f);
        if (error) {
          err = error;
          break;
        } else {
          valid.push(f);
        }
      }

      if (err) {
        setFileError(err);
      } else if (valid.length > 0) {
        const combined = [...files, ...valid];
        if (onFilesChange) onFilesChange(combined);
      }
      return;
    }

    // Single file mode
    const first = incomingFiles[0];
    const err = validateFile(first);
    if (err) {
      setFileError(err);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(first);
    const cleanTitle = first.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
    setForm((prev) => ({
      ...prev,
      title: prev.title.trim() ? prev.title : cleanTitle,
    }));
  };

  const handleRemoveSingle = () => {
    setSelectedFile(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveMultiple = (indexToRemove) => {
    const updated = files.filter((_, idx) => idx !== indexToRemove);
    if (onFilesChange) onFilesChange(updated);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // If dropzoneOnly mode is enabled (for mentor upload page)
  if (dropzoneOnly) {
    return (
      <div className="file-upload-dropzone-only">
        <div
          className={`file-upload__dropzone ${
            dragActive ? 'file-upload__dropzone--active' : ''
          } ${fileError ? 'file-upload__dropzone--error' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple={multiple}
            onChange={handleFileChange}
            className="file-upload__native-input"
            aria-label="Upload PDF files"
          />

          <div className="file-upload__dropzone-icon">
            <UploadCloud size={32} />
          </div>

          <div className="file-upload__dropzone-text">
            <span className="file-upload__dropzone-main">
              {multiple
                ? 'Click to choose PDF(s) or drag and drop multiple files'
                : 'Click to choose PDF or drag and drop'}
            </span>
            <span className="file-upload__dropzone-sub">
              PDF documents only &bull; Up to 10 MB per file &bull; Multiple files allowed
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            {multiple ? 'Browse Files' : 'Browse PDF'}
          </Button>
        </div>

        {fileError && (
          <div className="file-upload__error-msg" style={{ marginTop: 'var(--space-2)' }}>
            <AlertCircle size={15} />
            <span>{fileError}</span>
          </div>
        )}

        {/* Selected files list */}
        {files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Selected Files ({files.length}):
            </span>
            {files.map((file, idx) => (
              <div key={`${file.name}-${idx}`} className="file-upload__selected-box" style={{ margin: 0 }}>
                <div className="file-upload__selected-icon">
                  <FileText size={20} />
                </div>
                <div className="file-upload__selected-info">
                  <span className="file-upload__selected-name">{file.name}</span>
                  <span className="file-upload__selected-size">
                    {formatFileSize(Math.round(file.size / 1024))} &bull; Ready to upload
                  </span>
                </div>
                <button
                  type="button"
                  className="file-upload__remove-btn"
                  onClick={() => handleRemoveMultiple(idx)}
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Standard modal form mode (for student library)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!selectedFile) errs.file = 'Please select a PDF document to upload';
    if (!form.title.trim()) errs.title = 'Document title is required';
    if (!form.subject) errs.subject = 'Subject is required';

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setFormErrors({});
    const fileSizeKb = Math.round(selectedFile.size / 1024);

    if (onUpload) {
      await onUpload({
        title: form.title,
        subject: form.subject,
        type: form.type,
        fileName: selectedFile.name,
        fileSizeKb,
        file: selectedFile,
      });
    }
  };

  const subjectOptions = subjects.map((s) => ({ value: s, label: s }));
  const typeOptions = [
    { value: 'notes', label: 'Lecture Notes' },
    { value: 'assignment', label: 'Assignment / Worksheet' },
    { value: 'pyq', label: 'Previous Year Question (PYQ)' },
  ];

  return (
    <form onSubmit={handleSubmit} className="file-upload-form">
      {/* Dropzone */}
      {!selectedFile ? (
        <div
          className={`file-upload__dropzone ${
            dragActive ? 'file-upload__dropzone--active' : ''
          } ${fileError ? 'file-upload__dropzone--error' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="file-upload__native-input"
            aria-label="Upload PDF file"
          />

          <div className="file-upload__dropzone-icon">
            <UploadCloud size={36} />
          </div>

          <div className="file-upload__dropzone-text">
            <span className="file-upload__dropzone-main">
              Click to choose PDF or drag and drop
            </span>
            <span className="file-upload__dropzone-sub">
              PDF files only &bull; Up to 10 MB maximum
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Browse PDF
          </Button>
        </div>
      ) : (
        <div className="file-upload__selected-box">
          <div className="file-upload__selected-icon">
            <FileText size={24} />
          </div>
          <div className="file-upload__selected-info">
            <span className="file-upload__selected-name">{selectedFile.name}</span>
            <span className="file-upload__selected-size">
              {formatFileSize(Math.round(selectedFile.size / 1024))} &bull; Ready to save
            </span>
          </div>
          <button
            type="button"
            className="file-upload__remove-btn"
            onClick={handleRemoveSingle}
            aria-label="Remove selected file"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error feedback */}
      {fileError && (
        <div className="file-upload__error-msg">
          <AlertCircle size={15} />
          <span>{fileError}</span>
        </div>
      )}
      {formErrors.file && !fileError && (
        <div className="file-upload__error-msg">
          <AlertCircle size={15} />
          <span>{formErrors.file}</span>
        </div>
      )}

      {/* Form Fields */}
      <div className="file-upload__fields">
        <Input
          label="Document Title"
          placeholder="e.g. Unit 4 Concurrency Control Notes"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          error={formErrors.title}
          required
        />

        <div className="file-upload__fields-row">
          <Select
            label="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            options={subjectOptions}
            error={formErrors.subject}
            required
          />

          <Select
            label="Document Category"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={typeOptions}
            required
          />
        </div>
      </div>

      <div className="file-upload__footer">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} type="button">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          icon={CheckCircle}
          isLoading={isUploading}
          disabled={!selectedFile || isUploading}
        >
          Upload Document
        </Button>
      </div>
    </form>
  );
}

export default FileUpload;
