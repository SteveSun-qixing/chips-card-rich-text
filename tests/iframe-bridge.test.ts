import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IframeBridge } from '../src/shared/bridge/iframe-bridge';

const HOST_ORIGIN = window.location.origin;

function dispatchHostMessage(data: unknown, origin = HOST_ORIGIN): void {
  window.dispatchEvent(
    new MessageEvent('message', {
      data,
      origin,
      source: window.parent,
    })
  );
}

function createInitMessage(): {
  type: 'init';
  payload: {
      bridge: { pluginId: string; sessionNonce: string; trustedOrigin: string };
    config: Record<string, unknown>;
    theme: { css: string; tokens: Record<string, string> };
    resources: Record<string, string>;
    locale: string;
    vocabulary: Record<string, string>;
    vocabularyVersion: string;
    i18n: {
      locale: string;
      version: string;
      payload: { mode: 'full'; vocabulary: Record<string, string> };
    };
  };
} {
  return {
    type: 'init',
    payload: {
      bridge: {
        pluginId: 'chips-official.rich-text-card',
        sessionNonce: 'session-1',
        trustedOrigin: HOST_ORIGIN,
      },
      config: {},
      theme: { css: '', tokens: {} },
      resources: {},
      locale: 'en-US',
      vocabulary: { 'toolbar.bold': 'Bold' },
      vocabularyVersion: 'v1',
      i18n: {
        locale: 'en-US',
        version: 'v1',
        payload: {
          mode: 'full',
          vocabulary: { 'toolbar.bold': 'Bold' },
        },
      },
    },
  };
}

describe('IframeBridge', () => {
  let bridge: IframeBridge;

  beforeEach(() => {
    bridge = new IframeBridge();
  });

  afterEach(() => {
    bridge.destroy();
    vi.restoreAllMocks();
  });

  it('rejects invoke before init handshake', async () => {
    await expect(bridge.invoke('resource', 'fetch')).rejects.toMatchObject({
      code: 'BRIDGE_NOT_READY',
    });
  });

  it('sends bridge request with plugin identity and nonce after init', async () => {
    const postMessageSpy = vi.spyOn(window.parent, 'postMessage');

    dispatchHostMessage(createInitMessage());
    const requestPromise = bridge.invoke('resource', 'fetch', { uri: 'chips://card/demo' });

    expect(postMessageSpy).toHaveBeenCalledTimes(1);
    const [requestMessage, targetOrigin] = postMessageSpy.mock.calls[0] ?? [];
    expect(targetOrigin).toBe(HOST_ORIGIN);
    expect(requestMessage).toMatchObject({
      type: 'bridge-request',
      pluginId: 'chips-official.rich-text-card',
      sessionNonce: 'session-1',
      namespace: 'resource',
      action: 'fetch',
    });
    expect(typeof (requestMessage as { requestId: unknown }).requestId).toBe('string');
    expect(typeof (requestMessage as { requestNonce: unknown }).requestNonce).toBe('string');

    const requestId = (requestMessage as { requestId: string }).requestId;
    const requestNonce = (requestMessage as { requestNonce: string }).requestNonce;
    dispatchHostMessage({
      type: 'bridge-response',
      pluginId: 'chips-official.rich-text-card',
      sessionNonce: 'session-1',
      requestId,
      requestNonce,
      result: { content: 'ok' },
    });

    await expect(requestPromise).resolves.toEqual({ content: 'ok' });
  });

  it('applies language envelope from language-change message', async () => {
    const callback = vi.fn();
    bridge.onLanguageChange(callback);

    dispatchHostMessage(createInitMessage());
    dispatchHostMessage({
      type: 'language-change',
      pluginId: 'chips-official.rich-text-card',
      sessionNonce: 'session-1',
      i18n: {
        locale: 'ja-JP',
        version: 'v2',
        payload: {
          mode: 'full',
          vocabulary: {
            'dialog.confirm': '確定',
          },
        },
      },
    });

    expect(callback).toHaveBeenCalledWith('ja-JP', {
      'dialog.confirm': '確定',
    });
  });

  it('notifies host with security envelope after init', () => {
    const postMessageSpy = vi.spyOn(window.parent, 'postMessage');

    dispatchHostMessage(createInitMessage());
    bridge.notifyConfigUpdate({ content_text: 'next' });

    expect(postMessageSpy).toHaveBeenCalledWith(
      {
        type: 'config-update',
        pluginId: 'chips-official.rich-text-card',
        sessionNonce: 'session-1',
        config: { content_text: 'next' },
      },
      HOST_ORIGIN
    );
  });

  it('supports persist flag in config update message', () => {
    const postMessageSpy = vi.spyOn(window.parent, 'postMessage');

    dispatchHostMessage(createInitMessage());
    bridge.notifyConfigUpdateWithOptions({ content_text: 'next' }, { persist: true });

    expect(postMessageSpy).toHaveBeenCalledWith(
      {
        type: 'config-update',
        pluginId: 'chips-official.rich-text-card',
        sessionNonce: 'session-1',
        config: { content_text: 'next' },
        persist: true,
      },
      HOST_ORIGIN
    );
  });
});
