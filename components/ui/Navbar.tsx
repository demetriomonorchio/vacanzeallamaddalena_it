"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { categories, categoryLabels } from "@/lib/categories";
import type { Locale } from "@/lib/i18n";

type NavbarProps = {
  locale: Locale;
};

const langSwitchLabel: Record<Locale, string> = {
  it: "English",
  en: "Italiano",
};

const appartamentiLabel: Record<Locale, string> = {
  it: "Appartamenti",
  en: "Apartments",
};

const serviziLabel: Record<Locale, string> = {
  it: "Servizi",
  en: "Services",
};

const mobileMenuAria: Record<Locale, { open: string; close: string; nav: string }> = {
  it: {
    open: "Apri il menu di navigazione",
    close: "Chiudi il menu di navigazione",
    nav: "Menu di navigazione",
  },
  en: {
    open: "Open navigation menu",
    close: "Close navigation menu",
    nav: "Navigation menu",
  },
};

export function Navbar({ locale }: NavbarProps) {
  const other: Locale = locale === "it" ? "en" : "it";
  const pathname = usePathname();

  // Home page = exactly "/it" or "/en"
  const isHome = pathname === `/${locale}` || pathname === "/";

  // On home: transparent until scrolled; on all other pages: always solid
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // isSolid drives every style decision:
  // – subpages → always true
  // – home     → true only after scrolling 10px
  const isSolid = !isHome || scrolled;
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [navHeight, setNavHeight] = useState(0);

  const solidChrome = isSolid || menuOpen;

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => setNavHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    onChange();
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const mobileNav = mobileMenuAria[locale];

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solidChrome
          ? "border-b border-mare/10 bg-sabbia shadow-sm"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      {/* Primary row — logo + CTA + lang (desktop) | hamburger (mobile) */}
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-6 py-3 md:px-10 md:py-4">
        <Link href={`/${locale}`} className="flex min-w-0 shrink items-center md:mr-8">
          <Image
            src="/images/home/logo.webp"
            alt="Vacanze alla Maddalena - Logo"
            width={240}
            height={84}
            className="h-[56px] w-auto max-w-[min(100%,13rem)] object-contain object-left md:h-[78px] md:max-w-none"
            priority
          />
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href={`/${locale}/appartamenti`}
            className={`rounded px-4 py-1.5 font-sans text-xs font-bold tracking-wide transition-all duration-300 ${
              solidChrome
                ? "bg-mare text-sabbia hover:opacity-80"
                : "bg-sabbia/90 text-mare hover:bg-sabbia"
            }`}
          >
            {appartamentiLabel[locale]}
          </Link>

          <Link
            href={`/${other}`}
            hrefLang={other}
            className={`font-sans text-xs font-semibold underline-offset-4 transition-colors duration-300 hover:underline ${
              solidChrome
                ? "text-slate/50 hover:text-mare"
                : "text-white drop-shadow-md hover:text-sabbia"
            }`}
          >
            {langSwitchLabel[locale]}
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1 md:hidden">
          <Link
            href={`/${other}`}
            hrefLang={other}
            className={`font-sans text-sm font-semibold underline-offset-4 transition-colors duration-300 hover:underline ${
              solidChrome
                ? "text-slate/50 hover:text-mare"
                : "text-white drop-shadow-md hover:text-sabbia"
            }`}
          >
            {langSwitchLabel[locale]}
          </Link>
          <button
            type="button"
            className={`${solidChrome ? "text-mare" : "text-white drop-shadow-md"} rounded-md p-2 transition-colors hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mare`}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">
              {menuOpen ? mobileNav.close : mobileNav.open}
            </span>
            {menuOpen ? (
              <X className="h-7 w-7" strokeWidth={2} aria-hidden />
            ) : (
              <Menu className="h-7 w-7" strokeWidth={2} aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/* Secondary row — category navigation (tablet/desktop) */}
      <nav
        aria-label={locale === "it" ? "Categorie" : "Categories"}
        className={`hidden border-t transition-colors duration-300 md:block ${
          solidChrome ? "border-mare/10" : "border-white/10"
        }`}
      >
        <ul className="mx-auto flex max-w-content gap-0 overflow-x-auto px-4 md:px-8">
          {categories.map((cat) => (
            <li key={cat}>
              <Link
                href={`/${locale}/${cat}`}
                className={`inline-block whitespace-nowrap px-3 py-2.5 font-sans text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${
                  solidChrome
                    ? "text-mare/70 hover:text-mare"
                    : "text-white drop-shadow-md hover:text-sabbia"
                }`}
              >
                {categoryLabels[cat][locale]}
              </Link>
            </li>
          ))}

          {/* Divider + Servizi — practical section separated from editorial categories */}
          <li
            aria-hidden
            className={`my-auto mx-2 h-3.5 w-px shrink-0 ${
              solidChrome ? "bg-mare/20" : "bg-white/20"
            }`}
          />
          <li>
            <Link
              href={`/${locale}/servizi`}
              className={`inline-block whitespace-nowrap px-3 py-2.5 font-sans text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${
                solidChrome
                  ? "text-mare/70 hover:text-mare"
                  : "text-white drop-shadow-md hover:text-sabbia"
              }`}
            >
              {serviziLabel[locale]}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Mobile full-screen panel below header */}
      {menuOpen ? (
        <>
          <div
            className="fixed inset-x-0 z-40 bg-black/35 md:hidden"
            style={{ top: navHeight, bottom: 0 }}
            aria-hidden
            onClick={() => setMenuOpen(false)}
            role="presentation"
          />
          <div
            id="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label={mobileNav.nav}
            className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto overscroll-contain border-t border-mare/15 bg-sabbia shadow-lg md:hidden"
            style={{ top: navHeight, maxHeight: `calc(100dvh - ${navHeight}px)` }}
          >
            <nav className="mx-auto max-w-content px-6 pb-10 pt-2">
              <div className="flex justify-end border-b border-mare/10 pb-3">
                <button
                  type="button"
                  className="rounded-md px-3 py-2 font-sans text-sm font-semibold text-mare underline-offset-4 hover:underline"
                  onClick={() => setMenuOpen(false)}
                >
                  {mobileNav.close}
                </button>
              </div>
              <ul className="mt-2 flex flex-col">
                <li className="border-b border-mare/10">
                  <Link
                    href={`/${locale}/appartamenti`}
                    className="block py-4 font-sans text-base font-bold text-mare"
                    onClick={() => setMenuOpen(false)}
                  >
                    {appartamentiLabel[locale]}
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat} className="border-b border-mare/10">
                    <Link
                      href={`/${locale}/${cat}`}
                      className="block py-4 font-sans text-sm font-bold uppercase tracking-widest text-mare/85"
                      onClick={() => setMenuOpen(false)}
                    >
                      {categoryLabels[cat][locale]}
                    </Link>
                  </li>
                ))}
                <li className="border-b border-mare/10">
                  <Link
                    href={`/${locale}/servizi`}
                    className="block py-4 font-sans text-sm font-bold uppercase tracking-widest text-mare/85"
                    onClick={() => setMenuOpen(false)}
                  >
                    {serviziLabel[locale]}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  );
}
