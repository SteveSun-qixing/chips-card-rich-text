import { describe, expect, it } from 'vitest';
import viteConfig from '../vite.config';

describe('Vite config', () => {
  it('uses relative base path for plugin deployment', () => {
    const base =
      typeof viteConfig === 'object' && viteConfig !== null && 'base' in viteConfig
        ? viteConfig.base
        : undefined;

    expect(base).toBe('./');
  });
});
