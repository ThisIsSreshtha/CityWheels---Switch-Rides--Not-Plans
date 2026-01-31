# CityWheels - Quick Start Guide

## 🚀 Getting Started

### Step 1: Install Dependencies

#### Backend Dependencies
Already installed! ✅

#### Frontend Dependencies
```bash
cd client
npm install
```

### Step 2: Configure Environment Variables

The `.env` file has been created with default values. Update these before running:

**Required Updates:**
1. `JWT_SECRET` - Change to a strong random string
2. `MONGO_URI` - Update if using MongoDB Atlas or different local settings

**Optional (for production):**
- Cloudinary credentials (for image uploads)
- Razorpay credentials (for payments)
- Google Maps API key (for navigation)
- Email credentials (for notifications)

### Step 3: Start MongoDB

If using local MongoDB:
```bash
mongod
```

If using MongoDB Atlas, update the `MONGO_URI` in `.env` file.

### Step 4: Run the Application

#### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
npm run dev
```
Server runs on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```
Client runs on: http://localhost:3000

#### Option 2: Run Both Together
```bash
npm run dev:all
```

## 📋 Testing the Application

### 1. Register a User
- Go to http://localhost:3000
- Click "Register"
- Fill in the form
- Login with credentials

### 2. Create Admin User
To create an admin account, you need to manually update a user in MongoDB:

```javascript
// Using MongoDB Compass or mongo shell
db.users.updateOne(
  { email: "admin@citywheels.com" },
  { $set: { role: "admin" } }
)
```

Or register normally and update the role in MongoDB.

### 3. Test Workflows

#### User Workflow:
1. Register → Login
2. Upload documents (Aadhar + License) in Profile
3. Wait for admin verification
4. Browse vehicles
5. Create booking
6. View bookings in dashboard

#### Admin Workflow:
1. Login with admin account
2. View dashboard statistics
3. Verify user documents in "Manage Users"
4. Add vehicles in "Manage Vehicles"
5. Verify and manage bookings
6. View reports

## 🗂️ Sample Data

### Create Sample Vehicles (Admin)

Use the admin panel or MongoDB to add vehicles:

```javascript
{
  "name": "Honda Activa 6G",
  "type": "scooter",
  "category": "non-electric",
  "brand": "Honda",
  "model": "Activa 6G",
  "registrationNumber": "DL01AB1234",
  "specifications": {
    "seatingCapacity": 2,
    "fuelType": "Petrol",
    "mileage": "45 kmpl",
    "color": "Black"
  },
  "pricing": {
    "hourly": 50,
    "daily": 400,
    "weekly": 2500,
    "securityDeposit": 1000
  },
  "location": {
    "city": "Delhi",
    "state": "Delhi",
    "area": "Connaught Place",
    "pickupPoint": {
      "type": "Point",
      "coordinates": [77.2090, 28.6139],
      "address": "CP Metro Station"
    }
  }
}
```

## 🐛 Common Issues

### Issue: MongoDB Connection Error
**Solution:** 
- Ensure MongoDB is running
- Check MONGO_URI in .env
- For Atlas, check network access and credentials

### Issue: JWT Error / Authentication Failed
**Solution:**
- Update JWT_SECRET in .env
- Clear browser local storage
- Re-login

### Issue: File Upload Not Working
**Solution:**
- Ensure `uploads/documents` folder exists
- Check file permissions
- For production, configure Cloudinary

### Issue: CORS Errors
**Solution:**
- Ensure backend is running on port 5000
- Ensure frontend is running on port 3000
- Check proxy setting in client/package.json

## 📝 API Testing

Use Postman or any API client to test endpoints:

### 1. Register User
```
POST http://localhost:5000/api/auth/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123"
}
```

### 2. Login
```
POST http://localhost:5000/api/auth/login
Body: {
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Get Vehicles
```
GET http://localhost:5000/api/vehicles
```

### 4. Create Booking (Requires Auth Token)
```
POST http://localhost:5000/api/bookings
Headers: Authorization: Bearer YOUR_TOKEN
Body: {
  "vehicleId": "VEHICLE_ID",
  "rentalPeriod": "daily",
  "duration": 2,
  "startDate": "2026-02-01",
  "travelPurpose": "tourism",
  "pickupLocation": {...},
  "dropoffLocation": {...}
}
```

## 🔐 Security Notes

1. **Change JWT_SECRET** before deploying to production
2. **Use HTTPS** in production
3. **Enable CORS** properly for your domain
4. **Validate all inputs** on both client and server
5. **Use environment variables** for sensitive data
6. **Never commit .env** file to version control

## 🚀 Deployment

### Backend (Heroku/Railway/Render)
1. Set environment variables
2. Update MongoDB URI to Atlas
3. Configure Cloudinary for file uploads
4. Deploy backend

### Frontend (Vercel/Netlify)
1. Build the React app: `npm run build`
2. Deploy the build folder
3. Update API base URL to backend URL
4. Configure environment variables

## 📚 Next Steps

1. ✅ Set up the database
2. ✅ Create admin user
3. ✅ Add sample vehicles
4. ✅ Test user registration and login
5. ✅ Test booking flow
6. 🔲 Integrate Google Maps
7. 🔲 Add payment gateway
8. 🔲 Set up email notifications

## 💡 Tips

- Use MongoDB Compass for easy database visualization
- Use React DevTools for debugging frontend
- Check browser console for errors
- Monitor backend logs for API errors
- Test on different screen sizes (responsive design)

## 📞 Support

For issues or questions:
- Check the main README.md
- Review API documentation
- Check MongoDB connection
- Verify all dependencies are installed

---

**Happy Coding! 🚲🏍️🚗**
