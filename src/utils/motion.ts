/** The user's choice for the weather background animation. */
export type BackgroundMotion = 'system' | 'on' | 'off';

export const BACKGROUND_MOTION_OPTIONS = ['system', 'on', 'off'] as const;

/** How the background should actually render right now. */
export type BackgroundMode = 'animated' | 'still' | 'hidden';

/**
 * Resolves the setting against the device's reduced-motion preference.
 *
 * "system" defers to the device, which is the right default: people who turn
 * on reduced motion often do so because large moving areas make them unwell.
 * "on" is an explicit override for anyone who wants the animation regardless.
 */
export function backgroundMode(setting: BackgroundMotion, prefersReducedMotion: boolean): BackgroundMode {
  if (setting === 'off') return 'hidden';
  if (setting === 'on') return 'animated';
  return prefersReducedMotion ? 'still' : 'animated';
}
