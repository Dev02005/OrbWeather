import { useMemo } from 'react';
import { precipitationKind } from '../utils/precipitation';
import './WeatherBackground.css';

interface WeatherBackgroundProps {
  weatherCode: number;
}

/** Per-drop variation, fixed once so the animation never re-randomises on render. */
interface Drop {
  left: number;
  duration: number;
  delay: number;
  scale: number;
  opacity: number;
}

const COUNTS = { rain: 70, snow: 60, calm: 24 } as const;

function makeDrops(count: number, minDuration: number, maxDuration: number): Drop[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    duration: minDuration + Math.random() * (maxDuration - minDuration),
    // A negative delay starts each drop mid-fall, so the screen is never empty.
    delay: -Math.random() * maxDuration,
    scale: 0.6 + Math.random() * 0.8,
    opacity: 0.25 + Math.random() * 0.45,
  }));
}

/**
 * A decorative layer behind the dashboard that reflects the current conditions.
 *
 * Drawn with CSS transforms rather than a canvas library: it costs no JavaScript
 * at runtime and the browser animates it on the compositor.
 */
export function WeatherBackground({ weatherCode }: WeatherBackgroundProps) {
  const kind = precipitationKind(weatherCode);

  const drops = useMemo(() => {
    if (kind === 'rain') return makeDrops(COUNTS.rain, 0.5, 1.1);
    if (kind === 'snow') return makeDrops(COUNTS.snow, 6, 13);
    return makeDrops(COUNTS.calm, 14, 26);
  }, [kind]);

  return (
    <div className={`weather-bg weather-bg-${kind}`} aria-hidden="true">
      {drops.map((drop, i) => (
        <span
          key={i}
          className="weather-bg-drop"
          style={{
            left: `${drop.left}%`,
            animationDuration: `${drop.duration}s`,
            animationDelay: `${drop.delay}s`,
            opacity: drop.opacity,
            ['--drop-scale' as string]: drop.scale,
          }}
        />
      ))}
    </div>
  );
}
