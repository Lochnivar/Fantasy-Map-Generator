"use strict";
/**
 * Fantasy Map Generator - Application State Management
 * 
 * Centralized state management for the application.
 * This consolidates global variables from main.js into a structured state object.
 * 
 * NOTE: This file should be loaded after namespace.js but before main.js
 * State will be initialized in main.js after DOM is ready.
 */

// Ensure FMG namespace exists
if (typeof window.FMG === 'undefined') {
  console.error('FMG namespace not initialized. Load core/namespace.js first.');
}

window.FMG.State = window.FMG.State || {};

// Initialize state structure
// These will be populated by main.js during initialization
window.FMG.State.DOM = {
  svg: null,
  defs: null,
  viewbox: null,
  scaleBar: null,
  legend: null,
  ocean: null,
  oceanLayers: null,
  oceanPattern: null,
  lakes: null,
  landmass: null,
  texture: null,
  terrs: null,
  biomes: null,
  cells: null,
  gridOverlay: null,
  coordinates: null,
  compass: null,
  rivers: null,
  terrain: null,
  relig: null,
  cults: null,
  regions: null,
  statesBody: null,
  statesHalo: null,
  provs: null,
  zones: null,
  borders: null,
  stateBorders: null,
  provinceBorders: null,
  routes: null,
  roads: null,
  trails: null,
  searoutes: null,
  temperature: null,
  coastline: null,
  ice: null,
  prec: null,
  population: null,
  emblems: null,
  labels: null,
  icons: null,
  burgIcons: null,
  anchors: null,
  armies: null,
  markers: null,
  fogging: null,
  ruler: null,
  debug: null,
  burgLabels: null
};

// Application Data State
window.FMG.State.Data = {
  grid: {},           // initial graph based on jittered square grid and data
  pack: {},           // packed graph and data
  seed: null,
  mapId: null,
  mapHistory: [],
  elSelected: null,
  modules: {},
  notes: [],
  rulers: null,       // Will be initialized as new Rulers()
  customization: 0,
  biomesData: null,   // Will be initialized from Biomes.getDefault()
  nameBases: null,    // Will be initialized from Names.getNameBases()
  color: null,        // Will be initialized as d3.scaleSequential
  lineGen: null,      // Will be initialized as d3.line generator
  options: {
    pinNotes: false,
    winds: [225, 45, 225, 315, 135, 315],
    temperatureEquator: 27,
    temperatureNorthPole: -30,
    temperatureSouthPole: -15,
    stateLabelsMode: "auto",
    showBurgPreview: true,
    villageMaxPopulation: 2000
  },
  mapCoordinates: {},
  populationRate: null,
  distanceScale: null,
  urbanization: null,
  urbanDensity: null
};

// View/UI State
window.FMG.State.View = {
  scale: 1,
  viewX: 0,
  viewY: 0,
  zoom: null,         // Will be initialized as d3.zoom
  graphWidth: null,
  graphHeight: null,
  svgWidth: null,
  svgHeight: null
};

/**
 * Helper function to access state with backward compatibility
 * This allows gradual migration from global variables
 */
window.FMG.State.get = function(path) {
  const parts = path.split('.');
  let value = window.FMG.State;
  for (const part of parts) {
    if (value[part] === undefined) return undefined;
    value = value[part];
  }
  return value;
};

/**
 * Helper function to set state with backward compatibility
 */
window.FMG.State.set = function(path, value) {
  const parts = path.split('.');
  const lastPart = parts.pop();
  let target = window.FMG.State;
  for (const part of parts) {
    if (!target[part]) target[part] = {};
    target = target[part];
  }
  target[lastPart] = value;
};

// Backward compatibility: Create global references
// These will be removed in a future phase after all code is migrated
// For now, we'll create getters/setters that proxy to FMG.State
Object.defineProperty(window, 'grid', {
  get: () => window.FMG.State.Data.grid,
  set: (value) => { window.FMG.State.Data.grid = value; },
  configurable: true
});

Object.defineProperty(window, 'pack', {
  get: () => window.FMG.State.Data.pack,
  set: (value) => { window.FMG.State.Data.pack = value; },
  configurable: true
});

Object.defineProperty(window, 'seed', {
  get: () => window.FMG.State.Data.seed,
  set: (value) => { window.FMG.State.Data.seed = value; },
  configurable: true
});

Object.defineProperty(window, 'mapId', {
  get: () => window.FMG.State.Data.mapId,
  set: (value) => { window.FMG.State.Data.mapId = value; },
  configurable: true
});

Object.defineProperty(window, 'mapHistory', {
  get: () => window.FMG.State.Data.mapHistory,
  set: (value) => { window.FMG.State.Data.mapHistory = value; },
  configurable: true
});

Object.defineProperty(window, 'options', {
  get: () => window.FMG.State.Data.options,
  set: (value) => { window.FMG.State.Data.options = value; },
  configurable: true
});

Object.defineProperty(window, 'scale', {
  get: () => window.FMG.State.View.scale,
  set: (value) => { window.FMG.State.View.scale = value; },
  configurable: true
});

Object.defineProperty(window, 'viewX', {
  get: () => window.FMG.State.View.viewX,
  set: (value) => { window.FMG.State.View.viewX = value; },
  configurable: true
});

Object.defineProperty(window, 'viewY', {
  get: () => window.FMG.State.View.viewY,
  set: (value) => { window.FMG.State.View.viewY = value; },
  configurable: true
});

Object.defineProperty(window, 'modules', {
  get: () => window.FMG.State.Data.modules,
  set: (value) => { window.FMG.State.Data.modules = value; },
  configurable: true
});

Object.defineProperty(window, 'customization', {
  get: () => window.FMG.State.Data.customization,
  set: (value) => { window.FMG.State.Data.customization = value; },
  configurable: true
});

Object.defineProperty(window, 'elSelected', {
  get: () => window.FMG.State.Data.elSelected,
  set: (value) => { window.FMG.State.Data.elSelected = value; },
  configurable: true
});

Object.defineProperty(window, 'notes', {
  get: () => window.FMG.State.Data.notes,
  set: (value) => { window.FMG.State.Data.notes = value; },
  configurable: true
});

Object.defineProperty(window, 'rulers', {
  get: () => window.FMG.State.Data.rulers,
  set: (value) => { window.FMG.State.Data.rulers = value; },
  configurable: true
});

Object.defineProperty(window, 'biomesData', {
  get: () => window.FMG.State.Data.biomesData,
  set: (value) => { window.FMG.State.Data.biomesData = value; },
  configurable: true
});

Object.defineProperty(window, 'nameBases', {
  get: () => window.FMG.State.Data.nameBases,
  set: (value) => { window.FMG.State.Data.nameBases = value; },
  configurable: true
});

Object.defineProperty(window, 'color', {
  get: () => window.FMG.State.Data.color,
  set: (value) => { window.FMG.State.Data.color = value; },
  configurable: true
});

Object.defineProperty(window, 'lineGen', {
  get: () => window.FMG.State.Data.lineGen,
  set: (value) => { window.FMG.State.Data.lineGen = value; },
  configurable: true
});

Object.defineProperty(window, 'mapCoordinates', {
  get: () => window.FMG.State.Data.mapCoordinates,
  set: (value) => { window.FMG.State.Data.mapCoordinates = value; },
  configurable: true
});

Object.defineProperty(window, 'populationRate', {
  get: () => window.FMG.State.Data.populationRate,
  set: (value) => { window.FMG.State.Data.populationRate = value; },
  configurable: true
});

Object.defineProperty(window, 'distanceScale', {
  get: () => window.FMG.State.Data.distanceScale,
  set: (value) => { window.FMG.State.Data.distanceScale = value; },
  configurable: true
});

Object.defineProperty(window, 'urbanization', {
  get: () => window.FMG.State.Data.urbanization,
  set: (value) => { window.FMG.State.Data.urbanization = value; },
  configurable: true
});

Object.defineProperty(window, 'urbanDensity', {
  get: () => window.FMG.State.Data.urbanDensity,
  set: (value) => { window.FMG.State.Data.urbanDensity = value; },
  configurable: true
});

Object.defineProperty(window, 'graphWidth', {
  get: () => window.FMG.State.View.graphWidth,
  set: (value) => { window.FMG.State.View.graphWidth = value; },
  configurable: true
});

Object.defineProperty(window, 'graphHeight', {
  get: () => window.FMG.State.View.graphHeight,
  set: (value) => { window.FMG.State.View.graphHeight = value; },
  configurable: true
});

Object.defineProperty(window, 'svgWidth', {
  get: () => window.FMG.State.View.svgWidth,
  set: (value) => { window.FMG.State.View.svgWidth = value; },
  configurable: true
});

Object.defineProperty(window, 'svgHeight', {
  get: () => window.FMG.State.View.svgHeight,
  set: (value) => { window.FMG.State.View.svgHeight = value; },
  configurable: true
});

Object.defineProperty(window, 'zoom', {
  get: () => window.FMG.State.View.zoom,
  set: (value) => { window.FMG.State.View.zoom = value; },
  configurable: true
});

