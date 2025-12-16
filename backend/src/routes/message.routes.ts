import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markAsRead
} from '../controllers/message.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all conversations for the authenticated user
router.get('/conversations', getConversations);

// Get or create a conversation with another user
router.post('/conversations', getOrCreateConversation);

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', getMessages);

// Send a message (also supported via Socket.io)
router.post('/messages', sendMessage);

// Mark messages as read
router.patch('/conversations/:conversationId/read', markAsRead);

export default router;
