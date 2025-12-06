import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Send, Check, CheckCheck } from 'lucide-react';
import { chatAPI } from '../services/api';
import './Chat.css';

const Chat = ({ initialMessage }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.userId);
      // Poll for new messages in this conversation
      const interval = setInterval(() => fetchMessages(selectedChat.userId), 2000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (initialMessage) {
      setMessageInput(initialMessage);
      // Auto-select first chat for demo
      if (conversations.length > 0) {
        setSelectedChat(conversations[0]);
      }
    }
  }, [initialMessage, conversations]);

  const fetchConversations = async () => {
    try {
      const response = await chatAPI.getConversations();
      if (response.success && response.data) {
        const formattedConvs = response.data.map(conv => ({
          id: conv.id,
          userId: conv.userId,
          name: conv.name,
          avatar: '👤',
          lastMessage: conv.lastMessage || 'No messages yet',
          time: getTimeAgo(conv.lastMessageTime),
          unread: conv.unreadCount || 0,
          online: conv.online || false
        }));
        setConversations(formattedConvs);
      } else {
        // Use mock data as fallback
        setConversations(getMockConversations());
      }
    } catch (err) {
      console.error('Fetch conversations error:', err);
      setConversations(getMockConversations());
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await chatAPI.getMessages(userId);
      if (response.success && response.data) {
        const formattedMsgs = response.data.map(msg => ({
          id: msg.id,
          text: msg.text,
          sender: msg.senderId === 'current-user-id' ? 'me' : 'them', // Replace with actual user ID
          time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: msg.read
        }));
        setMessages(formattedMsgs);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    
    return 'Yesterday';
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMockConversations = () => [
    {
      id: '1',
      userId: 'user1',
      name: 'Priya Sharma',
      avatar: '👩',
      lastMessage: 'Thank you so much for the help!',
      time: '2 min ago',
      unread: 2,
      online: true
    },
    {
      id: '2',
      userId: 'user2',
      name: 'Rahul Verma',
      avatar: '👨',
      lastMessage: 'I can pick it up by 5 PM',
      time: '15 min ago',
      unread: 0,
      online: true
    }
  ];

  const handleSendMessage = async () => {
    if (messageInput.trim() && selectedChat) {
      const newMessage = {
        id: Date.now(),
        text: messageInput.trim(),
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      };

      // Optimistically add message to UI
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
      setSendingMessage(true);

      try {
        // Send message to backend
        const response = await chatAPI.sendMessage(selectedChat.userId, messageInput.trim());
        
        if (response.success) {
          // Message sent successfully, refresh messages
          fetchMessages(selectedChat.userId);
        }
      } catch (err) {
        console.error('Send message error:', err);
        // Message stays in UI even if API fails (optimistic update)
      } finally {
        setSendingMessage(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Conversation List View
  if (!selectedChat) {
    return (
      <div className="chat-page">
        <div className="chat-header">
          <h1>Messages</h1>
        </div>

        <div className="chat-search">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="conversations-list">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className="conversation-item"
                onClick={() => setSelectedChat(conv)}
              >
                <div className="conversation-avatar-wrapper">
                  <div className="conversation-avatar">{conv.avatar}</div>
                  {conv.online && <div className="online-indicator"></div>}
                </div>

                <div className="conversation-content">
                  <div className="conversation-header">
                    <h3 className="conversation-name">{conv.name}</h3>
                    <span className="conversation-time">{conv.time}</span>
                  </div>
                  <div className="conversation-footer">
                    <p className="last-message">
                      <Check size={14} className="message-status" />
                      {conv.lastMessage}
                    </p>
                    {conv.unread > 0 && (
                      <div className="unread-badge">{conv.unread}</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
             <div className="no-results">No conversations found</div>
          )}
        </div>
      </div>
    );
  }

  // Individual Chat View
  return (
    <div className="chat-page chat-view">
      <div className="chat-header-bar">
        <button className="back-button" onClick={() => setSelectedChat(null)}>
          <ArrowLeft size={24} />
        </button>
        <div className="chat-user-info">
          <div className="chat-avatar-wrapper">
            <div className="chat-avatar">{selectedChat.avatar}</div>
            {selectedChat.online && <div className="online-indicator-small"></div>}
          </div>
          <div>
            <h2 className="chat-user-name">{selectedChat.name}</h2>
            <p className="chat-user-status">
              {selectedChat.online ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {selectedChat.messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'me' ? 'message-sent' : 'message-received'}`}
          >
            <div className="message-bubble">
              <p className="message-text">{message.text}</p>
              <div className="message-meta">
                <span className="message-time">{message.time}</span>
                {message.sender === 'me' && (
                  message.read ? 
                    <CheckCheck size={14} className="read-status" /> : 
                    <Check size={14} className="sent-status" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="message-input-container">
        <input
          type="text"
          placeholder="Type a message..."
          className="message-input"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={handleKeyPress}
          autoFocus
        />
        <button
          className="send-button"
          onClick={handleSendMessage}
          disabled={!messageInput.trim()}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default Chat;
