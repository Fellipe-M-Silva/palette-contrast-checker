<script setup>
import { defineProps, ref, watch } from 'vue'
import { checkContrast } from '../utils/ColorUtils'

const props = defineProps({
  combinations: {
    type: Array,
    default: () => [],
  },
  selectedCombinations: {
    type: Array,
    default: () => [],
  },
})

// const emit = defineEmits(['update:selectedCombinations'])

const internalSelectedCombinations = ref([...props.selectedCombinations])

watch(
  () => props.selectedCombinations,
  (newSelected) => {
    internalSelectedCombinations.value = [...newSelected]
  },
  { deep: true },
)

// const isSelected = (combination) => {
//   return internalSelectedCombinations.value.some(
//     (selected) => selected[0] === combination[0] && selected[1] === combination[1],
//   )
// }

// const toggleSelection = (combination) => {
//   const index = internalSelectedCombinations.value.findIndex(
//     (selected) => selected[0] === combination[0] && selected[1] === combination[1],
//   )

//   if (index > -1) {
//     internalSelectedCombinations.value.splice(index, 1)
//   } else {
//     internalSelectedCombinations.value.push(combination)
//   }

//   emit('update:selectedCombinations', [...internalSelectedCombinations.value])
// }

const calculateAndDisplayContrast = (color1, color2) => {
  return checkContrast(color1, color2)
}
</script>

<template>
  <div class="color-combinations">
    <p v-if="combinations.length === 0">Nenhuma combinação para exibir.</p>
    <div v-else class="list">
      <div v-for="(combination, index) in combinations" :key="index" class="combination-item">
        <div class="text-preview-box" :style="{ backgroundColor: combination[0] }">
          <p :style="{ color: combination[1] }">
            Fundo {{ combination[0] }} com texto em {{ combination[1] }}
          </p>
        </div>
        <p class="contrast-ratio">
          <strong>{{ calculateAndDisplayContrast(combination[0], combination[1]) }}</strong>
        </p>

        <!-- <div class="export-selection">
          <input
            type="checkbox"
            :id="`select-${index}`"
            :checked="isSelected(combination)"
            @change="toggleSelection(combination)"
          />
        </div> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-combinations {
  display: flex;
  margin-top: 0.5rem;
  flex: 1 0 0;
  flex-direction: column;
}

.combination-item {
  display: flex;
  align-items: center;

  gap: 1rem;
  border: 1px solid var(--colors-border-medium);
  border-radius: 0.5rem;
  padding: 0.25rem;
  background-color: var(--colors-surface-a);
  transition: all 0.3s ease-out;
}

.combination-item:hover {
  background-color: var(--colors-surface-b);
}

.text-preview-box {
  flex: 5 0 0;
  display: flex;
  padding: 0.5rem 1rem;
  align-items: center;
  border: 1px solid var(--colors-border-light);
  border-radius: 0.25rem;
}

.contrast-ratio {
  font-family: 'Spline Sans Mono', monospace;
  flex: 1 0 0;
  font-weight: bold;
  color: #333;
}

input[type='checkbox'] {
  margin: 0.5rem 1rem;
}
</style>
