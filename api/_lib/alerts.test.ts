import { describe, it, expect } from 'vitest';
import { decideAlert, formatAlertHour, COOLDOWN_MS, RAIN_THRESHOLD } from './alerts.js';
import type { ForecastSnapshot } from './types.js';

const NOW = Date.UTC(2026, 8, 11, 10, 0);

/** Builds a forecast starting at `currentTime`, one entry per hour. */
function forecast(
  currentTime: string,
  currentCode: number,
  hours: { code?: number; pop?: number }[]
): ForecastSnapshot {
  const start = Number(currentTime.slice(11, 13));
  const date = currentTime.slice(0, 10);
  return {
    currentTime,
    currentCode,
    hourly: {
      time: hours.map((_, i) => `${date}T${String(start + i).padStart(2, '0')}:00`),
      weather_code: hours.map(h => h.code ?? 1),
      precipitation_probability: hours.map(h => h.pop ?? 0),
    },
  };
}

describe('decideAlert — severe weather', () => {
  it('alerts when a thunderstorm is happening now', () => {
    const alert = decideAlert('Hyderabad', forecast('2026-09-11T15:20', 95, [{ code: 95 }]), {}, NOW);
    expect(alert?.kind).toBe('severe');
    expect(alert?.title).toBe('⛈️ Thunderstorm in Hyderabad');
    expect(alert?.body).toMatch(/happening now/i);
  });

  it('alerts ahead of a storm expected within the lookahead, naming the hour', () => {
    const f = forecast('2026-09-11T14:10', 2, [{ code: 2 }, { code: 3 }, { code: 95 }]);
    const alert = decideAlert('Hyderabad', f, {}, NOW);
    expect(alert?.title).toBe('⛈️ Thunderstorm expected in Hyderabad');
    expect(alert?.body).toContain('around 4 PM');
  });

  it('uses the device’s 24-hour preference in the message', () => {
    const f = forecast('2026-09-11T14:10', 2, [{ code: 2 }, { code: 95 }]);
    expect(decideAlert('Pune', f, {}, NOW, '24h')?.body).toContain('around 15:00');
  });

  it('ignores a storm beyond the lookahead window', () => {
    const f = forecast('2026-09-11T14:10', 2, [{ code: 2 }, { code: 2 }, { code: 2 }, { code: 95 }]);
    expect(decideAlert('Hyderabad', f, {}, NOW)).toBeNull();
  });

  it('describes snow and freezing rain distinctly', () => {
    expect(decideAlert('Oslo', forecast('2026-01-10T09:00', 75, [{ code: 75 }]), {}, NOW)?.title)
      .toBe('❄️ Heavy snow in Oslo');
    expect(decideAlert('Oslo', forecast('2026-01-10T09:00', 67, [{ code: 67 }]), {}, NOW)?.title)
      .toBe('🧊 Freezing rain in Oslo');
  });

  it('does not treat ordinary rain as severe', () => {
    expect(decideAlert('Leeds', forecast('2026-09-11T09:00', 61, [{ code: 61 }]), {}, NOW)).toBeNull();
  });
});

describe('decideAlert — rain likely', () => {
  it(`alerts when the chance of rain reaches ${RAIN_THRESHOLD}% in the coming hours`, () => {
    const f = forecast('2026-09-11T11:05', 1, [{ pop: 10 }, { pop: 40 }, { pop: 80 }]);
    const alert = decideAlert('Hyderabad', f, {}, NOW);
    expect(alert?.kind).toBe('rain');
    expect(alert?.title).toBe('🌧️ Rain likely in Hyderabad');
    expect(alert?.body).toBe('80% chance around 1 PM.');
  });

  it('stays quiet below the threshold', () => {
    const f = forecast('2026-09-11T11:05', 1, [{ pop: 10 }, { pop: RAIN_THRESHOLD - 1 }, { pop: 50 }]);
    expect(decideAlert('Hyderabad', f, {}, NOW)).toBeNull();
  });

  it('says nothing new when it is already raining', () => {
    const f = forecast('2026-09-11T11:05', 63, [{ pop: 90 }, { pop: 95 }]);
    expect(decideAlert('Hyderabad', f, {}, NOW)).toBeNull();
  });

  it('ignores the current hour, which is not a warning of anything', () => {
    const f = forecast('2026-09-11T11:05', 1, [{ pop: 90 }, { pop: 5 }, { pop: 5 }]);
    expect(decideAlert('Hyderabad', f, {}, NOW)).toBeNull();
  });
});

describe('decideAlert — cooldown and precedence', () => {
  const stormy = forecast('2026-09-11T15:00', 95, [{ code: 95, pop: 90 }, { code: 95, pop: 90 }]);

  it('does not repeat the same kind of alert within the cooldown', () => {
    expect(decideAlert('X', stormy, { severe: NOW - COOLDOWN_MS + 60_000 }, NOW)).toBeNull();
  });

  it('allows it again once the cooldown has passed', () => {
    expect(decideAlert('X', stormy, { severe: NOW - COOLDOWN_MS }, NOW)?.kind).toBe('severe');
  });

  it('never downgrades a cooling-down storm into a separate rain alert', () => {
    // Severe is on cooldown and rain has never been sent — still silence.
    expect(decideAlert('X', stormy, { severe: NOW - 1000 }, NOW)).toBeNull();
  });

  it('keeps the two cooldowns independent', () => {
    const rainy = forecast('2026-09-11T11:00', 1, [{ pop: 0 }, { pop: 90 }]);
    expect(decideAlert('X', rainy, { severe: NOW - 1000 }, NOW)?.kind).toBe('rain');
  });
});

describe('decideAlert — clock handling', () => {
  it('looks across midnight into the next day', () => {
    const f: ForecastSnapshot = {
      currentTime: '2026-09-11T23:30',
      currentCode: 1,
      hourly: {
        time: ['2026-09-11T22:00', '2026-09-11T23:00', '2026-09-12T00:00', '2026-09-12T01:00'],
        weather_code: [1, 1, 95, 1],
        precipitation_probability: [0, 0, 0, 0],
      },
    };
    const alert = decideAlert('Tokyo', f, {}, NOW);
    expect(alert?.body).toContain('around 12 AM');
  });

  it('returns nothing rather than guessing when the forecast has no current hour', () => {
    const f = forecast('2026-09-11T10:00', 1, [{ pop: 90 }]);
    f.currentTime = '2026-09-12T10:00'; // later than every hourly entry
    expect(decideAlert('X', f, {}, NOW)).toBeNull();
  });
});

describe('formatAlertHour', () => {
  it('formats both clocks, with noon and midnight as 12', () => {
    expect(formatAlertHour('2026-09-11T00:00', '12h')).toBe('12 AM');
    expect(formatAlertHour('2026-09-11T12:00', '12h')).toBe('12 PM');
    expect(formatAlertHour('2026-09-11T16:00', '12h')).toBe('4 PM');
    expect(formatAlertHour('2026-09-11T07:00', '24h')).toBe('07:00');
  });
});
