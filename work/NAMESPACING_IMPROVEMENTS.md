# Namespacing Improvements - Quick Reference

## Current Issues Summary

### 1. Global Namespace Pollution
- **100+ global variables** attached to `window` object
- Modules use inconsistent patterns: `window.Biomes`, `window.BurgsAndStates`, etc.
- Utility functions are global (no namespace)
- Renderer functions are global
- UI functions are global

### 2. Inconsistent Patterns
- Mix of IIFE patterns: `(function() {})()` vs `(() => {})()`
- Some modules export objects, others export functions directly
- No clear hierarchy or organization

### 3. State Management
- 50+ global variables in `main.js`
- No clear ownership or encapsulation
- Difficult to track state changes

---

## Recommended Solution: Unified Namespace

### Structure
```javascript
window.FMG = {
  Core: {},        // Core application (main.js logic)
  Modules: {},     // Feature modules (Biomes, Rivers, Cultures, etc.)
  Utils: {},       // Utility functions (array, color, string, etc.)
  UI: {},          // UI components (editors, tools, overviews)
  Renderers: {},   // Rendering functions (draw-*)
  State: {},       // Application state (grid, pack, seed, etc.)
  Config: {}       // Configuration and constants
};
```

---

## Implementation Checklist

### Phase 1: Foundation (Low Risk)
- [ ] Create `core/namespace.js` with `window.FMG` structure
- [ ] Create `core/state.js` to hold application state
- [ ] Create `config/constants.js` for constants

### Phase 2: Modules (Medium Risk)
- [ ] Update `modules/biomes.js` to use `FMG.Modules.Biomes`
- [ ] Update `modules/burgs-and-states.js` to use `FMG.Modules.BurgsAndStates`
- [ ] Update all generator modules (rivers, cultures, religions, etc.)
- [ ] Keep old exports for backward compatibility

### Phase 3: Utilities (Low Risk)
- [ ] Create `utils/index.js` aggregator
- [ ] Group utilities: `FMG.Utils.Array`, `FMG.Utils.Color`, etc.
- [ ] Update utility file exports

### Phase 4: Renderers (Low Risk)
- [ ] Create `modules/renderers/index.js`
- [ ] Export all renderers through `FMG.Renderers`
- [ ] Update renderer function calls

### Phase 5: UI Components (Medium Risk)
- [ ] Create `modules/ui/index.js`
- [ ] Group UI: `FMG.UI.Editors`, `FMG.UI.Tools`, `FMG.UI.Overviews`
- [ ] Update UI function calls

### Phase 6: Cleanup (Low Risk)
- [ ] Remove old global exports
- [ ] Update all references throughout codebase
- [ ] Remove backward compatibility shims

---

## Quick Wins (Can Implement Immediately)

### 1. Create Namespace Foundation
```javascript
// core/namespace.js
"use strict";
window.FMG = window.FMG || {
  Core: {},
  Modules: {},
  Utils: {},
  UI: {},
  Renderers: {},
  State: {},
  Config: {}
};
```

### 2. Move Constants
```javascript
// config/constants.js
"use strict";
window.FMG.Config = {
  TypedArrays: {
    INT8_MAX: 127,
    UINT8_MAX: 255,
    UINT16_MAX: 65535,
    UINT32_MAX: 4294967295
  },
  Map: {
    MIN_LAND_HEIGHT: 20
  }
};
```

### 3. Create State Object
```javascript
// core/state.js
"use strict";
window.FMG.State = {
  grid: {},
  pack: {},
  seed: null,
  mapId: null,
  mapHistory: [],
  // ... other state
};
```

---

## Migration Example

### Before:
```javascript
// modules/biomes.js
window.Biomes = (function() {
  return { getDefault, define };
})();

// Usage
Biomes.define();
```

### After (with backward compatibility):
```javascript
// modules/biomes.js
const Biomes = (function() {
  return { getDefault, define };
})();

// New namespace
window.FMG = window.FMG || {};
window.FMG.Modules = window.FMG.Modules || {};
window.FMG.Modules.Biomes = Biomes;

// Backward compatibility
window.Biomes = Biomes;

// Usage (new)
FMG.Modules.Biomes.define();

// Usage (old - still works)
Biomes.define();
```

---

## File Naming Standardization

### Current (Inconsistent):
- `arrayUtils.js` (camelCase)
- `burgs-and-states.js` (kebab-case)
- `draw-borders.js` (kebab-case)

### Recommended (Consistent):
- `array-utils.js` (kebab-case)
- `burgs-and-states.js` (kebab-case) ✓
- `draw-borders.js` (kebab-case) ✓

**Action**: Rename all `*Utils.js` files to `*-utils.js`

---

## Benefits

1. **Single Global**: Only `FMG` on window instead of 100+ globals
2. **Clear Hierarchy**: Easy to find where functions belong
3. **Better IDE Support**: Autocomplete and navigation
4. **Easier Testing**: Modules can be tested in isolation
5. **Future-Proof**: Easier migration to ES6 modules
6. **Documentation**: Namespace structure documents the codebase

---

## Risk Assessment

| Change | Risk | Impact | Priority |
|--------|------|--------|----------|
| Create namespace | Low | High | P1 |
| Move constants | Low | Medium | P1 |
| Create state object | Medium | High | P2 |
| Update modules | Medium | High | P2 |
| Update utilities | Low | Medium | P2 |
| Update renderers | Low | Medium | P3 |
| Update UI | Medium | Medium | P3 |
| Remove old globals | Low | Low | P4 |

---

## Next Steps

1. Review this document with the team
2. Start with Phase 1 (Foundation) - lowest risk
3. Test thoroughly after each phase
4. Update one module at a time
5. Keep backward compatibility during transition

