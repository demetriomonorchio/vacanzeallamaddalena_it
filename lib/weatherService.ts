const MADDALENA_LAT = 41.2142;
const MADDALENA_LON = 9.4074;
const MS_TO_KNOTS = 1.943844;

export type MaddalenaWind = {
  speed: number;
  direction: {
    gradi: number;
    nome:
      | "Tramontana"
      | "Grecale"
      | "Levante"
      | "Scirocco"
      | "Ostro"
      | "Libeccio"
      | "Ponente"
      | "Maestrale";
    codice: "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";
  };
  temperatura: number;
  descrizioneCielo: string;
  iconaMeteoUrl?: string;
};

type OpenWeatherResponse = {
  wind?: {
    speed?: number;
    deg?: number;
  };
  main?: {
    temp?: number;
    feels_like?: number;
  };
  weather?: Array<{
    description?: string;
    icon?: string;
  }>;
};

function degreesToCardinal(deg: number): MaddalenaWind["direction"] {
  const normalized = ((deg % 360) + 360) % 360;

  if (normalized < 22.5 || normalized >= 337.5) {
    return { gradi: deg, nome: "Tramontana", codice: "N" };
  }
  if (normalized < 67.5) {
    return { gradi: deg, nome: "Grecale", codice: "NE" };
  }
  if (normalized < 112.5) {
    return { gradi: deg, nome: "Levante", codice: "E" };
  }
  if (normalized < 157.5) {
    return { gradi: deg, nome: "Scirocco", codice: "SE" };
  }
  if (normalized < 202.5) {
    return { gradi: deg, nome: "Ostro", codice: "S" };
  }
  if (normalized < 247.5) {
    return { gradi: deg, nome: "Libeccio", codice: "SW" };
  }
  if (normalized < 292.5) {
    return { gradi: deg, nome: "Ponente", codice: "W" };
  }
  return { gradi: deg, nome: "Maestrale", codice: "NW" };
}

export async function getMaddalenaWind(): Promise<MaddalenaWind> {
  const apiKey =
    process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ??
    process.env.NEXT_PUBLIC_OPENWEAT;

  if (!apiKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_OPENWEATHER_API_KEY (or NEXT_PUBLIC_OPENWEAT)"
    );
  }

  const url =
    `https://api.openweathermap.org/data/2.5/weather?lat=${MADDALENA_LAT}&lon=${MADDALENA_LON}` +
    `&appid=${apiKey}&units=metric&lang=it`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`OpenWeather request failed: ${response.status}`);
  }

  const data = (await response.json()) as OpenWeatherResponse;
  const speedMs = data.wind?.speed;
  const deg = data.wind?.deg;

  if (typeof speedMs !== "number" || typeof deg !== "number") {
    throw new Error("Invalid wind payload from OpenWeather");
  }

  const speed = Number((speedMs * MS_TO_KNOTS).toFixed(1));
  const direction = degreesToCardinal(deg);
  const temperaturaRaw = data.main?.temp ?? data.main?.feels_like;
  const descrizioneCielo = data.weather?.[0]?.description;
  const icona = data.weather?.[0]?.icon;
  if (typeof temperaturaRaw !== "number") {
    throw new Error("Invalid temperature payload from OpenWeather");
  }

  return {
    speed,
    direction,
    temperatura: Number(temperaturaRaw.toFixed(1)),
    descrizioneCielo: descrizioneCielo ?? "Cielo sereno",
    iconaMeteoUrl: icona
      ? `https://openweathermap.org/img/wn/${icona}@2x.png`
      : undefined,
  };
}
