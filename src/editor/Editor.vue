<template>
  <div class="chips-richtext-editor">
    <Toolbar
      v-if="editorOptions.toolbar"
      :activeFormats="state.activeFormats"
      :currentBlock="state.currentBlock"
      :canUndo="state.canUndo"
      :canRedo="state.canRedo"
      :maxImageSize="editorOptions.maxImageSize"
      @format="handleFormat"
      @insert="handleInsert"
      @undo="handleUndo"
      @redo="handleRedo"
    />

    <EditorContent
      ref="editorContentRef"
      :initialContent="initialContent"
      :placeholder="editorOptions.placeholder"
      @contentChange="handleContentChange"
      @selectionChange="handleSelectionChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <div class="chips-richtext-statusbar">
      <span class="chips-richtext-wordcount">
        {{ t('hint.word_count', { count: state.wordCount }) }}
      </span>
    </div>

    <div class="chips-card-editor__actions">
      <button class="chips-button chips-button--ghost" @click="handleCancel">
        {{ t('dialog.cancel') }}
      </button>
      <button class="chips-button chips-button--primary" @click="handleSave">
        {{ t('dialog.confirm') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue';
import { IframeBridge } from '../shared/bridge/iframe-bridge';
import { t, setVocabulary, setLocale } from '../utils/i18n';
import { escapeHtml, capitalize } from '../utils/dom';
import type {
  RichTextCardConfig,
  RichTextEditorState,
  EditorOptions,
  FormatCommand,
  InsertCommand,
  FormatType,
  BlockType,
} from '../shared/types';
import Toolbar from './Toolbar.vue';
import EditorContent from './EditorContent.vue';

interface EditorContentExposed {
  getHtml: () => string;
  focusEditor: () => void;
  restoreSelection: () => boolean;
  refreshSelection: () => void;
}

const bridge = new IframeBridge();
const editorContentRef = ref<EditorContentExposed | null>(null);
const initialContent = ref('');
const config = ref<RichTextCardConfig>({
  card_type: 'RichTextCard',
  content_source: 'inline',
});
const editorOptions = ref<EditorOptions>({
  toolbar: true,
  maxImageSize: 5,
});
const AUTO_SYNC_DELAY = 400;
let autoSyncTimer: ReturnType<typeof setTimeout> | null = null;

const state: RichTextEditorState = reactive({
  content: '',
  selection: null,
  activeFormats: new Set<FormatType>(),
  currentBlock: 'paragraph' as BlockType,
  canUndo: false,
  canRedo: false,
  isDirty: false,
  wordCount: 0,
  isFocused: false,
});

/**
 * Build resource URI from a path
 */
function buildResourceUri(path: string, cardId: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return `chips://network/${path}`;
  }
  if (path.startsWith('/')) {
    return `chips://local${path}`;
  }
  return `chips://card/${cardId}/${path}`;
}

/**
 * Load content from config
 */
async function loadContent(
  cfg: RichTextCardConfig,
  resources: Record<string, string>,
): Promise<string> {
  if (cfg.content_source === 'inline') {
    return cfg.content_text || '';
  }

  if (cfg.content_source === 'file' && cfg.content_file) {
    const cardId = resources['cardId'] || '';
    const uri = buildResourceUri(cfg.content_file, cardId);

    const response = (await bridge.invoke('resource', 'fetch', {
      uri,
      options: { as: 'text', encoding: 'utf-8' },
    })) as { content: string };

    return response?.content || '';
  }

  return '';
}

// --- Bridge callbacks ---

bridge.onInit(async (payload) => {
  const cfg = payload.config as unknown as RichTextCardConfig;
  config.value = cfg;
  editorOptions.value = {
    toolbar: cfg.toolbar !== false,
    maxImageSize: 5,
    placeholder: '',
  };
  injectThemeCSS(payload.theme.css);

  const content = await loadContent(cfg, payload.resources);
  initialContent.value = content;
  state.content = content;
  state.wordCount = content.replace(/<[^>]*>/g, '').replace(/\s/g, '').length;
});

bridge.onThemeChange((theme) => {
  injectThemeCSS(theme.css);
});

bridge.onLanguageChange((newLocale, newVocabulary) => {
  setLocale(newLocale);
  setVocabulary(newVocabulary);
});

// --- Format command handlers ---

function handleFormat(command: FormatCommand): void {
  editorContentRef.value?.restoreSelection();
  executeFormatCommand(command);
  syncContentAfterCommand();
  editorContentRef.value?.focusEditor();
  editorContentRef.value?.refreshSelection();
}

function handleInsert(command: InsertCommand): void {
  editorContentRef.value?.restoreSelection();
  executeInsertCommand(command);
  syncContentAfterCommand();
  editorContentRef.value?.focusEditor();
  editorContentRef.value?.refreshSelection();
}

function handleUndo(): void {
  document.execCommand('undo', false);
  syncContentAfterCommand();
  editorContentRef.value?.focusEditor();
  editorContentRef.value?.refreshSelection();
}

function handleRedo(): void {
  document.execCommand('redo', false);
  syncContentAfterCommand();
  editorContentRef.value?.focusEditor();
  editorContentRef.value?.refreshSelection();
}

function handleContentChange(html: string): void {
  state.content = html;
  state.wordCount = html.replace(/<[^>]*>/g, '').replace(/\s/g, '').length;
  state.isDirty = true;
  config.value = {
    ...config.value,
    content_source: 'inline',
    content_text: html,
  };
  scheduleConfigAutoSync();
}

function handleSelectionChange(
  selection: { startOffset: number; endOffset: number; collapsed: boolean } | null,
  formats: Set<FormatType>,
  block: BlockType,
): void {
  state.selection = selection;
  state.activeFormats = formats;
  state.currentBlock = block;
}

function handleFocus(): void {
  state.isFocused = true;
}

function handleBlur(): void {
  state.isFocused = false;
}

function syncContentAfterCommand(): void {
  const html = editorContentRef.value?.getHtml() || '';
  state.content = html;
  state.wordCount = html.replace(/<[^>]*>/g, '').replace(/\s/g, '').length;
  state.isDirty = true;

  try {
    state.canUndo = document.queryCommandEnabled('undo');
    state.canRedo = document.queryCommandEnabled('redo');
  } catch {
    state.canUndo = false;
    state.canRedo = false;
  }
}

// --- Format command execution ---

function executeFormatCommand(command: FormatCommand): void {
  switch (command.type) {
    case 'bold':
      document.execCommand('bold', false);
      break;
    case 'italic':
      document.execCommand('italic', false);
      break;
    case 'underline':
      document.execCommand('underline', false);
      break;
    case 'strikethrough':
      document.execCommand('strikeThrough', false);
      break;
    case 'superscript':
      document.execCommand('superscript', false);
      break;
    case 'subscript':
      document.execCommand('subscript', false);
      break;
    case 'code':
      wrapSelectionWithTag('code');
      break;
    case 'heading':
      if (command.level === 0) {
        document.execCommand('formatBlock', false, 'p');
      } else {
        document.execCommand('formatBlock', false, `h${command.level}`);
      }
      break;
    case 'orderedList':
      document.execCommand('insertOrderedList', false);
      break;
    case 'unorderedList':
      document.execCommand('insertUnorderedList', false);
      break;
    case 'blockquote':
      document.execCommand('formatBlock', false, 'blockquote');
      break;
    case 'color':
      document.execCommand('foreColor', false, command.value);
      break;
    case 'backgroundColor':
      document.execCommand('hiliteColor', false, command.value);
      break;
    case 'fontSize':
      wrapSelectionWithStyle(`font-size: ${command.value}px`);
      break;
    case 'align':
      document.execCommand(`justify${capitalize(command.value)}`, false);
      break;
    case 'clearFormat':
      document.execCommand('removeFormat', false);
      break;
  }
}

function executeInsertCommand(command: InsertCommand): void {
  switch (command.type) {
    case 'link':
      document.execCommand(
        'insertHTML',
        false,
        `<a href="${escapeHtml(command.url)}" ${
          command.newWindow ? 'target="_blank" rel="noopener"' : ''
        }>${escapeHtml(command.text || command.url)}</a>`,
      );
      break;
    case 'image':
      document.execCommand(
        'insertHTML',
        false,
        `<img src="${escapeHtml(command.src)}" ${
          command.alt ? `alt="${escapeHtml(command.alt)}"` : ''
        } ${command.width ? `width="${command.width}"` : ''} ${
          command.height ? `height="${command.height}"` : ''
        } />`,
      );
      break;
    case 'horizontalRule':
      document.execCommand('insertHorizontalRule', false);
      break;
  }
}

function wrapSelectionWithTag(tagName: string): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const element = document.createElement(tagName);

  try {
    range.surroundContents(element);
  } catch {
    document.execCommand(
      'insertHTML',
      false,
      `<${tagName}>${selection.toString()}</${tagName}>`,
    );
  }
}

function wrapSelectionWithStyle(style: string): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const span = document.createElement('span');
  span.setAttribute('style', style);

  try {
    range.surroundContents(span);
  } catch {
    document.execCommand(
      'insertHTML',
      false,
      `<span style="${style}">${selection.toString()}</span>`,
    );
  }
}

// --- Save / Cancel ---

function clearAutoSyncTimer(): void {
  if (!autoSyncTimer) {
    return;
  }
  clearTimeout(autoSyncTimer);
  autoSyncTimer = null;
}

function buildUpdatedConfig(): Record<string, unknown> {
  return {
    ...config.value,
    content_source: 'inline',
    content_text: state.content,
  };
}

function scheduleConfigAutoSync(): void {
  clearAutoSyncTimer();
  autoSyncTimer = setTimeout(() => {
    autoSyncTimer = null;
    bridge.notifyConfigUpdateWithOptions(buildUpdatedConfig(), { persist: true });
  }, AUTO_SYNC_DELAY);
}

function handleSave(): void {
  clearAutoSyncTimer();
  bridge.notifyConfigUpdateWithOptions(buildUpdatedConfig(), { persist: true });
}

function handleCancel(): void {
  bridge.notifyCancel();
}

function injectThemeCSS(css: string): void {
  let styleEl = document.getElementById('chips-theme') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'chips-theme';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = css;
}

onUnmounted(() => {
  clearAutoSyncTimer();
  bridge.destroy();
});
</script>

<style>
@import '../styles/richtext-typography.css';

.chips-richtext-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chips-richtext-statusbar {
  display: flex;
  justify-content: flex-end;
  padding: 4px 8px;
  font-size: 12px;
}

.chips-card-editor__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 16px;
}
</style>
