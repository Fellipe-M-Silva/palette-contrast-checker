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

const currentFilter = ref('all') // Default filter

const filteredCombinations = computed(() => {
  // Using computed property for efficiency
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
</script>

<template>
  <div>
    <header>
      <h4>Gerador de Combinações de Cores</h4>
    </header>
    <main>
      <div class="container left">
        <h2>Paleta de cores</h2>
        <div class="actions">
          <button @click="addColorSelector('#FFFFFF')" class="add-button">Adicionar Cor</button>
          <button @click="handleGenerateCombinations" class="generate-button">
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
      </div>

      <div class="container right">
        <div class="actions">
          <h2 style="flex: 1 0 0;">Combinações Geradas</h2>
        <div class="view-toggle-buttons">
        </div>
          <button
            :class="{ 'toggle-button': true, active: activeView === 'list' }"
            @click="activeView = 'list'"
          >
            Lista
          </button>
          <button
            :class="{ 'toggle-button': true, active: activeView === 'table' }"
            @click="activeView = 'table'"
          >
            Tabela
          </button>
        </div>
        <div>
          <div class="container" v-if="activeView === 'list'">

            <div class="filters-container">
              <button
                :class="{ 'filter-button': true, active: currentFilter === 'all' }"
                @click="currentFilter = 'all'"
              >
                Todos ({{ generatedCombinations.length }})
              </button>
              <button
                :class="{ 'filter-button': true, active: currentFilter === 'aa-large' }"
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
                :class="{ 'filter-button': true, active: currentFilter === 'aa-normal' }"
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
                :class="{ 'filter-button': true, active: currentFilter === 'aaa' }"
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
        <div class="container right table-view" v-if="activeView === 'table'">
          <ColorCombinationsTable :palette="plainColorPalette" />
        </div>
      </div>
    </main>
  </div>
</template>

<style>
header {
  height: 5rem;
  background-color: var(--vt-c-white-soft);
  display: flex;
  align-items: center;
  padding: 1.5rem;
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

.add-button,
.generate-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.add-button {
  background-color: #2ecc71;
  color: white;
}

.add-button:hover {
  background-color: #27ae60;
}

.generate-button {
  background-color: #3498db;
  color: white;
}

.generate-button:hover {
  background-color: #2980b9;
}

.toggle-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s, color 0.2s;
}

.filters-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filters-container button {
  background-color: var(--vt-c-white-soft);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
}
</style>
