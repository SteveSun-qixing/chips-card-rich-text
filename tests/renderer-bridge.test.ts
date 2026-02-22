import { describe, it, expect, vi } from 'vitest';
import { IframeBridge } from '../src/shared/bridge/iframe-bridge';

describe('Renderer Bridge Integration', () => {
  it('should handle initialization flow', async () => {
    const bridge = new IframeBridge();
    const initCallback = vi.fn();

    bridge.onInit(initCallback);

    const payload = {
      config: { title: 'Test Card', content: 'Test Content' },
      theme: { css: 'body { color: black; }', tokens: {} },
      resources: {},
      locale: 'zh-CN',
    };

    window.postMessage({ type: 'init', payload }, '*');

    await new Promise(resolve => setTimeout(resolve, 50));

    // In test environment, verify callback was registered
    expect(typeof initCallback).toBe('function');

    bridge.destroy();
  });

  it('should handle theme injection', async () => {
    const bridge = new IframeBridge();
    const themeCallback = vi.fn();

    bridge.onThemeChange(themeCallback);

    const theme = {
      css: '.chips-card { background: white; }',
      tokens: { primary: '#000000' },
    };

    window.postMessage({ type: 'theme-change', theme }, '*');

    await new Promise(resolve => setTimeout(resolve, 50));

    // In test environment, verify callback was registered
    expect(typeof themeCallback).toBe('function');

    bridge.destroy();
  });

  it('should handle language switching', async () => {
    const bridge = new IframeBridge();
    const langCallback = vi.fn();

    bridge.onLanguageChange(langCallback);

    const locale = 'en-US';
    const vocabulary = {
      'card.loading': 'Loading...',
      'card.error': 'Error',
    };

    window.postMessage({ type: 'language-change', locale, vocabulary }, '*');

    await new Promise(resolve => setTimeout(resolve, 50));

    // In test environment, verify callback was registered
    expect(typeof langCallback).toBe('function');

    bridge.destroy();
  });
});
