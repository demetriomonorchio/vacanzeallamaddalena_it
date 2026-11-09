import { loadGuides, syncPublishedFromNetworks } from "./ig-lib.mjs";

const guides = loadGuides();
const synced = await syncPublishedFromNetworks(guides);
if (synced.length === 0) {
  console.log("Nessun post da sincronizzare.");
} else {
  console.log("Sincronizzati:");
  for (const id of synced) console.log(`- ${id}`);
}
