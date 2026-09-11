import { describe, it, expect, afterAll } from 'vitest';
import { formatDay, formatHour, isDaylightAt } from './forecast';
import type { WeatherData } from '../types';

describe('formatDay', () => {
  it('returns the weekday of the date as written', () => {
    expect(formatDay('2026-09-07')).toBe('Mon');
    expect(formatDay('2026-09-08')).toBe('Tue');
    expect(formatDay('2026-09-13')).toBe('Sun');
  });

  // The original bug: a date-only string parses as UTC midnight, so any viewer
  // west of UTC saw every label shifted back by one day.
  describe('across runtime timezones', () => {
    const original = process.env.TZ;
    afterAll(() => {
      process.env.TZ = original;
    });

    const zones = [
      'UTC',
      'America/Los_Angeles', // -7/-8, where the old code broke
      'America/New_York',
      'Pacific/Midway', // -11, the extreme west
      'Asia/Kolkata', // +5:30, a half-hour offset
      'Pacific/Kiritimati', // +14, the extreme east
    ];

    for (const zone of zones) {
      it(`is stable in ${zone}`, () => {
        process.env.TZ = zone;
        expect(formatDay('2026-09-07')).toBe('Mon');
        expect(formatDay('2026-01-01')).toBe('Thu');
        expect(formatDay('2026-12-25')).toBe('Fri');
      });
    }

    it('never parses the string as UTC midnight', () => {
      process.env.TZ = 'America/Los_Angeles';
      // Demonstrates the defect the implementation avoids.
      const naive = new Date('2026-09-07').getDay(); // Sunday in this zone
      expect(formatDay('2026-09-07')).not.toBe(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][naive]);
      expect(formatDay('2026-09-07')).toBe('Mon');
    });
  });
});

describe('formatHour', () => {
  it('reads the hour off the string rather than parsing it', () => {
    expect(formatHour('2026-09-08T00:00', '24h')).toBe('00:00');
    expect(formatHour('2026-09-08T09:00', '24h')).toBe('09:00');
    expect(formatHour('2026-09-08T23:00', '24h')).toBe('23:00');
  });

  it('formats 12h with a meridiem', () => {
    expect(formatHour('2026-09-08T00:00', '12h')).toBe('12AM');
    expect(formatHour('2026-09-08T09:00', '12h')).toBe('9AM');
    expect(formatHour('2026-09-08T12:00', '12h')).toBe('12PM');
    expect(formatHour('2026-09-08T23:00', '12h')).toBe('11PM');
  });
});

describe('isDaylightAt', () => {
  const daily = {
    time: ['2026-09-08', '2026-09-09'],
    sunrise: ['2026-09-08T06:00', '2026-09-09T06:02'],
    sunset: ['2026-09-08T18:00', '2026-09-09T17:58'],
  } as unknown as WeatherData['daily'];

  it('treats hours between sunrise and sunset as daylight', () => {
    expect(isDaylightAt('2026-09-08T12:00', daily)).toBe(true);
    expect(isDaylightAt('2026-09-08T06:00', daily)).toBe(true); // sunrise itself
  });

  it('treats hours outside them as night', () => {
    expect(isDaylightAt('2026-09-08T03:00', daily)).toBe(false);
    expect(isDaylightAt('2026-09-08T18:00', daily)).toBe(false); // sunset itself
    expect(isDaylightAt('2026-09-08T22:00', daily)).toBe(false);
  });

  it("uses each hour's own day, not the first one", () => {
    // 06:01 is before the 9th's sunrise (06:02) though after the 8th's (06:00).
    expect(isDaylightAt('2026-09-09T06:01', daily)).toBe(false);
    expect(isDaylightAt('2026-09-09T06:03', daily)).toBe(true);
  });

  it('falls back to daylight for a day outside the forecast range', () => {
    expect(isDaylightAt('2026-09-20T03:00', daily)).toBe(true);
  });
});
