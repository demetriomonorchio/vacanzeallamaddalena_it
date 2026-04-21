"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { MADDI_LOCATIONS } from "@/src/data/maddi-data";
import { serviziSpiagge } from "@/lib/serviziSpiagge";
import type { Spiaggia } from "@/types/maddi";
import type { Servizio } from "@/lib/servizi";
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
};

const defaultCenter: [number, number] = [9.4095, 41.2145];

type FiltroAttivo = "all" | "spiagge" | "food" | "alloggi";
type TipoMappa = "alloggi" | "food" | "spiagge";
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
  const bookingCta =
    location.tipo === "alloggi" && location.bookingUrl
      ? `
      <a
        href="${location.bookingUrl}"
        target="_blank"
        rel="noopener noreferrer"
        style="display: inline-block; margin-top: 10px; padding: 8px 10px; border-radius: 10px; font-size: 12px; font-weight: 700; text-decoration: none; color: #ffffff; background: #0f172a;"
      >
        Scopri appartamento
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
  const [filtroAttivo, setFiltroAttivo] = useState<FiltroAttivo>("all");
  const [windExpertAttivo, setWindExpertAttivo] = useState(true);
  const [direzioneVento, setDirezioneVento] = useState<DirezioneVento>("NW");
  const [activeWeatherLayer, setActiveWeatherLayer] =
    useState<WeatherLayerKey>("wind_new");
  const [weather, setWeather] = useState<MaddalenaWind | null>(null);
  const [pendingSpiaggiaCoords, setPendingSpiaggiaCoords] = useState<
    [number, number] | null
  >(null);

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

      markerEntry.popup.setLngLat(target.coordinates).addTo(map);
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

    visibleLocations.forEach((location) => {
      const popup = new mapboxgl.Popup({ offset: 18, closeOnClick: false }).setHTML(
        buildPopupContent(location)
      );

      const marker = new mapboxgl.Marker({
        element: createMarkerElement(location),
        anchor: "center",
      })
        .setLngLat(location.coordinates)
        .addTo(map);

      marker.getElement().addEventListener("click", (event) => {
        event.stopPropagation();
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

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    const owmApiKey =
      process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ??
      process.env.NEXT_PUBLIC_OPENWEAT;
    if (!owmApiKey) return;

    if (map.getLayer(OWM_LAYER_ID)) {
      map.removeLayer(OWM_LAYER_ID);
    }
    if (map.getSource(OWM_SOURCE_ID)) {
      map.removeSource(OWM_SOURCE_ID);
    }

    if (activeWeatherLayer === "none" || activeWeatherLayer === "wind_new") return;

    const layerName = OWM_LAYERS[activeWeatherLayer];
    const tilesUrl = `https://tile.openweathermap.org/map/${layerName}/{z}/{x}/{y}.png?appid=${owmApiKey}`;

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
        "raster-opacity": 0.55,
      },
    });
  }, [activeWeatherLayer, isMapReady]);

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
        <select
          value={activeWeatherLayer}
          onChange={(event) =>
            setActiveWeatherLayer(event.target.value as WeatherLayerKey)
          }
          className="rounded-full border border-mare/30 bg-white px-3 py-1.5 text-xs font-semibold text-slate"
          aria-label="Layer meteo"
        >
          <option value="none">Meteo Off</option>
          <option value="wind_new">Layer Vento</option>
          <option value="precipitation_new">Layer Pioggia</option>
          <option value="clouds_new">Layer Nuvole</option>
        </select>
      </div>

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
          ventoAttuale={weather?.direction.nome ?? getNomeVento(direzioneVento)}
          isStrongWind={(weather?.speed ?? 0) > 15}
          selectedCategory={getSelectedCategory(filtroAttivo)}
          listaSpiagge={spiaggeTutte}
          onSpiaggiaClick={handleSpiaggiaClick}
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
            className="z-30"
          />
        ) : null}
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
