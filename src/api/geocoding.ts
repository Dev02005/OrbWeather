import type { Coordinates, CityMeta } from '../types';

const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';

export async function fetchSuggestions(query: string) {
  try {
    const res = await fetch(`${GEO_API}?name=${encodeURIComponent(query)}&count=6&language=en&format=json`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Failed to fetch suggestions', error);
    return [];
  }
}

export async function geocodeCity(cityName: string): Promise<CityMeta | null> {
  try {
    const res = await fetch(`${GEO_API}?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
    const data = await res.json();
    if (!data.results || !data.results.length) {
      throw new Error(`City "${cityName}" not found.`);
    }
    const r = data.results[0];
    return {
      name: r.name,
      countryCode: r.country_code || '',
      country: r.country || '',
      lat: r.latitude,
      lon: r.longitude,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<CityMeta | null> {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    const data = await res.json();
    return {
      name: data.city || data.locality || "Local Area",
      countryCode: data.countryCode || "",
      country: data.countryName || "",
      admin1: data.principalSubdivision || "",
      lat,
      lon,
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

