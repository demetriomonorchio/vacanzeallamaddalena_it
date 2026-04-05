"use client";

import Image from "next/image";
import { useMemo } from "react";
import type { Category } from "@/lib/categories";

type Props = {
  /** `null` se il file non esiste: si mostra il placeholder con il nome atteso. */
  src: string | null;
  expectedBasename: string;
  category: Category;
  pageSlug: string;
  captionTitle: string;
  rotationDeg: number;
  missingLabel: string;
  className?: string;
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Scotch su angolo: resta sul bordo / bacheca, non sulla foto. */
function ScotchCorner({ variant }: { variant: number }) {
  const isLeft = variant % 2 === 0;
  return (
    <div
      className={`pointer-events-none absolute z-30 h-9 w-14 shadow-md ${
        isLeft
          ? "-left-1 top-1 origin-top-left -rotate-[32deg]"
          : "-right-1 top-1 origin-top-right rotate-[28deg]"
      }`}
      aria-hidden
    >
      <div
        className="h-full w-full rounded-[2px] bg-gradient-to-br from-amber-50/95 via-amber-200/85 to-amber-300/75 opacity-95 ring-1 ring-amber-900/25 backdrop-blur-[1px]"
        style={{
          boxShadow:
            "inset 0 1px 0 rgb(255 255 255 / 0.5), 0 2px 4px rgb(0 0 0 / 0.12)",
        }}
      />
    </div>
  );
}

/** Puntina da bacheca (testa + ago). */
function PushPin({ variant }: { variant: number }) {
  const pos =
    variant % 3 === 0
      ? "left-[14%] -translate-x-1/2"
      : variant % 3 === 1
        ? "left-1/2 -translate-x-1/2"
        : "left-[86%] -translate-x-1/2";

  return (
    <div
      className={`pointer-events-none absolute -top-2 z-30 ${pos}`}
      aria-hidden
    >
      <div className="flex flex-col items-center">
        <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-900 shadow-[0_2px_3px_rgba(0,0,0,0.35)] ring-1 ring-red-950/30" />
        <div className="-mt-px h-2.5 w-px rounded-full bg-gradient-to-b from-slate-300 via-slate-400 to-slate-600 shadow-sm" />
      </div>
    </div>
  );
}

export function UtilitiesPolaroidInner({
  src,
  expectedBasename,
  category,
  pageSlug,
  captionTitle,
  rotationDeg,
  missingLabel,
  className = "",
}: Props) {
  const relativePath = `images/${category}/${pageSlug}/${expectedBasename}.png`;

  const attachment = useMemo(() => {
    const h = hashString(`${category}/${pageSlug}:${expectedBasename}`);
    return {
      mode: h % 2 === 0 ? ("tape" as const) : ("pin" as const),
      variant: Math.floor(h / 3) % 8,
    };
  }, [category, pageSlug, expectedBasename]);

  return (
    <div
      className={`relative shrink-0 rounded-lg bg-gradient-to-br from-[#d4b896] via-[#c4a574] to-[#a67c52] p-2.5 shadow-[inset_0_2px_4px_rgb(255_255_255_/_0.25),inset_0_-3px_6px_rgb(0_0_0_/_0.12)] ring-1 ring-amber-950/15 transition-transform duration-300 hover:z-10 hover:scale-[1.02] ${className}`}
      style={{
        transform: `rotate(${rotationDeg}deg)`,
        backgroundImage: `
          radial-gradient(ellipse at 20% 30%, rgb(255 255 255 / 0.12) 0%, transparent 45%),
          radial-gradient(ellipse at 80% 70%, rgb(0 0 0 / 0.06) 0%, transparent 40%)
        `,
      }}
    >
      <figure className="relative m-0" aria-label={captionTitle}>
        <div className="relative">
          {attachment.mode === "tape" ? (
            <ScotchCorner variant={attachment.variant} />
          ) : (
            <PushPin variant={attachment.variant} />
          )}

          <div className="relative rounded-md bg-white px-5 pb-4 pt-5 shadow-2xl ring-1 ring-slate-200/60">
            <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-slate-100 ring-1 ring-slate-200/40">
              {src ? (
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 176px, 208px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-sabbia/40 p-3 text-center">
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

            <figcaption className="mt-3 min-h-[2.5rem] px-1 text-center font-handwriting text-xl font-semibold leading-tight text-mare md:text-2xl">
              {captionTitle}
            </figcaption>
          </div>
        </div>
      </figure>
    </div>
  );
}
