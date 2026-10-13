import React, { useState } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  Trash2,
  Calendar,
  User,
  HardDrive,
} from 'lucide-react';
import Card from './Card';
import Badge from './Badge';
import Button from './Button';
import Modal from './Modal';
import { formatDate } from '../../utils/dates';
import './ResourceCard.css';

/**
 * Format KB into human-readable size
 * @param {number} kb
 * @returns {string}
 */
export function formatFileSize(kb = 0) {
  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(1)} MB`;
  }
  return `${Math.round(kb)} KB`;
}

/**
 * Generate a valid downloadable PDF blob for testing downloads in prototype
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
<< /Length 180 >>
stream
BT
/F1 18 Tf
50 720 Td
(${safeTitle}) Tj
/F1 12 Tf
0 -30 Td
(Anushasan Smart Campus Discipline Platform - Verified Document) Tj
0 -20 Td
(File: ${fileName}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000498 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
587
%%EOF`;

  return new Blob([content], { type: 'application/pdf' });
}

/**
 * ResourceCard Component
 * Displays a study document card with metadata and Open / Download / Delete actions
 *
 * @param {Object} resource - Resource metadata
 * @param {Function} [onDelete] - Callback if file is deletable
 */
export function ResourceCard({ resource, onDelete }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Type badge color variant
  const typeVariant =
    resource.type === 'assignment'
      ? 'warning'
      : resource.type === 'pyq'
      ? 'accent'
      : 'info';

  const typeLabel =
    resource.type === 'assignment'
      ? 'Assignment'
      : resource.type === 'pyq'
      ? 'PYQ Paper'
      : 'Lecture Notes';

  // Handle Download Action
  const handleDownload = () => {
    const blob = createSamplePdfBlob(resource.title, resource.file_name);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resource.file_name || 'document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete personal resource "${resource.title}"?`)) {
      onDelete(resource.id);
    }
  };

  return (
    <>
      <Card className="resource-card" padding="md">
        <div className="resource-card__header">
          <div className="resource-card__type-badge-row">
            <div className="resource-card__file-icon">
              <FileText size={18} />
            </div>
            <Badge variant={typeVariant} size="sm">
              {typeLabel}
            </Badge>
          </div>

          {resource.is_personal && onDelete && (
            <button
              type="button"
              className="resource-card__delete-btn"
              onClick={handleDelete}
              aria-label={`Delete ${resource.title}`}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>

        <div className="resource-card__content">
          <h4 className="resource-card__title" title={resource.title}>
            {resource.title}
          </h4>

          <div className="resource-card__subject-tag">
            <span>{resource.subject}</span>
          </div>

          <div className="resource-card__meta-grid">
            <div className="resource-meta-item">
              <User size={13} />
              <span className="resource-meta-item__text">{resource.uploader_name || 'Campus'}</span>
            </div>
            <div className="resource-meta-item">
              <HardDrive size={13} />
              <span className="resource-meta-item__text">{formatFileSize(resource.file_size_kb)}</span>
            </div>
            <div className="resource-meta-item">
              <Calendar size={13} />
              <span className="resource-meta-item__text">{formatDate(resource.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="resource-card__actions">
          <Button
            variant="ghost"
            size="sm"
            icon={ExternalLink}
            onClick={() => setIsPreviewOpen(true)}
            className="resource-card__action-btn"
          >
            Open
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleDownload}
            className="resource-card__action-btn"
          >
            Download
          </Button>
        </div>
      </Card>

      {/* In-Modal PDF Preview */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={resource.title}
        maxWidth="600px"
        footer={
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
            <Button variant="primary" icon={Download} onClick={handleDownload}>
              Download PDF ({formatFileSize(resource.file_size_kb)})
            </Button>
          </div>
        }
      >
        <div className="resource-preview-content">
          <div className="resource-preview-badge-row">
            <Badge variant={typeVariant} size="sm">
              {typeLabel}
            </Badge>
            <span className="resource-preview-subject">{resource.subject}</span>
          </div>

          <div className="resource-preview-file-box">
            <div className="resource-preview-file-icon">
              <FileText size={42} />
            </div>
            <div className="resource-preview-file-info">
              <span className="resource-preview-filename">{resource.file_name}</span>
              <span className="resource-preview-filesize">
                {formatFileSize(resource.file_size_kb)} &bull; Uploaded by {resource.uploader_name} on {formatDate(resource.created_at)}
              </span>
            </div>
          </div>

          <div className="resource-preview-notice">
            <p>
              This study file is verified for student access on Anushasan. Click <strong>Download PDF</strong> below to download the local copy directly to your device.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ResourceCard;
