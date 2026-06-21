/**
 * API base URL for all frontend services.
 * - Local dev: leave unset — Vite proxies /api to localhost:3001
 * - Vercel production: leave unset — vercel.json rewrites /api to the backend
 * - Direct backend: set VITE_API_URL=https://your-api.example.com
 */
export const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
