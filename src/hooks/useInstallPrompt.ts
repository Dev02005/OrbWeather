import { useSyncExternalStore } from 'react';
import { isStandalone } from '../utils/platform';
import type { BeforeInstallPromptEvent } from '../types';

/**
 * Chromium fires `beforeinstallprompt` once, early, and only offers the prompt
 * if the page held on to that event. Listening from a component would miss it
 * whenever that component happens to be unmounted, so the listener is attached
 * as soon as this module loads and the event is kept here for whoever needs it.
 */

export type InstallState =
  | 'installed' // running from the home screen, or installed during this visit
  | 'prompt'    // the browser will show its own install dialog on request
  | 'manual';   // Safari, Firefox and iOS: the user has to use the browser menu

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installedNow = false;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach(listener => listener());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); // suppress Chrome's own banner; we offer our own button
    deferredPrompt = event;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installedNow = true;
    notify();
  });
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function installState(): InstallState {
  if (installedNow || isStandalone()) return 'installed';
  return deferredPrompt ? 'prompt' : 'manual';
}

/** Shows the browser's install dialog. Resolves once the user has answered. */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const event = deferredPrompt;
  if (!event) return 'unavailable';

  // The event is single-use, so it is cleared whatever the outcome.
  deferredPrompt = null;
  notify();

  await event.prompt();
  const { outcome } = await event.userChoice;
  return outcome;
}

export function useInstallState(): InstallState {
  return useSyncExternalStore(subscribe, installState, () => 'manual');
}
