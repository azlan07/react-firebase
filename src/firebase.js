// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
const database = getDatabase(app);
const storage = getStorage(app);

export { app, database, storage };