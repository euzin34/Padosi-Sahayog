import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import API from '../utils/api';
import { getCurrentLocation, formatDistance } from '../utils/geolocation';
import { useAuth } from '../contexts/AuthContext';
import './Map.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different task types
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><div style="transform: rotate(45deg); margin-top: 3px; margin-left: 6px; font-size: 12px;">📍</div></div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
};

const userIcon = L.divIcon({
  className: 'user-marker',
  html: `<div style="background-color: #4285f4; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Component to update map center
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

const Map = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([27.7172, 85.3240]); // Default: Kathmandu
  const [category, setCategory] = useState('');
  const [limit] = useState(50); // Show more tasks on map
  const [selectedTask, setSelectedTask] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const { user } = useAuth();
  const mapRef = useRef(null);

  useEffect(() => {
    fetchTasksForMap();
  }, [category, user]);

  const fetchTasksForMap = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      let location = { latitude: 27.7172, longitude: 85.3240 }; // Default to Kathmandu

      try {
        // Get user location
        if (user) {
          try {
            // Try to use stored location from user profile
            response = await API.getNearbyTasks(undefined, undefined, {
              page: 1,
              limit,
              category: category || null,
              unit: 'km'
            }, user);

            if (response.data.userLocation) {
              location = response.data.userLocation;
            }
          } catch (err) {
            console.warn('Could not use stored location, trying current location:', err.message);
            try {
              location = await getCurrentLocation();
              response = await API.getNearbyTasks(
                location.latitude,
                location.longitude,
                {
                  page: 1,
                  limit,
                  category: category || null,
                  unit: 'km'
                },
                user
              );
            } catch (locErr) {
              console.warn('Could not get current location, using Kathmandu:', locErr.message);
              // Use default Kathmandu location
              response = await API.getNearbyTasks(
                location.latitude,
                location.longitude,
                {
                  page: 1,
                  limit,
                  category: category || null,
                  unit: 'km'
                },
                user
              );
            }
          }
        } else {
          // Not authenticated - try to get current location
          try {
            location = await getCurrentLocation();
          } catch (locErr) {
            console.warn('Could not get current location, using Kathmandu:', locErr.message);
            // Keep default Kathmandu location
          }

          response = await API.getNearbyTasks(
            location.latitude,
            location.longitude,
            {
              page: 1,
              limit,
              category: category || null,
              unit: 'km'
            }
          );
        }

        setUserLocation(location);
        setMapCenter([location.latitude, location.longitude]);
        setTasks(response.data.tasks || []);
        setLoading(false);
      } catch (apiErr) {
        console.warn('API call failed, showing map with default location:', apiErr.message);
        // Even if API fails, show the map with default location
        setUserLocation(location);
        setMapCenter([location.latitude, location.longitude]);
        setTasks([]);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching tasks for map:', err);
      // Fallback to Kathmandu even on complete failure
      setUserLocation({ latitude: 27.7172, longitude: 85.3240 });
      setMapCenter([27.7172, 85.3240]);
      setTasks([]);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchTasksForMap();
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: '#6366f1',
      shopping: '#ec4899',
      delivery: '#f59e0b',
      help: '#10b981',
      other: '#8b5cf6'
    };
    return colors[category] || '#6366f1';
  };

  // Fetch route from OSRM API
  const fetchRoute = async (task) => {
    if (!userLocation) return;

    try {
      const start = `${userLocation.longitude},${userLocation.latitude}`;
      const end = `${task.location.longitude},${task.location.latitude}`;

      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`
      );

      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const routeData = data.routes[0];
        const coordinates = routeData.geometry.coordinates.map(coord => [coord[1], coord[0]]);

        setRoute(coordinates);
        setRouteInfo({
          distance: (routeData.distance / 1000).toFixed(2), // Convert to km
          duration: Math.round(routeData.duration / 60) // Convert to minutes
        });
        setSelectedTask(task);
      }
    } catch (err) {
      console.error('Error fetching route:', err);
    }
  };

  const clearRoute = () => {
    setRoute(null);
    setRouteInfo(null);
    setSelectedTask(null);
  };

  const handleTaskClick = (task) => {
    if (selectedTask && selectedTask.id === task.id) {
      clearRoute();
    } else {
      fetchRoute(task);
    }
  };

  if (loading) {
    return (
      <div className="map-page">
        <div className="map-loading">
          <div className="spinner"></div>
          <p>Loading map and nearby tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-page">
        <div className="map-error">
          <h3>⚠️ Error Loading Map</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="map-page">
      <div className="map-controls">
        <div className="map-header">
          <h2>🗺️ Task Map</h2>
          <p className="task-count">{tasks.length} tasks nearby</p>
        </div>

        <div className="map-filters">
          <select value={category} onChange={handleCategoryChange} className="category-select">
            <option value="">All Categories</option>
            <option value="general">General</option>
            <option value="shopping">Shopping</option>
            <option value="delivery">Delivery</option>
            <option value="help">Help</option>
            <option value="other">Other</option>
          </select>
          <button onClick={handleRefresh} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>

        {userLocation && (
          <div className="location-info">
            📍 Your location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            {userLocation.source === 'profile' && ' (from profile)'}
          </div>
        )}
      </div>

      <div className="map-container">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <MapUpdater center={mapCenter} zoom={13} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User location marker */}
          {userLocation && (
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={userIcon}
            >
              <Popup>
                <div className="popup-content">
                  <h3>📍 Your Location</h3>
                  <p>You are here!</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route polyline */}
          {route && (
            <Polyline
              positions={route}
              color="#3B82F6"
              weight={4}
              opacity={0.7}
            />
          )}

          {/* Task markers */}
          {tasks.map((task) => (
            <Marker
              key={task.id}
              position={[task.location.latitude, task.location.longitude]}
              icon={createCustomIcon(getCategoryColor(task.category))}
              eventHandlers={{
                click: () => handleTaskClick(task)
              }}
            >
              <Popup>
                <div className="popup-content">
                  <h3>{task.title}</h3>
                  <p className="popup-description">{task.description}</p>
                  <div className="popup-details">
                    <span className="popup-category">
                      🏷️ {task.category}
                    </span>
                    <span className="popup-distance">
                      📏 {formatDistance(task.distance)}
                    </span>
                  </div>
                  <p className="popup-location">📍 {task.placeName}</p>
                  {task.createdBy && (
                    <p className="popup-author">👤 By: {task.createdBy.displayName}</p>
                  )}

                  {/* Route info */}
                  {selectedTask && selectedTask.id === task.id && routeInfo && (
                    <div className="route-info-popup">
                      <hr style={{ margin: '0.75rem 0', border: 'none', borderTop: '1px solid #E5E7EB' }} />
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#3B82F6' }}>
                        🚗 Route Information
                      </h4>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.8125rem', color: '#6B7280' }}>
                        <strong>Distance:</strong> {routeInfo.distance} km
                      </p>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.8125rem', color: '#6B7280' }}>
                        <strong>Est. Time:</strong> {routeInfo.duration} min
                      </p>
                      <button
                        onClick={clearRoute}
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.375rem 0.75rem',
                          background: '#EF4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        Clear Route
                      </button>
                    </div>
                  )}

                  {/* Show route button if no route is active */}
                  {(!selectedTask || selectedTask.id !== task.id) && userLocation && (
                    <button
                      onClick={() => handleTaskClick(task)}
                      style={{
                        marginTop: '0.75rem',
                        padding: '0.5rem 1rem',
                        background: '#3B82F6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        width: '100%',
                        fontWeight: '600'
                      }}
                    >
                      🗺️ Show Route
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {tasks.length === 0 && (
        <div className="no-tasks-overlay">
          <p>No tasks found in this area</p>
        </div>
      )}
    </div>
  );
};

export default Map;
