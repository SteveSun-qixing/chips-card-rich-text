import { describe, it, expect } from 'vitest';
import { createCardRuntimeMessage } from '@chips/sdk/card-runtime';
import type {
  BridgeRequestMessage,
  BridgeResponseMessage,
  InitMessage,
  ConfigUpdateMessage,
  ResizeMessage,
  ThemeChangeMessage,
  LanguageChangeMessage,
  ReadyMessage,
} from '../src/shared/bridge/message-types';

describe('Message Types', () => {
  it('validates ReadyMessage structure', () => {
    const message: ReadyMessage = createCardRuntimeMessage('ready', {
      mode: 'renderer',
      protocolVersion: '1.0.0',
    });

    expect(message.type).toBe('ready');
    expect(message.protocol).toBe('chips-card-runtime');
  });

  it('validates BridgeRequestMessage structure', () => {
    const message: BridgeRequestMessage = createCardRuntimeMessage('bridge-request', {
      requestNonce: 'request-nonce-1',
      requestId: 'test-id',
      namespace: 'test',
      action: 'action',
      params: { key: 'value' },
    });

    expect(message.type).toBe('bridge-request');
    expect(message.payload.requestId).toBe('test-id');
    expect(message.payload.namespace).toBe('test');
    expect(message.payload.action).toBe('action');
  });

  it('validates BridgeResponseMessage structure', () => {
    const successMessage: BridgeResponseMessage = createCardRuntimeMessage('bridge-response', {
      requestId: 'test-id',
      success: true,
      data: { data: 'test' },
    });

    expect(successMessage.type).toBe('bridge-response');
    expect(successMessage.payload.data).toEqual({ data: 'test' });

    const errorMessage: BridgeResponseMessage = createCardRuntimeMessage('bridge-response', {
      requestId: 'test-id',
      success: false,
      error: {
        code: 'ERROR_CODE',
        message: 'Error message',
      },
    });

    expect(errorMessage.payload.error?.code).toBe('ERROR_CODE');
  });

  it('validates InitMessage structure', () => {
    const message: InitMessage = createCardRuntimeMessage('init', {
      config: { title: 'Test' },
      bridge: {
        pluginId: 'chips-official.rich-text-card',
        sessionNonce: 'session-1',
      },
      theme: { css: '', tokens: {} },
      resources: {},
      locale: 'zh-CN',
    });

    expect(message.type).toBe('init');
    expect(message.payload.locale).toBe('zh-CN');
    expect(message.payload.bridge?.pluginId).toBe('chips-official.rich-text-card');
  });

  it('validates ConfigUpdateMessage structure', () => {
    const message: ConfigUpdateMessage = createCardRuntimeMessage('config-update', {
      config: { title: 'Updated' },
      persist: true,
    });

    expect(message.type).toBe('config-update');
    expect(message.payload.config).toEqual({ title: 'Updated' });
    expect(message.payload.persist).toBe(true);
  });

  it('validates ResizeMessage structure', () => {
    const message: ResizeMessage = createCardRuntimeMessage('resize', {
      width: 800,
      height: 600,
    });

    expect(message.type).toBe('resize');
    expect(message.payload.width).toBe(800);
    expect(message.payload.height).toBe(600);
  });

  it('validates ThemeChangeMessage structure', () => {
    const message: ThemeChangeMessage = createCardRuntimeMessage('theme-change', {
      theme: {
        css: 'body { color: red; }',
        tokens: { primary: '#ff0000' },
      },
    });

    expect(message.type).toBe('theme-change');
    expect(message.payload.theme.css).toContain('color: red');
  });

  it('validates LanguageChangeMessage structure', () => {
    const message: LanguageChangeMessage = createCardRuntimeMessage('language-change', {
      locale: 'en-US',
      vocabulary: { 'test.key': 'Test Value' },
      vocabularyVersion: 'v2',
    });

    expect(message.type).toBe('language-change');
    expect(message.payload.locale).toBe('en-US');
    expect(message.payload.vocabulary?.['test.key']).toBe('Test Value');
  });
});
