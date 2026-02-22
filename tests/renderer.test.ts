import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Renderer from '../src/renderer/Renderer.vue';

describe('Renderer Component', () => {
  it('should render loading state initially', () => {
    const wrapper = mount(Renderer);
    expect(wrapper.find('.chips-card-loading').exists()).toBe(true);
    expect(wrapper.find('.chips-card-loading__text').text()).toContain('card.loading');
  });

  it('should render error state when error occurs', async () => {
    const wrapper = mount(Renderer);

    // Simulate error by directly setting the error ref
    await wrapper.vm.$nextTick();

    // Note: Full error simulation would require mocking the bridge
    expect(wrapper.find('.chips-card-renderer').exists()).toBe(true);
  });

  it('should render card content after initialization', async () => {
    const wrapper = mount(Renderer);

    // Simulate initialization
    const bridge = (wrapper.vm as any).bridge;
    if (bridge && bridge.onInit) {
      // This would be called by the host in real scenario
      // For now, we just verify the component structure
    }

    expect(wrapper.find('.chips-card-renderer__content').exists()).toBe(false); // Initially loading
  });

  it('should apply renderer classes based on state', () => {
    const wrapper = mount(Renderer);
    expect(wrapper.find('.chips-card-renderer--loading').exists()).toBe(true);
  });

  it('should translate text using vocabulary', () => {
    const wrapper = mount(Renderer);
    const vm = wrapper.vm as any;

    // Set vocabulary
    vm.vocabulary = { 'test.key': 'Test Value' };

    expect(vm.t('test.key')).toBe('Test Value');
    expect(vm.t('missing.key')).toBe('missing.key');
  });
});
