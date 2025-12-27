"use strict";
/**
 * Renderers Aggregator
 * 
 * Organizes all renderer functions under FMG.Renderers namespace.
 * Maintains backward compatibility by keeping global function exports.
 * 
 * This file should be loaded AFTER all individual renderer files.
 */

// Ensure FMG namespace exists
if (typeof window.FMG === 'undefined') {
  console.error('FMG namespace not initialized. Load core/namespace.js first.');
}

window.FMG.Renderers = window.FMG.Renderers || {};

// Border Rendering
window.FMG.Renderers.drawBorders = typeof drawBorders !== 'undefined' ? drawBorders : undefined;

// Burg (City) Rendering
window.FMG.Renderers.drawBurgIcons = typeof drawBurgIcons !== 'undefined' ? drawBurgIcons : undefined;
window.FMG.Renderers.drawBurgLabels = typeof drawBurgLabels !== 'undefined' ? drawBurgLabels : undefined;

// Emblem Rendering
window.FMG.Renderers.drawEmblems = typeof drawEmblems !== 'undefined' ? drawEmblems : undefined;

// Feature Rendering
window.FMG.Renderers.drawFeatures = typeof drawFeatures !== 'undefined' ? drawFeatures : undefined;
window.FMG.Renderers.getFeaturePath = typeof getFeaturePath !== 'undefined' ? getFeaturePath : undefined;

// Heightmap Rendering
window.FMG.Renderers.drawHeightmap = typeof drawHeightmap !== 'undefined' ? drawHeightmap : undefined;

// Marker Rendering
window.FMG.Renderers.drawMarkers = typeof drawMarkers !== 'undefined' ? drawMarkers : undefined;
window.FMG.Renderers.drawMarker = typeof drawMarker !== 'undefined' ? drawMarker : undefined;

// Military Rendering
window.FMG.Renderers.drawMilitary = typeof drawMilitary !== 'undefined' ? drawMilitary : undefined;

// Relief Icon Rendering
window.FMG.Renderers.drawReliefIcons = typeof drawReliefIcons !== 'undefined' ? drawReliefIcons : undefined;

// Scale Bar Rendering
window.FMG.Renderers.drawScaleBar = typeof drawScaleBar !== 'undefined' ? drawScaleBar : undefined;
window.FMG.Renderers.getLength = typeof getLength !== 'undefined' ? getLength : undefined;
window.FMG.Renderers.fitScaleBar = typeof fitScaleBar !== 'undefined' ? fitScaleBar : undefined;

// State Label Rendering
window.FMG.Renderers.drawStateLabels = typeof drawStateLabels !== 'undefined' ? drawStateLabels : undefined;

// Temperature Rendering
window.FMG.Renderers.drawTemperature = typeof drawTemperature !== 'undefined' ? drawTemperature : undefined;

// Backward compatibility: Keep global functions
// These will be removed in a future phase after all code is migrated
// Note: Functions are already global, so no additional export needed

// Export namespace for potential ES6 module migration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.FMG.Renderers;
}

