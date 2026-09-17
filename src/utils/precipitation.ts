export type PrecipitationKind = 'rain' | 'snow' | 'calm';

/** WMO codes for frozen precipitation: snow fall, grains and showers. */
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);
/** Drizzle, freezing drizzle, rain, freezing rain, showers and thunderstorms. */
const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);

/** Which background animation suits a weather code. */
export function precipitationKind(weatherCode: number): PrecipitationKind {
  if (SNOW_CODES.has(weatherCode)) return 'snow';
  if (RAIN_CODES.has(weatherCode)) return 'rain';
  return 'calm';
}
