import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get all conversations for a user
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }]
      },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        user2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            isRead: true,
            senderId: true
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });

    // Count unread messages for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            isRead: false
          }
        });

        // Determine the other user
        const otherUser = conv.user1Id === userId ? conv.user2 : conv.user1;

        return {
          ...conv,
          otherUser,
          unreadCount,
          lastMessage: conv.messages[0] || null
        };
      })
    );

    res.json({
      success: true,
      data: { conversations: conversationsWithUnread }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversations'
    });
  }
};

// Get or create a conversation
export const getOrCreateConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { otherUserId, parkingSpaceId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'otherUserId is required'
      });
    }

    if (otherUserId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create conversation with yourself'
      });
    }

    // Check if conversation already exists (in either direction)
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: otherUserId },
          { user1Id: otherUserId, user2Id: userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        user2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // If not, create it
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id: userId,
          user2Id: otherUserId,
          parkingSpaceId: parkingSpaceId || null
        },
        include: {
          user1: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          user2: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
    }

    const otherUser = conversation.user1Id === userId ? conversation.user2 : conversation.user1;

    res.json({
      success: true,
      data: {
        conversation: {
          ...conversation,
          otherUser
        }
      }
    });
  } catch (error) {
    console.error('Get/create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get or create conversation'
    });
  }
};

// Get messages for a conversation
export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

    // Verify user is part of this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ user1Id: userId }, { user2Id: userId }]
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      skip: offset,
      take: limit
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages'
    });
  }
};

// Send a message (HTTP endpoint, also handled by Socket.io)
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { conversationId, content } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({
        success: false,
        message: 'conversationId and content are required'
      });
    }

    // Verify user is part of this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ user1Id: userId }, { user2Id: userId }]
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
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

    res.json({
      success: true,
      data: { message }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Mark messages as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;

    // Verify user is part of this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ user1Id: userId }, { user2Id: userId }]
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
};
