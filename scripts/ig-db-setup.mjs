import fs from "fs";
import path from "path";
import {
  QUEUE_PATH,
  ensureInstagramTable,
  readQueue,
  saveQueueItem,
} from "./ig-lib.mjs";

await ensureInstagramTable();
console.log("Tabella instagram_posts pronta.");

if (!fs.existsSync(QUEUE_PATH)) {
  console.log("Nessun JSON da migrare.");
  process.exit(0);
}

const legacy = JSON.parse(fs.readFileSync(QUEUE_PATH, "utf8"));
const items = Array.isArray(legacy.items) ? legacy.items : [];
for (const item of items) {
  await saveQueueItem({
    ...item,
    updatedAt: item.updatedAt || item.publishedAt || new Date().toISOString(),
  });
  console.log(`Migrato: ${item.id} (${item.status})`);
}

const queue = await readQueue();
console.log(`Righe in DB: ${queue.items.length}`);
