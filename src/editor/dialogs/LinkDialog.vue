<template>
  <div class="chips-richtext-dialog-overlay" @click.self="emit('cancel')">
    <div class="chips-richtext-dialog">
      <div class="chips-richtext-dialog-header">
        <h3>{{ t('dialog.link_title') }}</h3>
        <button class="chips-richtext-dialog-close" @click="emit('cancel')">&times;</button>
      </div>

      <div class="chips-richtext-dialog-body">
        <div class="chips-richtext-dialog-field">
          <label>{{ t('dialog.link_url') }}</label>
          <input
            type="text"
            v-model="url"
            :placeholder="t('dialog.link_url_placeholder')"
            @keyup.enter="handleConfirm"
          />
          <span v-if="urlError" class="chips-richtext-dialog-error">
            {{ urlError }}
          </span>
        </div>

        <div class="chips-richtext-dialog-field">
          <label>{{ t('dialog.link_text') }}</label>
          <input
            type="text"
            v-model="text"
            :placeholder="t('dialog.link_text_placeholder')"
          />
        </div>

        <div class="chips-richtext-dialog-field chips-richtext-dialog-field--checkbox">
          <label>
            <input type="checkbox" v-model="newWindow" />
            {{ t('dialog.link_new_window') }}
          </label>
        </div>
      </div>

      <div class="chips-richtext-dialog-footer">
        <button
          class="chips-button chips-button--ghost"
          @click="emit('cancel')"
        >
          {{ t('dialog.cancel') }}
        </button>
        <button
          class="chips-button chips-button--primary"
          @click="handleConfirm"
          :disabled="!isValid"
        >
          {{ t('dialog.confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { t } from '../../utils/i18n';

const emit = defineEmits<{
  (e: 'confirm', data: { url: string; text?: string; newWindow?: boolean }): void;
  (e: 'cancel'): void;
}>();

const url = ref('');
const text = ref('');
const newWindow = ref(false);

const urlError = computed(() => {
  if (!url.value) return '';

  try {
    new URL(url.value);
    return '';
  } catch {
    if (url.value.startsWith('/') || url.value.startsWith('./') || url.value.startsWith('#')) {
      return '';
    }
    return t('error.invalid_url');
  }
});

const isValid = computed(() => {
  return url.value.trim() !== '' && !urlError.value;
});

function handleConfirm(): void {
  if (!isValid.value) return;

  emit('confirm', {
    url: url.value,
    text: text.value || undefined,
    newWindow: newWindow.value || undefined,
  });
}
</script>

<style>
.chips-richtext-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.chips-richtext-dialog {
  width: 400px;
  max-width: 90%;
  border-radius: 8px;
}

.chips-richtext-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.chips-richtext-dialog-header h3 {
  margin: 0;
  font-size: 16px;
}

.chips-richtext-dialog-close {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  border-radius: 4px;
}

.chips-richtext-dialog-body {
  padding: 16px;
}

.chips-richtext-dialog-field {
  margin-bottom: 16px;
}

.chips-richtext-dialog-field label {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
}

.chips-richtext-dialog-field input[type='text'] {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.chips-richtext-dialog-field--checkbox label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.chips-richtext-dialog-error {
  display: block;
  margin-top: 4px;
  font-size: 12px;
}

.chips-richtext-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px;
}
</style>
