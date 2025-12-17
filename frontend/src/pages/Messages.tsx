import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { messageApi } from '../services/api';
import { useSocket } from '../context/SocketContext';
import './Messages.css';

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
  lastMessageAt: string;
}

const Messages: React.FC = () => {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { socket, connected } = useSocket();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (socket && connected) {
      // Listen for new messages
      socket.on('new_message', (message: any) => {
        // Refresh conversations to show updated last message
        fetchConversations();
      });

      socket.on('new_notification', (notification: any) => {
        if (notification.type === 'new_message') {
          fetchConversations();
        }
      });

      return () => {
        socket.off('new_message');
        socket.off('new_notification');
      };
    }
  }, [socket, connected]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageApi.getConversations();
      setConversations(response.data.data.conversations);
    } catch (error: any) {
      console.error('Failed to fetch conversations:', error);
      setError(t('messages.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(`/messages/${conversationId}`);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('messages.justNow');
    if (diffMins < 60) return `${diffMins}${t('messages.minutesAgo')}`;
    if (diffHours < 24) return `${diffHours}${t('messages.hoursAgo')}`;
    if (diffDays < 7) return `${diffDays}${t('messages.daysAgo')}`;

    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading">{t('messages.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="messages-page">
          <div className="page-header">
            <h1>{t('messages.title')}</h1>
            {connected ? (
              <span className="status-indicator connected">● {t('messages.connected')}</span>
            ) : (
              <span className="status-indicator disconnected">● {t('messages.disconnected')}</span>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          {conversations.length === 0 ? (
            <div className="empty-state">
              <h2>{t('messages.noConversations')}</h2>
              <p>{t('messages.startConversation')}</p>
            </div>
          ) : (
            <div className="conversations-list">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${conversation.unreadCount > 0 ? 'unread' : ''}`}
                  onClick={() => handleConversationClick(conversation.id)}
                >
                  <div className="conversation-avatar">
                    {conversation.otherUser.firstName.charAt(0)}
                    {conversation.otherUser.lastName.charAt(0)}
                  </div>
                  <div className="conversation-content">
                    <div className="conversation-header">
                      <h3 className="conversation-name">
                        {conversation.otherUser.firstName} {conversation.otherUser.lastName}
                      </h3>
                      <span className="conversation-time">
                        {formatTime(conversation.lastMessage?.createdAt || conversation.lastMessageAt)}
                      </span>
                    </div>
                    {conversation.lastMessage && (
                      <p className="conversation-preview">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="unread-badge">{conversation.unreadCount}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
