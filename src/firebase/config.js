import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCGEVgXe2Kb2w_0tcfRZ6UB-kSlwyb6Z78",
  authDomain: "express-file-d7500.firebaseapp.com",
  databaseURL: "https://express-file-d7500-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "express-file-d7500",
  storageBucket: "express-file-d7500.appspot.com",
  messagingSenderId: "885238472598",
  appId: "1:885238472598:web:c284ae540abeed2aea87b7",
  measurementId: "G-NFGJPSPZ3Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export const database = getDatabase(app);

export default app; 