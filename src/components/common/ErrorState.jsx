import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import './ErrorState.css';

/**
 * Common ErrorState component
 * @param {string} title
 * @param {string} message
 * @param {() => void} onRetry
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this section.',
  onRetry,
  minHeight = '240px',
  className = '',
}) {
  return (
    <div className={`error-state ${className}`} style={{ minHeight }} role="alert">
      <div className="error-state__icon-wrapper">
        <AlertTriangle size={32} className="error-state__icon" />
      </div>
      <h4 className="error-state__title">{title}</h4>
      {message && <p className="error-state__message">{message}</p>}
      {onRetry && (
        <div className="error-state__action">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

export default ErrorState;
