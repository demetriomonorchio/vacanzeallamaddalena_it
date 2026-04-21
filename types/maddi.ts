export interface Spiaggia {
  name: string;
  category: "Spiagge";
  zona: string;
  coordinates: [number, number];
  esposizione: string[];
  maddiTip: string;
  url?: string;
  rating?: number;
  reviews?: number;
  description?: string;
  image?: string;
}
