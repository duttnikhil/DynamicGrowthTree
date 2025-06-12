# Dynamic Tree Visualization Component

## Overview

The Dynamic Tree Visualization Component is a sophisticated Vue.js component that creates an interactive, growing tree visualization based on an array of objects. The tree evolves through different growth stages as more objects are added, with each object represented as a leaf on the tree.

## 🌟 Features

- **Dynamic Growth Stages**: Tree evolves from sprout to large tree
- **Interactive Leaves**: Hover to see object information
- **Multiple Tree Styles**: Green, Snowy, and Brown themes
- **Responsive Design**: Adapts to container size
- **High Performance**: Handles up to 750 objects efficiently
- **Customizable Branch Parameters**: Adjust angle and reduction factors
- **Special Object Types**: Gold and blue special objects
- **Intelligent Leaf Distribution**: Smart algorithm for leaf placement

## 📋 Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Component API](#component-api)
4. [Growth Stages](#growth-stages)
5. [Leaf Coloring System](#leaf-coloring-system)
6. [Tree Styles](#tree-styles)
7. [Configuration Options](#configuration-options)
8. [Performance Considerations](#performance-considerations)
9. [Examples](#examples)
10. [Troubleshooting](#troubleshooting)

## Installation

### Prerequisites

- Node.js 16+ 
- Vue.js 3.x
- Vite (recommended build tool)

### Setup

1. **Clone or download the component files:**
   ```bash
   git clone <repository-url>
   cd dynamic-tree-visualization
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install required peer dependencies:**
   ```bash
   npm install vue@^3.4.0
   npm install -D @vitejs/plugin-vue tailwindcss autoprefixer postcss
   ```

4. **Setup Tailwind CSS:**
   ```bash
   npx tailwindcss init -p
   ```

5. **Run development server:**
   ```bash
   npm run dev
   ```

## Quick Start

### Basic Implementation

```vue
<template>
  <div style="width: 800px; height: 600px;">
    <DynamicTree
      :objects="treeObjects"
      tree-style="green"
      :branch-params="branchParams"
      :width="800"
      :height="600"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import DynamicTree from './components/DynamicTree.vue'

const treeObjects = ref([
  { id: 1, name: 'Apple', value: 1 },
  { id: 2, name: 'Banana', value: 3 },
  { id: 3, name: 'Cherry', value: 1, special: 'blue' },
  { id: 4, name: 'Date', value: 2, special: 'gold' }
])

const branchParams = reactive({
  angle: Math.PI / 4.5,
  reduction: 0.70,
  hueBase: 30
})
</script>
```

## Component API

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `objects` | Array | ✅ | - | Array of objects to visualize |
| `treeStyle` | String | ✅ | - | Tree visual style ('green', 'snowy', 'brown') |
| `branchParams` | Object | ✅ | - | Branch configuration parameters |
| `width` | Number | ✅ | - | Canvas width in pixels |
| `height` | Number | ✅ | - | Canvas height in pixels |

### Object Structure

Each object in the `objects` array should have the following structure:

```javascript
{
  id: String | Number,        // Unique identifier
  name: String,               // Display name for the object
  value: Number,              // Value (1-10, affects leaf color)
  special?: 'blue' | 'gold'   // Optional special designation
}
```

### Branch Parameters

```javascript
{
  angle: Number,      // Branch angle in radians (0.5 - 1.5)
  reduction: Number,  // Length reduction factor (0.5 - 0.9)
  hueBase: Number    // Base hue for branch colors (0 - 360)
}
```

## Growth Stages

The tree progresses through six distinct growth stages based on object count:

| Stage | Threshold | Max Depth | Initial Length | Description |
|-------|-----------|-----------|----------------|-------------|
| **Sprout** | 0-1 objects | 1 | 15px | Simple stem |
| **Small Plant** | 2-24 objects | 3 | 30px | First branches appear |
| **Large Plant** | 25-74 objects | 5 | 50px | More branching |
| **Small Tree** | 75-199 objects | 7 | 80px | Tree-like structure |
| **Medium Tree** | 200-399 objects | 8 | 90px | Fuller canopy |
| **Large Tree** | 400+ objects | 9 | 100px | Full mature tree |

### Dynamic Scaling

For trees with 300+ objects, the component automatically:
- Increases tree height progressively
- Adds additional branch depth
- Optimizes leaf distribution for better visual balance

## Leaf Coloring System

Leaves are colored according to a sophisticated priority system:

### Color Priority (Highest to Lowest)

1. **Gold Special** (`special: 'gold'`)
   - Color: Bright gold/yellow
   - Holds exactly 1 object
   - Cannot be shared

2. **Blue Special** (`special: 'blue'`)
   - Color: Bright blue
   - Holds exactly 1 object
   - Cannot be shared

3. **Dark Green** (`value > 1 && value < 5`)
   - Color: Deep green
   - Can hold up to 5 objects
   - Shared when tree runs out of space

4. **Light Green** (`value === 1`)
   - Color: Light green
   - Default color for value-1 objects
   - Most common leaf type

### Leaf Sharing Logic

When the tree reaches maximum leaf capacity (~750 objects across ~150 leaves):
- Special leaves (gold/blue) remain exclusive
- Dark green leaves accept additional objects (up to 5 total)
- Light green leaves can transition to dark green when shared
- Tooltip shows all objects assigned to a leaf

## Tree Styles

### Green (Default)
- **Background**: Soft green gradient
- **Branches**: Brown to light brown
- **Leaves**: Various shades of green
- **Best for**: General use, nature themes

### Snowy (Winter)
- **Background**: Light blue/white gradient
- **Branches**: Gray to dark gray
- **Leaves**: Frosted blue-green tones
- **Best for**: Winter themes, cool color schemes

### Brown (Autumn)
- **Background**: Warm brown gradient
- **Branches**: Rich brown variations
- **Leaves**: Autumn colors (yellows, oranges)
- **Best for**: Autumn themes, warm color schemes

## Configuration Options

### Customizing Branch Parameters

```javascript
// More spread-out branches
const wideTreeParams = {
  angle: Math.PI / 3,    // Wider angle
  reduction: 0.75,       // Less reduction
  hueBase: 45           // Golden brown base
}

// More compact tree
const compactTreeParams = {
  angle: Math.PI / 6,    // Narrower angle
  reduction: 0.60,       // More reduction
  hueBase: 15           // Reddish brown base
}
```

### Dynamic Object Management

```javascript
// Add objects dynamically
const addObject = (name, value, special = null) => {
  if (objects.value.length >= 750) {
    console.warn('Maximum object limit reached')
    return false
  }
  
  const newObject = {
    id: Date.now() + Math.random(),
    name,
    value,
    ...(special && { special })
  }
  
  objects.value.push(newObject)
  return true
}

// Remove objects
const removeObject = (id) => {
  const index = objects.value.findIndex(obj => obj.id === id)
  if (index !== -1) {
    objects.value.splice(index, 1)
  }
}

// Update object properties
const updateObject = (id, updates) => {
  const index = objects.value.findIndex(obj => obj.id === id)
  if (index !== -1) {
    Object.assign(objects.value[index], updates)
  }
}
```

### Tree Style Configuration

```javascript
import { TreeStyle, TREE_STYLE_CONFIGS } from './config.js'

// Use predefined styles
const currentStyle = ref(TreeStyle.GREEN)

// Custom style configuration
const customStyleConfig = {
  background: [180, 50, 95],
  branchStrokeBase: (depth, baseHue) => [baseHue, 100, 80],
  leafColors: {
    lightGreen: [120, 150, 200],
    darkGreen: [120, 200, 120],
    blueSpecial: [240, 200, 220],
    goldSpecial: [60, 255, 240]
  }
}
```

## Performance Considerations

### Optimization Features

1. **Efficient Rendering**
   - Uses HTML5 Canvas for high-performance drawing
   - Implements smart redraw logic (leaves-only vs full scene)
   - Debounced hover events to prevent excessive redraws

2. **Memory Management**
   - Stable tree structure caching to prevent regeneration
   - Optimized leaf distribution algorithms
   - Efficient object-to-leaf assignment

3. **Scalability**
   - Handles up to 750 objects smoothly
   - Progressive enhancement for large datasets
   - Intelligent leaf spacing and collision detection

### Performance Tips

```javascript
// For better performance with large datasets
const optimizedConfig = {
  // Reduce branch complexity for 500+ objects
  maxBranchDepth: objects.length > 500 ? 8 : 9,
  
  // Adjust leaf spacing
  leafSpacing: objects.length > 400 ? 15 : 25,
  
  // Limit hover update frequency
  hoverDebounce: 16 // ~60fps
}
```

## Examples

### Example 1: Basic Tree with Mixed Objects

```vue
<template>
  <DynamicTree
    :objects="mixedObjects"
    tree-style="green"
    :branch-params="standardParams"
    :width="800"
    :height="600"
  />
</template>

<script setup>
const mixedObjects = ref([
  { id: 1, name: 'Regular Item', value: 1 },
  { id: 2, name: 'Important Item', value: 4 },
  { id: 3, name: 'Special Blue', value: 2, special: 'blue' },
  { id: 4, name: 'Special Gold', value: 3, special: 'gold' }
])

const standardParams = reactive({
  angle: Math.PI / 4.5,
  reduction: 0.70,
  hueBase: 30
})
</script>
```

### Example 2: Dynamic Data Loading

```vue
<template>
  <div>
    <button @click="loadMoreData">Load More Objects</button>
    <DynamicTree
      :objects="dynamicObjects"
      :tree-style="selectedStyle"
      :branch-params="adaptiveParams"
      :width="containerWidth"
      :height="containerHeight"
    />
  </div>
</template>

<script setup>
const dynamicObjects = ref([])
const selectedStyle = ref('green')

// Adaptive parameters based on object count
const adaptiveParams = computed(() => ({
  angle: dynamicObjects.value.length > 300 ? Math.PI / 5 : Math.PI / 4.5,
  reduction: dynamicObjects.value.length > 500 ? 0.65 : 0.70,
  hueBase: 30
}))

const loadMoreData = async () => {
  const newData = await fetchDataFromAPI()
  dynamicObjects.value.push(...newData)
}
</script>
```

### Example 3: Responsive Container

```vue
<template>
  <div ref="containerRef" class="tree-container">
    <DynamicTree
      :objects="objects"
      tree-style="snowy"
      :branch-params="branchParams"
      :width="containerDimensions.width"
      :height="containerDimensions.height"
    />
  </div>
</template>

<script setup>
import { useResizeObserver } from '@vueuse/core'

const containerRef = ref()
const containerDimensions = ref({ width: 800, height: 600 })

useResizeObserver(containerRef, (entries) => {
  const entry = entries[0]
  containerDimensions.value = {
    width: entry.contentRect.width,
    height: entry.contentRect.height
  }
})
</script>

<style scoped>
.tree-container {
  width: 100%;
  height: 60vh;
  min-height: 400px;
}
</style>
```

### Example 4: Batch Operations

```javascript
// Efficient batch operations
const batchAddObjects = (objectsToAdd) => {
  // Temporarily disable reactivity for better performance
  const currentObjects = [...objects.value]
  
  objectsToAdd.forEach(obj => {
    if (currentObjects.length < 750) {
      currentObjects.push({
        id: obj.id || Date.now() + Math.random(),
        name: obj.name,
        value: obj.value || 1,
        ...(obj.special && { special: obj.special })
      })
    }
  })
  
  // Batch update
  objects.value = currentObjects
}

// Generate test data
const generateTestData = (count) => {
  const testObjects = []
  for (let i = 0; i < count; i++) {
    testObjects.push({
      name: `Object ${i + 1}`,
      value: Math.floor(Math.random() * 5) + 1,
      special: Math.random() < 0.1 ? (Math.random() < 0.5 ? 'blue' : 'gold') : null
    })
  }
  return testObjects
}
```

## Responsive Design

### Container Adaptation

The component automatically adapts to its container dimensions:

```css
/* Recommended container styles */
.tree-visualization-container {
  width: 100%;
  height: 60vh;
  min-height: 400px;
  max-height: 800px;
  position: relative;
}

/* Mobile optimization */
@media (max-width: 768px) {
  .tree-visualization-container {
    height: 50vh;
    min-height: 300px;
  }
}
```

### Responsive Branch Parameters

```javascript
const getResponsiveBranchParams = (width, height, objectCount) => {
  const baseAngle = Math.PI / 4.5
  const baseReduction = 0.70
  
  // Adjust for container size
  const sizeMultiplier = Math.min(width, height) / 600
  const objectMultiplier = objectCount > 400 ? 0.9 : 1
  
  return {
    angle: baseAngle * sizeMultiplier,
    reduction: baseReduction * objectMultiplier,
    hueBase: 30
  }
}
```

## Error Handling and Edge Cases

### Common Issues and Solutions

1. **Empty Object Array**
   ```javascript
   // Component gracefully shows just a sprout
   const objects = ref([]) // Valid state
   ```

2. **Invalid Object Structure**
   ```javascript
   // Component validates and filters invalid objects
   const invalidObjects = [
     { name: 'Valid', value: 1 },
     { value: 2 }, // Missing name - will be filtered
     { name: 'Also Valid' } // Missing value - defaults to 1
   ]
   ```

3. **Performance with Large Datasets**
   ```javascript
   // Automatic optimization kicks in at 300+ objects
   const performanceMode = computed(() => objects.value.length > 300)
   ```

### Debugging Tips

```javascript
// Enable debug mode
const debugMode = ref(false)

// Debug information
const debugInfo = computed(() => ({
  objectCount: objects.value.length,
  leafCount: Math.min(objects.value.length, 750),
  currentStage: getCurrentStage(objects.value.length),
  specialObjects: objects.value.filter(obj => obj.special).length
}))

// Performance monitoring
const performanceMonitor = {
  renderTime: 0,
  lastRender: Date.now(),
  
  startRender() {
    this.lastRender = performance.now()
  },
  
  endRender() {
    this.renderTime = performance.now() - this.lastRender
    if (this.renderTime > 16) {
      console.warn(`Slow render: ${this.renderTime.toFixed(2)}ms`)
    }
  }
}
```

## Troubleshooting

### Common Problems

1. **Tree Not Rendering**
   - Check if container has explicit width/height
   - Verify object array structure
   - Ensure Tailwind CSS is properly configured

2. **Poor Performance**
   - Limit objects to 750 maximum
   - Avoid frequent prop changes
   - Use `v-memo` for object lists in parent components

3. **Leaves Not Appearing**
   - Verify objects have valid `name` and `value` properties
   - Check if objects exceed maximum limit
   - Ensure tree style is properly configured

4. **Tooltips Not Showing**
   - Check hover detection (mouse position)
   - Verify object assignment to leaves
   - Ensure tooltip container is not clipped

### Browser Compatibility

- **Supported**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Required Features**: HTML5 Canvas, ES6 Modules, CSS Grid
- **Polyfills**: Not required for supported browsers

## Migration Guide

### From Version 1.x to 2.x

```javascript
// Old API (v1.x)
<DynamicTree
  :data="treeData"
  style="default"
  :config="treeConfig"
/>

// New API (v2.x)
<DynamicTree
  :objects="treeData"
  tree-style="green"
  :branch-params="branchParams"
  :width="800"
  :height="600"
/>
```

### Configuration Changes

```javascript
// Old config structure
const oldConfig = {
  style: 'default',
  branchAngle: 45,
  branchReduction: 0.7
}

// New config structure
const newBranchParams = {
  angle: Math.PI / 4, // Radians instead of degrees
  reduction: 0.7,
  hueBase: 30
}
```

## API Reference

### Methods (Exposed via Template Ref)

```javascript
// Get reference to component
const treeRef = ref()

// Available methods
treeRef.value?.redrawTree()     // Force redraw
treeRef.value?.resetZoom()      // Reset to default view
treeRef.value?.exportImage()    // Export as PNG
```

### Events

```vue
<DynamicTree
  @leaf-hover="onLeafHover"
  @leaf-click="onLeafClick"
  @stage-change="onStageChange"
  @render-complete="onRenderComplete"
/>
```

Event handlers:
```javascript
const onLeafHover = (leaf) => {
  console.log('Hovered leaf:', leaf.assignedObjects)
}

const onLeafClick = (leaf) => {
  console.log('Clicked leaf:', leaf.id)
}

const onStageChange = (newStage, oldStage) => {
  console.log(`Stage changed from ${oldStage.name} to ${newStage.name}`)
}

const onRenderComplete = (renderTime) => {
  console.log(`Render completed in ${renderTime}ms`)
}
```

## Contributing

### Development Setup

1. Fork the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Make changes and test thoroughly
5. Submit pull request with detailed description

### Code Style

- Use TypeScript for new features
- Follow Vue 3 Composition API patterns
- Maintain 100% test coverage for new code
- Document all public APIs

### Testing

```bash
# Run unit tests
npm test

# Run performance tests
npm run test:performance

# Run visual regression tests
npm run test:visual
```

## License

MIT License - see LICENSE file for details.

## Support

- **Email**: thisisnikhildutt@gmail.com

---

**Version**: 2.0.0  
**Last Updated**: June 2025  
**Minimum Vue Version**: 3.4.0
