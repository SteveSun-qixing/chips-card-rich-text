// ── Config ──────────────────────────────────────────────

export interface RichTextLayoutConfig {
  height_mode?: 'auto' | 'fixed';
  fixed_height?: number;
}

export interface RichTextCardConfig {
  card_type: 'RichTextCard';
  theme?: string;
  layout?: RichTextLayoutConfig;
  content_source: 'file' | 'inline';
  content_file?: string;
  content_text?: string;
  toolbar?: boolean;
  read_only?: boolean;
}

// ── State ───────────────────────────────────────────────

export interface SelectionRange {
  startOffset: number;
  endOffset: number;
  collapsed: boolean;
}

export type FormatType =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'superscript'
  | 'subscript'
  | 'code';

export type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'heading4'
  | 'heading5'
  | 'heading6'
  | 'orderedList'
  | 'unorderedList'
  | 'blockquote';

export interface RichTextRendererState {
  content: string;
  isLoading: boolean;
  error: string | null;
  currentTheme: string;
  containerWidth: number;
}

export interface RichTextEditorState {
  content: string;
  selection: SelectionRange | null;
  activeFormats: Set<FormatType>;
  currentBlock: BlockType;
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
  wordCount: number;
  isFocused: boolean;
}

// ── Commands ────────────────────────────────────────────

export type FormatCommand =
  | { type: 'bold' }
  | { type: 'italic' }
  | { type: 'underline' }
  | { type: 'strikethrough' }
  | { type: 'superscript' }
  | { type: 'subscript' }
  | { type: 'code' }
  | { type: 'heading'; level: 0 | 1 | 2 | 3 | 4 | 5 | 6 }
  | { type: 'orderedList' }
  | { type: 'unorderedList' }
  | { type: 'blockquote' }
  | { type: 'color'; value: string }
  | { type: 'backgroundColor'; value: string }
  | { type: 'fontSize'; value: number }
  | { type: 'align'; value: 'left' | 'center' | 'right' | 'justify' }
  | { type: 'clearFormat' };

export type InsertCommand =
  | { type: 'link'; url: string; text?: string; newWindow?: boolean }
  | { type: 'image'; src: string; alt?: string; width?: number; height?: number }
  | { type: 'horizontalRule' };

// ── Events ──────────────────────────────────────────────

export interface RichTextChangeEvent {
  type: 'change';
  config: RichTextCardConfig;
  content: string;
  isUserAction: boolean;
  timestamp: number;
}

export interface SelectionChangeEvent {
  type: 'selectionChange';
  selection: SelectionRange | null;
  activeFormats: FormatType[];
  currentBlock: BlockType;
}

export interface EditorEvents {
  change: (event: RichTextChangeEvent) => void;
  selectionChange: (event: SelectionChangeEvent) => void;
  focus: (event: FocusEvent) => void;
  blur: (event: FocusEvent) => void;
}

// ── Options ─────────────────────────────────────────────

export interface RenderOptions {
  cardId?: string;
  mode: 'view' | 'edit';
  theme?: string;
  readonly?: boolean;
  interactive?: boolean;
  locale?: string;
}

export interface EditorOptions {
  theme?: string;
  locale?: string;
  toolbar?: boolean;
  preview?: boolean;
  autoSave?: boolean;
  saveDelay?: number;
  placeholder?: string;
  maxLength?: number;
  maxImageSize?: number;
}

// ── Validation ──────────────────────────────────────────

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

// ── Errors ──────────────────────────────────────────────

export enum RichTextErrorCode {
  INVALID_CONFIG = 'RICHTEXT-E1001',
  MISSING_CONTENT_SOURCE = 'RICHTEXT-E1002',
  CONTENT_REQUIRED = 'RICHTEXT-E1003',
  CONTENT_TOO_LONG = 'RICHTEXT-E1004',
  FILE_NOT_FOUND = 'RICHTEXT-E2001',
  LOAD_FAILED = 'RICHTEXT-E2002',
  RESOURCE_NOT_FOUND = 'RICHTEXT-E2003',
  XSS_BLOCKED = 'RICHTEXT-E3001',
  INVALID_URL = 'RICHTEXT-E3002',
  UNSAFE_PROTOCOL = 'RICHTEXT-E3003',
  RENDER_FAILED = 'RICHTEXT-E4001',
  FORMAT_FAILED = 'RICHTEXT-E4002',
  INSERT_FAILED = 'RICHTEXT-E4003',
  EDITOR_NOT_INITIALIZED = 'RICHTEXT-E4004',
  UPLOAD_FAILED = 'RICHTEXT-E5001',
  IMAGE_TOO_LARGE = 'RICHTEXT-E5002',
  UNSUPPORTED_FORMAT = 'RICHTEXT-E5003',
}

export class ChipsError extends Error {
  constructor(
    public readonly code: RichTextErrorCode | string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ChipsError';
  }
}

export class ConfigError extends ChipsError {
  constructor(message: string, details?: unknown) {
    super(RichTextErrorCode.INVALID_CONFIG, message, details);
    this.name = 'ConfigError';
  }
}

export class ResourceError extends ChipsError {
  constructor(code: RichTextErrorCode, message: string, details?: unknown) {
    super(code, message, details);
    this.name = 'ResourceError';
  }
}

export class SecurityError extends ChipsError {
  constructor(code: RichTextErrorCode, message: string, details?: unknown) {
    super(code, message, details);
    this.name = 'SecurityError';
  }
}
