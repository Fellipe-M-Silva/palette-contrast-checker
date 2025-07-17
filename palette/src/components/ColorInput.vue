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
    <button v-if="removable" @click="$emit('remove')" class="remove-button">Remover</button>
  </div>
</template>

<style scoped>
.color-selector-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--colors-border-medium);
  border-radius: 0.5rem;
  flex: 1;
}

.color-input-group {
  display: flex;
  gap: 10px;
  width: 100%;
}

.text-input {
  flex-grow: 1; /* Ocupa o espaço restante */
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.color-picker-input {
  width: 40px; /* Tamanho fixo para o color picker */
  height: 40px;
  border: 1px solid var(--colors-border-medium);
  border-radius: 0.25rem;
  background-color: transparent; /* Fundo transparente */
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

.remove-button {
  background-color: #fcfcfc;
  height: 40px;
  color: #e74c3c;
  border: solid 1px var(--colors-border-medium);
  padding: 8px 12px;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-button:hover {
  background-color: #f2f2f2;
}
</style>
