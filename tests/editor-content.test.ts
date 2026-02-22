import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import EditorContent from '../src/editor/EditorContent.vue';

vi.mock('../src/utils/i18n', () => ({
  t: (key: string) => key,
}));

vi.mock('../src/utils/sanitizer', () => ({
  sanitizeHtml: (html: string) => html,
}));

vi.mock('../src/utils/dom', () => ({
  getBlockParent: () => null,
}));

describe('EditorContent Component', () => {
  const defaultProps = {
    initialContent: '<p>test content</p>',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render a contenteditable div', () => {
    const wrapper = mount(EditorContent, { props: defaultProps });

    const editable = wrapper.find('.chips-richtext-editor-content');
    expect(editable.exists()).toBe(true);
    expect(editable.attributes('contenteditable')).toBe('true');

    wrapper.unmount();
  });

  it('should set initial content on mount', async () => {
    const wrapper = mount(EditorContent, {
      props: { initialContent: '<p>Hello World</p>' },
    });
    await wrapper.vm.$nextTick();

    const editable = wrapper.find('.chips-richtext-editor-content');
    expect(editable.element.innerHTML).toContain('Hello World');

    wrapper.unmount();
  });

  it('should emit focus event when editor is focused', async () => {
    const wrapper = mount(EditorContent, { props: defaultProps });

    const editable = wrapper.find('.chips-richtext-editor-content');
    await editable.trigger('focus');

    expect(wrapper.emitted('focus')).toBeTruthy();
    expect(wrapper.emitted('focus')!.length).toBe(1);

    wrapper.unmount();
  });

  it('should emit blur event when editor loses focus', async () => {
    const wrapper = mount(EditorContent, { props: defaultProps });

    const editable = wrapper.find('.chips-richtext-editor-content');
    await editable.trigger('focus');
    await editable.trigger('blur');

    expect(wrapper.emitted('blur')).toBeTruthy();
    expect(wrapper.emitted('blur')!.length).toBe(1);

    wrapper.unmount();
  });

  it('should expose getHtml that returns innerHTML', async () => {
    const wrapper = mount(EditorContent, {
      props: { initialContent: '<p>exposed test</p>' },
    });
    await wrapper.vm.$nextTick();

    const vm = wrapper.vm as any;
    const html = vm.getHtml();
    expect(html).toContain('exposed test');

    wrapper.unmount();
  });

  it('should set data-placeholder attribute', () => {
    const wrapper = mount(EditorContent, {
      props: {
        initialContent: '',
        placeholder: 'Type something...',
      },
    });

    const editable = wrapper.find('.chips-richtext-editor-content');
    expect(editable.attributes('data-placeholder')).toBe('Type something...');

    wrapper.unmount();
  });

  it('should use i18n fallback for placeholder when not provided', () => {
    const wrapper = mount(EditorContent, {
      props: { initialContent: '' },
    });

    const editable = wrapper.find('.chips-richtext-editor-content');
    // t('hint.placeholder') returns the key itself in our mock
    expect(editable.attributes('data-placeholder')).toBe('hint.placeholder');

    wrapper.unmount();
  });
});
