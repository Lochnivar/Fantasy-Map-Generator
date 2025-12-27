"use strict";
/**
 * Fantasy Map Generator - Core Namespace
 * 
 * This file establishes the unified FMG namespace structure.
 * All modules, utilities, UI components, and state will be organized under window.FMG
 * 
 * Load this file FIRST before any other application code.
 */

// Initialize the main application namespace
window.FMG = window.FMG || {};

// Initialize sub-namespaces
window.FMG.Modules = window.FMG.Modules || {};
window.FMG.Utils = window.FMG.Utils || {};
window.FMG.UI = window.FMG.UI || {};
window.FMG.Renderers = window.FMG.Renderers || {};
window.FMG.State = window.FMG.State || {};
window.FMG.Config = window.FMG.Config || {};
window.FMG.Core = window.FMG.Core || {};

// Export namespace for potential ES6 module migration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.FMG;
}

