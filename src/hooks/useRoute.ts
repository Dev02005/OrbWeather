import { useSyncExternalStore, useCallback } from 'react';
import { matchRoute, routeForView, SITE_URL } from '../routes';
import type { RouteDefinition, ViewId } from '../routes';

/**
 * A minimal History-API router. The app has a handful of static routes and no
 * dynamic segments, so this keeps real URLs — shareable, bookmarkable, and
 * indexable — without pulling in a routing library.
 */

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener('popstate', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('popstate', onChange);
  };
}

const getSnapshot = () => window.location.pathname;
// Prerendered HTML is only ever hydrated in the browser; on the server the
// snapshot is the route being rendered, which the build passes via the URL.
const getServerSnapshot = () => '/';

export function navigate(path: string) {
  if (window.location.pathname === path) return;
  window.history.pushState({}, '', path);
  listeners.forEach(fn => fn());
}

/** Applies a route's metadata to the document, including canonical and OG tags. */
export function applyRouteMeta(route: RouteDefinition, overrides?: { title?: string; description?: string }) {
  const title = overrides?.title ?? route.title;
  const description = overrides?.description ?? route.description;
  const url = `${SITE_URL}${route.path === '/' ? '/' : route.path}`;

  document.title = title;

  const set = (selector: string, attr: string, value: string) =>
    document.querySelector(selector)?.setAttribute(attr, value);

  set('meta[name="description"]', 'content', description);
  set('link[rel="canonical"]', 'href', url);
  set('meta[property="og:url"]', 'content', url);
  set('meta[property="og:title"]', 'content', title);
  set('meta[property="og:description"]', 'content', description);
  set('meta[name="twitter:title"]', 'content', title);
  set('meta[name="twitter:description"]', 'content', description);
}

export function useRoute() {
  const pathname = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const route = matchRoute(pathname);

  const go = useCallback((view: ViewId) => {
    navigate(routeForView(view).path);
  }, []);

  return { route, navigate: go };
}
