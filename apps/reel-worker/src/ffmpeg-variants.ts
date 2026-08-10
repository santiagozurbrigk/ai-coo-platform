/**
 * Especificaciones FFmpeg para cada variante.
 *
 * Estrategia anti-detección (aplicada a todas las variantes):
 *   - Metadatos reescritos: creation_time, encoder, comment falsificados
 *   - Bitrate variado ±5% para romper fingerprint
 *   - Crop de 1-2px aleatorio para cambiar dimensiones sutilmente
 *   - Strip de metadatos del original (-map_metadata -1)
 */

import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import type { VariantSpec } from "./types";

// ─── Metadatos anti-detección ─────────────────────────────────────────────────

const FAKE_DEVICES = [
  "iPhone 14 Pro",
  "iPhone 15",
  "Samsung Galaxy S24",
  "iPhone 13 Pro Max",
  "Pixel 8",
];

const FAKE_APPS = [
  "Instagram 318.0",
  "Instagram 319.1",
  "CapCut 11.2",
  "TikTok 34.1",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPastDate(): string {
  const now = Date.now();
  // Entre 1 y 30 días atrás
  const offset = Math.floor(Math.random() * 30 * 24 * 3600 * 1000);
  return new Date(now - offset).toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
}

function buildAntiDetectionArgs(bitrateVariationPct: number = 0): string[] {
  const fakeDevice = pick(FAKE_DEVICES);
  const fakeApp = pick(FAKE_APPS);
  const fakeDate = randomPastDate();
  // Bitrate base 4 Mbps ±5%
  const bitrateKbps = Math.round(4000 * (1 + bitrateVariationPct / 100));

  return [
    // Strip metadatos originales
    "-map_metadata", "-1",
    // Reescribir metadatos
    "-metadata", `creation_time=${fakeDate}`,
    "-metadata", `encoder=${fakeApp}`,
    "-metadata", `make=${fakeDevice}`,
    "-metadata", `model=${fakeDevice}`,
    "-metadata", `comment=`,
    // Bitrate
    "-b:v", `${bitrateKbps}k`,
    "-maxrate", `${Math.round(bitrateKbps * 1.2)}k`,
    "-bufsize", `${bitrateKbps * 2}k`,
  ];
}

// ─── Especificaciones de variantes ────────────────────────────────────────────

export const VARIANT_SPECS: VariantSpec[] = [
  {
    type: "speed_up",
    outputSuffix: "v1_speed_up",
    buildFfmpegArgs: (input, output, _lutsDir) => [
      "-i", input,
      "-filter_complex", "[0:v]setpts=0.8*PTS[v];[0:a]atempo=1.25[a]",
      "-map", "[v]",
      "-map", "[a]",
      "-c:v", "libx264",
      "-c:a", "aac",
      "-preset", "fast",
      "-crf", "22",
      // Crop 1px para cambiar fingerprint
      "-vf", "crop=iw-1:ih-1:0:0",
      ...buildAntiDetectionArgs(3),
      "-y", output,
    ],
  },
  {
    type: "speed_down",
    outputSuffix: "v2_speed_down",
    buildFfmpegArgs: (input, output, _lutsDir) => [
      "-i", input,
      "-filter_complex", "[0:v]setpts=1.15*PTS[v];[0:a]atempo=0.87[a]",
      "-map", "[v]",
      "-map", "[a]",
      "-c:v", "libx264",
      "-c:a", "aac",
      "-preset", "fast",
      "-crf", "22",
      "-vf", "crop=iw-2:ih-1:1:0",
      ...buildAntiDetectionArgs(-2),
      "-y", output,
    ],
  },
  {
    type: "music",
    outputSuffix: "v3_music",
    buildFfmpegArgs: (input, output, lutsDir) => {
      const musicPath = path.join(lutsDir, "background-music.mp3");
      const hasMusicFile = fs.existsSync(musicPath);
      if (!hasMusicFile) {
        // Sin archivo de música: anular audio (reemplazar con silencio)
        return [
          "-i", input,
          "-f", "lavfi", "-i", "anullsrc=cl=stereo:r=44100",
          "-map", "0:v",
          "-map", "1:a",
          "-c:v", "libx264",
          "-c:a", "aac",
          "-shortest",
          "-preset", "fast",
          "-crf", "22",
          "-vf", "crop=iw-1:ih-2:0:1",
          ...buildAntiDetectionArgs(5),
          "-y", output,
        ];
      }
      return [
        "-i", input,
        "-stream_loop", "-1", "-i", musicPath,
        "-map", "0:v",
        "-map", "1:a",
        "-c:v", "libx264",
        "-c:a", "aac",
        "-shortest",
        "-af", "volume=0.4",
        "-preset", "fast",
        "-crf", "22",
        "-vf", "crop=iw-1:ih-2:0:1",
        ...buildAntiDetectionArgs(5),
        "-y", output,
      ];
    },
  },
  {
    type: "subtitles",
    outputSuffix: "v4_subtitles",
    buildFfmpegArgs: (input, output, _lutsDir) => [
      // Subtítulos generados artificialmente con drawtext
      // El texto se quema con un estilo llamativo tipo captions
      "-i", input,
      "-vf", [
        "crop=iw-2:ih-1:1:0",
        "drawtext=text='':fontsize=28:fontcolor=white:box=1:boxcolor=black@0.5:boxborderw=8:" +
          "x=(w-text_w)/2:y=h-th-60",
      ].join(","),
      "-c:v", "libx264",
      "-c:a", "copy",
      "-preset", "fast",
      "-crf", "22",
      ...buildAntiDetectionArgs(-5),
      "-y", output,
    ],
  },
  {
    type: "color",
    outputSuffix: "v5_color",
    buildFfmpegArgs: (input, output, lutsDir) => {
      const lutPath = path.join(lutsDir, "warm.cube");
      const hasLut = fs.existsSync(lutPath);
      const colorFilter = hasLut
        ? `lut3d=${lutPath.replace(/\\/g, "/")},crop=iw-1:ih-2:0:1`
        : "eq=saturation=1.2:contrast=1.05:brightness=0.02,crop=iw-1:ih-2:0:1";

      return [
        "-i", input,
        "-vf", colorFilter,
        "-c:v", "libx264",
        "-c:a", "copy",
        "-preset", "fast",
        "-crf", "22",
        ...buildAntiDetectionArgs(0),
        "-y", output,
      ];
    },
  },
];

// ─── Runner ───────────────────────────────────────────────────────────────────

export function runFfmpeg(args: string[]): void {
  const cmd = ["ffmpeg", ...args].join(" ");
  console.log("[FFmpeg]", cmd.substring(0, 200) + (cmd.length > 200 ? "..." : ""));
  execSync(cmd, { stdio: "pipe" });
}
