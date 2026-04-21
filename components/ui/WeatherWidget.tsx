"use client";

type WeatherData = {
  velocitaNodi: number;
  temperatura: number;
  nomeVento: string;
  iconaVentoUrl?: string;
  descrizioneCielo: string;
};

type WeatherWidgetProps = {
  weather: WeatherData;
  className?: string;
};

function getArrowRotation(nomeVento: string) {
  const vento = nomeVento.trim().toLowerCase();
  if (vento === "tramontana") return 0;
  if (vento === "grecale") return 45;
  if (vento === "levante") return 90;
  if (vento === "scirocco") return 135;
  if (vento === "ostro") return 180;
  if (vento === "libeccio") return 225;
  if (vento === "ponente") return 270;
  if (vento === "maestrale") return 315;
  return 0;
}

export function WeatherWidget({ weather, className }: WeatherWidgetProps) {
  const rotation = getArrowRotation(weather.nomeVento);

  return (
    <aside
      className={`absolute right-3 top-3 z-30 rounded-xl border border-white/10 bg-slate-950/80 p-3 text-white shadow-2xl backdrop-blur-md md:right-4 md:top-4 ${className ?? ""}`}
    >
      <div className="flex items-stretch gap-4">
        <div className="min-w-[132px]">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold leading-none">
              {Math.round(weather.velocitaNodi)} kts
            </span>
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5"
              style={{ transform: `rotate(${rotation}deg)` }}
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white">
                <path d="M12 3L16 11H8L12 3Z" fill="currentColor" />
                <path d="M11 11H13V21H11Z" fill="currentColor" />
              </svg>
            </span>
          </div>
          <p className="mt-1 text-xs text-white/80">{weather.nomeVento}</p>
        </div>

        <div className="w-px bg-white/10" aria-hidden="true" />

        <div className="min-w-[140px]">
          <div className="flex items-center gap-2">
            {weather.iconaVentoUrl ? (
              <img
                src={weather.iconaVentoUrl}
                alt="Icona meteo"
                className="h-8 w-8 object-contain"
              />
            ) : (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-sm">
                ☀
              </span>
            )}
            <span className="text-2xl font-bold leading-none">
              {Math.round(weather.temperatura)}°C
            </span>
          </div>
          <p className="mt-1 text-xs text-white/80">{weather.descrizioneCielo}</p>
        </div>
      </div>
    </aside>
  );
}
