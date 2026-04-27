import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANONICAL_HOST = "vacanzeallamaddalena.it";

function hasFileExtension(pathname: string) {
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  let shouldRedirect = false;

  // Force canonical host (non-www) for SEO consistency.
  if (url.hostname === `www.${CANONICAL_HOST}`) {
    url.hostname = CANONICAL_HOST;
    shouldRedirect = true;
  }

  // Remove query params from content pages to avoid duplicate crawl URLs.
  if (url.searchParams.size > 0) {
    const isInternalPath =
      url.pathname.startsWith("/_next") ||
      url.pathname.startsWith("/api") ||
      url.pathname.startsWith("/images") ||
      url.pathname.startsWith("/data") ||
      hasFileExtension(url.pathname);
    if (!isInternalPath) {
      url.search = "";
      shouldRedirect = true;
    }
  }

  if (shouldRedirect) {
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
