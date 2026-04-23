import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const photosDir = path.join(rootDir, "public", "images", "percorso15");
const jsonPath = path.join(rootDir, "public", "data", "foto-sentiero15.json");
const dryRun = process.argv.includes("--dry-run");

function normalizePath(value) {
  return value.replaceAll("\\", "/");
}

async function readJsonArray(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Il file JSON deve contenere un array.");
  }
  return parsed;
}

async function listWebpFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return new Set(
    entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".webp"))
      .map((entry) => entry.name)
  );
}

function extractFilenameFromImageUrl(imageUrl) {
  if (typeof imageUrl !== "string") return null;
  const cleaned = normalizePath(imageUrl).trim();
  if (!cleaned) return null;
  return path.posix.basename(cleaned);
}

async function main() {
  const [items, existingWebpFiles] = await Promise.all([
    readJsonArray(jsonPath),
    listWebpFiles(photosDir),
  ]);

  const kept = [];
  const removed = [];

  for (const item of items) {
    const filename = extractFilenameFromImageUrl(item?.imageUrl);
    if (!filename || !existingWebpFiles.has(filename)) {
      removed.push({
        id: item?.id ?? null,
        imageUrl: item?.imageUrl ?? null,
      });
      continue;
    }
    kept.push(item);
  }

  if (!dryRun) {
    await fs.writeFile(jsonPath, `${JSON.stringify(kept, null, 2)}\n`, "utf8");
  }

  const result = {
    mode: dryRun ? "dry-run" : "write",
    jsonPath: normalizePath(path.relative(rootDir, jsonPath)),
    photosDir: normalizePath(path.relative(rootDir, photosDir)),
    totalBefore: items.length,
    totalAfter: kept.length,
    removedCount: removed.length,
    removed,
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2
    )
  );
  process.exitCode = 1;
});
