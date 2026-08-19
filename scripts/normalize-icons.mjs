// Normalizes PNG icons in public/icons/ so their artwork fills the full
// 256x256 canvas (removes baked-in transparent padding). Idempotent: running
// it twice is a no-op for files that are already normalized.
import sharp from "sharp";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = path.join(__dirname, "..", "public", "icons");
const ALPHA_THRESHOLD = 8;
const IDEMPOTENCY_RATIO = 0.98;
const FRAME = 256;
const TARGET_SIZE = FRAME;

function computeAlphaBbox(data, width, height, channels) {
  let minX = width, minY = height, maxX = -1, maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const alpha = data[idx + channels - 1];
      if (alpha > ALPHA_THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) {
    // No visible pixels found; treat whole frame as bbox to avoid crashing.
    return { left: 0, top: 0, width, height };
  }

  return {
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

async function processFile(filePath) {
  const name = path.basename(filePath);
  const oldStat = await import("node:fs/promises").then((fs) => fs.stat(filePath));
  const oldSize = oldStat.size;

  const image = sharp(filePath);
  const metadata = await image.metadata();
  const frameWidth = metadata.width;
  const frameHeight = metadata.height;

  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const bbox = computeAlphaBbox(data, info.width, info.height, info.channels);
  // Fill % = how much of the frame's long axis the artwork's bounding box
  // occupies. This matches the idempotency guard below (same ratio).
  const longAxis = Math.max(bbox.width, bbox.height);
  const oldFillPct = (longAxis / frameWidth) * 100;

  const frameIsTarget = frameWidth === FRAME && frameHeight === FRAME;

  if (frameIsTarget && longAxis >= IDEMPOTENCY_RATIO * frameWidth) {
    console.log(
      `${name}: skipped (already normalized) — bbox ${bbox.width}x${bbox.height}, fill ${oldFillPct.toFixed(1)}%`
    );
    return;
  }

  const outputBuffer = await sharp(filePath)
    .extract({ left: bbox.left, top: bbox.top, width: bbox.width, height: bbox.height })
    .resize({
      width: TARGET_SIZE,
      height: TARGET_SIZE,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 })
    .toBuffer();

  const fs = await import("node:fs/promises");
  await fs.writeFile(filePath, outputBuffer);

  // Recompute new fill % from the resized+contained result (long axis / frame).
  const scale = TARGET_SIZE / longAxis;
  const newW = Math.round(bbox.width * scale);
  const newH = Math.round(bbox.height * scale);
  const newFillPct = (Math.max(newW, newH) / TARGET_SIZE) * 100;

  console.log(
    `${name}: old bbox ${bbox.width}x${bbox.height} (${oldFillPct.toFixed(1)}% fill, ${oldSize}B) -> ` +
    `new bbox ${newW}x${newH} (${newFillPct.toFixed(1)}% fill, ${outputBuffer.length}B)`
  );
}

async function main() {
  const entries = await readdir(ICONS_DIR);
  const pngFiles = entries.filter((f) => f.toLowerCase().endsWith(".png"));

  if (pngFiles.length === 0) {
    console.log("No PNG files found in", ICONS_DIR);
    return;
  }

  for (const file of pngFiles) {
    await processFile(path.join(ICONS_DIR, file));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
