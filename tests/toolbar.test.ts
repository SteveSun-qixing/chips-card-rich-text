import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Toolbar from '../src/editor/Toolbar.vue';

vi.mock('../src/utils/i18n', () => ({
  t: (key: string) => key,
}));

describe('Toolbar Component', () => {
  const defaultProps = {
    activeFormats: new Set<string>(),
    currentBlock: 'paragraph' as const,
    canUndo: false,
    canRedo: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render toolbar with format buttons', () => {
    const wrapper = mount(Toolbar, { props: defaultProps });

    expect(wrapper.find('.chips-richtext-toolbar').exists()).toBe(true);

    const buttons = wrapper.findAll('.chips-richtext-toolbar-button');
    // bold, italic, underline, strikethrough, ol, ul, blockquote,
    // align-left, align-center, align-right, link, image, hr, undo, redo, clear
    expect(buttons.length).toBeGreaterThanOrEqual(10);

    wrapper.unmount();
  });

  it('should emit format event when bold button is clicked', async () => {
    const wrapper = mount(Toolbar, { props: defaultProps });

    // Bold is the first button
    const boldButton = wrapper.findAll('.chips-richtext-toolbar-button')[0]!;
    await boldButton.trigger('click');

    expect(wrapper.emitted('format')).toBeTruthy();
    expect(wrapper.emitted('format')![0]).toEqual([{ type: 'bold' }]);

    wrapper.unmount();
  });

  it('should emit format event with heading when select changes', async () => {
    const wrapper = mount(Toolbar, { props: defaultProps });

    const select = wrapper.find('.chips-richtext-toolbar-select');
    expect(select.exists()).toBe(true);

    await select.setValue('heading2');
    await select.trigger('change');

    const formatEvents = wrapper.emitted('format');
    expect(formatEvents).toBeTruthy();

    // Find the heading format event
    const headingEvent = formatEvents!.find(
      (args: any[]) => args[0]?.type === 'heading'
    );
    expect(headingEvent).toBeTruthy();
    expect(headingEvent![0]).toEqual({ type: 'heading', level: 2 });

    wrapper.unmount();
  });

  it('should disable undo/redo buttons when canUndo/canRedo are false', () => {
    const wrapper = mount(Toolbar, {
      props: { ...defaultProps, canUndo: false, canRedo: false },
    });

    const buttons = wrapper.findAll('.chips-richtext-toolbar-button');
    // Find undo and redo buttons by their title attributes
    const undoBtn = wrapper.find('[title*="toolbar.undo"]');
    const redoBtn = wrapper.find('[title*="toolbar.redo"]');

    expect(undoBtn.exists()).toBe(true);
    expect(redoBtn.exists()).toBe(true);
    expect((undoBtn.element as HTMLButtonElement).disabled).toBe(true);
    expect((redoBtn.element as HTMLButtonElement).disabled).toBe(true);

    wrapper.unmount();
  });

  it('should enable undo/redo buttons when canUndo/canRedo are true', () => {
    const wrapper = mount(Toolbar, {
      props: { ...defaultProps, canUndo: true, canRedo: true },
    });

    const undoBtn = wrapper.find('[title*="toolbar.undo"]');
    const redoBtn = wrapper.find('[title*="toolbar.redo"]');

    expect((undoBtn.element as HTMLButtonElement).disabled).toBe(false);
    expect((redoBtn.element as HTMLButtonElement).disabled).toBe(false);

    wrapper.unmount();
  });

  it('should show link dialog when link button is clicked', async () => {
    const wrapper = mount(Toolbar, { props: defaultProps });

    const linkBtn = wrapper.find('[title="toolbar.link"]');
    expect(linkBtn.exists()).toBe(true);

    await linkBtn.trigger('click');
    await wrapper.vm.$nextTick();

    // LinkDialog should now be rendered
    expect(wrapper.find('.chips-richtext-dialog-overlay').exists()).toBe(true);

    wrapper.unmount();
  });

  it('should show image dialog when image button is clicked', async () => {
    const wrapper = mount(Toolbar, { props: defaultProps });

    const imageBtn = wrapper.find('[title="toolbar.image"]');
    expect(imageBtn.exists()).toBe(true);

    await imageBtn.trigger('click');
    await wrapper.vm.$nextTick();

    // ImageDialog should now be rendered
    expect(wrapper.find('.chips-richtext-dialog-overlay').exists()).toBe(true);

    wrapper.unmount();
  });

  it('should highlight active format buttons', () => {
    const wrapper = mount(Toolbar, {
      props: {
        ...defaultProps,
        activeFormats: new Set(['bold', 'italic']),
      },
    });

    const activeButtons = wrapper.findAll('.chips-richtext-toolbar-button--active');
    expect(activeButtons.length).toBe(2);

    wrapper.unmount();
  });
});
