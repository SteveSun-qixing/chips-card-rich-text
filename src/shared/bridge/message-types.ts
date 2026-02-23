/**
 * Card → Host: Request message to invoke Bridge API
 */
export interface BridgeRequestMessage {
  type: 'bridge-request';
  pluginId: string;
  sessionNonce: string;
  requestNonce: string;
  requestId: string;
  namespace: string;
  action: string;
  params?: Record<string, unknown>;
}

/**
 * Host → Card: Response message from Bridge API
 */
export interface BridgeResponseMessage {
  type: 'bridge-response';
  pluginId?: string;
  sessionNonce?: string;
  requestNonce?: string;
  requestId: string;
  result?: unknown;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface LanguagePayload {
  mode: 'full';
  vocabulary: Record<string, string>;
}

export interface LanguageEnvelope {
  locale: string;
  version: string;
  payload: LanguagePayload;
}

export interface BridgeInitContext {
  pluginId: string;
  sessionNonce: string;
  trustedOrigin?: string;
}

/**
 * Host → Card: Initialization message
 */
export interface InitMessage {
  type: 'init';
  payload: {
    config: Record<string, unknown>;
    bridge?: BridgeInitContext;
    theme: {
      css: string;
      tokens: Record<string, string>;
    };
    resources: Record<string, string>;
    locale: string;
    vocabulary?: Record<string, string>;
    vocabularyVersion?: string;
    i18n?: LanguageEnvelope;
  };
}

/**
 * Card → Host: Configuration update notification
 */
export interface ConfigUpdateMessage {
  type: 'config-update';
  pluginId: string;
  sessionNonce: string;
  config: Record<string, unknown>;
  persist?: boolean;
}

/**
 * Card → Host: Resize notification
 */
export interface ResizeMessage {
  type: 'resize';
  pluginId: string;
  sessionNonce: string;
  width: number;
  height: number;
}

/**
 * Host → Card: Theme change notification
 */
export interface ThemeChangeMessage {
  type: 'theme-change';
  pluginId?: string;
  sessionNonce?: string;
  theme: {
    css: string;
    tokens: Record<string, string>;
  };
}

/**
 * Host → Card: Language change notification
 */
export interface LanguageChangeMessage {
  type: 'language-change';
  pluginId?: string;
  sessionNonce?: string;
  locale?: string;
  vocabulary?: Record<string, string>;
  vocabularyVersion?: string;
  i18n?: LanguageEnvelope;
}

/**
 * Card → Host: Editor cancel notification
 */
export interface EditorCancelMessage {
  type: 'editor-cancel';
  pluginId: string;
  sessionNonce: string;
}

/**
 * All inbound message types (Host → Card)
 */
export type InboundMessage =
  | BridgeResponseMessage
  | InitMessage
  | ThemeChangeMessage
  | LanguageChangeMessage;

/**
 * All outbound message types (Card → Host)
 */
export type OutboundMessage =
  | BridgeRequestMessage
  | ConfigUpdateMessage
  | ResizeMessage
  | EditorCancelMessage;
