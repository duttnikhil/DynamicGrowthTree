<template>
  <div id="app" class="min-h-screen bg-gray-100 p-4">
    <!-- Header -->
    <header class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800 text-center mb-2">
        Dynamic Tree Visualization
      </h1>
      <p class="text-gray-600 text-center">
        Interactive tree component that grows based on your data
      </p>
    </header>

    <!-- Controls Panel -->
    <div class="max-w-6xl mx-auto mb-6">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Tree Style Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tree Style
            </label>
            <select 
              v-model="selectedTreeStyle" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="green">🌲 Green (Default)</option>
              <option value="snowy">❄️ Snowy (Winter)</option>
              <option value="brown">🍂 Brown (Autumn)</option>
            </select>
          </div>

          <!-- Branch Parameters -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Branch Angle: {{ Math.round(branchParams.angle * 180 / Math.PI) }}°
            </label>
            <input 
              v-model.number="branchParams.angle" 
              type="range" 
              min="0.5" 
              max="1.5" 
              step="0.1" 
              class="w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Branch Reduction: {{ Math.round(branchParams.reduction * 100) }}%
            </label>
            <input 
              v-model.number="branchParams.reduction" 
              type="range" 
              min="0.5" 
              max="0.9" 
              step="0.05" 
              class="w-full"
            />
          </div>
          
        </div>

        <!-- Object Management -->
        <div class="mt-6 border-t pt-6">
          <div class="flex flex-wrap gap-4 items-end">
            <div class="flex-1 min-w-48">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Add New Object
              </label>
              <input 
                v-model="newObjectName" 
                type="text" 
                placeholder="Object name..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                @keyup.enter="addObject"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Value
              </label>
              <input 
                v-model.number="newObjectValue" 
                type="number" 
                min="1" 
                max="10"
                class="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Special
              </label>
              <select 
                v-model="newObjectSpecial" 
                class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                <option value="blue">Blue</option>
                <option value="gold">Gold</option>
              </select>
            </div>
            
            <button 
              @click="addObject"
              :disabled="!newObjectName.trim()"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add Object
            </button>
          </div>

          <!-- Quick Actions -->
          <div class="mt-4 flex flex-wrap gap-2">
            <button 
              @click="generateSampleData(10)"
              class="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
            >
              Add 10 Sample Objects
            </button>
            <button 
              @click="generateSampleData(50)"
              class="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
            >
              Add 50 Sample Objects
            </button>
            <button 
              @click="generateSampleData(200)"
              class="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
            >
              Add 200 Sample Objects
            </button>
            <button 
              @click="clearAllObjects"
              class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tree Visualization -->
    <div class="max-w-6xl mx-auto">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-800">
              Tree Visualization
            </h2>
            <p class="text-sm text-gray-600">
              Objects: {{ objects.length }} | 
              Stage: {{ currentStage.name }} |
              Leaves: {{ Math.min(objects.length, 750) }}
            </p>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-green-300 rounded-full"></div>
                <span>Light Green (value = 1)</span>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <div class="w-3 h-3 bg-green-600 rounded-full"></div>
                <span>Dark Green (value > 1)</span>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Blue (special)</span>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Gold (special)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="relative w-full" style="height: 600px;">
          <DynamicTree
            :objects="objects"
            :tree-style="selectedTreeStyle"
            :branch-params="branchParams"
            :width="800"
            :height="600"
          />
        </div>
      </div>
    </div>

    <!-- Object List -->
    <div class="max-w-6xl mx-auto mt-6" v-if="objects.length > 0">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">
          Current Objects ({{ objects.length }}/750)
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
          <div 
            v-for="(obj, index) in objects" 
            :key="obj.id"
            class="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
          >
            <div class="flex items-center gap-2">
              <div 
                class="w-3 h-3 rounded-full"
                :class="{
                  'bg-green-300': obj.value === 1 && !obj.special,
                  'bg-green-600': obj.value > 1 && obj.value < 5 && !obj.special,
                  'bg-blue-500': obj.special === 'blue',
                  'bg-yellow-500': obj.special === 'gold'
                }"
              ></div>
              <span class="font-medium">{{ obj.name }}</span>
              <span class="text-gray-500">({{ obj.value }})</span>
              <span v-if="obj.special" class="text-xs px-2 py-1 rounded-full"
                :class="{
                  'bg-blue-100 text-blue-800': obj.special === 'blue',
                  'bg-yellow-100 text-yellow-800': obj.special === 'gold'
                }"
              >
                {{ obj.special }}
              </span>
            </div>
            <button 
              @click="removeObject(index)"
              class="text-red-500 hover:text-red-700 text-xs"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import DynamicTree from './components/DynamicTree.vue';
import { TreeStyle, INITIAL_BRANCH_PARAMS, GROWTH_STAGES } from './config.js';

// Reactive state
const objects = ref([]);
const selectedTreeStyle = ref(TreeStyle.GREEN);
const branchParams = reactive({ ...INITIAL_BRANCH_PARAMS });

// Form inputs
const newObjectName = ref('');
const newObjectValue = ref(1);
const newObjectSpecial = ref('');

// Computed properties
const currentStage = computed(() => {
  return [...GROWTH_STAGES].reverse().find(stage => objects.value.length >= stage.threshold) || GROWTH_STAGES[0];
});

// Methods
const addObject = () => {
  if (!newObjectName.value.trim()) return;
  if (objects.value.length >= 750) {
    alert('Maximum of 750 objects allowed');
    return;
  }

  const newObject = {
    id: Date.now() + Math.random(), // Unique ID
    name: newObjectName.value.trim(),
    value: newObjectValue.value || 1,
  };

  if (newObjectSpecial.value) {
    newObject.special = newObjectSpecial.value;
  }

  objects.value.push(newObject);

  // Reset form
  newObjectName.value = '';
  newObjectValue.value = 1;
  newObjectSpecial.value = '';
};

const removeObject = (index) => {
  objects.value.splice(index, 1);
};

const clearAllObjects = () => {
  if (confirm('Are you sure you want to clear all objects?')) {
    objects.value = [];
  }
};

const generateSampleData = (count) => {
  const sampleNames = [
    'Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew',
    'Kiwi', 'Lemon', 'Mango', 'Nectarine', 'Orange', 'Papaya', 'Quince', 'Raspberry',
    'Strawberry', 'Tangerine', 'Ugli fruit', 'Vanilla', 'Watermelon', 'Xigua', 'Yuzu', 'Zucchini',
    'Artichoke', 'Broccoli', 'Carrot', 'Daikon', 'Eggplant', 'Fennel', 'Garlic', 'Herbs',
    'Iceberg', 'Jalapeño', 'Kale', 'Lettuce', 'Mushroom', 'Nutmeg', 'Onion', 'Pepper',
    'Quinoa', 'Radish', 'Spinach', 'Tomato', 'Ube', 'Vinegar', 'Wasabi', 'Xylem', 'Yam', 'Zest'
  ];

  const specialTypes = ['', '', '', 'blue', 'gold']; // Weighted towards no special

  for (let i = 0; i < count && objects.value.length < 750; i++) {
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const randomValue = Math.floor(Math.random() * 5) + 1;
    const randomSpecial = specialTypes[Math.floor(Math.random() * specialTypes.length)];
    
    const newObject = {
      id: Date.now() + Math.random() + i,
      name: `${randomName} ${objects.value.length + 1}`,
      value: randomValue,
    };

    if (randomSpecial) {
      newObject.special = randomSpecial;
    }

    objects.value.push(newObject);
  }
};

// Initialize with a few sample objects
generateSampleData(5);
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
</style>