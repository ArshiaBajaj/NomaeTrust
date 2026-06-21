// Backend emits JS only; Vercel bundles this at deploy time after `build:all`.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error — no declaration file for compiled backend bundle
import { app } from "../backend/dist/app.js";

/** Allow Whisper + GPT pipelines on Vercel (requires Pro for >10s on some plans). */
export const config = {
  api: {
    bodyParser: false,
    maxDuration: 60,
  },
};

export default app;
