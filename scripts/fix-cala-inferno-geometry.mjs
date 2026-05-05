import fs from "node:fs";

const arcPath = "public/data/sentieri-arcipelago.geojson";
const expPath = "public/data/export (2).geojson";

const arc = JSON.parse(fs.readFileSync(arcPath, "utf8"));
const exp = JSON.parse(fs.readFileSync(expPath, "utf8"));

const replacement = (exp.features || []).find(
  (f) => String(f?.properties?.["@id"] || f?.id || "") === "way/990489395"
);
if (!replacement) {
  throw new Error("way/990489395 non trovato");
}

const targetIdx = (arc.features || []).findIndex(
  (f) => String(f?.properties?.name || "").toLowerCase() === "isola maddalena - la maddalena - cala l'inferno"
);
if (targetIdx === -1) {
  throw new Error("sentiero Cala L'Inferno non trovato");
}

arc.features[targetIdx].geometry = replacement.geometry;

const R = 6371000;
const rad = (x) => (x * Math.PI) / 180;
const dist = (a, b) => {
  const dLat = rad(b[1] - a[1]);
  const dLng = rad(b[0] - a[0]);
  const la1 = rad(a[1]);
  const la2 = rad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

let meters = 0;
const line = replacement.geometry.coordinates;
for (let i = 1; i < line.length; i += 1) {
  meters += dist(line[i - 1], line[i]);
}

arc.features[targetIdx].properties.lengthKm = Number((meters / 1000).toFixed(2));

fs.writeFileSync(arcPath, `${JSON.stringify(arc, null, 2)}\n`, "utf8");
console.log(
  JSON.stringify(
    {
      updatedName: arc.features[targetIdx].properties.name,
      replacementId: "way/990489395",
      points: line.length,
      lengthKm: arc.features[targetIdx].properties.lengthKm,
    },
    null,
    2
  )
);
