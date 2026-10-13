import React from 'react';
import './Badge.css';

/**
 * Common Badge component
 * @param {'success' | 'warning' | 'danger' | 'info' | 'neutral'} variant
 * @param {'sm' | 'md'} size
 */
export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  icon: Icon,
  className = '',
  ...props
}) {
  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    if (typeof Icon === 'function' || typeof Icon === 'object') {
      const IconComponent = Icon;
      return <IconComponent className="badge__icon" size={size === 'sm' ? 12 : 14} />;
    }
    return null;
  };

  return (
    <span className={`badge badge--${variant} badge--${size} ${className}`} {...props}>
      {renderIcon()}
      <span className="badge__text">{children}</span>
    </span>
  );
}

export default Badge;
