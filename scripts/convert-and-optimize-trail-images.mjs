import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

function getArg(flag, fallback) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

function getNumericArg(flag, fallback) {
  const raw = getArg(flag, String(fallback));
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const rootDir = process.cwd();
const trailId = getArg("--trail", "percorso7");
const maxSide = Math.round(getNumericArg("--max-side", 1400));
const quality = Math.round(getNumericArg("--quality", 80));
const stamp = new Date().toISOString().replace(/[:.]/g, "-");

const sourceDir = path.join(rootDir, "public", "images", trailId);
const optimizedDir = path.join(rootDir, "public", "images", `${trailId}-optimized`);
const backupOriginalsDir = path.join(rootDir, "backup", `${trailId}-originals-${stamp}`);
const backupWebpDir = path.join(rootDir, "backup", `${trailId}-webp-preopt-${stamp}`);

const entries = await fs.readdir(sourceDir, { withFileTypes: true });
const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
const sourceRaster = files.filter((name) => /\.(jpg|jpeg|png)$/i.test(name));
const sourceWebp = files.filter((name) => /\.webp$/i.test(name));

await fs.mkdir(optimizedDir, { recursive: true });
await fs.mkdir(backupWebpDir, { recursive: true });
if (sourceRaster.length > 0) {
  await fs.mkdir(backupOriginalsDir, { recursive: true });
}

let generatedFromRaster = 0;
for (const fileName of sourceRaster) {
  const inputPath = path.join(sourceDir, fileName);
  const outputName = fileName.replace(/\.(jpg|jpeg|png)$/i, ".webp");
  const outputPath = path.join(optimizedDir, outputName);

  await sharp(inputPath)
    .rotate()
    .resize({ width: maxSide, height: maxSide, fit: "inside", withoutEnlargement: true })
    .webp({ quality })
    .toFile(outputPath);

  generatedFromRaster += 1;
}

let optimizedWebp = 0;
for (const fileName of sourceWebp) {
  const inputPath = path.join(sourceDir, fileName);
  const outputPath = path.join(optimizedDir, fileName);
  const backupPath = path.join(backupWebpDir, fileName);
  await fs.copyFile(inputPath, backupPath);

  await sharp(inputPath, { failOn: "none" })
    .rotate()
    .resize({ width: maxSide, height: maxSide, fit: "inside", withoutEnlargement: true })
    .webp({ quality })
    .toFile(outputPath);

  optimizedWebp += 1;
}

console.log(
  JSON.stringify(
    {
      trailId,
      sourceDir: path.relative(rootDir, sourceDir).replaceAll("\\", "/"),
      optimizedDir: path.relative(rootDir, optimizedDir).replaceAll("\\", "/"),
      backupOriginalsDir:
        sourceRaster.length > 0 ? path.relative(rootDir, backupOriginalsDir).replaceAll("\\", "/") : null,
      backupWebpDir: path.relative(rootDir, backupWebpDir).replaceAll("\\", "/"),
      sourceRasterCount: sourceRaster.length,
      sourceWebpCount: sourceWebp.length,
      generatedFromRaster,
      optimizedWebp,
      maxSide,
      quality,
    },
    null,
    2
  )
);
