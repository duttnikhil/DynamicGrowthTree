<template>
  <div class="relative w-full h-full" style="position: relative; overflow: hidden">
    <canvas
      ref="canvasRef"
      :width="width"
      :height="height"
      class="w-full h-full block border border-gray-700 rounded-lg shadow-lg transition-opacity duration-500"
      :class="{ 'opacity-0': !isReady }"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
      :style="{ cursor: hoveredLeaf ? 'pointer' : 'default' }"
    />

    <!-- Tooltip -->
    <div
      v-if="hoveredLeaf && hoveredLeaf.assignedObjects.length > 0 && canvasRect"
      class="fixed bg-gray-900 text-white p-3 rounded-lg shadow-2xl border border-gray-500 pointer-events-none z-50 transition-opacity duration-200"
      :style="{
        left: `${tooltipPos.x}px`,
        top: `${tooltipPos.y}px`,
        transform: tooltipPos.transform,
        maxWidth: '220px',
        fontSize: '13px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
      }"
    >
      <div class="font-bold text-green-400 mb-2 border-b border-gray-600 pb-1">
        Leaf Information
      </div>
      <ul class="text-gray-200 list-disc list-inside">
        <li v-for="obj in hoveredLeaf.assignedObjects" :key="obj.id" class="mb-2">
          <div>{{ obj.name }}</div>
          <div class="text-xs pl-2 text-gray-400">
            Value: <span class="text-white font-semibold">{{ obj.value }}</span>
            <span v-if="obj.special" :class="['ml-2 capitalize px-1.5 py-0.5 rounded-full text-xs font-medium', obj.special === 'gold' ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white']">
              {{ obj.special }}
            </span>
          </div>
        </li>
      </ul>
      <div class="absolute w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" :style="tooltipPos.arrowStyle" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { GROWTH_STAGES, TREE_STYLE_CONFIGS, LEAF_SIZE_BASE, MAX_OBJECTS_PER_LEAF } from '../config';

const props = defineProps({
  objects: { type: Array, required: true },
  treeStyle: { type: String, required: true },
  branchParams: { type: Object, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
});

const canvasRef = ref(null);
const hoveredLeaf = ref(null);
const mousePos = ref({ x: 0, y: 0 });
const canvasRect = ref(null);
const isReady = ref(false);

const processedLeaves = ref([]);
let potentialLeafPositions = [];
let treeStructure = null; // Store complete tree structure
let branchPaths = []; // Store branch paths to prevent re-rendering

const assignObjectsToLeaves = () => {
  const objectCount = props.objects.length;
  let maxLeaves = Math.min(objectCount, 750); // Max 750 leaves
  
  if (maxLeaves === 0) {
    processedLeaves.value = [];
    return;
  }

  const styleConfig = TREE_STYLE_CONFIGS[props.treeStyle];
  
  // At 750 objects, each object gets its own leaf (1:1 ratio)
  const tempLeaves = Array.from({ length: maxLeaves }, (_, i) => ({
    id: `leaf_${i}`,
    assignedObjects: [],
    isSpecial: null,
    isLocked: false,
  }));

  const remainingObjects = [...props.objects];
  const specialObjects = remainingObjects.filter(o => o.special);
  const otherObjects = remainingObjects.filter(o => !o.special);

  // Assign special objects first
  for (const obj of specialObjects) {
    const emptyLeaf = tempLeaves.find(l => l.assignedObjects.length === 0);
    if (emptyLeaf) {
      emptyLeaf.assignedObjects.push(obj);
      emptyLeaf.isSpecial = obj.special;
      emptyLeaf.isLocked = true;
    }
  }

  // For 750 objects, assign one object per leaf
  if (objectCount >= 750) {
    otherObjects.forEach((obj, index) => {
      const leafIndex = specialObjects.length + index;
      if (leafIndex < tempLeaves.length && tempLeaves[leafIndex].assignedObjects.length === 0) {
        tempLeaves[leafIndex].assignedObjects.push(obj);
      }
    });
  } else {
    // For fewer objects, distribute more evenly
    for (const obj of otherObjects) {
      const emptyLeaf = tempLeaves.find(l => l.assignedObjects.length === 0);
      if (emptyLeaf) {
        emptyLeaf.assignedObjects.push(obj);
      } else {
        // Find leaf with least objects that's not locked
        const targetLeaf = tempLeaves
          .filter(l => !l.isLocked && l.assignedObjects.length < MAX_OBJECTS_PER_LEAF)
          .sort((a, b) => a.assignedObjects.length - b.assignedObjects.length)[0];
        if (targetLeaf) targetLeaf.assignedObjects.push(obj);
      }
    }
  }

  processedLeaves.value = tempLeaves
    .filter(l => l.assignedObjects.length > 0)
    .map(l => {
      let displayColor;
      if (l.isSpecial === 'gold') displayColor = styleConfig.leafColors.goldSpecial;
      else if (l.isSpecial === 'blue') displayColor = styleConfig.leafColors.blueSpecial;
      else if (l.assignedObjects.length > 1 || (l.assignedObjects[0].value > 1 && l.assignedObjects[0].value < 5)) displayColor = styleConfig.leafColors.darkGreen;
      else displayColor = styleConfig.leafColors.lightGreen;

      return {
        id: l.id,
        assignedObjects: l.assignedObjects,
        displayColor,
        x: 0, y: 0, rotation: 0,
        size: Math.max(LEAF_SIZE_BASE, LEAF_SIZE_BASE + (l.assignedObjects[0]?.value || 1) * 1.2),
      };
    });
};

const drawScene = () => {
  const canvas = canvasRef.value;
  const ctx = canvas?.getContext('2d');
  if (!ctx || !canvas) return;

  isReady.value = true;
  const currentStage = [...GROWTH_STAGES].reverse().find(s => props.objects.length >= s.threshold) ?? GROWTH_STAGES[0];
  const styleConfig = TREE_STYLE_CONFIGS[props.treeStyle];

  // Clear canvas
  ctx.fillStyle = hsbToRgbString(styleConfig.background);
  ctx.fillRect(0, 0, props.width, props.height);

  // Only regenerate tree structure if it doesn't exist or objects changed significantly
  if (!treeStructure || Math.abs(treeStructure.objectCount - props.objects.length) > 5) {
    potentialLeafPositions = [];
    branchPaths = [];
    
    // Enhanced height calculation for 300+ objects
    let adjustedStage = { ...currentStage };
    if (props.objects.length >= 300) {
      const heightMultiplier = 1 + (props.objects.length - 300) / 500; // Gradual height increase
      adjustedStage.initialLength = Math.min(currentStage.initialLength * heightMultiplier, props.height * 0.4);
      adjustedStage.maxDepth = Math.min(currentStage.maxDepth + Math.floor((props.objects.length - 300) / 150), 12);
    }
    
    drawBranchStructure(ctx, props.width / 2, props.height - 20, -Math.PI / 2, adjustedStage.initialLength, 0, adjustedStage.maxDepth);

    if (adjustedStage.name === 'Sprout' && props.objects.length > 0) {
      drawBranchStructure(ctx, props.width / 2, props.height - 20, -Math.PI / 2, adjustedStage.initialLength, 0, 1, true);
    }

    // Store stable leaf positions
    const leafPositions = distributeLeaves(potentialLeafPositions, processedLeaves.value.length);
    treeStructure = {
      objectCount: props.objects.length,
      leafPositions: leafPositions,
      stage: adjustedStage,
      branchPaths: [...branchPaths]
    };
  } else {
    // Redraw branches from stored paths (no regeneration)
    drawStoredBranches(ctx);
  }

  // Use stored positions to prevent movement
  processedLeaves.value.forEach((leaf, index) => {
    if (treeStructure.leafPositions[index]) {
      leaf.x = treeStructure.leafPositions[index].x;
      leaf.y = treeStructure.leafPositions[index].y;
      leaf.rotation = treeStructure.leafPositions[index].rotation;
    }
  });

  // Draw all leaves
  for (const leaf of processedLeaves.value) {
    const isHovered = hoveredLeaf.value?.id === leaf.id;
    drawLeaf(ctx, leaf.x, leaf.y, leaf.size, leaf.rotation, leaf.displayColor, isHovered);
  }
};

const drawStoredBranches = (ctx) => {
  // Draw branches from stored paths without any randomization
  const styleConfig = TREE_STYLE_CONFIGS[props.treeStyle];
  
  for (const branch of treeStructure.branchPaths) {
    ctx.strokeStyle = branch.color;
    ctx.lineWidth = branch.lineWidth;
    ctx.beginPath(); 
    ctx.moveTo(branch.startX, branch.startY); 
    ctx.lineTo(branch.endX, branch.endY); 
    ctx.stroke();
  }
};

const distributeLeaves = (positions, leafCount) => {
  if (positions.length === 0 || leafCount === 0) return [];
  
  const centerX = props.width / 2;
  const centerY = props.height / 2;
  
  // Create a more diverse set of positions
  const enhancedPositions = [];
  
  // Add original branch endpoints
  positions.forEach(pos => {
    enhancedPositions.push({
      ...pos,
      distanceFromCenter: Math.sqrt((pos.x - centerX) ** 2 + (pos.y - centerY) ** 2),
      sector: Math.atan2(pos.y - centerY, pos.x - centerX)
    });
  });
  
  // Add additional positions between branches for dense foliage
  for (let i = 0; i < positions.length - 1; i++) {
    const pos1 = positions[i];
    const pos2 = positions[i + 1];
    const midX = (pos1.x + pos2.x) / 2 + (Math.random() - 0.5) * 20;
    const midY = (pos1.y + pos2.y) / 2 + (Math.random() - 0.5) * 20;
    
    enhancedPositions.push({
      x: midX,
      y: midY,
      angle: (pos1.angle + pos2.angle) / 2,
      distanceFromCenter: Math.sqrt((midX - centerX) ** 2 + (midY - centerY) ** 2),
      sector: Math.atan2(midY - centerY, midX - centerX)
    });
  }

  // Sort by sector for even distribution
  const sortedPositions = enhancedPositions.sort((a, b) => {
    const sectorDiff = Math.abs(a.sector - b.sector);
    if (sectorDiff > 0.3) return a.sector - b.sector;
    return a.distanceFromCenter - b.distanceFromCenter;
  });

  const leafPositions = [];
  const usedPositions = new Set();
  const minDistance = leafCount > 500 ? 15 : 25; // Closer spacing for more leaves

  // Distribute leaves with anti-overlap logic
  for (let i = 0; i < leafCount && leafPositions.length < leafCount; i++) {
    let bestPosition = null;
    let maxMinDistance = -1;

    for (let j = 0; j < sortedPositions.length; j++) {
      if (usedPositions.has(j)) continue;
      
      const candidate = sortedPositions[j];
      let minDistanceToExisting = Infinity;
      
      for (const existing of leafPositions) {
        const dist = Math.sqrt((candidate.x - existing.x) ** 2 + (candidate.y - existing.y) ** 2);
        minDistanceToExisting = Math.min(minDistanceToExisting, dist);
      }
      
      if (leafPositions.length === 0 || minDistanceToExisting >= minDistance) {
        bestPosition = { index: j, position: candidate };
        break;
      }
      
      if (minDistanceToExisting > maxMinDistance) {
        maxMinDistance = minDistanceToExisting;
        bestPosition = { index: j, position: candidate };
      }
    }

    if (bestPosition) {
      usedPositions.add(bestPosition.index);
      leafPositions.push({
        x: bestPosition.position.x,
        y: bestPosition.position.y,
        rotation: bestPosition.position.angle + Math.PI / 2 + (Math.random() - 0.5) * 0.4
      });
    }
  }

  // Fill remaining positions if needed
  while (leafPositions.length < leafCount && leafPositions.length < sortedPositions.length) {
    const remaining = sortedPositions.filter((_, i) => !usedPositions.has(i));
    if (remaining.length === 0) break;
    
    const randomPos = remaining[Math.floor(Math.random() * remaining.length)];
    const originalIndex = sortedPositions.indexOf(randomPos);
    usedPositions.add(originalIndex);
    
    leafPositions.push({
      x: randomPos.x + (Math.random() - 0.5) * 12,
      y: randomPos.y + (Math.random() - 0.5) * 12,
      rotation: randomPos.angle + Math.PI / 2 + (Math.random() - 0.5) * 0.5
    });
  }

  return leafPositions;
};

const drawBranchStructure = (ctx, startX, startY, angle, length, depth, maxDepth, forceDraw = false) => {
  if (depth >= maxDepth || length < 1) {
    if (depth >= maxDepth - 1) {
      potentialLeafPositions.push({ 
        x: startX, 
        y: startY, 
        angle: angle,
        depth: depth
      });
    }
    return;
  }

  const endX = startX + Math.cos(angle) * length;
  const endY = startY + Math.sin(angle) * length;

  const styleConfig = TREE_STYLE_CONFIGS[props.treeStyle];
  const branchColor = hsbToRgbString(styleConfig.branchStrokeBase(depth, props.branchParams.hueBase));
  const lineWidth = Math.max(1, (maxDepth * 1.5) - depth * 1.5);
  
  // Store branch path for consistent re-rendering
  branchPaths.push({
    startX,
    startY,
    endX,
    endY,
    color: branchColor,
    lineWidth: lineWidth
  });
  
  // Draw the branch
  ctx.strokeStyle = branchColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath(); 
  ctx.moveTo(startX, startY); 
  ctx.lineTo(endX, endY); 
  ctx.stroke();

  if (!forceDraw) {
    const newLength = length * props.branchParams.reduction;
    const angleVar = props.branchParams.angle * (0.8 + Math.random() * 0.4);
    
    const leftAngle = angle - angleVar;
    const rightAngle = angle + angleVar;
    
    drawBranchStructure(ctx, endX, endY, leftAngle, newLength, depth + 1, maxDepth);
    drawBranchStructure(ctx, endX, endY, rightAngle, newLength, depth + 1, maxDepth);
    
    if (depth < maxDepth - 2 && Math.random() < 0.4) {
      const middleAngle = angle + (Math.random() - 0.5) * 0.3;
      drawBranchStructure(ctx, endX, endY, middleAngle, newLength * 0.8, depth + 1, maxDepth);
    }
  }
};

const drawLeaf = (ctx, x, y, size, rotation, color, isHovered = false) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  let finalColor = color;
  
  if (isHovered) {
    finalColor = [color[0], Math.min(100, color[1] + 15), Math.min(255, color[2] + 30)];
    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
    ctx.shadowBlur = 6;
  }
  
  ctx.fillStyle = hsbToRgbString(finalColor);

  // Improved realistic leaf shape
  const leafSize = size * 0.8;
  
  ctx.beginPath();
  // Start at the stem
  ctx.moveTo(0, leafSize / 2);
  
  // Left side of leaf
  ctx.bezierCurveTo(
    -leafSize * 0.2, leafSize * 0.3,
    -leafSize * 0.4, 0,
    -leafSize * 0.3, -leafSize * 0.2
  );
  
  // Top left curve
  ctx.bezierCurveTo(
    -leafSize * 0.2, -leafSize * 0.4,
    -leafSize * 0.1, -leafSize * 0.5,
    0, -leafSize * 0.5
  );
  
  // Top right curve
  ctx.bezierCurveTo(
    leafSize * 0.1, -leafSize * 0.5,
    leafSize * 0.2, -leafSize * 0.4,
    leafSize * 0.3, -leafSize * 0.2
  );
  
  // Right side of leaf
  ctx.bezierCurveTo(
    leafSize * 0.4, 0,
    leafSize * 0.2, leafSize * 0.3,
    0, leafSize / 2
  );
  
  ctx.fill();

  // Add leaf veins for realism
  if (!isHovered) {
    ctx.strokeStyle = hsbToRgbString([color[0], color[1], Math.max(0, color[2] - 40)]);
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    // Central vein
    ctx.moveTo(0, leafSize / 2);
    ctx.lineTo(0, -leafSize * 0.4);
    // Side veins
    ctx.moveTo(0, 0);
    ctx.lineTo(-leafSize * 0.15, -leafSize * 0.15);
    ctx.moveTo(0, 0);
    ctx.lineTo(leafSize * 0.15, -leafSize * 0.15);
    ctx.moveTo(0, leafSize * 0.15);
    ctx.lineTo(-leafSize * 0.1, leafSize * 0.05);
    ctx.moveTo(0, leafSize * 0.15);
    ctx.lineTo(leafSize * 0.1, leafSize * 0.05);
    ctx.stroke();
  }

  // Leaf outline
  ctx.strokeStyle = isHovered ? 
    hsbToRgbString([color[0], color[1], Math.max(0, color[2] - 20)]) :
    hsbToRgbString([color[0], color[1], Math.max(0, color[2] - 30)]);
  ctx.lineWidth = isHovered ? 1.2 : 0.8;
  ctx.beginPath();
  ctx.moveTo(0, leafSize / 2);
  ctx.bezierCurveTo(-leafSize * 0.2, leafSize * 0.3, -leafSize * 0.4, 0, -leafSize * 0.3, -leafSize * 0.2);
  ctx.bezierCurveTo(-leafSize * 0.2, -leafSize * 0.4, -leafSize * 0.1, -leafSize * 0.5, 0, -leafSize * 0.5);
  ctx.bezierCurveTo(leafSize * 0.1, -leafSize * 0.5, leafSize * 0.2, -leafSize * 0.4, leafSize * 0.3, -leafSize * 0.2);
  ctx.bezierCurveTo(leafSize * 0.4, 0, leafSize * 0.2, leafSize * 0.3, 0, leafSize / 2);
  ctx.stroke();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.restore();
};

let hoverRedrawTimeout = null;

const handleMouseMove = (e) => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  const rect = canvas.getBoundingClientRect();
  canvasRect.value = rect;
  
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const canvasX = (e.clientX - rect.left) * scaleX;
  const canvasY = (e.clientY - rect.top) * scaleY;
  
  mousePos.value = { x: e.clientX, y: e.clientY };

  let newHoveredLeaf = null;
  let minDistSq = Infinity;
  
  for (const leaf of processedLeaves.value) {
    const dSq = (canvasX - leaf.x) ** 2 + (canvasY - leaf.y) ** 2;
    const hitRadius = leaf.size * 0.6;
    if (dSq < hitRadius ** 2 && dSq < minDistSq) {
      newHoveredLeaf = leaf;
      minDistSq = dSq;
    }
  }

  if (hoveredLeaf.value?.id !== newHoveredLeaf?.id) {
    hoveredLeaf.value = newHoveredLeaf;
    
    // Clear existing timeout
    if (hoverRedrawTimeout) {
      clearTimeout(hoverRedrawTimeout);
    }
    
    // Only redraw leaves, not the entire scene
    hoverRedrawTimeout = setTimeout(() => {
      if (canvas) redrawLeavesOnly();
    }, 16); // ~60fps limit
  }
};

const redrawLeavesOnly = () => {
  const canvas = canvasRef.value;
  const ctx = canvas?.getContext('2d');
  if (!ctx || !canvas || !treeStructure) return;

  // Clear canvas and redraw background
  const styleConfig = TREE_STYLE_CONFIGS[props.treeStyle];
  ctx.fillStyle = hsbToRgbString(styleConfig.background);
  ctx.fillRect(0, 0, props.width, props.height);

  // Redraw stored branches (no regeneration)
  drawStoredBranches(ctx);

  // Redraw leaves with current hover state
  for (const leaf of processedLeaves.value) {
    const isHovered = hoveredLeaf.value?.id === leaf.id;
    drawLeaf(ctx, leaf.x, leaf.y, leaf.size, leaf.rotation, leaf.displayColor, isHovered);
  }
};

const handleMouseLeave = () => {
  if (hoveredLeaf.value) {
    hoveredLeaf.value = null;
    if (hoverRedrawTimeout) {
      clearTimeout(hoverRedrawTimeout);
    }
    hoverRedrawTimeout = setTimeout(() => {
      if (canvasRef.value) redrawLeavesOnly();
    }, 16);
  }
};

const hsbToRgbString = (hsb) => {
  const h = hsb[0] / 360, s = hsb[1] / 255, b = hsb[2] / 255;
  const i = Math.floor(h * 6), f = h * 6 - i, p = b * (1 - s), q = b * (1 - f * s), t = b * (1 - (1 - f) * s);
  let r = 0, g = 0, bb = 0;
  switch (i % 6) {
    case 0: r = b; g = t; bb = p; break;
    case 1: r = q; g = b; bb = p; break;
    case 2: r = p; g = b; bb = t; break;
    case 3: r = p; g = q; bb = b; break;
    case 4: r = t; g = p; bb = b; break;
    case 5: r = b; g = p; bb = q; break;
  }
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(bb * 255)})`;
};

const tooltipPos = computed(() => {
  if (!hoveredLeaf.value || !canvasRect.value) return { x: 0, y: 0, transform: 'none', arrowStyle: {} };
  const x = mousePos.value.x + 15;
  const y = mousePos.value.y - 60;
  const transform = mousePos.value.x > window.innerWidth - 240 ? 'translateX(-100%) translateX(-30px)' : 'none';
  return { x, y, transform, arrowStyle: { bottom: '-4px', left: transform.startsWith('translateX') ? 'calc(100% - 25px)' : '20px' } };
});

onMounted(() => { 
  nextTick(() => { 
    assignObjectsToLeaves(); 
    drawScene(); 
  }); 
});

watch(() => [props.objects, props.treeStyle, props.branchParams, props.width, props.height], () => {
  // Reset tree structure on significant changes
  treeStructure = null;
  branchPaths = [];
  assignObjectsToLeaves();
  drawScene();
}, { deep: true });
</script>