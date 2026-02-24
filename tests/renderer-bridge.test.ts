import { describe, it, expect, vi } from 'vitest';
import { IframeBridge } from '../src/shared/bridge/iframe-bridge';

const HOST_ORIGIN = window.location.origin;

function dispatchHostMessage(data: unknown): void {
  window.dispatchEvent(
    new MessageEvent('message', {
      origin: HOST_ORIGIN,
      source: window.parent,
      data,
    })
  );
}

describe('Renderer Bridge Integration', () => {
  it('should handle initialization flow', async () => {
    const bridge = new IframeBridge();
    const initCallback = vi.fn();
    const languageCallback = vi.fn();

    bridge.onInit(initCallback);
    bridge.onLanguageChange(languageCallback);

    const payload = {
      bridge: {
        pluginId: 'chips-official.sample-card',
        sessionNonce: 'session-1',
        trustedOrigin: HOST_ORIGIN,
      },
      config: { title: 'Test Card', content: 'Test Content' },
      theme: { css: 'body { color: black; }', tokens: {} },
      resources: {},
      locale: 'zh-CN',
      vocabulary: {
        'card.loading': 'Loading...',
      },
      vocabularyVersion: 'v1',
      i18n: {
        locale: 'zh-CN',
        version: 'v1',
        payload: {
          mode: 'full',
          vocabulary: {
            'card.loading': 'Loading...',
          },
        },
      },
    };

    dispatchHostMessage({ type: 'init', payload });
    expect(initCallback).toHaveBeenCalledTimes(1);
    expect(languageCallback).toHaveBeenCalledWith('zh-CN', {
      'card.loading': 'Loading...',
    });

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

    dispatchHostMessage({
      type: 'init',
      payload: {
        bridge: {
          pluginId: 'chips-official.sample-card',
          sessionNonce: 'session-1',
          trustedOrigin: HOST_ORIGIN,
        },
        config: {},
        theme: { css: '', tokens: {} },
        resources: {},
        locale: 'en-US',
      },
    });
    dispatchHostMessage({
      type: 'theme-change',
      pluginId: 'chips-official.sample-card',
      sessionNonce: 'session-1',
      theme,
    });
    expect(themeCallback).toHaveBeenCalledWith({
      css: '.chips-card { background: white; }',
      tokens: { primary: '#000000' },
    });

    bridge.destroy();
  });

  it('should handle language switching', async () => {
    const bridge = new IframeBridge();
    const langCallback = vi.fn();

    bridge.onLanguageChange(langCallback);

    dispatchHostMessage({
      type: 'init',
      payload: {
        bridge: {
          pluginId: 'chips-official.sample-card',
          sessionNonce: 'session-1',
          trustedOrigin: HOST_ORIGIN,
        },
        config: {},
        theme: { css: '', tokens: {} },
        resources: {},
        locale: 'en-US',
      },
    });
    dispatchHostMessage({
      type: 'language-change',
      pluginId: 'chips-official.sample-card',
      sessionNonce: 'session-1',
      i18n: {
        locale: 'en-US',
        version: 'v2',
        payload: {
          mode: 'full',
          vocabulary: {
            'card.loading': 'Loading...',
            'card.error': 'Error',
          },
        },
      },
    });

    expect(langCallback).toHaveBeenCalledWith('en-US', {
      'card.loading': 'Loading...',
      'card.error': 'Error',
    });

    bridge.destroy();
  });
});
