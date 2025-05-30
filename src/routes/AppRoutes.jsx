import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import EmotionInput from "../pages/EmotionInput";
import EmotionResult from "../pages/EmotionResult";
import WebtoonPage from "../pages/WebtoonPage";
import CustomizationPage from "../pages/CustomizationPage";
import GalleryPage from "../pages/GalleryPage";
import StatsPage from "../pages/StatsPage";
import SignUp from "../pages/Signuppage";


const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/input" element={<EmotionInput />} />
    <Route path="/result" element={<EmotionResult />} />
    <Route path="/webtoon" element={<WebtoonPage />} />
    <Route path="/customize" element={<CustomizationPage />} />
    <Route path="/gallery" element={<GalleryPage />} />
    <Route path="/stats" element={<StatsPage />} />
    <Route path="/SignUp" element={<SignUp />} /> 
  </Routes>
);

export default AppRoutes;
