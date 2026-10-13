import React from 'react';
import { Loader2 } from 'lucide-react';
import './LoadingState.css';

/**
 * Common LoadingState component
 * @param {string} message
 */
export function LoadingState({
  message = 'Loading data, please wait...',
  minHeight = '200px',
  className = '',
}) {
  return (
    <div
      className={`loading-state ${className}`}
      style={{ minHeight }}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="loading-state__spinner" size={32} />
      <p className="loading-state__message">{message}</p>
    </div>
  );
}

export default LoadingState;
