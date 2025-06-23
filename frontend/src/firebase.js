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

// 🔧 디버깅을 위해 전역에서 접근 가능하도록 설정
window.auth = auth;
window.firebase = { auth };

// 🔍 초기화 확인 로그
console.log("🔥 Firebase 초기화 완료");
console.log("🔐 Auth 객체:", auth);
console.log("🌐 전역 접근: window.auth 사용 가능");