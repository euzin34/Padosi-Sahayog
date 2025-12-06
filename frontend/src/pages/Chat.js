import React, { useState } from 'react';
import { Search, ArrowLeft, Send, Check, CheckCheck } from 'lucide-react';
import './Chat.css';

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');

  // Mock conversations data
  const conversations = [
    {
      id: 1,
      name: 'Priya Sharma',
      avatar: '👩',
      lastMessage: 'Thank you so much for the help!',
      time: '2 min ago',
      unread: 2,
      online: true,
      messages: [
        { id: 1, text: 'Hi! Can you help me with groceries?', sender: 'them', time: '10:30 AM', read: true },
        { id: 2, text: 'Sure! I can help. What do you need?', sender: 'me', time: '10:32 AM', read: true },
        { id: 3, text: 'Just some vegetables and milk', sender: 'them', time: '10:33 AM', read: true },
        { id: 4, text: 'No problem! I will be there in 5 min', sender: 'me', time: '10:35 AM', read: true },
        { id: 5, text: 'Thank you so much for the help!', sender: 'them', time: '11:20 AM', read: false }
      ]
    },
    {
      id: 2,
      name: 'Rahul Verma',
      avatar: '👨',
      lastMessage: 'I can pick it up by 5 PM',
      time: '15 min ago',
      unread: 0,
      online: true,
      messages: [
        { id: 1, text: 'Need medicine from pharmacy', sender: 'them', time: '9:00 AM', read: true },
        { id: 2, text: 'I can pick it up by 5 PM', sender: 'them', time: '9:15 AM', read: true }
      ]
    },
    {
      id: 3,
      name: 'Anjali Patel',
      avatar: '👩',
      lastMessage: 'The medicines have been delivered',
      time: '1 hr ago',
      unread: 0,
      online: false,
      messages: [
        { id: 1, text: 'The medicines have been delivered', sender: 'them', time: 'Yesterday', read: true }
      ]
    },
    {
      id: 4,
      name: 'Suresh Kumar',
      avatar: '👨',
      lastMessage: 'See you tomorrow for the tutoring',
      time: '3 hrs ago',
      unread: 0,
      online: false,
      messages: [
        { id: 1, text: 'See you tomorrow for the tutoring', sender: 'them', time: '2:00 PM', read: true }
      ]
    },
    {
      id: 5,
      name: 'Meera Joshi',
      avatar: '👩',
      lastMessage: 'Thanks for fixing the faucet!',
      time: 'Yesterday',
      unread: 0,
      online: false,
      messages: [
        { id: 1, text: 'Thanks for fixing the faucet!', sender: 'them', time: 'Yesterday', read: true }
      ]
    }
  ];

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedChat) {
      // In real app, this would send to backend
      console.log('Sending message:', messageInput);
      setMessageInput('');
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
          />
        </div>

        <div className="conversations-list">
          {conversations.map((conv) => (
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
          ))}
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
