import { Router } from "express";
import {
  runExtensionVerify,
  type ExtensionPlatform,
} from "../services/extensionVerify.js";

const router = Router();

function isValidPlatform(value: unknown): value is ExtensionPlatform {
  return value === "reddit" || value === "discord" || value === "web";
}

function checkApiKey(req: import("express").Request, res: import("express").Response): boolean {
  const configured = process.env.EXTENSION_API_KEY;
  if (!configured || configured === "your_extension_api_key_here") {
    return true;
  }

  const provided = req.header("x-nomaetrust-key");
  if (provided !== configured) {
    res.status(401).json({ error: "Invalid or missing X-NomaeTrust-Key header." });
    return false;
  }
  return true;
}

router.post("/extension/verify", async (req, res) => {
  if (!checkApiKey(req, res)) return;

  try {
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    const url = typeof req.body?.url === "string" ? req.body.url.trim() : undefined;
    const platform = req.body?.platform;

    if (!text && !url) {
      res.status(400).json({ error: "Provide text or url to verify." });
      return;
    }

    if (!isValidPlatform(platform)) {
      res.status(400).json({ error: 'platform must be "reddit", "discord", or "web".' });
      return;
    }

    const result = await runExtensionVerify({ text, url, platform });
    res.json(result);
  } catch (err) {
    console.error("[Extension] verify failed:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Extension verify failed.",
    });
  }
});

export default router;
