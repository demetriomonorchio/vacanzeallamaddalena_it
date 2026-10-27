import { buildDraft, readQueue, resolveGuide, writeQueue } from "./ig-lib.mjs";

const guide = resolveGuide(process.argv[2]);
const queue = readQueue();
const existing = queue.items.find((item) => item.id === `${guide.category}/${guide.slug}`);
if (existing?.status === "published") {
  throw new Error(`Già pubblicato: ${existing.permalink || existing.id}`);
}

const item = buildDraft(guide);
if (existing) {
  queue.items = queue.items.map((row) => (row.id === item.id ? item : row));
} else {
  queue.items.push(item);
}
writeQueue(queue);

console.log(item.caption);
console.log(`\nBozza salvata: ${item.id}`);
console.log("Per pubblicare: npm run ig:pubblica -- " + item.id);
