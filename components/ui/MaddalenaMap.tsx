"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { MADDI_LOCATIONS } from "@/src/data/maddi-data";
import { serviziSpiagge } from "@/lib/serviziSpiagge";
import type { Spiaggia } from "@/types/maddi";
import type { Servizio } from "@/lib/servizi";
import { MaddiConcierge } from "@/components/ui/MaddiConcierge";

type MaddalenaMapProps = {
  className?: string;
  heightClassName?: string;
  mapboxToken?: string;
  mapStyle?: string;
  center?: [number, number];
  zoom?: number;
};

const defaultCenter: [number, number] = [9.4095, 41.2145];

type FiltroAttivo = "all" | "spiagge" | "food" | "alloggi";
type TipoMappa = "alloggi" | "food" | "spiagge";
type MappaLocation = {
  id: string;
  name: string;
  tipo: TipoMappa;
  coordinates: [number, number];
  description: string;
  maddiTip: string;
  esposizione?: string[];
};

const markerColorByType: Record<TipoMappa, string> = {
  alloggi: "#0f766e",
  food: "#b91c1c",
  spiagge: "#0ea5e9",
};

const markerSymbolByType: Record<TipoMappa, string> = {
  alloggi: "\u2302",
  food: "\u{1F37D}",
  spiagge: "\u{1F3D6}",
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

function getSelectedCategory(
  filtro: FiltroAttivo
): "spiagge" | "food" | "case" | undefined {
  if (filtro === "spiagge") return "spiagge";
  if (filtro === "food") return "food";
  if (filtro === "alloggi") return "case";
  return undefined;
}

function createMarkerElement(location: MappaLocation) {
  const markerEl = document.createElement("button");
  markerEl.type = "button";
  markerEl.title = location.name;
  markerEl.setAttribute("aria-label", location.name);
  markerEl.style.width = "18px";
  markerEl.style.height = "18px";
  markerEl.style.borderRadius = "9999px";
  markerEl.style.border = "2px solid #ffffff";
  markerEl.style.background = markerColorByType[location.tipo];
  markerEl.style.boxShadow = "0 2px 8px rgba(15, 23, 42, 0.35)";
  markerEl.style.cursor = "pointer";
  markerEl.style.display = "grid";
  markerEl.style.placeItems = "center";
  markerEl.style.fontSize = "11px";
  markerEl.style.fontWeight = "700";
  markerEl.style.color = "#ffffff";
  markerEl.textContent = markerSymbolByType[location.tipo];
  return markerEl;
}

function buildPopupContent(location: MappaLocation) {
  const categoriaLabel =
    location.tipo === "alloggi"
      ? "alloggio"
      : location.tipo === "food"
        ? "food"
        : "spiaggia";
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
    </div>
  `;
}

export function MaddalenaMap({
  className,
  heightClassName = "h-[460px]",
  mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  mapStyle = "mapbox://styles/mapbox/satellite-streets-v12",
  center = defaultCenter,
  zoom = 12.4,
}: MaddalenaMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRegistryRef = useRef<
    Record<string, { marker: mapboxgl.Marker; popup: mapboxgl.Popup }>
  >({});
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  );
  const [filtroAttivo, setFiltroAttivo] = useState<FiltroAttivo>("all");
  const [windExpertAttivo, setWindExpertAttivo] = useState(true);
  const [direzioneVento, setDirezioneVento] = useState<DirezioneVento>("NW");
  const [pendingSpiaggiaCoords, setPendingSpiaggiaCoords] = useState<
    [number, number] | null
  >(null);

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
  const allLocations = useMemo<MappaLocation[]>(
    () => [
      ...baseLocations,
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
    [baseLocations, spiaggeVisibili]
  );
  const visibleLocations = useMemo(
    () =>
      filtroAttivo === "all"
        ? allLocations
        : allLocations.filter((location) => location.tipo === filtroAttivo),
    [allLocations, filtroAttivo]
  );
  const selectedLocation = useMemo(
    () => visibleLocations.find((location) => location.id === selectedLocationId),
    [selectedLocationId, visibleLocations]
  );
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

      const shouldShowPopup = !(source === "list" && isTeggeView);
      if (shouldShowPopup) {
        markerEntry.popup.setLngLat(target.coordinates).addTo(map);
      }
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

    map.on("load", () => {
      // Terrain 3D setup (Mapbox DEM source + terrain rendering)
      if (!map.getSource("mapbox-dem")) {
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
      }
      map.setTerrain({ source: "mapbox-dem", exaggeration: 2.1 });
      map.setFog({
        range: [-0.4, 2],
        color: "rgb(186, 210, 235)",
        "high-color": "rgb(36, 92, 141)",
        "horizon-blend": 0.28,
      });

      setIsMapReady(true);
    });

    return () => {
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

    visibleLocations.forEach((location) => {
      const popup = new mapboxgl.Popup({ offset: 18 }).setHTML(
        buildPopupContent(location)
      );

      const marker = new mapboxgl.Marker({
        element: createMarkerElement(location),
        anchor: "center",
      })
        .setLngLat(location.coordinates)
        .addTo(map);

      marker.getElement().addEventListener("click", () => {
        focusLocation(location.id, "marker");
      });

      markerRegistryRef.current[location.id] = { marker, popup };
      bounds.extend(location.coordinates);
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
  }, [focusLocation, isMapReady, visibleLocations]);

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

  if (!mapboxToken) {
    return (
      <div
        className={`rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 ${className ?? ""}`}
      >
        Imposta `NEXT_PUBLIC_MAPBOX_TOKEN` per visualizzare la mappa.
      </div>
    );
  }

  return (
    <section className={className}>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-slate/80">
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-[11px] font-bold text-white shadow-sm">
            {markerSymbolByType.alloggi}
          </span>
          Alloggi
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-700 text-[11px] font-bold text-white shadow-sm">
            {markerSymbolByType.food}
          </span>
          Food
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-[11px] font-bold text-white shadow-sm">
            {markerSymbolByType.spiagge}
          </span>
          Spiagge
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(
          [
            { key: "all", label: "Tutto" },
            { key: "alloggi", label: "Alloggi" },
            { key: "food", label: "Food" },
            { key: "spiagge", label: "Spiagge" },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFiltroAttivo(item.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              filtroAttivo === item.key
                ? "border-mare bg-mare text-white"
                : "border-mare/30 bg-white text-slate hover:border-mare/55"
            }`}
          >
            {item.label}
          </button>
        ))}
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
          Wind Expert
        </button>
        <select
          value={direzioneVento}
          onChange={(event) => {
            setWindExpertAttivo(true);
            setDirezioneVento(event.target.value as DirezioneVento);
          }}
          className="rounded-full border border-mare/30 bg-white px-3 py-1.5 text-xs font-semibold text-slate"
          aria-label="Direzione vento"
        >
          {VENTI_OPTIONS.map((vento) => (
            <option key={vento.sigla} value={vento.sigla}>
              {vento.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <div
          ref={containerRef}
          className={`w-full overflow-hidden rounded-2xl border border-mare/20 shadow-sm ${heightClassName}`}
        />
        <MaddiConcierge
          ventoAttuale={getNomeVento(direzioneVento)}
          selectedCategory={getSelectedCategory(filtroAttivo)}
          listaSpiagge={spiaggeTutte}
          onSpiaggiaClick={handleSpiaggiaClick}
          className="z-30"
        />
      </div>

      <div className="mt-5">
        <h2 className="font-sans text-sm font-semibold text-slate/80">
          Luoghi in elenco (clic per centrare)
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {visibleLocations.map((location) => {
            const isActive = selectedLocationId === location.id;
            const typeLabel =
              location.tipo === "alloggi"
                ? "Alloggio"
                : location.tipo === "food"
                  ? "Food"
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
                <strong>Maddì consiglia:</strong> {selectedLocation.maddiTip}
              </p>
            </div>
          </div>
        </aside>
      ) : null}
    </section>
  );
}
