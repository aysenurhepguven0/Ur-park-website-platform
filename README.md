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
- User authentication with JWT
- Email verification for new users
- Secure password hashing
- Email notifications for bookings, payments, and confirmations
- Image upload with Cloudinary integration
- Advanced search and filtering
- Responsive design
- RESTful API architecture
- PostgreSQL database with Prisma ORM

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **React Router** - Navigation
- **Axios** - HTTP client
- **CSS3** - Styling

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/shared-parking-platform.git
   cd shared-parking-platform
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
   - **iyzico**: Get API keys from https://merchant.iyzipay.com
   - **Email**: Configure SMTP or use Gmail with app password
   - **Cloudinary**: Get credentials from https://cloudinary.com

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

- `POST /api/auth/register` - Register a new user (sends verification email)
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (authenticated)
- `POST /api/auth/verify-email` - Verify email address with token
- `POST /api/auth/resend-verification` - Resend verification email (authenticated)

### Parking Space Endpoints

- `GET /api/parking-spaces` - Get all parking spaces (with filters)
- `GET /api/parking-spaces/nearby` - Get nearby parking spaces by location
- `GET /api/parking-spaces/:id` - Get parking space by ID
- `POST /api/parking-spaces` - Create parking space (authenticated)
- `PATCH /api/parking-spaces/:id` - Update parking space (authenticated, owner only)
- `DELETE /api/parking-spaces/:id` - Delete parking space (authenticated, owner only)
- `GET /api/parking-spaces/my-spaces` - Get user's parking spaces (authenticated)

### Booking Endpoints

- `POST /api/bookings` - Create booking (authenticated)
- `GET /api/bookings/my-bookings` - Get user's bookings (authenticated)
- `GET /api/bookings/:id` - Get booking by ID (authenticated)
- `PATCH /api/bookings/:id/status` - Update booking status (authenticated)
- `GET /api/bookings/space/:spaceId` - Get bookings for a space (authenticated, owner only)

### Review Endpoints

- `POST /api/reviews` - Create review (authenticated)
- `GET /api/reviews/space/:spaceId` - Get reviews for a space
- `PATCH /api/reviews/:id` - Update review (authenticated, author only)
- `DELETE /api/reviews/:id` - Delete review (authenticated, author only)

### User Endpoints

- `PATCH /api/users/profile` - Update user profile (authenticated)

### Payment Endpoints

- `POST /api/payments/initialize` - Initialize payment for booking (authenticated)
- `POST /api/payments/callback` - Payment callback from iyzico
- `GET /api/payments/:paymentId` - Get payment status (authenticated)
- `POST /api/payments/refund` - Request refund for paid booking (authenticated)

### Upload Endpoints

- `POST /api/upload/single` - Upload single image (authenticated)
- `POST /api/upload/multiple` - Upload multiple images (authenticated)
- `DELETE /api/upload/delete` - Delete image from Cloudinary (authenticated)

## Database Schema

The application uses the following main models:

- **User** - Platform users (owners and seekers)
- **ParkingSpace** - Parking space listings
- **Booking** - Parking space reservations
- **Review** - User reviews for parking spaces
- **Availability** - Parking space availability schedules

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

- Browser push notifications and in-app notification center
- Real-time updates via Socket.IO
- Phone verification with Twilio SMS (6-digit OTP)

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