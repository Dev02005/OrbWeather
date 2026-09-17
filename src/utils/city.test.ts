import { describe, it, expect } from 'vitest';
import { cityKey, sameCity, regionOf } from './city';
import type { CityMeta } from '../types';

const hyderabadIndia: CityMeta = { name: 'Hyderabad', countryCode: 'IN', country: 'India', admin1: 'Telangana', lat: 17.38, lon: 78.48 };
const hyderabadPakistan: CityMeta = { name: 'Hyderabad', countryCode: 'PK', country: 'Pakistan', admin1: 'Sindh', lat: 25.39, lon: 68.37 };

describe('sameCity', () => {
  it('matches the same city', () => {
    expect(sameCity(hyderabadIndia, { ...hyderabadIndia })).toBe(true);
  });

  it('tells apart different cities that share a name', () => {
    expect(sameCity(hyderabadIndia, hyderabadPakistan)).toBe(false);
  });

  it('gives each of them a distinct key', () => {
    expect(cityKey(hyderabadIndia)).not.toBe(cityKey(hyderabadPakistan));
  });
});

describe('regionOf', () => {
  it('shows the region and country', () => {
    expect(regionOf(hyderabadIndia)).toBe('Telangana, India');
  });

  it('falls back to the country, then the country code', () => {
    expect(regionOf({ ...hyderabadIndia, admin1: '' })).toBe('India');
    expect(regionOf({ ...hyderabadIndia, admin1: '', country: '' })).toBe('IN');
  });
});
