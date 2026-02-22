import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sanitizeHtml, isSafeHtml } from '../src/utils/sanitizer';

// happy-dom executes script content during DOMParser.parseFromString,
// so we stub common globals that might appear in test script payloads.
beforeEach(() => {
  vi.stubGlobal('alert', vi.fn());
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('sanitizeHtml', () => {
  it('returns empty string for empty input', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(null as unknown as string)).toBe('');
    expect(sanitizeHtml(undefined as unknown as string)).toBe('');
  });

  it('removes script tags', () => {
    const html = '<p>Hello</p><script>alert("xss")</script>';
    const result = sanitizeHtml(html);
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
    expect(result).toContain('<p>Hello</p>');
  });

  it('removes style tags', () => {
    const html = '<p>Text</p><style>body{display:none}</style>';
    const result = sanitizeHtml(html);
    expect(result).not.toContain('<style');
    expect(result).not.toContain('display:none');
  });

  it('removes iframe tags', () => {
    const html = '<p>Safe</p><iframe src="http://evil.com"></iframe>';
    const result = sanitizeHtml(html);
    expect(result).not.toContain('<iframe');
    expect(result).not.toContain('evil.com');
  });

  it('preserves allowed tags (p, h1, strong, etc.)', () => {
    const html =
      '<p>Paragraph</p><h1>Title</h1><strong>Bold</strong><em>Italic</em>';
    const result = sanitizeHtml(html);
    expect(result).toContain('<p>');
    expect(result).toContain('<h1>');
    expect(result).toContain('<strong>');
    expect(result).toContain('<em>');
  });

  it('removes event handlers (onclick, onload)', () => {
    const html = '<p onclick="alert(1)">Click</p><img onload="hack()" src="x.png">';
    const result = sanitizeHtml(html);
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('onload');
    expect(result).not.toContain('alert');
    expect(result).not.toContain('hack');
  });

  it('removes javascript: protocol from href', () => {
    const html = '<a href="javascript:alert(1)">Link</a>';
    const result = sanitizeHtml(html);
    expect(result).not.toContain('javascript:');
  });

  it('preserves safe href attributes', () => {
    const html = '<a href="https://example.com">Link</a>';
    const result = sanitizeHtml(html);
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('>Link</a>');
  });

  it('filters unsafe style properties', () => {
    const html = '<p style="position: fixed; top: 0">Text</p>';
    const result = sanitizeHtml(html);
    expect(result).not.toContain('position');
  });

  it('preserves allowed style properties (color, font-size)', () => {
    const html = '<p style="color: red; font-size: 16px">Styled</p>';
    const result = sanitizeHtml(html);
    expect(result).toContain('color: red');
    expect(result).toContain('font-size: 16px');
  });
});

describe('isSafeHtml', () => {
  it('returns true for safe HTML', () => {
    const html = '<p>Hello world</p>';
    expect(isSafeHtml(html)).toBe(true);
  });

  it('returns false for HTML with script tags', () => {
    const html = '<p>Hello</p><script>alert("xss")</script>';
    expect(isSafeHtml(html)).toBe(false);
  });
});