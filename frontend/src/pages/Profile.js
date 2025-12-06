import React from 'react';
import { 
  Settings, 
  Star, 
  Heart, 
  Link as LinkIcon, 
  ChevronRight,
  Award
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
  // Mock user data
  const user = {
    name: 'Amit Singh',
    location: 'Block A, Sector 15',
    avatar: '👨‍💼',
    rating: 4.8,
    points: 156,
    helped: 24,
    requests: 12
  };

  const achievements = [
    { id: 1, icon: '🌟', title: 'First Helper', unlocked: true },
    { id: 2, icon: '🏆', title: 'Top 10', unlocked: true },
    { id: 3, icon: '💊', title: 'Medicine Hero', unlocked: true },
    { id: 4, icon: '⭐', title: 'Super Star', unlocked: false }
  ];

  const activityHistory = [
    {
      id: 1,
      icon: '🛒',
      title: 'Delivered groceries',
      person: 'Priya Sharma',
      time: 'Yesterday',
      points: '+10'
    },
    {
      id: 2,
      icon: '💊',
      title: 'Medicine pickup',
      person: 'Rahul Verma',
      time: '2 days ago',
      points: null
    },
    {
      id: 3,
      icon: '🎓',
      title: 'Tutoring session',
      person: "Anjali's son",
      time: '3 days ago',
      points: '+15'
    }
  ];

  return (
    <div className="profile-page-container">
      {/* Profile Header Card */}
      <div className="profile-header-card">
        <div className="profile-avatar-container">
          <div className="profile-avatar">
            <span className="avatar-emoji">{user.avatar}</span>
          </div>
          <div className="points-badge">
            <Star size={14} fill="#FFD700" color="#FFD700" />
            {user.points}
          </div>
        </div>

        <h2 className="profile-name">{user.name}</h2>
        <p className="profile-location">{user.location}</p>

        <div className="profile-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={18}
              fill={star <= Math.floor(user.rating) ? '#FFD700' : 'none'}
              color={star <= Math.floor(user.rating) ? '#FFD700' : '#E2E8F0'}
            />
          ))}
          <span className="rating-value">({user.rating})</span>
        </div>

        <button className="edit-profile-btn">
          <Settings size={16} />
          Edit Profile
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#7FD957' }}>
            <LinkIcon size={24} />
          </div>
          <div className="stat-value">{user.helped}</div>
          <div className="stat-label">Helped</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#FF6B6B' }}>
            <Heart size={24} />
          </div>
          <div className="stat-value">{user.requests}</div>
          <div className="stat-label">Requests</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#FFD700' }}>
            <Star size={24} />
          </div>
          <div className="stat-value">{user.points}</div>
          <div className="stat-label">Points</div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="profile-section">
        <div className="section-header">
          <div className="section-title">
            <Award size={20} color="#FFD700" />
            <h3>Achievements</h3>
          </div>
          <button className="view-all-btn">View all</button>
        </div>

        <div className="achievements-grid">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`achievement-card ${!achievement.unlocked ? 'locked' : ''}`}
            >
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-title">{achievement.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity History Section */}
      <div className="profile-section">
        <div className="section-header">
          <h3>Activity History</h3>
        </div>

        <div className="activity-list">
          {activityHistory.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon-wrapper">
                <span className="activity-emoji">{activity.icon}</span>
              </div>
              <div className="activity-details">
                <h4 className="activity-title">{activity.title}</h4>
                <p className="activity-meta">
                  {activity.person} • {activity.time}
                </p>
              </div>
              {activity.points && (
                <div className="activity-points">{activity.points}</div>
              )}
              <ChevronRight size={20} className="activity-arrow" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
