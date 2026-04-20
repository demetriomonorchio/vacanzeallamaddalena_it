"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { MADDI_LOCATIONS, type Location } from "@/src/data/maddi-data";

type MaddalenaMapProps = {
  className?: string;
  heightClassName?: string;
  mapboxToken?: string;
  mapStyle?: string;
  center?: [number, number];
  zoom?: number;
};

const defaultCenter: [number, number] = [9.4095, 41.2145];

const markerColorByType: Record<Location["type"], string> = {
  alloggio: "#0f766e",
  ristorante: "#b91c1c",
  esperienza: "#1d4ed8",
  "punto-foto": "#7c3aed",
};

const markerSymbolByType: Record<Location["type"], string> = {
  alloggio: "\u2302",
  ristorante: "\u{1F37D}",
  esperienza: "\u{1F3AF}",
  "punto-foto": "\u{1F4F7}",
};

function createMarkerElement(location: Location) {
  const markerEl = document.createElement("button");
  markerEl.type = "button";
  markerEl.title = location.name;
  markerEl.setAttribute("aria-label", location.name);
  markerEl.style.width = "18px";
  markerEl.style.height = "18px";
  markerEl.style.borderRadius = "9999px";
  markerEl.style.border = "2px solid #ffffff";
  markerEl.style.background = markerColorByType[location.type];
  markerEl.style.boxShadow = "0 2px 8px rgba(15, 23, 42, 0.35)";
  markerEl.style.cursor = "pointer";
  markerEl.style.display = "grid";
  markerEl.style.placeItems = "center";
  markerEl.style.fontSize = "11px";
  markerEl.style.fontWeight = "700";
  markerEl.style.color = "#ffffff";
  markerEl.textContent = markerSymbolByType[location.type];
  return markerEl;
}

function buildPopupContent(location: Location) {
  return `
    <div style="max-width: 260px; font-family: ui-sans-serif, system-ui, sans-serif;">
      <p style="margin: 0 0 4px; font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: 0.04em;">
        ${location.type}
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
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  );

  const visibleLocations = useMemo(
    () =>
      MADDI_LOCATIONS.filter(
        (location) =>
          location.type === "alloggio" || location.type === "ristorante"
      ),
    []
  );
  const selectedLocation = useMemo(
    () => visibleLocations.find((location) => location.id === selectedLocationId),
    [selectedLocationId, visibleLocations]
  );

  const focusLocation = useCallback(
    (locationId: string, source: "marker" | "list" = "list") => {
      const map = mapRef.current;
      const markerEntry = markerRegistryRef.current[locationId];
      const target = visibleLocations.find((loc) => loc.id === locationId);
      if (!map || !markerEntry || !target) return;

      Object.values(markerRegistryRef.current).forEach(({ popup }) => popup.remove());

      const isTeggeView = target.id === "casa-tegge";

      map.flyTo({
        center: target.coordinates,
        zoom: isTeggeView ? 15.8 : 14.6,
        pitch: isTeggeView ? 72 : 0,
        bearing: isTeggeView ? 258 : 0,
        essential: true,
        duration: isTeggeView ? 2200 : 900,
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

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: 72,
          maxZoom: 14,
          duration: 0,
        });
      }
    });

    return () => {
      markerRegistryRef.current = {};
      map.remove();
      mapRef.current = null;
    };
  }, [center, focusLocation, mapStyle, mapboxToken, visibleLocations, zoom]);

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
            {markerSymbolByType.alloggio}
          </span>
          Alloggi
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-700 text-[11px] font-bold text-white shadow-sm">
            {markerSymbolByType.ristorante}
          </span>
          Ristoranti
        </span>
      </div>

      <div
        ref={containerRef}
        className={`w-full overflow-hidden rounded-2xl border border-mare/20 shadow-sm ${heightClassName}`}
      />

      <div className="mt-5">
        <h2 className="font-sans text-sm font-semibold text-slate/80">
          Luoghi in elenco (clic per centrare)
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {visibleLocations.map((location) => {
            const isActive = selectedLocationId === location.id;
            const typeLabel =
              location.type === "alloggio" ? "Alloggio" : "Ristorante";

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
                      style={{ backgroundColor: markerColorByType[location.type] }}
                    >
                      {markerSymbolByType[location.type]}
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
