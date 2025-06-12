
export const TreeStyle = {
  GREEN: 'green',
  SNOWY: 'snowy',
  BROWN: 'brown',
};

export const MAX_OBJECTS = 750;
export const MAX_OBJECTS_PER_LEAF = 5; // Dark green leaves can hold up to 5 objects
export const LEAF_SIZE_BASE = 12;

export const INITIAL_BRANCH_PARAMS = {
  angle: Math.PI / 4.5,
  reduction: 0.70,
  hueBase: 30,
};

// Defines the tree's growth progression based on the number of objects.
export const GROWTH_STAGES = [
    { name: 'Sprout', threshold: 0, maxLeaves: 0, maxDepth: 1, initialLength: 15 },
    { name: 'Small Plant', threshold: 2, maxLeaves: 10, maxDepth: 3, initialLength: 30 },
    { name: 'Large Plant', threshold: 25, maxLeaves: 30, maxDepth: 5, initialLength: 50 },
    { name: 'Small Tree', threshold: 75, maxLeaves: 60, maxDepth: 7, initialLength: 80 },
    { name: 'Medium Tree', threshold: 200, maxLeaves: 100, maxDepth: 8, initialLength: 90 },
    { name: 'Large Tree', threshold: 400, maxLeaves: 150, maxDepth: 9, initialLength: 100 },
];

// Style configurations for different tree themes.
export const TREE_STYLE_CONFIGS = {
  [TreeStyle.GREEN]: {
    background: [120, 80, 80],
    branchStrokeBase: (depth, baseHue) => [(baseHue + depth * 5) % 360, 180 - depth * 10, 60 + depth * 2],
    leafColors: {
      lightGreen: [100, 200, 220],
      darkGreen: [120, 200, 150],
      blueSpecial: [220, 200, 230],
      goldSpecial: [50, 255, 250],
    },
    tooltipText: [0, 0, 0],
  },
  [TreeStyle.SNOWY]: {
    background: [200, 30, 95],
    branchStrokeBase: (depth, baseHue) => [baseHue, 10 + depth * 2, 60 - depth * 5],
    leafColors: {
      lightGreen: [180, 50, 240],
      darkGreen: [180, 70, 200],
      blueSpecial: [220, 150, 230],
      goldSpecial: [45, 100, 250],
    },
    tooltipText: [0, 0, 0],
  },
  [TreeStyle.BROWN]: {
    background: [30, 90, 70],
    branchStrokeBase: (depth, baseHue) => [(baseHue + depth * 3) % 360, 160 - depth * 8, 50 + depth * 2],
    leafColors: {
      lightGreen: [40, 220, 230],
      darkGreen: [35, 220, 180],
      blueSpecial: [200, 180, 220],
      goldSpecial: [50, 255, 250],
    },
    tooltipText: [0, 0, 0],
  },
};