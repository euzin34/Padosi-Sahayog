import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Send, Check, CheckCheck } from 'lucide-react';
import { chatAPI } from '../services/api';
import './Chat.css';

const Chat = ({ initialMessage, startChatWith, taskId, taskTitle }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Pure Mock Mode - Initialize with mock data
  useEffect(() => {
    const mocks = getMockConversations();
    setConversations(mocks);
    setLoading(false);
  }, []);

  // Handle starting a chat from map/home (Mock Logic)
  useEffect(() => {
    if (startChatWith) {
      // Check if we already have a conversation with this user
      const existingConv = conversations.find(c => c.userId === startChatWith.uid || c.userId === startChatWith.id);

      if (existingConv) {
        setSelectedChat(existingConv);
        // Load mock messages for this existing chat if empty
        if (messages.length === 0) {
          setMessages([
            { id: 1, text: "Hey, is this task still available?", sender: 'them', time: '10:00 AM', read: true }
          ]);
        }
      } else {
        // Create a new mock conversation
        const newConv = {
          id: taskId || `temp_${Date.now()}`,
          userId: startChatWith.uid || startChatWith.id || 'mock_user_id',
          name: startChatWith.displayName || 'Task Requester',
          avatar: '👤',
          lastMessage: taskTitle ? `Regarding: ${taskTitle}` : 'New accepted task',
          time: 'Just now',
          unread: 0,
          online: true,
          messages: []
        };

        setConversations(prev => [newConv, ...prev]);
        setSelectedChat(newConv);
        setMessages([]);
        setMessageInput(`Hi, I've accepted your task "${taskTitle || 'request'}".`);
      }
    }
  }, [startChatWith, taskId, taskTitle]);

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

      // Add message to UI
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
      setSendingMessage(true);

      // Update conversation list
      setConversations(prev => prev.map(c =>
        c.id === selectedChat.id
          ? { ...c, lastMessage: newMessage.text, time: 'Just now' }
          : c
      ));

      // Simulate Reply (No Backend)
      setSendingMessage(false);
      setTimeout(() => {
        simulateReply(newMessage.text);
      }, 1500);
    }
  };

  const simulateReply = (userText) => {
    let replyText = "Thanks for the message! I'll get back to you shortly.";

    if (userText.toLowerCase().includes('hi') || userText.toLowerCase().includes('hello')) {
      replyText = "Hello! Thanks for accepting my task.";
    } else if (userText.toLowerCase().includes('where')) {
      replyText = "I'm located near the city center.";
    } else if (userText.toLowerCase().includes('help')) {
      replyText = "That would be great! When can you come?";
    }

    const replyMessage = {
      id: Date.now() + 1,
      text: replyText,
      sender: 'them',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true
    };

    setMessages(prev => [...prev, replyMessage]);

    // Update conversation list last message
    setConversations(prev => prev.map(c =>
      c.id === selectedChat.id
        ? { ...c, lastMessage: replyText, time: 'Just now', unread: (c.unread || 0) + 1 }
        : c
    ));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {messages.map((message) => (
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
