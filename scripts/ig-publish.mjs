import { publishDraft, readQueue } from "./ig-lib.mjs";

const arg = process.argv[2];
if (!arg) throw new Error("Indica la bozza, ad esempio: npm run ig:pubblica -- isole/la-maddalena");

const queue = readQueue();
const item = queue.items.find((row) => row.id === arg || row.slug === arg);
if (!item) throw new Error(`Nessuna bozza per ${arg}. Prima: npm run ig:bozza -- ${arg}`);

const published = await publishDraft(item);
console.log(published.permalink);
if (published.facebookPermalink) console.log(published.facebookPermalink);
