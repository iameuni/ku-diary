// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBuGuhMEywc2uCS2RUSuh-PlBoLMvXFLXQ",
  authDomain: "dariy-8cb5c.firebaseapp.com",
  projectId: "dariy-8cb5c",
  storageBucket: "dariy-8cb5c.firebasestorage.app",
  messagingSenderId: "303050320502",
  appId: "1:303050320502:web:95a9e4fe96fc2230930d57",
  measurementId: "G-X8YSCMB3EQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);