import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Vehicles from './pages/Vehicles';
import VehicleDetails from './pages/VehicleDetails';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import UserProfile from './pages/user/Profile';
import MyBookings from './pages/user/MyBookings';
import CreateBooking from './pages/user/CreateBooking';
import BookingConfirmation from './pages/user/BookingConfirmation';
import UserDocVerification from './pages/user/DocumentVerification';

// Admin Pages
import AdminHome from './pages/admin/Home';
import AdminProfile from './pages/admin/Profile';
import AdminDocVerification from './pages/admin/DocumentVerification';
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageVehicles from './pages/admin/ManageVehicles';
import ManageBookings from './pages/admin/ManageBookings';
import Reports from './pages/admin/Reports';
import ManageReports from './pages/admin/ManageReports';

// Owner Pages
import OwnerDashboard from './pages/owner/Dashboard';
import OwnerMyRentals from './pages/owner/MyRentals';
import OwnerDocuments from './pages/owner/DocumentVerification';
import OwnerProfile from './pages/owner/Profile';
import OwnerReports from './pages/owner/Reports';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import OwnerRoute from './components/OwnerRoute';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <Navbar />
          <ToastContainer position="top-right" autoClose={3000} />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/vehicles/:id" element={<VehicleDetails />} />

            {/* User Routes */}
            <Route path="/user/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
            <Route path="/user/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
            <Route path="/user/bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
            <Route path="/user/book/:vehicleId" element={<PrivateRoute><CreateBooking /></PrivateRoute>} />
            <Route path="/user/booking-confirmation/:bookingId" element={<PrivateRoute><BookingConfirmation /></PrivateRoute>} />
            <Route path="/user/verify-documents" element={<PrivateRoute><UserDocVerification /></PrivateRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/home" element={<AdminRoute><AdminHome /></AdminRoute>} />
            <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
            <Route path="/admin/document-verification" element={<AdminRoute><AdminDocVerification /></AdminRoute>} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
            <Route path="/admin/vehicles" element={<AdminRoute><ManageVehicles /></AdminRoute>} />
            <Route path="/admin/bookings" element={<AdminRoute><ManageBookings /></AdminRoute>} />
            <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />
            <Route path="/admin/owner-reports" element={<AdminRoute><ManageReports /></AdminRoute>} />

            {/* Owner Routes */}
            <Route path="/owner/dashboard" element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
            <Route path="/owner/rentals" element={<OwnerRoute><OwnerMyRentals /></OwnerRoute>} />
            <Route path="/owner/documents" element={<OwnerRoute><OwnerDocuments /></OwnerRoute>} />
            <Route path="/owner/profile" element={<OwnerRoute><OwnerProfile /></OwnerRoute>} />
            <Route path="/owner/reports" element={<OwnerRoute><OwnerReports /></OwnerRoute>} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
