# Ur-Park Website Platform

A full-stack web application for sharing and booking parking spaces with intelligent capacity allocation. Connect parking space owners with people who need them through time-slot based parking management.

## Features

### For Parking Space Owners
- **List Your Space**: Easily create listings with details, pricing, and amenities
- **Manage Listings**: View, edit, and delete your parking spaces
- **Track Bookings**: See all bookings for your spaces
- **Flexible Pricing**: Set hourly, daily, and monthly rates

### For Parking Seekers
- **Search & Filter**: Find parking spaces by location, type, and price
- **Real-time Availability**: See which spaces are available
- **Easy Booking**: Reserve parking spaces for specific time periods
- **Reviews & Ratings**: Read reviews from other users
- **Booking Management**: Track and manage your bookings

### Platform Features
- User authentication with JWT and Google OAuth
- Email and phone (SMS) verification for new users
- Secure password hashing with bcrypt (12 rounds)
- Multi-channel notifications (Email, SMS, Push, In-app)
- Real-time messaging with Socket.IO
- Image upload with Cloudinary CDN integration
- Advanced geospatial search with Haversine formula
- Responsive design with internationalization (i18next)
- RESTful API architecture with rate limiting
- PostgreSQL database with Prisma ORM
- Admin panel for platform management

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing (12 rounds)
- **Socket.IO** - Real-time messaging
- **Winston** - Structured logging
- **express-rate-limit** - API rate limiting
- **express-validator** - Input validation
- **Twilio** - SMS verification
- **Cloudinary** - Image storage & CDN
- **iyzico** - Payment processing
- **Nodemailer** - Email notifications
- **web-push** - Push notifications
- **node-cron** - Scheduled tasks
- **Google Auth Library** - OAuth 2.0

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **React Router v6** - Navigation
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time messaging
- **i18next** - Internationalization (TR/EN)
- **@react-google-maps/api** - Google Maps integration
- **CSS3** - Styling

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aysenurhepguven0/Ur-park-website-platform.git
   cd Ur-park-website-platform
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies (optional, for convenience scripts)
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up the database**

   Create a PostgreSQL database:
   ```bash
   createdb shared_parking
   ```

4. **Configure environment variables**

   Backend (.env):
   ```bash
   cd backend
   cp .env.example .env
   ```

   Edit `backend/.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/shared_parking"
   JWT_SECRET="your-secret-key-change-in-production"
   JWT_EXPIRES_IN="7d"
   PORT=3001
   NODE_ENV="development"
   FRONTEND_URL="http://localhost:3000"

   # iyzico Configuration (Get these from https://merchant.iyzipay.com)
   IYZICO_API_KEY="your_iyzico_api_key"
   IYZICO_SECRET_KEY="your_iyzico_secret_key"
   IYZICO_BASE_URL="https://sandbox-api.iyzipay.com" # Use https://api.iyzipay.com for production

   # Email Configuration (for sending notifications)
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT="587"
   EMAIL_SECURE="false"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASSWORD="your-app-password"
   EMAIL_FROM="Shared Parking Platform <noreply@sharedparking.com>"

   # Cloudinary Configuration (for image uploads - get from https://cloudinary.com)
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"

   # Twilio Configuration (for SMS verification - get from https://www.twilio.com)
   TWILIO_ACCOUNT_SID="your-twilio-account-sid"
   TWILIO_AUTH_TOKEN="your-twilio-auth-token"
   TWILIO_PHONE_NUMBER="+1234567890"

   # Google OAuth Configuration (get from https://console.cloud.google.com)
   GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"

   # Web Push Configuration (for push notifications)
   VAPID_PUBLIC_KEY="your-vapid-public-key"
   VAPID_PRIVATE_KEY="your-vapid-private-key"
   VAPID_SUBJECT="mailto:your-email@example.com"
   ```

   Frontend (.env):
   ```bash
   cd frontend
   cp .env.example .env
   ```

   Edit `frontend/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   ```

5. **Set up third-party services**
   - **iyzico**: Get API keys from https://merchant.iyzipay.com (for payments)
   - **Email**: Configure SMTP or use Gmail with app password
   - **Cloudinary**: Get credentials from https://cloudinary.com (for image storage)
   - **Twilio**: Get credentials from https://www.twilio.com (for SMS verification)
   - **Google OAuth**: Set up OAuth 2.0 client at https://console.cloud.google.com
   - **Web Push**: Generate VAPID keys using `npx web-push generate-vapid-keys`

6. **Run database migrations**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

### Running the Application

**Development Mode:**

Option 1 - Run both servers from root:
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

Option 2 - Run servers individually:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health Check: http://localhost:3001/health

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user (returns JWT)
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/profile` - Get current user profile (authenticated)
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/resend-verification` - Resend verification email

### Phone Verification Endpoints

- `GET /api/phone/status` - Get phone verification status
- `POST /api/phone/send-code` - Send SMS verification code (Twilio)
- `POST /api/phone/verify` - Verify phone with code
- `POST /api/phone/resend-code` - Resend verification code
- `DELETE /api/phone` - Remove phone number

### Parking Space Endpoints

- `GET /api/parking-spaces` - Get all parking spaces
- `GET /api/parking-spaces/nearby?lat=&lng=&radius=` - Get nearby spaces (Haversine)
- `GET /api/parking-spaces/my-spaces` - Get user's parking spaces (authenticated)
- `GET /api/parking-spaces/:id` - Get parking space details
- `POST /api/parking-spaces` - Create parking space (authenticated)
- `PATCH /api/parking-spaces/:id` - Update parking space (owner only)
- `DELETE /api/parking-spaces/:id` - Delete parking space (owner only)
- `GET /api/parking-spaces/:id/availability` - Get availability
- `POST /api/parking-spaces/:id/availability` - Set availability (owner only)

### Booking Endpoints

- `GET /api/bookings/my-bookings` - Get user's bookings (authenticated)
- `GET /api/bookings/space/:spaceId` - Get bookings for a space (owner)
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create booking with conflict detection
- `PATCH /api/bookings/:id/status` - Update booking status (PENDING, CONFIRMED, COMPLETED, CANCELLED)

### Review Endpoints

- `GET /api/reviews/space/:spaceId` - Get reviews for a space
- `POST /api/reviews` - Create review (parkingSpaceId, rating, comment)
- `PATCH /api/reviews/:id` - Update review (authenticated)
- `DELETE /api/reviews/:id` - Delete review (authenticated)

### Messaging Endpoints (Socket.IO + HTTP)

- `GET /api/messages/conversations` - Get user's conversations (authenticated)
- `POST /api/messages/conversations` - Create or find conversation
- `GET /api/messages/conversations/:conversationId/messages` - Get messages
- `POST /api/messages` - Send message (HTTP fallback)
- `PATCH /api/messages/conversations/:conversationId/read` - Mark as read

### Notification Endpoints

- `GET /api/notifications/vapid-public-key` - Get VAPID public key for Web Push
- `GET /api/notifications` - Get user notifications (authenticated)
- `GET /api/notifications/unread-count` - Get unread count
- `GET /api/notifications/preferences` - Get notification preferences
- `PATCH /api/notifications/preferences` - Update preferences
- `PATCH /api/notifications/:notificationId/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:notificationId` - Delete notification
- `DELETE /api/notifications` - Delete all notifications
- `GET /api/notifications/push/subscriptions` - Get push subscriptions
- `POST /api/notifications/push/subscribe` - Subscribe to push notifications
- `POST /api/notifications/push/unsubscribe` - Unsubscribe from push

### Analytics Endpoints

- `GET /api/analytics/overview` - Get analytics overview (authenticated)
- `GET /api/analytics/revenue-trends` - Get revenue trends (owner)
- `GET /api/analytics/spaces/:spaceId` - Get space analytics
- `GET /api/analytics/popular-times` - Get popular booking times

### Favorite Endpoints

- `GET /api/favorites` - Get user's favorites (authenticated)
- `GET /api/favorites/check/:parkingSpaceId` - Check if space is favorited
- `POST /api/favorites` - Add to favorites (parkingSpaceId)
- `DELETE /api/favorites/:parkingSpaceId` - Remove from favorites

### Upload Endpoints

- `POST /api/upload/single` - Upload single image to Cloudinary (authenticated)
- `POST /api/upload/multiple` - Upload multiple images to Cloudinary (authenticated)
- `DELETE /api/upload/delete` - Delete image from Cloudinary (authenticated)

### User Profile Endpoints

- `GET /api/users/:id` - Get user by ID (public)
- `GET /api/users/me/profile` - Get own profile (authenticated)
- `PATCH /api/users/me/profile` - Update profile (firstName, lastName, phone, bio, profilePicture)
- `PATCH /api/users/me/password` - Change password (currentPassword, newPassword)
- `DELETE /api/users/me/account` - Delete account (password required)

### Payment Endpoints (Iyzico)

- `POST /api/payments/create` - Create payment (authenticated)
- `GET /api/payments/:bookingId/status` - Get payment status
- `POST /api/payments/refund` - Request refund

### Admin Endpoints (Admin Role Required)

- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:userId/role` - Update user role (USER, ADMIN, MODERATOR)
- `POST /api/admin/users/:userId/suspend` - Suspend user
- `DELETE /api/admin/users/:userId` - Delete user
- `GET /api/admin/spaces/pending` - Get pending parking spaces
- `PATCH /api/admin/spaces/:spaceId/approve` - Approve parking space
- `PATCH /api/admin/spaces/:spaceId/reject` - Reject parking space

### Socket.IO Events (Real-Time Messaging)

**Client → Server:**
- `join_conversation` - Join conversation room
- `send_message` - Send message
- `typing` - Typing indicator
- `mark_as_read` - Mark messages as read

**Server → Client:**
- `new_message` - New message received
- `typing` - User is typing
- `message_read` - Message was read
- `conversation_updated` - Conversation updated

## Database Schema

The application uses the following main models:

- **User** - Platform users (owners and seekers)
- **ParkingSpace** - Parking space listings
- **Booking** - Parking space reservations
- **Review** - User reviews for parking spaces (one per user per space)
- **Availability** - Parking space availability schedules
- **Favorite** - User's favorite parking spaces
- **Conversation** - Chat conversations between users
- **Message** - Messages within conversations
- **Notification** - In-app notifications
- **NotificationPreference** - User notification settings (email, SMS, push, in-app)
- **PushSubscription** - Web push notification subscriptions

**Enums:**
- **UserRole**: USER, ADMIN, MODERATOR
- **SpaceType**: COVERED_SITE_PARKING, OPEN_SITE_PARKING, SITE_GARAGE, COMPLEX_PARKING
- **SpaceStatus**: PENDING, APPROVED, REJECTED
- **BookingStatus**: PENDING, CONFIRMED, COMPLETED, CANCELLED
- **PaymentStatus**: PENDING, PAID, REFUNDED, FAILED
- **NotificationType**: BOOKING_CONFIRMED, BOOKING_CANCELLED, BOOKING_REMINDER, PAYMENT_RECEIVED, NEW_MESSAGE, NEW_REVIEW, etc.

## Development Tools

**Prisma Studio** - Visual database editor:
```bash
cd backend
npx prisma studio
```

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Protected API routes
- Input validation with express-validator
- CORS configuration
- SQL injection protection via Prisma ORM
- Secure payment processing with iyzico
- PCI compliance through iyzico's secure payment infrastructure

## Payment Processing

Payment integration with **iyzico** for secure transactions, 3D Secure support, and automatic refund processing.

**Test Cards** (Sandbox):
- Visa: `4603 4509 0000 0000` (3DS password: 123456)
- Mastercard: `5406 6700 0000 0000` (3DS password: 123456)

## Email Notifications

Automated email notifications for verification, bookings, payments, and reminders. Supports SMTP, Gmail, SendGrid, Mailgun, and AWS SES.

## Image Upload

Cloudinary integration for image storage with automatic optimization, CDN delivery, and support for multiple formats (max 5MB per image).

## Search & Filtering

Search by location, price range, space type, and amenities. Supports nearby search with GPS coordinates and radius filtering.

## Notifications

The platform supports multi-channel notifications:

- **In-app Notifications**: Real-time notification center with unread badges
- **Push Notifications**: Browser push notifications using Web Push API & VAPID
- **Email Notifications**: Transactional emails via Nodemailer (SMTP/Gmail)
- **SMS Notifications**: Phone verification and alerts via Twilio (6-digit OTP)
- **Real-time Updates**: Socket.IO for instant messaging and live updates

Users can customize their notification preferences for each channel (email, push, SMS) and each event type (bookings, payments, messages, reviews).

## Contributing

1. Fork the repository
2. Create your feature branch 
3. Commit your changes 
4. Push to the branch 
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, please open an issue in the GitHub repository.