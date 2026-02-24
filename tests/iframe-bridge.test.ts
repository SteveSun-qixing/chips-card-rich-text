import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createCardRuntimeMessage } from '@chips/sdk/card-runtime';
import { IframeBridge } from '../src/shared/bridge/iframe-bridge';

const HOST_ORIGIN = window.location.origin;

function dispatchHostMessage(data: unknown, origin = HOST_ORIGIN): void {
  window.dispatchEvent(
    new MessageEvent('message', {
      data,
      origin,
      source: window.parent,
    }),
  );
}

function createInitMessage() {
  return createCardRuntimeMessage('init', {
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
        mode: 'full' as const,
        vocabulary: { 'toolbar.bold': 'Bold' },
      },
    },
  });
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

  it('sends ready handshake on bootstrap', async () => {
    bridge.destroy();
    const postMessageSpy = vi.spyOn(window.parent, 'postMessage');
    bridge = new IframeBridge();
    await Promise.resolve();

    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        protocol: 'chips-card-runtime',
        type: 'ready',
      }),
      '*',
    );
  });

  it('sends bridge request envelope after init', async () => {
    const postMessageSpy = vi.spyOn(window.parent, 'postMessage');
    dispatchHostMessage(createInitMessage());
    postMessageSpy.mockClear();

    const requestPromise = bridge.invoke('resource', 'fetch', { uri: 'chips://card/demo' });

    const requestCall = postMessageSpy.mock.calls.find((entry) => (entry[0] as { type?: string }).type === 'bridge-request');
    expect(requestCall).toBeDefined();

    const [requestMessage, targetOrigin] = requestCall as [Record<string, unknown>, string];
    expect(targetOrigin).toBe(HOST_ORIGIN);
    expect(requestMessage.protocol).toBe('chips-card-runtime');
    expect(requestMessage.type).toBe('bridge-request');

    const payload = requestMessage.payload as Record<string, unknown>;
    expect(payload.namespace).toBe('resource');
    expect(payload.action).toBe('fetch');
    expect(typeof payload.requestId).toBe('string');
    expect(typeof payload.requestNonce).toBe('string');

    dispatchHostMessage(
      createCardRuntimeMessage('bridge-response', {
        requestId: payload.requestId as string,
        requestNonce: payload.requestNonce as string,
        success: true,
        data: { content: 'ok' },
      }),
    );

    await expect(requestPromise).resolves.toEqual({ content: 'ok' });
  });

  it('applies language envelope from language-change message', async () => {
    const callback = vi.fn();
    bridge.onLanguageChange(callback);

    dispatchHostMessage(createInitMessage());
    dispatchHostMessage(
      createCardRuntimeMessage('language-change', {
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
      }),
    );

    expect(callback).toHaveBeenCalledWith('ja-JP', {
      'dialog.confirm': '確定',
    });
  });

  it('notifies host with runtime envelope after init', () => {
    const postMessageSpy = vi.spyOn(window.parent, 'postMessage');

    dispatchHostMessage(createInitMessage());
    postMessageSpy.mockClear();

    bridge.notifyConfigUpdate({ content_text: 'next' });

    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        protocol: 'chips-card-runtime',
        type: 'config-update',
        payload: {
          config: { content_text: 'next' },
        },
      }),
      HOST_ORIGIN,
    );
  });

  it('supports persist flag in config update message', () => {
    const postMessageSpy = vi.spyOn(window.parent, 'postMessage');

    dispatchHostMessage(createInitMessage());
    postMessageSpy.mockClear();

    bridge.notifyConfigUpdateWithOptions({ content_text: 'next' }, { persist: true });

    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        protocol: 'chips-card-runtime',
        type: 'config-update',
        payload: {
          config: { content_text: 'next' },
          persist: true,
        },
      }),
      HOST_ORIGIN,
    );
  });
});
