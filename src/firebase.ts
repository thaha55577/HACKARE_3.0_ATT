// Import the functions you need from the Firebase SDKs
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// TODO: Replace the following with your app's Firebase project configuration
// This is the object you will get from the Firebase console.

  const firebaseConfig = {
 apiKey: "AIzaSyAJCy77bqYir0gMlaQNGysS4iMou6XP0pw",
  authDomain: "acm-hackare.firebaseapp.com",
  databaseURL: "https://acm-hackare-default-rtdb.firebaseio.com",
  projectId: "acm-hackare",
  storageBucket: "acm-hackare.firebasestorage.app",
  messagingSenderId: "262713939425",
  appId: "1:262713939425:web:b2aff32935c678bbfceea0",
  measurementId: "G-ZDM2KQP3GP"
};

// Initialize Firebase with your configuration
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and export it so other parts of your app can use it
export const db = getDatabase(app);