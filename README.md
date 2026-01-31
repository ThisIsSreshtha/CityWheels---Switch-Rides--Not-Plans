# CityWheels - Switch Rides, Not Plans

A comprehensive MERN stack vehicle rental platform offering scooters, motorcycles, bicycles, and cars across India with flexible pricing and professional navigation.

## Features

### For Users
- 🚴 **Wide Vehicle Selection**: Scooters, scooty, motorcycles, bicycles, and cars (electric & non-electric)
- 💰 **Flexible Pricing**: Rent by hour, day, or week with location-based pricing
- 📍 **Location-Based**: Find vehicles near you with map integration
- 📄 **Document Verification**: Secure booking with Aadhar card and driving license verification
- 🗺️ **Navigation**: Professional maps for route planning
- ⭐ **Ratings & Reviews**: Rate your rental experience

### For Admins
- 👥 **User Management**: Verify documents, manage user accounts
- 🚗 **Vehicle Management**: Add, edit, delete vehicles and manage availability
- 📊 **Booking Management**: Verify, start, complete, and track all bookings
- 💹 **Reports & Analytics**: Revenue tracking, booking statistics
- ✅ **Verification System**: Document verification workflow

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Multer for file uploads
- Express Validator

### Frontend
- React.js
- React Router for navigation
- Axios for API calls
- React Toastify for notifications
- Context API for state management

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Install backend dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Open `.env` file
   - Update MongoDB URI: `MONGO_URI=mongodb://localhost:27017/citywheels`
   - Update JWT secret: `JWT_SECRET=your_secure_secret_key`
   - Add API keys for Cloudinary, Razorpay, Google Maps (optional)

3. Start MongoDB (if running locally):
```bash
mongod
```

4. Start the backend server:
```bash
npm run dev
```
Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client folder and install dependencies:
```bash
cd client
npm install
```

2. Start the React development server:
```bash
npm start
```
Client will run on `http://localhost:3000`

### Running Both Together

From the root directory:
```bash
npm run install:all  # Install all dependencies
npm run dev:all      # Run both backend and frontend
```

## Project Structure

```
CityWheels/
├── backend/
│   ├── models/           # MongoDB schemas (User, Vehicle, Booking)
│   ├── routes/           # API routes
│   │   ├── authRoutes.js
│   │   ├── vehicleRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── userRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/       # Auth & validation middleware
│   └── server.js         # Express server setup
├── client/
│   ├── public/
│   └── src/
│       ├── components/   # Reusable components
│       ├── context/      # React Context (Auth)
│       ├── pages/        # Page components
│       │   ├── user/     # User dashboard, profile, bookings
│       │   └── admin/    # Admin dashboard, management
│       ├── App.js
│       └── index.js
├── uploads/              # File upload directory
├── .env                  # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Vehicles
- `GET /api/vehicles` - Get all vehicles (with filters)
- `GET /api/vehicles/:id` - Get single vehicle
- `POST /api/vehicles` - Add vehicle (Admin)
- `PUT /api/vehicles/:id` - Update vehicle (Admin)
- `DELETE /api/vehicles/:id` - Delete vehicle (Admin)
- `GET /api/vehicles/nearby/:longitude/:latitude` - Get nearby vehicles

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `PUT /api/bookings/:id/rate` - Rate completed booking

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/documents/aadhar` - Upload Aadhar
- `POST /api/users/documents/license` - Upload license
- `PUT /api/users/change-password` - Change password

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id/verify` - Verify user documents
- `PUT /api/admin/users/:id/toggle-status` - Activate/Deactivate user
- `GET /api/admin/bookings` - Get all bookings
- `PUT /api/admin/bookings/:id/verify` - Verify booking
- `PUT /api/admin/bookings/:id/start` - Start booking
- `PUT /api/admin/bookings/:id/complete` - Complete booking
- `GET /api/admin/reports/revenue` - Revenue reports

## Key Features Implementation

### Document Verification
- Users upload Aadhar card and driving license
- Admin verifies documents before users can book
- System tracks verification status

### Pricing System
- Hourly, daily, and weekly rental rates
- Location-based pricing
- Security deposit
- 18% GST calculation
- Cancellation refund policy (90% >24hrs, 50% >12hrs)

### Booking Flow
1. User selects vehicle and rental period
2. System calculates pricing
3. User provides travel purpose and details
4. Admin verifies booking and documents
5. User picks up vehicle (condition checked)
6. User returns vehicle (condition checked)
7. Final payment and rating

### Security
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (User/Admin)
- Protected routes and API endpoints

## Default Test Accounts

Create admin user manually in MongoDB or through registration and update role to 'admin'.

## Future Enhancements

- [ ] Real-time availability tracking
- [ ] Google Maps integration for navigation
- [ ] Payment gateway integration (Razorpay)
- [ ] Email/SMS notifications
- [ ] Advanced search with filters
- [ ] Vehicle tracking during rental
- [ ] Loyalty program
- [ ] Mobile app (React Native)

## License

ISC

## Support

For support, contact: [Your Email]

---

**CityWheels - Switch Rides, Not Plans** 🚲🏍️🚗
