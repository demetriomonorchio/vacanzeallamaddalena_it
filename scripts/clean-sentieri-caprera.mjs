import fs from "node:fs/promises";
import path from "node:path";

function normalizeToken(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isFallbackUnnamedName(name) {
  return normalizeToken(name).startsWith("sentiero/percorso non nominato");
}

function getLineStrings(feature) {
  const geometry = feature?.geometry;
  if (!geometry) return [];
  if (geometry.type === "LineString" && Array.isArray(geometry.coordinates)) {
    return [geometry.coordinates];
  }
  if (geometry.type === "MultiLineString" && Array.isArray(geometry.coordinates)) {
    return geometry.coordinates.filter((line) => Array.isArray(line));
  }
  return [];
}

function haversineMeters(a, b) {
  const R = 6371000;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLng = ((b[0] - a[0]) * Math.PI) / 180;
  const lat1 = (a[1] * Math.PI) / 180;
  const lat2 = (b[1] * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

function featureLengthMeters(feature) {
  let total = 0;
  for (const line of getLineStrings(feature)) {
    for (let i = 1; i < line.length; i += 1) {
      total += haversineMeters(line[i - 1], line[i]);
    }
  }
  return total;
}

function getEndpoints(feature) {
  const points = [];
  for (const line of getLineStrings(feature)) {
    if (line.length > 0) points.push(line[0], line[line.length - 1]);
  }
  return points;
}

function flattenPoints(feature) {
  const pts = [];
  for (const line of getLineStrings(feature)) {
    for (const p of line) pts.push(p);
  }
  return pts;
}

function isOfficialNamed(feature) {
  const p = feature?.properties ?? {};
  const name = String(p.name ?? "").trim();
  const ref = String(p.ref ?? "").trim();
  if (!name && !ref) return false;
  if (isFallbackUnnamedName(name)) return false;
  const route = normalizeToken(p.route);
  if (route === "hiking") return true;
  const token = normalizeToken(`${name} ${ref}`);
  return /(?:^| )(sentiero|percorso|trail|variante)(?: |$)/.test(token);
}

function isNamedOrRef(feature) {
  const p = feature?.properties ?? {};
  const name = String(p.name ?? "").trim();
  const ref = String(p.ref ?? "").trim();
  return Boolean(name || ref);
}

function mergeByNameOrRef(features) {
  const groups = new Map();
  for (const feature of features) {
    const p = feature.properties ?? {};
    const keyRaw = String(p.name ?? "").trim() || String(p.ref ?? "").trim();
    const key = normalizeToken(keyRaw);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(feature);
  }

  const merged = [];
  for (const group of groups.values()) {
    if (group.length === 1) {
      merged.push(group[0]);
      continue;
    }
    const first = group[0];
    const lines = group.flatMap((f) => getLineStrings(f));
    merged.push({
      type: "Feature",
      id: first.id,
      properties: { ...(first.properties ?? {}) },
      geometry: {
        type: "MultiLineString",
        coordinates: lines,
      },
    });
  }
  return merged;
}

async function main() {
  const root = process.cwd();
  const target = path.join(root, "public", "data", "sentieri-caprera.geojson");
  const raw = await fs.readFile(target, "utf8");
  const geo = JSON.parse(raw);
  if (geo?.type !== "FeatureCollection" || !Array.isArray(geo.features)) {
    throw new Error("GeoJSON non valido.");
  }

  const all = geo.features.filter(
    (f) => f?.geometry?.type === "LineString" || f?.geometry?.type === "MultiLineString"
  );
  const before = all.length;

  const noPrivateNoSidewalk = all.filter((f) => {
    const p = f.properties ?? {};
    const access = normalizeToken(p.access);
    const footway = normalizeToken(p.footway);
    return access !== "private" && footway !== "sidewalk";
  });

  const official = noPrivateNoSidewalk.filter((f) => isOfficialNamed(f));
  const officialPoints = official.flatMap((f) => flattenPoints(f));

  const connectedToOfficial = (feature, threshold = 30) => {
    const endpoints = getEndpoints(feature);
    if (endpoints.length === 0 || officialPoints.length === 0) return false;
    for (const ep of endpoints) {
      for (const p of officialPoints) {
        if (haversineMeters(ep, p) <= threshold) return true;
      }
    }
    return false;
  };

  const kept = [];
  for (const feature of noPrivateNoSidewalk) {
    const p = feature.properties ?? {};
    const name = String(p.name ?? "").trim();
    const isFallback = isFallbackUnnamedName(name);
    const namedRef = isNamedOrRef(feature);
    if (namedRef && !isFallback) {
      kept.push(feature);
      continue;
    }

    const length = featureLengthMeters(feature);
    if (length < 200) continue;
    if (!connectedToOfficial(feature)) continue;
    kept.push(feature);
  }

  const merged = mergeByNameOrRef(kept);
  const result = {
    ...geo,
    type: "FeatureCollection",
    features: merged,
  };

  await fs.writeFile(target, `${JSON.stringify(result, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        before,
        afterFilter: kept.length,
        afterMerge: merged.length,
        removed: before - kept.length,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
