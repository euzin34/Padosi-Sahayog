const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    getConversations,
    getMessages,
    sendMessage,
    markAsRead,
    createConversation
} = require('../controllers/chatController');

/**
 * @route   GET /api/chat/conversations
 * @desc    Get all conversations for the logged-in user
 * @access  Protected
 */
router.get('/conversations', verifyToken, getConversations);

/**
 * @route   POST /api/chat/conversations
 * @desc    Create a new conversation
 * @access  Protected
 */
router.post('/conversations', verifyToken, createConversation);

/**
 * @route   GET /api/chat/messages/:userId
 * @desc    Get messages with a specific user
 * @access  Protected
 */
router.get('/messages/:userId', verifyToken, getMessages);

/**
 * @route   POST /api/chat/send
 * @desc    Send a message to another user
 * @access  Protected
 */
router.post('/send', verifyToken, sendMessage);

/**
 * @route   PUT /api/chat/read/:conversationId
 * @desc    Mark messages as read
 * @access  Protected
 */
router.put('/read/:conversationId', verifyToken, markAsRead);

module.exports = router;
