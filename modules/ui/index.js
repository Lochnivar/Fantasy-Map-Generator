"use strict";
/**
 * UI Components Aggregator
 * 
 * Organizes all UI functions under FMG.UI namespace.
 * Maintains backward compatibility by keeping global function exports.
 * 
 * This file should be loaded AFTER all individual UI files.
 */

// Ensure FMG namespace exists
if (typeof window.FMG === 'undefined') {
  console.error('FMG namespace not initialized. Load core/namespace.js first.');
}

window.FMG.UI = window.FMG.UI || {};

// General UI Functions
window.FMG.UI.General = {
  tip: typeof tip !== 'undefined' ? tip : undefined,
  showMainTip: typeof showMainTip !== 'undefined' ? showMainTip : undefined,
  clearMainTip: typeof clearMainTip !== 'undefined' ? clearMainTip : undefined,
  showDataTip: typeof showDataTip !== 'undefined' ? showDataTip : undefined,
  fitMapToScreen: typeof fitMapToScreen !== 'undefined' ? fitMapToScreen : undefined,
  closeDialogs: typeof closeDialogs !== 'undefined' ? closeDialogs : undefined,
  layerIsOn: typeof layerIsOn !== 'undefined' ? layerIsOn : undefined,
  toggleLayer: typeof toggleLayer !== 'undefined' ? toggleLayer : undefined
};

// Editors
window.FMG.UI.Editors = {
  editBurg: typeof editBurg !== 'undefined' ? editBurg : undefined,
  editStates: typeof editStates !== 'undefined' ? editStates : undefined,
  editCultures: typeof editCultures !== 'undefined' ? editCultures : undefined,
  editProvinces: typeof editProvinces !== 'undefined' ? editProvinces : undefined,
  editReligions: typeof editReligions !== 'undefined' ? editReligions : undefined,
  editRoute: typeof editRoute !== 'undefined' ? editRoute : undefined,
  editRiver: typeof editRiver !== 'undefined' ? editRiver : undefined,
  editMarker: typeof editMarker !== 'undefined' ? editMarker : undefined,
  editEmblems: typeof editEmblems !== 'undefined' ? editEmblems : undefined,
  editBiomes: typeof editBiomes !== 'undefined' ? editBiomes : undefined,
  editLakes: typeof editLakes !== 'undefined' ? editLakes : undefined,
  editLabels: typeof editLabels !== 'undefined' ? editLabels : undefined,
  editNotes: typeof editNotes !== 'undefined' ? editNotes : undefined,
  editNamesbase: typeof editNamesbase !== 'undefined' ? editNamesbase : undefined,
  editHeightmap: typeof editHeightmap !== 'undefined' ? editHeightmap : undefined,
  editCoastline: typeof editCoastline !== 'undefined' ? editCoastline : undefined,
  editIce: typeof editIce !== 'undefined' ? editIce : undefined,
  editRelief: typeof editRelief !== 'undefined' ? editRelief : undefined,
  editZones: typeof editZones !== 'undefined' ? editZones : undefined,
  editUnits: typeof editUnits !== 'undefined' ? editUnits : undefined,
  editRegiment: typeof editRegiment !== 'undefined' ? editRegiment : undefined,
  editRouteGroups: typeof editRouteGroups !== 'undefined' ? editRouteGroups : undefined,
  editDiplomacy: typeof editDiplomacy !== 'undefined' ? editDiplomacy : undefined
};

// Tools
window.FMG.UI.Tools = {
  openSubmapTool: typeof openSubmapTool !== 'undefined' ? openSubmapTool : undefined,
  transformTool: typeof transformTool !== 'undefined' ? transformTool : undefined,
  editWorld: typeof editWorld !== 'undefined' ? editWorld : undefined,
  editStyle: typeof editStyle !== 'undefined' ? editStyle : undefined,
  processFeatureRegeneration: typeof processFeatureRegeneration !== 'undefined' ? processFeatureRegeneration : undefined,
  regenerateRoutes: typeof regenerateRoutes !== 'undefined' ? regenerateRoutes : undefined,
  regenerateRivers: typeof regenerateRivers !== 'undefined' ? regenerateRivers : undefined,
  recalculatePopulation: typeof recalculatePopulation !== 'undefined' ? recalculatePopulation : undefined,
  regenerateStates: typeof regenerateStates !== 'undefined' ? regenerateStates : undefined,
  recreateStates: typeof recreateStates !== 'undefined' ? recreateStates : undefined,
  regenerateProvinces: typeof regenerateProvinces !== 'undefined' ? regenerateProvinces : undefined,
  regenerateBurgs: typeof regenerateBurgs !== 'undefined' ? regenerateBurgs : undefined,
  regenerateEmblems: typeof regenerateEmblems !== 'undefined' ? regenerateEmblems : undefined,
  regenerateReligions: typeof regenerateReligions !== 'undefined' ? regenerateReligions : undefined,
  regenerateCultures: typeof regenerateCultures !== 'undefined' ? regenerateCultures : undefined,
  regenerateMilitary: typeof regenerateMilitary !== 'undefined' ? regenerateMilitary : undefined,
  regenerateIce: typeof regenerateIce !== 'undefined' ? regenerateIce : undefined,
  regenerateMarkers: typeof regenerateMarkers !== 'undefined' ? regenerateMarkers : undefined,
  regenerateZones: typeof regenerateZones !== 'undefined' ? regenerateZones : undefined,
  toggleAddLabel: typeof toggleAddLabel !== 'undefined' ? toggleAddLabel : undefined,
  addLabelOnClick: typeof addLabelOnClick !== 'undefined' ? addLabelOnClick : undefined,
  toggleAddBurg: typeof toggleAddBurg !== 'undefined' ? toggleAddBurg : undefined,
  toggleAddRiver: typeof toggleAddRiver !== 'undefined' ? toggleAddRiver : undefined,
  addRiverOnClick: typeof addRiverOnClick !== 'undefined' ? addRiverOnClick : undefined,
  toggleAddMarker: typeof toggleAddMarker !== 'undefined' ? toggleAddMarker : undefined,
  addMarkerOnClick: typeof addMarkerOnClick !== 'undefined' ? addMarkerOnClick : undefined,
  viewCellDetails: typeof viewCellDetails !== 'undefined' ? viewCellDetails : undefined
};

// Overviews
window.FMG.UI.Overviews = {
  overviewBurgs: typeof overviewBurgs !== 'undefined' ? overviewBurgs : undefined,
  overviewRoutes: typeof overviewRoutes !== 'undefined' ? overviewRoutes : undefined,
  overviewRivers: typeof overviewRivers !== 'undefined' ? overviewRivers : undefined,
  overviewMilitary: typeof overviewMilitary !== 'undefined' ? overviewMilitary : undefined,
  overviewRegiments: typeof overviewRegiments !== 'undefined' ? overviewRegiments : undefined,
  overviewMarkers: typeof overviewMarkers !== 'undefined' ? overviewMarkers : undefined,
  overviewCharts: typeof overviewCharts !== 'undefined' ? overviewCharts : undefined
};

// Creators
window.FMG.UI.Creators = {
  createRoute: typeof createRoute !== 'undefined' ? createRoute : undefined,
  createRiver: typeof createRiver !== 'undefined' ? createRiver : undefined
};

// Style Management
window.FMG.UI.Style = {
  editStyle: typeof editStyle !== 'undefined' ? editStyle : undefined,
  applyStyle: typeof applyStyle !== 'undefined' ? applyStyle : undefined,
  applyStyleOnLoad: typeof applyStyleOnLoad !== 'undefined' ? applyStyleOnLoad : undefined,
  getStylePreset: typeof getStylePreset !== 'undefined' ? getStylePreset : undefined,
  addStylePreset: typeof addStylePreset !== 'undefined' ? addStylePreset : undefined,
  removeStylePreset: typeof removeStylePreset !== 'undefined' ? removeStylePreset : undefined,
  getDefaultPresets: typeof getDefaultPresets !== 'undefined' ? getDefaultPresets : undefined
};

// Layers
window.FMG.UI.Layers = {
  getDefaultPresets: typeof getDefaultPresets !== 'undefined' ? getDefaultPresets : undefined,
  applyLayersPreset: typeof applyLayersPreset !== 'undefined' ? applyLayersPreset : undefined
};

// Specialized UI
window.FMG.UI.Specialized = {
  showBurgTemperatureGraph: typeof showBurgTemperatureGraph !== 'undefined' ? showBurgTemperatureGraph : undefined,
  openEmblemEditor: typeof openEmblemEditor !== 'undefined' ? openEmblemEditor : undefined,
  Battle: typeof Battle !== 'undefined' ? Battle : undefined,
  generateWithOpenAI: typeof generateWithOpenAI !== 'undefined' ? generateWithOpenAI : undefined,
  generateWithAnthropic: typeof generateWithAnthropic !== 'undefined' ? generateWithAnthropic : undefined
};

// Backward compatibility: Keep global functions
// These will be removed in a future phase after all code is migrated
// Note: Functions are already global, so no additional export needed

// Export namespace for potential ES6 module migration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.FMG.UI;
}

