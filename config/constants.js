"use strict";
/**
 * Fantasy Map Generator - Constants Configuration
 * 
 * Centralized constants used throughout the application.
 * These are moved from main.js and individual modules for better organization.
 */

// Ensure FMG namespace exists
if (typeof window.FMG === 'undefined') {
  console.error('FMG namespace not initialized. Load core/namespace.js first.');
}

window.FMG.Config = window.FMG.Config || {};

// Typed Array Maximum Values
window.FMG.Config.TypedArrays = {
  INT8_MAX: 127,
  UINT8_MAX: 255,
  UINT16_MAX: 65535,
  UINT32_MAX: 4294967295
};

// Map Constants
window.FMG.Config.Map = {
  MIN_LAND_HEIGHT: 20,
  MAX_WATER_HEIGHT: 19,
  LARGE_MAP_CELL_THRESHOLD: 10000,
  DEFAULT_DEBOUNCE_DELAY: 250,
  DEFAULT_WIDTH: 4096,
  DEFAULT_HEIGHT: 2048,
  // Wet land thresholds
  WET_LAND_MOISTURE_THRESHOLD_COAST: 40,
  WET_LAND_MOISTURE_THRESHOLD_OFF_COAST: 24,
  WET_LAND_TEMPERATURE_THRESHOLD: -2,
  WET_LAND_HEIGHT_THRESHOLD_COAST: 25,
  WET_LAND_HEIGHT_MIN_OFF_COAST: 24,
  WET_LAND_HEIGHT_MAX_OFF_COAST: 60
};

// Generation Constants
window.FMG.Config.Generation = {
  SPACING_RADIUS_RATIO: 0.5, // radius = spacing / 2
  JITTERING_MULTIPLIER: 0.9  // jittering = radius * 0.9
};

// Debug Configuration
// Note: These are set in main.js but can be accessed via FMG.Config.Debug
window.FMG.Config.Debug = {
  // Will be populated by main.js after initialization
  PRODUCTION: null,
  DEBUG: null,
  INFO: null,
  TIME: null,
  WARN: null,
  ERROR: null,
  MOBILE: null
};

// Backward compatibility: Export constants to global scope
// These will be removed in a future phase
if (typeof INT8_MAX === 'undefined') {
  window.INT8_MAX = window.FMG.Config.TypedArrays.INT8_MAX;
  window.UINT8_MAX = window.FMG.Config.TypedArrays.UINT8_MAX;
  window.UINT16_MAX = window.FMG.Config.TypedArrays.UINT16_MAX;
  window.UINT32_MAX = window.FMG.Config.TypedArrays.UINT32_MAX;
}

// Map constants backward compatibility
Object.defineProperty(window, "LAND_HEIGHT_THRESHOLD", {
  get: () => window.FMG.Config.Map.MIN_LAND_HEIGHT,
  configurable: true
});
Object.defineProperty(window, "WATER_HEIGHT_THRESHOLD", {
  get: () => window.FMG.Config.Map.MAX_WATER_HEIGHT,
  configurable: true
});
Object.defineProperty(window, "LARGE_MAP_CELL_THRESHOLD", {
  get: () => window.FMG.Config.Map.LARGE_MAP_CELL_THRESHOLD,
  configurable: true
});
Object.defineProperty(window, "DEFAULT_DEBOUNCE_DELAY", {
  get: () => window.FMG.Config.Map.DEFAULT_DEBOUNCE_DELAY,
  configurable: true
});

