/**
 * i18n Utility - Vocabulary-based Translation
 * Uses vocabulary injected by bridge from host
 */

import { ref } from 'vue';

const fallbackVocabulary: Record<string, Record<string, string>> = {
  'zh-CN': {
    'dialog.cancel': '取消',
    'dialog.confirm': '确定',
    'dialog.link_title': '插入链接',
    'dialog.link_url': '链接地址',
    'dialog.link_url_placeholder': '请输入URL',
    'dialog.link_text': '链接文本',
    'dialog.link_text_placeholder': '链接显示文本（可选）',
    'dialog.link_new_window': '在新窗口打开',
    'dialog.image_title': '插入图片',
    'dialog.image_upload': '上传图片',
    'dialog.image_url': '图片地址',
    'dialog.image_url_placeholder': '请输入图片URL',
    'dialog.image_alt': '替代文本',
    'dialog.image_alt_placeholder': '图片描述（可选）',
    'hint.placeholder': '请输入内容...',
    'hint.image_upload_hint': '点击或拖放图片到此处上传',
    'hint.image_max_size': '最大 {max}MB',
    'hint.word_count': '字数: {count}',
    'error.invalid_url': '无效的URL',
    'error.unsupported_format': '不支持的文件格式',
    'error.image_too_large': '图片大小超过 {max}MB',
    'status.loading': '加载中...',
    'toolbar.bold': '加粗',
    'toolbar.italic': '斜体',
    'toolbar.underline': '下划线',
    'toolbar.strikethrough': '删除线',
    'toolbar.heading': '标题',
    'toolbar.paragraph': '正文',
    'toolbar.ordered_list': '有序列表',
    'toolbar.unordered_list': '无序列表',
    'toolbar.blockquote': '引用',
    'toolbar.align_left': '左对齐',
    'toolbar.align_center': '居中',
    'toolbar.align_right': '右对齐',
    'toolbar.link': '链接',
    'toolbar.image': '图片',
    'toolbar.horizontal_rule': '分隔线',
    'toolbar.undo': '撤销',
    'toolbar.redo': '重做',
    'toolbar.clear_format': '清除格式',
  },
  'en-US': {
    'dialog.cancel': 'Cancel',
    'dialog.confirm': 'Confirm',
    'dialog.link_title': 'Insert Link',
    'dialog.link_url': 'URL',
    'dialog.link_url_placeholder': 'Enter URL',
    'dialog.link_text': 'Link Text',
    'dialog.link_text_placeholder': 'Display text (optional)',
    'dialog.link_new_window': 'Open in new window',
    'dialog.image_title': 'Insert Image',
    'dialog.image_upload': 'Upload Image',
    'dialog.image_url': 'Image URL',
    'dialog.image_url_placeholder': 'Enter image URL',
    'dialog.image_alt': 'Alt Text',
    'dialog.image_alt_placeholder': 'Image description (optional)',
    'hint.placeholder': 'Start typing...',
    'hint.image_upload_hint': 'Click or drag image here to upload',
    'hint.image_max_size': 'Max {max}MB',
    'hint.word_count': 'Words: {count}',
    'error.invalid_url': 'Invalid URL',
    'error.unsupported_format': 'Unsupported file format',
    'error.image_too_large': 'Image size exceeds {max}MB',
    'status.loading': 'Loading...',
    'toolbar.bold': 'Bold',
    'toolbar.italic': 'Italic',
    'toolbar.underline': 'Underline',
    'toolbar.strikethrough': 'Strikethrough',
    'toolbar.heading': 'Heading',
    'toolbar.paragraph': 'Paragraph',
    'toolbar.ordered_list': 'Ordered List',
    'toolbar.unordered_list': 'Unordered List',
    'toolbar.blockquote': 'Blockquote',
    'toolbar.align_left': 'Align Left',
    'toolbar.align_center': 'Align Center',
    'toolbar.align_right': 'Align Right',
    'toolbar.link': 'Link',
    'toolbar.image': 'Image',
    'toolbar.horizontal_rule': 'Horizontal Rule',
    'toolbar.undo': 'Undo',
    'toolbar.redo': 'Redo',
    'toolbar.clear_format': 'Clear Format',
  },
  'ja-JP': {
    'dialog.cancel': 'キャンセル',
    'dialog.confirm': '確定',
    'dialog.link_title': 'リンクを挿入',
    'dialog.link_url': 'URL',
    'dialog.link_url_placeholder': 'URLを入力',
    'dialog.link_text': 'リンクテキスト',
    'dialog.link_text_placeholder': '表示テキスト（任意）',
    'dialog.link_new_window': '新しいウィンドウで開く',
    'dialog.image_title': '画像を挿入',
    'dialog.image_upload': '画像をアップロード',
    'dialog.image_url': '画像URL',
    'dialog.image_url_placeholder': '画像URLを入力',
    'dialog.image_alt': '代替テキスト',
    'dialog.image_alt_placeholder': '画像の説明（任意）',
    'hint.placeholder': '入力してください...',
    'hint.image_upload_hint': 'クリックまたはドラッグして画像をアップロード',
    'hint.image_max_size': '最大 {max}MB',
    'hint.word_count': '文字数: {count}',
    'error.invalid_url': '無効なURL',
    'error.unsupported_format': 'サポートされていないファイル形式',
    'error.image_too_large': '画像サイズが {max}MB を超えています',
    'status.loading': '読み込み中...',
    'toolbar.bold': '太字',
    'toolbar.italic': '斜体',
    'toolbar.underline': '下線',
    'toolbar.strikethrough': '取り消し線',
    'toolbar.heading': '見出し',
    'toolbar.paragraph': '本文',
    'toolbar.ordered_list': '番号付きリスト',
    'toolbar.unordered_list': '箇条書き',
    'toolbar.blockquote': '引用',
    'toolbar.align_left': '左揃え',
    'toolbar.align_center': '中央揃え',
    'toolbar.align_right': '右揃え',
    'toolbar.link': 'リンク',
    'toolbar.image': '画像',
    'toolbar.horizontal_rule': '水平線',
    'toolbar.undo': '元に戻す',
    'toolbar.redo': 'やり直し',
    'toolbar.clear_format': '書式をクリア',
  },
};

const i18nVersion = ref(0);

function getLocaleFallback(locale: string): Record<string, string> {
  return fallbackVocabulary[locale] ?? fallbackVocabulary['en-US'] ?? {};
}

// Module-level storage, updated by bridge callbacks
let vocabulary: Record<string, string> = {};
let currentLocale = 'zh-CN';

/**
 * Set vocabulary (called by bridge on init and language change)
 */
export function setVocabulary(vocab: Record<string, string>): void {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(vocab)) {
    if (typeof value !== 'string') {
      continue;
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      continue;
    }

    if (trimmed === key) {
      continue;
    }

    normalized[key] = value;
  }

  vocabulary = normalized;
  i18nVersion.value += 1;
}

/**
 * Set current locale
 */
export function setLocale(locale: string): void {
  currentLocale = locale;
  i18nVersion.value += 1;
}

/**
 * Get current locale
 */
export function getLocale(): string {
  return currentLocale;
}

/**
 * Translate a key with optional variable substitution
 * @param key - Translation key (e.g., "toolbar.bold")
 * @param vars - Variables for substitution (e.g., { count: 5 })
 * @returns Translated string
 */
export function t(key: string, vars?: Record<string, unknown>): string {
  const version = i18nVersion.value;
  void version;

  let text = vocabulary[key]
    ?? getLocaleFallback(currentLocale)[key]
    ?? getLocaleFallback('en-US')[key]
    ?? key;

  // Variable substitution
  if (vars) {
    Object.entries(vars).forEach(([varKey, value]) => {
      text = text.replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(value));
    });
  }

  return text;
}

/**
 * Check if a key exists in vocabulary
 */
export function hasKey(key: string): boolean {
  return key in vocabulary;
}

/**
 * Get all vocabulary keys
 */
export function getKeys(): string[] {
  return Object.keys(vocabulary);
}
