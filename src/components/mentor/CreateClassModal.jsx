import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, BookOpen } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { mentorService } from '../../services/mentorService';
import './CreateClassModal.css';

const COMMON_SUBJECTS = [
  'Computer Science',
  'Data Structures & Algorithms',
  'Operating Systems',
  'Artificial Intelligence',
  'Database Management',
  'Computer Networks',
  'Software Engineering',
  'Mathematics',
  'Other',
];

/**
 * Modal to create a new class section for mentors
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {(newClass: Object) => void} props.onSuccess
 * @param {string} props.mentorId
 * @param {string} props.mentorName
 */
export function CreateClassModal({
  isOpen,
  onClose,
  onSuccess,
  mentorId,
  mentorName,
}) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [customSubject, setCustomSubject] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load a new unique 6-character code whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setName('');
      setSubject('Computer Science');
      setCustomSubject('');
      setErrorMsg('');
      handleGenerateCode();
    }
  }, [isOpen]);

  const handleGenerateCode = async () => {
    try {
      setIsGeneratingCode(true);
      const code = await mentorService.generateJoinCode();
      setJoinCode(code);
    } catch (err) {
      console.error('Failed to generate code:', err);
      setJoinCode('CS' + Math.random().toString(36).substring(2, 6).toUpperCase());
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = name.trim();
    const finalSubject = subject === 'Other' ? customSubject.trim() : subject;

    if (!trimmedName || trimmedName.length < 3) {
      setErrorMsg('Class name must be at least 3 characters long.');
      return;
    }

    if (!finalSubject) {
      setErrorMsg('Please specify the subject/domain.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newClass = await mentorService.createClass({
        mentorId: mentorId || 'user_mentor_1',
        mentorName: mentorName || 'Prof. Rajesh Verma',
        name: trimmedName,
        subject: finalSubject,
        customCode: joinCode,
      });

      onSuccess(newClass);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create class. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="create-class-modal__footer">
      <Button
        type="button"
        variant="ghost"
        onClick={onClose}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="primary"
        onClick={handleSubmit}
        loading={isSubmitting}
      >
        Create Class
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Class"
      footer={footer}
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit} className="create-class-modal__form">
        {errorMsg && (
          <div className="create-class-modal__error" role="alert">
            {errorMsg}
          </div>
        )}

        {/* Class Name */}
        <div className="create-class-modal__field">
          <label htmlFor="class-name-input" className="create-class-modal__label">
            Class Name <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input
            id="class-name-input"
            type="text"
            className="create-class-modal__input"
            placeholder="e.g. Operating Systems Section A"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <span className="create-class-modal__hint">
            Give your classroom a clear title students recognize.
          </span>
        </div>

        {/* Subject */}
        <div className="create-class-modal__field">
          <label htmlFor="class-subject-select" className="create-class-modal__label">
            Subject / Domain <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <select
            id="class-subject-select"
            className="create-class-modal__input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            {COMMON_SUBJECTS.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          {subject === 'Other' && (
            <input
              type="text"
              className="create-class-modal__input"
              style={{ marginTop: 'var(--space-2)' }}
              placeholder="Enter custom subject name"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              required
            />
          )}
        </div>

        {/* Unique Join Code Preview */}
        <div className="create-class-modal__field">
          <label className="create-class-modal__label">
            Generated Student Join Code
          </label>
          <div className="create-class-modal__code-preview">
            <div className="create-class-modal__code-display">
              <span className="create-class-modal__code-tag">Unique Code</span>
              <span className="create-class-modal__code-value">
                {isGeneratingCode ? 'GENERATING...' : joinCode}
              </span>
            </div>

            <button
              type="button"
              className="create-class-modal__regen-btn"
              onClick={handleGenerateCode}
              disabled={isGeneratingCode || isSubmitting}
              title="Generate a different code"
            >
              <RefreshCw size={13} className={isGeneratingCode ? 'spin' : ''} />
              <span>Regenerate</span>
            </button>
          </div>
          <span className="create-class-modal__hint">
            Share this 6-character code with students to join your class section.
          </span>
        </div>
      </form>
    </Modal>
  );
}

export default CreateClassModal;
