/**
 * The one place routes are defined. The app reads it to render and to keep
 * document metadata in step; `scripts/prerender.mjs` reads the same table at
 * build time to emit a real HTML file per route, so crawlers that do not run
 * JavaScript still receive correct titles, descriptions and canonicals.
 */

export const SITE_URL = 'https://orb-weather.vercel.app';

export type ViewId =
  | 'dashboard'
  | 'settings'
  | 'faq'
  | 'about'
  | 'radar'
  | 'privacy'
  | 'terms'
  | 'contact';

export interface RouteDefinition {
  path: string;
  view: ViewId;
  title: string;
  description: string;
  /** Standalone pages render outside the dashboard shell. */
  standalone?: boolean;
  /** Included in sitemap.xml at this priority; omit to leave it out. */
  priority?: number;
}

export const ROUTES: RouteDefinition[] = [
  {
    path: '/',
    view: 'dashboard',
    title: 'OrbWeather — World Weather Tracker, Forecasts & Air Quality',
    description:
      'Track real-time weather anywhere in the world. Hourly and 7-day forecasts, air quality, UV index, sunrise and sunset times, and an interactive weather map. Free, no account, no ads.',
    priority: 1.0,
  },
  {
    path: '/map',
    view: 'radar',
    title: 'Interactive Weather Map — OrbWeather',
    description:
      'Explore an interactive world weather map and pull live conditions for any point on the globe.',
    priority: 0.8,
  },
  {
    path: '/settings',
    view: 'settings',
    title: 'Settings — OrbWeather',
    description:
      'Choose your theme, temperature unit, time format and severe weather alerts.',
    priority: 0.4,
  },
  {
    path: '/faq',
    view: 'faq',
    title: 'FAQ — OrbWeather',
    description:
      'Answers to common questions about OrbWeather data sources, accuracy and privacy.',
    priority: 0.6,
  },
  {
    path: '/about',
    view: 'about',
    title: 'About OrbWeather — Data Sources and How It Works',
    description:
      'What OrbWeather is, where its data comes from, and how it is built.',
    priority: 0.6,
  },
  {
    path: '/privacy',
    view: 'privacy',
    title: 'Privacy Policy — OrbWeather',
    description:
      'How OrbWeather handles your data: no accounts or tracking, preferences kept on your device, and optional alerts that store only what is needed to reach you.',
    standalone: true,
    priority: 0.3,
  },
  {
    path: '/terms',
    view: 'terms',
    title: 'Terms of Usage — OrbWeather',
    description:
      'The terms that apply when you use OrbWeather, including forecast accuracy and acceptable use.',
    standalone: true,
    priority: 0.3,
  },
  {
    path: '/contact',
    view: 'contact',
    title: 'Contact Us — OrbWeather',
    description:
      'Get in touch with the OrbWeather team about feedback, bugs or feature requests.',
    standalone: true,
    priority: 0.5,
  },
];

const HOME = ROUTES[0];

/** Normalises a pathname (trailing slashes, casing) to a known route. */
export function matchRoute(pathname: string): RouteDefinition {
  const normalised = pathname.replace(/\/+$/, '').toLowerCase() || '/';
  return ROUTES.find(r => r.path === normalised) ?? HOME;
}

export function routeForView(view: ViewId): RouteDefinition {
  return ROUTES.find(r => r.view === view) ?? HOME;
}
