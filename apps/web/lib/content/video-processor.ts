import { randomUUID } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import type ffmpeg from "fluent-ffmpeg";

export type VideoProcessResult = {
  audioBuffer: Buffer;
  frames: Buffer[];
  durationSeconds: number;
};

type FfmpegModule = typeof ffmpeg;

async function loadFfmpeg(): Promise<FfmpegModule> {
  // Dynamic require evita que webpack bundlee ffprobe/linux-x64 en páginas de marketing.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ffmpegLib = require("fluent-ffmpeg") as FfmpegModule;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg") as { path: string };
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ffprobeStatic = require("ffprobe-static") as { path: string };

  ffmpegLib.setFfmpegPath(ffmpegInstaller.path);
  ffmpegLib.setFfprobePath(ffprobeStatic.path);

  return ffmpegLib;
}

export async function processVideoForAnalysis(
  videoBuffer: Buffer,
  mimeType: string
): Promise<VideoProcessResult> {
  const ffmpegLib = await loadFfmpeg();

  const workDir = join(tmpdir(), `otc-content-${randomUUID()}`);
  await mkdir(workDir, { recursive: true });

  const ext = mimeType.includes("mp4")
    ? "mp4"
    : mimeType.includes("quicktime") || mimeType.includes("mov")
      ? "mov"
      : mimeType.includes("webm")
        ? "webm"
        : "mp4";

  const inputPath = join(workDir, `input.${ext}`);
  const audioPath = join(workDir, "audio.mp3");
  const framesDir = join(workDir, "frames");

  await mkdir(framesDir, { recursive: true });
  await writeFile(inputPath, videoBuffer);

  try {
    const durationSeconds = await getVideoDuration(ffmpegLib, inputPath);
    await extractAudio(ffmpegLib, inputPath, audioPath);

    const frameCount = Math.min(
      5,
      Math.max(2, Math.floor(durationSeconds / 10))
    );
    const framePaths = await extractFrames(
      ffmpegLib,
      inputPath,
      framesDir,
      frameCount,
      durationSeconds
    );

    const audioBuffer = await readFile(audioPath);
    const frames = await Promise.all(framePaths.map((path) => readFile(path)));

    return { audioBuffer, frames, durationSeconds };
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

function getVideoDuration(
  ffmpegLib: FfmpegModule,
  inputPath: string
): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpegLib.ffprobe(inputPath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format.duration ?? 0);
    });
  });
}

function extractAudio(
  ffmpegLib: FfmpegModule,
  inputPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpegLib(inputPath)
      .noVideo()
      .audioCodec("libmp3lame")
      .audioQuality(5)
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", reject)
      .run();
  });
}

function extractFrames(
  ffmpegLib: FfmpegModule,
  inputPath: string,
  framesDir: string,
  frameCount: number,
  duration: number
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const timestamps: string[] = [];

    for (let i = 0; i < frameCount; i++) {
      const position = 0.05 + (0.9 * i) / Math.max(frameCount - 1, 1);
      const seconds = Math.floor(position * duration);
      timestamps.push(String(seconds));
    }

    ffmpegLib(inputPath)
      .screenshots({
        timestamps,
        filename: "frame-%i.jpg",
        folder: framesDir,
        size: "640x?",
      })
      .on("end", () => {
        const paths = timestamps.map((_, index) =>
          join(framesDir, `frame-${index + 1}.jpg`)
        );
        resolve(paths);
      })
      .on("error", reject);
  });
}
