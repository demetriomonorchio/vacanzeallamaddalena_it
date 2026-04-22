"use client";
import type { Locale } from "@/lib/i18n";

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
  locale?: Locale;
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

export function WeatherWidget({ weather, className, locale = "it" }: WeatherWidgetProps) {
  const rotation = getArrowRotation(weather.nomeVento);

  return (
    <aside
      className={`absolute right-3 top-3 z-30 w-[calc(100%-1.5rem)] max-w-[320px] rounded-xl border border-white/10 bg-slate-950/80 p-2 text-white shadow-2xl backdrop-blur-md sm:w-auto sm:max-w-none sm:p-3 md:right-4 md:top-4 ${className ?? ""}`}
    >
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:gap-4">
        <div className="sm:min-w-[132px]">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold leading-none sm:text-2xl">
              {Math.round(weather.velocitaNodi)} kts
            </span>
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/5 sm:h-8 sm:w-8"
              style={{ transform: `rotate(${rotation}deg)` }}
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white">
                <path d="M12 3L16 11H8L12 3Z" fill="currentColor" />
                <path d="M11 11H13V21H11Z" fill="currentColor" />
              </svg>
            </span>
          </div>
          <p className="mt-1 text-[11px] text-white/80 sm:text-xs">{weather.nomeVento}</p>
        </div>

        <div className="h-px w-full bg-white/10 sm:h-auto sm:w-px" aria-hidden="true" />

        <div className="sm:min-w-[140px]">
          <div className="flex items-center gap-2">
            {weather.iconaVentoUrl ? (
              <img
                src={weather.iconaVentoUrl}
                alt={locale === "en" ? "Weather icon" : "Icona meteo"}
                className="h-7 w-7 object-contain sm:h-8 sm:w-8"
              />
            ) : (
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/5 text-sm sm:h-8 sm:w-8">
                ☀
              </span>
            )}
            <span className="text-xl font-bold leading-none sm:text-2xl">
              {Math.round(weather.temperatura)}°C
            </span>
          </div>
          <p className="mt-1 text-[11px] text-white/80 sm:text-xs">{weather.descrizioneCielo}</p>
        </div>
      </div>
    </aside>
  );
}
