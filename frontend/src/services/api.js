const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken') || 'mock-token-123';
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Task/Request API
export const taskAPI = {
  // Create a new request or offer
  create: async (taskData) => {
    return apiCall('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  // Get all tasks with filters
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiCall(`/tasks?${queryParams}`);
  },

  // Get task by ID
  getById: async (taskId) => {
    return apiCall(`/tasks/${taskId}`);
  },

  // Update task
  update: async (taskId, updates) => {
    return apiCall(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete task
  delete: async (taskId) => {
    return apiCall(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  // Accept/Book a task
  accept: async (taskId) => {
    return apiCall(`/tasks/${taskId}/accept`, {
      method: 'POST',
    });
  },
};

// Nearby API
export const nearbyAPI = {
  // Get nearby requests and offers
  getNearby: async (latitude, longitude, radius = 5) => {
    return apiCall(`/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
  },
};

// Chat API
export const chatAPI = {
  // Get all conversations
  getConversations: async () => {
    return apiCall('/chat/conversations');
  },

  // Get messages with a specific user
  getMessages: async (userId) => {
    return apiCall(`/chat/messages/${userId}`);
  },

  // Send a message
  sendMessage: async (receiverId, text) => {
    return apiCall('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ receiverId, text }),
    });
  },

  // Create a new conversation
  createConversation: async (participantId, taskId) => {
    return apiCall('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ participantId, taskId }),
    });
  },
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    localStorage.removeItem('authToken');
    return { success: true };
  },
};

export default {
  taskAPI,
  nearbyAPI,
  chatAPI,
  authAPI,
};
