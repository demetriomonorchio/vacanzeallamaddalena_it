"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import mapboxgl from "mapbox-gl";
import Image from "next/image";
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
import { serviziRistoranti } from "@/lib/serviziRistoranti";
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
  | "sentieri"
  | "ristoranti"
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
  | "ristoranti"
  | "spiagge"
  | "sentieri"
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
  rating?: number;
  reviews?: number;
  isFavorite?: boolean;
  maddiNote?: string;
  esposizione?: string[];
  bookingUrl?: string;
};
type SentieroInfo = {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  duration: string;
  imageUrl?: string;
  coordinates: [number, number];
  pathCoordinates: [number, number][];
  previewCoordinates: [number, number];
  previewBearing: number;
  photoStops: TrailPhoto[];
};
type TrailPhoto = {
  id: string;
  imageUrl: string;
  coordinates: [number, number];
  relatedRouteId: string;
  maddiNote: string;
  shotDate?: string;
  title?: string;
};

function toLatLngString(coordinates: [number, number]) {
  const [lng, lat] = coordinates;
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

function getStarsFromRating(rating: number) {
  const filledStars = Math.max(0, Math.min(5, Math.round(rating)));
  return `${"★".repeat(filledStars)}${"☆".repeat(5 - filledStars)}`;
}

function getGoogleDirectionsUrl(coordinates: [number, number]) {
  const [lng, lat] = coordinates;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function getAppleMapsUrl(coordinates: [number, number]) {
  const [lng, lat] = coordinates;
  return `maps://?daddr=${lat},${lng}`;
}

const markerColorByType: Record<TipoMappa, string> = {
  alloggi: "#0f766e",
  ristoranti: "#ea580c",
  spiagge: "#0ea5e9",
  sentieri: "#06b6d4",
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
  ristoranti: "\u{1F355}",
  spiagge: "\u{1F3D6}",
  sentieri: "\u{1F97E}",
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
const SENTIERI_SOURCE_ID = "sentieri-arcipelago-source";
const SENTIERI_LAYER_ID = "sentieri-arcipelago-layer";
const SENTIERI_HIGHLIGHT_LAYER_ID = "sentieri-arcipelago-highlight-layer";
const SENTIERI_START_SOURCE_ID = "sentieri-arcipelago-start-source";
const SENTIERI_START_LAYER_ID = "sentieri-arcipelago-start-layer";
const SENTIERI_START_LABEL_LAYER_ID = "sentieri-arcipelago-start-label-layer";
const SENTIERI_PHOTO_SOURCE_ID = "sentieri-arcipelago-photos-source";
const SENTIERI_PHOTO_DOT_LAYER_ID = "sentieri-arcipelago-photos-dot-layer";
const SENTIERI_PHOTO_LAYER_ID = "sentieri-arcipelago-photos-layer";
const SENTIERI_PHOTO_ICON_ID = "sentieri-photo-camera-icon";
type DirezioneVento = (typeof VENTI_OPTIONS)[number]["sigla"];
type SpiaggiaCompat = Spiaggia & {
  zona: Servizio["zona"];
  isFavorite?: boolean;
  maddiNote?: string;
};

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

function getFavoriteMeta(customFavorite?: { isFavorite?: boolean; maddiNote?: string }) {
  const maddiNote = customFavorite?.maddiNote;
  const isFavorite = customFavorite?.isFavorite ?? Boolean(maddiNote);
  return {
    isFavorite,
    maddiNote,
  };
}

function getTrailProp(
  properties: mapboxgl.MapboxGeoJSONFeature["properties"] | undefined,
  keys: string[]
) {
  for (const key of keys) {
    const value = properties?.[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return "";
}

function getTrailStartCoordinates(
  geometry: mapboxgl.MapboxGeoJSONFeature["geometry"] | undefined
): [number, number] | null {
  if (!geometry) return null;
  if (
    geometry.type === "LineString" &&
    Array.isArray(geometry.coordinates) &&
    geometry.coordinates.length > 0
  ) {
    const first = geometry.coordinates[0];
    if (Array.isArray(first) && typeof first[0] === "number" && typeof first[1] === "number") {
      return [first[0], first[1]];
    }
  }
  if (
    geometry.type === "MultiLineString" &&
    Array.isArray(geometry.coordinates) &&
    geometry.coordinates.length > 0 &&
    Array.isArray(geometry.coordinates[0]) &&
    geometry.coordinates[0].length > 0
  ) {
    const first = geometry.coordinates[0][0];
    if (Array.isArray(first) && typeof first[0] === "number" && typeof first[1] === "number") {
      return [first[0], first[1]];
    }
  }
  return null;
}

function getTrailLineCoordinates(
  geometry: mapboxgl.MapboxGeoJSONFeature["geometry"] | undefined
): [number, number][] {
  if (!geometry) return [];
  if (geometry.type === "LineString" && Array.isArray(geometry.coordinates)) {
    return geometry.coordinates.filter(
      (point): point is [number, number] =>
        Array.isArray(point) && typeof point[0] === "number" && typeof point[1] === "number"
    );
  }
  if (geometry.type === "MultiLineString" && Array.isArray(geometry.coordinates)) {
    return geometry.coordinates.flatMap((line) =>
      Array.isArray(line)
        ? line.filter(
            (point): point is [number, number] =>
              Array.isArray(point) && typeof point[0] === "number" && typeof point[1] === "number"
          )
        : []
    );
  }
  return [];
}

function getBearingBetweenPoints(from: [number, number], to: [number, number]) {
  const [fromLng, fromLat] = from;
  const [toLng, toLat] = to;
  const fromLatRad = (fromLat * Math.PI) / 180;
  const toLatRad = (toLat * Math.PI) / 180;
  const deltaLngRad = ((toLng - fromLng) * Math.PI) / 180;
  const y = Math.sin(deltaLngRad) * Math.cos(toLatRad);
  const x =
    Math.cos(fromLatRad) * Math.sin(toLatRad) -
    Math.sin(fromLatRad) * Math.cos(toLatRad) * Math.cos(deltaLngRad);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

function toNumeric(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeTrailToken(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function isPercorso15Trail(sentiero: SentieroInfo | null | undefined) {
  if (!sentiero) return false;
  const joined = `${sentiero.id} ${sentiero.name}`;
  const token = normalizeTrailToken(joined);
  return token.includes("percorso15") || token.includes("sentiero15") || token.includes("trail15");
}

function haversineMeters(from: [number, number], to: [number, number]) {
  const R = 6371000;
  const dLat = ((to[1] - from[1]) * Math.PI) / 180;
  const dLng = ((to[0] - from[0]) * Math.PI) / 180;
  const lat1 = (from[1] * Math.PI) / 180;
  const lat2 = (to[1] * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getNearestPathIndex(point: [number, number], path: [number, number][]) {
  if (path.length === 0) return 0;
  let minDistance = Number.POSITIVE_INFINITY;
  let nearestIndex = 0;
  for (let i = 0; i < path.length; i += 1) {
    const distance = haversineMeters(point, path[i]);
    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = i;
    }
  }
  return nearestIndex;
}

function parseTrailPhotos(
  rawProperties: Record<string, unknown>,
  trailCoordinates: [number, number][],
  routeId: string
): TrailPhoto[] {
  const urlsWithOptionalMeta: Array<{
    imageUrl: string;
    maddiNote?: string;
    coordinates?: [number, number];
  }> = [];

  const pushPhoto = (entry: {
    imageUrl: unknown;
    maddiNote?: unknown;
    lng?: unknown;
    lat?: unknown;
  }) => {
    if (typeof entry.imageUrl !== "string" || entry.imageUrl.trim().length === 0) return;
    const lng = toNumeric(entry.lng);
    const lat = toNumeric(entry.lat);
    urlsWithOptionalMeta.push({
      imageUrl: entry.imageUrl.trim(),
      maddiNote: typeof entry.maddiNote === "string" ? entry.maddiNote.trim() : undefined,
      coordinates: lng !== null && lat !== null ? [lng, lat] : undefined,
    });
  };

  const photosRaw = rawProperties.photos;
  if (Array.isArray(photosRaw)) {
    photosRaw.forEach((item) => {
      if (item && typeof item === "object") {
        const candidate = item as Record<string, unknown>;
        pushPhoto({
          imageUrl: candidate.url ?? candidate.image ?? candidate.src ?? candidate.imageUrl,
          maddiNote: candidate.caption ?? candidate.title ?? candidate.note ?? candidate.maddiNote,
          lng: candidate.lng ?? candidate.lon ?? candidate.longitude,
          lat: candidate.lat ?? candidate.latitude,
        });
      }
    });
  } else if (typeof photosRaw === "string" && photosRaw.trim().length > 0) {
    try {
      const parsed = JSON.parse(photosRaw) as unknown;
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          if (item && typeof item === "object") {
            const candidate = item as Record<string, unknown>;
            pushPhoto({
              imageUrl: candidate.url ?? candidate.image ?? candidate.src ?? candidate.imageUrl,
              maddiNote: candidate.caption ?? candidate.title ?? candidate.note ?? candidate.maddiNote,
              lng: candidate.lng ?? candidate.lon ?? candidate.longitude,
              lat: candidate.lat ?? candidate.latitude,
            });
          }
        });
      }
    } catch {
      // Ignoriamo payload non JSON.
    }
  }

  Object.entries(rawProperties).forEach(([key, value]) => {
    if (!/^photo\d*$/i.test(key)) return;
    pushPhoto({ imageUrl: value });
  });

  const safeTrail: [number, number][] =
    trailCoordinates.length > 0 ? trailCoordinates : [[9.4095, 41.2145]];
  return urlsWithOptionalMeta.slice(0, 12).map((photo, index) => {
    const sampled =
      safeTrail[
        Math.floor((index / Math.max(1, urlsWithOptionalMeta.length - 1)) * (safeTrail.length - 1))
      ] ?? safeTrail[0];
    return {
      id: `photo-${index}`,
      coordinates: photo.coordinates ?? sampled,
      imageUrl: photo.imageUrl,
      relatedRouteId: routeId,
      maddiNote: photo.maddiNote ?? "",
    };
  });
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
  if (filtro === "ristoranti") return "food";
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
  const isFavorite = location.isFavorite === true;
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
  if (isFavorite) {
    markerEl.style.borderColor = "#facc15";
    markerEl.style.boxShadow = `${markerEl.style.boxShadow}, 0 0 0 2px rgba(250, 204, 21, 0.65)`;
  }
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
  const showAppleDirections =
    typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const [lng, lat] = location.coordinates;
  const latLng = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  const googleDirections = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const appleDirections = `maps://?daddr=${lat},${lng}`;
  const categoriaLabelByType: Record<TipoMappa, string> = isEnglish
    ? {
        alloggi: "accommodation",
        ristoranti: "restaurants",
        spiagge: "beach",
          sentieri: "trail",
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
        ristoranti: "ristoranti",
        spiagge: "spiaggia",
          sentieri: "sentiero",
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
  const ratingInfo =
    typeof location.rating === "number"
      ? `
      <p style="margin: 0 0 6px; font-size: 12px; color: #b45309;">
        ${getStarsFromRating(location.rating)} ${location.rating.toFixed(1)}${
          typeof location.reviews === "number" ? ` (${location.reviews})` : ""
        }
      </p>
      `
      : "";
  const navigationLinks = `
      <div style="display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px; margin-top:10px;">
        <a
          href="${googleDirections}"
          target="_blank"
          rel="noopener noreferrer"
          style="display:inline-flex; align-items:center; justify-content:center; min-height:34px; border-radius:8px; padding:6px 8px; font-size:11px; font-weight:700; text-decoration:none; color:#ffffff; background:#1d4ed8;"
        >
          ${isEnglish ? "Directions" : "Indicazioni"}
        </a>
        ${
          showAppleDirections
            ? `
        <a
          href="${appleDirections}"
          style="display:inline-flex; align-items:center; justify-content:center; min-height:34px; border-radius:8px; padding:6px 8px; font-size:11px; font-weight:700; text-decoration:none; color:#0f172a; background:#e2e8f0;"
        >
          Apple Maps
        </a>
        `
            : ""
        }
        <button
          type="button"
          onclick="navigator.clipboard&&navigator.clipboard.writeText('${latLng}')"
          style="grid-column:1/-1; display:inline-flex; align-items:center; justify-content:center; min-height:32px; border-radius:8px; border:1px solid #cbd5e1; padding:6px 8px; font-size:11px; font-weight:700; color:#0f172a; background:#f8fafc; cursor:pointer;"
        >
          ${isEnglish ? "Copy coordinates" : "Copia coordinate"}
        </button>
      </div>
  `;
  const maddiFavoriteNote =
    location.isFavorite && location.maddiNote
      ? `
      <div style="margin-top: 8px; border-radius: 8px; background: #fef3c7; border: 1px solid #fcd34d; padding: 7px 8px; font-size: 12px; color: #78350f;">
        <strong>${isEnglish ? "Maddi's tip:" : "Consiglio di Maddi:"}</strong> ${location.maddiNote}
      </div>
      `
      : "";
  return `
    <div style="width: 280px; max-width: 100%; font-family: ui-sans-serif, system-ui, sans-serif;">
      <p style="margin: 0 0 4px; font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: 0.04em;">
        ${categoriaLabel}
      </p>
      <h3 style="margin: 0 0 6px; font-size: 16px; line-height: 1.2; color: #0f172a;">
        ${location.name}
      </h3>
      <p style="margin: 0 0 6px; font-size: 13px; line-height: 1.45; color: #334155;">
        ${location.description}
      </p>
      ${ratingInfo}
      <p style="margin: 0; font-size: 12px; line-height: 1.45; color: #0f172a;">
        <strong>Maddi tip:</strong> ${location.maddiTip}
      </p>
      ${navigationLinks}
      ${maddiFavoriteNote}
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
  const immersiveContainerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const windCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRegistryRef = useRef<
    Record<string, { marker: mapboxgl.Marker; popup: mapboxgl.Popup }>
  >({});
  const sentieroCardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const sentieriByIdRef = useRef<Record<string, SentieroInfo>>({});
  const hoveredPhotoFeatureIdRef = useRef<string | number | null>(null);
  const activeGalleryPhotoFeatureIdRef = useRef<string | number | null>(null);
  const trailPreviewTimersRef = useRef<number[]>([]);
  const trailPreviewRunIdRef = useRef(0);
  const trailSwitchWowTimerRef = useRef<number | null>(null);
  const immersionTimerRef = useRef<number | null>(null);
  const immersionStepRef = useRef(0);
  const immersionPathRef = useRef<[number, number][]>([]);
  const activeImmersionSentieroRef = useRef<SentieroInfo | null>(null);
  const mobileTrailSheetTouchRef = useRef<{ startY: number; startHeight: number } | null>(null);
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
  const [showAllMobileFilters, setShowAllMobileFilters] = useState(false);
  const [showOnlyMaddiFavorites, setShowOnlyMaddiFavorites] = useState(false);
  const [isDesktopLayout, setIsDesktopLayout] = useState(false);
  const [mobileViewportHeight, setMobileViewportHeight] = useState(0);
  const [mobileTrailSheetState, setMobileTrailSheetState] = useState<"min" | "mid" | "max">("mid");
  const [mobileTrailSheetDragHeight, setMobileTrailSheetDragHeight] = useState<number | null>(null);
  const [isTrailFullscreen, setIsTrailFullscreen] = useState(false);
  const [isTrailPseudoFullscreen, setIsTrailPseudoFullscreen] = useState(false);
  const [pendingSpiaggiaCoords, setPendingSpiaggiaCoords] = useState<
    [number, number] | null
  >(null);
  const [sentieriList, setSentieriList] = useState<SentieroInfo[]>([]);
  const [hoveredSentieroId, setHoveredSentieroId] = useState<string | null>(null);
  const [selectedSentiero, setSelectedSentiero] = useState<SentieroInfo | null>(null);
  const [trailConfirmSentiero, setTrailConfirmSentiero] = useState<SentieroInfo | null>(null);
  const [isTrailPreviewing, setIsTrailPreviewing] = useState(false);
  const [isTotalImmersionActive, setIsTotalImmersionActive] = useState(false);
  const [isTotalImmersionPaused, setIsTotalImmersionPaused] = useState(false);
  const [immersionStepIndex, setImmersionStepIndex] = useState(0);
  const [immersionPassedShots, setImmersionPassedShots] = useState(0);
  const [immersionCurrentTitle, setImmersionCurrentTitle] = useState("");
  const [trail15Photos, setTrail15Photos] = useState<TrailPhoto[] | null>(null);
  const [visibleImmersionPhotos, setVisibleImmersionPhotos] = useState<
    Array<{ photo: TrailPhoto; opacity: number; left: number; top: number }>
  >([]);
  const [lightboxPhoto, setLightboxPhoto] = useState<TrailPhoto | null>(null);
  const [isGalleryPhotoLoading, setIsGalleryPhotoLoading] = useState(false);
  const [isGalleryPhotoSwitching, setIsGalleryPhotoSwitching] = useState(false);
  const [copiedLocationId, setCopiedLocationId] = useState<string | null>(null);
  const galleryPrefetchRef = useRef<Set<string>>(new Set());
  const galleryDirectionRef = useRef<1 | -1>(1);
  const galleryLoadingTimerRef = useRef<number | null>(null);
  const galleryTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isEnglish = locale === "en";
  const isIOS = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }, []);

  useEffect(() => {
    if (!copiedLocationId) return;
    const timerId = window.setTimeout(() => setCopiedLocationId(null), 1300);
    return () => window.clearTimeout(timerId);
  }, [copiedLocationId]);

  useEffect(() => {
    const syncViewport = () => {
      setIsDesktopLayout(window.innerWidth >= 640);
      setMobileViewportHeight(window.innerHeight);
    };
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsTrailFullscreen(document.fullscreenElement === immersiveContainerRef.current);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!isTrailPseudoFullscreen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsTrailPseudoFullscreen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isTrailPseudoFullscreen]);

  useEffect(() => {
    sentieriByIdRef.current = Object.fromEntries(sentieriList.map((sentiero) => [sentiero.id, sentiero]));
  }, [sentieriList]);

  useEffect(() => {
    return () => {
      trailPreviewTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      trailPreviewTimersRef.current = [];
      if (trailSwitchWowTimerRef.current !== null) {
        window.clearTimeout(trailSwitchWowTimerRef.current);
        trailSwitchWowTimerRef.current = null;
      }
      if (immersionTimerRef.current !== null) {
        window.clearTimeout(immersionTimerRef.current);
        immersionTimerRef.current = null;
      }
    };
  }, []);

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
        tipo: location.type === "alloggio" ? "alloggi" : "ristoranti",
        coordinates: location.coordinates,
        description: location.description,
        maddiTip: location.maddiTip,
        isFavorite: location.isFavorite,
        maddiNote: location.maddiNote,
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
          rating: servizio.rating,
          reviews: servizio.reviews,
          ...getFavoriteMeta(servizio),
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
          rating: servizio.rating,
          reviews: servizio.reviews,
          ...getFavoriteMeta(servizio),
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
          rating: servizio.rating,
          reviews: servizio.reviews,
          ...getFavoriteMeta(servizio),
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
          rating: servizio.rating,
          reviews: servizio.reviews,
          ...getFavoriteMeta(servizio),
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
          rating: servizio.rating,
          reviews: servizio.reviews,
          ...getFavoriteMeta(servizio),
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
          rating: servizio.rating,
          reviews: servizio.reviews,
          ...getFavoriteMeta(servizio),
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
          rating: servizio.rating,
          reviews: servizio.reviews,
          ...getFavoriteMeta(servizio),
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
          rating: servizio.rating,
          reviews: servizio.reviews,
          ...getFavoriteMeta(servizio),
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
          rating: servizio.rating,
          reviews: servizio.reviews,
          ...getFavoriteMeta(servizio),
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
          rating: servizio.rating,
          reviews: servizio.reviews,
          ...getFavoriteMeta(servizio),
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
          maddiTip:
            servizio.maddiTip ??
            servizio.maddiNote ??
            "Sosta dolce perfetta dopo il giro in centro.",
          rating: servizio.rating,
          reviews: servizio.reviews,
          ...getFavoriteMeta(servizio),
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
          rating: servizio.rating,
          reviews: servizio.reviews,
          ...getFavoriteMeta(servizio),
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
          rating: servizio.rating,
          reviews: servizio.reviews,
          ...getFavoriteMeta(servizio),
        })),
    []
  );
  const ristorantiLocations = useMemo<MappaLocation[]>(
    () =>
      serviziRistoranti
        .filter(hasCoordinates)
        .map((servizio, index) => ({
          id: createServiceId("ristoranti", servizio.name, index),
          name: servizio.name,
          tipo: "ristoranti" as const,
          coordinates: servizio.coordinates,
          description: servizio.description ?? "Ristorante o pizzeria.",
          maddiTip: "Ottima scelta per una pausa pranzo o una cena locale.",
          rating: servizio.rating,
          reviews: servizio.reviews,
          ...getFavoriteMeta(servizio),
        })),
    []
  );
  const allLocations = useMemo<MappaLocation[]>(
    () => [
      ...baseLocations,
      ...ristorantiLocations,
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
        rating: spiaggia.rating,
        reviews: spiaggia.reviews,
        ...getFavoriteMeta(spiaggia),
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
      ristorantiLocations,
      spiaggeVisibili,
      supermercatiLocations,
      trasportiLocations,
      velaLocations,
      divingLocations,
      windsurfKiteLocations,
    ]
  );
  const visibleLocations = useMemo(
    () => {
      const categoryScopedLocations = allLocations.filter((location) =>
        filtroAttivo === "alloggi"
          ? location.tipo === "alloggi"
          : filtroAttivo === "sentieri"
            ? false
          : location.tipo === "alloggi" || location.tipo === filtroAttivo
      );

      const filteredLocations = showOnlyMaddiFavorites
        ? categoryScopedLocations.filter((location) => location.isFavorite === true)
        : categoryScopedLocations;

      return [...filteredLocations].sort((a, b) => {
        const aHasRating = typeof a.rating === "number";
        const bHasRating = typeof b.rating === "number";

        if (aHasRating && bHasRating) {
          const aRating = a.rating ?? 0;
          const bRating = b.rating ?? 0;
          if (bRating !== aRating) return bRating - aRating;
          const aReviews = typeof a.reviews === "number" ? a.reviews : 0;
          const bReviews = typeof b.reviews === "number" ? b.reviews : 0;
          if (bReviews !== aReviews) return bReviews - aReviews;
        } else if (aHasRating !== bHasRating) {
          return aHasRating ? -1 : 1;
        }

        return a.name.localeCompare(b.name, isEnglish ? "en" : "it");
      });
    },
    [allLocations, filtroAttivo, isEnglish, showOnlyMaddiFavorites]
  );
  const selectedLocation = useMemo(
    () => visibleLocations.find((location) => location.id === selectedLocationId),
    [selectedLocationId, visibleLocations]
  );
  const immersionPhotoMilestones = useMemo(() => {
    if (!selectedSentiero || selectedSentiero.pathCoordinates.length === 0) return [];
    return selectedSentiero.photoStops
      .map((photo, index) => ({
        photo,
        shotIndex: index + 1,
        pathIndex: getNearestPathIndex(photo.coordinates, selectedSentiero.pathCoordinates),
      }))
      .sort((a, b) => a.pathIndex - b.pathIndex);
  }, [selectedSentiero]);
  const immersionTotalShots = immersionPhotoMilestones.length;
  const categoryFilterOptions = [
    { key: "alloggi", label: isEnglish ? "Accommodation" : "Alloggi" },
    { key: "spiagge", label: isEnglish ? "Beaches" : "Spiagge" },
    { key: "sentieri", label: isEnglish ? "Trails" : "Sentieri" },
    { key: "ristoranti", label: isEnglish ? "Restaurants" : "Ristoranti" },
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
  const primaryMobileFilters: readonly FiltroAttivo[] = [
    "alloggi",
    "spiagge",
    "sentieri",
    "ristoranti",
    "banche",
  ];
  const hasHiddenMobileFilters = categoryFilterOptions.some(
    (item) => !primaryMobileFilters.includes(item.key)
  );

  useEffect(() => {
    if (!showAllMobileFilters) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showAllMobileFilters]);

  const handleSpiaggiaClick = useCallback((coordinates: [number, number]) => {
    setWindExpertAttivo(true);
    setFiltroAttivo("spiagge");
    setPendingSpiaggiaCoords(coordinates);
  }, []);

  const clearTrailPreviewTimers = useCallback(() => {
    trailPreviewTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    trailPreviewTimersRef.current = [];
  }, []);

  const stopTotalImmersion = useCallback((deactivate = true) => {
    if (immersionTimerRef.current !== null) {
      window.clearTimeout(immersionTimerRef.current);
      immersionTimerRef.current = null;
    }
    if (deactivate) {
      setIsTotalImmersionActive(false);
      setIsTotalImmersionPaused(false);
      setVisibleImmersionPhotos([]);
      setImmersionStepIndex(0);
      setImmersionPassedShots(0);
      setImmersionCurrentTitle("");
    }
  }, []);

  const runNextImmersionStep = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const path = immersionPathRef.current;
    const sentiero = activeImmersionSentieroRef.current;
    if (!sentiero || path.length === 0) {
      stopTotalImmersion(true);
      return;
    }
    const idx = immersionStepRef.current;
    setImmersionStepIndex(idx);
    if (idx >= path.length) {
      stopTotalImmersion(true);
      setTrailConfirmSentiero(sentiero);
      return;
    }
    const current = path[idx];
    const next = path[Math.min(idx + 1, path.length - 1)];
    map.easeTo({
      center: current,
      zoom: 15.35,
      pitch: 60,
      bearing: getBearingBetweenPoints(current, next),
      duration: 1200,
      essential: true,
    });
    immersionStepRef.current += 1;
    immersionTimerRef.current = window.setTimeout(runNextImmersionStep, 1000);
  }, [stopTotalImmersion]);

  const pauseTotalImmersion = useCallback(() => {
    if (!isTotalImmersionActive) return;
    if (immersionTimerRef.current !== null) {
      window.clearTimeout(immersionTimerRef.current);
      immersionTimerRef.current = null;
    }
    setIsTotalImmersionPaused(true);
  }, [isTotalImmersionActive]);

  const resumeTotalImmersion = useCallback(() => {
    if (!isTotalImmersionActive) return;
    if (!isTotalImmersionPaused) return;
    setIsTotalImmersionPaused(false);
    runNextImmersionStep();
  }, [isTotalImmersionActive, isTotalImmersionPaused, runNextImmersionStep]);

  const scrubTotalImmersion = useCallback(
    (ratio: number) => {
      const map = mapRef.current;
      if (!map || !isTotalImmersionActive) return;
      const path = immersionPathRef.current;
      if (path.length === 0) return;
      const clamped = Math.max(0, Math.min(1, ratio));
      const targetIndex = Math.round(clamped * (path.length - 1));
      const target = path[targetIndex];
      const next = path[Math.min(targetIndex + 1, path.length - 1)] ?? target;

      if (immersionTimerRef.current !== null) {
        window.clearTimeout(immersionTimerRef.current);
        immersionTimerRef.current = null;
      }
      immersionStepRef.current = targetIndex;
      setImmersionStepIndex(targetIndex);

      map.jumpTo({
        center: target,
        zoom: 15.35,
        pitch: 60,
        bearing: getBearingBetweenPoints(target, next),
      });

      if (!isTotalImmersionPaused) {
        immersionTimerRef.current = window.setTimeout(runNextImmersionStep, 180);
      }
    },
    [isTotalImmersionActive, isTotalImmersionPaused, runNextImmersionStep]
  );

  const loadTrail15Photos = useCallback(async () => {
    if (trail15Photos) return trail15Photos;
    const response = await fetch("/data/foto-sentiero15.json");
    if (!response.ok) {
      throw new Error("foto-sentiero15.json non disponibile");
    }
    const payload = (await response.json()) as TrailPhoto[];
    setTrail15Photos(payload);
    return payload;
  }, [trail15Photos]);

  const startTotalImmersion = useCallback(
    async (sentiero: SentieroInfo) => {
      const map = mapRef.current;
      if (!map) return;

      let effectiveSentiero = sentiero;
      if (isPercorso15Trail(sentiero)) {
        try {
          const loaded = await loadTrail15Photos();
          effectiveSentiero = { ...sentiero, photoStops: loaded };
          setSelectedSentiero(effectiveSentiero);
        } catch {
          // Se il file foto non e disponibile, continuiamo senza timeline foto.
        }
      }

      stopTotalImmersion(false);
      setLightboxPhoto(null);
      setTrailConfirmSentiero(null);
      setIsTrailPreviewing(false);
      setIsTotalImmersionActive(true);
      setIsTotalImmersionPaused(false);
      setImmersionStepIndex(0);
      setImmersionPassedShots(0);
      setImmersionCurrentTitle("");
      activeImmersionSentieroRef.current = effectiveSentiero;
      immersionPathRef.current =
        effectiveSentiero.pathCoordinates.length > 0
          ? effectiveSentiero.pathCoordinates
          : [effectiveSentiero.previewCoordinates, effectiveSentiero.coordinates];
      immersionStepRef.current = 0;
      runNextImmersionStep();
    },
    [loadTrail15Photos, runNextImmersionStep, stopTotalImmersion]
  );

  const runTrailCinematicPreview = useCallback(
    (sentiero: SentieroInfo) => {
      const map = mapRef.current;
      if (!map) return;

      trailPreviewRunIdRef.current += 1;
      const runId = trailPreviewRunIdRef.current;
      clearTrailPreviewTimers();
      setIsTrailPreviewing(true);
      setTrailConfirmSentiero(null);

      map.flyTo({
        center: sentiero.previewCoordinates,
        zoom: 14.4,
        pitch: 60,
        bearing: sentiero.previewBearing,
        duration: 2200,
        essential: true,
      });

      const secondLegTimer = window.setTimeout(() => {
        if (trailPreviewRunIdRef.current !== runId) return;
        map.flyTo({
          center: sentiero.coordinates,
          zoom: 15.1,
          pitch: 60,
          bearing: sentiero.previewBearing,
          duration: 1800,
          essential: true,
        });
      }, 1800);

      const confirmTimer = window.setTimeout(() => {
        if (trailPreviewRunIdRef.current !== runId) return;
        setIsTrailPreviewing(false);
        setTrailConfirmSentiero(sentiero);
      }, 3500);

      trailPreviewTimersRef.current.push(secondLegTimer, confirmTimer);
    },
    [clearTrailPreviewTimers]
  );

  const toggleTrailFullscreen = useCallback(async () => {
    const container = immersiveContainerRef.current;
    if (!container) return;

    if (isTrailPseudoFullscreen) {
      setIsTrailPseudoFullscreen(false);
      return;
    }

    if (document.fullscreenElement === container) {
      try {
        await document.exitFullscreen();
      } catch {
        setIsTrailPseudoFullscreen(false);
      }
      return;
    }

    try {
      const request = (container as HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> })
        .requestFullscreen
        ? () => container.requestFullscreen()
        : (container as HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> })
              .webkitRequestFullscreen
          ? () =>
              (container as HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> })
                .webkitRequestFullscreen?.()
          : null;

      if (!request) {
        setIsTrailPseudoFullscreen(true);
        return;
      }

      await request();
      setIsTrailPseudoFullscreen(false);
    } catch {
      // Fallback affidabile quando Fullscreen API non e disponibile (iframe/policy/browser).
      setIsTrailPseudoFullscreen(true);
    }
  }, [isTrailPseudoFullscreen]);

  const focusSentiero = useCallback((sentiero: SentieroInfo) => {
    setSelectedSentiero(sentiero);
    setHoveredSentieroId(sentiero.id);
    runTrailCinematicPreview(sentiero);
  }, [runTrailCinematicPreview]);

  const focusSentieroWithWow = useCallback(
    (sentiero: SentieroInfo) => {
      const map = mapRef.current;
      if (!map) {
        focusSentiero(sentiero);
        return;
      }

      stopTotalImmersion(true);
      setIsTrailPreviewing(false);
      setTrailConfirmSentiero(null);
      setSelectedSentiero(sentiero);
      setHoveredSentieroId(sentiero.id);

      if (trailSwitchWowTimerRef.current !== null) {
        window.clearTimeout(trailSwitchWowTimerRef.current);
        trailSwitchWowTimerRef.current = null;
      }

      map.flyTo({
        center: defaultCenter,
        zoom: 13.9,
        pitch: 60,
        bearing: (sentiero.previewBearing + 130) % 360,
        duration: 1100,
        speed: 0.75,
        curve: 1.45,
        essential: true,
      });

      trailSwitchWowTimerRef.current = window.setTimeout(() => {
        runTrailCinematicPreview(sentiero);
        trailSwitchWowTimerRef.current = null;
      }, 900);
    },
    [focusSentiero, runTrailCinematicPreview, stopTotalImmersion]
  );

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
      const popup = new mapboxgl.Popup({
        offset: 18,
        closeOnClick: false,
        maxWidth: "320px",
      }).setHTML(
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

    if (!windExpertAttivo) {
      setWeatherLayerError(null);
      return;
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
  }, [activeWeatherLayer, isEnglish, isMapReady, windExpertAttivo]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    const emptyCollection: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [],
    };

    if (!map.getSource(SENTIERI_SOURCE_ID)) {
      map.addSource(SENTIERI_SOURCE_ID, {
        type: "geojson",
        data: emptyCollection,
      });
    }

    if (!map.getLayer(SENTIERI_LAYER_ID)) {
      map.addLayer({
        id: SENTIERI_LAYER_ID,
        type: "line",
        source: SENTIERI_SOURCE_ID,
        layout: {
          "line-join": "round",
          "line-cap": "round",
          visibility: "none",
        },
        paint: {
          "line-color": "#06b6d4",
          "line-opacity": 0.8,
          "line-width": 3,
        },
      });
    }

    if (!map.getLayer(SENTIERI_HIGHLIGHT_LAYER_ID)) {
      map.addLayer({
        id: SENTIERI_HIGHLIGHT_LAYER_ID,
        type: "line",
        source: SENTIERI_SOURCE_ID,
        layout: {
          "line-join": "round",
          "line-cap": "round",
          visibility: "none",
        },
        paint: {
          "line-color": "#22d3ee",
          "line-opacity": 0.95,
          "line-width": 5,
        },
        filter: ["==", ["get", "trailId"], "__none__"],
      });
    }

    if (!map.getSource(SENTIERI_START_SOURCE_ID)) {
      map.addSource(SENTIERI_START_SOURCE_ID, {
        type: "geojson",
        data: emptyCollection,
      });
    }

    if (!map.getLayer(SENTIERI_START_LAYER_ID)) {
      map.addLayer({
        id: SENTIERI_START_LAYER_ID,
        type: "circle",
        source: SENTIERI_START_SOURCE_ID,
        layout: {
          visibility: "none",
          "circle-sort-key": 100,
        },
        paint: {
          "circle-radius": 7,
          "circle-color": "#f97316",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
          "circle-opacity": 0.92,
          "circle-pitch-scale": "viewport",
          "circle-pitch-alignment": "viewport",
        },
      });
    }

    if (!map.getLayer(SENTIERI_START_LABEL_LAYER_ID)) {
      map.addLayer({
        id: SENTIERI_START_LABEL_LAYER_ID,
        type: "symbol",
        source: SENTIERI_START_SOURCE_ID,
        layout: {
          "text-field": "START",
          "text-size": 10,
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-offset": [0, 1.5],
          "text-anchor": "top",
          visibility: "none",
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "#0f172a",
          "text-halo-width": 1,
        },
      });
    }

    if (!map.getSource(SENTIERI_PHOTO_SOURCE_ID)) {
      map.addSource(SENTIERI_PHOTO_SOURCE_ID, {
        type: "geojson",
        data: emptyCollection,
      });
    }

    if (!map.hasImage(SENTIERI_PHOTO_ICON_ID)) {
      const size = 56;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Cerchio di base
        ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, 20, 0, Math.PI * 2);
        ctx.fill();

        // Corpo camera
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(14, 20, 28, 17);
        ctx.fillRect(20, 16, 8, 5);

        // Lente
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(size / 2, 28, 5.5, 0, Math.PI * 2);
        ctx.fill();

        const imageData = ctx.getImageData(0, 0, size, size);
        map.addImage(SENTIERI_PHOTO_ICON_ID, imageData, { pixelRatio: 2 });
      }
    }

    if (!map.getLayer(SENTIERI_PHOTO_DOT_LAYER_ID)) {
      map.addLayer({
        id: SENTIERI_PHOTO_DOT_LAYER_ID,
        type: "circle",
        source: SENTIERI_PHOTO_SOURCE_ID,
        layout: {
          visibility: "none",
          "circle-sort-key": 200,
        },
        paint: {
          "circle-radius": [
            "*",
            [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              3.5,
              12,
              5.5,
              15,
              9.5,
              18,
              14
            ],
            ["case", ["boolean", ["feature-state", "hover"], false], 1.25, 1]
          ],
          "circle-color": "#ffffff",
          "circle-opacity": 0.96,
          "circle-stroke-color": "#0f172a",
          "circle-stroke-width": 1.8,
          "circle-pitch-scale": "viewport",
          "circle-pitch-alignment": "viewport",
        },
      });
    }

    if (!map.getLayer(SENTIERI_PHOTO_LAYER_ID)) {
      map.addLayer({
        id: SENTIERI_PHOTO_LAYER_ID,
        type: "symbol",
        source: SENTIERI_PHOTO_SOURCE_ID,
        layout: {
          "icon-image": SENTIERI_PHOTO_ICON_ID,
          "icon-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            0.42,
            12,
            0.62,
            15,
            1.1,
            18,
            1.8,
          ],
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
          "icon-pitch-alignment": "viewport",
          "icon-rotation-alignment": "viewport",
          "symbol-sort-key": 300,
          visibility: "none",
        },
        paint: {
          "icon-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1,
            0.92,
          ],
          "icon-halo-color": "#ffffff",
          "icon-halo-width": 1,
        },
      });
    }

    let isCancelled = false;

    const loadTrailSources = async () => {
      const urls = ["/data/sentieri-caprera.geojson", "/data/sentieri-maddalena.geojson"];
      const settled = await Promise.allSettled(urls.map((url) => fetch(url)));
      if (isCancelled) return;

      const lineFeatures: unknown[] = [];
      const startPointFeatures: unknown[] = [];
      const parsedSentieri: SentieroInfo[] = [];

      let trailIndex = 0;

      for (let sourceIndex = 0; sourceIndex < settled.length; sourceIndex += 1) {
        const result = settled[sourceIndex];
        if (result.status !== "fulfilled" || !result.value.ok) continue;

        const json = (await result.value.json()) as {
          features?: Array<{
            type?: string;
            properties?: Record<string, unknown>;
            geometry?: { type?: string; coordinates?: unknown };
          }>;
        };
        const features = Array.isArray(json.features) ? json.features : [];

        for (const feature of features) {
          const geometryType = feature.geometry?.type;
          if (geometryType !== "LineString" && geometryType !== "MultiLineString") {
            continue;
          }

          const featureLike = feature as unknown as mapboxgl.MapboxGeoJSONFeature;
          const properties = { ...(feature.properties ?? {}) } as Record<string, unknown>;
          const rawName = getTrailProp(featureLike.properties, ["name"]);
          const name =
            rawName || (isEnglish ? `Trail ${trailIndex + 1}` : `Sentiero ${trailIndex + 1}`);
          const trailId =
            (typeof properties["@id"] === "string" && properties["@id"]) ||
            (typeof properties.id === "string" && properties.id) ||
            `${name}-${trailIndex}`;
          properties.trailId = trailId;
          properties.name = name;

          const difficulty =
            getTrailProp(featureLike.properties, [
              "difficulty",
              "difficolta",
              "level",
              "grado",
            ]) || (isEnglish ? "Not specified" : "Non specificata");
          properties.difficulty = difficulty;

          const duration =
            getTrailProp(featureLike.properties, [
              "duration",
              "estimatedTime",
              "tempo_stimato",
              "tempo",
              "estimated_time",
            ]) || (isEnglish ? "Not specified" : "Non specificato");
          properties.duration = duration;

          const description =
            getTrailProp(featureLike.properties, [
              "description",
              "descrizione",
              "maddiNote",
              "note",
              "details",
            ]) ||
            (isEnglish
              ? "No description yet. Add it in the trail GeoJSON as `description`."
              : "Nessuna descrizione ancora. Aggiungila nel GeoJSON del sentiero come `description`.");
          properties.description = description;

          const imageUrl = getTrailProp(featureLike.properties, [
            "image",
            "imageUrl",
            "photo",
            "preview",
            "thumbnail",
          ]);
          if (imageUrl) properties.image = imageUrl;

          const startCoordinates = getTrailStartCoordinates(featureLike.geometry);
          if (!startCoordinates) continue;
          const trailCoordinates = getTrailLineCoordinates(featureLike.geometry);
          const previewCoordinates =
            trailCoordinates.length > 2
              ? trailCoordinates[Math.floor(trailCoordinates.length / 2)]
              : startCoordinates;
          const previewBearing =
            trailCoordinates.length > 1
              ? getBearingBetweenPoints(trailCoordinates[0], trailCoordinates[1])
              : 18;

          parsedSentieri.push({
            id: String(trailId),
            name,
            description,
            difficulty,
            duration,
            imageUrl: imageUrl || undefined,
            coordinates: startCoordinates,
            pathCoordinates: trailCoordinates,
            previewCoordinates,
            previewBearing,
            photoStops: parseTrailPhotos(feature.properties ?? {}, trailCoordinates, String(trailId)),
          });

          lineFeatures.push({
            ...feature,
            properties,
          });

          startPointFeatures.push({
            type: "Feature",
            properties: {
              trailId,
              name,
              description,
              difficulty,
              duration,
              image: imageUrl,
              previewBearing,
              previewLng: previewCoordinates[0],
              previewLat: previewCoordinates[1],
            },
            geometry: {
              type: "Point",
              coordinates: startCoordinates,
            },
          });
          trailIndex += 1;
        }
      }

      if (isCancelled) return;

      const lineCollection = {
        type: "FeatureCollection",
        features: lineFeatures,
      };
      const startCollection = {
        type: "FeatureCollection",
        features: startPointFeatures,
      };

      const lineSource = map.getSource(SENTIERI_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
      lineSource?.setData(lineCollection as GeoJSON.FeatureCollection);

      const startSource = map.getSource(SENTIERI_START_SOURCE_ID) as
        | mapboxgl.GeoJSONSource
        | undefined;
      startSource?.setData(startCollection as GeoJSON.FeatureCollection);

      setSentieriList(parsedSentieri);
    };

    void loadTrailSources();

    const handleTrailClick = (
      event: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }
    ) => {
      const feature = event.features?.[0];
      if (!feature) return;
      const trailId = getTrailProp(feature.properties, ["trailId"]);
      const name =
        getTrailProp(feature.properties, ["name"]) || (isEnglish ? "Unnamed trail" : "Sentiero");
      const description =
        getTrailProp(feature.properties, ["description", "descrizione", "maddiNote", "note"]) ||
        (isEnglish ? "No description available." : "Nessuna descrizione disponibile.");
      const difficulty =
        getTrailProp(feature.properties, ["difficulty", "difficolta"]) ||
        (isEnglish ? "Not specified" : "Non specificata");
      const duration =
        getTrailProp(feature.properties, ["duration", "estimatedTime", "tempo_stimato", "tempo"]) ||
        (isEnglish ? "Not specified" : "Non specificato");
      const imageUrl = getTrailProp(feature.properties, [
        "image",
        "imageUrl",
        "photo",
        "preview",
        "thumbnail",
      ]);
      const startCoordinates = getTrailStartCoordinates(feature.geometry) ?? [
        event.lngLat.lng,
        event.lngLat.lat,
      ];
      const previewCoordinates = [
        Number(feature.properties?.previewLng ?? startCoordinates[0]),
        Number(feature.properties?.previewLat ?? startCoordinates[1]),
      ] as [number, number];
      const previewBearing = Number(feature.properties?.previewBearing ?? 18);
      const pathCoordinates = getTrailLineCoordinates(feature.geometry);
      const mappedSentiero = trailId ? sentieriByIdRef.current[trailId] : undefined;
      const sentieroToSelect: SentieroInfo = {
        id: trailId || name,
        name,
        description,
        difficulty,
        duration,
        imageUrl: imageUrl || undefined,
        coordinates: startCoordinates,
        pathCoordinates,
        previewCoordinates,
        previewBearing,
        photoStops: mappedSentiero?.photoStops ?? [],
      };
      focusSentiero(sentieroToSelect);
    };

    const openTrailPopupAtStart = (sentiero: SentieroInfo, lngLat: mapboxgl.LngLat) => {
      const detailsLabel = isEnglish ? "Details" : "Dettagli";
      const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: "240px",
      });

      const popupContent = document.createElement("div");
      popupContent.style.display = "grid";
      popupContent.style.gap = "8px";

      const title = document.createElement("p");
      title.style.margin = "0";
      title.style.fontSize = "13px";
      title.style.fontWeight = "700";
      title.style.color = "#0f172a";
      title.textContent = sentiero.name;

      const button = document.createElement("button");
      button.type = "button";
      button.textContent = detailsLabel;
      button.style.display = "inline-flex";
      button.style.alignItems = "center";
      button.style.justifyContent = "center";
      button.style.minHeight = "30px";
      button.style.borderRadius = "8px";
      button.style.border = "1px solid #0891b2";
      button.style.padding = "4px 10px";
      button.style.fontSize = "12px";
      button.style.fontWeight = "700";
      button.style.color = "#0e7490";
      button.style.background = "#ecfeff";
      button.style.cursor = "pointer";

      button.addEventListener("click", () => {
        focusSentiero(sentiero);
        popup.remove();
      });

      popupContent.append(title, button);
      popup.setDOMContent(popupContent).setLngLat(lngLat).addTo(map);
    };

    const handleTrailMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handleTrailMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    const handleStartClick = (
      event: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }
    ) => {
      const feature = event.features?.[0];
      if (!feature || feature.geometry.type !== "Point") return;
      const point = feature.geometry.coordinates;
      if (!Array.isArray(point) || point.length < 2) return;
      const trailId = getTrailProp(feature.properties, ["trailId"]);
      const mapped = trailId ? sentieriByIdRef.current[trailId] : undefined;
      if (mapped) {
        openTrailPopupAtStart(mapped, event.lngLat);
        return;
      }
      const fallbackSentiero: SentieroInfo = {
        id: trailId || getTrailProp(feature.properties, ["name"]) || `${point[0]}-${point[1]}`,
        name: getTrailProp(feature.properties, ["name"]) || (isEnglish ? "Trail start" : "Inizio sentiero"),
        description:
          getTrailProp(feature.properties, ["description"]) ||
          (isEnglish ? "Trail preview." : "Anteprima sentiero."),
        difficulty:
          getTrailProp(feature.properties, ["difficulty"]) ||
          (isEnglish ? "Not specified" : "Non specificata"),
        duration:
          getTrailProp(feature.properties, ["duration", "estimatedTime"]) ||
          (isEnglish ? "Not specified" : "Non specificato"),
        imageUrl: getTrailProp(feature.properties, ["image"]) || undefined,
        coordinates: [Number(point[0]), Number(point[1])],
        pathCoordinates: [],
        previewCoordinates: [
          Number(feature.properties?.previewLng ?? point[0]),
          Number(feature.properties?.previewLat ?? point[1]),
        ],
        previewBearing: Number(feature.properties?.previewBearing ?? 18),
        photoStops: [],
      };
      openTrailPopupAtStart(fallbackSentiero, event.lngLat);
    };

    const handlePhotoClick = (
      event: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }
    ) => {
      const feature = event.features?.[0];
      if (!feature || feature.geometry.type !== "Point") return;
      const imageUrl = getTrailProp(feature.properties, ["imageUrl", "url"]);
      if (!imageUrl) return;
      const relatedRouteId = getTrailProp(feature.properties, ["relatedRouteId"]);
      const photoId = getTrailProp(feature.properties, ["id"]);
      const point = feature.geometry.coordinates;
      if (!Array.isArray(point) || point.length < 2) return;
      if (isTotalImmersionActive) {
        pauseTotalImmersion();
      }
      setLightboxPhoto({
        id: photoId || `photo-${Number(point[0]).toFixed(5)}-${Number(point[1]).toFixed(5)}`,
        imageUrl,
        coordinates: [Number(point[0]), Number(point[1])],
        relatedRouteId,
        maddiNote: getTrailProp(feature.properties, ["maddiNote", "caption"]),
        title: getTrailProp(feature.properties, ["title"]),
      });
    };

    const handlePhotoMouseMove = (
      event: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }
    ) => {
      const feature = event.features?.[0];
      const nextId = feature?.id;
      const prevId = hoveredPhotoFeatureIdRef.current;
      if (prevId !== null && prevId !== undefined && prevId !== nextId) {
        map.setFeatureState(
          { source: SENTIERI_PHOTO_SOURCE_ID, id: prevId },
          { hover: false }
        );
      }
      if (nextId !== null && nextId !== undefined && prevId !== nextId) {
        map.setFeatureState(
          { source: SENTIERI_PHOTO_SOURCE_ID, id: nextId },
          { hover: true }
        );
      }
      hoveredPhotoFeatureIdRef.current = nextId ?? null;
    };

    map.on("click", SENTIERI_LAYER_ID, handleTrailClick);
    map.on("click", SENTIERI_START_LAYER_ID, handleStartClick);
    map.on("click", SENTIERI_START_LABEL_LAYER_ID, handleStartClick);
    map.on("click", SENTIERI_PHOTO_DOT_LAYER_ID, handlePhotoClick);
    map.on("click", SENTIERI_PHOTO_LAYER_ID, handlePhotoClick);
    map.on("mouseenter", SENTIERI_LAYER_ID, handleTrailMouseEnter);
    map.on("mouseleave", SENTIERI_LAYER_ID, handleTrailMouseLeave);
    map.on("mouseenter", SENTIERI_START_LAYER_ID, handleTrailMouseEnter);
    map.on("mouseleave", SENTIERI_START_LAYER_ID, handleTrailMouseLeave);
    map.on("mouseenter", SENTIERI_START_LABEL_LAYER_ID, handleTrailMouseEnter);
    map.on("mouseleave", SENTIERI_START_LABEL_LAYER_ID, handleTrailMouseLeave);
    map.on("mouseenter", SENTIERI_PHOTO_DOT_LAYER_ID, handleTrailMouseEnter);
    map.on("mousemove", SENTIERI_PHOTO_DOT_LAYER_ID, handlePhotoMouseMove);
    map.on("mouseleave", SENTIERI_PHOTO_DOT_LAYER_ID, handleTrailMouseLeave);
    map.on("mouseenter", SENTIERI_PHOTO_LAYER_ID, handleTrailMouseEnter);
    map.on("mousemove", SENTIERI_PHOTO_LAYER_ID, handlePhotoMouseMove);
    map.on("mouseleave", SENTIERI_PHOTO_LAYER_ID, handleTrailMouseLeave);

    return () => {
      isCancelled = true;
      const hoveredId = hoveredPhotoFeatureIdRef.current;
      if (hoveredId !== null && hoveredId !== undefined) {
        map.setFeatureState(
          { source: SENTIERI_PHOTO_SOURCE_ID, id: hoveredId },
          { hover: false }
        );
      }
      hoveredPhotoFeatureIdRef.current = null;
      const activeGalleryId = activeGalleryPhotoFeatureIdRef.current;
      if (activeGalleryId !== null && activeGalleryId !== undefined) {
        map.setFeatureState(
          { source: SENTIERI_PHOTO_SOURCE_ID, id: activeGalleryId },
          { hover: false }
        );
      }
      activeGalleryPhotoFeatureIdRef.current = null;
      map.off("click", SENTIERI_LAYER_ID, handleTrailClick);
      map.off("click", SENTIERI_START_LAYER_ID, handleStartClick);
      map.off("click", SENTIERI_START_LABEL_LAYER_ID, handleStartClick);
      map.off("click", SENTIERI_PHOTO_DOT_LAYER_ID, handlePhotoClick);
      map.off("click", SENTIERI_PHOTO_LAYER_ID, handlePhotoClick);
      map.off("mouseenter", SENTIERI_LAYER_ID, handleTrailMouseEnter);
      map.off("mouseleave", SENTIERI_LAYER_ID, handleTrailMouseLeave);
      map.off("mouseenter", SENTIERI_START_LAYER_ID, handleTrailMouseEnter);
      map.off("mouseleave", SENTIERI_START_LAYER_ID, handleTrailMouseLeave);
      map.off("mouseenter", SENTIERI_START_LABEL_LAYER_ID, handleTrailMouseEnter);
      map.off("mouseleave", SENTIERI_START_LABEL_LAYER_ID, handleTrailMouseLeave);
      map.off("mouseenter", SENTIERI_PHOTO_DOT_LAYER_ID, handleTrailMouseEnter);
      map.off("mousemove", SENTIERI_PHOTO_DOT_LAYER_ID, handlePhotoMouseMove);
      map.off("mouseleave", SENTIERI_PHOTO_DOT_LAYER_ID, handleTrailMouseLeave);
      map.off("mouseenter", SENTIERI_PHOTO_LAYER_ID, handleTrailMouseEnter);
      map.off("mousemove", SENTIERI_PHOTO_LAYER_ID, handlePhotoMouseMove);
      map.off("mouseleave", SENTIERI_PHOTO_LAYER_ID, handleTrailMouseLeave);
      map.getCanvas().style.cursor = "";
    };
  }, [focusSentiero, isEnglish, isMapReady, isTotalImmersionActive, pauseTotalImmersion]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;
    const visibility = filtroAttivo === "sentieri" ? "visible" : "none";
    const activePhotoStops =
      selectedSentiero && isPercorso15Trail(selectedSentiero)
        ? selectedSentiero.photoStops.length > 0
          ? selectedSentiero.photoStops
          : (trail15Photos ?? [])
        : selectedSentiero?.photoStops ?? [];

    if (map.getLayer(SENTIERI_LAYER_ID)) {
      map.setLayoutProperty(SENTIERI_LAYER_ID, "visibility", visibility);
    }
    if (map.getLayer(SENTIERI_HIGHLIGHT_LAYER_ID)) {
      map.setLayoutProperty(SENTIERI_HIGHLIGHT_LAYER_ID, "visibility", visibility);
      const activeTrailId = hoveredSentieroId ?? selectedSentiero?.id ?? "__none__";
      map.setFilter(SENTIERI_HIGHLIGHT_LAYER_ID, ["==", ["get", "trailId"], activeTrailId]);
    }
    if (map.getLayer(SENTIERI_START_LAYER_ID)) {
      map.setLayoutProperty(SENTIERI_START_LAYER_ID, "visibility", visibility);
    }
    if (map.getLayer(SENTIERI_START_LABEL_LAYER_ID)) {
      map.setLayoutProperty(SENTIERI_START_LABEL_LAYER_ID, "visibility", visibility);
    }
    if (map.getLayer(SENTIERI_PHOTO_LAYER_ID)) {
      const photoVisibility =
        filtroAttivo === "sentieri" && activePhotoStops.length > 0
          ? "visible"
          : "none";
      map.setLayoutProperty(SENTIERI_PHOTO_LAYER_ID, "visibility", photoVisibility);
      if (map.getLayer(SENTIERI_PHOTO_DOT_LAYER_ID)) {
        map.setLayoutProperty(SENTIERI_PHOTO_DOT_LAYER_ID, "visibility", photoVisibility);
      }
    }
  }, [filtroAttivo, hoveredSentieroId, isMapReady, selectedSentiero, trail15Photos]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;
    const photoSource = map.getSource(SENTIERI_PHOTO_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (!photoSource) return;
    const photoStops =
      selectedSentiero && isPercorso15Trail(selectedSentiero)
        ? selectedSentiero.photoStops.length > 0
          ? selectedSentiero.photoStops
          : (trail15Photos ?? [])
        : (selectedSentiero?.photoStops ?? []);
    const features = photoStops.map((photo) => ({
      id: photo.id,
      type: "Feature",
      properties: {
        id: photo.id,
        imageUrl: photo.imageUrl,
        relatedRouteId: photo.relatedRouteId,
        maddiNote: photo.maddiNote,
          title: photo.title ?? "",
      },
      geometry: {
        type: "Point",
        coordinates: photo.coordinates,
      },
    }));
    photoSource.setData({
      type: "FeatureCollection",
      features,
    } as GeoJSON.FeatureCollection);
  }, [isMapReady, selectedSentiero, trail15Photos]);

  useEffect(() => {
    if (filtroAttivo !== "sentieri") {
      setSelectedSentiero(null);
      setHoveredSentieroId(null);
      setTrailConfirmSentiero(null);
      setIsTrailPreviewing(false);
      setLightboxPhoto(null);
      clearTrailPreviewTimers();
      stopTotalImmersion(true);
    }
  }, [clearTrailPreviewTimers, filtroAttivo, stopTotalImmersion]);

  useEffect(() => {
    if (filtroAttivo !== "sentieri" || !selectedSentiero?.id) return;
    const targetCard = sentieroCardRefs.current[selectedSentiero.id];
    targetCard?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [filtroAttivo, selectedSentiero]);

  useEffect(() => {
    if (filtroAttivo !== "sentieri" || !selectedSentiero) return;
    if (!isPercorso15Trail(selectedSentiero)) return;
    if (selectedSentiero.photoStops.length > 0 && trail15Photos) return;

    let isCancelled = false;
    const hydrateTrail15Photos = async () => {
      try {
        const loaded = await loadTrail15Photos();
        if (isCancelled) return;
        setSelectedSentiero((current) => {
          if (!current || current.id !== selectedSentiero.id) return current;
          if (current.photoStops.length > 0 && trail15Photos) return current;
          return { ...current, photoStops: loaded };
        });
      } catch {
        // Se il file non e disponibile lasciamo il comportamento corrente.
      }
    };

    void hydrateTrail15Photos();
    return () => {
      isCancelled = true;
    };
  }, [filtroAttivo, loadTrail15Photos, selectedSentiero, trail15Photos]);

  useEffect(() => {
    if (!isTotalImmersionActive || !selectedSentiero) {
      setImmersionPassedShots(0);
      setImmersionCurrentTitle("");
      return;
    }
    const passed = immersionPhotoMilestones.filter(
      (milestone) => milestone.pathIndex <= immersionStepIndex
    );
    setImmersionPassedShots(passed.length);
    const titled = [...passed]
      .reverse()
      .find(
        (milestone) =>
          typeof milestone.photo.title === "string" && milestone.photo.title.trim().length > 0
      );
    setImmersionCurrentTitle(titled?.photo.title?.trim() ?? "");
  }, [immersionPhotoMilestones, immersionStepIndex, isTotalImmersionActive, selectedSentiero]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;
    if (!isTotalImmersionActive || isTotalImmersionPaused || lightboxPhoto) {
      setVisibleImmersionPhotos([]);
      return;
    }
    if (!selectedSentiero || selectedSentiero.photoStops.length === 0) {
      setVisibleImmersionPhotos([]);
      return;
    }

    const updateVisiblePhotos = () => {
      const camera = map.getCenter();
      const cameraCoords: [number, number] = [camera.lng, camera.lat];
      const nearby = selectedSentiero.photoStops
        .map((photo) => ({
          photo,
          distance: haversineMeters(cameraCoords, photo.coordinates),
        }))
        .filter((entry) => entry.distance <= 50)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 4)
        .map((entry) => {
          const projected = map.project(entry.photo.coordinates);
          return {
            photo: entry.photo,
            opacity: Math.max(0.15, 1 - entry.distance / 50),
            left: projected.x,
            top: projected.y,
          };
        });

      setVisibleImmersionPhotos(nearby);
    };

    updateVisiblePhotos();
    map.on("move", updateVisiblePhotos);
    map.on("zoom", updateVisiblePhotos);
    map.on("pitch", updateVisiblePhotos);

    return () => {
      map.off("move", updateVisiblePhotos);
      map.off("zoom", updateVisiblePhotos);
      map.off("pitch", updateVisiblePhotos);
    };
  }, [
    isMapReady,
    isTotalImmersionActive,
    isTotalImmersionPaused,
    lightboxPhoto,
    selectedSentiero,
  ]);

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
      !windExpertAttivo ||
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
  }, [activeWeatherLayer, isMapReady, weather, windExpertAttivo]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    const center = map.getCenter();
    const zoom = map.getZoom();
    const bearing = map.getBearing();
    const pitch = map.getPitch();
    const isSentieriMode = filtroAttivo === "sentieri";
    const isImmersiveMode = isTrailFullscreen || isTrailPseudoFullscreen;
    const shouldTightenToTrail = isImmersiveMode && isSentieriMode && Boolean(selectedSentiero);
    const targetCenter = shouldTightenToTrail
      ? selectedSentiero?.previewCoordinates ?? [center.lng, center.lat]
      : ([center.lng, center.lat] as [number, number]);
    const targetZoom = shouldTightenToTrail ? Math.max(zoom, 15.25) : zoom;
    const targetPitch = shouldTightenToTrail ? Math.max(pitch, 58) : pitch;

    const resizeNow = () => {
      map.resize();
      map.jumpTo({
        center: targetCenter,
        zoom: targetZoom,
        bearing,
        pitch: targetPitch,
      });
    };

    const rafId = window.requestAnimationFrame(resizeNow);
    const timerId = window.setTimeout(() => {
      map.resize();
    }, 220);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timerId);
    };
  }, [
    filtroAttivo,
    isDesktopLayout,
    isMapReady,
    isTrailFullscreen,
    isTrailPseudoFullscreen,
    selectedSentiero,
  ]);

  const isSentieriActive = filtroAttivo === "sentieri";
  const isTrailImmersive = isTrailFullscreen || isTrailPseudoFullscreen;
  const mapHeightClassName = isSentieriActive
    ? isTrailImmersive
      ? "h-[100vh]"
      : "h-screen sm:h-[78vh]"
    : heightClassName;
  const trailSheetHeights = useMemo(() => {
    const viewport = mobileViewportHeight || 800;
    return {
      min: 74,
      mid: Math.max(220, Math.round(viewport * 0.3)),
      max: Math.max(340, Math.round(viewport * 0.8)),
    };
  }, [mobileViewportHeight]);
  const mobileTrailSheetHeight =
    mobileTrailSheetDragHeight ??
    (mobileTrailSheetState === "min"
      ? trailSheetHeights.min
      : mobileTrailSheetState === "max"
        ? trailSheetHeights.max
        : trailSheetHeights.mid);

  const collapseMobileTrailSheet = useCallback(() => {
    setMobileTrailSheetState("min");
    setMobileTrailSheetDragHeight(null);
  }, []);

  const openMobileTrailSheet = useCallback(() => {
    setMobileTrailSheetState("mid");
    setMobileTrailSheetDragHeight(null);
  }, []);

  const startMobileTrailSheetTouch = (event: TouchEvent<HTMLDivElement>) => {
    if (isDesktopLayout || !isSentieriActive || isTrailImmersive) return;
    mobileTrailSheetTouchRef.current = {
      startY: event.touches?.[0]?.clientY ?? 0,
      startHeight: mobileTrailSheetHeight,
    };
  };

  const moveMobileTrailSheetTouch = (event: TouchEvent<HTMLDivElement>) => {
    const touchState = mobileTrailSheetTouchRef.current;
    if (!touchState) return;
    const nextY = event.touches?.[0]?.clientY ?? touchState.startY;
    const delta = touchState.startY - nextY;
    const unclampedHeight = touchState.startHeight + delta;
    const clampedHeight = Math.max(
      trailSheetHeights.min,
      Math.min(trailSheetHeights.max, unclampedHeight)
    );
    setMobileTrailSheetDragHeight(clampedHeight);
  };

  const endMobileTrailSheetTouch = () => {
    const draggingHeight = mobileTrailSheetDragHeight ?? mobileTrailSheetHeight;
    const snapTargets: Array<["min" | "mid" | "max", number]> = [
      ["min", trailSheetHeights.min],
      ["mid", trailSheetHeights.mid],
      ["max", trailSheetHeights.max],
    ];
    const nearest = snapTargets.reduce((best, current) => {
      return Math.abs(current[1] - draggingHeight) < Math.abs(best[1] - draggingHeight)
        ? current
        : best;
    });
    setMobileTrailSheetState(nearest[0]);
    setMobileTrailSheetDragHeight(null);
    mobileTrailSheetTouchRef.current = null;
  };

  useEffect(() => {
    if (filtroAttivo !== "sentieri" || isDesktopLayout || isTrailImmersive) return;
    immersiveContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [filtroAttivo, isDesktopLayout, isTrailImmersive]);

  useEffect(() => {
    if (filtroAttivo === "sentieri" && !isDesktopLayout && !isTrailImmersive) {
      openMobileTrailSheet();
      return;
    }
    setMobileTrailSheetDragHeight(null);
  }, [filtroAttivo, isDesktopLayout, isTrailImmersive, openMobileTrailSheet]);

  const handleTrailConfirmYes = () => {
    if (!trailConfirmSentiero) return;
    stopTotalImmersion(true);
    const url = getGoogleDirectionsUrl(trailConfirmSentiero.coordinates);
    window.open(url, "_blank", "noopener,noreferrer");
    setTrailConfirmSentiero(null);
  };

  const handleTrailConfirmNo = () => {
    stopTotalImmersion(true);
    setTrailConfirmSentiero(null);
  };

  const sentieriPanelContent = (
    <>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-sans text-sm font-semibold text-slate/85">
          {isEnglish ? "Trail list" : "Lista Sentieri"}
        </h2>
        <span className="text-xs font-semibold text-cyan-800">
          {sentieriList.length} {isEnglish ? "trails" : "sentieri"}
        </span>
      </div>
      <div className="grid gap-2">
        {sentieriList.map((sentiero) => {
          const isActive = selectedSentiero?.id === sentiero.id;
          return (
            <button
              key={sentiero.id}
              ref={(node) => {
                sentieroCardRefs.current[sentiero.id] = node;
              }}
              type="button"
              onClick={() => focusSentiero(sentiero)}
              onMouseEnter={() => setHoveredSentieroId(sentiero.id)}
              onMouseLeave={() => setHoveredSentieroId((prev) => (prev === sentiero.id ? null : prev))}
              className={`w-full overflow-hidden rounded-xl border text-left transition-colors ${
                isActive
                  ? "border-cyan-500 bg-white"
                  : "border-cyan-200 bg-white/90 hover:border-cyan-400"
              }`}
            >
              {sentiero.imageUrl ? (
                <Image
                  src={sentiero.imageUrl}
                  alt={sentiero.name}
                  width={640}
                  height={192}
                  className="h-24 w-full object-cover"
                />
              ) : null}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate">{sentiero.name}</p>
                  <span
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300 bg-cyan-100 text-cyan-800"
                    aria-hidden="true"
                  >
                    ▶
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate/70">
                  ⚑ {isEnglish ? "Difficulty" : "Difficolta"}: {sentiero.difficulty}
                </p>
                <p className="mt-0.5 text-xs text-slate/70">
                  ⏱ {isEnglish ? "Estimated time" : "Tempo stimato"}: {sentiero.duration}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      {selectedSentiero ? (
        <aside className="mt-3 rounded-xl border border-cyan-200 bg-cyan-100/70 px-4 py-3">
          <p className="font-[var(--font-handwriting)] text-lg leading-none text-mare">
            {isEnglish ? "Trail details" : "Dettagli sentiero"}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate">{selectedSentiero.name}</p>
          <p className="mt-1 text-xs text-slate/70">
            ⚑ {isEnglish ? "Difficulty" : "Difficolta"}: {selectedSentiero.difficulty}
          </p>
          <p className="mt-0.5 text-xs text-slate/70">
            ⏱ {isEnglish ? "Estimated time" : "Tempo stimato"}: {selectedSentiero.duration}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate/85">{selectedSentiero.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a
              href={getGoogleDirectionsUrl(selectedSentiero.coordinates)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-white/55 bg-white/45 px-3 text-xs font-semibold text-slate shadow-sm backdrop-blur-md transition-colors hover:bg-white/65"
            >
              Google Maps
            </a>
            {isIOS ? (
              <a
                href={getAppleMapsUrl(selectedSentiero.coordinates)}
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-white/55 bg-white/45 px-3 text-xs font-semibold text-slate shadow-sm backdrop-blur-md transition-colors hover:bg-white/65"
              >
                Apple
              </a>
            ) : null}
            {isPercorso15Trail(selectedSentiero) ? (
              <button
                type="button"
                onClick={() => {
                  void startTotalImmersion(selectedSentiero);
                }}
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-cyan-500 bg-cyan-500 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-cyan-600"
              >
                {isEnglish ? "Start total immersion" : "Avvia Immersione"}
              </button>
            ) : null}
            {isTotalImmersionActive ? (
              <button
                type="button"
                onClick={() => {
                  if (isTotalImmersionPaused) {
                    resumeTotalImmersion();
                  } else {
                    pauseTotalImmersion();
                  }
                }}
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate shadow-sm transition-colors hover:bg-slate-50"
              >
                {isTotalImmersionPaused
                  ? isEnglish
                    ? "Resume flight"
                    : "Riprendi volo"
                  : isEnglish
                    ? "Pause flight"
                    : "Pausa volo"}
              </button>
            ) : null}
          </div>
        </aside>
      ) : null}
    </>
  );

  const sentieriMobileSheetContent = (
    <>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="font-sans text-sm font-semibold text-slate/85">
          {isEnglish ? "Trail list" : "Lista Sentieri"}
        </h2>
        <span className="text-xs font-semibold text-cyan-800">
          {sentieriList.length} {isEnglish ? "trails" : "sentieri"}
        </span>
      </div>
      <div className="grid gap-2">
        {sentieriList.map((sentiero) => {
          const isActive = selectedSentiero?.id === sentiero.id;
          return (
            <div
              key={`mobile-sheet-${sentiero.id}`}
              className={`rounded-2xl border p-3 ${
                isActive ? "border-cyan-500 bg-white" : "border-cyan-200/90 bg-white/92"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  ref={(node) => {
                    sentieroCardRefs.current[sentiero.id] = node;
                  }}
                  onClick={() => {
                    focusSentiero(sentiero);
                    collapseMobileTrailSheet();
                  }}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-[15px] font-semibold text-slate">{sentiero.name}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate/70">
                    <span aria-hidden="true">⚑</span>
                    <span>
                      {isEnglish ? "Difficulty" : "Difficolta"}: {sentiero.difficulty}
                    </span>
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate/70">
                    <span aria-hidden="true">⏱</span>
                    <span>
                      {isEnglish ? "Estimated time" : "Tempo stimato"}: {sentiero.duration}
                    </span>
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    focusSentiero(sentiero);
                    collapseMobileTrailSheet();
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300 bg-cyan-100 text-cyan-800"
                  aria-label={isEnglish ? `Play ${sentiero.name}` : `Avvia ${sentiero.name}`}
                >
                  ▶
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  const activeTrailPhotos = useMemo(() => {
    if (selectedSentiero && isPercorso15Trail(selectedSentiero)) {
      return selectedSentiero.photoStops.length > 0
        ? selectedSentiero.photoStops
        : (trail15Photos ?? []);
    }
    return selectedSentiero?.photoStops ?? [];
  }, [selectedSentiero, trail15Photos]);

  const lightboxPhotos = useMemo(() => {
    if (activeTrailPhotos.length > 0) return activeTrailPhotos;
    return lightboxPhoto ? [lightboxPhoto] : [];
  }, [activeTrailPhotos, lightboxPhoto]);

  const lightboxPhotoIndex = useMemo(() => {
    if (!lightboxPhoto || lightboxPhotos.length === 0) return -1;
    return lightboxPhotos.findIndex((photo) => photo.id === lightboxPhoto.id);
  }, [lightboxPhoto, lightboxPhotos]);

  const canGoPrevPhoto = lightboxPhotoIndex > 0;
  const canGoNextPhoto = lightboxPhotoIndex >= 0 && lightboxPhotoIndex < lightboxPhotos.length - 1;

  const prefetchPhoto = useCallback((photo?: TrailPhoto) => {
    if (!photo || typeof window === "undefined") return;
    const url = photo.imageUrl;
    if (!url || galleryPrefetchRef.current.has(url)) return;
    galleryPrefetchRef.current.add(url);
    const img = new window.Image();
    img.src = url;
  }, []);

  const navigateGalleryPhoto = useCallback(
    (direction: 1 | -1) => {
      if (lightboxPhotoIndex < 0) return;
      const nextIndex = Math.max(0, Math.min(lightboxPhotos.length - 1, lightboxPhotoIndex + direction));
      if (nextIndex === lightboxPhotoIndex) return;
      galleryDirectionRef.current = direction;
      setLightboxPhoto(lightboxPhotos[nextIndex]);
    },
    [lightboxPhotoIndex, lightboxPhotos]
  );

  const markGalleryPhotoLoaded = useCallback(() => {
    if (galleryLoadingTimerRef.current !== null) {
      window.clearTimeout(galleryLoadingTimerRef.current);
      galleryLoadingTimerRef.current = null;
    }
    setIsGalleryPhotoLoading(false);
  }, []);

  const onGalleryTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    galleryTouchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onGalleryTouchEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      const start = galleryTouchStartRef.current;
      const touch = event.changedTouches?.[0];
      galleryTouchStartRef.current = null;
      if (!start || !touch) return;
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      navigateGalleryPhoto(dx > 0 ? -1 : 1);
    },
    [navigateGalleryPhoto]
  );

  useEffect(() => {
    if (!lightboxPhoto || lightboxPhotoIndex < 0) return;
    prefetchPhoto(lightboxPhoto);
    prefetchPhoto(lightboxPhotos[lightboxPhotoIndex - 1]);
    prefetchPhoto(lightboxPhotos[lightboxPhotoIndex + 1]);
    const direction = galleryDirectionRef.current;
    prefetchPhoto(lightboxPhotos[lightboxPhotoIndex + direction * 2]);
  }, [lightboxPhoto, lightboxPhotoIndex, lightboxPhotos, prefetchPhoto]);

  useEffect(() => {
    if (!lightboxPhoto) return;
    if (galleryLoadingTimerRef.current !== null) {
      window.clearTimeout(galleryLoadingTimerRef.current);
    }
    setIsGalleryPhotoLoading(false);
    galleryLoadingTimerRef.current = window.setTimeout(() => {
      setIsGalleryPhotoLoading(true);
    }, 200);
    return () => {
      if (galleryLoadingTimerRef.current !== null) {
        window.clearTimeout(galleryLoadingTimerRef.current);
        galleryLoadingTimerRef.current = null;
      }
    };
  }, [lightboxPhoto?.imageUrl]);

  useEffect(() => {
    if (!lightboxPhoto) {
      setIsGalleryPhotoSwitching(false);
      return;
    }
    setIsGalleryPhotoSwitching(true);
    const timerId = window.setTimeout(() => setIsGalleryPhotoSwitching(false), 80);
    return () => window.clearTimeout(timerId);
  }, [lightboxPhoto?.id]);

  useEffect(() => {
    if (!lightboxPhoto) return;
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: lightboxPhoto.coordinates,
      zoom: Math.max(map.getZoom(), 15.2),
      speed: 1.05,
      curve: 1.25,
      duration: 520,
      essential: true,
    });
  }, [lightboxPhoto]);

  useEffect(() => {
    if (!lightboxPhoto) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        navigateGalleryPhoto(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        navigateGalleryPhoto(1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxPhoto, navigateGalleryPhoto]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;
    const nextId = lightboxPhoto?.id ?? null;
    const prevId = activeGalleryPhotoFeatureIdRef.current;
    if (prevId !== null && prevId !== undefined && prevId !== nextId) {
      map.setFeatureState({ source: SENTIERI_PHOTO_SOURCE_ID, id: prevId }, { hover: false });
    }
    if (nextId !== null && nextId !== undefined && nextId !== prevId) {
      map.setFeatureState({ source: SENTIERI_PHOTO_SOURCE_ID, id: nextId }, { hover: true });
    }
    activeGalleryPhotoFeatureIdRef.current = nextId;
  }, [isMapReady, lightboxPhoto]);

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
    <section className={`max-w-[100vw] overflow-hidden ${className ?? ""}`}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setShowOnlyMaddiFavorites((value) => !value)}
          aria-pressed={showOnlyMaddiFavorites}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
            showOnlyMaddiFavorites
              ? "border-amber-500 bg-amber-500 text-white"
              : "border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-300"
          }`}
          title={isEnglish ? "Maddi favorites" : "Consigliati da Maddi"}
        >
          <span aria-hidden="true">★</span>
          <span>{isEnglish ? "Maddi picks ⭐" : "I Consigli di Maddi ⭐"}</span>
        </button>
        {categoryFilterOptions.map((item) => {
          const isActive = item.key === "alloggi" || filtroAttivo === item.key;
          const isPrimaryMobile = primaryMobileFilters.includes(item.key);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setFiltroAttivo(item.key);
                if (item.key !== "spiagge") {
                  setWindExpertAttivo(false);
                }
              }}
              aria-pressed={isActive}
              aria-label={`Filtro ${item.label}`}
              title={item.label}
              className={`${isPrimaryMobile ? "inline-flex" : "hidden"} items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors sm:inline-flex ${
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
        {hasHiddenMobileFilters ? (
          <button
            type="button"
            onClick={() => setShowAllMobileFilters(true)}
            className="inline-flex items-center rounded-full border border-mare/25 bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate transition-colors hover:border-mare/50 sm:hidden"
            aria-expanded={showAllMobileFilters}
          >
            {isEnglish ? "More filters..." : "Più filtri..."}
          </button>
        ) : null}
      </div>
      {showAllMobileFilters ? (
        <div className="fixed inset-0 z-[70] sm:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45"
            onClick={() => setShowAllMobileFilters(false)}
            aria-label={isEnglish ? "Close filters" : "Chiudi filtri"}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[75vh] overflow-y-auto rounded-t-2xl border-t border-mare/20 bg-sabbia p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-mare">
                {isEnglish ? "All filters" : "Tutti i filtri"}
              </p>
              <button
                type="button"
                onClick={() => setShowAllMobileFilters(false)}
                className="rounded-full border border-mare/25 bg-white px-2.5 py-1 text-xs font-semibold text-slate"
              >
                {isEnglish ? "Close" : "Chiudi"}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {categoryFilterOptions
                .filter((item) => !primaryMobileFilters.includes(item.key))
                .map((item) => {
                  const isActive = item.key === "alloggi" || filtroAttivo === item.key;
                  return (
                    <button
                      key={`mobile-extra-${item.key}`}
                      type="button"
                      onClick={() => {
                        setFiltroAttivo(item.key);
                        if (item.key !== "spiagge") {
                          setWindExpertAttivo(false);
                        }
                        setShowAllMobileFilters(false);
                      }}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                        isActive
                          ? "border-mare bg-mare text-white"
                          : "border-mare/25 bg-white text-slate hover:border-mare/50"
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
          </div>
        </div>
      ) : null}

      <div className="mb-4 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <button
          type="button"
          onClick={() => {
            setWindExpertAttivo((value) => !value);
            setFiltroAttivo("spiagge");
          }}
          className={`w-full rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors sm:w-auto ${
            windExpertAttivo
              ? "border-amber-500 bg-amber-500 text-white"
              : "border-amber-400/70 bg-white text-amber-700 hover:border-amber-500"
          }`}
        >
          {isEnglish ? "Wind Expert" : "Wind Expert"}
        </button>
        {windExpertAttivo ? (
          <>
            <select
              value={direzioneVento}
              onChange={(event) => {
                setWindExpertAttivo(true);
                setDirezioneVento(event.target.value as DirezioneVento);
              }}
              className="w-full rounded-full border border-mare/30 bg-white px-3 py-1.5 text-xs font-semibold text-slate sm:w-auto"
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
              className="w-full rounded-full border border-mare/30 bg-white px-3 py-1.5 text-xs font-semibold text-slate sm:w-auto"
              aria-label={isEnglish ? "Weather layer" : "Layer meteo"}
            >
              <option value="none">{isEnglish ? "Weather Off" : "Meteo Off"}</option>
              <option value="wind_new">{isEnglish ? "Wind Layer" : "Layer Vento"}</option>
              <option value="precipitation_new">
                {isEnglish ? "Rain Layer" : "Layer Pioggia"}
              </option>
              <option value="clouds_new">{isEnglish ? "Cloud Layer" : "Layer Nuvole"}</option>
            </select>
          </>
        ) : null}
      </div>
      {windExpertAttivo && weatherLayerError ? (
        <p className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
          {weatherLayerError}
        </p>
      ) : null}

      <div
        ref={immersiveContainerRef}
        className={`relative w-full max-w-[100vw] overflow-hidden ${
          isSentieriActive && !isTrailImmersive ? "sm:grid sm:grid-cols-[380px_minmax(0,1fr)] sm:gap-4" : ""
        } ${isTrailImmersive ? "fixed inset-0 z-[95] max-w-none bg-slate-950" : ""}`}
      >
        {isSentieriActive && isDesktopLayout && !isTrailImmersive ? (
          <aside className="h-[78vh] overflow-y-auto rounded-2xl border border-cyan-200/70 bg-cyan-50/70 p-4 shadow-sm">
            {sentieriPanelContent}
          </aside>
        ) : null}
        <div className="relative">
          <div
            ref={containerRef}
            className={`w-full overflow-hidden rounded-2xl border border-mare/20 shadow-sm ${mapHeightClassName}`}
          />
          <canvas
            ref={windCanvasRef}
            className="pointer-events-none absolute inset-0 z-20 rounded-2xl"
            aria-hidden="true"
          />
          {windExpertAttivo && activeWeatherLayer === "wind_new" && weather ? (
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
            selectedLocation={
              selectedLocation
                ? {
                    name: selectedLocation.name,
                    maddiTip: selectedLocation.maddiTip,
                    maddiNote: selectedLocation.maddiNote,
                  }
                : undefined
            }
            listaSpiagge={spiaggeTutte}
            onSpiaggiaClick={handleSpiaggiaClick}
            locale={locale}
            className="z-30"
          />
          {windExpertAttivo && weather ? (
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
          {isSentieriActive ? (
            <button
              type="button"
              onClick={() => {
                void toggleTrailFullscreen();
              }}
              className="absolute right-3 top-3 z-[90] inline-flex min-h-10 items-center justify-center rounded-full border border-white/35 bg-slate-900/80 px-3 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-slate-800/90"
            >
              {isTrailImmersive
                ? isEnglish
                  ? "Exit immersive mode"
                  : "Esci da immersione"
                : isEnglish
                  ? "Open immersive full screen"
                  : "Apri percorso a tutto schermo"}
            </button>
          ) : null}
          {isSentieriActive && isTrailImmersive ? (
            <div className="absolute left-3 top-14 z-40 w-[290px] rounded-xl border border-cyan-200/55 bg-slate-900/88 p-2.5 text-white shadow-lg backdrop-blur-md">
              <p className="mb-1 text-[11px] font-semibold tracking-wide text-cyan-200">
                {isEnglish ? "Change trail" : "Cambia percorso"}
              </p>
              <p className="mb-2 truncate text-sm font-bold text-white">
                {selectedSentiero?.name ?? (isEnglish ? "No trail selected" : "Nessun sentiero selezionato")}
              </p>
              <select
                value={selectedSentiero?.id ?? ""}
                onChange={(event) => {
                  const next = sentieriList.find((item) => item.id === event.target.value);
                  if (!next) return;
                  focusSentieroWithWow(next);
                }}
                className="w-full rounded-lg border border-cyan-200/70 bg-white px-2 py-2 text-sm font-semibold text-slate shadow-sm"
                aria-label={isEnglish ? "Change trail in fullscreen" : "Cambia percorso in fullscreen"}
              >
                {!selectedSentiero ? (
                  <option value="">{isEnglish ? "Select a trail" : "Seleziona un sentiero"}</option>
                ) : null}
                {sentieriList.map((sentiero) => (
                  <option
                    key={`immersive-${sentiero.id}`}
                    value={sentiero.id}
                    style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                  >
                    {sentiero.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {isSentieriActive && isTrailImmersive ? (
            <aside className="absolute left-3 top-3 z-40 inline-flex items-center gap-2 rounded-full border border-emerald-300/70 bg-emerald-500/90 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md">
              <span className="inline-block h-2 w-2 rounded-full bg-white/95" aria-hidden="true" />
              <span>
                {isTrailFullscreen
                  ? isEnglish
                    ? "Immersive mode: native fullscreen"
                    : "Modalita immersione: fullscreen nativo"
                  : isEnglish
                    ? "Immersive mode: compatibility fallback"
                    : "Modalita immersione: fallback compatibilita"}
              </span>
            </aside>
          ) : null}
          {isSentieriActive && (isTrailPreviewing || trailConfirmSentiero) ? (
            <aside className="absolute left-2 right-2 top-3 z-40 rounded-2xl border border-cyan-200/90 bg-white/95 p-3 shadow-xl backdrop-blur-md sm:left-auto sm:right-4 sm:top-auto sm:bottom-4 sm:max-w-[360px]">
              <p className="text-xs font-semibold text-cyan-800">
                {isTrailPreviewing
                  ? isEnglish
                    ? "Maddi is previewing the trail..."
                    : "Maddi sta facendo il sorvolo del sentiero..."
                  : isEnglish
                    ? "What do you think, inspired? Want me to take you to the trail start with Google Maps?"
                    : "Che ne dici, ti ispira? Vuoi che ti porti all'inizio del sentiero con Google Maps?"}
              </p>
              {!isTrailPreviewing ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleTrailConfirmYes}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-cyan-500 bg-cyan-500 px-3 text-xs font-semibold text-white transition-colors hover:bg-cyan-600"
                  >
                    {isEnglish ? "Yes, let's go! 🚗" : "Sì, andiamo! 🚗"}
                  </button>
                  <button
                    type="button"
                    onClick={handleTrailConfirmNo}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate transition-colors hover:bg-slate-50"
                  >
                    {isEnglish ? "No, just looking" : "No, voglio solo guardare"}
                  </button>
                </div>
              ) : null}
            </aside>
          ) : null}
          {isSentieriActive && isTotalImmersionActive
            ? visibleImmersionPhotos.map((entry) => (
                <button
                  key={entry.photo.id}
                  type="button"
                  onClick={() => {
                    pauseTotalImmersion();
                    setLightboxPhoto(entry.photo);
                  }}
                  className="absolute z-40 w-[138px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/30 bg-slate-900/78 p-1.5 text-left text-white shadow-lg backdrop-blur-md transition-opacity duration-500"
                  style={{
                    left: `${entry.left}px`,
                    top: `${entry.top}px`,
                    opacity: entry.opacity,
                  }}
                >
                  <Image
                    src={entry.photo.imageUrl}
                    alt={entry.photo.id}
                    width={240}
                    height={120}
                    className="h-16 w-full rounded-md object-cover"
                  />
                  <p className="mt-1 truncate text-[10px] font-semibold">
                    {entry.photo.maddiNote || (isEnglish ? "Trail shot" : "Scatto sul percorso")}
                  </p>
                </button>
              ))
            : null}
          {isSentieriActive && isTotalImmersionActive && immersionTotalShots > 0 ? (
            <aside className="absolute bottom-3 left-2 right-2 z-[55] rounded-2xl border border-white/20 bg-slate-900/75 px-3 py-2 text-white shadow-xl backdrop-blur-md sm:left-auto sm:right-4 sm:w-[360px]">
              {immersionCurrentTitle ? (
                <p className="mb-1 truncate text-[11px] font-semibold text-cyan-200">
                  {immersionCurrentTitle}
                </p>
              ) : null}
              <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold">
                <span>
                  {isEnglish ? "Shot" : "Scatto"}{" "}
                  {Math.max(1, Math.min(immersionTotalShots, immersionPassedShots || 1))} /{" "}
                  {immersionTotalShots}
                </span>
                <span>{Math.round((Math.max(0, immersionStepIndex) / Math.max(1, immersionPathRef.current.length - 1)) * 100)}%</span>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  const ratio = (event.clientX - rect.left) / Math.max(1, rect.width);
                  scrubTotalImmersion(ratio);
                  if (immersionPhotoMilestones.length > 0) {
                    const clamped = Math.max(0, Math.min(1, ratio));
                    const targetShot = Math.round(clamped * (immersionPhotoMilestones.length - 1));
                    const nextPhoto = immersionPhotoMilestones[targetShot]?.photo;
                    if (nextPhoto) {
                      pauseTotalImmersion();
                      setLightboxPhoto(nextPhoto);
                    }
                  }
                }}
                className="relative block h-1.5 w-full rounded-full bg-white/25"
                aria-label={isEnglish ? "Immersion progress" : "Progresso immersione"}
                title={isEnglish ? "Click to jump in timeline" : "Clicca per saltare nella timeline"}
              >
                <span
                  className="absolute left-0 top-0 h-full rounded-full bg-cyan-300 transition-all duration-200"
                  style={{
                    width: `${Math.max(0, Math.min(100, (Math.max(0, immersionStepIndex) / Math.max(1, immersionPathRef.current.length - 1)) * 100))}%`,
                  }}
                />
              </button>
            </aside>
          ) : null}
          {lightboxPhoto ? (
            <div className="absolute inset-0 z-[70] grid place-items-center bg-slate-950/72 p-4 backdrop-blur-sm">
              <div className="w-full max-w-3xl rounded-2xl border border-white/20 bg-slate-900/92 p-3 text-white shadow-2xl">
                <div
                  className="relative overflow-hidden rounded-xl bg-slate-950/65"
                  onTouchStart={onGalleryTouchStart}
                  onTouchEnd={onGalleryTouchEnd}
                >
                  <Image
                    key={lightboxPhoto.id}
                    src={lightboxPhoto.imageUrl}
                    alt={lightboxPhoto.id}
                    width={1400}
                    height={900}
                    onLoad={markGalleryPhotoLoaded}
                    onError={markGalleryPhotoLoaded}
                    className={`max-h-[70vh] w-full object-contain transition-opacity duration-[80ms] ${isGalleryPhotoSwitching ? "opacity-75" : "opacity-100"}`}
                  />
                  {isGalleryPhotoLoading ? (
                    <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
                      <span
                        className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-white/30 border-t-cyan-300"
                        aria-label={isEnglish ? "Loading photo" : "Caricamento foto"}
                      />
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => navigateGalleryPhoto(-1)}
                    disabled={!canGoPrevPhoto}
                    className="absolute left-2 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-slate-900/55 text-2xl text-white transition-opacity disabled:opacity-35 sm:h-10 sm:w-10 sm:text-xl"
                    aria-label={isEnglish ? "Previous photo" : "Foto precedente"}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateGalleryPhoto(1)}
                    disabled={!canGoNextPhoto}
                    className="absolute right-2 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-slate-900/55 text-2xl text-white transition-opacity disabled:opacity-35 sm:h-10 sm:w-10 sm:text-xl"
                    aria-label={isEnglish ? "Next photo" : "Foto successiva"}
                  >
                    ›
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="truncate text-xs font-semibold text-cyan-100">
                    {lightboxPhoto.maddiNote || lightboxPhoto.title || lightboxPhoto.id}
                  </p>
                  <span className="shrink-0 text-[11px] font-semibold text-white/80">
                    {Math.max(1, lightboxPhotoIndex + 1)} / {Math.max(1, lightboxPhotos.length)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLightboxPhoto(null);
                      const map = mapRef.current;
                      if (map) {
                        map.easeTo({
                          center: lightboxPhoto.coordinates,
                          zoom: Math.max(map.getZoom(), 15.2),
                          duration: 450,
                          essential: true,
                        });
                      }
                      resumeTotalImmersion();
                    }}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-cyan-500 bg-cyan-500 px-3 text-xs font-semibold text-white transition-colors hover:bg-cyan-600"
                  >
                    {isEnglish ? "Close and resume" : "Chiudi e riprendi"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          {isSentieriActive && !isDesktopLayout && !isTrailImmersive ? (
            <aside
              className="fixed inset-x-0 bottom-0 z-[80] rounded-t-2xl border-t border-cyan-200/80 bg-cyan-50/95 shadow-2xl backdrop-blur-md transition-[height] duration-300 ease-out"
              style={{ height: `${mobileTrailSheetHeight}px` }}
            >
              <div
                className="px-4 pt-3"
                onTouchStart={startMobileTrailSheetTouch}
                onTouchMove={moveMobileTrailSheetTouch}
                onTouchEnd={endMobileTrailSheetTouch}
                onTouchCancel={endMobileTrailSheetTouch}
              >
                <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-cyan-300/80" />
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate">
                    {isEnglish ? "Explore Trails" : "Esplora Sentieri"} ({sentieriList.length})
                  </p>
                  {mobileTrailSheetState !== "min" ? (
                    <button
                      type="button"
                      onClick={() =>
                        setMobileTrailSheetState((prev) =>
                          prev === "max" ? "mid" : prev === "mid" ? "min" : "max"
                        )
                      }
                      className="rounded-full border border-cyan-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-cyan-800"
                    >
                      {mobileTrailSheetState === "max"
                        ? isEnglish
                          ? "Collapse"
                          : "Riduci"
                        : isEnglish
                          ? "Expand"
                          : "Espandi"}
                    </button>
                  ) : null}
                </div>
              </div>
              <div
                className={`${mobileTrailSheetState === "min" ? "hidden" : "block"} h-[calc(100%-64px)] overflow-y-auto px-4 pb-4`}
              >
                {sentieriMobileSheetContent}
              </div>
            </aside>
          ) : null}
        </div>
      </div>

      {filtroAttivo !== "sentieri" ? (
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
                : location.tipo === "ristoranti"
                  ? isEnglish
                    ? "Restaurants"
                    : "Ristoranti"
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
                  {typeof location.rating === "number" ? (
                    <p className="mt-1 text-xs font-medium text-amber-700">
                      {getStarsFromRating(location.rating)} {location.rating.toFixed(1)}
                      {typeof location.reviews === "number" ? ` (${location.reviews})` : ""}
                    </p>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      ) : null}

      {selectedLocation && filtroAttivo !== "sentieri" ? (
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
              {typeof selectedLocation.rating === "number" ? (
                <p className="mt-2 text-xs font-semibold text-amber-700">
                  {getStarsFromRating(selectedLocation.rating)}{" "}
                  {selectedLocation.rating.toFixed(1)}
                  {typeof selectedLocation.reviews === "number"
                    ? ` (${selectedLocation.reviews})`
                    : ""}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href={getGoogleDirectionsUrl(selectedLocation.coordinates)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 min-w-11 items-center justify-center rounded-xl border border-white/55 bg-white/45 px-3 text-xs font-semibold text-slate shadow-sm backdrop-blur-md transition-colors hover:bg-white/65"
                  title={isEnglish ? "Open in Google Maps" : "Apri su Google Maps"}
                  aria-label={isEnglish ? "Open in Google Maps" : "Apri su Google Maps"}
                >
                  {isEnglish ? "Google Maps" : "Google Maps"}
                </a>
                {isIOS ? (
                  <a
                    href={getAppleMapsUrl(selectedLocation.coordinates)}
                    className="inline-flex h-11 min-w-11 items-center justify-center rounded-xl border border-white/55 bg-white/45 px-3 text-xs font-semibold text-slate shadow-sm backdrop-blur-md transition-colors hover:bg-white/65"
                    title={isEnglish ? "Open in Apple Maps" : "Apri su Apple Maps"}
                    aria-label={isEnglish ? "Open in Apple Maps" : "Apri su Apple Maps"}
                  >
                    Apple
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={async () => {
                    const text = toLatLngString(selectedLocation.coordinates);
                    try {
                      await navigator.clipboard.writeText(text);
                    } catch {
                      return;
                    }
                    setCopiedLocationId(selectedLocation.id);
                  }}
                  className="inline-flex h-11 min-w-11 items-center justify-center rounded-xl border border-white/55 bg-white/45 px-3 text-xs font-semibold text-slate shadow-sm backdrop-blur-md transition-colors hover:bg-white/65"
                  title={isEnglish ? "Copy coordinates" : "Copia coordinate"}
                  aria-label={isEnglish ? "Copy coordinates" : "Copia coordinate"}
                >
                  {isEnglish ? "Copy coordinates" : "Copia coordinate"}
                </button>
                {copiedLocationId === selectedLocation.id ? (
                  <span className="text-xs font-semibold text-emerald-700">
                    {isEnglish ? "Copied!" : "Copiato!"}
                  </span>
                ) : null}
              </div>
              {(selectedLocation.tipo === "spiagge" ||
                selectedLocation.name.toLowerCase().includes("cala")) ? (
                <p className="mt-2 text-xs font-medium text-slate/80">
                  📍{" "}
                  {isEnglish
                    ? `Anchoring coordinates: ${toLatLngString(selectedLocation.coordinates)}`
                    : `Coordinate per ancoraggio: ${toLatLngString(selectedLocation.coordinates)}`}
                </p>
              ) : null}
              {selectedLocation.isFavorite && selectedLocation.maddiNote ? (
                <div className="mt-2 rounded-lg border border-amber-300 bg-amber-100/70 px-2.5 py-2 text-xs text-amber-900">
                  <strong>{isEnglish ? "Maddi's tip:" : "Consiglio di Maddi:"}</strong>{" "}
                  {selectedLocation.maddiNote}
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      ) : null}
    </section>
  );
}
