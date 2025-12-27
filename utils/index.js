"use strict";
/**
 * Utilities Aggregator
 * 
 * Organizes all utility functions under FMG.Utils namespace.
 * Maintains backward compatibility by keeping global function exports.
 * 
 * This file should be loaded AFTER all individual utility files.
 */

// Ensure FMG namespace exists
if (typeof window.FMG === 'undefined') {
  console.error('FMG namespace not initialized. Load core/namespace.js first.');
}

window.FMG.Utils = window.FMG.Utils || {};

// Array Utilities
// Functions from arrayUtils.js
window.FMG.Utils.Array = {
  last: typeof last !== 'undefined' ? last : undefined,
  unique: typeof unique !== 'undefined' ? unique : undefined,
  deepCopy: typeof deepCopy !== 'undefined' ? deepCopy : undefined,
  getTypedArray: typeof getTypedArray !== 'undefined' ? getTypedArray : undefined,
  createTypedArray: typeof createTypedArray !== 'undefined' ? createTypedArray : undefined
};

// Color Utilities
// Functions from colorUtils.js
window.FMG.Utils.Color = {
  toHEX: typeof toHEX !== 'undefined' ? toHEX : undefined,
  getColors: typeof getColors !== 'undefined' ? getColors : undefined,
  getRandomColor: typeof getRandomColor !== 'undefined' ? getRandomColor : undefined,
  getMixedColor: typeof getMixedColor !== 'undefined' ? getMixedColor : undefined,
  scaleRainbow: typeof scaleRainbow !== 'undefined' ? scaleRainbow : undefined
};

// Common Utilities
// Functions from commonUtils.js
window.FMG.Utils.Common = {
  clipPoly: typeof clipPoly !== 'undefined' ? clipPoly : undefined,
  getSegmentId: typeof getSegmentId !== 'undefined' ? getSegmentId : undefined,
  debounce: typeof debounce !== 'undefined' ? debounce : undefined,
  throttle: typeof throttle !== 'undefined' ? throttle : undefined,
  getCoordinates: typeof getCoordinates !== 'undefined' ? getCoordinates : undefined,
  dist2: typeof dist2 !== 'undefined' ? dist2 : undefined,
  getPolygonArea: typeof getPolygonArea !== 'undefined' ? getPolygonArea : undefined,
  getPolygonPerimeter: typeof getPolygonPerimeter !== 'undefined' ? getPolygonPerimeter : undefined,
  getPolygonCentroid: typeof getPolygonCentroid !== 'undefined' ? getPolygonCentroid : undefined,
  getPolygonBBox: typeof getPolygonBBox !== 'undefined' ? getPolygonBBox : undefined
};

// Debug Utilities
// Functions from debugUtils.js
window.FMG.Utils.Debug = {
  parseError: typeof parseError !== 'undefined' ? parseError : undefined,
  // Add other debug utilities as needed
};

// Function Utilities
// Functions from functionUtils.js
window.FMG.Utils.Function = {
  rollups: typeof rollups !== 'undefined' ? rollups : undefined,
  nest: typeof nest !== 'undefined' ? nest : undefined
};

// Graph Utilities
// Functions from graphUtils.js
window.FMG.Utils.Graph = {
  // Add graph utilities as needed
};

// Language Utilities
// Functions from languageUtils.js
window.FMG.Utils.Language = {
  vowel: typeof vowel !== 'undefined' ? vowel : undefined,
  trimVowels: typeof trimVowels !== 'undefined' ? trimVowels : undefined
};

// Node Utilities
// Functions from nodeUtils.js
window.FMG.Utils.Node = {
  removeParent: typeof removeParent !== 'undefined' ? removeParent : undefined,
  getComposedPath: typeof getComposedPath !== 'undefined' ? getComposedPath : undefined,
  getNextId: typeof getNextId !== 'undefined' ? getNextId : undefined,
  getAbsolutePath: typeof getAbsolutePath !== 'undefined' ? getAbsolutePath : undefined
};

// Number Utilities
// Functions from numberUtils.js
window.FMG.Utils.Number = {
  rn: typeof rn !== 'undefined' ? rn : undefined,
  minmax: typeof minmax !== 'undefined' ? minmax : undefined,
  lim: typeof lim !== 'undefined' ? lim : undefined,
  normalize: typeof normalize !== 'undefined' ? normalize : undefined,
  lerp: typeof lerp !== 'undefined' ? lerp : undefined
};

// Path Utilities
// Functions from pathUtils.js
window.FMG.Utils.Path = {
  getIsolines: typeof getIsolines !== 'undefined' ? getIsolines : undefined,
  getFillPath: typeof getFillPath !== 'undefined' ? getFillPath : undefined,
  getBorderPath: typeof getBorderPath !== 'undefined' ? getBorderPath : undefined,
  getVertexPath: typeof getVertexPath !== 'undefined' ? getVertexPath : undefined,
  getPolesOfInaccessibility: typeof getPolesOfInaccessibility !== 'undefined' ? getPolesOfInaccessibility : undefined,
  connectVertices: typeof connectVertices !== 'undefined' ? connectVertices : undefined,
  findPath: typeof findPath !== 'undefined' ? findPath : undefined,
  restorePath: typeof restorePath !== 'undefined' ? restorePath : undefined
};

// Probability Utilities
// Functions from probabilityUtils.js
window.FMG.Utils.Probability = {
  rand: typeof rand !== 'undefined' ? rand : undefined,
  P: typeof P !== 'undefined' ? P : undefined,
  each: typeof each !== 'undefined' ? each : undefined,
  gauss: typeof gauss !== 'undefined' ? gauss : undefined,
  Pint: typeof Pint !== 'undefined' ? Pint : undefined,
  ra: typeof ra !== 'undefined' ? ra : undefined,
  rw: typeof rw !== 'undefined' ? rw : undefined,
  biased: typeof biased !== 'undefined' ? biased : undefined,
  getNumberInRange: typeof getNumberInRange !== 'undefined' ? getNumberInRange : undefined,
  generateSeed: typeof generateSeed !== 'undefined' ? generateSeed : undefined
};

// String Utilities
// Functions from stringUtils.js
window.FMG.Utils.String = {
  round: typeof round !== 'undefined' ? round : undefined,
  capitalize: typeof capitalize !== 'undefined' ? capitalize : undefined,
  splitInTwo: typeof splitInTwo !== 'undefined' ? splitInTwo : undefined,
  parseTransform: typeof parseTransform !== 'undefined' ? parseTransform : undefined
};

// Unit Utilities
// Functions from unitUtils.js
window.FMG.Utils.Unit = {
  convertTemperature: typeof convertTemperature !== 'undefined' ? convertTemperature : undefined,
  si: typeof si !== 'undefined' ? si : undefined,
  getInteger: typeof getInteger !== 'undefined' ? getInteger : undefined
};

// Logger Utilities
// Functions from logger.js
window.FMG.Utils.Logger = window.FMG.Utils.Logger || {};

// Shorthands
// Global shorthands from shorthands.js
window.FMG.Utils.Shorthands = {
  byId: typeof byId !== 'undefined' ? byId : undefined
  // Note: Node.prototype extensions (on, off) are not namespaced as they extend prototypes
};

// Note: polyfills.js contains polyfills that extend native objects
// These are not namespaced as they modify global prototypes

// Export namespace for potential ES6 module migration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.FMG.Utils;
}

