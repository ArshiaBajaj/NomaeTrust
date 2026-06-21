import { app } from "./app.js";

const PORT = Number(process.env.PORT) || 3001;

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
