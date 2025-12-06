import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../config/firebase';

// Check if Firebase config is valid (not placeholder values)
const isValidConfig = firebaseConfig.apiKey && 
                      !firebaseConfig.apiKey.includes('YOUR_') && 
                      !firebaseConfig.apiKey.includes('Dummy');

let app = null;
let auth = null;

if (isValidConfig) {
  // Initialize Firebase only if config is valid
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} else {
  console.warn('⚠️ Firebase not configured. Please add your Firebase credentials to src/config/firebase.js');
}

export { auth };
export default app;
