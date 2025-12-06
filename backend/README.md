# Padosi Sahayog Backend

A complete Node.js/Express backend with Firebase Authentication, Firestore database, and location-based task finding features.

## Features

- 🔐 **Firebase Authentication**: User registration, login, and profile management
- 📍 **Location Tracking**: Automatic location capture on user login
- 📝 **Task Management**: Create, read, update, and delete task listings
- 🗺️ **Nearby Tasks Finder**: Find tasks sorted by distance using Haversine formula
- 🌍 **Geocoding**: Convert coordinates to human-readable addresses using OpenStreetMap
- 📄 **Pagination**: Efficient data loading with pagination support
- 🏷️ **Category Filtering**: Filter tasks by category

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Firebase Firestore
- **Authentication**: Firebase Admin SDK
- **Geolocation**: geolib (Haversine formula)
- **Geocoding**: OpenStreetMap Nominatim API
- **Validation**: express-validator

## Project Structure

```
backend/
├── config/
│   └── firebase.js          # Firebase Admin SDK configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── taskController.js    # Task CRUD operations
│   └── nearbyController.js  # Location-based task finding
├── middleware/
│   ├── auth.js             # JWT token verification
│   ├── validation.js       # Request validation
│   └── errorHandler.js     # Error handling
├── routes/
│   ├── auth.js             # Auth endpoints
│   ├── tasks.js            # Task endpoints
│   └── nearby.js           # Nearby tasks endpoint
├── utils/
│   ├── distance.js         # Distance calculation (Haversine)
│   └── geocoding.js        # Reverse geocoding
├── .env.example            # Environment variables template
├── .gitignore
├── package.json
└── server.js               # Main application entry point
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file as `serviceAccountKey.json` in the `backend` folder

### 3. Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
PORT=5000
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
GEOCODING_API_URL=https://nominatim.openstreetmap.org/reverse
GEOCODING_USER_AGENT=PadosiSahayog/1.0
```

### 4. Start the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe",
  "phoneNumber": "+1234567890"
}
```

#### Login (with location)
```http
POST /api/auth/login
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "latitude": 27.7172,
  "longitude": 85.3240
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <firebase-id-token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "displayName": "Jane Doe",
  "location": {
    "latitude": 27.7172,
    "longitude": 85.3240
  }
}
```

### Tasks

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "title": "Help with groceries",
  "description": "Need help carrying groceries from store",
  "location": {
    "latitude": 27.7180,
    "longitude": 85.3250
  },
  "category": "shopping"
}
```

#### Get All Tasks
```http
GET /api/tasks?page=1&limit=10&category=shopping&status=active
```

#### Get Task by ID
```http
GET /api/tasks/:id
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "title": "Updated title",
  "status": "completed"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <firebase-id-token>
```

### Nearby Tasks

#### Find Nearby Tasks
```http
GET /api/tasks/nearby?latitude=27.7172&longitude=85.3240&limit=10&page=1&category=shopping&unit=km
```

**Query Parameters:**
- `latitude` (required): User's latitude
- `longitude` (required): User's longitude
- `limit` (optional): Number of results per page (default: 10, max: 100)
- `page` (optional): Page number (default: 1)
- `category` (optional): Filter by category
- `unit` (optional): Distance unit - 'km' or 'm' (default: 'km')

**Response:**
```json
{
  "success": true,
  "data": {
    "userLocation": {
      "latitude": 27.7172,
      "longitude": 85.3240
    },
    "tasks": [
      {
        "id": "task123",
        "title": "Help with groceries",
        "description": "Need help carrying groceries",
        "location": {
          "latitude": 27.7180,
          "longitude": 85.3250
        },
        "distance": 0.12,
        "distanceUnit": "km",
        "placeName": "Thamel, Kathmandu, Bagmati, Nepal",
        "category": "shopping",
        "status": "active"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

## How It Works

### Distance Calculation

The backend uses the **Haversine formula** (via `geolib` library) to calculate accurate distances between GPS coordinates, accounting for Earth's curvature.

### Geocoding

The system uses **OpenStreetMap Nominatim API** for reverse geocoding:
- Converts latitude/longitude to human-readable addresses
- Built-in caching to reduce API calls
- Rate limiting (1.1 second delay) to respect API limits
- Fallback to coordinates if API fails

### Location Tracking

When users log in:
1. Frontend captures user's GPS location
2. Sends location to backend with login request
3. Backend stores location in Firestore user profile
4. Location is used for finding nearby tasks

## Testing

Use **Postman**, **Thunder Client**, or **curl** to test endpoints.

### Example: Test Nearby Tasks

```bash
curl "http://localhost:5000/api/tasks/nearby?latitude=27.7172&longitude=85.3240&limit=5"
```

## Important Notes

⚠️ **Firebase Service Account**: Never commit `serviceAccountKey.json` to version control

⚠️ **OpenStreetMap API**: Free tier has rate limits (1 request/second). For production, consider upgrading to a paid geocoding service.

⚠️ **CORS**: The backend allows all origins by default. Configure CORS properly for production.

## License

ISC
