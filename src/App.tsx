import { Navigate, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ContextTrace from "./pages/ContextTrace";
import Disclosure from "./pages/Disclosure";
import Home from "./pages/Home";
import ScreenshotVerification from "./pages/ScreenshotVerification";
import StressMode from "./pages/StressMode";
import TrustMap from "./pages/TrustMap";
import VoiceVerification from "./pages/VoiceVerification";

export default function App() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/voice" element={<VoiceVerification />} />
          <Route path="/screenshot" element={<ScreenshotVerification />} />
          <Route path="/context-lens" element={<Navigate to="/call" replace />} />
          <Route path="/call" element={<ContextTrace />} />
          <Route path="/context-trace" element={<ContextTrace />} />
          <Route path="/stress" element={<StressMode />} />
          <Route path="/trust-map" element={<TrustMap />} />
          <Route path="/disclosure" element={<Disclosure />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
