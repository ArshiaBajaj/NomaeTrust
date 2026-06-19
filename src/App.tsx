import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import MobileAppShell from "./components/mobile/MobileAppShell";
import Navbar from "./components/Navbar";
import { useIsMobile } from "./hooks/useIsMobile";
import ContextTrace from "./pages/ContextTrace";
import DetectiveMode from "./pages/DetectiveMode";
import Disclosure from "./pages/Disclosure";
import Home from "./pages/Home";
import MobileEntry from "./pages/MobileEntry";
import ScreenshotVerification from "./pages/ScreenshotVerification";
import StressMode from "./pages/StressMode";
import TrustMap from "./pages/TrustMap";
import VoiceVerification from "./pages/VoiceVerification";

export default function App() {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const immersive = pathname === "/detective";
  const showDesktopChrome = !isMobile && !immersive;

  return (
    <MobileAppShell>
      <div className={`min-h-screen ${isMobile ? "mobile-page-bg" : "bg-bg"}`}>
        {showDesktopChrome && <Navbar />}
        <main className={isMobile && !immersive ? "mobile-main-pad" : undefined}>
          <Routes>
            <Route path="/" element={<MobileEntry />} />
            <Route path="/home" element={<Home />} />
            <Route
              path="/app"
              element={<Navigate to={isMobile ? "/detective" : "/"} replace />}
            />
            <Route path="/detective" element={<DetectiveMode />} />
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
        {showDesktopChrome && <Footer />}
      </div>
    </MobileAppShell>
  );
}
