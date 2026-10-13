import React, { useState } from 'react';
import { AlertCircle, Send, CheckCircle2 } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import './GrievanceForm.css';

const GRIEVANCE_CATEGORIES = [
  'Attendance discrepancy',
  'Course material & syllabus',
  'Evaluation & grading',
  'Classroom / Lab infrastructure',
  'Exam scheduling',
  'Other academic issue',
];

/**
 * GrievanceForm Modal
 * Form to raise a new student grievance with validation
 */
export function GrievanceForm({
  isOpen,
  onClose,
  enrolledClasses = [],
  onSubmit,
}) {
  const [classId, setClassId] = useState(
    enrolledClasses.length > 0 ? enrolledClasses[0].id : 'class_os_301'
  );
  const [category, setCategory] = useState(GRIEVANCE_CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setClassId(enrolledClasses.length > 0 ? enrolledClasses[0].id : 'class_os_301');
    setCategory(GRIEVANCE_CATEGORIES[0]);
    setTitle('');
    setDescription('');
    setErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!classId) {
      errs.classId = 'Please select a course or class.';
    }
    if (!category) {
      errs.category = 'Please select a grievance category.';
    }
    if (!title.trim()) {
      errs.title = 'Title is required.';
    } else if (title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters.';
    }
    if (!description.trim()) {
      errs.description = 'Description is required.';
    } else if (description.trim().length < 10) {
      errs.description = 'Please provide at least 10 characters describing the issue.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});
      await onSubmit({
        classId,
        category,
        title: title.trim(),
        description: description.trim(),
      });
      resetForm();
      onClose();
    } catch (err) {
      setErrors({ form: err.message || 'Failed to submit grievance. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Raise a Grievance"
      size="md"
    >
      <form onSubmit={handleSubmit} className="grievance-form">
        <p className="grievance-form-lead">
          Submit an official academic issue or correction request directly to your assigned mentor.
        </p>

        {errors.form && (
          <div className="grievance-form-error" role="alert">
            <AlertCircle size={16} />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Course / Class selector */}
        <div className="grievance-form-group">
          <label htmlFor="grievance-class" className="grievance-form-label">
            Enrolled Course / Class *
          </label>
          <Select
            id="grievance-class"
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              if (errors.classId) setErrors((prev) => ({ ...prev, classId: null }));
            }}
          >
            {enrolledClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.join_code ? `[${cls.join_code}] ` : ''}
                {cls.name}
              </option>
            ))}
            {enrolledClasses.length === 0 && (
              <>
                <option value="class_os_301">[CS301A] Operating Systems & Architecture</option>
                <option value="class_dsa_201">[DS201B] Data Structures & Algorithms</option>
                <option value="class_ml_401">[AI401C] Machine Learning Foundations</option>
              </>
            )}
          </Select>
          {errors.classId && <span className="grievance-field-error">{errors.classId}</span>}
        </div>

        {/* Category selector */}
        <div className="grievance-form-group">
          <label htmlFor="grievance-category" className="grievance-form-label">
            Category *
          </label>
          <Select
            id="grievance-category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              if (errors.category) setErrors((prev) => ({ ...prev, category: null }));
            }}
          >
            {GRIEVANCE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
          {errors.category && <span className="grievance-field-error">{errors.category}</span>}
        </div>

        {/* Title */}
        <Input
          id="grievance-title"
          label="Grievance Title *"
          placeholder="Brief summary of the issue (e.g. Lab attendance discrepancy on 8th Oct)"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
          }}
          error={errors.title}
          helperText="Be concise and specific to help your mentor identify the concern."
        />

        {/* Detailed description */}
        <div className="grievance-form-group">
          <label htmlFor="grievance-desc" className="grievance-form-label">
            Detailed Description *
          </label>
          <textarea
            id="grievance-desc"
            className={`grievance-textarea ${errors.description ? 'grievance-textarea--error' : ''}`}
            rows={4}
            placeholder="Explain what happened, relevant dates, lecture slots, or steps needed to resolve..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((prev) => ({ ...prev, description: null }));
            }}
          />
          {errors.description && (
            <span className="grievance-field-error">{errors.description}</span>
          )}
        </div>

        {/* Modal Actions */}
        <div className="grievance-form-actions">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              resetForm();
              onClose();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={Send}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting Grievance...' : 'Submit Grievance'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default GrievanceForm;
