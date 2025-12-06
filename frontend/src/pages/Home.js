import React from 'react';
import SearchBar from '../components/SearchBar';
import QuickActions from '../components/QuickActions';
import ActivityCard from '../components/ActivityCard';
import './Home.css';

const Home = ({ onNavigate }) => {
  // Mock data for activities
  const activities = [
    {
      userName: 'Priya Sharma',
      userAvatar: '👩',
      priority: 'medium',
      category: 'Grocery',
      categoryIcon: '🛒',
      type: 'Request',
      description: 'Need someone to pick up groceries from the local market. Will share the list.',
      distance: '0.8 km',
      time: '5 min ago',
      actionLabel: 'Help',
      actionColor: '#7FD957'
    },
    {
      userName: 'Suresh Kumar',
      userAvatar: '👨',
      priority: 'low',
      category: 'Education',
      categoryIcon: '📚',
      type: 'Offer',
      description: 'Retired teacher offering free tutoring for students (Class 5-10) in Math and Science.',
      distance: '1.2 km',
      time: '1 hr ago',
      actionLabel: 'Accept',
      actionColor: '#5DB4F5'
    },
    {
      userName: 'Meera Joshi',
      userAvatar: '👩',
      priority: 'medium',
      category: 'Repair',
      categoryIcon: '🔧',
      type: 'Request',
      description: 'Looking for someone who can help fix a leaky faucet. Will pay for the service.',
      distance: '0.4 km',
      time: '2 hrs ago',
      actionLabel: 'Help',
      actionColor: '#7FD957'
    }
  ];

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1 className="greeting">
          Hello, Neighbor! <span className="wave-emoji">👋</span>
        </h1>
        <p className="tagline">Let's help each other today</p>
      </div>

      <div className="search-section">
        <SearchBar />
      </div>

      <QuickActions onNavigate={onNavigate} />

      <div className="activity-section">
        <div className="section-header">
          <h2 className="section-title">Nearby Activity</h2>
          <button className="see-all-button">See all</button>
        </div>
        <div className="activity-list">
          {activities.map((activity, index) => (
            <ActivityCard key={index} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
