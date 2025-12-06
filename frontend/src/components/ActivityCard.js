import React from 'react';
import { MapPin, Clock, ChevronRight } from 'lucide-react';
import './ActivityCard.css';

const ActivityCard = ({ activity }) => {
  const {
    userName,
    userAvatar,
    priority,
    category,
    categoryIcon,
    type,
    description,
    distance,
    time,
    actionLabel,
    actionColor
  } = activity;

  return (
    <div className="activity-card">
      <div className="activity-header">
        <div className="user-info">
          <div className="user-avatar">{userAvatar}</div>
          <div className="user-details">
            <div className="user-name-row">
              <h3 className="user-name">{userName}</h3>
              {priority && (
                <span className={`priority-badge priority-${priority}`}>
                  {priority}
                </span>
              )}
            </div>
            <div className="category-info">
              <span className="category-icon">{categoryIcon}</span>
              <span className="category-name">{category}</span>
              <span className="type-separator">•</span>
              <span className="activity-type">{type}</span>
            </div>
          </div>
        </div>
      </div>

      <p className="activity-description">{description}</p>

      <div className="activity-footer">
        <div className="activity-meta">
          <div className="meta-item">
            <MapPin size={14} />
            <span>{distance}</span>
          </div>
          <div className="meta-item">
            <Clock size={14} />
            <span>{time}</span>
          </div>
        </div>
        <button 
          className="action-button"
          style={{ backgroundColor: actionColor }}
        >
          {actionLabel}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ActivityCard;
