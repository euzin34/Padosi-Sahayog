const { getUser } = require('../utils/storage');

// In-memory storage for messages
const messages = new Map();
const conversations = new Map();

/**
 * Get all conversations for a user
 */
const getConversations = async (req, res) => {
    try {
        const userId = req.user.uid;
        
        // Get user's conversations
        const userConversations = conversations.get(userId) || [];
        
        // Format conversations with user details
        const formattedConversations = userConversations.map(conv => {
            const otherUser = getUser(conv.otherUserId);
            return {
                id: conv.id,
                userId: conv.otherUserId,
                name: otherUser?.displayName || 'Unknown User',
                lastMessage: conv.lastMessage,
                lastMessageTime: conv.lastMessageTime,
                unreadCount: conv.unreadCount || 0,
                online: conv.online || false
            };
        });

        res.json({
            success: true,
            data: formattedConversations
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get conversations'
        });
    }
};

/**
 * Get messages between two users
 */
const getMessages = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { userId: otherUserId } = req.params;

        // Create conversation ID (sorted to ensure consistency)
        const conversationId = [userId, otherUserId].sort().join('_');
        
        // Get messages for this conversation
        const conversationMessages = messages.get(conversationId) || [];

        res.json({
            success: true,
            data: conversationMessages
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get messages'
        });
    }
};

/**
 * Send a message
 */
const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.uid;
        const { receiverId, text } = req.body;

        if (!receiverId || !text) {
            return res.status(400).json({
                success: false,
                error: 'Receiver ID and message text are required'
            });
        }

        // Create conversation ID
        const conversationId = [senderId, receiverId].sort().join('_');
        
        // Create message object
        const message = {
            id: Date.now().toString(),
            senderId,
            receiverId,
            text,
            timestamp: new Date().toISOString(),
            read: false
        };

        // Store message
        const conversationMessages = messages.get(conversationId) || [];
        conversationMessages.push(message);
        messages.set(conversationId, conversationMessages);

        // Update conversations for both users
        updateConversation(senderId, receiverId, text, message.timestamp);
        updateConversation(receiverId, senderId, text, message.timestamp);

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: message
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send message'
        });
    }
};

/**
 * Mark messages as read
 */
const markAsRead = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { conversationId } = req.params;

        // Get messages for this conversation
        const conversationMessages = messages.get(conversationId) || [];
        
        // Mark all messages sent to this user as read
        conversationMessages.forEach(msg => {
            if (msg.receiverId === userId) {
                msg.read = true;
            }
        });

        messages.set(conversationId, conversationMessages);

        // Update unread count in conversation
        const userConversations = conversations.get(userId) || [];
        const conversation = userConversations.find(c => c.id === conversationId);
        if (conversation) {
            conversation.unreadCount = 0;
        }

        res.json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark messages as read'
        });
    }
};

/**
 * Helper function to update conversation
 */
function updateConversation(userId, otherUserId, lastMessage, timestamp) {
    const userConversations = conversations.get(userId) || [];
    const conversationId = [userId, otherUserId].sort().join('_');
    
    let conversation = userConversations.find(c => c.otherUserId === otherUserId);
    
    if (conversation) {
        conversation.lastMessage = lastMessage;
        conversation.lastMessageTime = timestamp;
        if (userId !== otherUserId) {
            conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        }
    } else {
        conversation = {
            id: conversationId,
            otherUserId,
            lastMessage,
            lastMessageTime: timestamp,
            unreadCount: userId !== otherUserId ? 1 : 0,
            online: false
        };
        userConversations.push(conversation);
    }
    
    conversations.set(userId, userConversations);
}

module.exports = {
    getConversations,
    getMessages,
    sendMessage,
    markAsRead
};
