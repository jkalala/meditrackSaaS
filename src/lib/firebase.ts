import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "maditrack",
  appId: "1:34499896350:web:15293bb56ee810a80a3a0f",
  storageBucket: "maditrack.firebasestorage.app",
  apiKey: "AIzaSyDZUzJPbG0Nvr5nLK8vH0t0FBev09ZoU3o",
  authDomain: "maditrack.firebaseapp.com",
  messagingSenderId: "34499896350"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth }; 