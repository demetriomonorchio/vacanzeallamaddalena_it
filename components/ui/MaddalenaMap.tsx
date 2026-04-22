"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { MADDI_LOCATIONS } from "@/src/data/maddi-data";
import { serviziSpiagge } from "@/lib/serviziSpiagge";
import { serviziBanche } from "@/lib/serviziBanche";
import { serviziSupermercati } from "@/lib/serviziSupermercati";
import { serviziEmergenze } from "@/lib/serviziEmergenze";
import { serviziFarmacie } from "@/lib/serviziFarmacie";
import { serviziMercati } from "@/lib/serviziMercati";
import { serviziMusei } from "@/lib/serviziMusei";
import { serviziTrasporti } from "@/lib/serviziTrasporti";
import { serviziVela } from "@/lib/serviziVela";
import { serviziDiving } from "@/lib/serviziDiving";
import { serviziWindsurfKite } from "@/lib/serviziWindsurfKite";
import { serviziGelaterie } from "@/lib/serviziGelaterie";
import { serviziNoleggioGommoni } from "@/lib/serviziNoleggioGommoni";
import { serviziNoleggioScooterBike } from "@/lib/serviziNoleggioScooterBike";
import type { Spiaggia } from "@/types/maddi";
import type { Servizio } from "@/lib/servizi";
import type { Locale } from "@/lib/i18n";
import { MaddiConcierge } from "@/components/ui/MaddiConcierge";
import { WeatherWidget } from "@/components/ui/WeatherWidget";
import { getMaddalenaWind, type MaddalenaWind } from "@/lib/weatherService";

type MaddalenaMapProps = {
  className?: string;
  heightClassName?: string;
  mapboxToken?: string;
  mapStyle?: string;
  center?: [number, number];
  zoom?: number;
  locale?: Locale;
};

const defaultCenter: [number, number] = [9.4095, 41.2145];

type FiltroAttivo =
  | "spiagge"
  | "food"
  | "alloggi"
  | "banche"
  | "supermercati"
  | "farmacie"
  | "mercati"
  | "emergenze"
  | "musei"
  | "trasporti"
  | "vela"
  | "diving"
  | "windsurfKite"
  | "gelaterie"
  | "noleggioGommoni"
  | "noleggioScooterBike";
type TipoMappa =
  | "alloggi"
  | "food"
  | "spiagge"
  | "banche"
  | "supermercati"
  | "farmacie"
  | "mercati"
  | "emergenze"
  | "musei"
  | "trasporti"
  | "vela"
  | "diving"
  | "windsurfKite"
  | "gelaterie"
  | "noleggioGommoni"
  | "noleggioScooterBike";
type WeatherLayerKey = "none" | "wind_new" | "precipitation_new" | "clouds_new";
type MappaLocation = {
  id: string;
  name: string;
  tipo: TipoMappa;
  coordinates: [number, number];
  description: string;
  maddiTip: string;
  esposizione?: string[];
  bookingUrl?: string;
};

const markerColorByType: Record<TipoMappa, string> = {
  alloggi: "#0f766e",
  food: "#b91c1c",
  spiagge: "#0ea5e9",
  banche: "#7c3aed",
  supermercati: "#f97316",
  farmacie: "#16a34a",
  mercati: "#ca8a04",
  emergenze: "#dc2626",
  musei: "#1d4ed8",
  trasporti: "#64748b",
  vela: "#0d9488",
  diving: "#2563eb",
  windsurfKite: "#7c3aed",
  gelaterie: "#ec4899",
  noleggioGommoni: "#0ea5e9",
  noleggioScooterBike: "#f59e0b",
};

const markerSymbolByType: Record<TipoMappa, string> = {
  alloggi: "\u2302",
  food: "\u{1F37D}",
  spiagge: "\u{1F3D6}",
  banche: "\u{1F3E6}",
  supermercati: "\u{1F6D2}",
  farmacie: "\u2695",
  mercati: "\u{1F9FA}",
  emergenze: "!",
  musei: "\u{1F3DB}",
  trasporti: "\u{1F68C}",
  vela: "\u26F5",
  diving: "\u{1F93F}",
  windsurfKite: "\u{1F3C4}",
  gelaterie: "\u{1F366}",
  noleggioGommoni: "\u{1F6A4}",
  noleggioScooterBike: "\u{1F6F5}",
};

const VENTI_OPTIONS = [
  { sigla: "N", nome: "Tramontana" },
  { sigla: "NE", nome: "Grecale" },
  { sigla: "E", nome: "Levante" },
  { sigla: "SE", nome: "Scirocco" },
  { sigla: "S", nome: "Ostro" },
  { sigla: "SW", nome: "Libeccio" },
  { sigla: "W", nome: "Ponente" },
  { sigla: "NW", nome: "Maestrale" },
] as const;
const OWM_LAYERS = {
  wind_new: "wind_new",
  precipitation_new: "precipitation_new",
  clouds_new: "clouds_new",
} as const;
const WIND_SCALE_TICKS = [53, 51, 47, 43, 39, 35, 31, 27, 23, 19, 15, 11, 7, 3, 0] as const;
const WIND_COLOR_STOPS = [
  { knots: 0, rgb: [122, 51, 173] as const },
  { knots: 3, rgb: [108, 60, 188] as const },
  { knots: 7, rgb: [90, 93, 210] as const },
  { knots: 11, rgb: [73, 126, 209] as const },
  { knots: 15, rgb: [61, 140, 203] as const },
  { knots: 19, rgb: [51, 170, 190] as const },
  { knots: 23, rgb: [58, 179, 116] as const },
  { knots: 27, rgb: [121, 191, 81] as const },
  { knots: 31, rgb: [147, 199, 67] as const },
  { knots: 35, rgb: [189, 205, 67] as const },
  { knots: 39, rgb: [229, 187, 67] as const },
  { knots: 43, rgb: [226, 153, 76] as const },
  { knots: 47, rgb: [220, 116, 88] as const },
  { knots: 51, rgb: [203, 89, 132] as const },
  { knots: 53, rgb: [187, 63, 150] as const },
] as const;
const WIND_MIN_KTS = WIND_COLOR_STOPS[0].knots;
const WIND_MAX_KTS = WIND_COLOR_STOPS[WIND_COLOR_STOPS.length - 1].knots;
const OWM_SOURCE_ID = "owm-weather-source";
const OWM_LAYER_ID = "owm-weather-layer";
type DirezioneVento = (typeof VENTI_OPTIONS)[number]["sigla"];
type SpiaggiaCompat = Spiaggia & { zona: Servizio["zona"] };

function createBeachId(name: string, index: number) {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `spiaggia-${slug}-${index}`;
}

function isSpiaggia(servizio: Servizio): servizio is SpiaggiaCompat {
  return (
    servizio.category === "Spiagge" &&
    Array.isArray(servizio.coordinates) &&
    Array.isArray(servizio.esposizione) &&
    typeof servizio.maddiTip === "string"
  );
}

function hasCoordinates(
  servizio: Servizio
): servizio is Servizio & { coordinates: [number, number] } {
  return Array.isArray(servizio.coordinates);
}

function createServiceId(prefix: string, name: string, index: number) {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${prefix}-${slug}-${index}`;
}

function getSpiaggeConsigliate(direzioneVento: string): SpiaggiaCompat[] {
  const vento = direzioneVento.toUpperCase();
  return serviziSpiagge.filter(
    (spiaggia): spiaggia is SpiaggiaCompat =>
      isSpiaggia(spiaggia) && !spiaggia.esposizione.includes(vento)
  );
}

function getNomeVento(sigla: DirezioneVento) {
  return VENTI_OPTIONS.find((item) => item.sigla === sigla)?.nome ?? sigla;
}

function getNomeVentoByLocale(sigla: DirezioneVento, locale: Locale) {
  if (locale === "it") return getNomeVento(sigla);
  const enBySigla: Record<DirezioneVento, string> = {
    N: "Tramontane",
    NE: "Northeast",
    E: "East",
    SE: "Southeast",
    S: "South",
    SW: "Southwest",
    W: "West",
    NW: "Mistral",
  };
  return enBySigla[sigla] ?? sigla;
}

function getSelectedCategory(
  filtro: FiltroAttivo
): "spiagge" | "food" | "case" | undefined {
  if (filtro === "spiagge") return "spiagge";
  if (filtro === "food") return "food";
  if (filtro === "alloggi") return "case";
  return undefined;
}

function interpolateColor(
  from: readonly [number, number, number],
  to: readonly [number, number, number],
  t: number
) {
  return [
    Math.round(from[0] + (to[0] - from[0]) * t),
    Math.round(from[1] + (to[1] - from[1]) * t),
    Math.round(from[2] + (to[2] - from[2]) * t),
  ] as const;
}

function clampKnots(knots: number) {
  return Math.max(WIND_MIN_KTS, Math.min(WIND_MAX_KTS, knots));
}

function knotsToLegendPercent(knots: number) {
  const safeKnots = clampKnots(knots);
  const range = WIND_MAX_KTS - WIND_MIN_KTS || 1;
  return ((WIND_MAX_KTS - safeKnots) / range) * 100;
}

function getWindRgbByKnots(knots: number) {
  const safeKnots = clampKnots(knots);

  for (let i = 0; i < WIND_COLOR_STOPS.length - 1; i += 1) {
    const current = WIND_COLOR_STOPS[i];
    const next = WIND_COLOR_STOPS[i + 1];
    if (safeKnots >= current.knots && safeKnots <= next.knots) {
      const range = next.knots - current.knots || 1;
      const t = (safeKnots - current.knots) / range;
      const [r, g, b] = interpolateColor(current.rgb, next.rgb, t);
      return [r, g, b] as const;
    }
  }

  return WIND_COLOR_STOPS[WIND_COLOR_STOPS.length - 1].rgb;
}

function getWindColorByKnots(knots: number, alpha = 0.7) {
  const [r, g, b] = getWindRgbByKnots(knots);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getWindLegendGradient() {
  const range = WIND_MAX_KTS - WIND_MIN_KTS || 1;
  const steps = [...WIND_COLOR_STOPS]
    .reverse()
    .map(({ knots, rgb }) => {
      const pct = ((WIND_MAX_KTS - knots) / range) * 100;
      return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]}) ${pct.toFixed(2)}%`;
    })
    .join(", ");

  return `linear-gradient(to bottom, ${steps})`;
}

function createMarkerElement(location: MappaLocation) {
  const isAlloggio = location.tipo === "alloggi";
  const markerEl = document.createElement("button");
  markerEl.type = "button";
  markerEl.title = location.name;
  markerEl.setAttribute("aria-label", location.name);
  markerEl.style.width = isAlloggio ? "24px" : "18px";
  markerEl.style.height = isAlloggio ? "24px" : "18px";
  markerEl.style.borderRadius = "9999px";
  markerEl.style.border = isAlloggio ? "3px solid #ffffff" : "2px solid #ffffff";
  markerEl.style.background = markerColorByType[location.tipo];
  markerEl.style.boxShadow = isAlloggio
    ? "0 0 0 3px rgba(15, 118, 110, 0.35), 0 4px 14px rgba(15, 23, 42, 0.5)"
    : "0 2px 8px rgba(15, 23, 42, 0.35)";
  markerEl.style.cursor = "pointer";
  markerEl.style.display = "grid";
  markerEl.style.placeItems = "center";
  markerEl.style.fontSize = isAlloggio ? "13px" : "11px";
  markerEl.style.fontWeight = "700";
  markerEl.style.color = "#ffffff";
  markerEl.textContent = markerSymbolByType[location.tipo];
  return markerEl;
}

function buildPopupContent(location: MappaLocation, locale: Locale) {
  const isEnglish = locale === "en";
  const categoriaLabelByType: Record<TipoMappa, string> = isEnglish
    ? {
        alloggi: "accommodation",
        food: "food",
        spiagge: "beach",
        banche: "banks & atm",
        supermercati: "supermarkets",
        farmacie: "pharmacies",
        mercati: "markets",
        emergenze: "emergency",
        musei: "museums",
        trasporti: "transport",
        vela: "sailing",
        diving: "diving",
        windsurfKite: "windsurf / kite",
        gelaterie: "ice cream",
        noleggioGommoni: "boat rental",
        noleggioScooterBike: "scooter / bike rental",
      }
    : {
        alloggi: "alloggio",
        food: "food",
        spiagge: "spiaggia",
        banche: "banche & atm",
        supermercati: "supermercati",
        farmacie: "farmacie",
        mercati: "mercati",
        emergenze: "emergenze",
        musei: "musei",
        trasporti: "trasporti",
        vela: "vela",
        diving: "diving",
        windsurfKite: "windsurf / kite",
        gelaterie: "gelaterie",
        noleggioGommoni: "noleggio gommoni",
        noleggioScooterBike: "noleggio scooter e bike",
      };
  const categoriaLabel = categoriaLabelByType[location.tipo];
  const bookingCta =
    location.tipo === "alloggi" && location.bookingUrl
      ? `
      <a
        href="${location.bookingUrl}"
        target="_blank"
        rel="noopener noreferrer"
        style="display: inline-block; margin-top: 10px; padding: 8px 10px; border-radius: 10px; font-size: 12px; font-weight: 700; text-decoration: none; color: #ffffff; background: #0f172a;"
      >
        ${isEnglish ? "Discover apartment" : "Scopri appartamento"}
      </a>
      `
      : "";
  return `
    <div style="max-width: 260px; font-family: ui-sans-serif, system-ui, sans-serif;">
      <p style="margin: 0 0 4px; font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: 0.04em;">
        ${categoriaLabel}
      </p>
      <h3 style="margin: 0 0 6px; font-size: 16px; line-height: 1.2; color: #0f172a;">
        ${location.name}
      </h3>
      <p style="margin: 0 0 6px; font-size: 13px; line-height: 1.45; color: #334155;">
        ${location.description}
      </p>
      <p style="margin: 0; font-size: 12px; line-height: 1.45; color: #0f172a;">
        <strong>Maddi tip:</strong> ${location.maddiTip}
      </p>
      ${bookingCta}
    </div>
  `;
}

export function MaddalenaMap({
  className,
  heightClassName = "h-[460px]",
  mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  mapStyle = "mapbox://styles/mapbox/satellite-v9",
  center = defaultCenter,
  zoom = 12.4,
  locale = "it",
}: MaddalenaMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const windCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRegistryRef = useRef<
    Record<string, { marker: mapboxgl.Marker; popup: mapboxgl.Popup }>
  >({});
  const particlesRef = useRef<
    Array<{ x: number; y: number; life: number; maxLife: number }>
  >([]);
  const animationFrameRef = useRef<number | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  );
  const [filtroAttivo, setFiltroAttivo] = useState<FiltroAttivo>("alloggi");
  const [windExpertAttivo, setWindExpertAttivo] = useState(true);
  const [direzioneVento, setDirezioneVento] = useState<DirezioneVento>("NW");
  const [activeWeatherLayer, setActiveWeatherLayer] =
    useState<WeatherLayerKey>("wind_new");
  const [weather, setWeather] = useState<MaddalenaWind | null>(null);
  const [weatherLayerError, setWeatherLayerError] = useState<string | null>(null);
  const [pendingSpiaggiaCoords, setPendingSpiaggiaCoords] = useState<
    [number, number] | null
  >(null);
  const isEnglish = locale === "en";

  useEffect(() => {
    let isMounted = true;

    const loadWind = async () => {
      try {
        const wind = await getMaddalenaWind();
        if (!isMounted) return;
        setWeather(wind);
        setDirezioneVento(wind.direction.codice);
      } catch {
        // Manteniamo fallback locale se il meteo non e disponibile.
      }
    };

    void loadWind();

    return () => {
      isMounted = false;
    };
  }, []);

  const baseLocations = useMemo<MappaLocation[]>(
    () =>
      MADDI_LOCATIONS.filter(
        (location) =>
          location.type === "alloggio" || location.type === "ristorante"
      ).map((location) => ({
        id: location.id,
        name: location.name,
        tipo: location.type === "alloggio" ? "alloggi" : "food",
        coordinates: location.coordinates,
        description: location.description,
        maddiTip: location.maddiTip,
        bookingUrl: location.bookingUrl,
      })),
    []
  );

  const spiaggeTutte = useMemo<SpiaggiaCompat[]>(
    () => serviziSpiagge.filter(isSpiaggia),
    []
  );
  const spiaggeVisibili = useMemo(
    () =>
      windExpertAttivo
        ? getSpiaggeConsigliate(direzioneVento)
        : spiaggeTutte,
    [direzioneVento, spiaggeTutte, windExpertAttivo]
  );
  const bancheLocations = useMemo<MappaLocation[]>(
    () =>
      serviziBanche
        .filter(hasCoordinates)
        .map((servizio, index) => ({
          id: createServiceId("banche", servizio.name, index),
          name: servizio.name,
          tipo: "banche" as const,
          coordinates: servizio.coordinates,
          description: servizio.description ?? "Banca, ATM o ufficio postale.",
          maddiTip: "Perfetto per prelievi veloci o pratiche in zona.",
        })),
    []
  );
  const supermercatiLocations = useMemo<MappaLocation[]>(
    () =>
      serviziSupermercati
        .filter(hasCoordinates)
        .map((servizio, index) => ({
          id: createServiceId("supermercati", servizio.name, index),
          name: servizio.name,
          tipo: "supermercati" as const,
          coordinates: servizio.coordinates,
          description: servizio.description ?? "Supermercato e alimentari.",
          maddiTip: "Comodo per la spesa quotidiana vicino all'alloggio.",
        })),
    []
  );
  const farmacieLocations = useMemo<MappaLocation[]>(
    () =>
      serviziFarmacie
        .filter(hasCoordinates)
        .map((servizio, index) => ({
          id: createServiceId("farmacie", servizio.name, index),
          name: servizio.name,
          tipo: "farmacie" as const,
          coordinates: servizio.coordinates,
          description: servizio.description ?? "Farmacia sul territorio.",
          maddiTip: "Utile per farmaci, creme sole e necessità dell'ultimo minuto.",
        })),
    []
  );
  const mercatiLocations = useMemo<MappaLocation[]>(
    () =>
      serviziMercati
        .filter(hasCoordinates)
        .map((servizio, index) => ({
          id: createServiceId("mercati", servizio.name, index),
          name: servizio.name,
          tipo: "mercati" as const,
          coordinates: servizio.coordinates,
          description: servizio.description ?? "Mercato locale.",
          maddiTip: "Perfetto per prodotti freschi e atmosfera locale.",
        })),
    []
  );
  const emergenzeLocations = useMemo<MappaLocation[]>(
    () =>
      serviziEmergenze
        .filter(hasCoordinates)
        .map((servizio, index) => ({
          id: createServiceId("emergenze", servizio.name, index),
          name: servizio.name,
          tipo: "emergenze" as const,
          coordinates: servizio.coordinates,
          description: servizio.description ?? "Servizio di emergenza.",
          maddiTip: "Punto di riferimento rapido in caso di necessità.",
        })),
    []
  );
  const museiLocations = useMemo<MappaLocation[]>(
    () =>
      serviziMusei
        .filter(hasCoordinates)
        .map((servizio, index) => ({
          id: createServiceId("musei", servizio.name, index),
          name: servizio.name,
          tipo: "musei" as const,
          coordinates: servizio.coordinates,
          description: servizio.description ?? "Museo dell'arcipelago.",
          maddiTip: "Tappa culturale ideale nelle ore meno da spiaggia.",
        })),
    []
  );
  const trasportiLocations = useMemo<MappaLocation[]>(
    () =>
      serviziTrasporti
        .filter(hasCoordinates)
        .map((servizio, index) => ({
          id: createServiceId("trasporti", servizio.name, index),
          name: servizio.name,
          tipo: "trasporti" as const,
          coordinates: servizio.coordinates,
          description: servizio.description ?? "Servizio trasporto e mobilità.",
          maddiTip: "Utile per spostarsi velocemente tra porto, centro e spiagge.",
        })),
    []
  );
  const velaLocations = useMemo<MappaLocation[]>(
    () =>
      serviziVela
        .filter(hasCoordinates)
        .map((servizio, index) => ({
          id: createServiceId("vela", servizio.name, index),
          name: servizio.name,
          tipo: "vela" as const,
          coordinates: servizio.coordinates,
          description: servizio.description ?? "Scuola o esperienza vela.",
          maddiTip: "Ottima opzione per vivere il mare da protagonista.",
        })),
    []
  );
  const divingLocations = useMemo<MappaLocation[]>(
    () =>
      serviziDiving
        .filter(hasCoordinates)
        .map((servizio, index) => ({
          id: createServiceId("diving", servizio.name, index),
          name: servizio.name,
          tipo: "diving" as const,
          coordinates: servizio.coordinates,
          description: servizio.description ?? "Centro immersioni.",
          maddiTip: "Perfetto per escursioni sub e corsi brevetto.",
        })),
    []
  );
  const windsurfKiteLocations = useMemo<MappaLocation[]>(
    () =>
      serviziWindsurfKite
        .filter(hasCoordinates)
        .map((servizio, index) => ({
          id: createServiceId("windsurf-kite", servizio.name, index),
          name: servizio.name,
          tipo: "windsurfKite" as const,
          coordinates: servizio.coordinates,
          description: servizio.description ?? "Scuola windsurf e kite.",
          maddiTip: "Ideale quando soffia il maestrale.",
        })),
    []
  );
  const gelaterieLocations = useMemo<MappaLocation[]>(
    () =>
      serviziGelaterie
        .filter(hasCoordinates)
        .map((servizio, index) => ({
          id: createServiceId("gelaterie", servizio.name, index),
          name: servizio.name,
          tipo: "gelaterie" as const,
          coordinates: servizio.coordinates,
          description: servizio.description ?? "Gelateria artigianale.",
          maddiTip: "Sosta dolce perfetta dopo il giro in centro.",
        })),
    []
  );
  const noleggioGommoniLocations = useMemo<MappaLocation[]>(
    () =>
      serviziNoleggioGommoni
        .filter(hasCoordinates)
        .map((servizio, index) => ({
          id: createServiceId("noleggio-gommoni", servizio.name, index),
          name: servizio.name,
          tipo: "noleggioGommoni" as const,
          coordinates: servizio.coordinates,
          description: servizio.description ?? "Noleggio gommoni e barche.",
          maddiTip: "Ottimo per esplorare le calette in autonomia.",
        })),
    []
  );
  const noleggioScooterBikeLocations = useMemo<MappaLocation[]>(
    () =>
      serviziNoleggioScooterBike
        .filter(hasCoordinates)
        .map((servizio, index) => ({
          id: createServiceId("noleggio-scooter-bike", servizio.name, index),
          name: servizio.name,
          tipo: "noleggioScooterBike" as const,
          coordinates: servizio.coordinates,
          description: servizio.description ?? "Noleggio scooter e bike.",
          maddiTip: "Comodo per muoverti rapidamente tra centro e spiagge.",
        })),
    []
  );
  const allLocations = useMemo<MappaLocation[]>(
    () => [
      ...baseLocations,
      ...bancheLocations,
      ...supermercatiLocations,
      ...farmacieLocations,
      ...mercatiLocations,
      ...emergenzeLocations,
      ...museiLocations,
      ...trasportiLocations,
      ...velaLocations,
      ...divingLocations,
      ...windsurfKiteLocations,
      ...gelaterieLocations,
      ...noleggioGommoniLocations,
      ...noleggioScooterBikeLocations,
      ...spiaggeVisibili.map((spiaggia, index) => ({
        id: createBeachId(spiaggia.name, index),
        name: spiaggia.name,
        tipo: "spiagge" as const,
        coordinates: spiaggia.coordinates,
        description: spiaggia.description ?? "Spiaggia dell'arcipelago.",
        maddiTip: spiaggia.maddiTip,
        esposizione: spiaggia.esposizione,
      })),
    ],
    [
      bancheLocations,
      baseLocations,
      emergenzeLocations,
      farmacieLocations,
      gelaterieLocations,
      mercatiLocations,
      museiLocations,
      noleggioGommoniLocations,
      noleggioScooterBikeLocations,
      spiaggeVisibili,
      supermercatiLocations,
      trasportiLocations,
      velaLocations,
      divingLocations,
      windsurfKiteLocations,
    ]
  );
  const visibleLocations = useMemo(
    () =>
      allLocations.filter((location) =>
        filtroAttivo === "alloggi"
          ? location.tipo === "alloggi"
          : location.tipo === "alloggi" || location.tipo === filtroAttivo
      ),
    [allLocations, filtroAttivo]
  );
  const selectedLocation = useMemo(
    () => visibleLocations.find((location) => location.id === selectedLocationId),
    [selectedLocationId, visibleLocations]
  );
  const categoryFilterOptions = [
    { key: "alloggi", label: isEnglish ? "Accommodation" : "Alloggi" },
    { key: "food", label: "Food" },
    { key: "spiagge", label: isEnglish ? "Beaches" : "Spiagge" },
    { key: "banche", label: "Banche & ATM" },
    { key: "supermercati", label: isEnglish ? "Supermarkets" : "Supermercati" },
    { key: "farmacie", label: isEnglish ? "Pharmacies" : "Farmacie" },
    { key: "mercati", label: isEnglish ? "Markets" : "Mercati" },
    { key: "emergenze", label: isEnglish ? "Emergency" : "Emergenze" },
    { key: "musei", label: isEnglish ? "Museums" : "Musei" },
    { key: "trasporti", label: isEnglish ? "Transport" : "Trasporti" },
    { key: "vela", label: "Vela" },
    { key: "diving", label: "Diving" },
    { key: "windsurfKite", label: "Windsurf kite" },
    { key: "gelaterie", label: isEnglish ? "Ice cream" : "Gelaterie" },
    { key: "noleggioGommoni", label: isEnglish ? "Boat rental" : "Noleggio gommoni" },
    {
      key: "noleggioScooterBike",
      label: isEnglish ? "Scooter/Bike rental" : "Noleggio scooter e bike",
    },
  ] as const;
  const handleSpiaggiaClick = useCallback((coordinates: [number, number]) => {
    setWindExpertAttivo(true);
    setFiltroAttivo("spiagge");
    setPendingSpiaggiaCoords(coordinates);
  }, []);

  const focusLocation = useCallback(
    (locationId: string, source: "marker" | "list" = "list") => {
      const map = mapRef.current;
      const markerEntry = markerRegistryRef.current[locationId];
      const target = visibleLocations.find((loc) => loc.id === locationId);
      if (!map || !markerEntry || !target) return;

      Object.values(markerRegistryRef.current).forEach(({ popup }) => popup.remove());

      const isTeggeView = target.id === "casa-tegge";
      const isSpiaggiaMarkerView = source === "marker" && target.tipo === "spiagge";

      map.flyTo({
        center: target.coordinates,
        zoom: isSpiaggiaMarkerView ? 15 : isTeggeView ? 15.8 : 14.6,
        pitch: isSpiaggiaMarkerView ? 45 : isTeggeView ? 72 : 0,
        bearing: isTeggeView ? 258 : 0,
        essential: true,
        duration: isSpiaggiaMarkerView ? 900 : isTeggeView ? 2200 : 900,
        speed: isTeggeView ? 0.55 : 1.1,
        curve: isTeggeView ? 1.65 : 1.3,
      });

      const markerLngLat = markerEntry.marker.getLngLat();
      const popupCoordinates: [number, number] =
        source === "marker"
          ? [markerLngLat.lng, markerLngLat.lat]
          : target.coordinates;
      markerEntry.popup.setLngLat(popupCoordinates).addTo(map);
      setSelectedLocationId(locationId);
    },
    [visibleLocations]
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: mapStyle,
      center,
      zoom,
      antialias: true,
      maxPitch: 85,
    });

    mapRef.current = map;
    markerRegistryRef.current = {};
    setIsMapReady(false);

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");

    const applyMapVisualCleanup = () => {
      map.setProjection("mercator");
      map.setTerrain(null);
      map.setFog(null);
      const style = map.getStyle();
      const backgroundLayer = style?.layers?.find((layer) => layer.type === "background");
      if (backgroundLayer?.id) {
        map.setPaintProperty(backgroundLayer.id, "background-color", "#000000");
      }
      // Riduce il velo lattiginoso del satellite, mantenendo le isole leggibili.
      style?.layers
        ?.filter((layer) => layer.type === "raster")
        .forEach((layer) => {
          map.setPaintProperty(layer.id, "raster-contrast", 0.28);
          map.setPaintProperty(layer.id, "raster-saturation", 0.12);
          map.setPaintProperty(layer.id, "raster-brightness-min", 0.02);
          map.setPaintProperty(layer.id, "raster-brightness-max", 0.9);
        });
    };

    map.on("load", () => {
      // Visual cleanup: no terrain/fog for a cleaner, flat map.
      applyMapVisualCleanup();

      setIsMapReady(true);
    });

    map.on("style.load", applyMapVisualCleanup);

    return () => {
      map.off("style.load", applyMapVisualCleanup);
      markerRegistryRef.current = {};
      map.remove();
      mapRef.current = null;
    };
  }, [center, mapStyle, mapboxToken, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    Object.values(markerRegistryRef.current).forEach(({ marker, popup }) => {
      popup.remove();
      marker.remove();
    });
    markerRegistryRef.current = {};

    const bounds = new mapboxgl.LngLatBounds();
    const displayCoordinatesById = new Map<string, [number, number]>();
    const groupedByCoordinate = new Map<string, MappaLocation[]>();

    visibleLocations.forEach((location) => {
      const key = `${location.coordinates[0].toFixed(7)}|${location.coordinates[1].toFixed(7)}`;
      const group = groupedByCoordinate.get(key);
      if (group) {
        group.push(location);
      } else {
        groupedByCoordinate.set(key, [location]);
      }
    });

    groupedByCoordinate.forEach((group) => {
      if (group.length === 1) {
        const [only] = group;
        displayCoordinatesById.set(only.id, only.coordinates);
        return;
      }

      // Spread overlapping markers in a small circle so all POIs remain clickable.
      const base = group[0].coordinates;
      const baseLatRad = (base[1] * Math.PI) / 180;
      const metersPerLonDegree = 111320 * Math.cos(baseLatRad);
      const metersPerLatDegree = 110540;
      const radiusMeters = 18;

      group.forEach((location, index) => {
        const angle = (2 * Math.PI * index) / group.length;
        const dxMeters = Math.cos(angle) * radiusMeters;
        const dyMeters = Math.sin(angle) * radiusMeters;
        const lng = base[0] + dxMeters / metersPerLonDegree;
        const lat = base[1] + dyMeters / metersPerLatDegree;
        displayCoordinatesById.set(location.id, [lng, lat]);
      });
    });

    visibleLocations.forEach((location) => {
      const popup = new mapboxgl.Popup({ offset: 18, closeOnClick: false }).setHTML(
        buildPopupContent(location, locale)
      );
      const displayCoordinates =
        displayCoordinatesById.get(location.id) ?? location.coordinates;

      const marker = new mapboxgl.Marker({
        element: createMarkerElement(location),
        anchor: "center",
      })
        .setLngLat(displayCoordinates)
        .addTo(map);

      marker.getElement().addEventListener("click", (event) => {
        event.stopPropagation();
        focusLocation(location.id, "marker");
      });

      markerRegistryRef.current[location.id] = { marker, popup };
      bounds.extend(displayCoordinates);
    });

    setSelectedLocationId((current) =>
      current && visibleLocations.some((location) => location.id === current)
        ? current
        : null
    );

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, {
        padding: 72,
        maxZoom: 14,
        duration: 450,
      });
    }
  }, [focusLocation, isMapReady, locale, visibleLocations]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady || !pendingSpiaggiaCoords) return;

    const target = visibleLocations.find(
      (location) =>
        location.tipo === "spiagge" &&
        location.coordinates[0] === pendingSpiaggiaCoords[0] &&
        location.coordinates[1] === pendingSpiaggiaCoords[1]
    );
    if (!target) return;

    const markerEntry = markerRegistryRef.current[target.id];
    if (!markerEntry) return;

    Object.values(markerRegistryRef.current).forEach(({ popup }) => popup.remove());

    map.flyTo({
      center: pendingSpiaggiaCoords,
      zoom: 15,
      pitch: 45,
      essential: true,
      duration: 900,
    });

    markerEntry.popup.setLngLat(target.coordinates).addTo(map);
    setSelectedLocationId(target.id);
    setPendingSpiaggiaCoords(null);
  }, [isMapReady, pendingSpiaggiaCoords, visibleLocations]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    const owmApiKey =
      process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ??
      process.env.NEXT_PUBLIC_OPENWEAT;
    if (!owmApiKey) {
      if (activeWeatherLayer !== "none" && activeWeatherLayer !== "wind_new") {
        setWeatherLayerError(
          isEnglish
            ? "OpenWeather API key missing: rain/cloud layers are unavailable."
            : "Chiave OpenWeather mancante: layer pioggia/nuvole non disponibili."
        );
      } else {
        setWeatherLayerError(null);
      }
      return;
    }

    if (map.getLayer(OWM_LAYER_ID)) {
      map.removeLayer(OWM_LAYER_ID);
    }
    if (map.getSource(OWM_SOURCE_ID)) {
      map.removeSource(OWM_SOURCE_ID);
    }

    if (activeWeatherLayer === "none" || activeWeatherLayer === "wind_new") {
      setWeatherLayerError(null);
      return;
    }

    const layerName = OWM_LAYERS[activeWeatherLayer];
    const tilesUrl = `https://tile.openweathermap.org/map/${layerName}/{z}/{x}/{y}.png?appid=${owmApiKey}`;
    const handleMapError = (event: mapboxgl.ErrorEvent) => {
      const sourceId = (event as { sourceId?: string }).sourceId;
      if (sourceId !== OWM_SOURCE_ID) return;
      setWeatherLayerError(
        isEnglish
          ? "OpenWeather rain/cloud layer failed to load (invalid key or plan)."
          : "Layer OpenWeather pioggia/nuvole non caricato (chiave o piano non valido)."
      );
    };

    map.on("error", handleMapError);

    map.addSource(OWM_SOURCE_ID, {
      type: "raster",
      tiles: [tilesUrl],
      tileSize: 256,
    });

    map.addLayer({
      id: OWM_LAYER_ID,
      type: "raster",
      source: OWM_SOURCE_ID,
      paint: {
        "raster-opacity": activeWeatherLayer === "precipitation_new" ? 0.82 : 0.68,
        "raster-fade-duration": 0,
        "raster-contrast": activeWeatherLayer === "precipitation_new" ? 0.15 : -0.08,
      },
    });
    setWeatherLayerError(null);

    return () => {
      map.off("error", handleMapError);
    };
  }, [activeWeatherLayer, isEnglish, isMapReady]);

  useEffect(() => {
    const map = mapRef.current;
    const canvas = windCanvasRef.current;
    const container = containerRef.current;

    if (!map || !canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stopAnimation = () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    const syncCanvasSize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const clearCanvas = () => {
      syncCanvasSize();
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    };

    if (
      activeWeatherLayer !== "wind_new" ||
      !weather ||
      typeof weather.direction.gradi !== "number"
    ) {
      stopAnimation();
      clearCanvas();
      return;
    }

    syncCanvasSize();
    particlesRef.current = [];

    const PARTICLE_COUNT = 120;
    const knotsToPixelsPerSecond = 2.2;
    const trailLength = 10;
    // OpenWeather "deg" is the direction the wind comes FROM.
    // Particles must move TO the opposite bearing.
    const toDeg = (weather.direction.gradi + 180) % 360;
    const angleRad = (toDeg * Math.PI) / 180;
    const velocity = weather.speed * knotsToPixelsPerSecond;
    const particleColor = "rgba(200, 230, 255, 0.52)";
    // Convert bearing (0=N, clockwise) to screen vector (x right, y down).
    const vx = Math.sin(angleRad) * velocity;
    const vy = -Math.cos(angleRad) * velocity;
    const vectorLength = Math.hypot(vx, vy) || 1;
    const nx = vx / vectorLength;
    const ny = vy / vectorLength;

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      particlesRef.current.push({
        x: Math.random() * canvas.clientWidth,
        y: Math.random() * canvas.clientHeight,
        life: Math.random() * 100,
        maxLife: 60 + Math.random() * 80,
      });
    }

    let lastTimestamp = performance.now();

    let isAnimationActive = true;

    const animate = (timestamp: number) => {
      if (!isAnimationActive) return;
      const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
      lastTimestamp = timestamp;

      // Fade previous traces without darkening the map.
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      ctx.globalCompositeOperation = "source-over";

      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.strokeStyle = particleColor;

      for (const particle of particlesRef.current) {
        const startX = particle.x;
        const startY = particle.y;
        const endX = startX + vx * dt;
        const endY = startY + vy * dt;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX - nx * trailLength, startY - ny * trailLength);
        ctx.stroke();

        particle.x = endX;
        particle.y = endY;
        particle.life += 1;

        const outside =
          particle.x < -20 ||
          particle.y < -20 ||
          particle.x > canvas.clientWidth + 20 ||
          particle.y > canvas.clientHeight + 20;

        if (outside || particle.life > particle.maxLife) {
          particle.x = Math.random() * canvas.clientWidth;
          particle.y = Math.random() * canvas.clientHeight;
          particle.life = 0;
          particle.maxLife = 60 + Math.random() * 80;
        }
      }

      if (!isAnimationActive) return;
      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    map.on("move", syncCanvasSize);
    map.on("resize", syncCanvasSize);
    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      isAnimationActive = false;
      stopAnimation();
      map.off("move", syncCanvasSize);
      map.off("resize", syncCanvasSize);
      clearCanvas();
    };
  }, [activeWeatherLayer, isMapReady, weather]);

  if (!mapboxToken) {
    return (
      <div
        className={`rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 ${className ?? ""}`}
      >
        {isEnglish
          ? "Set `NEXT_PUBLIC_MAPBOX_TOKEN` to display the map."
          : "Imposta `NEXT_PUBLIC_MAPBOX_TOKEN` per visualizzare la mappa."}
      </div>
    );
  }

  return (
    <section className={className}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {categoryFilterOptions.map((item) => {
          const isActive = item.key === "alloggi" || filtroAttivo === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFiltroAttivo(item.key)}
              aria-pressed={isActive}
              aria-label={`Filtro ${item.label}`}
              title={item.label}
              className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                isActive
                  ? "border-mare bg-mare text-white"
                  : "border-mare/25 bg-white/80 text-slate hover:border-mare/50"
              }`}
            >
              <span
                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{
                  backgroundColor: markerColorByType[item.key],
                }}
              >
                {markerSymbolByType[item.key]}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setWindExpertAttivo((value) => !value);
            setFiltroAttivo("spiagge");
          }}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
            windExpertAttivo
              ? "border-amber-500 bg-amber-500 text-white"
              : "border-amber-400/70 bg-white text-amber-700 hover:border-amber-500"
          }`}
        >
          {isEnglish ? "Wind Expert" : "Wind Expert"}
        </button>
        <select
          value={direzioneVento}
          onChange={(event) => {
            setWindExpertAttivo(true);
            setDirezioneVento(event.target.value as DirezioneVento);
          }}
          className="rounded-full border border-mare/30 bg-white px-3 py-1.5 text-xs font-semibold text-slate"
          aria-label={isEnglish ? "Wind direction" : "Direzione vento"}
        >
          {VENTI_OPTIONS.map((vento) => (
            <option key={vento.sigla} value={vento.sigla}>
              {getNomeVentoByLocale(vento.sigla, locale)}
            </option>
          ))}
        </select>
        <select
          value={activeWeatherLayer}
          onChange={(event) =>
            setActiveWeatherLayer(event.target.value as WeatherLayerKey)
          }
          className="rounded-full border border-mare/30 bg-white px-3 py-1.5 text-xs font-semibold text-slate"
          aria-label={isEnglish ? "Weather layer" : "Layer meteo"}
        >
          <option value="none">{isEnglish ? "Weather Off" : "Meteo Off"}</option>
          <option value="wind_new">{isEnglish ? "Wind Layer" : "Layer Vento"}</option>
          <option value="precipitation_new">
            {isEnglish ? "Rain Layer" : "Layer Pioggia"}
          </option>
          <option value="clouds_new">{isEnglish ? "Cloud Layer" : "Layer Nuvole"}</option>
        </select>
      </div>
      {weatherLayerError ? (
        <p className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
          {weatherLayerError}
        </p>
      ) : null}

      <div className="relative">
        <div
          ref={containerRef}
          className={`w-full overflow-hidden rounded-2xl border border-mare/20 shadow-sm ${heightClassName}`}
        />
        <canvas
          ref={windCanvasRef}
          className="pointer-events-none absolute inset-0 z-20 rounded-2xl"
          aria-hidden="true"
        />
        {activeWeatherLayer === "wind_new" && weather ? (
          <aside className="pointer-events-none absolute left-2 top-20 z-30 rounded-lg border border-white/15 bg-slate-950/60 p-2 text-white/95 backdrop-blur-sm md:left-3 md:top-24">
            <p className="mb-1 text-xs font-semibold">kts</p>
            <div className="flex items-stretch gap-2">
              <div
                className="relative h-64 w-5 rounded-sm"
                style={{
                  background: getWindLegendGradient(),
                }}
              >
                <span
                  className="absolute left-full ml-1 block h-0.5 w-2 -translate-y-1/2 rounded-full"
                  style={{
                    top: `${knotsToLegendPercent(weather.speed)}%`,
                    backgroundColor: getWindColorByKnots(weather.speed, 1),
                  }}
                />
              </div>
              <div className="flex h-64 flex-col justify-between py-0.5 text-right text-xs font-semibold">
                {WIND_SCALE_TICKS.map((tick) => (
                  <span key={tick}>{tick}</span>
                ))}
              </div>
            </div>
          </aside>
        ) : null}
        <MaddiConcierge
          ventoAttuale={weather?.direction.nome ?? getNomeVentoByLocale(direzioneVento, locale)}
          isStrongWind={(weather?.speed ?? 0) > 15}
          selectedCategory={getSelectedCategory(filtroAttivo)}
          listaSpiagge={spiaggeTutte}
          onSpiaggiaClick={handleSpiaggiaClick}
          locale={locale}
          className="z-30"
        />
        {weather ? (
          <WeatherWidget
            weather={{
              velocitaNodi: weather.speed,
              temperatura: weather.temperatura,
              nomeVento: weather.direction.nome,
              iconaVentoUrl: weather.iconaMeteoUrl,
              descrizioneCielo: weather.descrizioneCielo,
            }}
            locale={locale}
            className="z-30"
          />
        ) : null}
      </div>

      <div className="mt-5">
        <h2 className="font-sans text-sm font-semibold text-slate/80">
          {isEnglish ? "Listed places (click to focus)" : "Luoghi in elenco (clic per centrare)"}
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {visibleLocations.map((location) => {
            const isActive = selectedLocationId === location.id;
            const typeLabel =
              location.tipo === "alloggi"
                ? isEnglish
                  ? "Accommodation"
                  : "Alloggio"
                : location.tipo === "food"
                  ? "Food"
                  : location.tipo === "banche"
                    ? "Banche & ATM"
                    : location.tipo === "supermercati"
                      ? isEnglish
                        ? "Supermarket"
                        : "Supermercato"
                      : location.tipo === "farmacie"
                        ? isEnglish
                          ? "Pharmacy"
                          : "Farmacia"
                        : location.tipo === "mercati"
                          ? isEnglish
                            ? "Market"
                            : "Mercato"
                          : location.tipo === "emergenze"
                            ? isEnglish
                              ? "Emergency"
                              : "Emergenza"
                            : location.tipo === "musei"
                              ? isEnglish
                                ? "Museum"
                                : "Museo"
                              : location.tipo === "trasporti"
                                ? isEnglish
                                  ? "Transport"
                                  : "Trasporto"
                              : location.tipo === "vela"
                                ? "Vela"
                                : location.tipo === "diving"
                                  ? "Diving"
                                  : location.tipo === "windsurfKite"
                                    ? "Windsurf kite"
                                    : location.tipo === "gelaterie"
                                        ? isEnglish
                                          ? "Ice cream"
                                          : "Gelateria"
                                      : location.tipo === "noleggioGommoni"
                                          ? isEnglish
                                            ? "Boat rental"
                                            : "Noleggio gommoni"
                                        : location.tipo === "noleggioScooterBike"
                                            ? isEnglish
                                              ? "Scooter/Bike rental"
                                              : "Noleggio scooter e bike"
                    : isEnglish
                      ? "Beach"
                      : "Spiaggia";

            return (
              <li key={location.id}>
                <button
                  type="button"
                  onClick={() => focusLocation(location.id, "list")}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                    isActive
                      ? "border-mare/50 bg-white"
                      : "border-mare/15 bg-sabbia hover:border-mare/35"
                  }`}
                >
                  <span className="inline-flex items-center gap-2 text-xs text-slate/65">
                    <span
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: markerColorByType[location.tipo] }}
                    >
                      {markerSymbolByType[location.tipo]}
                    </span>
                    {typeLabel}
                  </span>
                  <p className="mt-1 font-sans text-sm font-semibold text-slate">
                    {location.name}
                  </p>
                  <p className="mt-1 text-xs text-slate/70">{location.description}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {selectedLocation ? (
        <aside className="mt-5 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-5 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-base">
              ✨
            </span>
            <div>
              <p className="font-[var(--font-handwriting)] text-xl leading-none text-mare">
                Maddi
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate/85">
                <strong>{isEnglish ? "Maddi recommends:" : "Maddì consiglia:"}</strong>{" "}
                {selectedLocation.maddiTip}
              </p>
            </div>
          </div>
        </aside>
      ) : null}
    </section>
  );
}
