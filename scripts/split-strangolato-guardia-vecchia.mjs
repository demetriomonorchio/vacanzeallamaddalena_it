import fs from "node:fs";

const geoPath = "public/data/sentieri-arcipelago.geojson";
const geo = JSON.parse(fs.readFileSync(geoPath, "utf8"));

const start = [9.405021, 41.257776]; // Spiaggia dello Strangolato (lng, lat)
const end = [9.398442, 41.225111]; // Guardia Vecchia (lng, lat)

const targetName = "Isola Maddalena - La Maddalena - Spiaggia dello Strangolato - Guardia Vecchia";
const idx = (geo.features || []).findIndex(
  (f) => String(f?.properties?.name || "").trim().toLowerCase() === targetName.toLowerCase()
);

if (idx === -1) {
  throw new Error(`Sentiero non trovato: ${targetName}`);
}

const R = 6371000;
const rad = (x) => (x * Math.PI) / 180;
const haversine = (a, b) => {
  const dLat = rad(b[1] - a[1]);
  const dLng = rad(b[0] - a[0]);
  const la1 = rad(a[1]);
  const la2 = rad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const meters = haversine(start, end);
const km = Number((meters / 1000).toFixed(2));

geo.features[idx].geometry = {
  type: "LineString",
  coordinates: [start, end],
};
geo.features[idx].properties = {
  ...(geo.features[idx].properties ?? {}),
  estimatedTime: "Da definire",
  lengthKm: km,
  maddiNote:
    "Tratto separato dedicato tra Spiaggia dello Strangolato e Guardia Vecchia, aggiornato con coordinate di riferimento fornite manualmente.",
  description:
    "Tratto separato dedicato tra Spiaggia dello Strangolato e Guardia Vecchia, aggiornato con coordinate di riferimento fornite manualmente.",
};

fs.writeFileSync(geoPath, `${JSON.stringify(geo, null, 2)}\n`, "utf8");
console.log(
  JSON.stringify(
    {
      updatedTrail: targetName,
      startLatLng: [start[1], start[0]],
      endLatLng: [end[1], end[0]],
      lengthKm: km,
    },
    null,
    2
  )
);
