<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import ColorInput from '../components/ColorInput.vue'
import ColorCombinationsList from '../components/ColorCombinationsList.vue'
import ColorCombinationsTable from '../components/ColorCombinationsTable.vue'
import { checkContrast } from '../utils/ColorUtils'

const colorPalette = ref([])
const activeView = ref('list')
const plainColorPalette = computed(() => colorPalette.value.map((c) => c.value))
const fileInput = ref(null)
const selectedCombinations = ref([])
let nextId = 0

onMounted(() => {
  addColorSelector('#FFFFFF')
  addColorSelector('#000000')
  handleGenerateCombinations()
})

watch(
  colorPalette,
  () => {
    handleGenerateCombinations()
  },
  { deep: true },
)

const addColorSelector = (initialColor = '#FFFFFF') => {
  colorPalette.value.push({
    id: nextId++,
    value: initialColor,
  })
}

const removeColorSelector = (index) => {
  if (colorPalette.value.length > 2) {
    const removedColor = colorPalette.value[index].value
    selectedCombinations.value = selectedCombinations.value.filter(
      (comb) => comb[0] !== removedColor && comb[1] !== removedColor,
    )
    colorPalette.value.splice(index, 1)
  }
}

const updateColor = (index, newColor) => {
  const oldColor = colorPalette.value[index].value
  colorPalette.value[index].value = newColor

  selectedCombinations.value = selectedCombinations.value.map((comb) => {
    let updatedComb = [...comb]
    if (updatedComb[0] === oldColor) {
      updatedComb[0] = newColor
    }
    if (updatedComb[1] === oldColor) {
      updatedComb[1] = newColor
    }
    return updatedComb
  })
}

const generatedCombinations = ref([])

const handleGenerateCombinations = () => {
  const currentColors = colorPalette.value.map((colorObj) => colorObj.value)
  generatedCombinations.value = generateAllPairs(currentColors)
}

const generateAllPairs = (colors) => {
  const combinations = []
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      combinations.push([colors[i], colors[j]])
    }
  }
  return combinations
}

const resetSelections = () => {
  selectedCombinations.value = []
  colorPalette.value = []
  nextId = 0

  addColorSelector('#FFFFFF')
  addColorSelector('#000000')

  handleGenerateCombinations()
}

const currentFilter = ref('all')

const filteredCombinations = computed(() => {
  if (currentFilter.value === 'all') {
    return generatedCombinations.value
  }

  return generatedCombinations.value.filter((combination) => {
    const contrastRatioString = checkContrast(combination[0], combination[1])
    const ratio = parseFloat(contrastRatioString.split(':')[0])

    switch (currentFilter.value) {
      case 'aa-large':
        return ratio >= 3.1
      case 'aa-normal':
        return ratio >= 4.5
      case 'aaa':
        return ratio >= 7.0
      default:
        return true
    }
  })
})

const generateRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}`
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const importPalette = (event) => {
  const file = event.target.files[0]

  if (!file) {
    return
  }

  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    alert('Por favor, selecione um arquivo JSON válido (.json).')
    event.target.value = ''
    return
  }

  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result)

      if (
        !importedData ||
        !Array.isArray(importedData.palette) ||
        importedData.palette.some(
          (item) => typeof item !== 'string' || !item.match(/^#([0-9a-fA-F]{3}){1,2}$/i),
        )
      ) {
        alert(
          'Formato de arquivo JSON inválido. O arquivo deve conter uma propriedade "palette" que é um array de strings de cores hexadecimais (ex: ["#FF0000", "#00FF00"]).',
        )
        return
      }

      const newColorPalette = []
      let newNextId = 0

      importedData.palette.forEach((color) => {
        newColorPalette.push({
          id: newNextId++,
          value: color,
        })
      })

      colorPalette.value = newColorPalette
      nextId = newNextId

      if (importedData.selectedCombinations && Array.isArray(importedData.selectedCombinations)) {
        const validSelectedCombinations = importedData.selectedCombinations.filter(
          (comb) =>
            Array.isArray(comb) &&
            comb.length === 2 &&
            typeof comb[0] === 'string' &&
            typeof comb[1] === 'string' &&
            comb[0].match(/^#([0-9a-fA-F]{3}){1,2}$/i) &&
            comb[1].match(/^#([0-9a-fA-F]{3}){1,2}$/i),
        )
        selectedCombinations.value = validSelectedCombinations
      } else {
        selectedCombinations.value = []
      }

      handleGenerateCombinations()

      alert('Paleta e seleções importadas com sucesso!')
    } catch (error) {
      console.error('Erro ao parsear o JSON ou processar dados:', error)
      alert(
        'Erro ao ler o arquivo JSON. Certifique-se de que é um JSON válido e segue a estrutura esperada.',
      )
    } finally {
      event.target.value = ''
    }
  }

  reader.onerror = () => {
    alert('Erro ao ler o arquivo.')
  }

  reader.readAsText(file)
}

const exportSelected = () => {
  if (selectedCombinations.value.length === 0) {
    alert('Nenhuma combinação selecionada para exportar!')
    return
  }

  const currentPaletteForExport = plainColorPalette.value
  const selectedCombinationsData = selectedCombinations.value.map((comb) => ({
    color1: comb[0],
    color2: comb[1],
    contrast: checkContrast(comb[0], comb[1]), // Recalcula o contraste para garantir que esteja atualizado
  }))

  const dataToExport = {
    palette: currentPaletteForExport,
    selectedCombinations: selectedCombinationsData,
  }

  const jsonString = JSON.stringify(dataToExport, null, 2)

  const blob = new Blob([jsonString], { type: 'application/json' })

  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'color_palette_and_combinations.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  alert('Paleta e combinações selecionadas exportadas como JSON!')
}

const exportPaletteOnly = () => {
  const dataToExport = {
    palette: plainColorPalette.value,
  }

  const jsonString = JSON.stringify(dataToExport, null, 2)

  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'color_palette.json' // Name of the exported file
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  alert('Paleta de cores exportada com sucesso!')
}
</script>

<template>
  <div>
    <header>
      <h2>Verificador de paleta</h2>
      <button @click="exportSelected" class="secondary">Exportar Selecionados</button>
    </header>
    <main>
      <aside class="container col left">
        <div class="container close">
          <h1 style="flex: 1 0 0">Paleta de cores</h1>
          <button class="secondary icon" @click="triggerFileInput" title="Importar paleta">
            <span class="material-icons-outlined">file_open</span>
          </button>
          <input
            type="file"
            ref="fileInput"
            accept=".json"
            @change="importPalette"
            style="display: none"
          />
          <button class="secondary icon" @click="exportPaletteOnly" title="Exportar paleta">
            <span class="material-icons-outlined">download</span>
          </button>
        </div>

        <div class="container close">
          <button @click="addColorSelector(generateRandomColor())" class="secondary icon">
            <span class="material-icons-outlined" title="Adicionar cor">add</span>
          </button>
          <button class="secondary icon">
            <span
              class="material-icons-outlined"
              @click="resetSelections"
              title="Reiniciar seleções"
              >restart_alt</span
            >
          </button>
          <button @click="handleGenerateCombinations" class="primary" id="generate-combinations">
            Gerar Combinações
          </button>
        </div>

        <div class="list">
          <ColorInput
            v-for="(colorObj, index) in colorPalette"
            :key="colorObj.id"
            :initial-color="colorObj.value"
            :removable="colorPalette.length > 2"
            @update:color="updateColor(index, $event)"
            @remove="removeColorSelector(index)"
          />
        </div>
      </aside>

      <hr />

      <div class="container col right">
        <div class="actions">
          <h2 style="flex: 1 0 0">Combinações Geradas</h2>
          <div class="view-toggle-buttons"></div>
          <button
            :class="{ secondary: true, active: activeView === 'list' }"
            @click="activeView = 'list'"
          >
            Lista
          </button>
          <button
            :class="{ secondary: true, active: activeView === 'table' }"
            @click="activeView = 'table'"
          >
            Tabela
          </button>
        </div>
        <div>
          <div class="container col scroll" v-if="activeView === 'list'">
            <div class="filters-container">
              <button
                :class="{ chip: true, active: currentFilter === 'all' }"
                @click="currentFilter = 'all'"
              >
                Todos ({{ generatedCombinations.length }})
              </button>
              <button
                :class="{ chip: true, active: currentFilter === 'aa-large' }"
                @click="currentFilter = 'aa-large'"
              >
                AA Grande (>3.1:1) ({{
                  filteredCombinations.filter(
                    (c) =>
                      checkContrast(c[0], c[1]).startsWith('3.1:') ||
                      parseFloat(checkContrast(c[0], c[1]).split(':')[0]) >= 3.1,
                  ).length
                }})
              </button>
              <button
                :class="{ chip: true, active: currentFilter === 'aa-normal' }"
                @click="currentFilter = 'aa-normal'"
              >
                AA Normal (>4.5:1) ({{
                  filteredCombinations.filter(
                    (c) =>
                      checkContrast(c[0], c[1]).startsWith('4.5:') ||
                      parseFloat(checkContrast(c[0], c[1]).split(':')[0]) >= 4.5,
                  ).length
                }})
              </button>
              <button
                :class="{ chip: true, active: currentFilter === 'aaa' }"
                @click="currentFilter = 'aaa'"
              >
                AAA (>7:1) ({{
                  filteredCombinations.filter(
                    (c) =>
                      checkContrast(c[0], c[1]).startsWith('7.0:') ||
                      parseFloat(checkContrast(c[0], c[1]).split(':')[0]) >= 7.0,
                  ).length
                }})
              </button>
            </div>

            <ColorCombinationsList
              :combinations="filteredCombinations"
              :selected-combinations="selectedCombinations"
              @update:selectedCombinations="selectedCombinations = $event"
            />
          </div>
        </div>
        <div class="container table-view" v-if="activeView === 'table'">
          <ColorCombinationsTable :palette="plainColorPalette" />
        </div>
      </div>
    </main>
  </div>
</template>

<style>
header {
  height: 5rem;
  background-color: var(--colors-surface-a);
  display: flex;
  align-items: center;
  padding: 1.5rem 2rem;
  gap: 0.5rem;
  border-bottom: 1px solid var(--colors-border-medium);
  position: sticky;
  top: 0;
  z-index: 100;
}

header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  flex: 1;
}

.color-selectors-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.filters-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

#generate-combinations {
  margin-left: auto;
}
</style>
