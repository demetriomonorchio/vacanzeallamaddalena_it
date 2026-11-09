import { ensureInstagramTable, readQueue } from "./ig-lib.mjs";

await ensureInstagramTable();
const queue = await readQueue();
console.log("Tabella instagram_posts pronta.");
console.log(`Righe in DB: ${queue.items.length}`);
