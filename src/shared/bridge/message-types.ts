import type {
  CardRuntimeBridgeContext,
  CardRuntimeBridgeRequestMessage,
  CardRuntimeBridgeResponseMessage,
  CardRuntimeConfigUpdateMessage,
  CardRuntimeEditorCancelMessage,
  CardRuntimeInboundMessage,
  CardRuntimeInitMessage,
  CardRuntimeLanguageChangeMessage,
  CardRuntimeLanguageEnvelope,
  CardRuntimeLanguagePayload,
  CardRuntimeOutboundMessage,
  CardRuntimeResizeMessage,
  CardRuntimeThemeChangeMessage,
} from '@chips/sdk/card-runtime';

/**
 * Card -> Host: Request message to invoke Bridge API
 */
export type BridgeRequestMessage = CardRuntimeBridgeRequestMessage;

/**
 * Host -> Card: Response message from Bridge API
 */
export type BridgeResponseMessage = CardRuntimeBridgeResponseMessage;

export type LanguagePayload = CardRuntimeLanguagePayload;

export type LanguageEnvelope = CardRuntimeLanguageEnvelope;

export type BridgeInitContext = CardRuntimeBridgeContext;

/**
 * Host -> Card: Initialization message
 */
export type InitMessage = CardRuntimeInitMessage;

/**
 * Card -> Host: Configuration update notification
 */
export type ConfigUpdateMessage = CardRuntimeConfigUpdateMessage;

/**
 * Card -> Host: Resize notification
 */
export type ResizeMessage = CardRuntimeResizeMessage;

/**
 * Host -> Card: Theme change notification
 */
export type ThemeChangeMessage = CardRuntimeThemeChangeMessage;

/**
 * Host -> Card: Language change notification
 */
export type LanguageChangeMessage = CardRuntimeLanguageChangeMessage;

/**
 * Card -> Host: Editor cancel notification
 */
export type EditorCancelMessage = CardRuntimeEditorCancelMessage;

/**
 * All inbound message types (Host -> Card)
 */
export type InboundMessage = CardRuntimeInboundMessage;

/**
 * All outbound message types (Card -> Host)
 */
export type OutboundMessage = CardRuntimeOutboundMessage;
