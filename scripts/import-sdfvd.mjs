#!/usr/bin/env node
/**
 * Download SDFVD deepfake clips from Hugging Face — no form, ~15MB for 10 pairs.
 *
 *   npm run detective:import-sdfvd
 *
 * Dataset: https://huggingface.co/datasets/Hemgg/SDFVD-video-dataset (CC-BY-4.0)
 */

import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLIPS_OUT = path.join(ROOT, "public/assets/detective/clips");
const THUMBS_OUT = path.join(ROOT, "public/assets/detective/thumbs");

const HF_REPO = "Hemgg/SDFVD-video-dataset";
const PAIR_IDS = ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"];
const LIMIT = Number(process.argv[2]) || 10;

function hfUrl(folder, pairId) {
  const num = pairId.replace(/^v/, "");
  const fileId = folder === "Fake" ? `vs${num}` : pairId;
  return `https://huggingface.co/datasets/${HF_REPO}/resolve/main/${folder}/${fileId}.mp4`;
}

function ffmpegBin() {
  if (ffmpegPath) return ffmpegPath;
  return spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0 ? "ffmpeg" : null;
}

function hasFfmpeg() {
  return Boolean(ffmpegBin());
}

async function download(url, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const raw = dest.replace(/\.mp4$/, ".raw.mp4");
  fs.writeFileSync(raw, buf);
  transcodeToH264(raw, dest);
  fs.unlinkSync(raw);
}

function transcodeToH264(input, output) {
  const bin = ffmpegBin();
  if (!bin) {
    fs.copyFileSync(input, output);
    return;
  }
  execSync(
    [
      `"${bin}" -y -hide_banner -loglevel error`,
      `-i "${input}"`,
      `-c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -an -movflags +faststart`,
      `"${output}"`,
    ].join(" "),
    { stdio: "ignore", shell: true },
  );
}

function makeThumb(videoPath, thumbPath) {
  if (!hasFfmpeg()) return;
  fs.mkdirSync(path.dirname(thumbPath), { recursive: true });
  execSync(
    `ffmpeg -y -hide_banner -loglevel error -ss 1 -i "${videoPath}" -vframes 1 -q:v 2 "${thumbPath}"`,
    { stdio: "ignore", shell: true },
  );
}

async function main() {
  console.log(`Downloading SDFVD clips (${Math.min(LIMIT, PAIR_IDS.length)} pairs)…\n`);

  let ok = 0;
  for (const pairId of PAIR_IDS.slice(0, LIMIT)) {
    const jobs = [
      {
        url: hfUrl("Real", pairId),
        clip: path.join(CLIPS_OUT, `sdfvd-real-${pairId}.mp4`),
        thumb: path.join(THUMBS_OUT, `sdfvd-real-${pairId}.jpg`),
      },
      {
        url: hfUrl("Fake", pairId),
        clip: path.join(CLIPS_OUT, `sdfvd-fake-${pairId}.mp4`),
        thumb: path.join(THUMBS_OUT, `sdfvd-fake-${pairId}.jpg`),
      },
    ];

    for (const job of jobs) {
      try {
        process.stdout.write(`  ${path.basename(job.clip)}… `);
        await download(job.url, job.clip);
        makeThumb(job.clip, job.thumb);
        console.log("✓");
        ok++;
      } catch (err) {
        console.log(`✗ (${err instanceof Error ? err.message : err})`);
      }
    }
  }

  console.log(`\nDone: ${ok} clips in public/assets/detective/clips/`);
  if (ok === 0) {
    console.error("Download failed — check your network connection.");
    process.exit(1);
  }
  console.log("Restart dev server and open /detective for real video swipes.");
}

main();
