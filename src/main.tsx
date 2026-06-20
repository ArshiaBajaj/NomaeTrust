import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AppBootProvider } from "./context/AppBootContext";
import { AudienceProvider } from "./context/AudienceContext";
import { PortalAuthProvider } from "./context/PortalAuthContext";
import { TrustCircleProvider } from "./context/TrustCircleContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppBootProvider>
        <AudienceProvider>
          <PortalAuthProvider>
            <TrustCircleProvider>
              <App />
            </TrustCircleProvider>
          </PortalAuthProvider>
        </AudienceProvider>
      </AppBootProvider>
    </BrowserRouter>
  </StrictMode>,
);
