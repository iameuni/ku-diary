import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import EmotionInput from "./pages/EmotionInput";
import EmotionResult from "./pages/EmotionResult";
import WebtoonPage from "./pages/WebtoonPage";
import GalleryPage from "./pages/GalleryPage";
import StatsPage from "./pages/StatsPage";
import CustomizationPage from "./pages/CustomizationPage";
import CharacterSetUp from "./pages/CharacterSetUp";
import WeeklyViewPage from "./pages/WeeklyViewPage";
import SettingsPage from "./pages/SettingsPage"; // 🆕 추가
import Login from "./pages/LoginPage";
import SignUp from "./pages/SignupPage";
import LayoutWithTab from "./components/LayoutWithTab";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        <Route element={<LayoutWithTab />}>
          <Route path="/input" element={<EmotionInput />} />
          <Route path="/result" element={<EmotionResult />} />
          <Route path="/webtoon" element={<WebtoonPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/custom" element={<CustomizationPage />} />
          <Route path="/character-setup" element={<CharacterSetUp />} />
          <Route path="/weekly" element={<WeeklyViewPage />} />
          <Route path="/settings" element={<SettingsPage />} /> {/* 🆕 추가 */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;