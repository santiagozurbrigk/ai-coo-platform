/**
 * Especificaciones FFmpeg para cada variante.
 *
 * Estrategia anti-detección (aplicada a todas las variantes):
 *   - Metadatos reescritos: creation_time, encoder, comment falsificados
 *   - Bitrate variado ±5% para romper fingerprint
 *   - Crop de 1-2px aleatorio para cambiar dimensiones sutilmente
 *   - Strip de metadatos del original (-map_metadata -1)
 */

import { execFileSync } from "child_process";
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
      // Crop incluido en filter_complex — no se puede usar -vf y -filter_complex juntos
      "-filter_complex", "[0:v]setpts=0.8*PTS,crop=iw-1:ih-1:0:0[v];[0:a]atempo=1.25[a]",
      "-map", "[v]",
      "-map", "[a]",
      "-c:v", "libx264",
      "-c:a", "aac",
      "-preset", "fast",
      "-crf", "22",
      ...buildAntiDetectionArgs(3),
      "-y", output,
    ],
  },
  {
    type: "speed_down",
    outputSuffix: "v2_speed_down",
    buildFfmpegArgs: (input, output, _lutsDir) => [
      "-i", input,
      // Crop incluido en filter_complex — no se puede usar -vf y -filter_complex juntos
      "-filter_complex", "[0:v]setpts=1.15*PTS,crop=iw-2:ih-1:1:0[v];[0:a]atempo=0.87[a]",
      "-map", "[v]",
      "-map", "[a]",
      "-c:v", "libx264",
      "-c:a", "aac",
      "-preset", "fast",
      "-crf", "22",
      ...buildAntiDetectionArgs(-2),
      "-y", output,
    ],
  },
  {
    type: "music",
    outputSuffix: "v3_music",
    buildFfmpegArgs: (input, output, lutsDir, _caption, customMusicPath) => {
      // Prioridad: 1) track personalizado de la org  2) default en luts/
      const resolvedMusicPath = customMusicPath ?? path.join(lutsDir, "background-music.mp3");
      const hasMusicFile = fs.existsSync(resolvedMusicPath);

      if (hasMusicFile) {
        // Con archivo de música: mezclar audio original + música de fondo (volumen bajo)
        return [
          "-i", input,
          "-stream_loop", "-1", "-i", resolvedMusicPath,
          "-filter_complex",
          // Audio original al 100%, música de fondo al 20%, mezclar
          "[0:a]volume=1.0[orig];[1:a]volume=0.20[bg];[orig][bg]amix=inputs=2:duration=first[a_mix]",
          "-map", "0:v",
          "-map", "[a_mix]",
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

      // Sin archivo de música: conservar audio original intacto
      // La variante se diferencia por metadatos y crop (fingerprint anti-detección)
      return [
        "-i", input,
        "-c:v", "libx264",
        "-c:a", "copy",           // conservar audio original
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
    buildFfmpegArgs: (input, output, _lutsDir, originalCaption) => {
      // Texto del caption truncado y saneado para drawtext
      // Con execFileSync no hay shell: los paréntesis en x=(w-text_w)/2 son seguros
      const subtitleText = safeDrawtextValue(originalCaption);

      return [
        "-i", input,
        "-vf", [
          "crop=iw-2:ih-1:1:0",
          // Banda negra semitransparente + texto blanco centrado en la parte inferior
          // fontfile omitido → FFmpeg usa el font del sistema
          `drawtext=text='${subtitleText}':fontsize=34:fontcolor=white` +
            ":box=1:boxcolor=black@0.65:boxborderw=12" +
            ":x=(w-text_w)/2:y=h-th-80",
        ].join(","),
        "-c:v", "libx264",
        "-c:a", "copy",
        "-preset", "fast",
        "-crf", "22",
        ...buildAntiDetectionArgs(-5),
        "-y", output,
      ];
    },
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

// ─── Helper: texto seguro para drawtext ──────────────────────────────────────

/**
 * Limpia el texto para usarlo como valor de `text=` en el filtro drawtext de FFmpeg.
 * Con execFileSync no hay escaping de shell, pero sí hay que respetar el parser
 * interno de FFmpeg para el filter graph.
 * Estrategia: conservar solo caracteres seguros y usar single-quoting en el filtro.
 */
function safeDrawtextValue(caption: string | null | undefined): string {
  const raw = (caption ?? "").trim() || "Mirá el video";
  return raw
    .replace(/['"\\:,;[\]]/g, " ") // quitar chars especiales de FFmpeg filter graph
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 55);             // max 55 chars para que entre en el frame
}

// ─── Runner ───────────────────────────────────────────────────────────────────

export function runFfmpeg(args: string[]): void {
  // Log del comando (para diagnóstico — truncado a 200 chars)
  const cmdPreview = ["ffmpeg", ...args].join(" ");
  console.log("[FFmpeg]", cmdPreview.substring(0, 200) + (cmdPreview.length > 200 ? "..." : ""));

  // Usar execFileSync en lugar de execSync(string) para evitar que el shell interprete
  // caracteres especiales en los argumentos: corchetes [0:a], paréntesis (w-text_w),
  // espacios en valores de metadata (creation_time=2026-08-04 08:35:32), etc.
  // execFileSync pasa cada elemento del array como argumento independiente, sin shell.
  execFileSync("ffmpeg", args, { stdio: "pipe" });
}
