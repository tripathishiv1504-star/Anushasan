import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import './Select.css';

/**
 * Common Select component
 * @param {string} label
 * @param {string} error
 * @param {string} hint
 * @param {Array<{value: string, label: string}>} options
 */
export function Select({
  label,
  error,
  hint,
  id: customId,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const generatedId = useId();
  const id = customId || generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={`select-group ${error ? 'select-group--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="select-group__label">
          {label}
          {required && <span className="select-group__required" aria-hidden="true"> *</span>}
        </label>
      )}

      <div className="select-group__wrapper">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className="select-group__control"
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="select-group__arrow" size={18} />
      </div>

      {error ? (
        <p id={errorId} className="select-group__error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="select-group__hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default Select;
