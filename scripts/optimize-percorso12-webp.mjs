import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

function getNumericArg(flag, fallback) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return fallback;
  const raw = process.argv[idx + 1];
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const rootDir = process.cwd();
const sourceDir = path.join(rootDir, "public", "images", "percorso12");
const outputDir = path.join(rootDir, "public", "images", "percorso12-optimized");
const maxLongSide = Math.round(getNumericArg("--max-side", 1400));
const quality = Math.round(getNumericArg("--quality", 80));
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = path.join(rootDir, "backup", `percorso12-webp-preopt-${stamp}`);

const entries = await fs.readdir(sourceDir, { withFileTypes: true });
const webpFiles = entries
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".webp"))
  .map((entry) => entry.name);

await fs.mkdir(backupDir, { recursive: true });
await fs.mkdir(outputDir, { recursive: true });

let processed = 0;
for (const fileName of webpFiles) {
  const sourcePath = path.join(sourceDir, fileName);
  const outputPath = path.join(outputDir, fileName);
  const backupPath = path.join(backupDir, fileName);
  await fs.copyFile(sourcePath, backupPath);

  const image = sharp(sourcePath, { failOn: "none" });
  const metadata = await image.metadata();
  const width = metadata.width ?? null;
  const height = metadata.height ?? null;

  if (width === null || height === null) {
    continue;
  }

  const resizeOptions =
    width >= height
      ? { width: maxLongSide, withoutEnlargement: true, fit: "inside" }
      : { height: maxLongSide, withoutEnlargement: true, fit: "inside" };

  await image
    .resize(resizeOptions)
    .webp({ quality })
    .toFile(outputPath);
  processed += 1;
}

console.log(
  JSON.stringify(
    {
      sourceDir: path.relative(rootDir, sourceDir).replaceAll("\\", "/"),
      outputDir: path.relative(rootDir, outputDir).replaceAll("\\", "/"),
      backupDir: path.relative(rootDir, backupDir).replaceAll("\\", "/"),
      totalWebp: webpFiles.length,
      processed,
      maxLongSide,
      quality,
    },
    null,
    2
  )
);
