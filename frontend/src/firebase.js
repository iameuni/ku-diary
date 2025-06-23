// frontend/src/firebase.js - 새 Firebase 프로젝트 완전한 설정
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// 🔥 새 Firebase 프로젝트 설정
const firebaseConfig = {
  apiKey: "AIzaSyDRC_xi6MgAxnA48i-MxSyDo4xZZ2IIPFI",
  authDomain: "ku-diary.firebaseapp.com",
  projectId: "ku-diary",
  storageBucket: "ku-diary.firebasestorage.app",
  messagingSenderId: "272723580660",
  appId: "1:272723580660:web:2526320e9bf2560e4970a1",
  measurementId: "G-0JYN4HBCLT"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 🔥 서비스 export (Auth + Firestore)
export const auth = getAuth(app);
export const db = getFirestore(app);

// 🔧 전역 접근 설정 (디버깅용)
window.auth = auth;
window.firebase = { auth, db };

// 🎉 초기화 완료 로그
console.log("🔥 새 Firebase 프로젝트 초기화 완료!");
console.log("📋 프로젝트 ID:", firebaseConfig.projectId);
console.log("🔐 Auth 객체:", auth);
console.log("🔥 Firestore 객체:", db);
console.log("📊 Analytics:", analytics);
console.log("🌐 전역 접근: window.auth, window.firebase 사용 가능");

// 🔍 연결 상태 확인
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("✅ 사용자 로그인됨:", user.uid);
  } else {
    console.log("❌ 사용자 로그아웃 상태");
  }
});