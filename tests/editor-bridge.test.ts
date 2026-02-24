import { describe, it, expect, vi } from 'vitest';
import { IframeBridge } from '../src/shared/bridge/iframe-bridge';

const HOST_ORIGIN = window.location.origin;

function dispatchHostInit(): void {
  window.dispatchEvent(
    new MessageEvent('message', {
      origin: HOST_ORIGIN,
      source: window.parent,
      data: {
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
      },
    })
  );
}

describe('Editor Bridge Integration', () => {
  it('should notify config update', () => {
    const bridge = new IframeBridge();
    const postMessageSpy = vi.spyOn(window.parent, 'postMessage');
    dispatchHostInit();

    const config = {
      title: 'Updated Title',
      content: 'Updated Content',
    };

    bridge.notifyConfigUpdate(config);

    expect(postMessageSpy).toHaveBeenCalledWith(
      {
        type: 'config-update',
        pluginId: 'chips-official.sample-card',
        sessionNonce: 'session-1',
        config,
      },
      HOST_ORIGIN
    );

    bridge.destroy();
  });

  it('should notify cancel operation', () => {
    const bridge = new IframeBridge();
    const postMessageSpy = vi.spyOn(window.parent, 'postMessage');
    dispatchHostInit();

    bridge.notifyCancel();

    expect(postMessageSpy).toHaveBeenCalledWith(
      {
        type: 'editor-cancel',
        pluginId: 'chips-official.sample-card',
        sessionNonce: 'session-1',
      },
      HOST_ORIGIN
    );

    bridge.destroy();
  });
});
