import React, { useState } from 'react';
import {
  Settings,
  Star,
  Heart,
  Link as LinkIcon,
  ChevronRight,
  Award,
  LogOut,
  X,
  MapPin,
  Phone,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import API from '../utils/api';
import { getCurrentLocation } from '../utils/geolocation';
import './Profile.css';

const Profile = () => {
  const { user, userProfile, setUserProfile } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: userProfile?.displayName || user?.displayName || '',
    phoneNumber: userProfile?.phoneNumber || '',
    latitude: userProfile?.location?.latitude || '',
    longitude: userProfile?.location?.longitude || ''
  });
  const [saving, setSaving] = useState(false);

  // Use real user data or fallback to mock
  const userData = {
    name: userProfile?.displayName || user?.displayName || 'User',
    email: user?.email || 'user@example.com',
    location: userProfile?.location
      ? `${userProfile.location.latitude.toFixed(4)}, ${userProfile.location.longitude.toFixed(4)}`
      : 'Location not set',
    avatar: '👨‍💼',
    rating: 4.8,
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
      time: 'Yesterday'
    },
    {
      id: 2,
      icon: '💊',
      title: 'Medicine pickup',
      person: 'Rahul Verma',
      time: '2 days ago'
    },
    {
      id: 3,
      icon: '🎓',
      title: 'Tutoring session',
      person: "Anjali's son",
      time: '3 days ago'
    }
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
      alert("Failed to logout. Please try again.");
    }
  };

  const handleEditProfile = () => {
    setEditForm({
      displayName: userProfile?.displayName || user?.displayName || '',
      phoneNumber: userProfile?.phoneNumber || '',
      latitude: userProfile?.location?.latitude || '',
      longitude: userProfile?.location?.longitude || ''
    });
    setShowEditModal(true);
  };

  const handleGetCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setEditForm(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude
      }));
    } catch (error) {
      alert('Failed to get current location. Please enable location services.');
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      const profileData = {
        displayName: editForm.displayName,
        phoneNumber: editForm.phoneNumber || null
      };

      if (editForm.latitude && editForm.longitude) {
        profileData.location = {
          latitude: parseFloat(editForm.latitude),
          longitude: parseFloat(editForm.longitude)
        };
      }

      await API.updateProfile(user, profileData);

      if (setUserProfile) {
        setUserProfile(prev => ({
          ...prev,
          ...profileData
        }));
      }

      setShowEditModal(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page-container">
      {/* Profile Header Card */}
      <div className="profile-header-card">
        <div className="profile-avatar-container">
          <div className="profile-avatar">
            <span className="avatar-emoji">{userData.avatar}</span>
          </div>
        </div>

        <h2 className="profile-name">{userData.name}</h2>
        <p className="profile-location">{userData.location}</p>

        <div className="profile-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={18}
              fill={star <= Math.floor(userData.rating) ? '#FFD700' : 'none'}
              color={star <= Math.floor(userData.rating) ? '#FFD700' : '#E2E8F0'}
            />
          ))}
          <span className="rating-value">({userData.rating})</span>
        </div>

        <div className="profile-actions">
          <button className="edit-profile-btn" onClick={handleEditProfile}>
            <Settings size={16} />
            Edit Profile
          </button>
          <button className="logout-btn" onClick={handleLogout} style={{ marginLeft: '10px', backgroundColor: '#ffe5e5', color: '#d32f2f', border: 'none', padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontWeight: '500' }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards - Removed Points */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#7FD957' }}>
            <LinkIcon size={24} />
          </div>
          <div className="stat-value">{userData.helped}</div>
          <div className="stat-label">Helped</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#FF6B6B' }}>
            <Heart size={24} />
          </div>
          <div className="stat-value">{userData.requests}</div>
          <div className="stat-label">Requests</div>
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
              <ChevronRight size={20} className="activity-arrow" />
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>
                  <User size={18} />
                  Display Name
                </label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label>
                  <Phone size={18} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label>
                  <MapPin size={18} />
                  Location
                </label>
                <div className="location-inputs">
                  <input
                    type="number"
                    step="any"
                    value={editForm.latitude}
                    onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value })}
                    placeholder="Latitude"
                  />
                  <input
                    type="number"
                    step="any"
                    value={editForm.longitude}
                    onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value })}
                    placeholder="Longitude"
                  />
                </div>
                <button
                  type="button"
                  className="get-location-btn"
                  onClick={handleGetCurrentLocation}
                >
                  📍 Use Current Location
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowEditModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
