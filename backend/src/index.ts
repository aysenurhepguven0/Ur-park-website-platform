import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import parkingSpaceRoutes from './routes/parkingSpace.routes';
import bookingRoutes from './routes/booking.routes';
import reviewRoutes from './routes/review.routes';
import uploadRoutes from './routes/upload.routes';
import messageRoutes from './routes/message.routes';
import analyticsRoutes from './routes/analytics.routes';
import favoriteRoutes from './routes/favorite.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';
import phoneRoutes from './routes/phone.routes';
import iyzicoRoutes from './routes/iyzico.routes';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter, authLimiter, createLimiter, messageLimiter } from './middleware/rateLimiter';
import prisma from './lib/prisma';
import logger, { morganStream } from './services/logger.service';
import reminderService from './services/reminder.service';

// Load .env file from backend root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Parse allowed origins from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: morganStream }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Shared Parking Platform API is running' });
});

// Routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/parking-spaces', apiLimiter, parkingSpaceRoutes);
app.use('/api/bookings', apiLimiter, bookingRoutes);
app.use('/api/reviews', apiLimiter, reviewRoutes);
app.use('/api/upload', createLimiter, uploadRoutes);
app.use('/api/messages', messageLimiter, messageRoutes);
app.use('/api/analytics', apiLimiter, analyticsRoutes);
app.use('/api/favorites', apiLimiter, favoriteRoutes);
app.use('/api/notifications', apiLimiter, notificationRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);
app.use('/api/phone', authLimiter, phoneRoutes);
app.use('/api/payments', apiLimiter, iyzicoRoutes);

// Error handling
app.use(errorHandler);

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    socket.data.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  const userId = socket.data.userId;
  logger.info(`User connected: ${userId}`);

  // Join user's personal room
  socket.join(`user:${userId}`);

  // Join conversation
  socket.on('join_conversation', (conversationId: string) => {
    socket.join(`conversation:${conversationId}`);
    logger.debug(`User ${userId} joined conversation ${conversationId}`);
  });

  // Leave conversation
  socket.on('leave_conversation', (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
    logger.debug(`User ${userId} left conversation ${conversationId}`);
  });

  // Send message
  socket.on('send_message', async (data: { conversationId: string; content: string }) => {
    try {
      const { conversationId, content } = data;

      // Verify user is part of this conversation
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [{ user1Id: userId }, { user2Id: userId }]
        }
      });

      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      // Create message
      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          content: content.trim()
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      // Update conversation's lastMessageAt
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() }
      });

      // Emit to all users in the conversation
      io.to(`conversation:${conversationId}`).emit('new_message', message);

      // Notify the other user
      const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
      io.to(`user:${otherUserId}`).emit('new_notification', {
        type: 'new_message',
        conversationId,
        message
      });

      // Get receiver info for persistent notification
      const receiver = await prisma.user.findUnique({
        where: { id: otherUserId },
        select: { id: true, firstName: true, lastName: true }
      });

      // Create persistent notification in database
      if (receiver) {
        const notificationService = (await import('./services/notification.service')).default;
        await notificationService.notifyNewMessage(
          conversationId,
          message.sender,
          receiver,
          content
        );
      }
    } catch (error) {
      logger.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
    socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
      userId,
      isTyping: data.isTyping
    });
  });

  // Mark messages as read
  socket.on('mark_as_read', async (conversationId: string) => {
    try {
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: userId },
          isRead: false
        },
        data: { isRead: true }
      });

      // Notify other user that messages were read
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
      });

      if (conversation) {
        const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
        io.to(`user:${otherUserId}`).emit('messages_read', { conversationId });
      }
    } catch (error) {
      logger.error('Mark as read error:', error);
    }
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${userId}`);
  });
});

httpServer.listen(Number(PORT), HOST, () => {
  logger.info(`Server is running on ${HOST}:${PORT}`);
  logger.info(`Socket.IO is enabled`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Allowed origins: ${allowedOrigins.join(', ')}`);

  // Start the booking reminder service
  reminderService.start();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  reminderService.stop();
  httpServer.close(() => {
    logger.info('HTTP server closed');
  });
});

export default app;
