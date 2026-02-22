import type { RichTextCardConfig } from './types';

// ── Bridge ──────────────────────────────────────────────

export const BRIDGE_REQUEST_TIMEOUT = 30000;

export const MESSAGE_TYPES = {
  // Inbound messages (host -> card)
  INIT: 'init',
  BRIDGE_RESPONSE: 'bridge-response',
  THEME_CHANGE: 'theme-change',
  LANGUAGE_CHANGE: 'language-change',

  // Outbound messages (card -> host)
  BRIDGE_REQUEST: 'bridge-request',
  CONFIG_UPDATE: 'config-update',
  RESIZE: 'resize',
  EDITOR_CANCEL: 'editor-cancel',
} as const;

// ── Config Defaults ─────────────────────────────────────

export const DEFAULT_CONFIG: Partial<RichTextCardConfig> = {
  theme: '',
  layout: { height_mode: 'auto' },
  toolbar: false,
  read_only: true,
};

// ── Editor Presets ──────────────────────────────────────

export const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

export const PRESET_COLORS = [
  '#000000', '#333333', '#666666', '#999999', '#FF0000',
  '#FF6600', '#FFCC00', '#33CC00', '#0066FF', '#9900FF',
];

export const PRESET_HIGHLIGHTS = [
  'transparent', '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF',
  '#FF6600', '#FFB6C1', '#E6E6FA', '#FFFACD', '#98FB98',
];

// ── Security ────────────────────────────────────────────

export const ALLOWED_TAGS = [
  'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'b', 'em', 'i', 'u', 's', 'del', 'sup', 'sub', 'code',
  'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'span', 'div',
];

export const ALLOWED_ATTRS: Record<string, string[]> = {
  '*': ['style', 'class'],
  a: ['href', 'target', 'rel'],
  img: ['src', 'alt', 'width', 'height'],
};

export const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:'];

export const ALLOWED_STYLES = [
  'color', 'background-color', 'font-size', 'font-weight',
  'font-style', 'text-align', 'text-decoration',
];

// ── Styling ─────────────────────────────────────────────

export const CSS_PREFIX = 'chips-richtext';

export const CSS_VARS = {
  textColor: '--richtext-text-color',
  bgColor: '--richtext-bg-color',
  linkColor: '--richtext-link-color',
  borderColor: '--richtext-border-color',
  fontFamily: '--richtext-font-family',
  fontSize: '--richtext-font-size',
  lineHeight: '--richtext-line-height',
  paragraphSpacing: '--richtext-paragraph-spacing',
  listIndent: '--richtext-list-indent',
};
