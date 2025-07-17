<script setup>
import { defineProps } from 'vue'
import { checkContrast, srgbLuminance, decompColor } from '../utils/ColorUtils' // Importar todas as funções necessárias

const props = defineProps({
  // A paleta de cores, que é um vetor de valores de cor (strings)
  palette: {
    type: Array,
    default: () => [],
  },
})

/**
 * Calcula e retorna a relação de contraste entre duas cores.
 * @param {string} color1 - O código da primeira cor (ex: #RRGGBB).
 * @param {string} color2 - O código da segunda cor (ex: #RRGGBB).
 * @returns {string} A relação de contraste formatada (ex: "4.50:1").
 */
const calculateAndDisplayContrast = (color1, color2) => {
  return checkContrast(color1, color2)
}

/**
 * Retorna uma cor de texto que tenha bom contraste com a cor de fundo fornecida.
 * Útil para o cabeçalho da tabela.
 * @param {string} backgroundColor - A cor de fundo para verificar.
 * @returns {string} '#FFFFFF' (branco) ou '#000000' (preto).
 */
const getContrastTextColor = (backgroundColor) => {
  try {
    const luminance = srgbLuminance(decompColor(backgroundColor))
    // Usa um limiar de luminância para decidir entre texto claro ou escuro
    // Um valor comum é 0.179 (WCAG 2.1) ou 0.5 (simples)
    return luminance > 0.179 ? '#000000' : '#FFFFFF'
  } catch (e) {
    console.error('Erro ao determinar cor do texto de contraste:', e)
    return '#000000' // Padrão preto em caso de erro
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
                <div class="contrast-cell" :style="{ backgroundColor: rowColor, color: colColor }">
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

h2 {
  text-align: left;
  margin-bottom: 1.5rem;
  color: #333;
}

.table-wrapper {
  overflow-x: auto;
  padding-bottom: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid var(--colors-border-medium);
}

th,
td {
  border: 1px solid var(--colors-border-medium);
  padding: 0;
  text-align: center;
  white-space: nowrap;
  min-width: 80px;
  height: 4rem;
  box-sizing: border-box; /* Garante que padding/border não aumentem o tamanho */
}

th {
  font-weight: bold;
  background-color: #f8f8f8; /* Fundo para células de cabeçalho padrão */
  position: sticky;
  top: 0;
  z-index: 2;
}

th:first-child {
  background-color: #f0f0f0;
  z-index: 3;
}

tbody th {
  position: sticky;
  left: 0;
  z-index: 1;
}

.contrast-cell {
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
  background-color: #f0f0f0; /* Cor para células na diagonal */
  display: flex;
  align-items: center;
  justify-content: center;
  /* Pode adicionar um ícone ou texto como 'N/A' se quiser */
}
</style>
