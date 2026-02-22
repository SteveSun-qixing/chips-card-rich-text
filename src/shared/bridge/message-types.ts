/**
 * Card → Host: Request message to invoke Bridge API
 */
export interface BridgeRequestMessage {
  type: 'bridge-request';
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
  requestId: string;
  result?: unknown;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Host → Card: Initialization message
 */
export interface InitMessage {
  type: 'init';
  payload: {
    config: Record<string, unknown>;
    theme: {
      css: string;
      tokens: Record<string, string>;
    };
    resources: Record<string, string>;
    locale: string;
  };
}

/**
 * Card → Host: Configuration update notification
 */
export interface ConfigUpdateMessage {
  type: 'config-update';
  config: Record<string, unknown>;
}

/**
 * Card → Host: Resize notification
 */
export interface ResizeMessage {
  type: 'resize';
  width: number;
  height: number;
}

/**
 * Host → Card: Theme change notification
 */
export interface ThemeChangeMessage {
  type: 'theme-change';
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
  locale: string;
  vocabulary: Record<string, string>;
}

/**
 * Card → Host: Editor cancel notification
 */
export interface EditorCancelMessage {
  type: 'editor-cancel';
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
