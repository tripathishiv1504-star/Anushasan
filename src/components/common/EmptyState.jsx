import React from 'react';
import { Inbox } from 'lucide-react';
import './EmptyState.css';

/**
 * Common EmptyState component
 * @param {string} title
 * @param {string} description
 * @param {React.ReactNode} action
 */
export function EmptyState({
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  icon: Icon = Inbox,
  action,
  minHeight = '240px',
  className = '',
}) {
  const renderIcon = () => {
    if (!Icon) return <Inbox size={36} className="empty-state__icon" />;
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    if (typeof Icon === 'function' || typeof Icon === 'object') {
      const IconComponent = Icon;
      return <IconComponent size={36} className="empty-state__icon" />;
    }
    return <Inbox size={36} className="empty-state__icon" />;
  };

  return (
    <div className={`empty-state ${className}`} style={{ minHeight }}>
      <div className="empty-state__icon-wrapper">
        {renderIcon()}
      </div>
      <h4 className="empty-state__title">{title}</h4>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}

export default EmptyState;
