import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Parking Spaces
export const parkingSpaceApi = {
  getAll: (params?: any) => api.get('/parking-spaces', { params }),
  getById: (id: string) => api.get(`/parking-spaces/${id}`),
  create: (data: any) => api.post('/parking-spaces', data),
  update: (id: string, data: any) => api.patch(`/parking-spaces/${id}`, data),
  delete: (id: string) => api.delete(`/parking-spaces/${id}`),
  getMySpaces: () => api.get('/parking-spaces/my-spaces'),
  getNearby: (params: { latitude: number; longitude: number; radius?: number; limit?: number }) =>
    api.get('/parking-spaces/nearby', { params })
};

// Bookings
export const bookingApi = {
  create: (data: any) => api.post('/bookings', data),
  getMyBookings: (params?: any) => api.get('/bookings/my-bookings', { params }),
  getById: (id: string) => api.get(`/bookings/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/bookings/${id}/status`, { status }),
  getSpaceBookings: (spaceId: string) => api.get(`/bookings/space/${spaceId}`)
};

// Reviews
export const reviewApi = {
  create: (data: any) => api.post('/reviews', data),
  getSpaceReviews: (spaceId: string) => api.get(`/reviews/space/${spaceId}`),
  update: (id: string, data: any) => api.patch(`/reviews/${id}`, data),
  delete: (id: string) => api.delete(`/reviews/${id}`)
};

// Users
export const userApi = {
  updateProfile: (data: any) => api.patch('/users/profile', data)
};

// Payments
export const paymentApi = {
  getConfig: () => api.get('/payments/config'),
  createPaymentIntent: (bookingId: string) =>
    api.post('/payments/create-payment-intent', { bookingId }),
  getPaymentIntentStatus: (paymentIntentId: string) =>
    api.get(`/payments/payment-intent/${paymentIntentId}`),
  cancelPaymentIntent: (bookingId: string) =>
    api.post('/payments/cancel-payment-intent', { bookingId }),
  refund: (bookingId: string) => api.post('/payments/refund', { bookingId })
};

// Upload
export const uploadApi = {
  uploadSingle: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadMultiple: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteImage: (publicId: string) =>
    api.delete('/upload/delete', { data: { publicId } })
};

// Analytics
export const analyticsApi = {
  getOverview: () => api.get('/analytics/overview'),
  getRevenueTrends: (period?: string) =>
    api.get('/analytics/revenue-trends', { params: { period } }),
  getSpaceAnalytics: (spaceId: string) => api.get(`/analytics/spaces/${spaceId}`),
  getPopularTimes: () => api.get('/analytics/popular-times')
};

// Messages
export const messageApi = {
  getConversations: () => api.get('/messages/conversations'),
  getOrCreateConversation: (data: { otherUserId: string; parkingSpaceId?: string }) =>
    api.post('/messages/conversations', data),
  getMessages: (conversationId: string, params?: any) =>
    api.get(`/messages/conversations/${conversationId}/messages`, { params }),
  sendMessage: (data: { conversationId: string; content: string }) =>
    api.post('/messages/send', data),
  markAsRead: (conversationId: string) =>
    api.post(`/messages/conversations/${conversationId}/read`)
};

// Notifications
export const notificationApi = {
  // In-app notifications
  getNotifications: (params?: { page?: number; limit?: number }) =>
    api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (notificationId: string) =>
    api.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  deleteNotification: (notificationId: string) =>
    api.delete(`/notifications/${notificationId}`),
  deleteAllNotifications: () => api.delete('/notifications'),

  // Notification preferences
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data: any) => api.patch('/notifications/preferences', data),

  // Push notifications
  getVapidPublicKey: () => api.get('/notifications/vapid-public-key'),
  subscribeToPush: (subscription: PushSubscriptionJSON) =>
    api.post('/notifications/push/subscribe', { subscription }),
  unsubscribeFromPush: (endpoint: string) =>
    api.post('/notifications/push/unsubscribe', { endpoint }),
  getPushSubscriptions: () => api.get('/notifications/push/subscriptions')
};

// Phone Verification
export const phoneApi = {
  getStatus: () => api.get('/phone/status'),
  sendCode: (phone: string) => api.post('/phone/send-code', { phone }),
  verify: (code: string) => api.post('/phone/verify', { code }),
  resendCode: () => api.post('/phone/resend-code'),
  remove: () => api.delete('/phone')
};

export default api;
