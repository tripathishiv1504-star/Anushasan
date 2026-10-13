import React, { useState, useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Input.css';

/**
 * Common Input component
 * @param {string} label
 * @param {string} error
 * @param {string} hint
 * @param {string} type
 */
export function Input({
  label,
  error,
  hint,
  type = 'text',
  id: customId,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const generatedId = useId();
  const id = customId || generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`input-group ${error ? 'input-group--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="input-group__label">
          {label}
          {required && <span className="input-group__required" aria-hidden="true"> *</span>}
        </label>
      )}

      <div className="input-group__wrapper">
        <input
          id={id}
          name={name}
          type={effectiveType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className="input-group__control"
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className="input-group__toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error ? (
        <p id={errorId} className="input-group__error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="input-group__hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default Input;
