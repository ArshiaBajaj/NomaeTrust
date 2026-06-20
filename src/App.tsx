import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthGuard, IndividualGuard, PlatformGuard } from "./components/auth/PortalGuards";
import AudienceRouteSync from "./components/AudienceRouteSync";
import Footer from "./components/Footer";
import MobileAppShell from "./components/mobile/MobileAppShell";
import Navbar from "./components/Navbar";
import { LEGACY_REDIRECTS, ROUTES } from "./config/navigation";
import { useIsMobile } from "./hooks/useIsMobile";
import AudienceChooser from "./pages/AudienceChooser";
import ContextTrace from "./pages/ContextTrace";
import DetectiveMode from "./pages/DetectiveMode";
import Disclosure from "./pages/Disclosure";
import EntryGate from "./pages/EntryGate";
import Home from "./pages/Home";
import IndividualHome from "./pages/IndividualHome";
import IndividualLogin from "./pages/IndividualLogin";
import NewsWatch from "./pages/NewsWatch";
import PlatformHome from "./pages/PlatformHome";
import PlatformLogin from "./pages/PlatformLogin";
import ScreenshotVerification from "./pages/ScreenshotVerification";
import Settings from "./pages/Settings";
import StressMode from "./pages/StressMode";
import TrustCircleGuard from "./components/TrustCircleGuard";
import TrustCircleLogin from "./pages/TrustCircleLogin";
import TrustMap from "./pages/TrustMap";
import VoiceVerification from "./pages/VoiceVerification";
import CallVerification from "./pages/CallVerification";

function LegacyRedirect({ from }: { from: string }) {
  const target = LEGACY_REDIRECTS[from] ?? ROUTES.landing;
  return <Navigate to={target} replace />;
}

export default function App() {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const immersive = pathname === ROUTES.detective;
  const showDesktopChrome = !isMobile && !immersive;

  return (
    <MobileAppShell>
      <AudienceRouteSync />
      <div className={`min-h-screen ${isMobile ? "mobile-page-bg" : "bg-bg"}`}>
        {showDesktopChrome && <Navbar />}
        <main className={isMobile && !immersive ? "mobile-main-pad" : undefined}>
          <Routes>
            <Route path={ROUTES.landing} element={<EntryGate />} />
            <Route path={ROUTES.choose} element={<AudienceChooser />} />
            <Route path={ROUTES.loginIndividual} element={<IndividualLogin />} />
            <Route path={ROUTES.loginPlatform} element={<PlatformLogin />} />
            <Route
              path={ROUTES.individual}
              element={
                <IndividualGuard>
                  <IndividualHome />
                </IndividualGuard>
              }
            />
            <Route
              path={ROUTES.platform}
              element={
                <PlatformGuard>
                  <PlatformHome />
                </PlatformGuard>
              }
            />
            <Route path={ROUTES.home} element={<Home />} />
            <Route
              path="/app"
              element={<Navigate to={isMobile ? ROUTES.landing : ROUTES.home} replace />}
            />
            <Route
              path={ROUTES.detective}
              element={
                <AuthGuard>
                  <DetectiveMode />
                </AuthGuard>
              }
            />
            <Route
              path="/voice"
              element={
                <AuthGuard>
                  <VoiceVerification />
                </AuthGuard>
              }
            />
            <Route
              path="/call-verification"
              element={
                <AuthGuard>
                  <CallVerification />
                </AuthGuard>
              }
            />
            <Route
              path={ROUTES.screenshots}
              element={
                <AuthGuard>
                  <ScreenshotVerification />
                </AuthGuard>
              }
            />
            <Route
              path={ROUTES.newsWatch}
              element={
                <AuthGuard>
                  <NewsWatch />
                </AuthGuard>
              }
            />
            <Route path="/context-lens" element={<LegacyRedirect from="/context-lens" />} />
            <Route path="/context-trace" element={<LegacyRedirect from="/context-trace" />} />
            <Route
              path={ROUTES.contextTrace}
              element={
                <AuthGuard>
                  <ContextTrace />
                </AuthGuard>
              }
            />
            <Route
              path={ROUTES.actionCards}
              element={
                <AuthGuard>
                  <StressMode />
                </AuthGuard>
              }
            />
            <Route
              path={ROUTES.confusionMap}
              element={
                <AuthGuard>
                  <TrustMap />
                </AuthGuard>
              }
            />
            <Route
              path={ROUTES.settings}
              element={
                <AuthGuard>
                  <Settings />
                </AuthGuard>
              }
            />
            <Route path={ROUTES.disclosure} element={<Disclosure />} />
            <Route path={ROUTES.trustCircleLogin} element={<TrustCircleLogin />} />
            <Route path={ROUTES.trustCircle} element={<TrustCircleGuard />} />
          </Routes>
        </main>
        {showDesktopChrome && <Footer />}
      </div>
    </MobileAppShell>
  );
}
