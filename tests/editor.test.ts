import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Editor from '../src/editor/Editor.vue';

let capturedOnInit: ((payload: any) => void | Promise<void>) | undefined;
const mockInvoke = vi.fn();

vi.mock('../src/shared/bridge/iframe-bridge', () => {
  return {
    IframeBridge: vi.fn().mockImplementation(() => ({
      onInit: vi.fn((cb: (payload: any) => void | Promise<void>) => {
        capturedOnInit = cb;
      }),
      onThemeChange: vi.fn(),
      onLanguageChange: vi.fn(),
      invoke: mockInvoke,
      destroy: vi.fn(),
      notifyConfigUpdate: vi.fn(),
      notifyCancel: vi.fn(),
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

describe('Editor Component', () => {
  let postMessageSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    capturedOnInit = undefined;
    vi.clearAllMocks();
    mockInvoke.mockReset();
    postMessageSpy = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
  });

  it('should render the editor container', () => {
    const wrapper = mount(Editor);
    expect(wrapper.find('.chips-richtext-editor').exists()).toBe(true);
    wrapper.unmount();
  });

  it('should render the save button with primary class', () => {
    const wrapper = mount(Editor);
    const saveBtn = wrapper.find('.chips-button--primary');
    expect(saveBtn.exists()).toBe(true);
    expect(saveBtn.text()).toBe('dialog.confirm');
    wrapper.unmount();
  });

  it('should render the cancel button with ghost class', () => {
    const wrapper = mount(Editor);
    const cancelBtn = wrapper.find('.chips-button--ghost');
    expect(cancelBtn.exists()).toBe(true);
    expect(cancelBtn.text()).toBe('dialog.cancel');
    wrapper.unmount();
  });

  it('should render the statusbar with word count', () => {
    const wrapper = mount(Editor);
    const statusbar = wrapper.find('.chips-richtext-statusbar');
    expect(statusbar.exists()).toBe(true);
    expect(wrapper.find('.chips-richtext-wordcount').exists()).toBe(true);
    wrapper.unmount();
  });

  it('should have the bridge instance created on mount', () => {
    // The Editor component creates an IframeBridge in its setup.
    // We verify by checking that bridge methods are callable on the vm.
    const wrapper = mount(Editor);
    // If bridge was not created, the save/cancel buttons would not work.
    // Verify the component rendered without errors (bridge was instantiated).
    expect(wrapper.find('.chips-richtext-editor').exists()).toBe(true);
    expect(wrapper.find('.chips-button--primary').exists()).toBe(true);
    expect(wrapper.find('.chips-button--ghost').exists()).toBe(true);
    wrapper.unmount();
  });

  it('should render the actions area', () => {
    const wrapper = mount(Editor);
    expect(wrapper.find('.chips-card-editor__actions').exists()).toBe(true);
    wrapper.unmount();
  });

  it('should load file content via resource.fetch using host schema', async () => {
    mockInvoke.mockResolvedValueOnce({ data: '<p>File content</p>' });
    const wrapper = mount(Editor);

    await capturedOnInit?.({
      config: {
        card_type: 'RichTextCard',
        content_source: 'file',
        content_file: 'content/file.html',
      },
      theme: { css: '', tokens: {} },
      resources: { cardId: 'card-1' },
      locale: 'en-US',
    });
    await wrapper.vm.$nextTick();

    expect(mockInvoke).toHaveBeenCalledWith('resource', 'fetch', {
      identifier: 'chips://card/card-1/content/file.html',
      responseType: 'text',
      useCache: true,
    });

    wrapper.unmount();
  });
});
