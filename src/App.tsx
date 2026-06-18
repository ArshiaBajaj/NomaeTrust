import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import TrustCircleGuard from "./components/TrustCircleGuard";
import Disclosure from "./pages/Disclosure";
import ContextLens from "./pages/ContextLens";
import Home from "./pages/Home";
import ScreenshotVerification from "./pages/ScreenshotVerification";
import StressMode from "./pages/StressMode";
import TrustCircleLogin from "./pages/TrustCircleLogin";
import TrustMap from "./pages/TrustMap";
import VoiceVerification from "./pages/VoiceVerification";

export default function App() {
  const { pathname } = useLocation();
  const isTrustCircleLogin = pathname === "/trust-circle/login";
  const isContextLens = pathname === "/context-lens";
  const hideChrome = isTrustCircleLogin || isContextLens;

  return (
    <div className="min-h-screen bg-bg">
      {!hideChrome && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/voice" element={<VoiceVerification />} />
          <Route path="/screenshot" element={<ScreenshotVerification />} />
          <Route path="/context-lens" element={<ContextLens />} />
          <Route path="/call" element={<TrustCircleGuard />} />
          <Route path="/trust-circle/login" element={<TrustCircleLogin />} />
          <Route path="/stress" element={<StressMode />} />
          <Route path="/trust-map" element={<TrustMap />} />
          <Route path="/disclosure" element={<Disclosure />} />
        </Routes>
      </main>
      {!hideChrome && <Footer />}
    </div>
  );
}
