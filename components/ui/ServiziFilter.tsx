"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Pill,
  CreditCard,
  ShoppingBasket,
  Bus,
  PhoneCall,
  MapPin,
  Landmark,
  Umbrella,
  IceCream2,
  Ship,
  Bike,
  Sailboat,
} from "lucide-react";
import type { Servizio, CategoriaServizio } from "@/lib/servizi";
import { categorieServizi } from "@/lib/servizi";

// ─── Icon map ────────────────────────────────────────────────────────────────

const categoryIcon: Record<CategoriaServizio, React.ReactNode> = {
  Supermercati:   <ShoppingCart  className="h-3.5 w-3.5" aria-hidden />,
  Farmacie:       <Pill          className="h-3.5 w-3.5" aria-hidden />,
  Spiagge:        <Umbrella      className="h-3.5 w-3.5" aria-hidden />,
  Vela:           <Sailboat      className="h-3.5 w-3.5" aria-hidden />,
  Gelaterie:      <IceCream2     className="h-3.5 w-3.5" aria-hidden />,
  "Noleggio gommoni": <Ship className="h-3.5 w-3.5" aria-hidden />,
  "Noleggio scooter e bike": <Bike className="h-3.5 w-3.5" aria-hidden />,
  "Banche & ATM": <CreditCard   className="h-3.5 w-3.5" aria-hidden />,
  Mercato:        <ShoppingBasket className="h-3.5 w-3.5" aria-hidden />,
  Trasporti:      <Bus          className="h-3.5 w-3.5" aria-hidden />,
  Emergenze:      <PhoneCall    className="h-3.5 w-3.5" aria-hidden />,
  Musei:          <Landmark     className="h-3.5 w-3.5" aria-hidden />,
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
    noResults: string;
    openMaps: string;
    categoriesTitle: string;
  };
};

export function ServiziFilter({ servizi, labels }: Props) {
  const [activeCategory, setActiveCategory] = useState<CategoriaServizio | null>(null);

  const filtered = servizi.filter((s) => {
    return !activeCategory || s.category === activeCategory;
  });

  return (
    <div>
      {/* ── Filter chips ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-mare/10 bg-white p-5 shadow-sm">
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
  const showTeaserDescription =
    (s.category === "Spiagge" ||
      s.category === "Musei" ||
      s.category === "Mercato" ||
      s.category === "Trasporti" ||
      s.category === "Emergenze" ||
      s.category === "Banche & ATM" ||
      s.category === "Farmacie" ||
      s.category === "Supermercati") &&
    Boolean(s.description);

  return (
    <>
      <div className="min-w-0 flex-1">
        {showTeaserDescription ? (
          <div className="mb-2 overflow-hidden rounded-lg border border-mare/10 bg-slate-50">
            {s.description ? (
              <p className="px-2.5 py-2 font-sans text-[11px] leading-relaxed text-slate/70">
                {s.description}
              </p>
            ) : null}
          </div>
        ) : null}

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
        {typeof s.rating === "number" ? (
          <p className="mt-1 font-sans text-[11px] text-amber-600">
            ★ {s.rating.toFixed(1)}
            {typeof s.reviews === "number" ? ` (${s.reviews})` : ""}
          </p>
        ) : null}
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
