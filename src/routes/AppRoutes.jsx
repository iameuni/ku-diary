import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import EmotionInput from "../pages/EmotionInput";
import EmotionResult from "../pages/EmotionResult";
import WebtoonPage from "../pages/WebtoonPage";
import CustomizationPage from "../pages/CustomizationPage";
import GalleryPage from "../pages/GalleryPage";
import StatsPage from "../pages/StatsPage";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/input" element={<EmotionInput />} />
    <Route path="/result" element={<EmotionResult />} />
    <Route path="/webtoon" element={<WebtoonPage />} />
    <Route path="/customize" element={<CustomizationPage />} />
    <Route path="/gallery" element={<GalleryPage />} />
    <Route path="/stats" element={<StatsPage />} />
  </Routes>
);

export default AppRoutes;
