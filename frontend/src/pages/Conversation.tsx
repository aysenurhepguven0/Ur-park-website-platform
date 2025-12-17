import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageApi } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import './Conversation.css';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

const Conversation: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [otherUserName, setOtherUserName] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      joinConversation();
    }

    return () => {
      if (socket && conversationId) {
        socket.emit('leave_conversation', conversationId);
      }
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket && connected && conversationId) {
      // Listen for new messages
      socket.on('new_message', (message: Message) => {
        if (message.senderId !== user?.id) {
          setMessages((prev) => [...prev, message]);
          // Mark as read
          socket.emit('mark_as_read', conversationId);
        }
      });

      // Listen for typing indicator
      socket.on('user_typing', (data: { userId: string; isTyping: boolean }) => {
        if (data.userId !== user?.id) {
          setIsTyping(data.isTyping);
        }
      });

      // Listen for read receipts
      socket.on('messages_read', () => {
        setMessages((prev) =>
          prev.map((msg) => ({
            ...msg,
            isRead: true
          }))
        );
      });

      return () => {
        socket.off('new_message');
        socket.off('user_typing');
        socket.off('messages_read');
      };
    }
  }, [socket, connected, conversationId, user]);

  const joinConversation = () => {
    if (socket && conversationId) {
      socket.emit('join_conversation', conversationId);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await messageApi.getMessages(conversationId!);
      const fetchedMessages = response.data.data.messages;
      setMessages(fetchedMessages);

      // Get other user's name from first message
      if (fetchedMessages.length > 0) {
        const firstMessage = fetchedMessages[0];
        if (firstMessage.senderId !== user?.id) {
          setOtherUserName(`${firstMessage.sender.firstName} ${firstMessage.sender.lastName}`);
        } else {
          // Find a message from the other user
          const otherMessage = fetchedMessages.find((m: Message) => m.senderId !== user?.id);
          if (otherMessage) {
            setOtherUserName(`${otherMessage.sender.firstName} ${otherMessage.sender.lastName}`);
          }
        }
      }

      // Mark messages as read
      if (socket) {
        socket.emit('mark_as_read', conversationId);
      }
    } catch (error: any) {
      console.error('Failed to fetch messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    if (socket && conversationId) {
      socket.emit('typing', { conversationId, isTyping: true });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { conversationId, isTyping: false });
      }, 1000);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !conversationId) return;

    const messageContent = newMessage.trim();

    try {
      setSending(true);
      setNewMessage(''); // Clear input immediately for better UX

      // Send via Socket.IO for real-time delivery
      if (socket && connected) {
        socket.emit('send_message', {
          conversationId,
          content: messageContent
        });

        // Add message optimistically
        const optimisticMessage: Message = {
          id: Date.now().toString(),
          content: messageContent,
          senderId: user!.id,
          createdAt: new Date().toISOString(),
          isRead: false,
          sender: {
            id: user!.id,
            firstName: user!.firstName,
            lastName: user!.lastName
          }
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        // Stop typing indicator
        socket.emit('typing', { conversationId, isTyping: false });
      } else {
        // Fallback to HTTP if socket not connected
        await messageApi.sendMessage({
          conversationId,
          content: messageContent
        });
        fetchMessages();
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const groupMessagesByDate = () => {
    const groups: { [date: string]: Message[] } = {};

    messages.forEach((message) => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday =
      new Date(now.getTime() - 86400000).toDateString() === date.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading">Loading conversation...</div>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate();

  return (
    <div className="page conversation-page">
      <div className="container">
        <div className="conversation-container">
          <div className="conversation-header">
            <button className="back-button" onClick={() => navigate('/messages')}>
              ← Back
            </button>
            <h2>{otherUserName || 'Conversation'}</h2>
            {connected ? (
              <span className="status-indicator connected">● Online</span>
            ) : (
              <span className="status-indicator disconnected">● Offline</span>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="messages-container">
            {Object.entries(messageGroups).map(([date, dateMessages]) => (
              <div key={date}>
                <div className="date-separator">
                  <span>{formatDateHeader(date)}</span>
                </div>
                {dateMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.senderId === user?.id ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{message.content}</p>
                      <span className="message-time">
                        {formatTime(message.createdAt)}
                        {message.senderId === user?.id && message.isRead && (
                          <span className="read-indicator"> ✓✓</span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {isTyping && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="message-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              disabled={sending}
              className="message-input"
            />
            <button type="submit" disabled={!newMessage.trim() || sending} className="send-button">
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
