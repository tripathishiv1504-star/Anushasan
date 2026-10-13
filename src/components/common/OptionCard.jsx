import React from 'react';
import { ArrowRight } from 'lucide-react';
import './OptionCard.css';

/**
 * Reusable OptionCard component (used in Role Selection and Student Mode selection)
 * Fully keyboard accessible (acts as an interactive card button).
 * @param {string} title
 * @param {string} description
 * @param {React.ElementType} icon
 * @param {'student' | 'mentor' | 'admin' | 'teal' | 'indigo'} variant
 * @param {() => void} onClick
 */
export function OptionCard({
  title,
  description,
  icon: Icon,
  variant = 'student',
  onClick,
  badgeText,
  className = '',
  disabled = false,
}) {
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      className={`option-card option-card--${variant} ${disabled ? 'option-card--disabled' : ''} ${className}`}
      aria-disabled={disabled}
    >
      <div className="option-card__header">
        {Icon && (
          <div className="option-card__icon-wrap">
            {React.isValidElement(Icon) ? (
              Icon
            ) : typeof Icon === 'function' || typeof Icon === 'object' ? (
              <Icon size={32} className="option-card__icon" />
            ) : null}
          </div>
        )}
        {badgeText && <span className="option-card__badge">{badgeText}</span>}
      </div>

      <div className="option-card__body">
        <h3 className="option-card__title">{title}</h3>
        <p className="option-card__description">{description}</p>
      </div>

      <div className="option-card__footer">
        <span className="option-card__action-text">Continue</span>
        <ArrowRight size={18} className="option-card__arrow" />
      </div>
    </div>
  );
}

export default OptionCard;
