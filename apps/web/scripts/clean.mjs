import { rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

for (const dir of [".next", "node_modules/.cache"]) {
  try {
    rmSync(join(root, dir), { recursive: true, force: true });
    console.log(`Removed ${dir}`);
  } catch {
    // ignore
  }
}

console.log("Clean complete.");
