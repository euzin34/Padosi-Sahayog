# Starting the Padoshi Sahayog Application

## Prerequisites

Before running the application, you need to:

1. **Configure Firebase** (See FIREBASE_SETUP.md for details)
2. **Install Dependencies**

## Quick Start

### Step 1: Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Step 2: Configure Firebase

**Frontend Configuration:**
1. Update `frontend/src/config/firebase.js` with your Firebase web app credentials

**Backend Configuration:**
1. Place your `serviceAccountKey.json` in the `backend` folder
2. Create `backend/.env` file (copy from `backend/.env.example`)
3. Update the path in `.env`:
   ```
   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
   PORT=5000
   ```

### Step 3: Start the Backend Server

```bash
cd backend
npm start
```

You should see:
```
✅ Firebase Admin SDK (Auth only) initialized successfully
🚀 Server running on port 5000
```

### Step 4: Start the Frontend (in a new terminal)

```bash
cd frontend
npm start
```

The app will open at `http://localhost:3000`

## Important Notes

⚠️ **The backend MUST be running before you can register/login**

If you see "Failed to fetch" error:
- Make sure the backend server is running on port 5000
- Check that Firebase credentials are properly configured
- Verify the backend console shows "Server running on port 5000"

## Troubleshooting

### "Failed to fetch" Error
- **Cause**: Backend server is not running
- **Solution**: Start the backend server with `npm start` in the backend folder

### Firebase Configuration Error
- **Cause**: Firebase credentials not configured
- **Solution**: Follow FIREBASE_SETUP.md to add your credentials

### Port Already in Use
- **Backend**: Change PORT in `backend/.env`
- **Frontend**: The app will prompt you to use a different port

## Development Workflow

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm start`
3. Open browser to `http://localhost:3000`
4. Register a new account or login

Enjoy building with Padoshi Sahayog! 🎉
