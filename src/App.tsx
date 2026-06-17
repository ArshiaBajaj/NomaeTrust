import { Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import CallVerification from "./pages/CallVerification";
import Home from "./pages/Home";
import ScreenshotVerification from "./pages/ScreenshotVerification";
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
          <Route path="/call" element={<CallVerification />} />
          <Route path="/trust-map" element={<TrustMap />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
