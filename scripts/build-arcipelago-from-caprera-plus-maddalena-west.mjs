import fs from "node:fs/promises";
import path from "node:path";

function getLines(feature) {
  if (feature?.geometry?.type === "LineString") return [feature.geometry.coordinates];
  if (feature?.geometry?.type === "MultiLineString") return feature.geometry.coordinates;
  return [];
}

function everyPointWestOfBridge(feature, bridgeLng = 9.445) {
  for (const line of getLines(feature)) {
    for (const coord of line) {
      if (!(coord[0] < bridgeLng)) return false;
    }
  }
  return true;
}

function centroid(feature) {
  let sumLng = 0;
  let sumLat = 0;
  let count = 0;
  for (const line of getLines(feature)) {
    for (const c of line) {
      sumLng += c[0];
      sumLat += c[1];
      count += 1;
    }
  }
  if (count === 0) return [0, 0];
  return [sumLng / count, sumLat / count];
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

function lengthKm(feature) {
  let meters = 0;
  for (const line of getLines(feature)) {
    for (let i = 1; i < line.length; i += 1) {
      meters += haversineMeters(line[i - 1], line[i]);
    }
  }
  return Number((meters / 1000).toFixed(2));
}

const zoneProfiles = {
  west: {
    title: "La Maddalena - Carlotto - Colmi",
    difficulty: "Escursionistico (E)",
    estimatedTime: "Da definire",
    maddiNote:
      "Partenza dal paese della Maddalena verso Punta Nera, lungo la costa occidentale fino alla Scogliera di Tegge, Batteria Nido d'Aquila, Cala Francese e Fortezza dei Colmi, con rientro al punto di partenza.",
  },
  north: {
    title: "Abbatoggia - Spiaggia Strangolato",
    difficulty: "Escursionistico (E)",
    estimatedTime: "Da definire",
    maddiNote:
      "Passeggiata ad anello sulla costa nord dell'Isola della Maddalena, con partenza da Abbatoggia e passaggio verso la Spiaggia dello Strangolato.",
  },
  southInferno: {
    title: "La Maddalena - Cala L'Inferno",
    difficulty: "Escursionistico (E)",
    estimatedTime: "3,5-4 h",
    maddiNote:
      "Percorso da Punta Nera lungo la provinciale costiera passando da Batteria Nido d'Aquila, Cala Francese e Fortezza dei Colmi fino a Cala d'Inferno.",
  },
  southGuardia: {
    title: "La Maddalena - Spiaggia dello Strangolato - Guardia Vecchia",
    difficulty: "Escursionistico (E)",
    estimatedTime: "4-4,5 h",
    maddiNote:
      "Escursione nella parte centro-nord con passaggio da Bassa Trinita e Strangolato, rientro via Cala l'Inferno e discesa verso Guardia Vecchia.",
  },
  center: {
    title: "Cala Francese - La Madonnetta",
    difficulty: "Turistico (T)",
    estimatedTime: "0,5-1 h",
    maddiNote:
      "Percorso con partenza dalla panoramica in area Cala Francese, direzione Carlotto e passaggio dalla Madonnetta, con rientro sullo stesso tracciato.",
  },
  portoPalma: {
    title: "La Maddalena - Porto Palma",
    difficulty: "Escursionistico (E)",
    estimatedTime: "3-3,5 h",
    maddiNote:
      "Percorso su strada e sentiero dalla Maddalena verso il ponte di Caprera, poi direzione Stagnali e arrivo nell'area di Porto Palma.",
  },
};

function chooseProfile([lng, lat]) {
  if (lng < 9.41) return zoneProfiles.west;
  if (lat > 41.25) return zoneProfiles.north;
  if (lat < 41.215) return zoneProfiles.southGuardia;
  if (lat < 41.23) return zoneProfiles.southInferno;
  if (lng > 9.43 && lat >= 41.23 && lat <= 41.25) return zoneProfiles.portoPalma;
  return zoneProfiles.center;
}

async function main() {
  const root = process.cwd();
  const capreraPath = path.join(root, "public", "data", "sentieri-caprera.geojson");
  const export2Path = path.join(root, "public", "data", "export (2).geojson");
  const outPath = path.join(root, "public", "data", "sentieri-arcipelago.geojson");

  const [capRaw, expRaw] = await Promise.all([
    fs.readFile(capreraPath, "utf8"),
    fs.readFile(export2Path, "utf8"),
  ]);
  const cap = JSON.parse(capRaw);
  const exp = JSON.parse(expRaw);
  if (cap?.type !== "FeatureCollection" || !Array.isArray(cap.features)) {
    throw new Error("sentieri-caprera.geojson non valido");
  }
  if (exp?.type !== "FeatureCollection" || !Array.isArray(exp.features)) {
    throw new Error("export (2).geojson non valido");
  }

  // Caprera source is copied verbatim (sacred rule).
  const sacredCaprera = cap.features.map((f) => ({ ...f }));

  const addedMaddalena = [];
  let idx = 1;
  for (const feature of exp.features) {
    const type = feature?.geometry?.type;
    if (type !== "LineString" && type !== "MultiLineString") continue;
    if (!everyPointWestOfBridge(feature, 9.445)) continue;
    const center = centroid(feature);
    const profile = chooseProfile(center);
    const props = {
      ...(feature.properties ?? {}),
      name: `Isola Maddalena - Percorso ${idx}`,
      sourceLabel: profile.title,
      difficulty: profile.difficulty,
      estimatedTime: profile.estimatedTime,
      lengthKm: lengthKm(feature),
      maddiNote: profile.maddiNote,
      description: profile.maddiNote,
      island: "La Maddalena",
      route: "hiking",
      type: "route",
    };
    addedMaddalena.push({
      type: "Feature",
      id: `maddalena-west-${idx}`,
      properties: props,
      geometry: feature.geometry,
    });
    idx += 1;
  }

  const out = {
    type: "FeatureCollection",
    generator: cap.generator ?? "custom-merge",
    timestamp: new Date().toISOString(),
    features: [...sacredCaprera, ...addedMaddalena],
  };
  await fs.writeFile(outPath, `${JSON.stringify(out, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        sacredCapreraKept: sacredCaprera.length,
        maddalenaAdded: addedMaddalena.length,
        total: out.features.length,
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
