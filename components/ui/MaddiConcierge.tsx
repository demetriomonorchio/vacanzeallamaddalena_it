"use client";

import type { Spiaggia } from "@/types/maddi";

type MaddiConciergeProps = {
  ventoAttuale: string;
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
  listaSpiagge,
  onSpiaggiaClick,
  className,
}: MaddiConciergeProps) {
  const spiaggeRiparate = listaSpiagge.filter(
    (spiaggia) => getBeachStatus(spiaggia, ventoAttuale) === "riparata"
  );

  return (
    <aside
      className={`absolute bottom-3 left-3 right-3 z-20 rounded-2xl border border-white/30 bg-slate-900/80 p-3 text-slate shadow-2xl backdrop-blur-md md:bottom-auto md:left-4 md:right-auto md:top-4 md:w-[380px] ${className ?? ""}`}
    >
      <p className="text-sm font-semibold leading-snug text-white">
        Maddi dice: {getMaddiMessage(ventoAttuale)}
      </p>

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
    </aside>
  );
}
