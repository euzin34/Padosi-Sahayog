# Padoshi Sahayog - Authentication Setup

## Firebase Configuration

To enable authentication, you need to configure Firebase credentials.

### Step 1: Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to **Project Settings** (gear icon) > **General**
4. Scroll down to **Your apps** section
5. Click on the **Web app** (</>) icon
6. Copy the `firebaseConfig` object

### Step 2: Update Frontend Configuration

Create a `.env` file in the `frontend` directory (copy from `.env.example`) and add your actual Firebase configuration:

```bash
cd frontend
cp .env.example .env
```

Then edit the `.env` file and replace the placeholder values with your actual Firebase configuration:

```env
# Backend Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=YOUR_ACTUAL_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID=YOUR_APP_ID
```

> **Note**: The `.env` file is gitignored for security. Never commit your Firebase credentials to version control.

### Step 3: Backend Firebase Admin Setup

1. In Firebase Console, go to **Project Settings** > **Service Accounts**
2. Click **Generate New Private Key**
3. Save the JSON file as `serviceAccountKey.json` in the `backend` folder
4. Create a `.env` file in the `backend` folder (copy from `.env.example`)
5. Update the path in `.env`:
   ```
   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
   ```

### Step 4: Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### Step 5: Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

The application will now require users to login or register before accessing the platform!

## Features

- ✅ User Registration with email/password
- ✅ User Login with automatic location capture
- ✅ Firebase Authentication integration
- ✅ Protected routes (users must be authenticated)
- ✅ Automatic token management
- ✅ Profile management

## Notes

- The `.env` file is gitignored for security
- Never commit your `.env` file or `serviceAccountKey.json` file
- Users will be prompted for location access on login (optional)
- Make sure to restart the frontend development server after creating/updating the `.env` file
