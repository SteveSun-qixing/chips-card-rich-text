<template>
  <div class="chips-richtext-dialog-overlay" @click.self="emit('cancel')">
    <div class="chips-richtext-dialog">
      <div class="chips-richtext-dialog-header">
        <h3>{{ t('dialog.image_title') }}</h3>
        <button class="chips-richtext-dialog-close" @click="emit('cancel')">&times;</button>
      </div>

      <div class="chips-richtext-dialog-body">
        <div class="chips-richtext-dialog-tabs">
          <button
            :class="{ active: activeTab === 'upload' }"
            @click="activeTab = 'upload'"
          >
            {{ t('dialog.image_upload') }}
          </button>
          <button
            :class="{ active: activeTab === 'url' }"
            @click="activeTab = 'url'"
          >
            {{ t('dialog.image_url') }}
          </button>
        </div>

        <div v-if="activeTab === 'upload'" class="chips-richtext-dialog-tab-content">
          <div
            class="chips-richtext-dialog-dropzone"
            :class="{ dragover: isDragover }"
            @dragover.prevent="isDragover = true"
            @dragleave="isDragover = false"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileSelect"
              hidden
            />
            <div v-if="!previewSrc">
              <p>{{ t('hint.image_upload_hint') }}</p>
              <p class="chips-richtext-dialog-hint">
                {{ t('hint.image_max_size', { max: maxSize || 5 }) }}
              </p>
            </div>
            <img v-else :src="previewSrc" class="chips-richtext-dialog-preview" />
          </div>
        </div>

        <div v-if="activeTab === 'url'" class="chips-richtext-dialog-tab-content">
          <div class="chips-richtext-dialog-field">
            <label>{{ t('dialog.image_url') }}</label>
            <input
              type="text"
              v-model="imageUrl"
              :placeholder="t('dialog.image_url_placeholder')"
            />
          </div>
        </div>

        <div class="chips-richtext-dialog-field">
          <label>{{ t('dialog.image_alt') }}</label>
          <input
            type="text"
            v-model="altText"
            :placeholder="t('dialog.image_alt_placeholder')"
          />
        </div>

        <div v-if="errorMsg" class="chips-richtext-dialog-error">
          {{ errorMsg }}
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

const props = defineProps<{
  maxSize?: number;
}>();

const emit = defineEmits<{
  (e: 'confirm', data: { src: string; alt?: string }): void;
  (e: 'cancel'): void;
}>();

const activeTab = ref<'upload' | 'url'>('upload');
const isDragover = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const previewSrc = ref('');
const imageUrl = ref('');
const altText = ref('');
const errorMsg = ref('');

const maxSizeBytes = computed(() => (props.maxSize || 5) * 1024 * 1024);

const isValid = computed(() => {
  if (activeTab.value === 'upload') {
    return !!previewSrc.value;
  } else {
    return !!imageUrl.value.trim();
  }
});

function triggerFileInput(): void {
  fileInput.value?.click();
}

function handleFileSelect(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    processFile(file);
  }
}

function handleDrop(event: DragEvent): void {
  isDragover.value = false;
  const file = event.dataTransfer?.files[0];
  if (file) {
    processFile(file);
  }
}

function processFile(file: File): void {
  errorMsg.value = '';

  if (!file.type.startsWith('image/')) {
    errorMsg.value = t('error.unsupported_format');
    return;
  }

  if (file.size > maxSizeBytes.value) {
    errorMsg.value = t('error.image_too_large', { max: props.maxSize || 5 });
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    previewSrc.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

function handleConfirm(): void {
  if (!isValid.value) return;

  if (activeTab.value === 'upload' && previewSrc.value) {
    emit('confirm', {
      src: previewSrc.value,
      alt: altText.value || undefined,
    });
  } else if (activeTab.value === 'url' && imageUrl.value) {
    emit('confirm', {
      src: imageUrl.value,
      alt: altText.value || undefined,
    });
  }
}
</script>

<style>
.chips-richtext-dialog-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.chips-richtext-dialog-tabs button {
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
}

.chips-richtext-dialog-tab-content {
  margin-bottom: 16px;
}

.chips-richtext-dialog-dropzone {
  border: 2px dashed transparent;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.chips-richtext-dialog-preview {
  max-width: 100%;
  max-height: 200px;
}

.chips-richtext-dialog-hint {
  font-size: 12px;
  margin-top: 8px;
}
</style>
