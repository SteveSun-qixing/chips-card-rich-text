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
  CardRuntimeReadyMessage,
  CardRuntimeResizeMessage,
  CardRuntimeThemeChangeMessage,
} from '@chips/sdk/card-runtime';

export type BridgeRequestMessage = CardRuntimeBridgeRequestMessage;
export type BridgeResponseMessage = CardRuntimeBridgeResponseMessage;
export type LanguagePayload = CardRuntimeLanguagePayload;
export type LanguageEnvelope = CardRuntimeLanguageEnvelope;
export type BridgeInitContext = CardRuntimeBridgeContext;
export type InitMessage = CardRuntimeInitMessage;
export type ReadyMessage = CardRuntimeReadyMessage;
export type ConfigUpdateMessage = CardRuntimeConfigUpdateMessage;
export type ResizeMessage = CardRuntimeResizeMessage;
export type ThemeChangeMessage = CardRuntimeThemeChangeMessage;
export type LanguageChangeMessage = CardRuntimeLanguageChangeMessage;
export type EditorCancelMessage = CardRuntimeEditorCancelMessage;
export type InboundMessage = CardRuntimeInboundMessage;
export type OutboundMessage = CardRuntimeOutboundMessage;
