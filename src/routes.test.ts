import { describe, it, expect } from 'vitest';
import { ROUTES, matchRoute, routeForView, SITE_URL } from './routes';

describe('route table', () => {
  it('has a unique path and view per route', () => {
    expect(new Set(ROUTES.map(r => r.path)).size).toBe(ROUTES.length);
    expect(new Set(ROUTES.map(r => r.view)).size).toBe(ROUTES.length);
  });

  it('gives every route metadata the prerender step can bake in', () => {
    for (const route of ROUTES) {
      expect(route.path.startsWith('/'), route.path).toBe(true);
      expect(route.title.length, route.path).toBeGreaterThan(0);
      // Search engines truncate descriptions well beyond this.
      expect(route.description.length, route.path).toBeGreaterThan(50);
      expect(route.description.length, route.path).toBeLessThanOrEqual(200);
    }
  });

  it('keeps titles within the length search results display', () => {
    for (const route of ROUTES) {
      expect(route.title.length, route.path).toBeLessThanOrEqual(70);
    }
  });

  it('uses an absolute https site URL with no trailing slash', () => {
    expect(SITE_URL).toMatch(/^https:\/\//);
    expect(SITE_URL.endsWith('/')).toBe(false);
  });
});

describe('matchRoute', () => {
  it('matches known paths', () => {
    expect(matchRoute('/').view).toBe('dashboard');
    expect(matchRoute('/about').view).toBe('about');
    expect(matchRoute('/privacy').view).toBe('privacy');
  });

  it('normalises trailing slashes and casing', () => {
    expect(matchRoute('/about/').view).toBe('about');
    expect(matchRoute('/ABOUT').view).toBe('about');
    expect(matchRoute('/about///').view).toBe('about');
  });

  it('falls back to the dashboard for unknown paths', () => {
    expect(matchRoute('/nope').view).toBe('dashboard');
    expect(matchRoute('/a/b/c').view).toBe('dashboard');
  });
});

describe('routeForView', () => {
  it('round-trips every view through its path', () => {
    for (const route of ROUTES) {
      expect(routeForView(route.view).path).toBe(route.path);
      expect(matchRoute(route.path).view).toBe(route.view);
    }
  });
});
