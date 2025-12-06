# ⚠️ FIREBASE SETUP REQUIRED

## Quick Fix for "Firebase: Error (auth/api-key-not-valid)" 

You're seeing this error because Firebase credentials haven't been configured yet.

### Option 1: Get Firebase Credentials (5 minutes)

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Create a new project** (or select existing):
   - Project name: "Padosi Sahayog"
   - Disable Google Analytics (optional)
   - Click "Create Project"

3. **Add a Web App**:
   - Click the **Web icon** (</>)
   - App nickname: "Padosi Sahayog Web"
   - Click "Register app"

4. **Copy the config**:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",  // Copy this
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

5. **Enable Email/Password Authentication**:
   - In Firebase Console, go to **Authentication** > **Sign-in method**
   - Click **Email/Password**
   - Enable it and click **Save**

6. **Update the config file**:
   - Open `frontend/src/config/firebase.js`
   - Replace the placeholder values with your actual config

7. **Restart the frontend**:
   ```bash
   # Stop the current server (Ctrl+C)
   npm start
   ```

### Option 2: Skip Auth for Now (Temporary)

If you want to test the UI without authentication:

1. Open `frontend/src/App.js`
2. Find this line (around line 35):
   ```javascript
   if (!currentUser) {
     return <Auth onAuthSuccess={() => setActiveTab('home')} />;
   }
   ```
3. Comment it out:
   ```javascript
   // if (!currentUser) {
   //   return <Auth onAuthSuccess={() => setActiveTab('home')} />;
   // }
   ```
4. Save and the app will load without requiring login

---

## Backend Setup (For Full Functionality)

The backend also needs Firebase Admin SDK:

1. **Get Service Account Key**:
   - Firebase Console > Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save as `backend/serviceAccountKey.json`

2. **Create backend/.env**:
   ```
   PORT=5000
   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
   GEOCODING_API_URL=https://nominatim.openstreetmap.org/reverse
   GEOCODING_USER_AGENT=PadosiSahayog/1.0
   ```

3. **Start backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```

---

## Need Help?

Check `GETTING_STARTED.md` for complete setup instructions.
