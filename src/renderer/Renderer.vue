<template>
  <div
    ref="containerRef"
    class="chips-richtext-renderer"
    :class="rendererClasses"
  >
    <div v-if="loading" class="chips-card-loading">
      <span class="chips-card-loading__spinner"></span>
      <span class="chips-card-loading__text">{{ t('status.loading') }}</span>
    </div>
    <div v-else-if="error" class="chips-card-error">
      <span class="chips-card-error__message">{{ error }}</span>
    </div>
    <div
      v-else
      class="chips-richtext-content chips-richtext-typography"
      :class="{ 'chips-richtext-content--readonly': true }"
      v-html="processedContent"
      @click="handleClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { IframeBridge } from '../shared/bridge/iframe-bridge';
import { sanitizeHtml } from '../utils/sanitizer';
import { t, setVocabulary, setLocale } from '../utils/i18n';
import type { RichTextCardConfig } from '../shared/types';

const bridge = new IframeBridge();
const loading = ref(true);
const error = ref<string | null>(null);
const config = ref<RichTextCardConfig>({
  card_type: 'RichTextCard',
  content_source: 'inline',
});
const rawContent = ref('');
const containerRef = ref<HTMLElement | null>(null);
const containerWidth = ref(0);
let resizeObserver: ResizeObserver | null = null;

const rendererClasses = computed(() => ({
  'chips-richtext--mobile': containerWidth.value > 0 && containerWidth.value < 480,
  'chips-richtext--tablet': containerWidth.value >= 480 && containerWidth.value < 768,
  'chips-richtext--desktop': containerWidth.value >= 768,
  'chips-card-renderer--loading': loading.value,
  'chips-card-renderer--error': !!error.value,
}));

/**
 * Process HTML content by injecting CSS class names for theme styling
 */
const processedContent = computed(() => {
  let html = rawContent.value;

  html = html.replace(/<p>/g, '<p class="chips-richtext-paragraph">');
  html = html.replace(/<h1>/g, '<h1 class="chips-richtext-h1">');
  html = html.replace(/<h2>/g, '<h2 class="chips-richtext-h2">');
  html = html.replace(/<h3>/g, '<h3 class="chips-richtext-h3">');
  html = html.replace(/<h4>/g, '<h4 class="chips-richtext-h4">');
  html = html.replace(/<h5>/g, '<h5 class="chips-richtext-h5">');
  html = html.replace(/<h6>/g, '<h6 class="chips-richtext-h6">');
  html = html.replace(/<ul>/g, '<ul class="chips-richtext-ul">');
  html = html.replace(/<ol>/g, '<ol class="chips-richtext-ol">');
  html = html.replace(/<li>/g, '<li class="chips-richtext-li">');
  html = html.replace(/<blockquote>/g, '<blockquote class="chips-richtext-blockquote">');
  html = html.replace(/<a /g, '<a class="chips-richtext-link" ');
  html = html.replace(/<img /g, '<img class="chips-richtext-image" ');
  html = html.replace(/<code>/g, '<code class="chips-richtext-code">');

  return html;
});

/**
 * Build resource identifier from a path
 */
function buildResourceIdentifier(path: string, cardId: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return `chips://network/${path}`;
  }

  if (path.startsWith('/')) {
    return `chips://local${path}`;
  }

  return `chips://card/${cardId}/${path}`;
}

/**
 * Load content from config (inline or file)
 */
async function loadContent(cfg: RichTextCardConfig, resources: Record<string, string>): Promise<string> {
  if (cfg.content_source === 'inline') {
    return cfg.content_text || '';
  }

  if (cfg.content_source === 'file' && cfg.content_file) {
    const cardId = resources['cardId'] || '';
    const identifier = buildResourceIdentifier(cfg.content_file, cardId);

    const response = await bridge.invoke('resource', 'fetch', {
      identifier,
      responseType: 'text',
      useCache: true,
    }) as { data?: string } | string;

    if (typeof response === 'string') {
      return response;
    }

    return typeof response?.data === 'string' ? response.data : '';
  }

  return '';
}

/**
 * Handle click events on rendered content
 */
async function handleClick(event: MouseEvent): Promise<void> {
  const target = event.target as HTMLElement;

  if (target.tagName === 'A') {
    event.preventDefault();
    const href = target.getAttribute('href');
    if (href) {
      await bridge.invoke('system', 'openUrl', { url: href, newWindow: true });
    }
    return;
  }

  if (target.tagName === 'IMG') {
    const src = target.getAttribute('src');
    if (src) {
      await bridge.invoke('viewer', 'openImage', { src });
    }
    return;
  }
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

function setupResizeObserver(): void {
  if (!containerRef.value) return;

  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      containerWidth.value = entry.contentRect.width;
    }
  });

  resizeObserver.observe(containerRef.value);
}

bridge.onInit(async (payload) => {
  try {
    const cfg = payload.config as unknown as RichTextCardConfig;
    config.value = cfg;
    injectThemeCSS(payload.theme.css);

    const content = await loadContent(cfg, payload.resources);
    rawContent.value = sanitizeHtml(content);

    loading.value = false;
  } catch (e) {
    error.value = (e as Error).message;
    loading.value = false;
  }
});

bridge.onThemeChange((theme) => {
  injectThemeCSS(theme.css);
});

bridge.onLanguageChange((newLocale, newVocabulary) => {
  setLocale(newLocale);
  setVocabulary(newVocabulary);
});

onMounted(() => {
  setupResizeObserver();
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  bridge.destroy();
});
</script>

<style>
@import '../styles/richtext-typography.css';

.chips-richtext-renderer {
  width: 100%;
  height: 100%;
}

.chips-richtext-content {
  background: var(--richtext-bg-color, transparent);
}

.chips-richtext--mobile .chips-richtext-typography {
  font-size: 14px;
  line-height: 1.6;
}

.chips-richtext--mobile .chips-richtext-h1 {
  font-size: 24px;
}

.chips-richtext--tablet .chips-richtext-typography {
  font-size: 15px;
  line-height: 1.7;
}

.chips-richtext--desktop .chips-richtext-typography {
  font-size: 16px;
  line-height: 1.8;
}
</style>
