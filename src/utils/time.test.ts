import { describe, it, expect } from 'vitest';
import { cityNow, wallClockMs, formatWallClockTime } from './time';

describe('cityNow', () => {
  const instant = new Date('2026-09-08T18:30:00Z');

  it('reports the wall clock of the requested zone, not the runtime zone', () => {
    expect(cityNow('UTC', instant)).toBe('2026-09-08T18:30');
    expect(cityNow('Asia/Tokyo', instant)).toBe('2026-09-09T03:30'); // +9, next day
    expect(cityNow('America/New_York', instant)).toBe('2026-09-08T14:30'); // -4 (DST)
  });

  it('matches the naive format the API returns, so the two compare directly', () => {
    expect(cityNow('Europe/London', instant)).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it('renders midnight as 00, never 24', () => {
    const midnightUTC = new Date('2026-09-08T00:15:00Z');
    expect(cityNow('UTC', midnightUTC)).toBe('2026-09-08T00:15');
  });

  it('crosses the date line correctly in both directions', () => {
    const instant2 = new Date('2026-01-01T00:30:00Z');
    expect(cityNow('Pacific/Kiritimati', instant2)).toBe('2026-01-01T14:30'); // +14
    expect(cityNow('Pacific/Midway', instant2)).toBe('2025-12-31T13:30'); // -11, previous year
  });

  it('applies the offset in effect on that date, not today', () => {
    // New York is UTC-5 in January and UTC-4 in July.
    expect(cityNow('America/New_York', new Date('2026-01-15T12:00:00Z'))).toBe('2026-01-15T07:00');
    expect(cityNow('America/New_York', new Date('2026-07-15T12:00:00Z'))).toBe('2026-07-15T08:00');
  });
});

describe('wallClockMs', () => {
  it('reads a wall-clock string as written, ignoring the runtime zone', () => {
    expect(wallClockMs('2026-09-08T00:00')).toBe(Date.UTC(2026, 8, 8, 0, 0));
  });

  it('yields a difference the shared offset cancels out of', () => {
    // The sun-arc ratio depends only on differences between same-zone values.
    const sunrise = wallClockMs('2026-09-08T06:00');
    const sunset = wallClockMs('2026-09-08T18:00');
    const noon = wallClockMs('2026-09-08T12:00');
    expect((noon - sunrise) / (sunset - sunrise)).toBeCloseTo(0.5);
  });

  it('accepts the API shape, which omits seconds', () => {
    expect(Number.isNaN(wallClockMs('2026-09-08T06:03'))).toBe(false);
  });
});

describe('formatWallClockTime', () => {
  it('formats 24h with a zero-padded hour', () => {
    expect(formatWallClockTime('2026-09-08T06:03', '24h')).toBe('06:03');
    expect(formatWallClockTime('2026-09-08T18:24', '24h')).toBe('18:24');
    expect(formatWallClockTime('2026-09-08T00:00', '24h')).toBe('00:00');
  });

  it('formats 12h with a meridiem and no leading zero', () => {
    expect(formatWallClockTime('2026-09-08T06:03', '12h')).toBe('6:03 AM');
    expect(formatWallClockTime('2026-09-08T18:24', '12h')).toBe('6:24 PM');
  });

  it('renders both noon and midnight as 12, not 0', () => {
    expect(formatWallClockTime('2026-09-08T00:30', '12h')).toBe('12:30 AM');
    expect(formatWallClockTime('2026-09-08T12:30', '12h')).toBe('12:30 PM');
  });

  it('degrades to a placeholder when the API omits the value', () => {
    expect(formatWallClockTime('', '12h')).toBe('--');
  });
});
