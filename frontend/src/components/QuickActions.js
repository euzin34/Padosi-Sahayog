import React from 'react';
import { Plus, HandHeart, MapPin } from 'lucide-react';
import './QuickActions.css';

const QuickActions = ({ onNavigate }) => {
  const actions = [
    {
      id: 'post',
      title: 'Post Request',
      subtitle: 'Ask for help',
      icon: Plus,
      bgColor: 'var(--primary-green-light)',
      iconColor: 'var(--primary-green)',
      onClick: () => onNavigate('post-request')
    },
    {
      id: 'offer',
      title: 'Offer Help',
      subtitle: 'Help others',
      icon: HandHeart,
      bgColor: 'var(--primary-blue-light)',
      iconColor: 'var(--primary-blue)',
      onClick: () => onNavigate('offer-help')
    },
    {
      id: 'nearby',
      title: 'Nearby',
      subtitle: 'View requests',
      icon: MapPin,
      bgColor: 'var(--primary-yellow-light)',
      iconColor: 'var(--primary-yellow)'
    }
  ];

  return (
    <div className="quick-actions">
      <h2 className="section-title">Quick Actions</h2>
      <div className="actions-grid">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              className="action-card"
              style={{ backgroundColor: action.bgColor }}
              onClick={action.onClick}
            >
              <div 
                className="action-icon"
                style={{ backgroundColor: action.iconColor }}
              >
                <Icon size={24} color="white" strokeWidth={2.5} />
              </div>
              <h3 className="action-title">{action.title}</h3>
              <p className="action-subtitle">{action.subtitle}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
