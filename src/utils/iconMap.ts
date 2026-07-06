import {
  Sun,
  CloudSun,
  Cloud,
  Cloudy,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Moon,
  CloudMoon
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function getWeatherIcon(code: number, isDay: boolean): LucideIcon {
  if (!isDay) {
    if (code === 0 || code === 1) return Moon;
    if (code === 2) return CloudMoon;
  }

  switch (code) {
    case 0: return Sun;
    case 1: return CloudSun;
    case 2: return CloudSun;
    case 3: return Cloudy;
    case 45:
    case 48: return CloudFog;
    case 51:
    case 53:
    case 55: return CloudDrizzle;
    case 61:
    case 63:
    case 65:
    case 80:
    case 81:
    case 82: return CloudRain;
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86: return CloudSnow;
    case 95:
    case 96:
    case 99: return CloudLightning;
    default: return Cloud;
  }
}
