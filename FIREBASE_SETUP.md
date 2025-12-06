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

Open `frontend/src/config/firebase.js` and replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

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
- Never commit your `serviceAccountKey.json` file
- Users will be prompted for location access on login (optional)
