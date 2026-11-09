import { buildDraft, readQueue, resolveGuide, saveQueueItem } from "./ig-lib.mjs";

const guide = resolveGuide(process.argv[2]);
const queue = await readQueue();
const existing = queue.items.find((item) => item.id === `${guide.category}/${guide.slug}`);
if (existing?.status === "published") {
  throw new Error(`Già pubblicato: ${existing.permalink || existing.id}`);
}

const item = buildDraft(guide);
await saveQueueItem(item);

console.log(item.caption);
console.log(`\nBozza salvata: ${item.id}`);
console.log("Per pubblicare: npm run ig:pubblica -- " + item.id);
