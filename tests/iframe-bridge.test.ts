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
        pluginId: 'chips-official.sample-card',
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

  it('sends bridge request with security envelope after init', async () => {
    const postMessageSpy = vi.spyOn(window.parent, 'postMessage');

    dispatchHostMessage(createInitMessage());
    const requestPromise = bridge.invoke('resource', 'fetch', { uri: 'chips://card/demo' });

    expect(postMessageSpy).toHaveBeenCalledTimes(1);
    const [requestMessage, targetOrigin] = postMessageSpy.mock.calls[0] ?? [];
    expect(targetOrigin).toBe(HOST_ORIGIN);
    expect(requestMessage).toMatchObject({
      type: 'bridge-request',
      pluginId: 'chips-official.sample-card',
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
      pluginId: 'chips-official.sample-card',
      sessionNonce: 'session-1',
      requestId,
      requestNonce,
      result: { content: 'ok' },
    });

    await expect(requestPromise).resolves.toEqual({ content: 'ok' });
  });

  it('should handle bridge request timeout', async () => {
    vi.useFakeTimers();
    dispatchHostMessage(createInitMessage());

    const requestPromise = bridge.invoke('test', 'action').catch(err => err);

    vi.advanceTimersByTime(31000);

    const result = await requestPromise;

    expect(result).toMatchObject({
      code: 'BRIDGE_TIMEOUT',
    });

    vi.useRealTimers();
  });

  it('processes trusted init and language envelope messages', () => {
    const callback = vi.fn();
    const languageCallback = vi.fn();

    bridge.onInit(callback);
    bridge.onLanguageChange(languageCallback);

    dispatchHostMessage(createInitMessage());
    dispatchHostMessage({
      type: 'language-change',
      pluginId: 'chips-official.sample-card',
      sessionNonce: 'session-1',
      i18n: {
        locale: 'ja-JP',
        version: 'v2',
        payload: {
          mode: 'full',
          vocabulary: {
            'dialog.confirm': 'Confirm',
          },
        },
      },
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(languageCallback).toHaveBeenCalledWith('ja-JP', {
      'dialog.confirm': 'Confirm',
    });
  });

  it('ignores messages from untrusted origin or session', async () => {
    const callback = vi.fn();
    bridge.onThemeChange(callback);
    dispatchHostMessage(createInitMessage());

    dispatchHostMessage(
      {
        type: 'theme-change',
        pluginId: 'chips-official.sample-card',
        sessionNonce: 'session-1',
        theme: { css: 'body { color: red; }', tokens: {} },
      },
      'https://untrusted.example'
    );

    dispatchHostMessage({
      type: 'theme-change',
      pluginId: 'chips-official.sample-card',
      sessionNonce: 'session-2',
      theme: { css: 'body { color: blue; }', tokens: {} },
    });

    dispatchHostMessage({
      type: 'theme-change',
      pluginId: 'chips-official.sample-card',
      sessionNonce: 'session-1',
      theme: { css: 'body { color: green; }', tokens: {} },
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({ css: 'body { color: green; }', tokens: {} });
  });

  it('notifies config update with security envelope', () => {
    const postMessageSpy = vi.spyOn(window.parent, 'postMessage');
    dispatchHostMessage(createInitMessage());

    const config = { title: 'Updated Title' };
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
  });

  it('notifies resize and cancel with security envelope', () => {
    const postMessageSpy = vi.spyOn(window.parent, 'postMessage');
    dispatchHostMessage(createInitMessage());

    bridge.notifyResize(800, 600);
    expect(postMessageSpy).toHaveBeenCalledWith(
      {
        type: 'resize',
        pluginId: 'chips-official.sample-card',
        sessionNonce: 'session-1',
        width: 800,
        height: 600,
      },
      HOST_ORIGIN
    );

    bridge.notifyCancel();
    expect(postMessageSpy).toHaveBeenCalledWith(
      {
        type: 'editor-cancel',
        pluginId: 'chips-official.sample-card',
        sessionNonce: 'session-1',
      },
      HOST_ORIGIN
    );
  });

  it('should clean up on destroy', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    bridge.destroy();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
  });
});
