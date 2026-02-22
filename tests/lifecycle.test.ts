import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Renderer from '../src/renderer/Renderer.vue';
import Editor from '../src/editor/Editor.vue';

describe('Component Lifecycle', () => {
  it('should initialize bridge on renderer mount', () => {
    const wrapper = mount(Renderer);
    const vm = wrapper.vm as any;

    expect(vm.bridge).toBeDefined();
    expect(typeof vm.bridge.invoke).toBe('function');

    wrapper.unmount();
  });

  it('should destroy bridge on renderer unmount', () => {
    const wrapper = mount(Renderer);
    const vm = wrapper.vm as any;
    const destroySpy = vi.spyOn(vm.bridge, 'destroy');

    wrapper.unmount();

    expect(destroySpy).toHaveBeenCalled();
  });

  it('should initialize bridge on editor mount', () => {
    const wrapper = mount(Editor);
    const vm = wrapper.vm as any;

    expect(vm.bridge).toBeDefined();
    expect(typeof vm.bridge.notifyConfigUpdate).toBe('function');

    wrapper.unmount();
  });

  it('should destroy bridge on editor unmount', () => {
    const wrapper = mount(Editor);
    const vm = wrapper.vm as any;
    const destroySpy = vi.spyOn(vm.bridge, 'destroy');

    wrapper.unmount();

    expect(destroySpy).toHaveBeenCalled();
  });
});
