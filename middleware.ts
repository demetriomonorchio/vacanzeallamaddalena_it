import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Inlined to avoid any Edge Runtime module-resolution issues with relative imports.
const LOCALES = ["it", "en"] as const;
const DEFAULT_LOCALE = "it";

function isLocale(s: string): boolean {
  return (LOCALES as readonly string[]).includes(s);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const first = pathname.split("/").filter(Boolean)[0] ?? "";

  if (!isLocale(first)) {
    const destination =
      pathname === "/" ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${pathname}`;
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static | _next/image  (Next.js internals)
     * - images/                     (public/images/ static assets)
     * - api/                        (API routes)
     * - any path ending with a file extension (.ico, .webp, .xml …)
     */
    "/((?!_next/static|_next/image|images/|api/|[^/]+\\.[^/]+$).*)",
  ],
};
