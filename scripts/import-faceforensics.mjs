#!/usr/bin/env node
/**
 * Import FaceForensics++ clips for Digital Detective.
 *
 * 1. Request dataset: https://github.com/ondyari/FaceForensics (Google form)
 * 2. Download: python download-FaceForensics.py <out> -d all -c c23 -t videos --num_videos 20
 * 3. Run: npm run detective:import-ff++ -- /path/to/FaceForensics++_dataset_root
 *
 * Writes web-ready mp4 + jpg thumbs to public/assets/detective/
 */

import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLIPS_OUT = path.join(ROOT, "public/assets/detective/clips");
const THUMBS_OUT = path.join(ROOT, "public/assets/detective/thumbs");

const FF_TRAIN_PAIRS = [
  ["071", "054"],
  ["087", "081"],
  ["881", "856"],
  ["187", "234"],
  ["645", "688"],
  ["754", "758"],
];

const COMPRESSION = "c23";
const CLIP_SECONDS = 5;
const CLIP_START = 1;

function pad(id) {
  return id.padStart(3, "0");
}

function hasFfmpeg() {
  return spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0;
}

function extractClip(sourcePath, destPath, thumbPath) {
  if (!fs.existsSync(sourcePath)) {
    console.warn(`  skip (missing): ${sourcePath}`);
    return false;
  }

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.mkdirSync(path.dirname(thumbPath), { recursive: true });

  execSync(
    [
      "ffmpeg -y -hide_banner -loglevel error",
      `-ss ${CLIP_START} -t ${CLIP_SECONDS}`,
      `-i "${sourcePath}"`,
      `-vf "scale=720:-2"`,
      `-c:v libx264 -preset fast -crf 23 -an`,
      `"${destPath}"`,
    ].join(" "),
    { stdio: "inherit", shell: true },
  );

  execSync(
    [
      "ffmpeg -y -hide_banner -loglevel error",
      `-ss ${CLIP_START + 1}`,
      `-i "${destPath}"`,
      `-vframes 1 -q:v 2`,
      `"${thumbPath}"`,
    ].join(" "),
    { stdio: "inherit", shell: true },
  );

  console.log(`  ✓ ${path.basename(destPath)}`);
  return true;
}

function ffRoot() {
  const arg = process.argv[2] ?? process.env.FACE_FORENSICS_ROOT;
  if (!arg) {
    console.error(`
Usage: npm run detective:import-ff++ -- /path/to/FaceForensics++_root

Or set FACE_FORENSICS_ROOT.

Get the dataset from https://github.com/ondyari/FaceForensics
(after filling the Google form, run their download-FaceForensics.py script).
`);
    process.exit(1);
  }
  const resolved = path.resolve(arg);
  if (!fs.existsSync(resolved)) {
    console.error(`Path not found: ${resolved}`);
    process.exit(1);
  }
  return resolved;
}

function sourcePath(root, rel) {
  return path.join(root, rel);
}

function main() {
  if (!hasFfmpeg()) {
    console.error("ffmpeg is required. Install with: brew install ffmpeg");
    process.exit(1);
  }

  const root = ffRoot();
  console.log(`FaceForensics++ root: ${root}`);
  console.log(`Output: ${CLIPS_OUT}\n`);

  let ok = 0;
  let skip = 0;

  for (const [source, target] of FF_TRAIN_PAIRS) {
    const s = pad(source);
    const t = pad(target);

    const jobs = [
      {
        src: sourcePath(
          root,
          `original_sequences/youtube/${COMPRESSION}/videos/${s}.mp4`,
        ),
        clip: path.join(CLIPS_OUT, `original-${s}.mp4`),
        thumb: path.join(THUMBS_OUT, `original-${s}.jpg`),
      },
      {
        src: sourcePath(
          root,
          `manipulated_sequences/Deepfakes/${COMPRESSION}/videos/${s}_${t}.mp4`,
        ),
        clip: path.join(CLIPS_OUT, `deepfakes-${s}_${t}.mp4`),
        thumb: path.join(THUMBS_OUT, `deepfakes-${s}_${t}.jpg`),
      },
    ];

    for (const job of jobs) {
      if (extractClip(job.src, job.clip, job.thumb)) ok++;
      else skip++;
    }
  }

  const [s0, t0] = FF_TRAIN_PAIRS[0].map(pad);
  const [s1, t1] = FF_TRAIN_PAIRS[1].map(pad);

  const extra = [
    {
      src: sourcePath(
        root,
        `manipulated_sequences/Face2Face/${COMPRESSION}/videos/${s0}.mp4`,
      ),
      clip: path.join(CLIPS_OUT, `face2face-${s0}.mp4`),
      thumb: path.join(THUMBS_OUT, `face2face-${s0}.jpg`),
    },
    {
      src: sourcePath(
        root,
        `manipulated_sequences/FaceSwap/${COMPRESSION}/videos/${s0}_${t0}.mp4`,
      ),
      clip: path.join(CLIPS_OUT, `faceswap-${s0}_${t0}.mp4`),
      thumb: path.join(THUMBS_OUT, `faceswap-${s0}_${t0}.jpg`),
    },
    {
      src: sourcePath(
        root,
        `manipulated_sequences/NeuralTextures/${COMPRESSION}/videos/${s1}.mp4`,
      ),
      clip: path.join(CLIPS_OUT, `neuraltextures-${s1}.mp4`),
      thumb: path.join(THUMBS_OUT, `neuraltextures-${s1}.jpg`),
    },
  ];

  for (const job of extra) {
    if (extractClip(job.src, job.clip, job.thumb)) ok++;
    else skip++;
  }

  console.log(`\nDone: ${ok} clips imported, ${skip} skipped.`);
  if (ok === 0) {
    console.error(
      "\nNo clips found. Check your FF++ root folder structure matches:\n" +
        "  original_sequences/youtube/c23/videos/071.mp4\n" +
        "  manipulated_sequences/Deepfakes/c23/videos/071_054.mp4",
    );
    process.exit(1);
  }
  console.log("\nRestart the dev server and open /detective — video swipes are live.");
}

main();
