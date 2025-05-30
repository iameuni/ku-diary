import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import EmotionInput from "./pages/EmotionInput";
import EmotionResult from "./pages/EmotionResult";
import WebtoonPage from "./pages/WebtoonPage";
import GalleryPage from "./pages/GalleryPage";
import StatsPage from "./pages/StatsPage";
import CustomizationPage from "./pages/CustomizationPage";
import CharacterSetUp from "./pages/CharacterSetUp";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/input" element={<EmotionInput />} />
        <Route path="/emotion-result" element={<EmotionResult />} />
        <Route path="/webtoon" element={<WebtoonPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/custom" element={<CustomizationPage />} />
        <Route path="/character-setup" element={<CharacterSetUp />} />
        <Route path="/result" element={<EmotionResult />} />
      </Routes>
    </Router>
  );
}

export default App;