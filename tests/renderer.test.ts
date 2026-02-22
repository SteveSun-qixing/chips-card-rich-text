import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Renderer from '../src/renderer/Renderer.vue';

// Capture bridge callbacks to drive component state
let capturedOnInit: Function | undefined;
const mockInvoke = vi.fn();
const mockDestroy = vi.fn();

vi.mock('../src/shared/bridge/iframe-bridge', () => {
  return {
    IframeBridge: vi.fn().mockImplementation(() => ({
      onInit: vi.fn((cb: Function) => { capturedOnInit = cb; }),
      onThemeChange: vi.fn(),
      onLanguageChange: vi.fn(),
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

describe('Renderer Component', () => {
  let postMessageSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    capturedOnInit = undefined;
    vi.clearAllMocks();
    postMessageSpy = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
  });

  it('should show loading state initially', () => {
    const wrapper = mount(Renderer);
    expect(wrapper.find('.chips-card-loading').exists()).toBe(true);
    expect(wrapper.find('.chips-card-loading__spinner').exists()).toBe(true);
    expect(wrapper.find('.chips-card-loading__text').exists()).toBe(true);
    wrapper.unmount();
  });

  it('should render the renderer container element', () => {
    const wrapper = mount(Renderer);
    expect(wrapper.find('.chips-richtext-renderer').exists()).toBe(true);
    wrapper.unmount();
  });

  it('should show error state when init callback throws', async () => {
    const wrapper = mount(Renderer);

    // Trigger onInit with a config that will cause an error
    // by making invoke reject (file source triggers invoke)
    mockInvoke.mockRejectedValueOnce(new Error('Load failed'));

    await capturedOnInit!({
      config: {
        card_type: 'RichTextCard',
        content_source: 'file',
        content_file: 'missing.html',
      },
      theme: { css: '', tokens: {} },
      resources: { cardId: 'card-1' },
      locale: 'en-US',
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.chips-card-error').exists()).toBe(true);
    expect(wrapper.find('.chips-card-error__message').text()).toBe('Load failed');
    expect(wrapper.find('.chips-card-loading').exists()).toBe(false);
    wrapper.unmount();
  });

  it('should render content with v-html when loaded via onInit', async () => {
    const wrapper = mount(Renderer);

    await capturedOnInit!({
      config: {
        card_type: 'RichTextCard',
        content_source: 'inline',
        content_text: '<p>Hello World</p>',
      },
      theme: { css: '', tokens: {} },
      resources: {},
      locale: 'en-US',
    });
    await wrapper.vm.$nextTick();

    const content = wrapper.find('.chips-richtext-content');
    expect(content.exists()).toBe(true);
    expect(content.html()).toContain('Hello World');
    wrapper.unmount();
  });

  it('should apply loading class on renderer when loading', () => {
    const wrapper = mount(Renderer);
    expect(wrapper.find('.chips-card-renderer--loading').exists()).toBe(true);
    wrapper.unmount();
  });

  it('should inject CSS class names via processedContent', async () => {
    const wrapper = mount(Renderer);

    await capturedOnInit!({
      config: {
        card_type: 'RichTextCard',
        content_source: 'inline',
        content_text: '<p>text</p><h1>title</h1><ul><li>item</li></ul>',
      },
      theme: { css: '', tokens: {} },
      resources: {},
      locale: 'en-US',
    });
    await wrapper.vm.$nextTick();

    const html = wrapper.find('.chips-richtext-content').html();
    expect(html).toContain('chips-richtext-paragraph');
    expect(html).toContain('chips-richtext-h1');
    expect(html).toContain('chips-richtext-ul');
    expect(html).toContain('chips-richtext-li');
    wrapper.unmount();
  });

  it('should have the bridge instance created (onInit registered)', () => {
    const wrapper = mount(Renderer);
    // Bridge was created during component setup, which registered onInit
    expect(capturedOnInit).toBeDefined();
    expect(typeof capturedOnInit).toBe('function');
    wrapper.unmount();
  });
});
