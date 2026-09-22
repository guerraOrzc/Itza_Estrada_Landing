import { describe, expect, test } from 'vitest';
import WaveCap from '../../src/components/WaveCap.astro';
import WaveSeam from '../../src/components/WaveSeam.astro';
import { render } from './render';

describe('WaveCap', () => {
  test('passes color and default height through CSS variables', async () => {
    const doc = await render(WaveCap, { props: { color: 'red', position: 'top' } });
    const cap = doc.querySelector('.wave-cap')!;

    expect(cap.getAttribute('style')).toContain('--wave-color: red');
    expect(cap.getAttribute('style')).toContain('--wave-height: clamp(56px, 8vw, 110px)');
    expect(cap.getAttribute('aria-hidden')).toBe('true');
    expect(cap.classList.contains('wave-cap-top')).toBe(true);
    expect(cap.classList.contains('wave-cap-overlap')).toBe(false);
  });

  test('applies position and overlap modifiers', async () => {
    const doc = await render(WaveCap, {
      props: { color: 'red', position: 'bottom', overlap: true, height: '40px' },
    });
    const cap = doc.querySelector('.wave-cap')!;

    expect(cap.classList.contains('wave-cap-bottom')).toBe(true);
    expect(cap.classList.contains('wave-cap-overlap')).toBe(true);
    expect(cap.getAttribute('style')).toContain('--wave-height: 40px');
  });
});

describe('WaveSeam', () => {
  test('passes both colors through CSS variables', async () => {
    const doc = await render(WaveSeam, { props: { topColor: 'red', bottomColor: 'blue' } });
    const seam = doc.querySelector('.wave-seam')!;

    expect(seam.getAttribute('style')).toContain('--top-color: red');
    expect(seam.getAttribute('style')).toContain('--bottom-color: blue');
    expect(seam.querySelectorAll('path')).toHaveLength(2);
  });
});
