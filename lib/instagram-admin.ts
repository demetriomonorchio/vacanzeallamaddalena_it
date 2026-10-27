import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { guidesByCategory, type Category } from "@/lib/categories";

const COOKIE = "ig_admin";

export type IgGuide = {
  category: string;
  slug: string;
  title: string;
  excerpt: string;
};

export type IgDraft = {
  id: string;
  category: string;
  slug: string;
  status: string;
  imageUrl: string;
  pageUrl: string;
  author: string;
  authorLink: string;
  hashtags: string[];
  caption: string;
  permalink?: string;
  facebookPermalink?: string;
  updatedAt?: string;
  publishedAt?: string;
};

type IgLib = {
  loadGuides: () => IgGuide[];
  buildDraft: (guide: IgGuide) => IgDraft;
  readQueue: () => { items: IgDraft[] };
  publishDraft: (item: IgDraft) => Promise<{ permalink: string; facebookPermalink: string }>;
};

export function adminSecret() {
  return process.env.INSTAGRAM_ADMIN_SECRET?.trim() ?? "";
}

function signature(secret: string) {
  return createHmac("sha256", secret).update("instagram-admin").digest("hex");
}

export async function isAdmin() {
  const secret = adminSecret();
  if (!secret) return false;
  const value = (await cookies()).get(COOKIE)?.value ?? "";
  const expected = signature(secret);
  if (value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export function adminCookie(secret: string) {
  return {
    name: COOKIE,
    value: signature(secret),
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/admin",
      maxAge: 60 * 60 * 24 * 14,
    },
  };
}

function guideList(): IgGuide[] {
  return (Object.keys(guidesByCategory) as Category[]).flatMap((category) =>
    guidesByCategory[category].map((guide) => ({
      category,
      slug: guide.slug,
      title: guide.title.it,
      excerpt: guide.excerpt.it,
    }))
  );
}

export async function igLib(): Promise<IgLib> {
  const lib = (await import("@/scripts/ig-lib.mjs")) as IgLib;
  return { ...lib, loadGuides: guideList };
}
