import * as THREE from 'three';

// Colors - RICH, OPULENT, & METALLIC (Updated per request)
export const COLORS = {
  // --- GREENS ---
  // Replaced lightest green with Deep Emerald as requested
  GREEN_LIGHT: '#047857', // Deep Emerald Green (Emerald 700)
  GREEN_MEDIUM: '#15803d', // Rich Green (Green 700)
  GREEN_DEEP: '#14532d',  // Very Deep Forest Green (Green 900)
  
  // --- GOLDS ---
  // Replaced lightest gold with Bright Metallic Gold
  GOLD_LIGHT: '#FFD700', // Bright Metallic Gold
  GOLD_MEDIUM: '#EAB308', // Deep Gold
  GOLD_DEEP: '#A16207',   // Bronze
  
  // --- REDS ---
  // Replaced lightest red with Deep Red
  RED_LIGHT: '#991B1B', // Deep Red (Red 800)
  RED_MEDIUM: '#7F1D1D', // Darker Red (Red 900)
  RED_DEEP: '#450a0a', // Burgundy (Red 950)

  // --- ACCENTS ---
  WHITE_PURE: '#FFFFFF',
  ORANGE_VIVID: '#F97316',
  
  // Sparkle colors (Cyan, Magenta, Lime, White)
  CYAN_BRIGHT: '#22d3ee',
  MAGENTA_BRIGHT: '#e879f9',
  
  LIGHT_WARM: '#FFFBEB',
  
  // Palettes constructed for 1/3 distribution:
  PALETTE_GREEN: [
    '#047857', '#047857', // Deep Emerald
    '#15803d', '#15803d', // Medium
    '#14532d', '#14532d'  // Deepest
  ],
  
  // Gold/Yellow boxes
  PALETTE_DECOR_BOXES: [
    '#FFD700', '#FFD700', // Bright Metallic
    '#EAB308', '#EAB308', // Deep Gold
    '#A16207', '#A16207'  // Bronze
  ],
  
  // Decor Spheres (Mixed Gold, Red, White)
  PALETTE_DECOR_SPHERES: [
    '#FFD700', '#EAB308', '#A16207', // Gold spectrum
    '#991B1B', '#7F1D1D', '#450a0a', // Red spectrum (Deep)
    '#FFFFFF', '#F97316'             // Accents
  ],
  
  PALETTE_SPARKLE: ['#FFFFFF', '#22d3ee', '#e879f9', '#FFD700', '#047857']
};

export const FOLIAGE_COUNT = 2000; 

// Geometry for a 35-degree apex angle
// Apex angle = 35 deg. Half angle = 17.5 deg.
// tan(17.5) ~= 0.3153
// Height = 18. Radius = 18 * 0.3153 ~= 5.67
export const TREE_HEIGHT = 18;
export const TREE_RADIUS_BASE = 5.7; 
export const SCATTER_RADIUS = 35;

// Math Helpers
export const getRandomPointInSphere = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  
  const sinPhi = Math.sin(phi);
  const x = r * sinPhi * Math.cos(theta);
  const y = r * sinPhi * Math.sin(theta);
  const z = r * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

// Spiral Cone Calculation for Tree Shape
export const getTreePoint = (t: number, totalPoints: number): THREE.Vector3 => {
  // t is normalized 0-1 index (0 = bottom, 1 = top)
  const y = -TREE_HEIGHT / 2 + t * TREE_HEIGHT;
  
  // Radius decreases as we go up.
  // Power function to make the base slightly fuller but keep the tip sharp
  const radiusAtHeight = TREE_RADIUS_BASE * (1 - t);
  
  // Golden Angle spiral
  const angle = t * totalPoints * 0.5; 
  
  const x = Math.cos(angle) * radiusAtHeight;
  const z = Math.sin(angle) * radiusAtHeight;
  
  // Jitter
  const jitter = 0.5; // Increased jitter for randomness
  return new THREE.Vector3(
    x + (Math.random() - 0.5) * jitter, 
    y, 
    z + (Math.random() - 0.5) * jitter
  );
};