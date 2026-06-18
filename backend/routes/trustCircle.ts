import { Router } from "express";
import {
  createFamily,
  getMeFromToken,
  joinFamily,
  leaveSession,
} from "../store/trustCircleStore.js";

const router = Router();

function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim() || null;
}

router.post("/trust-circle/create", (req, res) => {
  const { familyName, displayName } = req.body as {
    familyName?: string;
    displayName?: string;
  };

  if (!familyName?.trim() || !displayName?.trim()) {
    res.status(400).json({ error: "familyName and displayName are required" });
    return;
  }

  const { session, me } = createFamily(familyName, displayName);
  res.status(201).json({
    sessionToken: session.token,
    expiresAt: session.expiresAt,
    ...me,
  });
});

router.post("/trust-circle/join", (req, res) => {
  const { inviteCode, displayName } = req.body as {
    inviteCode?: string;
    displayName?: string;
  };

  if (!inviteCode?.trim() || !displayName?.trim()) {
    res.status(400).json({ error: "inviteCode and displayName are required" });
    return;
  }

  const result = joinFamily(inviteCode, displayName);
  if (!result) {
    res.status(404).json({ error: "Invalid invite code. Check and try again." });
    return;
  }

  res.status(201).json({
    sessionToken: result.session.token,
    expiresAt: result.session.expiresAt,
    ...result.me,
  });
});

router.get("/trust-circle/me", (req, res) => {
  const token = extractToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: "Missing session token" });
    return;
  }

  const me = getMeFromToken(token);
  if (!me) {
    res.status(401).json({ error: "Invalid or expired session" });
    return;
  }

  res.json(me);
});

router.post("/trust-circle/leave", (req, res) => {
  const token = extractToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: "Missing session token" });
    return;
  }

  leaveSession(token);
  res.json({ ok: true });
});

export { extractToken };
export default router;
