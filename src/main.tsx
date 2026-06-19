import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AppBootProvider } from "./context/AppBootContext";
import { TrustCircleProvider } from "./context/TrustCircleContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppBootProvider>
        <TrustCircleProvider>
          <App />
        </TrustCircleProvider>
      </AppBootProvider>
    </BrowserRouter>
  </StrictMode>,
);
