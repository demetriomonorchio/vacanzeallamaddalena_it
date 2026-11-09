import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import imageRels from "../data/image-index.json" with { type: "json" };

const IMAGE_RELS = new Set(imageRels);

export const SITE = "https://vacanzeallamaddalena.it";

let sqlClient = null;
let tableReady = false;

function getSql() {
  if (!sqlClient) sqlClient = neon(readEnv("DATABASE_URL"));
  return sqlClient;
}

async function readyDb() {
  if (tableReady) return;
  await ensureInstagramTable();
  tableReady = true;
}

function rowToItem(row) {
  return {
    id: row.id,
    category: row.category,
    slug: row.slug,
    status: row.status,
    imageUrl: row.image_url || "",
    pageUrl: row.page_url || "",
    author: row.author || "",
    authorLink: row.author_link || "",
    hashtags: Array.isArray(row.hashtags) ? row.hashtags : [],
    caption: row.caption || "",
    permalink: row.permalink || undefined,
    facebookPermalink: row.facebook_permalink || undefined,
    publishedAt: row.published_at
      ? new Date(row.published_at).toISOString()
      : undefined,
    updatedAt: row.updated_at
      ? new Date(row.updated_at).toISOString()
      : undefined,
  };
}

export async function ensureInstagramTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS instagram_posts (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      slug TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      image_url TEXT,
      page_url TEXT,
      author TEXT,
      author_link TEXT,
      hashtags JSONB NOT NULL DEFAULT '[]'::jsonb,
      caption TEXT,
      permalink TEXT,
      facebook_permalink TEXT,
      published_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

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

export async function readQueue() {
  await readyDb();
  const sql = getSql();
  const rows = await sql`
    SELECT
      id, category, slug, status, image_url, page_url, author, author_link,
      hashtags, caption, permalink, facebook_permalink, published_at, updated_at
    FROM instagram_posts
    ORDER BY COALESCE(published_at, updated_at) DESC NULLS LAST
  `;
  return { items: rows.map(rowToItem) };
}

export async function writeQueue(queue) {
  for (const item of queue.items || []) {
    await saveQueueItem(item);
  }
}

export async function saveQueueItem(item) {
  await readyDb();
  const sql = getSql();
  const hashtags = JSON.stringify(item.hashtags || []);
  await sql`
    INSERT INTO instagram_posts (
      id, category, slug, status, image_url, page_url, author, author_link,
      hashtags, caption, permalink, facebook_permalink, published_at, updated_at
    ) VALUES (
      ${item.id},
      ${item.category},
      ${item.slug},
      ${item.status || "draft"},
      ${item.imageUrl || null},
      ${item.pageUrl || null},
      ${item.author || null},
      ${item.authorLink || null},
      ${hashtags}::jsonb,
      ${item.caption || null},
      ${item.permalink || null},
      ${item.facebookPermalink || null},
      ${item.publishedAt ? new Date(item.publishedAt) : null},
      ${item.updatedAt ? new Date(item.updatedAt) : new Date()}
    )
    ON CONFLICT (id) DO UPDATE SET
      category = EXCLUDED.category,
      slug = EXCLUDED.slug,
      status = EXCLUDED.status,
      image_url = EXCLUDED.image_url,
      page_url = EXCLUDED.page_url,
      author = EXCLUDED.author,
      author_link = EXCLUDED.author_link,
      hashtags = EXCLUDED.hashtags,
      caption = EXCLUDED.caption,
      permalink = EXCLUDED.permalink,
      facebook_permalink = EXCLUDED.facebook_permalink,
      published_at = EXCLUDED.published_at,
      updated_at = EXCLUDED.updated_at
  `;
}

export function readEnv(name) {
  const fromProcess = process.env[name]?.trim();
  if (fromProcess) return fromProcess;
  const file = path.join(process.cwd(), ".env");
  if (!fs.existsSync(file)) throw new Error(`Manca ${name}`);
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

async function findInstagramPermalink(pageUrl) {
  const token = readEnv("INSTAGRAM_ACCESS_TOKEN");
  const userId = readEnv("INSTAGRAM_USER_ID");
  const res = await fetch(
    `https://graph.instagram.com/v21.0/${userId}/media?fields=caption,permalink&limit=25`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const json = await res.json();
  if (json.error) return "";
  const hit = (json.data || []).find((row) => (row.caption || "").includes(pageUrl));
  return hit?.permalink || "";
}

async function findFacebookPermalink(pageUrl) {
  const pageId = readEnv("FACEBOOK_PAGE_ID");
  const token = readEnv("FACEBOOK_PAGE_ACCESS_TOKEN");
  const res = await fetch(
    `https://graph.facebook.com/v21.0/${pageId}/published_posts?fields=message,permalink_url&limit=15`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const json = await res.json();
  if (json.error) return "";
  const hit = (json.data || []).find((row) => (row.message || "").includes(pageUrl));
  return hit?.permalink_url || "";
}

async function publishInstagram(item) {
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
  return media.permalink || published.id;
}

function facebookPostUrl(postId) {
  if (!postId || !postId.includes("_")) return "";
  const [page, post] = postId.split("_");
  return `https://www.facebook.com/${page}/posts/${post}`;
}

async function publishFacebook(item) {
  const pageId = readEnv("FACEBOOK_PAGE_ID");
  const token = readEnv("FACEBOOK_PAGE_ACCESS_TOKEN");
  const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/photos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: item.imageUrl,
      caption: item.caption,
      published: true,
    }),
  });
  const json = await res.json();
  if (json.error || !json.id) throw new Error(apiError(json));
  return facebookPostUrl(json.post_id);
}

/** Segna come pubblicati i post già presenti su IG/FB ma assenti/incompleti nel DB. */
export async function syncPublishedFromNetworks(guides) {
  const queue = await readQueue();
  const byId = new Map(queue.items.map((item) => [item.id, item]));
  const synced = [];

  for (const guide of guides) {
    const id = `${guide.category}/${guide.slug}`;
    const existing = byId.get(id);
    if (existing?.status === "published" && existing.permalink && existing.facebookPermalink) {
      continue;
    }
    const pageUrl = existing?.pageUrl || `${SITE}/it/${guide.category}/${guide.slug}`;
    let permalink = existing?.permalink || "";
    let facebookPermalink = existing?.facebookPermalink || "";
    if (!permalink) permalink = await findInstagramPermalink(pageUrl);
    if (!facebookPermalink) facebookPermalink = await findFacebookPermalink(pageUrl);
    if (!permalink && !facebookPermalink) continue;

    const publishedAt = existing?.publishedAt || new Date().toISOString();
    await saveQueueItem({
      id,
      category: guide.category,
      slug: guide.slug,
      status: "published",
      imageUrl: existing?.imageUrl || "",
      pageUrl,
      author: existing?.author || "",
      authorLink: existing?.authorLink || "",
      hashtags: existing?.hashtags || [],
      caption: existing?.caption || "",
      permalink: permalink || existing?.permalink || "",
      facebookPermalink: facebookPermalink || existing?.facebookPermalink || "",
      publishedAt,
      updatedAt: new Date().toISOString(),
    });
    synced.push(id);
  }

  return synced;
}

export async function publishDraft(item) {
  const queue = await readQueue();
  const existing = queue.items.find((row) => row.id === item.id);
  if (existing?.status === "published" && existing.facebookPermalink) {
    throw new Error(`Già pubblicato: ${existing.permalink || existing.id}`);
  }

  let permalink = existing?.status === "published" ? existing.permalink || "" : "";
  let facebookPermalink = existing?.facebookPermalink || "";
  const publishedAt = existing?.publishedAt || new Date().toISOString();
  const updatedAt = new Date().toISOString();

  if (!permalink && item.pageUrl) permalink = await findInstagramPermalink(item.pageUrl);
  if (!facebookPermalink && item.pageUrl) facebookPermalink = await findFacebookPermalink(item.pageUrl);
  if (permalink && facebookPermalink) {
    await saveQueueItem({
      ...item,
      status: "published",
      permalink,
      facebookPermalink,
      publishedAt,
      updatedAt,
    });
    return { permalink, facebookPermalink };
  }

  if (!permalink) {
    permalink = await publishInstagram(item);
    await saveQueueItem({
      ...item,
      status: "published",
      permalink,
      facebookPermalink,
      publishedAt,
      updatedAt,
    });
  }

  if (!facebookPermalink) {
    try {
      facebookPermalink = await publishFacebook(item);
    } catch (error) {
      const message = error instanceof Error ? error.message : "errore Facebook";
      throw new Error(`Instagram pubblicato. Facebook: ${message}`);
    }
    await saveQueueItem({
      ...item,
      status: "published",
      permalink,
      facebookPermalink,
      publishedAt,
      updatedAt,
    });
  }

  return { permalink, facebookPermalink };
}
