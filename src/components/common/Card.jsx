import React from 'react';
import './Card.css';

/**
 * Common Card container
 * @param {'none' | 'sm' | 'md' | 'lg'} padding
 * @param {boolean} interactive
 */
export function Card({
  children,
  padding = 'md',
  interactive = false,
  className = '',
  onClick,
  ...props
}) {
  return (
    <div
      className={`card card--pad-${padding} ${interactive ? 'card--interactive' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
