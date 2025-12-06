import React, { useState } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Map from './pages/Map';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import PostRequest from './pages/PostRequest';
import Auth from './components/Auth';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const { currentUser } = useAuth();

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Home onNavigate={setActiveTab} />;
      case 'post-request':
        return <PostRequest onBack={() => setActiveTab('home')} initialType="request" />;
      case 'offer-help':
        return <PostRequest onBack={() => setActiveTab('home')} initialType="offer" />;
      case 'map':
        return <Map />;
      case 'chat':
        return <Chat />;
      case 'profile':
        return <Profile />;
      default:
        return <Home onNavigate={setActiveTab} />;
    }
  };

  // Show auth screen if not logged in
  if (!currentUser) {
    return <Auth onAuthSuccess={() => setActiveTab('home')} />;
  }

  return (
    <div className="App">
      {activeTab !== 'post-request' && activeTab !== 'offer-help' && <Navbar />}
      <main className="main-content">
        {renderPage()}
      </main>
      {activeTab !== 'post-request' && activeTab !== 'offer-help' && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
