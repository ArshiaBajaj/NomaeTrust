import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/mobile/MobileAppShell";
import ContextTrace from "./pages/ContextTrace";
import DetectiveMode from "./pages/DetectiveMode";
import Disclosure from "./pages/Disclosure";
import HomeHub from "./pages/MobileHome";
import ScreenshotVerification from "./pages/ScreenshotVerification";
import Settings from "./pages/Settings";
import StressMode from "./pages/StressMode";
import TrustMap from "./pages/TrustMap";

/**
 * Single responsive mobile-first app. Every route renders inside one shell;
 * the legacy desktop/mobile fork has been retired.
 */
export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomeHub />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/app" element={<Navigate to="/" replace />} />
        <Route path="/detective" element={<DetectiveMode />} />
        <Route path="/voice" element={<Navigate to="/stress" replace />} />
        <Route path="/stress" element={<StressMode />} />
        <Route path="/screenshot" element={<ScreenshotVerification />} />
        <Route path="/call" element={<ContextTrace />} />
        <Route path="/context-trace" element={<ContextTrace />} />
        <Route path="/context-lens" element={<Navigate to="/call" replace />} />
        <Route path="/trust-map" element={<TrustMap />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/disclosure" element={<Disclosure />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
