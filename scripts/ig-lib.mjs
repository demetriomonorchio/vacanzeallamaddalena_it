import fs from "fs";
import path from "path";
import imageRels from "../data/image-index.json" with { type: "json" };

const IMAGE_RELS = new Set(imageRels);

export const SITE = "https://vacanzeallamaddalena.it";
export const QUEUE_PATH = path.join(process.cwd(), "data", "instagram-queue.json");

const CATEGORY_TAG = {
  isole: "#ArcipelagoDiLaMaddalena",
  attivita: "#VacanzeInSardegna",
  guida: "#MareSardegna",
  utilities: "#VacanzeInSardegna",
};

const FILL_TAGS = [
  "#LaMaddalena",
  "#Gallura",
  "#Sardegna",
  "#MareSardegna",
  "#VacanzeInSardegna",
  "#SardegnaDaScoprire",
];

const PLACE_PATTERNS = [
  /\bCala\s+[A-ZÀ-Ý][\p{L}'’]+/gu,
  /\bPunta\s+[A-ZÀ-Ý][\p{L}'’]+/gu,
  /\bPorto\s+[A-ZÀ-Ý][\p{L}'’]+/gu,
  /\bPasso\s+della\s+[A-ZÀ-Ý][\p{L}'’]+/gu,
  /\bGuardia\s+Vecchia\b/gu,
  /\bSanto\s+Stefano\b/gu,
  /\bSanta\s+Maria\b/gu,
  /\bBocche\s+di\s+Bonifacio\b/gu,
  /\bSecca\s+di\s+[A-ZÀ-Ý][\p{L}'’]+/gu,
  /\bSpiaggia\s+Rosa\b/gu,
  /\b(?:Caprera|Budelli|Spargi|Razzoli|Stagnali|Palau)\b/gu,
];

export function toHashtag(phrase) {
  const words = phrase
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/['’]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  return `#${words.join("")}`;
}

/** Luoghi nell'excerpt, nell'ordine in cui compaiono. */
export function placesFromExcerpt(excerpt) {
  const found = [];
  for (const pattern of PLACE_PATTERNS) {
    for (const match of excerpt.matchAll(pattern)) {
      found.push({ index: match.index ?? 0, phrase: match[0] });
    }
  }
  found.sort((a, b) => a.index - b.index);
  const tags = [];
  for (const item of found) {
    const tag = toHashtag(item.phrase);
    if (!tags.includes(tag)) tags.push(tag);
  }
  return tags.slice(0, 3);
}

/** Massimo 8: luoghi, tag di categoria, poi lista fissa. */
export function buildHashtags(excerpt, category) {
  const tags = [];
  const seen = new Set();
  const add = (tag) => {
    if (!tag || seen.has(tag) || tags.length >= 8) return;
    seen.add(tag);
    tags.push(tag);
  };
  for (const tag of placesFromExcerpt(excerpt)) add(tag);
  add(CATEGORY_TAG[category]);
  for (const tag of FILL_TAGS) add(tag);
  return tags;
}

export function loadGuides() {
  const src = fs.readFileSync(
    path.join(process.cwd(), "lib", "categories.ts"),
    "utf8"
  );
  const start = src.indexOf("export const guidesByCategory");
  const end = src.indexOf("export const apartments");
  const block = src.slice(start, end === -1 ? undefined : end);
  const categories = ["isole", "attivita", "guida", "utilities"];
  const guides = [];

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const from = block.indexOf(`\n  ${category}: [`);
    const to =
      i + 1 < categories.length
        ? block.indexOf(`\n  ${categories[i + 1]}: [`)
        : block.length;
    const slice = block.slice(from, to);
    const re =
      /slug:\s*"([^"]+)"[\s\S]*?title:\s*\{\s*it:\s*"((?:\\.|[^"\\])*)"[\s\S]*?excerpt:\s*\{\s*it:\s*"((?:\\.|[^"\\])*)"/g;
    for (const match of slice.matchAll(re)) {
      guides.push({
        category,
        slug: match[1],
        title: match[2],
        excerpt: match[3],
      });
    }
  }
  return guides;
}

export function resolveGuide(arg) {
  const guides = loadGuides();
  if (!arg) {
    throw new Error("Indica la guida, ad esempio: la-maddalena oppure isole/la-maddalena");
  }
  if (arg.includes("/")) {
    const [category, slug] = arg.split("/");
    const guide = guides.find((g) => g.category === category && g.slug === slug);
    if (!guide) throw new Error(`Guida non trovata: ${arg}`);
    return guide;
  }
  const matches = guides.filter((g) => g.slug === arg);
  if (matches.length === 0) throw new Error(`Guida non trovata: ${arg}`);
  if (matches.length > 1) {
    const choices = matches.map((g) => `${g.category}/${g.slug}`).join(" oppure ");
    throw new Error(`Slug ambiguo. Usa ${choices}`);
  }
  return matches[0];
}

export function parseFrontmatter(raw) {
  const lines = raw.replace(/^\uFEFF/, "").split(/\r?\n/);
  const opening = lines.findIndex((line) => line.trim() === "---");
  if (opening === -1) return {};
  const closing = lines.findIndex((line, i) => i > opening && line.trim() === "---");
  if (closing === -1) return {};

  const result = { polaroid: {} };
  for (const line of lines.slice(opening + 1, closing)) {
    const match = line.match(
      /^([a-zA-Z0-9_.-]+)\s*:\s*(?:"([^"]*)"|'([^']*)'|(.*))\s*$/
    );
    if (!match) continue;
    const key = match[1];
    const value = (match[2] ?? match[3] ?? match[4] ?? "").trim();
    if (key === "author") result.author = value;
    if (key === "authorLink") result.authorLink = value;
    if (key.startsWith("polaroidAuthor.")) {
      const basename = key.slice("polaroidAuthor.".length).trim().toLowerCase();
      result.polaroid[basename] ??= {};
      result.polaroid[basename].author = value;
    }
    if (key.startsWith("polaroidAuthorLink.")) {
      const basename = key.slice("polaroidAuthorLink.".length).trim().toLowerCase();
      result.polaroid[basename] ??= {};
      result.polaroid[basename].authorLink = value;
    }
  }
  return result;
}

function slugifyTitle(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .trim()
    .replace(/\s+/g, "-");
}

function imageBasename(heading) {
  const trimmed = heading.trim();
  const pipe = trimmed.match(/^(.+?)\s*\|\s*([a-zA-Z0-9][-a-zA-Z0-9]*)\s*$/);
  const display = pipe ? pipe[1].trim() : trimmed;
  const imgName = pipe ? pipe[2].trim().toLowerCase() : "";
  if (imgName) {
    return imgName
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[^a-z0-9-]/gi, "")
      .replace(/^-+|-+$/g, "");
  }
  const words = display.trim().split(/\s+/).filter(Boolean).slice(0, 3).join(" ");
  return slugifyTitle(words);
}

export function firstSection(raw) {
  const body = raw.replace(/^---[\s\S]*?---/, "");
  const lines = body.split(/\r?\n/);
  let heading = "";
  const paragraph = [];
  let started = false;

  for (const line of lines) {
    if (line.startsWith("# ")) continue;
    if (line.startsWith("## ")) {
      if (!heading) {
        heading = line.slice(3).trim();
        continue;
      }
      break;
    }
    if (!heading) continue;
    if (line.trim() === "") {
      if (started) break;
      continue;
    }
    started = true;
    paragraph.push(line.trim());
  }

  return { heading, paragraph: paragraph.join(" "), basename: heading ? imageBasename(heading) : "" };
}

export function findImage(category, slug, basename) {
  for (const ext of ["webp", "png", "jpg", "jpeg"]) {
    const rel = `/images/${category}/${slug}/${basename}.${ext}`;
    const abs = path.join(process.cwd(), "public", rel);
    if (fs.existsSync(abs) || IMAGE_RELS.has(rel)) return `${SITE}${rel}`;
  }
  return null;
}

export function buildCaption({ title, paragraph, pageUrl, author, authorLink, hashtags }) {
  const lines = [title, "", paragraph, "", "Guida completa:", pageUrl];
  if (author) {
    lines.push("", `Foto di ${author}`);
    if (authorLink) lines.push(authorLink);
  }
  lines.push("", hashtags.join(" "));
  return lines.join("\n");
}

export function readQueue() {
  if (!fs.existsSync(QUEUE_PATH)) return { items: [] };
  return JSON.parse(fs.readFileSync(QUEUE_PATH, "utf8"));
}

export function writeQueue(queue) {
  fs.mkdirSync(path.dirname(QUEUE_PATH), { recursive: true });
  fs.writeFileSync(QUEUE_PATH, `${JSON.stringify(queue, null, 2)}\n`);
}

export function readEnv(name) {
  const file = path.join(process.cwd(), ".env");
  if (!fs.existsSync(file)) throw new Error("Manca il file .env");
  const line = fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .find((row) => row.startsWith(`${name}=`));
  if (!line) throw new Error(`Manca ${name} in .env`);
  return line.slice(name.length + 1).trim().replace(/^["']|["']$/g, "");
}

export function buildDraft(guide) {
  const mdPath = path.join(
    process.cwd(),
    "content",
    "it",
    guide.category,
    `${guide.slug}.md`
  );
  if (!fs.existsSync(mdPath)) {
    throw new Error(`File non trovato: content/it/${guide.category}/${guide.slug}.md`);
  }
  const raw = fs.readFileSync(mdPath, "utf8");
  const section = firstSection(raw);
  if (!section.paragraph || !section.basename) {
    throw new Error("Nella guida manca il primo paragrafo o il primo titolo di sezione.");
  }
  const imageUrl = findImage(guide.category, guide.slug, section.basename);
  if (!imageUrl) throw new Error(`Foto non trovata per ${section.basename}`);

  const meta = parseFrontmatter(raw);
  const credit = meta.polaroid[section.basename] ?? {};
  const author = credit.author || meta.author || "";
  const authorLink = credit.authorLink || meta.authorLink || "";
  const hashtags = buildHashtags(guide.excerpt, guide.category);
  const pageUrl = `${SITE}/it/${guide.category}/${guide.slug}`;
  const caption = buildCaption({
    title: guide.title,
    paragraph: section.paragraph,
    pageUrl,
    author,
    authorLink,
    hashtags,
  });

  return {
    id: `${guide.category}/${guide.slug}`,
    category: guide.category,
    slug: guide.slug,
    status: "draft",
    imageUrl,
    pageUrl,
    author,
    authorLink,
    hashtags,
    caption,
    updatedAt: new Date().toISOString(),
  };
}

function apiError(payload) {
  if (!payload?.error) return "errore Instagram";
  return [payload.error.code, payload.error.message].filter(Boolean).join(" | ");
}

export async function publishDraft(item) {
  const queue = readQueue();
  const existing = queue.items.find((row) => row.id === item.id);
  if (existing?.status === "published") {
    throw new Error(`Già pubblicato: ${existing.permalink || existing.id}`);
  }

  const token = readEnv("INSTAGRAM_ACCESS_TOKEN");
  const userId = readEnv("INSTAGRAM_USER_ID");
  const createRes = await fetch(`https://graph.instagram.com/v21.0/${userId}/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: item.imageUrl,
      caption: item.caption,
      alt_text: item.author
        ? `${item.caption.split("\n")[0]}. Foto di ${item.author}`
        : item.caption.split("\n")[0],
    }),
  });
  const created = await createRes.json();
  if (!created.id) throw new Error(apiError(created));

  let status = "";
  for (let i = 0; i < 8; i++) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const statusRes = await fetch(
      `https://graph.instagram.com/v21.0/${created.id}?fields=status_code`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const statusJson = await statusRes.json();
    status = statusJson.status_code || "";
    if (status === "FINISHED" || status === "ERROR" || status === "EXPIRED") break;
  }
  if (status !== "FINISHED") {
    throw new Error(`Contenitore non pronto: ${status || "sconosciuto"}`);
  }

  const publishRes = await fetch(
    `https://graph.instagram.com/v21.0/${userId}/media_publish`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ creation_id: created.id }),
    }
  );
  const published = await publishRes.json();
  if (!published.id) throw new Error(apiError(published));

  const mediaRes = await fetch(
    `https://graph.instagram.com/v21.0/${published.id}?fields=permalink`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const media = await mediaRes.json();
  const saved = {
    ...item,
    status: "published",
    permalink: media.permalink || "",
    publishedAt: new Date().toISOString(),
  };
  if (existing) {
    queue.items = queue.items.map((row) => (row.id === item.id ? saved : row));
  } else {
    queue.items.push(saved);
  }
  writeQueue(queue);
  return saved.permalink || published.id;
}
