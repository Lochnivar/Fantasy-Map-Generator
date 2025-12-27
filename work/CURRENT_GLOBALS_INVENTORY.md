# Current Global Variables Inventory

## Window Object Assignments

### Core Modules (22 modules)
1. `window.Biomes` - Biome generation and definition
2. `window.BurgsAndStates` - Cities and states generation
3. `window.COA` - Coat of arms generator
4. `window.COArenderer` - Coat of arms renderer
5. `window.Cultures` - Culture generation
6. `window.Features` - Geographic features
7. `window.HeightmapGenerator` - Heightmap generation
8. `window.Lakes` - Lake generation
9. `window.Markers` - Map markers
10. `window.Military` - Military units
11. `window.Names` - Name generation
12. `window.OceanLayers` - Ocean layer generation
13. `window.Provinces` - Province generation
14. `window.Religions` - Religion generation
15. `window.Resample` - Image resampling
16. `window.Rivers` - River generation
17. `window.Routes` - Route generation
18. `window.Submap` - Submap functionality
19. `window.ThreeD` - 3D rendering
20. `window.Zones` - Zone generation
21. `window.Cloud` - Cloud storage (Dropbox)
22. `window.Rulers` - (likely defined elsewhere)

### Global Functions (No namespace)
- All functions in `utils/*.js` files (arrayUtils, colorUtils, etc.)
- All renderer functions in `modules/renderers/*.js`
- All UI functions in `modules/ui/*.js`
- Functions in `main.js` (generate, zoomTo, etc.)

### Global Variables in main.js
```javascript
// SVG/DOM References (20+)
svg, defs, viewbox, scaleBar, legend, ocean, oceanLayers, oceanPattern,
lakes, landmass, texture, terrs, biomes, cells, gridOverlay, coordinates,
compass, rivers, terrain, relig, cults, regions, statesBody, statesHalo,
provs, zones, borders, stateBorders, provinceBorders, routes, roads, trails,
searoutes, temperature, coastline, ice, prec, population, emblems, labels,
icons, burgIcons, anchors, armies, markers, fogging, ruler, debug

// Application State (15+)
grid, pack, seed, mapId, mapHistory, elSelected, modules, notes, rulers,
customization, biomesData, nameBases, color, lineGen, scale, viewX, viewY,
zoom, options, mapCoordinates, populationRate, distanceScale, urbanization,
urbanDensity, graphWidth, graphHeight, svgWidth, svgHeight

// Constants
PRODUCTION, DEBUG, INFO, TIME, WARN, ERROR, MOBILE,
INT8_MAX, UINT8_MAX, UINT16_MAX, UINT32_MAX
```

### Total Global Pollution
- **22 window.* module assignments**
- **50+ global variables in main.js**
- **100+ utility functions (global)**
- **20+ renderer functions (global)**
- **45+ UI functions (global)**
- **Total: ~240+ global identifiers**

---

## Proposed Namespace Structure

### Target: Single `window.FMG` namespace

```javascript
window.FMG = {
  // Core Modules (22)
  Modules: {
    Biomes,
    BurgsAndStates,
    COA,
    COArenderer,
    Cultures,
    Features,
    HeightmapGenerator,
    Lakes,
    Markers,
    Military,
    Names,
    OceanLayers,
    Provinces,
    Religions,
    Resample,
    Rivers,
    Routes,
    Submap,
    ThreeD,
    Zones,
    Cloud
  },
  
  // Application State
  State: {
    svg, defs, viewbox, scaleBar, legend, ocean, /* ... all SVG refs */
    grid, pack, seed, mapId, mapHistory, /* ... all app state */
    scale, viewX, viewY, zoom, options, /* ... all config */
  },
  
  // Utilities (organized by category)
  Utils: {
    Array: { last, unique, deepCopy, getTypedArray, /* ... */ },
    Color: { /* color utilities */ },
    Common: { clipPoly, getSegmentId, debounce, /* ... */ },
    Debug: { /* debug utilities */ },
    Function: { /* function utilities */ },
    Graph: { /* graph utilities */ },
    Language: { /* language utilities */ },
    Node: { /* node utilities */ },
    Number: { /* number utilities */ },
    Path: { /* path utilities */ },
    Probability: { /* probability utilities */ },
    String: { /* string utilities */ },
    Unit: { /* unit utilities */ }
  },
  
  // Renderers
  Renderers: {
    drawBorders,
    drawBurgIcons,
    drawBurgLabels,
    drawEmblems,
    drawFeatures,
    drawHeightmap,
    drawMarkers,
    drawMilitary,
    drawReliefIcons,
    drawScalebar,
    drawStateLabels,
    drawTemperature
  },
  
  // UI Components
  UI: {
    Editors: {
      Burg: editBurg,
      States: editStates,
      Cultures: editCultures,
      Provinces: editProvinces,
      Religions: editReligions,
      Routes: editRoute,
      Rivers: editRiver,
      Markers: editMarker,
      Emblems: editEmblems,
      Biomes: editBiomes,
      Lakes: editLakes,
      Labels: editLabels,
      Notes: editNotes,
      Namesbase: editNamesbase,
      Heightmap: editHeightmap,
      Coastline: editCoastline,
      Ice: editIce,
      Relief: editRelief,
      Zones: editZones,
      Units: editUnits,
      Regiment: editRegiment,
      RouteGroup: editRouteGroups
    },
    Tools: {
      Submap: openSubmapTool,
      Transform: transformTool,
      World: editWorld,
      Style: editStyle
    },
    Overviews: {
      Burgs: overviewBurgs,
      Routes: overviewRoutes,
      Rivers: overviewRivers,
      Military: overviewMilitary,
      Regiments: overviewRegiments,
      Markers: overviewMarkers
    },
    General: {
      tip, showMainTip, clearMainTip, /* ... */
    }
  },
  
  // Configuration
  Config: {
    TypedArrays: { INT8_MAX, UINT8_MAX, UINT16_MAX, UINT32_MAX },
    Map: { MIN_LAND_HEIGHT: 20 },
    Debug: { PRODUCTION, DEBUG, INFO, TIME, WARN, ERROR, MOBILE }
  },
  
  // Core Functions
  Core: {
    generate,
    zoomTo,
    resetZoom,
    regenerateMap,
    /* ... other core functions */
  }
};
```

---

## Migration Priority

### Phase 1: Foundation (Week 1)
- Create `core/namespace.js`
- Create `core/state.js`
- Create `config/constants.js`
- Load these files first in `index.html`

### Phase 2: Modules (Week 2-3)
- Update all 22 module files
- Add backward compatibility
- Test each module

### Phase 3: Utilities (Week 4)
- Create `utils/index.js`
- Group utilities by category
- Update references

### Phase 4: Renderers (Week 5)
- Create `modules/renderers/index.js`
- Export all renderers
- Update renderer calls

### Phase 5: UI (Week 6-7)
- Create `modules/ui/index.js`
- Group UI components
- Update UI function calls

### Phase 6: Cleanup (Week 8)
- Remove old global exports
- Update all references
- Final testing

---

## Backward Compatibility Strategy

### During Migration
```javascript
// New namespace
window.FMG.Modules.Biomes = Biomes;

// Backward compatibility
window.Biomes = Biomes;
```

### After Migration
```javascript
// Remove backward compatibility
// Update all references to use FMG.*
```

---

## Benefits Summary

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Global identifiers | ~240 | 1 | 99.6% reduction |
| Namespace depth | 0 | 2-3 levels | Better organization |
| Discoverability | Low | High | Clear hierarchy |
| Conflict risk | High | Low | Single namespace |
| IDE support | Poor | Excellent | Better autocomplete |

---

## Risk Mitigation

1. **Incremental Migration**: One module at a time
2. **Backward Compatibility**: Keep old exports during transition
3. **Thorough Testing**: Test after each change
4. **Version Control**: Commit after each successful migration
5. **Rollback Plan**: Keep old code until migration complete

---

## Success Criteria

- [ ] All modules use `FMG.*` namespace
- [ ] All utilities organized under `FMG.Utils.*`
- [ ] All state in `FMG.State.*`
- [ ] All UI components under `FMG.UI.*`
- [ ] All renderers under `FMG.Renderers.*`
- [ ] No direct `window.*` assignments (except `window.FMG`)
- [ ] All tests passing
- [ ] Application fully functional
- [ ] Documentation updated

