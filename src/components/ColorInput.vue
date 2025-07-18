<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  initialColor: {
    type: String,
    default: '#FFFFFF',
  },
  removable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:color', 'remove'])

const internalColor = ref(props.initialColor)

watch(
  () => props.initialColor,
  (newColor) => {
    internalColor.value = newColor
  },
)

const handleTextInput = () => {
  emit('update:color', internalColor.value)
}

const handleColorPickerInput = () => {
  emit('update:color', internalColor.value)
}
</script>

<template>
  <div class="color-selector-card">
    <div class="color-input-group">
      <input
        type="color"
        v-model="internalColor"
        @input="handleColorPickerInput"
        class="color-picker-input"
      />
      <input
        type="text"
        v-model="internalColor"
        @input="handleTextInput"
        placeholder="#RRGGBB ou nome da cor"
        class="text-input"
      />
    </div>
    <button v-if="removable" @click="$emit('remove')" class="secondary icon">
      <span class="material-symbols-outlined"> remove </span>
    </button>
  </div>
</template>

<style scoped>
.color-selector-card {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem;
  border: 1px solid var(--colors-border-medium);
  border-radius: 0.5rem;
  flex: 1 0 0;
}

.color-input-group {
  display: flex;
  gap: 0.25rem;
  width: 100%;
}

.text-input {
  font-family: 'Spline Sans Mono', monospace;
  flex-grow: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  min-width: 60px;
}

.color-picker-input {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--colors-border-medium);
  border-radius: 0.25rem;
  background-color: transparent;
  padding: 0;
  cursor: pointer;
}

/* Esconde as bordas feias do color picker no Firefox */
input[type='color']::-moz-focus-inner {
  border: 0;
}
input[type='color']::-webkit-color-swatch-wrapper {
  padding: 0;
}
input[type='color']::-webkit-color-swatch {
  border: none;
  border-radius: 0.25rem;
}

.icon {
  border-radius: 0.25rem;
  padding: 0.5rem 0.5rem;
}
</style>
