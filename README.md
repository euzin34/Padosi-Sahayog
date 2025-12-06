# Padosi Sahayog 🤝

A community helpline platform that connects neighbors for mutual assistance. This platform enables users to post requests for help (e.g., groceries, medicine, repairs) or offer help to others in their vicinity.

## 🚀 Features

- **Post Requests/Offers**: Users can request help or offer services
- **Geolocation**: Automatically finds and displays requests near you
- **Real-time Map**: Interactive map showing all nearby activities
- **Chat System**: Real-time messaging between requester and helper
- **User Profiles**: Track your contributions and reputation with points and badges
- **Smart Matching**: Connects people based on location and urgency

## 🛠️ tech Stack

- **Frontend**: React.js, Google Maps (or similar visualization), CSS3
- **Backend**: Node.js, Express.js
- **Database**: Firestore (Firebase), In-memory storage (fallback)
- **Authentication**: Firebase Auth

## 🏁 Quick Start

### 1. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 2. Start the Application

You need to run both backend and frontend servers.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

 The app will open at `http://localhost:3000`. The backend runs on `http://localhost:5000`.

## 📱 Usage

1. **Login/Register**: Create an account with your email.
2. **Post**: Click "Post Request" to ask for help or offer assistance.
3. **Explore**: Use the Map or Home page to find nearby requests.
4. **Accept**: Click "Help" or "Accept" on a request to connect.
5. **Chat**: Once accepted, a chat conversation starts automatically.

## ⚠️ Notes

- The application uses in-memory storage fallback if Firebase credentials are not fully configured.
- Tasks and chats persist while the backend server is running.
- Restarting the backend server resets the data in dev mode (unless Firebase is active).
