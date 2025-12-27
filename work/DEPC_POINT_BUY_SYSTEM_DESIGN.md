# DEPC Point Buy System Design

## Overview

A point buy system for defining cultural DEPC (Dominance, Extroversion, Patience, Conformity) preference targets in the culture editor. This allows players to customize how their cultures shape personality development while preventing min-maxing.

---

## System Rules

### Core Mechanics

1. **Base Values:** All DEPC traits start at 50 (balanced/neutral)
2. **Point Budget:** 200 points total to distribute across 4 traits
3. **Cost Formula:** `cost = abs(target - 50)` per trait
   - Moving from 50 → 60 costs 10 points
   - Moving from 50 → 75 costs 25 points
   - Moving from 50 → 30 costs 20 points
   - Moving from 50 → 100 costs 50 points (maximum)
4. **Range:** Values can be set from 1-100 (within budget constraints)
5. **Total Cost:** Sum of all 4 trait deviations must not exceed 200 points

### Examples

**Balanced Culture (Default):**
```
Dominance: 50 (0 points)
Extroversion: 50 (0 points)
Patience: 50 (0 points)
Conformity: 50 (0 points)
─────────────────────────
Total: 0 points (200 remaining)
```

**Moderate Warrior Culture:**
```
Dominance: 70 (20 points) - Assertive, commanding
Extroversion: 45 (5 points) - Less social, focused
Patience: 40 (10 points) - Impatient, decisive
Conformity: 60 (10 points) - Disciplined, hierarchical
─────────────────────────
Total: 45 points (155 remaining)
```

**Extreme Warrior Culture (Maxed):**
```
Dominance: 100 (50 points) - Extremely aggressive
Extroversion: 30 (20 points) - Very anti-social
Patience: 20 (30 points) - Extremely impatient
Conformity: 80 (30 points) - Highly disciplined
─────────────────────────
Total: 130 points (70 remaining)
```

**Diplomatic/Trade Culture:**
```
Dominance: 40 (10 points) - Cooperative, non-aggressive
Extroversion: 75 (25 points) - Highly social, outgoing
Patience: 70 (20 points) - Very patient, methodical
Conformity: 70 (20 points) - Traditional, protocol-focused
─────────────────────────
Total: 75 points (125 remaining)
```

**Rebel/Nonconformist Culture:**
```
Dominance: 60 (10 points) - Moderately assertive
Extroversion: 55 (5 points) - Balanced social
Patience: 50 (0 points) - Balanced
Conformity: 20 (30 points) - Very low conformity, individualistic
─────────────────────────
Total: 45 points (155 remaining)
```

---

## UI Design

### Culture Editor Enhancement

**New Section:** "Conquest Mode: Cultural Personality (Optional)"

```html
<div class="separator">Conquest Mode: Cultural Personality (Optional)</div>
<div class="grid" style="grid-template-columns: 1fr 2fr 1fr">
  <label>DEPC Personality Targets</label>
  <div></div>
  <div style="text-align: right">
    <strong>Points: <span id="depcTotalPoints">0</span> / 200</strong>
  </div>
  
  <!-- Dominance Slider -->
  <label for="depcDominance">Dominance:</label>
  <div style="display: flex; align-items: center; gap: 1em">
    <input 
      type="range" 
      id="depcDominance" 
      min="1" 
      max="100" 
      value="50" 
      style="flex: 1"
    />
    <span id="depcDominanceValue" style="min-width: 3em; text-align: center">50</span>
  </div>
  <span id="depcDominancePoints" class="points-badge">0 pts</span>
  
  <!-- Extroversion Slider -->
  <label for="depcExtroversion">Extroversion:</label>
  <div style="display: flex; align-items: center; gap: 1em">
    <input 
      type="range" 
      id="depcExtroversion" 
      min="1" 
      max="100" 
      value="50" 
      style="flex: 1"
    />
    <span id="depcExtroversionValue" style="min-width: 3em; text-align: center">50</span>
  </div>
  <span id="depcExtroversionPoints" class="points-badge">0 pts</span>
  
  <!-- Patience Slider -->
  <label for="depcPatience">Patience:</label>
  <div style="display: flex; align-items: center; gap: 1em">
    <input 
      type="range" 
      id="depcPatience" 
      min="1" 
      max="100" 
      value="50" 
      style="flex: 1"
    />
    <span id="depcPatienceValue" style="min-width: 3em; text-align: center">50</span>
  </div>
  <span id="depcPatiencePoints" class="points-badge">0 pts</span>
  
  <!-- Conformity Slider -->
  <label for="depcConformity">Conformity:</label>
  <div style="display: flex; align-items: center; gap: 1em">
    <input 
      type="range" 
      id="depcConformity" 
      min="1" 
      max="100" 
      value="50" 
      style="flex: 1"
    />
    <span id="depcConformityValue" style="min-width: 3em; text-align: center">50</span>
  </div>
  <span id="depcConformityPoints" class="points-badge">0 pts</span>
  
  <!-- Budget Warning -->
  <div></div>
  <div id="depcBudgetWarning" class="warning" style="display:none; color: red">
    ⚠ Budget exceeded! Reduce values to save.
  </div>
  <div></div>
  
  <!-- Cultural Pressure -->
  <label for="depcPressure">Cultural Pressure:</label>
  <div style="display: flex; align-items: center; gap: 1em">
    <input 
      type="range" 
      id="depcPressure" 
      min="0" 
      max="100" 
      step="5" 
      value="30" 
      style="flex: 1"
    />
    <span id="depcPressureValue" style="min-width: 4em; text-align: center">0.30</span>
  </div>
  <span data-tip="How strongly culture shapes personality (0 = genetics dominate, 1.0 = culture overrides)">
    ℹ️
  </span>
  
  <!-- Preset Buttons -->
  <div></div>
  <div style="display: flex; gap: 0.5em; flex-wrap: wrap">
    <button id="depcReset" class="button">Reset to Defaults</button>
    <button id="depcPresetWarrior" class="button">Preset: Warrior</button>
    <button id="depcPresetDiplomatic" class="button">Preset: Diplomatic</button>
    <button id="depcPresetRebel" class="button">Preset: Rebel</button>
  </div>
  <div></div>
</div>
```

### Visual Feedback

**Point Badge Colors:**
- Green (0-25 points): Low cost
- Yellow (26-50 points): Moderate cost
- Orange (51-75 points): High cost
- Red (76+ points): Very high cost

**Budget Indicator:**
- Green: 0-150 points spent (plenty remaining)
- Yellow: 151-180 points spent (moderate remaining)
- Orange: 181-195 points spent (limited remaining)
- Red: 196-200 points spent (near limit)
- Red + Warning: >200 points (cannot save)

---

## JavaScript Implementation

### Core Functions

```javascript
// modules/ui/culture-editor.js (enhancement)

const DEPC_BUDGET = 200;
const DEPC_TRAITS = ['dominance', 'extroversion', 'patience', 'conformity'];

/**
 * Initialize DEPC editor section in culture editor
 */
function initializeDEPCEditor(culture) {
  // Load existing DEPC targets or use defaults
  const depcTargets = culture.conquest?.depcTargets || {
    dominance: 50,
    extroversion: 50,
    patience: 50,
    conformity: 50
  };
  
  const depcPressure = culture.conquest?.depcPressure || 0.3;
  
  // Set slider values
  DEPC_TRAITS.forEach(trait => {
    const slider = byId(`depc${capitalize(trait)}`);
    if (slider) {
      slider.value = depcTargets[trait];
      updateDEPCTraitDisplay(trait);
    }
  });
  
  // Set pressure slider
  byId("depcPressure").value = Math.round(depcPressure * 100);
  updateDEPCPressure();
  
  // Add event listeners
  DEPC_TRAITS.forEach(trait => {
    const slider = byId(`depc${capitalize(trait)}`);
    if (slider) {
      slider.addEventListener("input", () => updateDEPCTraitDisplay(trait));
      slider.addEventListener("input", () => updateDEPCDisplay());
    }
  });
  
  byId("depcPressure").addEventListener("input", updateDEPCPressure);
  
  // Preset buttons
  byId("depcReset").onclick = () => resetDEPCTargets();
  byId("depcPresetWarrior").onclick = () => applyDEPCPreset("warrior");
  byId("depcPresetDiplomatic").onclick = () => applyDEPCPreset("diplomatic");
  byId("depcPresetRebel").onclick = () => applyDEPCPreset("rebel");
  
  // Initial display update
  updateDEPCDisplay();
}

/**
 * Update display for a single trait
 */
function updateDEPCTraitDisplay(trait) {
  const slider = byId(`depc${capitalize(trait)}`);
  const value = +slider.value;
  
  // Update value display
  byId(`depc${capitalize(trait)}Value`).textContent = value;
  
  // Calculate and display points
  const points = Math.abs(value - 50);
  const pointsElement = byId(`depc${capitalize(trait)}Points`);
  pointsElement.textContent = `${points} pts`;
  
  // Update badge color based on point cost
  pointsElement.className = "points-badge";
  if (points <= 25) pointsElement.classList.add("points-low");
  else if (points <= 50) pointsElement.classList.add("points-moderate");
  else if (points <= 75) pointsElement.classList.add("points-high");
  else pointsElement.classList.add("points-very-high");
}

/**
 * Calculate total points spent across all traits
 */
function calculateDEPCPoints(targets) {
  return DEPC_TRAITS.reduce((total, trait) => {
    return total + Math.abs((targets[trait] || 50) - 50);
  }, 0);
}

/**
 * Update overall DEPC display and budget
 */
function updateDEPCDisplay() {
  const targets = {};
  DEPC_TRAITS.forEach(trait => {
    targets[trait] = +byId(`depc${capitalize(trait)}`).value;
  });
  
  const totalPoints = calculateDEPCPoints(targets);
  const pointsElement = byId("depcTotalPoints");
  pointsElement.textContent = totalPoints;
  
  // Update budget indicator color
  pointsElement.className = "";
  if (totalPoints <= 150) pointsElement.classList.add("budget-plenty");
  else if (totalPoints <= 180) pointsElement.classList.add("budget-moderate");
  else if (totalPoints <= 195) pointsElement.classList.add("budget-limited");
  else if (totalPoints <= 200) pointsElement.classList.add("budget-near-limit");
  else pointsElement.classList.add("budget-exceeded");
  
  // Show/hide warning
  const warning = byId("depcBudgetWarning");
  if (totalPoints > DEPC_BUDGET) {
    warning.style.display = "block";
  } else {
    warning.style.display = "none";
  }
}

/**
 * Update cultural pressure display
 */
function updateDEPCPressure() {
  const pressure = +byId("depcPressure").value / 100;
  byId("depcPressureValue").textContent = pressure.toFixed(2);
}

/**
 * Reset all DEPC targets to defaults (all 50s)
 */
function resetDEPCTargets() {
  DEPC_TRAITS.forEach(trait => {
    byId(`depc${capitalize(trait)}`).value = 50;
    updateDEPCTraitDisplay(trait);
  });
  updateDEPCDisplay();
}

/**
 * Apply a preset DEPC configuration
 */
function applyDEPCPreset(preset) {
  const presets = {
    warrior: {
      dominance: 70,
      extroversion: 45,
      patience: 40,
      conformity: 60
    },
    diplomatic: {
      dominance: 40,
      extroversion: 75,
      patience: 70,
      conformity: 70
    },
    rebel: {
      dominance: 60,
      extroversion: 55,
      patience: 50,
      conformity: 20
    },
    balanced: {
      dominance: 50,
      extroversion: 50,
      patience: 50,
      conformity: 50
    }
  };
  
  const presetValues = presets[preset] || presets.balanced;
  
  DEPC_TRAITS.forEach(trait => {
    byId(`depc${capitalize(trait)}`).value = presetValues[trait];
    updateDEPCTraitDisplay(trait);
  });
  updateDEPCDisplay();
}

/**
 * Save DEPC targets to culture data
 * Returns true if saved successfully, false if budget exceeded
 */
function saveDEPCTargets(culture) {
  const targets = {};
  DEPC_TRAITS.forEach(trait => {
    targets[trait] = +byId(`depc${capitalize(trait)}`).value;
  });
  
  const pointsSpent = calculateDEPCPoints(targets);
  
  // Validate budget
  if (pointsSpent > DEPC_BUDGET) {
    tip("DEPC budget exceeded! Please reduce values to save.", false, "error");
    return false;
  }
  
  const pressure = +byId("depcPressure").value / 100;
  
  // Save to culture data
  if (!culture.conquest) culture.conquest = {};
  culture.conquest.depcTargets = targets;
  culture.conquest.depcPointsSpent = pointsSpent;
  culture.conquest.depcPressure = pressure;
  
  tip(`DEPC targets saved (${pointsSpent}/${DEPC_BUDGET} points)`, true, "success");
  return true;
}

/**
 * Validate DEPC targets before saving culture
 */
function validateDEPCTargets(culture) {
  if (!culture.conquest || !culture.conquest.depcTargets) return true;
  
  const pointsSpent = calculateDEPCPoints(culture.conquest.depcTargets);
  return pointsSpent <= DEPC_BUDGET;
}
```

### Integration with Culture Editor

```javascript
// In culture editor save function
function saveCulture(cultureId) {
  const culture = pack.cultures[cultureId];
  
  // ... save other culture properties ...
  
  // Save DEPC targets (if editor was used)
  if (byId("depcDominance")) { // Check if DEPC editor exists
    if (!saveDEPCTargets(culture)) {
      // Budget exceeded, prevent save
      return false;
    }
  }
  
  // Validate before final save
  if (!validateDEPCTargets(culture)) {
    tip("Invalid DEPC targets. Please check values.", false, "error");
    return false;
  }
  
  // ... rest of save logic ...
  return true;
}
```

---

## Data Structure

### Culture Extension

```javascript
pack.cultures[i] = {
  // ... existing FMG culture properties ...
  
  // Optional Conquest Mode extensions
  conquest: {
    depcTargets: {
      dominance: 60,
      extroversion: 50,
      patience: 55,
      conformity: 65
    },
    depcPointsSpent: 15,  // For validation/display
    depcPressure: 0.5,    // 0.0-1.0 cultural pressure
    nameStyle: "latin"    // Optional: naming style (future)
  }
}
```

---

## Alternative Designs

### Option 1: Tiered Cost System

Instead of linear cost, use exponential/tiered pricing:

```javascript
function calculateTieredCost(value) {
  const deviation = Math.abs(value - 50);
  
  if (deviation <= 10) return deviation * 1;        // 1 point per unit (40-60 range)
  if (deviation <= 25) return 10 + (deviation - 10) * 2;  // 2 points per unit (25-39, 61-75)
  if (deviation <= 40) return 40 + (deviation - 25) * 3;  // 3 points per unit (10-24, 76-90)
  return 85 + (deviation - 40) * 4;                // 4 points per unit (1-9, 91-100)
}
```

**Pros:** Encourages moderate values, makes extremes very expensive
**Cons:** More complex, harder to understand

### Option 2: Range-Based System

Instead of exact values, define ranges:

```javascript
depcTargets: {
  dominance: { min: 55, max: 70 },  // Range instead of exact value
  // ...
}
```

**Pros:** More flexible, allows variance
**Cons:** More complex to implement and understand

### Option 3: Point Pool with Constraints

Separate point pools per trait category:

```javascript
// Physical/Behavioral traits: 100 points
// Social traits: 100 points
// Total: 200 points across two pools
```

**Pros:** Prevents all-in-one-trait strategies
**Cons:** More complex UI and rules

---

## Recommendation

**Use the simple linear point buy system (1 point = 1 deviation from 50):**

1. ✅ **Simple and intuitive** - Easy to understand
2. ✅ **Flexible** - Allows diverse cultural personalities
3. ✅ **Balanced** - 200 point budget prevents extremes without being too restrictive
4. ✅ **Transparent** - Clear cost calculation
5. ✅ **Easy to implement** - Straightforward UI and logic

Can add complexity later if needed, but simple is better for initial implementation.

---

## Testing Scenarios

1. **Default Culture:** All 50s = 0 points ✅
2. **Moderate Culture:** Total < 100 points ✅
3. **Extreme Culture:** Total = 200 points ✅
4. **Over Budget:** Total > 200 points ❌ (should prevent save)
5. **Preset Application:** All presets should be valid ✅
6. **Reset Function:** Should return to all 50s ✅
7. **Pressure Slider:** Should update display correctly ✅
8. **Save/Load:** Should persist DEPC data ✅

