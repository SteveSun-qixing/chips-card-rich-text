import type {
  BridgeRequestMessage,
  BridgeResponseMessage,
  BridgeInitContext,
  InitMessage,
  ThemeChangeMessage,
  LanguageChangeMessage,
  LanguageEnvelope,
  InboundMessage,
} from './message-types';

interface PendingRequest {
  requestNonce: string;
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
  private pluginId = '';
  private sessionNonce = '';
  private hostOrigin: string | null = null;
  private hostTargetOrigin: string = '*';

  private static readonly REQUEST_TIMEOUT = 30000;

  constructor() {
    this.messageHandler = this.handleMessage.bind(this);
    window.addEventListener('message', this.messageHandler);
  }

  /**
   * Invoke Bridge API through host proxy
   */
  async invoke(namespace: string, action: string, params?: Record<string, unknown>): Promise<unknown> {
    if (!this.pluginId || !this.sessionNonce) {
      return Promise.reject({
        code: 'BRIDGE_NOT_READY',
        message: 'Bridge is not initialized',
      });
    }

    const requestId = crypto.randomUUID();
    const requestNonce = crypto.randomUUID();

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

      this.pendingRequests.set(requestId, { requestNonce, resolve, reject, timer });

      const message: BridgeRequestMessage = {
        type: 'bridge-request',
        pluginId: this.pluginId,
        sessionNonce: this.sessionNonce,
        requestNonce,
        requestId,
        namespace,
        action,
        params,
      };

      window.parent.postMessage(message, this.hostTargetOrigin);
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
    this.notifyConfigUpdateWithOptions(config);
  }

  notifyConfigUpdateWithOptions(
    config: Record<string, unknown>,
    options?: { persist?: boolean }
  ): void {
    if (!this.pluginId || !this.sessionNonce) {
      return;
    }

    window.parent.postMessage(
      {
        type: 'config-update',
        pluginId: this.pluginId,
        sessionNonce: this.sessionNonce,
        config,
        ...(options?.persist === true ? { persist: true } : {}),
      },
      this.hostTargetOrigin
    );
  }

  /**
   * Notify host of size change
   */
  notifyResize(width: number, height: number): void {
    if (!this.pluginId || !this.sessionNonce) {
      return;
    }

    window.parent.postMessage(
      {
        type: 'resize',
        pluginId: this.pluginId,
        sessionNonce: this.sessionNonce,
        width,
        height,
      },
      this.hostTargetOrigin
    );
  }

  /**
   * Notify host that editor was cancelled
   */
  notifyCancel(): void {
    if (!this.pluginId || !this.sessionNonce) {
      return;
    }

    window.parent.postMessage(
      {
        type: 'editor-cancel',
        pluginId: this.pluginId,
        sessionNonce: this.sessionNonce,
      },
      this.hostTargetOrigin
    );
  }

  private handleMessage(event: MessageEvent): void {
    if (event.source !== window.parent) {
      return;
    }

    const data = event.data as InboundMessage;
    if (!data || typeof data !== 'object' || !('type' in data)) {
      return;
    }

    if (data.type !== 'init') {
      if (!this.hostOrigin || event.origin !== this.hostOrigin) {
        return;
      }

      const dataRecord = data as unknown as Record<string, unknown>;
      if (
        typeof dataRecord.sessionNonce !== 'string'
        || dataRecord.sessionNonce !== this.sessionNonce
      ) {
        return;
      }
    }

    switch (data.type) {
      case 'bridge-response':
        this.handleBridgeResponse(data as BridgeResponseMessage);
        break;
      case 'init':
        this.handleInit(event.origin, data as InitMessage);
        break;
      case 'theme-change':
        this.themeChangeCallback?.((data as ThemeChangeMessage).theme);
        break;
      case 'language-change': {
        const langMsg = data as LanguageChangeMessage;
        const parsedLanguage = this.parseLanguageEnvelope(langMsg);
        if (!parsedLanguage) {
          return;
        }
        this.languageChangeCallback?.(parsedLanguage.locale, parsedLanguage.payload.vocabulary);
        break;
      }
    }
  }

  private handleInit(origin: string, message: InitMessage): void {
    const bridgeContext = message.payload.bridge as BridgeInitContext | undefined;
    if (!bridgeContext) {
      return;
    }

    if (
      typeof bridgeContext.pluginId !== 'string'
      || typeof bridgeContext.sessionNonce !== 'string'
      || bridgeContext.pluginId.length === 0
      || bridgeContext.sessionNonce.length === 0
    ) {
      return;
    }

    if (
      bridgeContext.trustedOrigin
      && typeof bridgeContext.trustedOrigin === 'string'
      && bridgeContext.trustedOrigin !== origin
    ) {
      return;
    }

    this.pluginId = bridgeContext.pluginId;
    this.sessionNonce = bridgeContext.sessionNonce;
    this.hostOrigin = origin;
    this.hostTargetOrigin = origin === 'null' ? '*' : origin;

    this.initCallback?.(message.payload);

    const initialLanguage = this.parseLanguageEnvelope({
      type: 'language-change',
      i18n: message.payload.i18n,
      locale: message.payload.locale,
      vocabulary: message.payload.vocabulary,
      vocabularyVersion: message.payload.vocabularyVersion,
      pluginId: bridgeContext.pluginId,
      sessionNonce: bridgeContext.sessionNonce,
    });
    if (initialLanguage) {
      this.languageChangeCallback?.(initialLanguage.locale, initialLanguage.payload.vocabulary);
    }
  }

  private parseLanguageEnvelope(message: LanguageChangeMessage): LanguageEnvelope | null {
    if (message.i18n) {
      const locale = message.i18n.locale;
      const version = message.i18n.version;
      const payload = message.i18n.payload;
      const vocabulary = this.toStringRecord(payload?.vocabulary);
      if (
        typeof locale === 'string'
        && typeof version === 'string'
        && payload
        && payload.mode === 'full'
        && vocabulary
      ) {
        return {
          locale,
          version,
          payload: {
            mode: 'full',
            vocabulary,
          },
        };
      }
      return null;
    }

    const legacyVocabulary = this.toStringRecord(message.vocabulary);
    if (
      typeof message.locale === 'string'
      && legacyVocabulary
    ) {
      return {
        locale: message.locale,
        version: message.vocabularyVersion ?? 'legacy',
        payload: {
          mode: 'full',
          vocabulary: legacyVocabulary,
        },
      };
    }

    return null;
  }

  private toStringRecord(value: unknown): Record<string, string> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    const result: Record<string, string> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (typeof item !== 'string') {
        return null;
      }
      result[key] = item;
    }
    return result;
  }

  private handleBridgeResponse(data: BridgeResponseMessage): void {
    if (this.pluginId && data.pluginId && data.pluginId !== this.pluginId) {
      return;
    }

    if (this.sessionNonce && data.sessionNonce && data.sessionNonce !== this.sessionNonce) {
      return;
    }

    const pending = this.pendingRequests.get(data.requestId);
    if (!pending) return;

    if (
      typeof data.requestNonce === 'string'
      && data.requestNonce !== pending.requestNonce
    ) {
      return;
    }

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
    this.pluginId = '';
    this.sessionNonce = '';
    this.hostOrigin = null;
    this.hostTargetOrigin = '*';
  }
}
