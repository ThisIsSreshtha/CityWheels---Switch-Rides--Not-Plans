# Environment Configuration Guide

## Overview
This project uses environment variables to manage configuration across different environments (development, staging, production). All sensitive data and environment-specific URLs are stored in `.env` files.

## Setup Instructions

### Backend Configuration
1. Navigate to the `backend` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Update the values in `.env` with your actual configuration

### Frontend Configuration
1. Navigate to the `client` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Update the values in `.env` with your actual configuration

## Environment Variables

### Backend (`backend/.env`)
- **PORT**: Server port (default: 5000)
- **SERVER_URL**: Backend server URL (e.g., http://localhost:5000)
- **MONGO_URI**: MongoDB connection string
- **JWT_SECRET**: Secret key for JWT token generation
- **JWT_EXPIRE**: JWT token expiration time (e.g., 30m, 1h, 7d)
- **CLIENT_URL**: Frontend URL for CORS configuration (default: http://localhost:3000)

### Frontend (`client/.env`)
- **REACT_APP_API_URL**: Backend API URL (default: http://localhost:5000)
- **REACT_APP_CLIENT_URL**: Frontend URL (default: http://localhost:3000)

## Important Notes

### React Environment Variables
- All React environment variables **must** be prefixed with `REACT_APP_`
- Changes to `.env` require restarting the development server
- Environment variables are embedded at build time, not runtime

### Security
- **Never commit `.env` files** to version control
- `.env` files are already included in `.gitignore`
- Use `.env.example` as a template for team members

### Development vs Production

#### Development
```env
REACT_APP_API_URL=http://localhost:5000
```

#### Production
```env
REACT_APP_API_URL=https://api.yourdomain.com
```

## Usage in Code

### Backend
```javascript
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;
```

### Frontend
```javascript
const apiUrl = process.env.REACT_APP_API_URL;
```

### Axios Configuration
The project uses a centralized axios configuration (`client/src/config/axios.js`) that automatically:
- Sets the base URL from environment variables
- Adds authentication headers
- Handles 401 unauthorized responses
- Provides consistent error handling

## Restart Required
After creating or modifying `.env` files, you **must restart** your development servers:

### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
cd client
npm run dev
```

## Troubleshooting

### Environment variables not working?
1. Verify the variable name starts with `REACT_APP_` (for React)
2. Check for typos in variable names
3. Restart the development server
4. Clear browser cache and reload

### API calls failing?
1. Verify `REACT_APP_API_URL` matches your backend URL
2. Check if both frontend and backend servers are running
3. Inspect browser console for CORS errors
4. Verify proxy setting in `client/package.json` matches backend port
