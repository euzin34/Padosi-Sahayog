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
  const [pageProps, setPageProps] = useState({});
  const { currentUser } = useAuth();

  const navigateTo = (tab, props = {}) => {
    setActiveTab(tab);
    setPageProps(props);
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Home onNavigate={navigateTo} />;
      case 'post-request':
        return <PostRequest onBack={() => navigateTo('home')} initialType="request" />;
      case 'offer-help':
        return <PostRequest onBack={() => navigateTo('home')} initialType="offer" />;
      case 'map':
        return <Map onNavigate={navigateTo} {...pageProps} />;
      case 'chat':
        return <Chat onNavigate={navigateTo} {...pageProps} />;
      case 'profile':
        return <Profile onNavigate={navigateTo} />;
      default:
        return <Home onNavigate={navigateTo} />;
    }
  };

  // Show auth screen if not logged in
  if (!currentUser) {
    return <Auth onAuthSuccess={() => navigateTo('home')} />;
  }

  return (
    <div className="App">
      {activeTab !== 'post-request' && activeTab !== 'offer-help' && <Navbar />}
      <main className="main-content">
        {renderPage()}
      </main>
      {activeTab !== 'post-request' && activeTab !== 'offer-help' && (
        <BottomNav activeTab={activeTab} setActiveTab={(tab) => navigateTo(tab)} />
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
