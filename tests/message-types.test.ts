import { describe, it, expect } from 'vitest';
import type {
  BridgeRequestMessage,
  BridgeResponseMessage,
  InitMessage,
  ConfigUpdateMessage,
  ResizeMessage,
  ThemeChangeMessage,
  LanguageChangeMessage,
} from '../src/shared/bridge/message-types';

describe('Message Types', () => {
  it('should validate BridgeRequestMessage structure', () => {
    const message: BridgeRequestMessage = {
      type: 'bridge-request',
      requestId: 'test-id',
      namespace: 'test',
      action: 'action',
      params: { key: 'value' },
    };

    expect(message.type).toBe('bridge-request');
    expect(message.requestId).toBe('test-id');
    expect(message.namespace).toBe('test');
    expect(message.action).toBe('action');
  });

  it('should validate BridgeResponseMessage structure', () => {
    const successMessage: BridgeResponseMessage = {
      type: 'bridge-response',
      requestId: 'test-id',
      result: { data: 'test' },
    };

    expect(successMessage.type).toBe('bridge-response');
    expect(successMessage.result).toEqual({ data: 'test' });

    const errorMessage: BridgeResponseMessage = {
      type: 'bridge-response',
      requestId: 'test-id',
      error: {
        code: 'ERROR_CODE',
        message: 'Error message',
      },
    };

    expect(errorMessage.error?.code).toBe('ERROR_CODE');
  });

  it('should validate InitMessage structure', () => {
    const message: InitMessage = {
      type: 'init',
      payload: {
        config: { title: 'Test' },
        theme: { css: '', tokens: {} },
        resources: {},
        locale: 'zh-CN',
      },
    };

    expect(message.type).toBe('init');
    expect(message.payload.locale).toBe('zh-CN');
  });

  it('should validate ConfigUpdateMessage structure', () => {
    const message: ConfigUpdateMessage = {
      type: 'config-update',
      config: { title: 'Updated' },
    };

    expect(message.type).toBe('config-update');
    expect(message.config).toEqual({ title: 'Updated' });
  });

  it('should validate ResizeMessage structure', () => {
    const message: ResizeMessage = {
      type: 'resize',
      width: 800,
      height: 600,
    };

    expect(message.type).toBe('resize');
    expect(message.width).toBe(800);
    expect(message.height).toBe(600);
  });

  it('should validate ThemeChangeMessage structure', () => {
    const message: ThemeChangeMessage = {
      type: 'theme-change',
      theme: {
        css: 'body { color: red; }',
        tokens: { primary: '#ff0000' },
      },
    };

    expect(message.type).toBe('theme-change');
    expect(message.theme.css).toContain('color: red');
  });

  it('should validate LanguageChangeMessage structure', () => {
    const message: LanguageChangeMessage = {
      type: 'language-change',
      locale: 'en-US',
      vocabulary: { 'test.key': 'Test Value' },
    };

    expect(message.type).toBe('language-change');
    expect(message.locale).toBe('en-US');
    expect(message.vocabulary['test.key']).toBe('Test Value');
  });
});
