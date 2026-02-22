import { describe, it, expect } from 'vitest';
import {
  validateConfig,
  getDefaultConfig,
  mergeDefaults,
} from '../src/utils/validator';

describe('validateConfig', () => {
  it('returns invalid for non-object input', () => {
    expect(validateConfig(null).valid).toBe(false);
    expect(validateConfig(undefined).valid).toBe(false);
    expect(validateConfig('string').valid).toBe(false);
    expect(validateConfig(42).valid).toBe(false);
  });

  it('returns invalid for wrong card_type', () => {
    const result = validateConfig({
      card_type: 'WrongType',
      content_source: 'inline',
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    const codes = result.errors!.map((e) => e.code);
    expect(codes).toContain('INVALID_CARD_TYPE');
  });

  it('returns invalid for missing content_source', () => {
    const result = validateConfig({
      card_type: 'RichTextCard',
    });
    expect(result.valid).toBe(false);
    const codes = result.errors!.map((e) => e.code);
    expect(codes).toContain('INVALID_CONTENT_SOURCE');
  });

  it('returns invalid when file mode missing content_file', () => {
    const result = validateConfig({
      card_type: 'RichTextCard',
      content_source: 'file',
    });
    expect(result.valid).toBe(false);
    const codes = result.errors!.map((e) => e.code);
    expect(codes).toContain('MISSING_CONTENT_FILE');
  });

  it('returns valid for correct config', () => {
    const result = validateConfig({
      card_type: 'RichTextCard',
      content_source: 'inline',
      content_text: '<p>Hello</p>',
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it('validates layout object', () => {
    const result = validateConfig({
      card_type: 'RichTextCard',
      content_source: 'inline',
      layout: 'not-an-object',
    });
    expect(result.valid).toBe(false);
    const codes = result.errors!.map((e) => e.code);
    expect(codes).toContain('INVALID_LAYOUT');
  });

  it('validates height_mode values', () => {
    const result = validateConfig({
      card_type: 'RichTextCard',
      content_source: 'inline',
      layout: { height_mode: 'stretch' },
    });
    expect(result.valid).toBe(false);
    const codes = result.errors!.map((e) => e.code);
    expect(codes).toContain('INVALID_HEIGHT_MODE');
  });

  it('validates fixed_height is positive number', () => {
    const result = validateConfig({
      card_type: 'RichTextCard',
      content_source: 'inline',
      layout: { fixed_height: -10 },
    });
    expect(result.valid).toBe(false);
    const codes = result.errors!.map((e) => e.code);
    expect(codes).toContain('INVALID_FIXED_HEIGHT');
  });
});

describe('getDefaultConfig', () => {
  it('returns default config', () => {
    const defaults = getDefaultConfig();
    expect(defaults).toBeDefined();
    expect(defaults.layout).toEqual({ height_mode: 'auto' });
    expect(defaults.toolbar).toBe(false);
    expect(defaults.read_only).toBe(true);
  });
});

describe('mergeDefaults', () => {
  it('merges user config with defaults', () => {
    const merged = mergeDefaults({
      content_source: 'inline',
      content_text: '<p>Custom</p>',
      toolbar: true,
    });
    expect(merged.card_type).toBe('RichTextCard');
    expect(merged.content_source).toBe('inline');
    expect(merged.toolbar).toBe(true);
    expect(merged.layout).toEqual({ height_mode: 'auto' });
    expect(merged.read_only).toBe(true);
  });
});