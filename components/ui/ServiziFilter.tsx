"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Pill,
  CreditCard,
  HeartPulse,
  ShoppingBasket,
  Bus,
  PhoneCall,
  MapPin,
} from "lucide-react";
import type { Servizio, CategoriaServizio, Zona } from "@/lib/servizi";
import { categorieServizi, zone } from "@/lib/servizi";

// ─── Icon map ────────────────────────────────────────────────────────────────

const categoryIcon: Record<CategoriaServizio, React.ReactNode> = {
  Supermercati:   <ShoppingCart  className="h-3.5 w-3.5" aria-hidden />,
  Farmacie:       <Pill          className="h-3.5 w-3.5" aria-hidden />,
  "Banche & ATM": <CreditCard   className="h-3.5 w-3.5" aria-hidden />,
  Ospedale:       <HeartPulse   className="h-3.5 w-3.5" aria-hidden />,
  Mercato:        <ShoppingBasket className="h-3.5 w-3.5" aria-hidden />,
  Trasporti:      <Bus          className="h-3.5 w-3.5" aria-hidden />,
  Emergenze:      <PhoneCall    className="h-3.5 w-3.5" aria-hidden />,
};

// ─── Chip component ───────────────────────────────────────────────────────────

function Chip({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-sans text-xs font-semibold transition-all duration-150 ${
        active
          ? "border-mare bg-mare text-sabbia shadow-sm"
          : "border-mare/20 bg-white text-slate/70 hover:border-mare/50 hover:text-mare"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = {
  servizi: readonly Servizio[];
  labels: {
    allCategories: string;
    allZone: string;
    noResults: string;
    openMaps: string;
    categoriesTitle: string;
    zoneTitle: string;
  };
};

export function ServiziFilter({ servizi, labels }: Props) {
  const [activeCategory, setActiveCategory] = useState<CategoriaServizio | null>(null);
  const [activeZona, setActiveZona] = useState<Zona | null>(null);

  const filtered = servizi.filter((s) => {
    const catMatch = !activeCategory || s.category === activeCategory;
    const zonaMatch = !activeZona || s.zona === activeZona;
    return catMatch && zonaMatch;
  });

  return (
    <div>
      {/* ── Filter chips ────────────────────────────────────────────────── */}
      <div className="space-y-4 rounded-2xl border border-mare/10 bg-white p-5 shadow-sm">
        {/* Row 1 — categories */}
        <div>
          <p className="mb-2.5 font-sans text-[11px] font-bold uppercase tracking-widest text-slate/40">
            {labels.categoriesTitle}
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip
              label={labels.allCategories}
              active={activeCategory === null}
              onClick={() => setActiveCategory(null)}
            />
            {categorieServizi.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                icon={categoryIcon[cat]}
                active={activeCategory === cat}
                onClick={() =>
                  setActiveCategory(activeCategory === cat ? null : cat)
                }
              />
            ))}
          </div>
        </div>

        {/* Row 2 — zone */}
        <div className="border-t border-mare/8 pt-4">
          <p className="mb-2.5 font-sans text-[11px] font-bold uppercase tracking-widest text-slate/40">
            {labels.zoneTitle}
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip
              label={labels.allZone}
              active={activeZona === null}
              onClick={() => setActiveZona(null)}
            />
            {zone.map((z) => (
              <Chip
                key={z}
                label={z}
                active={activeZona === z}
                onClick={() => setActiveZona(activeZona === z ? null : z)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Results grid ────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <p className="mt-10 text-center font-sans text-sm text-slate/50">
          {labels.noResults}
        </p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((s, i) => (
            <li key={i}>
              {s.url ? (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full items-start justify-between gap-3 rounded-xl border border-mare/10 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
                >
                  <ServiceCardInner s={s} openMaps={labels.openMaps} linked />
                </a>
              ) : (
                <div className="flex h-full items-start justify-between gap-3 rounded-xl border border-mare/10 bg-white p-4 shadow-sm">
                  <ServiceCardInner s={s} openMaps={labels.openMaps} linked={false} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Card inner ───────────────────────────────────────────────────────────────

function ServiceCardInner({
  s,
  openMaps,
  linked,
}: {
  s: Servizio;
  openMaps: string;
  linked: boolean;
}) {
  return (
    <>
      <div className="min-w-0 flex-1">
        {/* Category icon + name */}
        <div className="flex items-center gap-1.5">
          <span className="shrink-0 text-mare/60">
            {categoryIcon[s.category]}
          </span>
          <span className="truncate font-sans text-sm font-semibold text-slate">
            {s.name}
          </span>
        </div>

        {/* Zone badge */}
        <span className="mt-1.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 font-sans text-[10px] text-slate/60">
          {s.zona}
        </span>
      </div>

      {/* Maps pin — only when linked */}
      {linked && (
        <MapPin
          className="mt-0.5 h-4 w-4 shrink-0 text-slate/30 transition-colors group-hover:text-mare"
          aria-label={openMaps}
        />
      )}
    </>
  );
}
