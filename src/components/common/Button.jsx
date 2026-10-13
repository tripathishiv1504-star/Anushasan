import React from 'react';
import { Loader2 } from 'lucide-react';
import './Button.css';

/**
 * Common Button component
 * @param {'primary' | 'secondary' | 'ghost' | 'danger'} variant
 * @param {'sm' | 'md' | 'lg'} size
 * @param {boolean} isLoading
 * @param {boolean} disabled
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  icon: Icon,
  onClick,
  ...props
}) {
  const isBusy = isLoading || loading;
  const isDisabled = disabled || isBusy;

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    if (typeof Icon === 'function' || typeof Icon === 'object') {
      const IconComponent = Icon;
      return <IconComponent className="btn__icon" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />;
    }
    return null;
  };

  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${className}`}
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={isBusy}
      {...props}
    >
      {isBusy ? (
        <Loader2 className="btn__spinner" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : (
        renderIcon()
      )}
      {children && <span className="btn__text">{children}</span>}
    </button>
  );
}

export default Button;
