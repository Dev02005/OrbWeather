/** iOS Safari's non-standard flag for a site launched from the Home Screen. */
interface IOSNavigator extends Navigator {
  standalone?: boolean;
}

/** iPhone, iPod, or an iPad — which reports itself as a Mac but has touch. */
export function isIOS(): boolean {
  const { userAgent, maxTouchPoints } = window.navigator;
  return /iPad|iPhone|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1);
}

/**
 * Whether the app is running installed rather than in a browser tab.
 *
 * iOS exposes `navigator.standalone` on every Safari page, set to `false` until
 * the site is launched from the Home Screen — so the value has to be checked,
 * not merely the property's presence.
 */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as IOSNavigator).standalone === true
  );
}
