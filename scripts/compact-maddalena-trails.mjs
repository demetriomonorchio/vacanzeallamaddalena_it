import fs from "node:fs/promises";
import path from "node:path";

function linesOf(feature) {
  if (feature?.geometry?.type === "LineString") return [feature.geometry.coordinates];
  if (feature?.geometry?.type === "MultiLineString") return feature.geometry.coordinates;
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

function featureLengthKm(feature) {
  let meters = 0;
  for (const line of linesOf(feature)) {
    for (let i = 1; i < line.length; i += 1) {
      meters += haversineMeters(line[i - 1], line[i]);
    }
  }
  return meters / 1000;
}

async function main() {
  const root = process.cwd();
  const geoPath = path.join(root, "public", "data", "sentieri-arcipelago.geojson");
  const raw = await fs.readFile(geoPath, "utf8");
  const geo = JSON.parse(raw);
  if (geo?.type !== "FeatureCollection" || !Array.isArray(geo.features)) {
    throw new Error("sentieri-arcipelago.geojson non valido");
  }

  const caprera = [];
  const maddalena = [];
  for (const feature of geo.features) {
    const island = String(feature?.properties?.island ?? "").toLowerCase();
    if (island === "la maddalena") maddalena.push(feature);
    else caprera.push(feature);
  }

  const groups = new Map();
  for (const feature of maddalena) {
    const p = feature.properties ?? {};
    const key = String(p.sourceLabel ?? "Isola Maddalena - Percorso").trim();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(feature);
  }

  const compacted = [];
  let idx = 1;
  for (const [label, features] of groups.entries()) {
    const allLines = features.flatMap((f) => linesOf(f));
    const sample = features[0]?.properties ?? {};
    const totalKm = features.reduce((acc, f) => acc + featureLengthKm(f), 0);
    compacted.push({
      type: "Feature",
      id: `maddalena-compacted-${idx}`,
      properties: {
        name: `Isola Maddalena - ${label}`,
        route: "hiking",
        type: "route",
        island: "La Maddalena",
        difficulty: sample.difficulty ?? "Turistico (T)",
        estimatedTime: sample.estimatedTime ?? "Da definire",
        lengthKm: Number(totalKm.toFixed(2)),
        maddiNote: sample.maddiNote ?? "",
        description: sample.description ?? sample.maddiNote ?? "",
      },
      geometry: {
        type: "MultiLineString",
        coordinates: allLines,
      },
    });
    idx += 1;
  }

  const out = {
    ...geo,
    type: "FeatureCollection",
    features: [...caprera, ...compacted],
  };
  await fs.writeFile(geoPath, `${JSON.stringify(out, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        capreraKept: caprera.length,
        maddalenaBefore: maddalena.length,
        maddalenaAfter: compacted.length,
        totalAfter: out.features.length,
        names: compacted.map((f) => f.properties.name),
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
