import React from 'react';
import { Bell, Settings } from 'lucide-react';
import logo from '../Logo.png';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-logo">
          <img src={logo} alt="Padoshi Sahayog" className="logo-image" />
          <div className="logo-text">
            <h1>Padoshi</h1>
            <p>Sahayog</p>
          </div>
        </div>
        <div className="navbar-actions">
          <button className="icon-button" aria-label="Notifications">
            <Bell size={20} />
          </button>
          <button className="icon-button" aria-label="Settings">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
