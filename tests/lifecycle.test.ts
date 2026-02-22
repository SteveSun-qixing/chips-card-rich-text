import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Renderer from '../src/renderer/Renderer.vue';
import Editor from '../src/editor/Editor.vue';

const mockRendererDestroy = vi.fn();
const mockEditorDestroy = vi.fn();
let rendererBridgeInstance: any;
let editorBridgeInstance: any;

// We need separate mock factories for Renderer and Editor,
// but vi.mock is module-level. We use a single mock that tracks instances.
let bridgeInstanceCount = 0;
const bridgeInstances: any[] = [];

vi.mock('../src/shared/bridge/iframe-bridge', () => {
  return {
    IframeBridge: vi.fn().mockImplementation(() => {
      const instance = {
        onInit: vi.fn(),
        onThemeChange: vi.fn(),
        onLanguageChange: vi.fn(),
        invoke: vi.fn(),
        destroy: vi.fn(),
        notifyConfigUpdate: vi.fn(),
        notifyCancel: vi.fn(),
        notifyResize: vi.fn(),
      };
      bridgeInstances.push(instance);
      return instance;
    }),
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

describe('Component Lifecycle', () => {
  let postMessageSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    bridgeInstances.length = 0;
    vi.clearAllMocks();
    postMessageSpy = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
  });

  it('should create bridge on Renderer mount', () => {
    bridgeInstances.length = 0;

    const wrapper = mount(Renderer);
    // A new bridge instance should have been pushed during component setup
    expect(bridgeInstances.length).toBeGreaterThanOrEqual(1);
    const bridge = bridgeInstances[bridgeInstances.length - 1]!;
    expect(bridge.onInit).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('should destroy bridge on Renderer unmount', () => {
    const wrapper = mount(Renderer);
    const bridge = bridgeInstances[bridgeInstances.length - 1]!;
    bridge.destroy.mockClear();

    wrapper.unmount();

    expect(bridge.destroy).toHaveBeenCalledTimes(1);
  });

  it('should create bridge on Editor mount', () => {
    bridgeInstances.length = 0;

    const wrapper = mount(Editor);
    // A new bridge instance should have been pushed during component setup
    expect(bridgeInstances.length).toBeGreaterThanOrEqual(1);
    const bridge = bridgeInstances[bridgeInstances.length - 1]!;
    expect(bridge.onInit).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('should destroy bridge on Editor unmount', () => {
    const wrapper = mount(Editor);
    const bridge = bridgeInstances[bridgeInstances.length - 1]!;
    bridge.destroy.mockClear();

    wrapper.unmount();

    expect(bridge.destroy).toHaveBeenCalledTimes(1);
  });

  it('should set up ResizeObserver in Renderer on mount', () => {
    // Mock ResizeObserver
    const observeFn = vi.fn();
    const disconnectFn = vi.fn();
    const MockResizeObserver = vi.fn().mockImplementation(() => ({
      observe: observeFn,
      disconnect: disconnectFn,
      unobserve: vi.fn(),
    }));
    const originalRO = globalThis.ResizeObserver;
    globalThis.ResizeObserver = MockResizeObserver as any;

    const wrapper = mount(Renderer);

    // ResizeObserver should have been created and observe called
    expect(MockResizeObserver).toHaveBeenCalled();
    expect(observeFn).toHaveBeenCalled();

    wrapper.unmount();

    // Should disconnect on unmount
    expect(disconnectFn).toHaveBeenCalled();

    globalThis.ResizeObserver = originalRO;
  });
});
