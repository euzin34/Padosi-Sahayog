import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ShoppingCart, 
  Pill, 
  BookOpen, 
  Car, 
  Wrench, 
  Sparkles,
  MapPin,
  Send,
  Loader
} from 'lucide-react';
import { taskAPI } from '../services/api';
import './PostRequest.css';

const PostRequest = ({ onBack, initialType = 'request' }) => {
  const [requestType, setRequestType] = useState(initialType); // 'request' or 'offer'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [urgency, setUrgency] = useState('medium');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const categories = [
    { id: 'grocery', label: 'Grocery', icon: ShoppingCart },
    { id: 'medicine', label: 'Medicine', icon: Pill },
    { id: 'education', label: 'Education', icon: BookOpen },
    { id: 'transport', label: 'Transport', icon: Car },
    { id: 'repair', label: 'Repair', icon: Wrench },
    { id: 'other', label: 'Other', icon: Sparkles }
  ];

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setCoordinates(coords);
        setLocation(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Unable to get your location. Please enter manually.');
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = async () => {
    // Validate form
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    if (!coordinates) {
      setError('Please provide your location');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const taskData = {
        title: `${requestType === 'request' ? 'Request' : 'Offer'}: ${categories.find(c => c.id === selectedCategory)?.label}`,
        description: description.trim(),
        category: selectedCategory,
        location: coordinates,
        urgency: urgency,
        type: requestType
      };

      const response = await taskAPI.create(taskData);

      if (response.success) {
        // Show success message
        alert(`${requestType === 'request' ? 'Request' : 'Offer'} posted successfully!`);
        // Go back to home
        onBack();
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-request-page">
      <header className="page-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          <ChevronLeft size={24} />
        </button>
        <h1>Post a {requestType === 'request' ? 'Request' : 'Offer'}</h1>
      </header>

      <div className="scrollable-content">
        <div className="type-toggle-container">
          <div className="type-toggle">
            <button 
              className={`toggle-btn ${requestType === 'request' ? 'active' : ''}`}
              onClick={() => setRequestType('request')}
            >
              <span className="emoji">🙋‍♀️</span> Request Help
            </button>
            <button 
              className={`toggle-btn ${requestType === 'offer' ? 'active' : ''}`}
              onClick={() => setRequestType('offer')}
            >
              <span className="emoji">🤝</span> Offer Help
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <section className="form-section">
          <h2>Category</h2>
          <div className="categories-grid">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  className={`category-card ${selectedCategory === cat.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <div className="category-icon-wrapper">
                    <Icon size={24} strokeWidth={2} />
                  </div>
                  <span className="category-label">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="form-section">
          <h2>Description</h2>
          <textarea 
            className="description-input" 
            placeholder={`Describe what you ${requestType === 'request' ? 'need help with' : 'can help with'}...`}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </section>

        <section className="form-section">
          <h2>Location</h2>
          <div className="location-input-group">
            <MapPin size={20} className="input-icon" />
            <input 
              type="text" 
              className="location-input" 
              placeholder="Enter your location or auto-detect"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              readOnly
            />
          </div>
          <button 
            className="current-location-btn"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
          >
            {isGettingLocation ? (
              <>
                <Loader size={16} className="spinner" />
                Getting Location...
              </>
            ) : (
              <>
                <MapPin size={16} />
                Use Current Location
              </>
            )}
          </button>
        </section>

        <section className="form-section">
          <h2>Urgency Level</h2>
          <div className="urgency-selector">
            {['Low', 'Medium', 'High'].map((level) => (
              <button
                key={level}
                className={`urgency-btn ${urgency === level.toLowerCase() ? 'active' : ''}`}
                onClick={() => setUrgency(level.toLowerCase())}
              >
                {level}
              </button>
            ))}
          </div>
        </section>

        <button 
          className="submit-btn"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader size={20} className="spinner" />
              Posting...
            </>
          ) : (
            <>
              <Send size={20} />
              Post {requestType === 'request' ? 'Request' : 'Offer'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PostRequest;
