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
  Send
} from 'lucide-react';
import './PostRequest.css';

const PostRequest = ({ onBack, initialType = 'request' }) => {
  const [requestType, setRequestType] = useState(initialType); // 'request' or 'offer'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [urgency, setUrgency] = useState('medium');

  const categories = [
    { id: 'grocery', label: 'Grocery', icon: ShoppingCart },
    { id: 'medicine', label: 'Medicine', icon: Pill },
    { id: 'education', label: 'Education', icon: BookOpen },
    { id: 'transport', label: 'Transport', icon: Car },
    { id: 'repair', label: 'Repair', icon: Wrench },
    { id: 'other', label: 'Other', icon: Sparkles }
  ];

  return (
    <div className="post-request-page">
      <header className="page-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          <ChevronLeft size={24} />
        </button>
        <h1>Post a Request</h1>
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
            placeholder="Describe what you need help with..."
            rows={4}
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
            />
          </div>
          <button className="current-location-btn">
            <MapPin size={16} />
            Use Current Location
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

        <button className="submit-btn">
          <Send size={20} />
          Post Request
        </button>
      </div>
    </div>
  );
};

export default PostRequest;
