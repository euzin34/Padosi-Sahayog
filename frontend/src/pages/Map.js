import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  List, 
  MapPin, 
  ShoppingCart, 
  Car, 
  Pill, 
  Book, 
  Wrench,
  Navigation,
  Sparkles
} from 'lucide-react';
import { taskAPI, chatAPI } from '../services/api';
import './Map.css';

const Map = ({ onNavigate }) => {
  const [filter, setFilter] = useState('all'); // all, low, medium, high
  const [viewMode, setViewMode] = useState('map'); // map, list
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNearbyTasks();
  }, []);

  const fetchNearbyTasks = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getAll({ status: 'active', limit: 20 });
      
      if (response.success && response.data.tasks) {
        const transformedTasks = response.data.tasks.map((task, index) => ({
          id: task.id,
          type: task.type || 'request',
          category: task.category,
          title: task.title || `${task.category} ${task.type}`,
          description: task.description,
          distance: '0.5 km', // Calculate based on location
          urgency: task.urgency || 'medium',
          icon: getCategoryIcon(task.category),
          color: getUrgencyColor(task.urgency || 'medium'),
          coordinates: getRandomCoordinates(index),
          createdBy: task.createdBy,
          acceptedBy: task.acceptedBy,
          status: task.status
        }));
        setRequests(transformedTasks);
      }
    } catch (err) {
      console.error('Fetch tasks error:', err);
      // Use mock data as fallback
      setRequests(getMockRequests());
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      grocery: <ShoppingCart size={20} />,
      medicine: <Pill size={20} />,
      education: <Book size={20} />,
      transport: <Car size={20} />,
      repair: <Wrench size={20} />,
      other: <Sparkles size={20} />
    };
    return icons[category] || <Sparkles size={20} />;
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: '#10B981',
      medium: '#FCD34D',
      high: '#EF4444'
    };
    return colors[urgency] || '#FCD34D';
  };

  const getRandomCoordinates = (index) => {
    const positions = [
      { top: '35%', left: '30%' },
      { top: '25%', left: '60%' },
      { top: '55%', left: '45%' },
      { top: '50%', left: '70%' },
      { top: '45%', left: '25%' },
      { top: '30%', left: '50%' },
      { top: '60%', left: '35%' }
    ];
    return positions[index % positions.length];
  };

  const getMockRequests = () => [
    {
      id: 'mock-1',
      type: 'request',
      category: 'grocery',
      title: 'Grocery request',
      distance: '0.3 km',
      urgency: 'medium',
      icon: <ShoppingCart size={20} />,
      color: '#FCD34D',
      coordinates: { top: '35%', left: '30%' }
    },
    {
      id: 'mock-2',
      type: 'offer',
      category: 'transport',
      title: 'Transport offer',
      distance: '0.5 km',
      urgency: 'high',
      icon: <Car size={20} />,
      color: '#EF4444',
      coordinates: { top: '25%', left: '60%' }
    }
  ];

  const handleAcceptTask = async (item) => {
    if (item.status === 'accepted') {
      alert('This task has already been accepted');
      return;
    }

    try {
      const response = await taskAPI.accept(item.id);
      
      if (response.success) {
        // Create chat conversation
        try {
          await chatAPI.createConversation(item.createdBy, item.id);
        } catch (chatError) {
          console.error('Chat creation error:', chatError);
        }
        
        alert('Task accepted! You can now chat with the requester.');
        onNavigate('chat');
        fetchNearbyTasks(); // Refresh the list
      }
    } catch (err) {
      console.error('Accept error:', err);
      alert(err.message || 'Failed to accept task. Please try again.');
    }
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.urgency === filter);

  return (
    <div className="map-page">
      <div className="map-header">
        <h1>Nearby</h1>
        <div className="header-actions">
            <button className="icon-btn" onClick={() => {}}>
                <Filter size={20} />
            </button>
            <button className="icon-btn" onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}>
                <List size={20} />
            </button>
        </div>
      </div>

      {/* Map Viz Layer */}
      <div className="map-container">
        <div className="map-grid">
            {/* Draw grid lines */}
            <div className="grid-lines horizontal"></div>
            <div className="grid-lines vertical"></div>
            
            {/* Center User Pin */}
            <div className="user-pin">
                <div className="user-dot"></div>
                <div className="user-pulse"></div>
            </div>

            {/* Request Pins */}
            {filteredRequests.map(item => (
                <div 
                    key={item.id} 
                    className="map-marker"
                    style={{ top: item.coordinates.top, left: item.coordinates.left }}
                >
                    <div className="marker-icon" style={{ backgroundColor: item.color === '#FCD34D' ? '#FEF3C7' : item.color === '#EF4444' ? '#FEE2E2' : '#D1FAE5', border: `2px solid ${item.color}` }}>
                        {item.icon}
                    </div>
                    <div className="marker-pin">
                        <MapPin size={16} fill="#4B5563" stroke="none" />
                    </div>
                </div>
            ))}

            <button className="location-fab">
                <Navigation size={20} color="white" />
            </button>
        </div>
      </div>

      {/* Urgency Legend / Filter Toggles */}
      <div className="urgency-legend">
        <div 
            className={`legend-item ${filter === 'low' ? 'active' : ''}`}
            onClick={() => setFilter(filter === 'low' ? 'all' : 'low')}
        >
            <span className="dot low"></span> Low
        </div>
        <div 
            className={`legend-item ${filter === 'medium' ? 'active' : ''}`}
            onClick={() => setFilter(filter === 'medium' ? 'all' : 'medium')}
        >
            <span className="dot medium"></span> Medium
        </div>
        <div 
            className={`legend-item ${filter === 'high' ? 'active' : ''}`}
            onClick={() => setFilter(filter === 'high' ? 'all' : 'high')}
        >
            <span className="dot high"></span> High
        </div>
      </div>

      {/* List Section */}
      <div className="nearby-list-container">
        <h3>{filteredRequests.length} requests nearby</h3>
        {loading ? (
          <div className="loading-message">Loading nearby tasks...</div>
        ) : (
          <div className="requests-list">
              {filteredRequests.map(item => (
                  <div key={item.id} className="request-card">
                      <div className="request-icon-wrapper" style={{ backgroundColor: item.color === '#FCD34D' ? '#FEF3C7' : item.color === '#EF4444' ? '#FEE2E2' : '#D1FAE5' }}>
                          {item.icon}
                      </div>
                      <div className="request-info">
                          <h4>{item.title}</h4>
                          <div className="request-meta">
                              <MapPin size={12} />
                              <span>{item.distance}</span>
                          </div>
                      </div>
                      <button 
                          className={`action-btn ${item.type === 'offer' ? 'offer-btn' : 'request-btn'}`}
                          onClick={() => handleAcceptTask(item)}
                          disabled={item.status === 'accepted'}
                          style={{ opacity: item.status === 'accepted' ? 0.5 : 1 }}
                      >
                          {item.status === 'accepted' ? 'Accepted' : (item.type === 'offer' ? 'Accept' : 'Help')}
                      </button>
                  </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;
