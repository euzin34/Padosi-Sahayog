import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import QuickActions from '../components/QuickActions';
import ActivityCard from '../components/ActivityCard';
import { taskAPI, chatAPI } from '../services/api';
import './Home.css';

const Home = ({ onNavigate }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Use default location if geolocation fails
          setUserLocation({
            latitude: 27.7172,
            longitude: 85.3240 // Kathmandu coordinates as default
          });
        }
      );
    } else {
      // Use default location if geolocation not supported
      setUserLocation({
        latitude: 27.7172,
        longitude: 85.3240
      });
    }
  }, []);

  // Fetch tasks when location is available
  useEffect(() => {
    if (userLocation) {
      fetchActivities();
    }
  }, [userLocation]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await taskAPI.getAll({ status: 'active', limit: 20 });
      
      if (response.success && response.data.tasks) {
        // Transform backend data to match ActivityCard format
        const transformedActivities = response.data.tasks.map(task => ({
          id: task.id,
          userName: 'User', // Will be replaced with actual user data
          userAvatar: task.type === 'request' ? '🙋' : '🤝',
          priority: task.urgency || 'medium',
          category: task.category.charAt(0).toUpperCase() + task.category.slice(1),
          categoryIcon: getCategoryIcon(task.category),
          type: task.type === 'request' ? 'Request' : 'Offer',
          description: task.description,
          distance: '0.5 km', // Will calculate based on user location
          time: getTimeAgo(task.createdAt),
          actionLabel: task.type === 'request' ? 'Help' : 'Accept',
          actionColor: task.type === 'request' ? '#7FD957' : '#5DB4F5',
          createdBy: task.createdBy,
          acceptedBy: task.acceptedBy,
          status: task.status
        }));
        
        setActivities(transformedActivities);
      }
    } catch (err) {
      console.error('Fetch activities error:', err);
      setError('Failed to load activities');
      // Use mock data as fallback
      setActivities(getMockActivities());
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTask = async (activity) => {
    // Check if this is mock data
    if (activity.id && activity.id.toString().startsWith('mock-')) {
      alert('This is demo data. Please post a real request to test the accept functionality.');
      return;
    }

    try {
      // Accept the task
      const response = await taskAPI.accept(activity.id);
      
      if (response.success) {
        // Create a chat conversation with the task creator
        try {
          await chatAPI.createConversation(activity.createdBy, activity.id);
        } catch (chatError) {
          console.error('Chat creation error:', chatError);
          // Continue even if chat creation fails
        }
        
        // Navigate to chat
        alert('Task accepted! You can now chat with the requester.');
        onNavigate('chat');
        
        // Refresh activities
        fetchActivities();
      }
    } catch (err) {
      console.error('Accept task error:', err);
      if (err.message && err.message.includes('not found')) {
        alert('This task no longer exists or has been removed.');
      } else {
        alert(err.message || 'Failed to accept task. Please try again.');
      }
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      grocery: '🛒',
      medicine: '💊',
      education: '📚',
      transport: '🚗',
      repair: '🔧',
      other: '✨'
    };
    return icons[category] || '✨';
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getMockActivities = () => [
    {
      id: 'mock-1',
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
      id: 'mock-2',
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
          <button className="see-all-button" onClick={() => onNavigate('map')}>See all</button>
        </div>
        
        {loading ? (
          <div className="loading-message">Loading activities...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="activity-list">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <ActivityCard 
                  key={activity.id} 
                  activity={activity}
                  onAccept={handleAcceptTask}
                />
              ))
            ) : (
              <div className="no-activities">No activities found nearby</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
