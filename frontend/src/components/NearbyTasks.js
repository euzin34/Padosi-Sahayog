import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { getCurrentLocation, formatDistance } from '../utils/geolocation';
import { useAuth } from '../contexts/AuthContext';
import './NearbyTasks.css';

const NearbyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [category, setCategory] = useState('');
    const [limit] = useState(10);
    const { user } = useAuth(); // Get authenticated user

    useEffect(() => {
        fetchNearbyTasks();
    }, [page, category, user]);

    const fetchNearbyTasks = async () => {
        try {
            setLoading(true);
            setError(null);

            let response;

            // If user is authenticated, try to use their stored location
            if (user) {
                try {
                    // Call API without coordinates - backend will use user's profile location
                    response = await API.getNearbyTasks(undefined, undefined, {
                        page,
                        limit,
                        category: category || null,
                        unit: 'km'
                    }, user);

                    // Set location from response
                    if (response.data.userLocation) {
                        setUserLocation(response.data.userLocation);
                    }
                } catch (err) {
                    console.warn('Could not use stored location, falling back to manual:', err.message);
                    // Fall back to manual location if stored location fails
                    const location = await getCurrentLocation();
                    response = await API.getNearbyTasks(
                        location.latitude,
                        location.longitude,
                        {
                            page,
                            limit,
                            category: category || null,
                            unit: 'km'
                        },
                        user
                    );
                    setUserLocation(location);
                }
            } else {
                // Not authenticated - get current location manually
                const location = await getCurrentLocation();
                setUserLocation(location);

                response = await API.getNearbyTasks(
                    location.latitude,
                    location.longitude,
                    {
                        page,
                        limit,
                        category: category || null,
                        unit: 'km'
                    }
                );
            }

            setTasks(response.data.tasks);
            setTotalPages(response.data.pagination.totalPages);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching nearby tasks:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        setPage(1);
        fetchNearbyTasks();
    };

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        setPage(1);
    };

    if (loading && !tasks.length) {
        return (
            <div className="nearby-tasks-container">
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Finding nearby tasks...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="nearby-tasks-container">
                <div className="error">
                    <h3>Error</h3>
                    <p>{error}</p>
                    <button onClick={handleRefresh}>Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="nearby-tasks-container">
            <div className="nearby-tasks-header">
                <h2>Nearby Tasks</h2>
                {userLocation && (
                    <p className="user-location">
                        📍 Your location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                        {userLocation.source === 'profile' && ' (from your profile)'}
                    </p>
                )}
            </div>

            <div className="filters">
                <select value={category} onChange={handleCategoryChange}>
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

            {tasks.length === 0 ? (
                <div className="no-tasks">
                    <p>No nearby tasks found</p>
                </div>
            ) : (
                <>
                    <div className="tasks-list">
                        {tasks.map((task) => (
                            <div key={task.id} className="task-card">
                                <div className="task-header">
                                    <h3>{task.title}</h3>
                                    <span className="distance-badge">
                                        {formatDistance(task.distance)}
                                    </span>
                                </div>
                                <p className="task-description">{task.description}</p>
                                <div className="task-footer">
                                    <span className="location">📍 {task.placeName}</span>
                                    <span className="category">{task.category}</span>
                                </div>
                                <div className="task-coordinates">
                                    <small>
                                        Lat: {task.location.latitude.toFixed(4)},
                                        Lon: {task.location.longitude.toFixed(4)}
                                    </small>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </button>
                            <span>Page {page} of {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default NearbyTasks;
