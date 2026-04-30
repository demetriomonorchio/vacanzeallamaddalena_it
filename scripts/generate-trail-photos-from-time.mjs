import fs from "node:fs/promises";
import path from "node:path";

function getArg(flag, fallback = null) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

function haversineMeters(from, to) {
  const R = 6371000;
  const dLat = ((to[1] - from[1]) * Math.PI) / 180;
  const dLng = ((to[0] - from[0]) * Math.PI) / 180;
  const lat1 = (from[1] * Math.PI) / 180;
  const lat2 = (to[1] * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function parseTimestampFromFileName(fileName) {
  const base = fileName.replace(/\.(webp|jpg|jpeg)$/i, "");
  const match = base.match(/IMG_(\d{8})_(\d{6})(?:_(\d+))?/i);
  if (match) {
    const [, ymd, hms, tail = "0"] = match;
    const year = Number(ymd.slice(0, 4));
    const month = Number(ymd.slice(4, 6)) - 1;
    const day = Number(ymd.slice(6, 8));
    const hour = Number(hms.slice(0, 2));
    const minute = Number(hms.slice(2, 4));
    const second = Number(hms.slice(4, 6));
    const millis = Number(tail.slice(0, 3).padEnd(3, "0"));
    return Date.UTC(year, month, day, hour, minute, second, millis);
  }

  const whatsappMatch = base.match(
    /WhatsApp Image (\d{4})-(\d{2})-(\d{2}) at (\d{2})\.(\d{2})\.(\d{2})(?: \((\d+)\))?/i
  );
  if (whatsappMatch) {
    const [, yearRaw, monthRaw, dayRaw, hourRaw, minuteRaw, secondRaw, variantRaw = "0"] =
      whatsappMatch;
    const year = Number(yearRaw);
    const month = Number(monthRaw) - 1;
    const day = Number(dayRaw);
    const hour = Number(hourRaw);
    const minute = Number(minuteRaw);
    const second = Number(secondRaw);
    // Variant index in the filename gives deterministic ordering for same second.
    const millis = Math.min(999, Number(variantRaw) || 0);
    return Date.UTC(year, month, day, hour, minute, second, millis);
  }

  return Number.NaN;
}

function buildDistanceProfile(coords) {
  const cumulative = [0];
  let total = 0;
  for (let i = 1; i < coords.length; i += 1) {
    total += haversineMeters(coords[i - 1], coords[i]);
    cumulative.push(total);
  }
  return { cumulative, total };
}

function interpolatePointAtDistance(coords, cumulative, targetDistance) {
  if (coords.length === 0) return [0, 0];
  if (coords.length === 1) return coords[0];
  if (targetDistance <= 0) return coords[0];
  const lastIndex = coords.length - 1;
  if (targetDistance >= cumulative[lastIndex]) return coords[lastIndex];

  for (let i = 1; i < coords.length; i += 1) {
    const prevDist = cumulative[i - 1];
    const nextDist = cumulative[i];
    if (targetDistance <= nextDist) {
      const segmentLen = nextDist - prevDist || 1;
      const t = (targetDistance - prevDist) / segmentLen;
      const from = coords[i - 1];
      const to = coords[i];
      return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
    }
  }

  return coords[lastIndex];
}

async function main() {
  const rootDir = process.cwd();
  const trailId = process.argv[2] ?? "percorso12";
  const routeName = process.argv[3] ?? "Percorso 12";
  const distributionMode = getArg("--mode", "time");
  const photosDir = path.join(rootDir, "public", "images", trailId);
  const geojsonPath = path.join(rootDir, "public", "data", "sentieri-caprera.geojson");
  const outPath = path.join(rootDir, "public", "data", `foto-sentiero${trailId.replace(/\D+/g, "")}.json`);

  const [entries, geojsonRaw] = await Promise.all([
    fs.readdir(photosDir, { withFileTypes: true }),
    fs.readFile(geojsonPath, "utf8"),
  ]);

  const files = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".webp"))
    .map((entry) => entry.name);

  const photos = files.map((fileName) => ({
    fileName,
    timestamp: parseTimestampFromFileName(fileName),
    fallbackKey: fileName.toLowerCase(),
  }));

  photos.sort((a, b) => {
    if (distributionMode === "name") {
      return a.fallbackKey.localeCompare(b.fallbackKey);
    }
    const aTimeValid = Number.isFinite(a.timestamp);
    const bTimeValid = Number.isFinite(b.timestamp);
    if (aTimeValid && bTimeValid && a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
    if (aTimeValid !== bTimeValid) return aTimeValid ? -1 : 1;
    return a.fallbackKey.localeCompare(b.fallbackKey);
  });

  const geojson = JSON.parse(geojsonRaw);
  const feature = geojson.features?.find(
    (candidate) => candidate?.properties?.name?.trim?.().toLowerCase() === routeName.toLowerCase()
  );
  if (!feature || !Array.isArray(feature.geometry?.coordinates)) {
    throw new Error(`Tracciato non trovato: ${routeName}`);
  }

  const routeCoords = feature.geometry.coordinates;
  const { cumulative, total } = buildDistanceProfile(routeCoords);
  const validTimes = photos.map((p) => p.timestamp).filter((t) => Number.isFinite(t));
  const minTs = validTimes.length > 0 ? Math.min(...validTimes) : Number.NaN;
  const maxTs = validTimes.length > 0 ? Math.max(...validTimes) : Number.NaN;
  const hasTimeSpread = Number.isFinite(minTs) && Number.isFinite(maxTs) && maxTs > minTs;

  const payload = photos.map((photo, index) => {
    let ratio;
    if (distributionMode === "name") {
      ratio = photos.length > 1 ? index / (photos.length - 1) : 0;
    } else if (hasTimeSpread && Number.isFinite(photo.timestamp)) {
      ratio = (photo.timestamp - minTs) / (maxTs - minTs);
    } else if (photos.length > 1) {
      ratio = index / (photos.length - 1);
    } else {
      ratio = 0;
    }
    const coordinates = interpolatePointAtDistance(routeCoords, cumulative, total * ratio);
    const baseName = photo.fileName.replace(/\.webp$/i, "");
    return {
      id: `foto_${baseName}`,
      imageUrl: `/images/${trailId}/${photo.fileName}`,
      coordinates,
      relatedRouteId: trailId,
      maddiNote: "",
    };
  });

  await fs.writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Creato ${path.relative(rootDir, outPath)} con ${payload.length} foto.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
