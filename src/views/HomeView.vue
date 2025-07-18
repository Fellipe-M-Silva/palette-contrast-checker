<script setup>
import { ref, onMounted, computed } from 'vue'
import ColorInput from '../components/ColorInput.vue'
import ColorCombinationsList from '../components/ColorCombinationsList.vue'
import ColorCombinationsTable from '../components/ColorCombinationsTable.vue'
import { checkContrast } from '../utils/ColorUtils'

const colorPalette = ref([])
const activeView = ref('list')
const plainColorPalette = computed(() => colorPalette.value.map((c) => c.value))
let nextId = 0

onMounted(() => {
  addColorSelector('#000000')
  addColorSelector('#FFFFFF')
})

const addColorSelector = (initialColor = '#FFFFFF') => {
  colorPalette.value.push({
    id: nextId++,
    value: initialColor,
  })
}

const removeColorSelector = (index) => {
  if (colorPalette.value.length > 2) {
    colorPalette.value.splice(index, 1)
  }
}

const updateColor = (index, newColor) => {
  colorPalette.value[index].value = newColor
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
</script>

<template>
  <div>
    <header>
      <h2>Verificador de paleta</h2>
    </header>
    <main>
      <aside class="container left">
        <h1>Paleta de cores</h1>
        <div class="actions">
          <button @click="addColorSelector(generateRandomColor())" class="secondary">
            + Adicionar Cor
          </button>
          <button @click="handleGenerateCombinations" class="primary">Gerar Combinações</button>
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

      <div class="container right">
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
          <div class="container scroll" v-if="activeView === 'list'">
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
  border-bottom: 1px solid var(--colors-border-medium);
  position: sticky;
  top: 0;
  z-index: 100;
}

header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
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
</style>
