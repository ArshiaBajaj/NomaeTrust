import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import analyzeRouter from "./routes/analyze.js";
import callRouter from "./routes/call.js";
import mapRouter from "./routes/map.js";
import contextTraceRouter from "./routes/contextTrace.js";
import detectiveRouter from "./routes/detective.js";
import trustCircleRouter from "./routes/trustCircle.js";
import newsWatchRouter from "./routes/newsWatch.js";
import extensionRouter from "./routes/extension.js";
import platformRouter from "./routes/platform.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const corsOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5176",
  "http://127.0.0.1:5176",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

if (process.env.FRONTEND_BASE_URL) {
  corsOrigins.push(process.env.FRONTEND_BASE_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (
        corsOrigins.includes(origin) ||
        origin.startsWith("chrome-extension://")
      ) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-NomaeTrust-Key"],
  }),
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", port: PORT });
});

app.use("/api", analyzeRouter);
app.use("/api", callRouter);
app.use("/api", mapRouter);
app.use("/api", contextTraceRouter);
app.use("/api", detectiveRouter);
app.use("/api", trustCircleRouter);
app.use("/api", newsWatchRouter);
app.use("/api", extensionRouter);
app.use("/api", platformRouter);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("[API] Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  },
);

const server = app.listen(PORT, () => {
  console.log(`NomaeTrust backend running on http://localhost:${PORT}`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`[Server] Port ${PORT} is already in use.`);
    process.exit(1);
  }
  console.error("[Server] Failed to start:", err);
  process.exit(1);
});
