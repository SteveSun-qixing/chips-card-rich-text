import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Renderer from '../src/renderer/Renderer.vue';

// Capture bridge callbacks during module execution
let capturedOnInit: Function | undefined;
let capturedOnThemeChange: Function | undefined;
let capturedOnLanguageChange: Function | undefined;
const mockInvoke = vi.fn();
const mockDestroy = vi.fn();

vi.mock('../src/shared/bridge/iframe-bridge', () => {
  return {
    IframeBridge: vi.fn().mockImplementation(() => ({
      onInit: vi.fn((cb: Function) => { capturedOnInit = cb; }),
      onThemeChange: vi.fn((cb: Function) => { capturedOnThemeChange = cb; }),
      onLanguageChange: vi.fn((cb: Function) => { capturedOnLanguageChange = cb; }),
      invoke: mockInvoke,
      destroy: mockDestroy,
      notifyResize: vi.fn(),
    })),
  };
});

vi.mock('../src/utils/i18n', () => ({
  t: (key: string) => key,
  setVocabulary: vi.fn(),
  setLocale: vi.fn(),
}));

vi.mock('../src/utils/sanitizer', () => ({
  sanitizeHtml: (html: string) => html,
}));

describe('Renderer Bridge Integration', () => {
  let postMessageSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    capturedOnInit = undefined;
    capturedOnThemeChange = undefined;
    capturedOnLanguageChange = undefined;
    vi.clearAllMocks();
    postMessageSpy = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
  });

  it('should register bridge onInit callback', () => {
    const wrapper = mount(Renderer);
    expect(capturedOnInit).toBeDefined();
    expect(typeof capturedOnInit).toBe('function');
    wrapper.unmount();
  });

  it('should register bridge onThemeChange callback', () => {
    const wrapper = mount(Renderer);
    expect(capturedOnThemeChange).toBeDefined();
    expect(typeof capturedOnThemeChange).toBe('function');
    wrapper.unmount();
  });

  it('should register bridge onLanguageChange callback', () => {
    const wrapper = mount(Renderer);
    expect(capturedOnLanguageChange).toBeDefined();
    expect(typeof capturedOnLanguageChange).toBe('function');
    wrapper.unmount();
  });

  it('should use bridge invoke for resource fetch in onInit', async () => {
    mockInvoke.mockResolvedValue({ data: '<p>fetched</p>' });

    const wrapper = mount(Renderer);

    // Simulate host sending init with file-based content
    await capturedOnInit!({
      config: {
        card_type: 'RichTextCard',
        content_source: 'file',
        content_file: 'content.html',
      },
      theme: { css: '', tokens: {} },
      resources: { cardId: 'card-123' },
      locale: 'en-US',
    });

    expect(mockInvoke).toHaveBeenCalledWith('resource', 'fetch', {
      identifier: 'chips://card/card-123/content.html',
      responseType: 'text',
      useCache: true,
    });

    wrapper.unmount();
  });

  it('should call bridge destroy on unmount', () => {
    const wrapper = mount(Renderer);
    mockDestroy.mockClear();

    wrapper.unmount();

    expect(mockDestroy).toHaveBeenCalledTimes(1);
  });
});
