import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import analyzeRouter from "./routes/analyze.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:4173",
      "http://127.0.0.1:4173",
    ],
    methods: ["GET", "POST", "OPTIONS"],
  }),
);

app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[API] --> ${req.method} ${req.originalUrl}`);
  res.on("finish", () => {
    console.log(
      `[API] <-- ${req.method} ${req.originalUrl} ${res.statusCode} (${Date.now() - start}ms)`,
    );
  });
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", port: PORT });
});

app.use("/api", analyzeRouter);

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
  console.log(`[API] POST http://localhost:${PORT}/api/analyze-audio`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `[Server] Port ${PORT} is already in use. Stop the other process or change PORT in backend/.env`,
    );
    process.exit(1);
  }
  console.error("[Server] Failed to start:", err);
  process.exit(1);
});
