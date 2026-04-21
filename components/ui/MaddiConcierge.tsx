"use client";

import { useEffect, useMemo, useState } from "react";
import type { Spiaggia } from "@/types/maddi";

type MaddiConciergeProps = {
  ventoAttuale: string;
  selectedCategory?: "spiagge" | "food" | "case";
  listaSpiagge: Spiaggia[];
  onSpiaggiaClick?: (coordinates: [number, number]) => void;
  className?: string;
};

type BeachStatus = "riparata" | "esposta";
const VENTO_TO_SIGLA: Record<string, string> = {
  TRAMONTANA: "N",
  GRECALE: "NE",
  LEVANTE: "E",
  SCIROCCO: "SE",
  OSTRO: "S",
  LIBECCIO: "SW",
  PONENTE: "W",
  MAESTRALE: "NW",
  "NORD-OVEST": "NW",
  "NORD OVEST": "NW",
  "NORD-EST": "NE",
  "NORD EST": "NE",
  "SUD-OVEST": "SW",
  "SUD OVEST": "SW",
  "SUD-EST": "SE",
  "SUD EST": "SE",
};

// Funzione che restituisce il messaggio dinamico in base al vento
function getMaddiMessage(vento: string) {
  const n = vento.trim().toUpperCase();
  if (n === "MAESTRALE" || n === "NW" || n === "NORD OVEST" || n === "NORD-OVEST") {
    return "Oggi il Maestrale soffia forte! Ti ho selezionato le calette di Caprera e il versante Sud, dove l'acqua è una piscina.";
  }
  if (n === "SCIROCCO" || n === "SE" || n === "SUD EST" || n === "SUD-EST") {
    return "Con questo Scirocco, corri a Bassa Trinita o Monti d'à Rena. Sono i giorni migliori per vedere i colori del Nord-Ovest!";
  }
  if (n === "GRECALE" || n === "NE" || n === "NORD EST" || n === "NORD-EST") {
    return "Vento da Est? Punta Tegge e le spiagge verso Nido d'Aquila sono il tuo rifugio ideale oggi.";
  }
  // Default generico
  return `Ciao! Con questo ${vento}, le spiagge migliori sono...`;
}

function getCategoryMessage(
  selectedCategory: "spiagge" | "food" | "case" | undefined,
  ventoAttuale: string
) {
  if (selectedCategory === "spiagge") {
    return getMaddiMessage(ventoAttuale);
  }
  if (selectedCategory === "food") {
    return "Hai fame? Ecco i miei posti preferiti. Il pesce da Zi Antò è una garanzia.";
  }
  if (selectedCategory === "case") {
    return "Stai cercando dove dormire? Queste case sono gestite direttamente da me, il comfort è assicurato.";
  }
  return "Ciao! Sono Maddi, scegli una categoria e ti aiuto a trovare il posto giusto.";
}

function normalizeVento(value: string) {
  const normalized = value.trim().toUpperCase();
  return VENTO_TO_SIGLA[normalized] ?? normalized;
}

function getBeachStatus(spiaggia: Spiaggia, direzioneVento: string): BeachStatus {
  const vento = normalizeVento(direzioneVento);
  const esposizione = spiaggia.esposizione.map(normalizeVento);
  return esposizione.includes(vento) ? "esposta" : "riparata";
}

export function MaddiConcierge({
  ventoAttuale,
  selectedCategory,
  listaSpiagge,
  onSpiaggiaClick,
  className,
}: MaddiConciergeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const messaggioMaddi = useMemo(
    () => getCategoryMessage(selectedCategory, ventoAttuale),
    [selectedCategory, ventoAttuale]
  );
  const [typedMessage, setTypedMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isExpanded) {
      setTypedMessage("");
      setIsTyping(false);
      return;
    }

    let cursor = 0;
    let timerId: number;

    setTypedMessage("");
    setIsTyping(true);

    const typeNextChar = () => {
      cursor += 1;
      setTypedMessage(messaggioMaddi.slice(0, cursor));

      if (cursor < messaggioMaddi.length) {
        timerId = window.setTimeout(typeNextChar, 18);
      } else {
        setIsTyping(false);
      }
    };

    timerId = window.setTimeout(typeNextChar, 120);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [isExpanded, messaggioMaddi]);

  const spiaggeRiparate = listaSpiagge.filter(
    (spiaggia) => getBeachStatus(spiaggia, ventoAttuale) === "riparata"
  );

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className={`absolute bottom-3 left-3 z-20 inline-flex items-center gap-2 rounded-full border border-white/30 bg-slate-900/80 px-3 py-2 text-left text-white shadow-2xl backdrop-blur-md transition-colors hover:bg-slate-800/85 md:bottom-auto md:left-4 md:top-4 ${className ?? ""}`}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-200/90 text-base">
          ✨
        </span>
        <span className="text-xs font-semibold">Maddi ha un consiglio...</span>
      </button>
    );
  }

  return (
    <aside
      className={`absolute bottom-3 left-3 right-3 z-20 rounded-2xl border border-white/30 bg-slate-900/80 p-3 text-slate shadow-2xl backdrop-blur-md md:bottom-auto md:left-4 md:right-auto md:top-4 md:w-[380px] ${className ?? ""}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-4">
          <img
            src="/images/maddi-avatar.webp"
            alt="Maddi avatar"
            className="w-14 h-14 rounded-full object-cover border-2 border-white/20 shadow-xl"
          />
          <div>
            <h3 className="text-sm font-semibold text-white">Maddi dice:</h3>
            <p className="text-sm font-semibold leading-snug text-white">
              {typedMessage}
              {isTyping ? (
                <span className="ml-0.5 inline-block animate-pulse text-white" aria-hidden="true">
                  |
                </span>
              ) : null}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-white/10 text-sm font-bold text-white transition-colors hover:bg-white/20"
          aria-label="Chiudi pannello Maddi"
        >
          ×
        </button>
      </div>

      {selectedCategory === "spiagge" ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {spiaggeRiparate.map((spiaggia, index) => (
            <button
              key={`${spiaggia.name}-${spiaggia.coordinates[0]}-${spiaggia.coordinates[1]}-${index}`}
              type="button"
              onClick={() => onSpiaggiaClick?.(spiaggia.coordinates)}
              className="min-w-[180px] rounded-xl border border-white/40 bg-white/55 p-2 text-left shadow-sm transition-colors hover:bg-white/70"
            >
              <p className="truncate text-xs font-semibold text-slate">{spiaggia.name}</p>
              {spiaggia.zona ? (
                <p className="mt-1 text-[11px] text-slate/75">{spiaggia.zona}</p>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
