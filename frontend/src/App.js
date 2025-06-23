import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Home from "./pages/Home";
import EmotionInput from "./pages/EmotionInput";
import EmotionResult from "./pages/EmotionResult";
import WebtoonPage from "./pages/WebtoonPage";
import GalleryPage from "./pages/GalleryPage";
import StatsPage from "./pages/StatsPage";
import CustomizationPage from "./pages/CustomizationPage";
import CharacterSetUp from "./pages/CharacterSetUp";
import WeeklyViewPage from "./pages/WeeklyViewPage";
import SettingsPage from "./pages/SettingsPage";
import Login from "./pages/LoginPage";
import SignUp from "./pages/SignupPage";
import LayoutWithTab from "./components/LayoutWithTab";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Firebase 인증 상태 리스너 추가
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("🔐 Firebase 인증 상태 변경:", user ? "로그인됨" : "로그아웃됨");
      
      setCurrentUser(user);
      
      if (user) {
        // 로그인 상태: localStorage에 userId 저장
        localStorage.setItem("userId", user.uid);
        console.log("✅ userId localStorage에 저장:", user.uid);
      } else {
        // 로그아웃 상태: localStorage에서 userId 제거
        localStorage.removeItem("userId");
        console.log("🗑️ userId localStorage에서 제거");
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 로딩 중일 때 표시할 화면
  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "18px",
        color: "#666"
      }}>
        <div>
          <div style={{ fontSize: "48px", marginBottom: "20px", textAlign: "center" }}>🔄</div>
          <div>앱을 준비하고 있어요...</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* 🔧 로그인/회원가입만 LayoutWithTab 밖에 */}
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        {/* 🔧 홈을 포함한 모든 메인 페이지는 LayoutWithTab 안에 */}
        <Route element={<LayoutWithTab />}>
          <Route path="/" element={<Home />} />
          <Route path="/input" element={<EmotionInput />} />
          <Route path="/result" element={<EmotionResult />} />
          <Route path="/webtoon" element={<WebtoonPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/custom" element={<CustomizationPage />} />
          <Route path="/character-setup" element={<CharacterSetUp />} />
          <Route path="/weekly" element={<WeeklyViewPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;