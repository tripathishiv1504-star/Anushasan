import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Copy,
  Check,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import './ClassCard.css';

/**
 * ClassCard for Mentor Classes Grid
 * Displays class details, student count, unique join code with copy button,
 * dropdown menu for rename/delete, and link to class dashboard.
 *
 * @param {Object} props
 * @param {Object} props.classItem
 * @param {(classItem: Object) => void} props.onRename
 * @param {(classItem: Object) => void} props.onDelete
 */
export function ClassCard({ classItem, onRename, onDelete }) {
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleCopyCode = async (e) => {
    e.stopPropagation();
    const code = classItem.join_code;
    if (!code) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy class code:', err);
    }
  };

  const handleCardClick = () => {
    navigate(`/mentor/classes/${classItem.id}`);
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  const handleRenameClick = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onRename(classItem);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onDelete(classItem);
  };

  return (
    <div className="mentor-class-card" onClick={handleCardClick} role="article">
      <div>
        {/* Header with subject badge and action menu */}
        <div className="mentor-class-card__header">
          <span className="mentor-class-card__subject-badge">
            {classItem.subject || 'General'}
          </span>

          <div className="mentor-class-card__menu-wrapper" ref={menuRef}>
            <button
              type="button"
              className="mentor-class-card__menu-btn"
              onClick={handleMenuToggle}
              aria-label={`Options for ${classItem.name}`}
              aria-expanded={isMenuOpen}
            >
              <MoreVertical size={18} />
            </button>

            {isMenuOpen && (
              <div className="mentor-class-card__dropdown">
                <button
                  type="button"
                  className="mentor-class-card__dropdown-item"
                  onClick={handleRenameClick}
                >
                  <Edit2 size={14} />
                  <span>Rename</span>
                </button>
                <button
                  type="button"
                  className="mentor-class-card__dropdown-item mentor-class-card__dropdown-item--danger"
                  onClick={handleDeleteClick}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title and student count */}
        <div className="mentor-class-card__content">
          <h3 className="mentor-class-card__title" title={classItem.name}>
            {classItem.name}
          </h3>

          <div className="mentor-class-card__meta">
            <span className="mentor-class-card__meta-item">
              <Users size={15} />
              <span>
                {classItem.student_count === 1
                  ? '1 enrolled student'
                  : `${classItem.student_count || 0} enrolled students`}
              </span>
            </span>
          </div>
        </div>

        {/* Join Code Callout */}
        <div
          className="mentor-class-card__code-box"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mentor-class-card__code-info">
            <span className="mentor-class-card__code-label">Join Code</span>
            <span className="mentor-class-card__code-value">
              {classItem.join_code}
            </span>
          </div>

          <button
            type="button"
            className={`mentor-class-card__copy-btn ${
              isCopied ? 'mentor-class-card__copy-btn--copied' : ''
            }`}
            onClick={handleCopyCode}
            aria-label={`Copy join code ${classItem.join_code}`}
          >
            {isCopied ? (
              <>
                <Check size={14} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mentor-class-card__footer">
        <button
          type="button"
          className="mentor-class-card__view-btn"
          onClick={handleCardClick}
        >
          <span>Open Dashboard</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

export default ClassCard;
