import type { CityMeta } from '../types';

const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';
const REVERSE_API = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

/** The subset of Open-Meteo's geocoding result the app relies on. */
interface GeocodingResult {
  name?: string;
  country?: string;
  country_code?: string;
  admin1?: string;
  latitude?: number;
  longitude?: number;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface ReverseGeocodeResponse {
  city?: string;
  locality?: string;
  countryCode?: string;
  countryName?: string;
  principalSubdivision?: string;
}

/** Keeps only results carrying the fields the app needs to plot a city. */
function toCityMeta(result: GeocodingResult): CityMeta | null {
  if (!result.name || typeof result.latitude !== 'number' || typeof result.longitude !== 'number') {
    return null;
  }
  return {
    name: result.name,
    countryCode: result.country_code ?? '',
    country: result.country ?? '',
    admin1: result.admin1 ?? '',
    lat: result.latitude,
    lon: result.longitude,
  };
}

export async function fetchSuggestions(query: string, signal?: AbortSignal): Promise<CityMeta[]> {
  const params = new URLSearchParams({
    name: query,
    count: '6',
    language: 'en',
    format: 'json',
  });

  const res = await fetch(`${GEO_API}?${params.toString()}`, { signal });
  if (!res.ok) throw new Error('Failed to fetch city suggestions');

  const data = (await res.json()) as GeocodingResponse;
  return (data.results ?? []).map(toCityMeta).filter((c): c is CityMeta => c !== null);
}

export async function reverseGeocode(lat: number, lon: number): Promise<CityMeta | null> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      localityLanguage: 'en',
    });
    const res = await fetch(`${REVERSE_API}?${params.toString()}`);
    if (!res.ok) throw new Error('Reverse geocoding request failed');

    const data = (await res.json()) as ReverseGeocodeResponse;
    return {
      name: data.city || data.locality || 'Local Area',
      countryCode: data.countryCode ?? '',
      country: data.countryName ?? '',
      admin1: data.principalSubdivision ?? '',
      lat,
      lon,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}
