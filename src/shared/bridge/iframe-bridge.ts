import type {
  BridgeRequestMessage,
  BridgeResponseMessage,
  InitMessage,
  ThemeChangeMessage,
  LanguageChangeMessage,
  InboundMessage,
} from './message-types';

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * Core iframe bridge for postMessage communication between card and host
 */
export class IframeBridge {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private messageHandler: (event: MessageEvent) => void;
  private initCallback?: (payload: InitMessage['payload']) => void;
  private themeChangeCallback?: (theme: ThemeChangeMessage['theme']) => void;
  private languageChangeCallback?: (locale: string, vocabulary: Record<string, string>) => void;

  private static readonly REQUEST_TIMEOUT = 30000;

  constructor() {
    this.messageHandler = this.handleMessage.bind(this);
    window.addEventListener('message', this.messageHandler);
  }

  /**
   * Invoke Bridge API through host proxy
   */
  async invoke(namespace: string, action: string, params?: Record<string, unknown>): Promise<unknown> {
    const requestId = crypto.randomUUID();

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject({
            code: 'BRIDGE_TIMEOUT',
            message: `Bridge request timeout: ${namespace}.${action}`,
          });
        }
      }, IframeBridge.REQUEST_TIMEOUT);

      this.pendingRequests.set(requestId, { resolve, reject, timer });

      const message: BridgeRequestMessage = {
        type: 'bridge-request',
        requestId,
        namespace,
        action,
        params,
      };

      window.parent.postMessage(message, '*');
    });
  }

  /**
   * Register initialization callback
   */
  onInit(callback: (payload: InitMessage['payload']) => void): void {
    this.initCallback = callback;
  }

  /**
   * Register theme change callback
   */
  onThemeChange(callback: (theme: ThemeChangeMessage['theme']) => void): void {
    this.themeChangeCallback = callback;
  }

  /**
   * Register language change callback
   */
  onLanguageChange(callback: (locale: string, vocabulary: Record<string, string>) => void): void {
    this.languageChangeCallback = callback;
  }

  /**
   * Notify host that configuration has been updated
   */
  notifyConfigUpdate(config: Record<string, unknown>): void {
    window.parent.postMessage({ type: 'config-update', config }, '*');
  }

  /**
   * Notify host of size change
   */
  notifyResize(width: number, height: number): void {
    window.parent.postMessage({ type: 'resize', width, height }, '*');
  }

  /**
   * Notify host that editor was cancelled
   */
  notifyCancel(): void {
    window.parent.postMessage({ type: 'editor-cancel' }, '*');
  }

  private handleMessage(event: MessageEvent): void {
    const data = event.data as InboundMessage;

    switch (data.type) {
      case 'bridge-response':
        this.handleBridgeResponse(data as BridgeResponseMessage);
        break;
      case 'init':
        this.initCallback?.((data as InitMessage).payload);
        break;
      case 'theme-change':
        this.themeChangeCallback?.((data as ThemeChangeMessage).theme);
        break;
      case 'language-change': {
        const langMsg = data as LanguageChangeMessage;
        this.languageChangeCallback?.(langMsg.locale, langMsg.vocabulary);
        break;
      }
    }
  }

  private handleBridgeResponse(data: BridgeResponseMessage): void {
    const pending = this.pendingRequests.get(data.requestId);
    if (!pending) return;

    clearTimeout(pending.timer);
    this.pendingRequests.delete(data.requestId);

    if (data.error) {
      pending.reject(data.error);
    } else {
      pending.resolve(data.result);
    }
  }

  /**
   * Destroy the bridge and clean up all resources
   */
  destroy(): void {
    window.removeEventListener('message', this.messageHandler);
    for (const [, pending] of this.pendingRequests) {
      clearTimeout(pending.timer);
      pending.reject({ code: 'BRIDGE_DESTROYED', message: 'Bridge destroyed' });
    }
    this.pendingRequests.clear();
  }
}
