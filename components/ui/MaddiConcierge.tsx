"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { Spiaggia } from "@/types/maddi";
import type { Locale } from "@/lib/i18n";
import { servizi } from "@/lib/servizi";
import { MADDI_LOCATIONS } from "@/src/data/maddi-data";

type MaddiConciergeProps = {
  ventoAttuale: string;
  isStrongWind?: boolean;
  selectedCategory?: "spiagge" | "food" | "case";
  selectedLocation?: {
    name: string;
    maddiTip?: string;
    maddiNote?: string;
  };
  listaSpiagge: Spiaggia[];
  onSpiaggiaClick?: (spiaggia: Spiaggia) => void;
  className?: string;
  locale?: Locale;
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
function getMaddiMessage(vento: string, locale: Locale) {
  if (locale === "en") {
    return `Hi! With this ${vento}, here are the best sheltered beaches for today.`;
  }
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
  ventoAttuale: string,
  isStrongWind: boolean,
  locale: Locale,
  favoriteNames: string[],
  selectedLocation?: {
    name: string;
    maddiTip?: string;
    maddiNote?: string;
  }
) {
  const strongWindAlert =
    locale === "en"
      ? isStrongWind
        ? " Warning: strong wind today!"
        : ""
      : isStrongWind
        ? " Attenzione, oggi il vento è forte!"
        : "";

  const selectedLocationAdvice = selectedLocation?.maddiNote ?? selectedLocation?.maddiTip;
  if (selectedLocation && selectedLocationAdvice) {
    if (locale === "en") {
      return `For ${selectedLocation.name}, my advice is: ${selectedLocationAdvice}.${strongWindAlert}`;
    }
    return `Per ${selectedLocation.name} il mio consiglio e: ${selectedLocationAdvice}.${strongWindAlert}`;
  }

  if (selectedCategory === "spiagge") {
    if (favoriteNames.length > 0) {
      const picks = favoriteNames.slice(0, 3).join(", ");
      return locale === "en"
        ? `${getMaddiMessage(ventoAttuale, locale)} My top picks: ${picks}.${strongWindAlert}`
        : `${getMaddiMessage(ventoAttuale, locale)} I miei top consigli: ${picks}.${strongWindAlert}`;
    }
    return `${getMaddiMessage(ventoAttuale, locale)}${strongWindAlert}`;
  }
  if (selectedCategory === "food") {
    if (favoriteNames.length > 0) {
      const picks = favoriteNames.slice(0, 3).join(", ");
      if (locale === "en") {
        return `Hungry? Here are my favorite spots: ${picks}.${strongWindAlert}`;
      }
      return `Hai fame? Ecco i miei posti preferiti: ${picks}.${strongWindAlert}`;
    }
    if (locale === "en") {
      return `Hungry? Here are my favorite spots.${strongWindAlert}`;
    }
    return `Hai fame? Ecco i miei posti preferiti.${strongWindAlert}`;
  }
  if (selectedCategory === "case") {
    if (favoriteNames.length > 0) {
      const picks = favoriteNames.slice(0, 3).join(", ");
      if (locale === "en") {
        return `Looking for where to stay? My favorite homes are: ${picks}.${strongWindAlert}`;
      }
      return `Stai cercando dove dormire? Le mie case preferite sono: ${picks}.${strongWindAlert}`;
    }
    if (locale === "en") {
      return `Looking for where to stay? These homes are managed directly by me for maximum comfort.${strongWindAlert}`;
    }
    return `Stai cercando dove dormire? Queste case sono gestite direttamente da me, il comfort è assicurato.${strongWindAlert}`;
  }
  if (locale === "en") {
    return `Hi! I'm Maddi, pick a category and I'll help you find the right place.${strongWindAlert}`;
  }
  return `Ciao! Sono Maddi, scegli una categoria e ti aiuto a trovare il posto giusto.${strongWindAlert}`;
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
  isStrongWind = false,
  selectedCategory,
  selectedLocation,
  listaSpiagge,
  onSpiaggiaClick,
  className,
  locale = "it",
}: MaddiConciergeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const favoriteNamesByCategory = useMemo(() => {
    if (selectedCategory === "food") {
      return servizi
        .filter(
          (servizio) =>
            (servizio.category === "Ristoranti" || servizio.category === "Gelaterie") &&
            servizio.isFavorite === true
        )
        .map((servizio) => servizio.name);
    }

    if (selectedCategory === "spiagge") {
      return servizi
        .filter((servizio) => servizio.category === "Spiagge" && servizio.isFavorite === true)
        .map((servizio) => servizio.name);
    }

    if (selectedCategory === "case") {
      return MADDI_LOCATIONS.filter(
        (location) => location.type === "alloggio" && location.isFavorite === true
      ).map((location) => location.name);
    }

    return [];
  }, [selectedCategory]);
  const messaggioMaddi = useMemo(
    () =>
      getCategoryMessage(
        selectedCategory,
        ventoAttuale,
        isStrongWind,
        locale,
        favoriteNamesByCategory,
        selectedLocation
      ),
    [
      favoriteNamesByCategory,
      isStrongWind,
      locale,
      selectedCategory,
      selectedLocation,
      ventoAttuale,
    ]
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
        <Image
          src="/images/maddi-avatar.webp"
          alt="Maddi avatar"
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover border border-white/20 shadow-md"
        />
        <span className="text-xs font-semibold">
          {locale === "en" ? "Maddi has a tip..." : "Maddi ha un consiglio..."}
        </span>
      </button>
    );
  }

  return (
    <aside
      className={`absolute bottom-3 left-3 right-3 z-20 rounded-2xl border border-white/30 bg-slate-900/80 p-3 text-slate shadow-2xl backdrop-blur-md md:bottom-auto md:left-4 md:right-auto md:top-4 md:w-[380px] ${className ?? ""}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-4">
          <Image
            src="/images/maddi-avatar.webp"
            alt="Maddi avatar"
            width={56}
            height={56}
            className="w-14 h-14 rounded-full object-cover border-2 border-white/20 shadow-xl"
          />
          <div>
            <h3 className="text-sm font-semibold text-white">
              {locale === "en" ? "Maddi says:" : "Maddi dice:"}
            </h3>
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
          aria-label={locale === "en" ? "Close Maddi panel" : "Chiudi pannello Maddi"}
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
              onClick={() => onSpiaggiaClick?.(spiaggia)}
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
