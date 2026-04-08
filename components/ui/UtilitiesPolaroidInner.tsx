"use client";

import Image from "next/image";
import { useId, useMemo } from "react";
import type { Category } from "@/lib/categories";

type Props = {
  /** `null` se il file non esiste: si mostra il placeholder con il nome atteso. */
  src: string | null;
  expectedBasename: string;
  category: Category;
  pageSlug: string;
  rotationDeg: number;
  missingLabel: string;
  className?: string;
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Bordo irregolare tipo pennellata non finita (clip-path deterministico). */
function paintBrushClipPath(seed: number): string {
  const rnd = mulberry32(seed);
  const j = () => (rnd() - 0.5) * 2.5;
  const n = 7;
  const pts: [number, number][] = [];

  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([t * 100 + j(), 0 + j()]);
  }
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    pts.push([100 + j(), t * 100 + j()]);
  }
  for (let i = 1; i <= n; i++) {
    const t = 1 - i / n;
    pts.push([t * 100 + j(), 100 + j()]);
  }
  for (let i = 1; i < n; i++) {
    const t = 1 - i / n;
    pts.push([0 + j(), t * 100 + j()]);
  }

  return `polygon(${pts.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(",")})`;
}

/**
 * Quadrato “parete dipinta”, colori più brillanti + leggere variazioni tipo pennello.
 * (Rosa / marrone / azzurro / verde acqua — toni vivaci ma non neon.)
 */
const PAINTED_WALL_BASE: readonly string[] = [
  `radial-gradient(ellipse 85% 70% at 25% 30%, rgb(255 195 200 / 0.55) 0%, transparent 55%),
   radial-gradient(ellipse 60% 80% at 80% 75%, rgb(230 120 140 / 0.4) 0%, transparent 50%),
   linear-gradient(152deg, rgb(248 130 150) 0%, rgb(255 175 185) 42%, rgb(235 105 130) 100%)`,
  `radial-gradient(ellipse 80% 65% at 70% 25%, rgb(255 200 150 / 0.45) 0%, transparent 50%),
   radial-gradient(ellipse 55% 70% at 20% 80%, rgb(200 120 70 / 0.35) 0%, transparent 48%),
   linear-gradient(148deg, rgb(210 140 85) 0%, rgb(235 175 110) 45%, rgb(185 110 60) 100%)`,
  `radial-gradient(ellipse 75% 75% at 30% 70%, rgb(180 230 255 / 0.5) 0%, transparent 52%),
   radial-gradient(ellipse 65% 60% at 85% 30%, rgb(120 195 245 / 0.4) 0%, transparent 50%),
   linear-gradient(145deg, rgb(95 175 235) 0%, rgb(140 210 255) 48%, rgb(70 155 220) 100%)`,
  `radial-gradient(ellipse 70% 80% at 75% 65%, rgb(160 245 225 / 0.45) 0%, transparent 52%),
   radial-gradient(ellipse 80% 55% at 15% 25%, rgb(100 210 190 / 0.38) 0%, transparent 48%),
   linear-gradient(140deg, rgb(65 195 175) 0%, rgb(120 225 205) 46%, rgb(45 175 155) 100%)`,
];

/** Nastro orizzontale: lati corti sinistro e destro seghettati (SVG). */
function SerratedTape({
  wrapperClassName,
  rotationDeg,
  gradId,
}: {
  wrapperClassName: string;
  rotationDeg: number;
  gradId: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute z-30 ${wrapperClassName}`}
      aria-hidden
    >
      <div
        className="origin-center"
        style={{ transform: `rotate(${rotationDeg}deg)` }}
      >
        <svg
          width="36"
          height="10"
          viewBox="0 0 48 12"
          className="h-2.5 w-[2.85rem] drop-shadow-[0_1px_2px_rgba(0,0,0,0.14)] md:h-3.5 md:w-[3.15rem]"
          preserveAspectRatio="none"
        >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(255 252 245)" stopOpacity="0.88" />
            <stop offset="50%" stopColor="rgb(248 238 220)" stopOpacity="0.72" />
            <stop offset="100%" stopColor="rgb(232 218 195)" stopOpacity="0.68" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${gradId})`}
          d="M 0,12 L 1.4,10.5 L 0,9 L 1.4,7.5 L 0,6 L 1.4,4.5 L 0,3 L 1.4,1.5 L 0,0 L 48,0 L 48,1.5 L 46.6,3 L 48,4.5 L 46.6,6 L 48,7.5 L 46.6,9 L 48,10.5 L 46.6,12 L 0,12 Z"
        />
        <path
          d="M 0,12 L 1.4,10.5 L 0,9 L 1.4,7.5 L 0,6 L 1.4,4.5 L 0,3 L 1.4,1.5 L 0,0 L 48,0 L 48,1.5 L 46.6,3 L 48,4.5 L 46.6,6 L 48,7.5 L 46.6,9 L 48,10.5 L 46.6,12 L 0,12 Z"
          fill="none"
          stroke="rgb(180 160 130 / 0.35)"
          strokeWidth="0.35"
        />
        </svg>
      </div>
    </div>
  );
}

type TapeSpec = { wrapperClassName: string; rotation: number; gradSuffix: string };

/**
 * Nastri sugli angoli della cornice bianca.
 * Regole: 1 nastro → solo angoli alti. 2 nastri → mai entrambi solo in basso (serve sempre almeno uno in alto).
 */
function buildTapeLayout(h: number): { tapes: TapeSpec[] } {
  const two = (h >> 5) % 2 === 1;
  const opposite = (h >> 7) % 2 === 0;

  if (!two) {
    /** Un solo nastro: solo in alto (sinistro o destro). */
    const topOnly = h % 2;
    const topCorners: TapeSpec[] = [
      {
        wrapperClassName:
          "left-0 top-0 -translate-x-[14%] -translate-y-[32%]",
        rotation: -43,
        gradSuffix: "a",
      },
      {
        wrapperClassName:
          "right-0 top-0 translate-x-[14%] -translate-y-[32%]",
        rotation: 43,
        gradSuffix: "a",
      },
    ];
    return { tapes: [topCorners[topOnly]!] };
  }

  if (opposite) {
    /** Due nastri in diagonale: sempre uno in alto + uno in basso (mai due solo sotto). */
    const flip = h % 2 === 1;
    if (flip) {
      return {
        tapes: [
          {
            wrapperClassName:
              "right-0 top-0 translate-x-[14%] -translate-y-[32%]",
            rotation: 43,
            gradSuffix: "a",
          },
          {
            wrapperClassName:
              "bottom-0 left-0 -translate-x-[14%] translate-y-[32%]",
            rotation: 43,
            gradSuffix: "b",
          },
        ],
      };
    }
    return {
      tapes: [
        {
          wrapperClassName:
            "left-0 top-0 -translate-x-[14%] -translate-y-[32%]",
          rotation: -43,
          gradSuffix: "a",
        },
        {
          wrapperClassName:
            "bottom-0 right-0 translate-x-[14%] translate-y-[32%]",
          rotation: 136,
          gradSuffix: "b",
        },
      ],
    };
  }

  /** Due nastri entrambi in alto (sinistro + destro). */
  return {
    tapes: [
      {
        wrapperClassName:
          "left-0 top-0 -translate-x-[14%] -translate-y-[32%]",
        rotation: -42,
        gradSuffix: "a",
      },
      {
        wrapperClassName:
          "right-0 top-0 translate-x-[14%] -translate-y-[32%]",
        rotation: 42,
        gradSuffix: "b",
      },
    ],
  };
}

export function UtilitiesPolaroidInner({
  src,
  expectedBasename,
  category,
  pageSlug,
  rotationDeg,
  missingLabel,
  className = "",
}: Props) {
  const reactId = useId().replace(/:/g, "");
  const relativePath = `images/${category}/${pageSlug}/${expectedBasename}.png`;

  const decor = useMemo(() => {
    const h = hashString(`${category}/${pageSlug}:${expectedBasename}`);
    const wallIdx = h % PAINTED_WALL_BASE.length;
    const gradBase = `${reactId}-${h % 10000}`;
    const { tapes } = buildTapeLayout(h);
    const clipPath = paintBrushClipPath(h ^ 0x9e3779b9);
    return {
      wallBackground: PAINTED_WALL_BASE[wallIdx],
      clipPath,
      tapes: tapes.map((t) => ({
        ...t,
        gradId: `${gradBase}-${t.gradSuffix}`,
      })),
    };
  }, [category, pageSlug, expectedBasename, reactId]);

  return (
    <div
      className={`relative shrink-0 transition-transform duration-300 hover:z-10 hover:scale-[1.02] ${className}`}
      style={{ transform: `rotate(${rotationDeg}deg)` }}
    >
      <div className="relative isolate block w-full max-w-full overflow-visible">
        {/* Macchia parete: centrata sulla polaroid, abbastanza grande da restare sotto tutta la cornice. */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[128%] md:w-[132%]"
          style={{
            background: decor.wallBackground,
            clipPath: decor.clipPath,
            WebkitClipPath: decor.clipPath,
            transform: "translate(-50%, -50%)",
            boxShadow: `
              inset 0 0 0 1px rgb(255 255 255 / 0.22),
              inset 0 0 40px rgb(255 255 255 / 0.12),
              inset 0 -20px 40px rgb(0 0 0 / 0.06),
              0 5px 18px rgb(0 0 0 / 0.08)
            `,
            filter: "saturate(1.05) drop-shadow(0 2px 6px rgb(0 0 0 / 0.07))",
          }}
          aria-hidden
        />

        <figure className="relative z-10 m-0">
          <div className="relative">
            {decor.tapes.map((tape, i) => (
              <SerratedTape
                key={i}
                wrapperClassName={tape.wrapperClassName}
                rotationDeg={tape.rotation}
                gradId={tape.gradId}
              />
            ))}

            <div className="relative max-w-full rounded-sm bg-white p-4 shadow-[0_8px_28px_rgba(0,0,0,0.14),0_2px_6px_rgba(0,0,0,0.06)] ring-1 ring-slate-200/55">
              <div className="relative w-full overflow-hidden rounded-sm bg-slate-100 pb-[100%]">
                {src ? (
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 176px, 208px"
                    className="object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-sabbia/40 p-3 text-center">
                    <p className="font-sans text-[10px] font-medium uppercase tracking-wide text-slate/50">
                      {missingLabel}
                    </p>
                    <p className="break-all font-mono text-[11px] leading-snug text-mare">
                      {expectedBasename}.png
                    </p>
                    <p className="break-all font-mono text-[9px] leading-tight text-slate/60">
                      public/{relativePath}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </figure>
      </div>
    </div>
  );
}
