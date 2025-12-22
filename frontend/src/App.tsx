import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import './i18n'; // i18n konfigürasyonunu yükle
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ParkingSpaceList from './pages/ParkingSpaceList';
import ParkingSpaceDetail from './pages/ParkingSpaceDetail';
import CreateParkingSpace from './pages/CreateParkingSpace';
import EditParkingSpace from './pages/EditParkingSpace';
import MySpaces from './pages/MySpaces';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import Checkout from './pages/Checkout';
import BookingSuccess from './pages/BookingSuccess';
import Messages from './pages/Messages';
import Conversation from './pages/Conversation';
import ManageAvailability from './pages/ManageAvailability';
import Favorites from './pages/Favorites';
import NotificationSettings from './pages/NotificationSettings';
import CorporateDashboard from './pages/CorporateDashboard';
import AdminApproval from './pages/AdminApproval';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <SocketProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="App">
              <Header />
              <main>
                <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/parking-spaces" element={<ParkingSpaceList />} />
                <Route path="/parking-spaces/:id" element={<ParkingSpaceDetail />} />

                {/* Protected Routes */}
                <Route path="/create-space" element={
                  <PrivateRoute>
                    <CreateParkingSpace />
                  </PrivateRoute>
                } />
                <Route path="/edit-space/:id" element={
                  <PrivateRoute>
                    <EditParkingSpace />
                  </PrivateRoute>
                } />
                <Route path="/my-spaces" element={
                  <PrivateRoute>
                    <MySpaces />
                  </PrivateRoute>
                } />
                <Route path="/my-bookings" element={
                  <PrivateRoute>
                    <MyBookings />
                  </PrivateRoute>
                } />
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                <Route path="/analytics" element={
                  <PrivateRoute>
                    <Analytics />
                  </PrivateRoute>
                } />
                <Route path="/checkout" element={
                  <PrivateRoute>
                    <Checkout />
                  </PrivateRoute>
                } />
                <Route path="/booking-success" element={
                  <PrivateRoute>
                    <BookingSuccess />
                  </PrivateRoute>
                } />
                <Route path="/messages" element={
                  <PrivateRoute>
                    <Messages />
                  </PrivateRoute>
                } />
                <Route path="/messages/:conversationId" element={
                  <PrivateRoute>
                    <Conversation />
                  </PrivateRoute>
                } />
                <Route path="/spaces/:spaceId/availability" element={
                  <PrivateRoute>
                    <ManageAvailability />
                  </PrivateRoute>
                } />
                <Route path="/favorites" element={
                  <PrivateRoute>
                    <Favorites />
                  </PrivateRoute>
                } />
                <Route path="/settings/notifications" element={
                  <PrivateRoute>
                    <NotificationSettings />
                  </PrivateRoute>
                } />
                <Route path="/notification-settings" element={
                  <PrivateRoute>
                    <NotificationSettings />
                  </PrivateRoute>
                } />
                <Route path="/corporate" element={
                  <PrivateRoute>
                    <CorporateDashboard />
                  </PrivateRoute>
                } />
                <Route path="/admin/approval" element={
                  <PrivateRoute>
                    <AdminApproval />
                  </PrivateRoute>
                } />
              </Routes>
            </main>
          </div>
        </Router>
        </SocketProvider>
      </NotificationProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
