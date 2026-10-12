import { Router } from 'express';
import { db } from '../db';
import { Message } from '../../src/types/index';

const router = Router();

// GET all conversations for a user
router.get('/conversations', (req, res) => {
  const { userId } = req.query;
  const conversations = db.getConversations(userId as string);
  res.json(conversations);
});

// GET messages in a thread
router.get('/thread/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  const messages = db.getMessages(conversationId);
  res.json(messages);
});

// POST send new message
router.post('/', (req, res) => {
  const { conversationId, senderId, text } = req.body;
  if (!conversationId || !senderId || !text) {
    return res.status(400).json({ error: 'Conversation ID, sender ID, and text are required' });
  }

  const sender = db.getUserById(senderId);
  const conv = db.getConversations().find(c => c.id === conversationId);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation thread not found' });
  }

  const newMsg: Message = {
    id: `msg-${Date.now()}`,
    conversationId,
    senderId,
    senderName: sender?.fullName || 'User',
    senderRole: sender?.role || 'customer',
    text,
    timestamp: new Date().toISOString(),
    isRead: false
  };

  db.addMessage(newMsg);

  // Notify recipient
  const recipientId = conv.customerId === senderId 
    ? (db.getProviderById(conv.providerId)?.userId || conv.providerId)
    : conv.customerId;

  db.addNotification({
    id: `notif-${Date.now()}`,
    userId: recipientId,
    title: `New Message from ${sender?.fullName || 'User'}`,
    message: text.length > 60 ? `${text.slice(0, 60)}...` : text,
    type: 'message',
    link: '/messages',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.status(201).json(newMsg);
});

export default router;
