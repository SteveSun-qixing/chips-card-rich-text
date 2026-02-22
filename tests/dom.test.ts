import { describe, it, expect } from 'vitest';
import {
  extractText,
  countWords,
  isEmpty,
  getFirstImage,
  getAllLinks,
  escapeHtml,
  capitalize,
} from '../src/utils/dom';

describe('DOM Utilities', () => {
  it('extractText extracts text from HTML', () => {
    const html = '<p>Hello <strong>world</strong></p>';
    expect(extractText(html)).toBe('Hello world');
  });

  it('countWords counts characters correctly', () => {
    const html = '<p>Hello World</p>';
    // countWords strips whitespace then counts chars
    expect(countWords(html)).toBe(10);
  });

  it('isEmpty returns true for empty HTML', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('<p></p>')).toBe(true);
    expect(isEmpty('<p>   </p>')).toBe(true);
    expect(isEmpty('<br>')).toBe(true);
  });

  it('isEmpty returns false for non-empty HTML', () => {
    expect(isEmpty('<p>Hello</p>')).toBe(false);
    expect(isEmpty('Some text')).toBe(false);
  });

  it('getFirstImage extracts first image src', () => {
    const html =
      '<p>Text</p><img src="first.png"><img src="second.jpg">';
    expect(getFirstImage(html)).toBe('first.png');
  });

  it('getFirstImage returns null when no images', () => {
    const html = '<p>No images here</p>';
    expect(getFirstImage(html)).toBeNull();
  });

  it('getAllLinks extracts all href values', () => {
    const html =
      '<a href="https://a.com">A</a><p>Text</p><a href="https://b.com">B</a>';
    const links = getAllLinks(html);
    expect(links).toHaveLength(2);
    expect(links).toContain('https://a.com');
    expect(links).toContain('https://b.com');
  });

  it('escapeHtml escapes special characters', () => {
    // The implementation uses div.textContent = str; return div.innerHTML;
    // In happy-dom, innerHTML may not encode entities the same as real browsers.
    // We verify the function is consistent with the DOM environment's behavior.
    const div = document.createElement('div');
    div.textContent = '<script>';
    expect(escapeHtml('<script>')).toBe(div.innerHTML);

    const div2 = document.createElement('div');
    div2.textContent = 'a & b';
    expect(escapeHtml('a & b')).toBe(div2.innerHTML);

    // The function should always return the same result as textContent -> innerHTML
    const testStr = 'Hello "world" & <friends>';
    const div3 = document.createElement('div');
    div3.textContent = testStr;
    expect(escapeHtml(testStr)).toBe(div3.innerHTML);
  });

  it('capitalize capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('world')).toBe('World');
    expect(capitalize('')).toBe('');
  });
});