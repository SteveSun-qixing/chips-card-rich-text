import { describe, it, expect, vi } from 'vitest';
import { IframeBridge } from '../src/shared/bridge/iframe-bridge';

describe('Editor Bridge Integration', () => {
  it('should notify config update', () => {
    const bridge = new IframeBridge();
    const postMessageSpy = vi.spyOn(window.parent, 'postMessage');

    const config = {
      title: 'Updated Title',
      content: 'Updated Content',
    };

    bridge.notifyConfigUpdate(config);

    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: 'config-update', config },
      '*'
    );

    bridge.destroy();
  });

  it('should notify cancel operation', () => {
    const bridge = new IframeBridge();
    const postMessageSpy = vi.spyOn(window.parent, 'postMessage');

    bridge.notifyCancel();

    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: 'editor-cancel' },
      '*'
    );

    bridge.destroy();
  });
});
