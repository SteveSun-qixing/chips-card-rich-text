import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Editor from '../src/editor/Editor.vue';

describe('Editor Component', () => {
  it('should render editor interface', () => {
    const wrapper = mount(Editor);
    expect(wrapper.find('.chips-card-editor').exists()).toBe(true);
    expect(wrapper.find('.chips-card-editor__toolbar').exists()).toBe(true);
    expect(wrapper.find('.chips-card-editor__content').exists()).toBe(true);
    expect(wrapper.find('.chips-card-editor__actions').exists()).toBe(true);
  });

  it('should render input fields', () => {
    const wrapper = mount(Editor);
    const inputs = wrapper.findAll('input');
    const textareas = wrapper.findAll('textarea');

    expect(inputs.length).toBeGreaterThan(0);
    expect(textareas.length).toBeGreaterThan(0);
  });

  it('should update config when field changes', async () => {
    const wrapper = mount(Editor);
    const vm = wrapper.vm as any;

    vm.updateField('title', 'New Title');

    expect(vm.config.title).toBe('New Title');
  });

  it('should call notifyConfigUpdate on save', async () => {
    const wrapper = mount(Editor);
    const vm = wrapper.vm as any;

    const notifySpy = vi.spyOn(vm.bridge, 'notifyConfigUpdate');

    vm.config = { title: 'Test', content: 'Content' };
    await wrapper.find('.chips-button--primary').trigger('click');

    expect(notifySpy).toHaveBeenCalledWith({ title: 'Test', content: 'Content' });
  });

  it('should call notifyCancel on cancel', async () => {
    const wrapper = mount(Editor);
    const vm = wrapper.vm as any;

    const cancelSpy = vi.spyOn(vm.bridge, 'notifyCancel');

    await wrapper.find('.chips-button--ghost').trigger('click');

    expect(cancelSpy).toHaveBeenCalled();
  });

  it('should translate text using vocabulary', () => {
    const wrapper = mount(Editor);
    const vm = wrapper.vm as any;

    vm.vocabulary = { 'editor.title': 'Edit Card' };

    expect(vm.t('editor.title')).toBe('Edit Card');
    expect(vm.t('missing.key')).toBe('missing.key');
  });
});
