#!/usr/bin/env node
/**
 * Re-encode detective clips to H.264 for browser playback (Safari/Chrome require avc1, not mp4v).
 *   npm run detective:transcode-clips
 */

import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const CLIPS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../public/assets/detective/clips",
);

function ffmpegBin() {
  if (ffmpegPath) return ffmpegPath;
  const sys = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  if (sys.status === 0) return "ffmpeg";
  return null;
}

function hasFfmpeg() {
  return Boolean(ffmpegBin());
}

function transcode(filePath) {
  const bin = ffmpegBin();
  if (!bin) throw new Error("ffmpeg not available");
  const tmp = `${filePath}.h264.tmp.mp4`;
  execSync(
    [
      `"${bin}" -y -hide_banner -loglevel error`,
      `-i "${filePath}"`,
      `-c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -an`,
      `-movflags +faststart`,
      `"${tmp}"`,
    ].join(" "),
    { stdio: "inherit", shell: true },
  );
  fs.renameSync(tmp, filePath);
}

function main() {
  if (!hasFfmpeg()) {
    console.error("ffmpeg required. Install: brew install ffmpeg");
    process.exit(1);
  }

  const files = fs.readdirSync(CLIPS_DIR).filter((f) => f.endsWith(".mp4"));
  if (files.length === 0) {
    console.error("No clips in public/assets/detective/clips — run npm run detective:import-sdfvd first");
    process.exit(1);
  }

  console.log(`Transcoding ${files.length} clips to H.264 (browser-safe)…\n`);
  for (const file of files) {
    process.stdout.write(`  ${file}… `);
    transcode(path.join(CLIPS_DIR, file));
    console.log("✓");
  }
  console.log("\nDone — hard refresh /detective");
}

main();
