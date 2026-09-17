import { describe, it, expect } from 'vitest';
import { backgroundMode } from './motion';

describe('backgroundMode', () => {
  it('follows the device by default', () => {
    expect(backgroundMode('system', false)).toBe('animated');
    expect(backgroundMode('system', true)).toBe('still');
  });

  it('animates when switched on, even if the device asks for reduced motion', () => {
    expect(backgroundMode('on', true)).toBe('animated');
    expect(backgroundMode('on', false)).toBe('animated');
  });

  it('hides the background entirely when switched off', () => {
    expect(backgroundMode('off', true)).toBe('hidden');
    expect(backgroundMode('off', false)).toBe('hidden');
  });
});
