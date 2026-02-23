import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Editor from '../src/editor/Editor.vue';

let capturedOnInit: Function | undefined;
let capturedOnThemeChange: Function | undefined;
let capturedOnLanguageChange: Function | undefined;
const mockNotifyConfigUpdate = vi.fn();
const mockNotifyConfigUpdateWithOptions = vi.fn();
const mockNotifyCancel = vi.fn();
const mockDestroy = vi.fn();

vi.mock('../src/shared/bridge/iframe-bridge', () => {
  return {
    IframeBridge: vi.fn().mockImplementation(() => ({
      onInit: vi.fn((cb: Function) => { capturedOnInit = cb; }),
      onThemeChange: vi.fn((cb: Function) => { capturedOnThemeChange = cb; }),
      onLanguageChange: vi.fn((cb: Function) => { capturedOnLanguageChange = cb; }),
      invoke: vi.fn(),
      destroy: mockDestroy,
      notifyConfigUpdate: mockNotifyConfigUpdate,
      notifyConfigUpdateWithOptions: mockNotifyConfigUpdateWithOptions,
      notifyCancel: mockNotifyCancel,
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

vi.mock('../src/utils/dom', () => ({
  escapeHtml: (s: string) => s,
  capitalize: (s: string) => s.charAt(0).toUpperCase() + s.slice(1),
  getBlockParent: () => null,
}));

describe('Editor Bridge Integration', () => {
  let postMessageSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    capturedOnInit = undefined;
    capturedOnThemeChange = undefined;
    capturedOnLanguageChange = undefined;
    vi.clearAllMocks();
    postMessageSpy = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
  });

  it('should register bridge onInit callback', () => {
    const wrapper = mount(Editor);
    expect(capturedOnInit).toBeDefined();
    expect(typeof capturedOnInit).toBe('function');
    wrapper.unmount();
  });

  it('should register bridge onThemeChange callback', () => {
    const wrapper = mount(Editor);
    expect(capturedOnThemeChange).toBeDefined();
    expect(typeof capturedOnThemeChange).toBe('function');
    wrapper.unmount();
  });

  it('should register bridge onLanguageChange callback', () => {
    const wrapper = mount(Editor);
    expect(capturedOnLanguageChange).toBeDefined();
    expect(typeof capturedOnLanguageChange).toBe('function');
    wrapper.unmount();
  });

  it('should call notifyConfigUpdateWithOptions when save button is clicked', async () => {
    const wrapper = mount(Editor);

    // Simulate init to populate config
    await capturedOnInit!({
      config: {
        card_type: 'RichTextCard',
        content_source: 'inline',
        content_text: '<p>test</p>',
      },
      theme: { css: '', tokens: {} },
      resources: {},
      locale: 'en-US',
    });
    await wrapper.vm.$nextTick();

    mockNotifyConfigUpdate.mockClear();
    mockNotifyConfigUpdateWithOptions.mockClear();
    await wrapper.find('.chips-button--primary').trigger('click');

    expect(mockNotifyConfigUpdateWithOptions).toHaveBeenCalledTimes(1);
    expect(mockNotifyConfigUpdateWithOptions).toHaveBeenCalledWith(
      expect.objectContaining({ card_type: 'RichTextCard' }),
      { persist: true }
    );
    wrapper.unmount();
  });

  it('should call notifyCancel when cancel button is clicked', async () => {
    const wrapper = mount(Editor);
    mockNotifyCancel.mockClear();

    await wrapper.find('.chips-button--ghost').trigger('click');

    expect(mockNotifyCancel).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it('should auto sync content updates with persist true', async () => {
    vi.useFakeTimers();
    const wrapper = mount(Editor);

    await capturedOnInit!({
      config: {
        card_type: 'RichTextCard',
        content_source: 'inline',
        content_text: '',
      },
      theme: { css: '', tokens: {} },
      resources: {},
      locale: 'en-US',
    });
    await wrapper.vm.$nextTick();

    const editable = wrapper.find('.chips-richtext-editor-content');
    (editable.element as HTMLElement).innerHTML = '<p>auto sync</p>';
    await editable.trigger('input');

    expect(mockNotifyConfigUpdateWithOptions).not.toHaveBeenCalled();

    vi.advanceTimersByTime(450);
    await wrapper.vm.$nextTick();

    expect(mockNotifyConfigUpdateWithOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        card_type: 'RichTextCard',
        content_text: '<p>auto sync</p>',
        content_source: 'inline',
      }),
      { persist: true }
    );

    wrapper.unmount();
    vi.useRealTimers();
  });
});
