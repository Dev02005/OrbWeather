import { describe, it, expect } from 'vitest';
import { precipitationKind } from './precipitation';

describe('precipitationKind', () => {
  it('shows snow for frozen precipitation', () => {
    for (const code of [71, 73, 75, 77, 85, 86]) {
      expect(precipitationKind(code), `code ${code}`).toBe('snow');
    }
  });

  it('shows rain for drizzle, rain, showers and thunderstorms', () => {
    for (const code of [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99]) {
      expect(precipitationKind(code), `code ${code}`).toBe('rain');
    }
  });

  it('shows rain for freezing drizzle and freezing rain, which the old list missed', () => {
    for (const code of [56, 57, 66, 67]) {
      expect(precipitationKind(code), `code ${code}`).toBe('rain');
    }
  });

  it('stays calm for clear, cloudy and foggy weather', () => {
    for (const code of [0, 1, 2, 3, 45, 48]) {
      expect(precipitationKind(code), `code ${code}`).toBe('calm');
    }
  });

  it('treats an unknown code as calm rather than throwing', () => {
    expect(precipitationKind(999)).toBe('calm');
  });
});
