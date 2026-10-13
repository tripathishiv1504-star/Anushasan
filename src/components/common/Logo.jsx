import React from 'react';
import { Compass } from 'lucide-react';
import './Logo.css';

/**
 * Common Logo component
 * @param {'sm' | 'md' | 'lg'} size
 * @param {boolean} withTagline
 */
export function Logo({
  size = 'md',
  withTagline = false,
  className = '',
}) {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 32 : 24;

  return (
    <div className={`logo logo--${size} ${className}`}>
      <div className="logo__mark" aria-hidden="true">
        <Compass size={iconSize} className="logo__icon" />
      </div>
      <div className="logo__text-wrapper">
        <span className="logo__name">Anushasan</span>
        {withTagline && (
          <span className="logo__tagline">Consistency, measured. Growth, guided.</span>
        )}
      </div>
    </div>
  );
}

export default Logo;
