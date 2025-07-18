<script setup>
import { defineProps } from 'vue'
import { checkContrast, srgbLuminance, decompColor } from '../utils/ColorUtils'

const props = defineProps({
  palette: {
    type: Array,
    default: () => [],
  },
  filteredCombinations: {
    type: Array,
    default: () => [],
  },
  allCombinations: {
    type: Array,
    default: () => [],
  },
})

const isCombinationActive = (color1, color2) => {
  const c1Lower = color1.toLowerCase()
  const c2Lower = color2.toLowerCase()

  return props.filteredCombinations.some(
    (comb) =>
      (comb[0].toLowerCase() === c1Lower && comb[1].toLowerCase() === c2Lower) ||
      (comb[0].toLowerCase() === c2Lower && comb[1].toLowerCase() === c1Lower),
  )
}

const calculateAndDisplayContrast = (color1, color2) => {
  return checkContrast(color1, color2)
}

const getContrastTextColor = (backgroundColor) => {
  try {
    const luminance = srgbLuminance(decompColor(backgroundColor))
    return luminance > 0.179 ? '#000000' : '#FFFFFF'
  } catch (e) {
    console.error('Erro ao determinar cor do texto de contraste:', e)
    return '#000000'
  }
}
</script>

<template>
  <div class="color-combinations-table">
    <p v-if="props.palette.length < 2">
      Adicione pelo menos duas cores para ver a tabela de contraste.
    </p>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th></th>
            <th
              v-for="color in props.palette"
              :key="color"
              :style="{ backgroundColor: color, color: getContrastTextColor(color) }"
            >
              {{ color }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rowColor in palette" :key="rowColor">
            <th :style="{ backgroundColor: rowColor, color: getContrastTextColor(rowColor) }">
              {{ rowColor }}
            </th>
            <td v-for="colColor in palette" :key="colColor">
              <template v-if="rowColor === colColor">
                <div class="diagonal-cell"></div>
              </template>
              <template v-else>
                <div
                  :class="{
                    'contrast-cell': true,
                    'inactive-combination': !isCombinationActive(rowColor, colColor),
                  }"
                  :style="{
                    backgroundColor: colColor,
                    color: isCombinationActive(rowColor, colColor) ? rowColor : 'inherit',
                  }"
                >
                  {{ calculateAndDisplayContrast(rowColor, colColor) }}
                </div>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.color-combinations-table {
  width: 100%;
  text-align: center;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--colors-border-medium);
  border-radius: 0.5rem;
}

table {
  width: 100%;
  border-spacing: 0.5rem;
  border-radius: 0.5rem;
  overflow: hidden;
}

th,
td {
  border: 1px solid var(--colors-border-medium);
  padding: 0;
  text-align: center;
  white-space: nowrap;
  border-radius: 0.25rem;
  min-width: 80px;
  height: 4rem;
  box-sizing: border-box; /* Garante que padding/border não aumentem o tamanho */
}

th {
  font-weight: bold;
  background-color: #f8f8f8;
}

th:first-child {
  background-color: #f0f0f0;
}

.contrast-cell {
  border-radius: 0.25rem;
  border: 1px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.diagonal-cell {
  width: 100%;
  height: 100%;
  background-color: #f3f3f3; /* Cor para células na diagonal */
  display: flex;
  align-items: center;
  justify-content: center;
  /* Pode adicionar um ícone ou texto como 'N/A' se quiser */
}

.inactive-combination {
  background-color: var(--colors-surface-b) !important;
  color: transparent;
  pointer-events: none;
  opacity: 0.6;
}

.selection-checkbox {
  position: relative;
  top: 1rem;
  left: 0.5rem;
  cursor: pointer;
}
</style>
