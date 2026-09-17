import type { CityMeta } from '../types';

/** Cities can share a name, so identity is the name together with its coordinates. */
export function cityKey(city: CityMeta): string {
  return `${city.name}@${city.lat},${city.lon}`;
}

export function sameCity(a: CityMeta, b: CityMeta): boolean {
  return cityKey(a) === cityKey(b);
}

/** "Telangana, India", falling back to the country, then its code. */
export function regionOf(city: CityMeta): string {
  if (city.admin1) return `${city.admin1}, ${city.country}`;
  return city.country || city.countryCode;
}
