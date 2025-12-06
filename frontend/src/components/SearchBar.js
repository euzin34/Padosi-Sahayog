import React from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';

const SearchBar = ({ placeholder = "Find neighbors, requests, or services..." }) => {
  return (
    <div className="search-bar">
      <Search size={20} className="search-icon" />
      <input
        type="text"
        placeholder={placeholder}
        className="search-input"
      />
    </div>
  );
};

export default SearchBar;
