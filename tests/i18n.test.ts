import { describe, it, expect, beforeEach } from 'vitest';
import {
  setVocabulary,
  setLocale,
  getLocale,
  t,
  hasKey,
  getKeys,
} from '../src/utils/i18n';

describe('i18n Utility', () => {
  beforeEach(() => {
    setVocabulary({});
    setLocale('zh-CN');
  });

  it('setVocabulary sets vocabulary correctly', () => {
    const vocab = { 'toolbar.bold': '粗体', 'toolbar.italic': '斜体' };
    setVocabulary(vocab);

    expect(t('toolbar.bold')).toBe('粗体');
    expect(t('toolbar.italic')).toBe('斜体');
  });

  it('setLocale sets locale correctly', () => {
    setLocale('en-US');
    expect(getLocale()).toBe('en-US');
  });

  it('getLocale returns current locale', () => {
    expect(getLocale()).toBe('zh-CN');
    setLocale('ja-JP');
    expect(getLocale()).toBe('ja-JP');
  });

  it('t() returns translated text from vocabulary', () => {
    setVocabulary({ 'card.loading': '加载中...' });
    expect(t('card.loading')).toBe('加载中...');
  });

  it('t() returns key when translation missing', () => {
    setVocabulary({});
    expect(t('missing.key')).toBe('missing.key');
  });

  it('t() handles variable substitution with {varName} syntax', () => {
    setVocabulary({ 'msg.hello': 'Hello, {name}!' });
    expect(t('msg.hello', { name: 'World' })).toBe('Hello, World!');
  });

  it('t() handles multiple variables', () => {
    setVocabulary({ 'msg.info': '{user} has {count} items' });
    expect(t('msg.info', { user: 'Alice', count: 5 })).toBe(
      'Alice has 5 items',
    );
  });

  it('hasKey returns true for existing keys', () => {
    setVocabulary({ 'toolbar.bold': '粗体' });
    expect(hasKey('toolbar.bold')).toBe(true);
  });

  it('hasKey returns false for missing keys', () => {
    setVocabulary({ 'toolbar.bold': '粗体' });
    expect(hasKey('toolbar.underline')).toBe(false);
  });

  it('getKeys returns all vocabulary keys', () => {
    setVocabulary({
      'toolbar.bold': '粗体',
      'toolbar.italic': '斜体',
      'card.loading': '加载中',
    });
    const keys = getKeys();
    expect(keys).toHaveLength(3);
    expect(keys).toContain('toolbar.bold');
    expect(keys).toContain('toolbar.italic');
    expect(keys).toContain('card.loading');
  });
});
